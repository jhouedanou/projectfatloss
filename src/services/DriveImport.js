/**
 * Import des séances exportées par l'application Health Sync dans Google Drive.
 *
 * Health Sync écrit chaque activité dans un dossier « Health Sync Activités »
 * (ou « Health Sync Activities »), un CSV d'une ligne par séance, nommé
 * « TYPE aaaa.mm.jj hh.mm Source.csv », par exemple :
 *   CYCLING 2026.10.03 11.06 Strava.csv
 *   CRICKET 2026.10.03 11.06 Google Fit.csv   (même séance, vue par Google Fit)
 * Colonnes : source, type, nom, date (aaaa.mm.jj hh:mm:ss), heure, temps écoulé
 * (s), temps actif (s), distance (km), calories (kcal), pas, fréquence
 * cardiaque moyenne, fréquence cardiaque maximale, vitesse moyenne, …
 *
 * Le même dossier contient aussi, pour chaque séance, un fichier .fit et
 * souvent un .tcx (« aaaa.mm.jj hh.mm-TYPE.fit »). Ils décrivent les mêmes
 * séances, avec le détail point par point : le CSV suffit pour le tableau de
 * bord, ils ne sont donc pas téléchargés.
 *
 * Toutes les séances sont importées, quel que soit leur type. Une même séance
 * vue par deux sources (débuts à moins de 2 min) n'est gardée qu'une fois.
 * Les autres fichiers du dossier (pas, poids, sommeil…) ne sont pas lus : leur
 * format n'est pas connu ici.
 *
 * Deux accès :
 *   - dossier partagé (« Tous les utilisateurs disposant du lien ») + clé API
 *     Google : sans connexion (clé fournie au build par VITE_GOOGLE_API_KEY,
 *     lien par VITE_HEALTH_SYNC_FOLDER, ou saisis dans les sources de données).
 *     Le dossier est alors lu à l'ouverture du site ;
 *   - sinon connexion Google (drive.readonly) et recherche des dossiers
 *     « Health Sync … activités ».
 * L'API Google Drive doit être activée sur le projet Google Cloud.
 */

import GoogleFitService, { GOOGLE_CLIENT_ID } from './GoogleFitService';
import { mergeFitSessions, setFitMeta } from './FitStore';

const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.readonly';
const DRIVE_API = 'https://www.googleapis.com/drive/v3';
const IMPORTED_KEY = 'pfl_drive_imported';
const SETTINGS_KEY = 'pfl_drive_sync';
// Deux fichiers dont les débuts sont à moins de 2 min décrivent la même séance.
const SAME_SESSION_MS = 2 * 60 * 1000;

const HEALTH_SYNC_CSV = /^([A-Z_]+) (\d{4}\.\d{2}\.\d{2} \d{2}\.\d{2}) (.+)\.csv$/;

/** Famille et libellé d'un type d'activité Health Sync (« CYCLING », « WALKING »…). */
export function classifyHealthSyncType(type) {
  const t = String(type || '').toUpperCase();
  // CRICKET : type sous lequel les séances Holofit / Strava arrivent dans Google Fit.
  if (/BIK|CYCL|SPIN/.test(t) || t === 'CRICKET') return { kind: 'bike', label: 'Vélo' };
  if (/STRENGTH|WEIGHT|CIRCUIT|HIIT|INTERVAL|CALISTHEN|CROSSFIT|TRAINING/.test(t)) return { kind: 'strength', label: 'Musculation' };
  if (/RUN|JOG/.test(t)) return { kind: 'walk', label: 'Course' };
  if (/WALK|HIK/.test(t)) return { kind: 'walk', label: 'Marche' };
  return { kind: 'other', label: 'Autre sport' };
}

/** « google_fit » → « Google Fit », « strava » → « Strava ». */
function sourceName(source) {
  const text = String(source || '').replace(/_/g, ' ').trim();
  if (!text) return 'Health Sync';
  return text.replace(/(^|\s)\S/g, (c) => c.toUpperCase());
}

// ── Lecture du CSV Health Sync ───────────────────────────────────────

/** Découpe une ligne CSV (gère les champs entre guillemets). */
function splitCsvLine(line) {
  const out = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const c = line[i];
    if (quoted) {
      if (c === '"' && line[i + 1] === '"') { field += '"'; i += 1; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { out.push(field); field = ''; }
    else field += c;
  }
  out.push(field);
  return out;
}

/**
 * Lit un CSV d'activité Health Sync.
 * @returns {{ source, type, name, start: Date, seconds, distanceKm, calories }|null}
 */
export function parseHealthSyncCsv(text) {
  const lines = String(text || '').replace(/^﻿/, '').trim().split(/\r?\n/);
  if (lines.length < 2) return null;
  const cols = splitCsvLine(lines[1]);
  const m = /^(\d{4})\.(\d{2})\.(\d{2}) (\d{2}):(\d{2}):(\d{2})$/.exec((cols[3] || '').trim());
  if (!m) return null;
  const start = new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]);
  const elapsed = Number(cols[5]) || 0;
  const active = Number(cols[6]) || 0;
  const seconds = active > 0 ? active : elapsed;
  if (!(seconds > 0)) return null;
  return {
    source: (cols[0] || '').trim(),
    type: (cols[1] || '').trim(),
    name: cols[2] && cols[2] !== 'null' ? cols[2].trim() : '',
    start,
    seconds,
    distanceKm: Number(cols[7]) || 0,
    calories: Number(cols[8]) || 0,
    heartAvg: Number(cols[10]) || 0,
    heartMax: Number(cols[11]) || 0,
  };
}

/**
 * Réunit les fichiers qui décrivent la même séance (débuts à moins de 2 min)
 * et en fait des séances du tableau de bord ; la plus longue lecture est gardée.
 * @param {Array} activities - résultats de parseHealthSyncCsv
 */
export function activitiesToSessions(activities) {
  const sorted = [...activities].sort((a, b) => a.start - b.start);
  const groups = [];
  sorted.forEach((a) => {
    const group = groups.find((g) => Math.abs(g[0].start - a.start) <= SAME_SESSION_MS);
    if (group) group.push(a);
    else groups.push([a]);
  });
  return groups.map((group) => {
    const best = group.reduce((a, b) => (b.seconds > a.seconds ? b : a));
    // Le type le plus parlant : une source autre que Google Fit (Strava…) si elle existe.
    const named = group.find((a) => a.type !== 'CRICKET' && !/google.?fit/i.test(a.source)) || best;
    // Chaque source ne remplit pas tout (Strava sans calories, par exemple) :
    // la plus grande valeur du groupe est gardée.
    const most = (read) => Math.max(...group.map(read));
    const { kind, label } = classifyHealthSyncType(group.some((a) => classifyHealthSyncType(a.type).kind === 'bike') ? 'CYCLING' : named.type);
    const startMs = best.start.getTime();
    return {
      id: `hs-${Math.round(startMs / 60000)}`,
      kind,
      label,
      title: named.name || best.name || label,
      app: sourceName(named.source),
      startMs,
      endMs: startMs + best.seconds * 1000,
      minutes: Math.max(1, Math.round(best.seconds / 60)),
      kcal: most((a) => a.calories) > 0 ? Math.round(most((a) => a.calories)) : null,
      km: most((a) => a.distanceKm) >= 0.05 ? Math.round(most((a) => a.distanceKm) * 10) / 10 : null,
      heartAvg: most((a) => a.heartAvg) > 0 ? Math.round(most((a) => a.heartAvg)) : null,
      heartMax: most((a) => a.heartMax) > 0 ? Math.round(most((a) => a.heartMax)) : null,
      source: 'health_sync',
    };
  });
}

// ── Réglages ─────────────────────────────────────────────────────────

/** Identifiants de dossiers extraits d'un ou plusieurs liens Drive (ou ids). */
export function parseFolderIds(text) {
  return String(text || '')
    .split(/[\s,;]+/)
    .map((part) => {
      const m = /folders\/([\w-]{10,})/.exec(part) || /[?&]id=([\w-]{10,})/.exec(part);
      if (m) return m[1];
      return /^[\w-]{10,}$/.test(part) ? part : null;
    })
    .filter(Boolean);
}

/** { folderUrl, apiKey, lastSyncAt, hasBuildKey } — la clé du build sert par défaut. */
export function getDriveSettings() {
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}'); } catch { /* vide */ }
  const buildKey = import.meta.env.VITE_GOOGLE_API_KEY || '';
  return {
    // Lien réglé sur cet appareil, sinon celui fourni au build (VITE_HEALTH_SYNC_FOLDER).
    folderUrl: saved.folderUrl || import.meta.env.VITE_HEALTH_SYNC_FOLDER || '',
    apiKey: saved.apiKey || buildKey,
    savedApiKey: saved.apiKey || '',
    hasBuildKey: !!buildKey,
    lastSyncAt: saved.lastSyncAt || null,
  };
}

export function setDriveSettings(patch) {
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}'); } catch { /* vide */ }
  const next = { ...saved, ...patch };
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(next)); } catch { /* quota */ }
  // Lien et clé enregistrés aussi dans le compte : ils suivent sur chaque appareil.
  if ('folderUrl' in patch || 'apiKey' in patch) {
    import('./SyncService').then(({ pushDriveSettings }) => pushDriveSettings(next)).catch(() => {});
  }
  return getDriveSettings();
}

// ── Accès Google Drive (clé API pour un dossier partagé, sinon OAuth) ─

let tokenClient = null;
let accessToken = null;
let tokenExpiresAt = 0;

async function getDriveToken() {
  if (accessToken && Date.now() < tokenExpiresAt) return accessToken;
  await GoogleFitService.init(); // charge Google Identity Services
  return new Promise((resolve, reject) => {
    if (!tokenClient) {
      tokenClient = window.google.accounts.oauth2.initTokenClient({ client_id: GOOGLE_CLIENT_ID, scope: DRIVE_SCOPE, callback: () => {} });
    }
    tokenClient.callback = (response) => {
      if (response.error) {
        reject(new Error(`Autorisation Google Drive refusée (${response.error}).`));
        return;
      }
      accessToken = response.access_token;
      tokenExpiresAt = Date.now() + Math.max(0, (response.expires_in || 3600) - 60) * 1000;
      resolve(accessToken);
    };
    try {
      tokenClient.requestAccessToken({ prompt: accessToken ? '' : 'consent' });
    } catch (error) {
      reject(error);
    }
  });
}

async function driveFetch(path, params = {}, { text = false, apiKey = null } = {}) {
  const headers = {};
  const query = new URLSearchParams(params);
  if (apiKey) query.set('key', apiKey);
  else headers.Authorization = `Bearer ${await getDriveToken()}`;
  const response = await fetch(`${DRIVE_API}/${path}?${query.toString()}`, { headers });
  if (!response.ok) {
    const body = await response.text();
    let message = `Erreur HTTP ${response.status}`;
    try { message = JSON.parse(body)?.error?.message || message; } catch { /* corps non JSON */ }
    if (response.status === 403 && /has not been used|is disabled/i.test(message)) {
      message = "l'API Google Drive n'est pas activée sur le projet Google Cloud de la clé. Activez-la dans la console Google Cloud.";
    } else if (/API key not valid|API_KEY_INVALID/i.test(message)) {
      message = 'la clé API Google est invalide.';
    } else if (apiKey && response.status === 404) {
      message = 'dossier introuvable. Vérifiez le lien, et que le dossier est partagé avec « Tous les utilisateurs disposant du lien ».';
    }
    throw new Error(`Google Drive (${response.status}) : ${message}`);
  }
  return text ? response.text() : response.json();
}

async function listFiles(q, apiKey = null) {
  const files = [];
  let pageToken;
  do {
    const data = await driveFetch('files', {
      q,
      fields: 'nextPageToken,files(id,name)',
      pageSize: '1000',
      ...(pageToken ? { pageToken } : {}),
    }, { apiKey });
    files.push(...(data.files || []));
    pageToken = data.nextPageToken;
  } while (pageToken);
  return files;
}

/** Lecture possible sans rien demander : lien de dossier et clé API connus. */
export function canReadDriveSilently() {
  const { folderUrl, apiKey } = getDriveSettings();
  return parseFolderIds(folderUrl).length > 0 && !!apiKey;
}

// ── Import ───────────────────────────────────────────────────────────

/**
 * Lit les séances des dossiers d'activités Health Sync et les ajoute au
 * tableau de bord. Un fichier déjà lu n'est pas téléchargé de nouveau.
 * @returns {Promise<{ folders:number, files:number, read:number, sessions:number, other:number }>}
 *   other : fichiers du dossier qui ne sont pas des séances (non lus)
 */
export async function importFromDrive() {
  const settings = getDriveSettings();
  const publicIds = parseFolderIds(settings.folderUrl);
  const apiKey = publicIds.length && settings.apiKey ? settings.apiKey : null;

  const folders = publicIds.length
    ? publicIds.map((id) => ({ id }))
    : (await listFiles(
      "mimeType='application/vnd.google-apps.folder' and name contains 'Health Sync' and trashed=false"
    )).filter((f) => /activit/i.test(f.name));
  if (!folders.length) {
    throw new Error('Dossier « Health Sync Activités » introuvable dans Google Drive.');
  }

  const csvFiles = [];
  let other = 0;
  for (const folder of folders) {
    const files = await listFiles(`'${folder.id}' in parents and trashed=false`, apiKey);
    files.forEach((f) => {
      if (HEALTH_SYNC_CSV.test(f.name)) csvFiles.push(f);
      else other += 1;
    });
  }

  let imported = {};
  try { imported = JSON.parse(localStorage.getItem(IMPORTED_KEY) || '{}'); } catch { /* vide */ }
  const fresh = csvFiles.filter((f) => !imported[f.id]);

  const activities = [];
  for (const file of fresh) {
    const activity = parseHealthSyncCsv(await driveFetch(`files/${file.id}`, { alt: 'media' }, { text: true, apiKey }));
    imported[file.id] = activity ? 'read' : 'ignored';
    if (activity) activities.push(activity);
  }

  const sessions = activitiesToSessions(activities);
  mergeFitSessions(sessions);
  try { localStorage.setItem(IMPORTED_KEY, JSON.stringify(imported)); } catch { /* quota */ }
  setDriveSettings({ lastSyncAt: new Date().toISOString() });
  setFitMeta({ lastSyncAt: Date.now(), source: 'Health Sync' });
  import('./SyncService').then(({ syncData }) => syncData()).catch(() => {});

  return { folders: folders.length, files: csvFiles.length, read: fresh.length, sessions: sessions.length, other };
}
