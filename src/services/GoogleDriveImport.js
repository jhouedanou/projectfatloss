/**
 * Import des séances vélo exportées par Health Sync dans Google Drive.
 *
 * Health Sync écrit chaque activité dans un dossier « Health Sync Activités »
 * (ou « Health Sync Activities ») sous forme de CSV d'une ligne, nommé
 * « TYPE aaaa.mm.jj hh.mm Source.csv », par exemple :
 *   CYCLING 2026.10.03 11.06 Strava.csv
 *   CRICKET 2026.10.03 11.06 Google Fit.csv   (même séance, vue par Google Fit)
 * Colonnes : source, type, nom, date (aaaa.mm.jj hh:mm:ss), heure, temps écoulé
 * (s), temps actif (s), distance (km), calories (kcal), …
 *
 * Sont importés comme vélo : les types vélo (CYCLING, BIKING, SPINNING…) et
 * CRICKET, sous lequel les séances Holofit / Strava arrivent dans Google Fit.
 * Une même séance vue par deux sources (Strava et Google Fit) n'est importée
 * qu'une fois.
 *
 * Deux modes d'accès :
 *   - dossier public (« Tous les utilisateurs disposant du lien ») + clé API
 *     Google : synchronisation sans connexion (lien et clé réglés dans
 *     l'onglet Cardio, ou clé fournie au build par VITE_GOOGLE_API_KEY) ;
 *   - sinon, connexion Google (OAuth, drive.readonly) et recherche des
 *     dossiers « Health Sync Activités ».
 * Dans les deux cas, l'API Google Drive doit être activée sur le projet Google
 * Cloud de la clé / du client OAuth.
 */

import GoogleFitService, { GOOGLE_CLIENT_ID } from './GoogleFitService';
import { getCardioSessions, importCardioSessions } from './CardioStorage';
import { getUserWeight } from './CalorieEstimator';
import { isChecklistSession, markCardioSynced, replaceChecklistSessions } from './GoogleFitSync';

const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.readonly';
const DRIVE_API = 'https://www.googleapis.com/drive/v3';
const IMPORTED_KEY = 'pfl_drive_imported';
const SETTINGS_KEY = 'pfl_drive_sync';
// MET du vélo pour estimer les calories absentes (comme CalorieEstimator).
const BIKE_MET = 7.0;
// Deux fichiers dont les débuts sont à moins de 2 min décrivent la même séance.
const SAME_SESSION_MS = 2 * 60 * 1000;

const HEALTH_SYNC_CSV = /^([A-Z_]+) (\d{4}\.\d{2}\.\d{2} \d{2}\.\d{2}) (.+)\.csv$/;

/** Type d'activité Health Sync compté comme vélo. */
export function isBikeActivityType(type) {
  return /BIK|CYCL|SPIN/i.test(type || '') || type === 'CRICKET';
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
  const lines = String(text || '').replace(/^\uFEFF/, '').trim().split(/\r?\n/);
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
  };
}

// ── Réglages de la synchronisation publique ─────────────────────────

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

/** { folderUrl, apiKey, lastSyncAt } — la clé du build sert par défaut. */
export function getDriveSyncSettings() {
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}'); } catch { /* vide */ }
  return {
    folderUrl: saved.folderUrl || '',
    apiKey: saved.apiKey || import.meta.env.VITE_GOOGLE_API_KEY || '',
    lastSyncAt: saved.lastSyncAt || null,
  };
}

export function setDriveSyncSettings(patch) {
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}'); } catch { /* vide */ }
  const next = { ...saved, ...patch };
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(next)); } catch { /* quota */ }
  return getDriveSyncSettings();
}

/** Synchronisation sans connexion possible (dossier public + clé API) ? */
export function isPublicSyncConfigured() {
  const { folderUrl, apiKey } = getDriveSyncSettings();
  return parseFolderIds(folderUrl).length > 0 && !!apiKey;
}

// ── Accès Google Drive (clé API pour un dossier public, sinon OAuth) ─

let tokenClient = null;
let accessToken = null;
let tokenExpiresAt = 0;

async function getDriveToken() {
  if (accessToken && Date.now() < tokenExpiresAt) return accessToken;
  // Charge Google Identity Services (partagé avec Google Fit).
  await GoogleFitService.init();
  return new Promise((resolve, reject) => {
    if (!tokenClient) {
      tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: DRIVE_SCOPE,
        callback: () => {}
      });
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

/**
 * Appel à l'API Drive. Avec `apiKey` (dossier public) : clé en paramètre,
 * sans connexion ; sinon jeton OAuth.
 */
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
      message = 'API Google Drive non activée sur le projet Google Cloud de la clé : activez-la dans la console Google Cloud.';
    } else if (/API key not valid|API_KEY_INVALID/i.test(message)) {
      message = 'Clé API Google invalide.';
    } else if (apiKey && response.status === 404) {
      message = 'Dossier ou fichier introuvable : vérifiez le lien et que le dossier est partagé avec « Tous les utilisateurs disposant du lien ».';
    }
    throw new Error(`Google Drive (${response.status}) : ${message}`);
  }
  return text ? response.text() : response.json();
}

/** Liste tous les fichiers d'une requête Drive (pagination incluse). */
async function listFiles(q, apiKey = null) {
  const files = [];
  let pageToken;
  do {
    const data = await driveFetch('files', {
      q,
      fields: 'nextPageToken,files(id,name)',
      pageSize: '1000',
      ...(pageToken ? { pageToken } : {})
    }, { apiKey });
    files.push(...(data.files || []));
    pageToken = data.nextPageToken;
  } while (pageToken);
  return files;
}

// ── Import ───────────────────────────────────────────────────────────

/**
 * Récupère les séances vélo des dossiers d'activités Health Sync et les ajoute
 * aux séances cardio (sans doublon, et sans les renvoyer vers Google Fit).
 * Dossier public + clé API réglés → sans connexion ; sinon connexion Google.
 * @returns {Promise<{ folders: number, found: number, imported: number, skipped: number, minutes: number }>}
 */
export async function importBikeSessionsFromDrive() {
  const settings = getDriveSyncSettings();
  const publicIds = parseFolderIds(settings.folderUrl);
  const apiKey = publicIds.length && settings.apiKey ? settings.apiKey : null;

  const folders = apiKey
    ? publicIds.map((id) => ({ id }))
    : (await listFiles(
      "mimeType='application/vnd.google-apps.folder' and name contains 'Health Sync' and trashed=false"
    )).filter((f) => /activit/i.test(f.name));
  if (!folders.length) {
    throw new Error('Dossier « Health Sync Activités » introuvable dans Google Drive.');
  }

  // CSV d'activités vélo, repérés à leur nom avant tout téléchargement.
  const csvFiles = [];
  for (const folder of folders) {
    const files = await listFiles(`'${folder.id}' in parents and trashed=false`, apiKey);
    files.forEach((f) => {
      const m = HEALTH_SYNC_CSV.exec(f.name);
      if (m && isBikeActivityType(m[1])) csvFiles.push(f);
    });
  }

  let imported = {};
  try { imported = JSON.parse(localStorage.getItem(IMPORTED_KEY) || '{}'); } catch { /* vide */ }
  const fresh = csvFiles.filter((f) => !imported[f.id]);

  const activities = [];
  for (const file of fresh) {
    const activity = parseHealthSyncCsv(await driveFetch(`files/${file.id}`, { alt: 'media' }, { text: true, apiKey }));
    if (activity) activities.push({ ...activity, fileId: file.id });
    else imported[file.id] = 'ignored';
  }

  // Une séance = des fichiers qui démarrent à moins de 2 min d'écart
  // (Strava et Google Fit décrivent la même sortie) ; on garde la plus longue.
  activities.sort((a, b) => a.start - b.start);
  const groups = [];
  activities.forEach((a) => {
    const group = groups.find((g) => Math.abs(g[0].start - a.start) <= SAME_SESSION_MS);
    if (group) group.push(a);
    else groups.push([a]);
  });

  const localBikeEnds = getCardioSessions()
    .filter((s) => s.type === 'bike' && !isChecklistSession(s))
    .map((s) => new Date(s.date).getTime());

  const records = [];
  const recordFiles = [];
  groups.forEach((group) => {
    const best = group.reduce((a, b) => (b.seconds > a.seconds ? b : a));
    const endMs = best.start.getTime() + best.seconds * 1000;
    const fileIds = group.map((a) => a.fileId);
    // Déjà présente (import Google Fit, saisie manuelle…) : rien à ajouter.
    if (localBikeEnds.some((t) => Math.abs(t - endMs) <= 5 * 60 * 1000)) {
      fileIds.forEach((id) => { imported[id] = 'duplicate'; });
      return;
    }
    const minutes = Math.max(1, Math.round(best.seconds / 60));
    const strava = group.find((a) => /strava/i.test(a.source));
    records.push({
      type: 'bike',
      date: new Date(endMs).toISOString(),
      duration: minutes,
      distance: best.distanceKm > 0 ? Math.round(best.distanceKm * 10) / 10 : null,
      calories: Math.round(best.calories > 0
        ? best.calories
        : ((BIKE_MET * 3.5 * getUserWeight()) / 200) * minutes),
      notes: JSON.stringify({
        source: 'drive',
        origin: strava ? 'strava' : 'google_fit',
        name: best.name,
        healthSyncType: best.type
      }),
    });
    recordFiles.push(fileIds);
  });

  const created = importCardioSessions(records);
  created.forEach((record, i) => {
    recordFiles[i].forEach((id) => { imported[id] = record.id; });
    markCardioSynced(record.id);
  });
  replaceChecklistSessions(created);
  try { localStorage.setItem(IMPORTED_KEY, JSON.stringify(imported)); } catch { /* quota */ }
  setDriveSyncSettings({ lastSyncAt: new Date().toISOString() });

  return {
    folders: folders.length,
    found: csvFiles.length,
    imported: created.length,
    skipped: groups.length - created.length,
    minutes: created.reduce((sum, r) => sum + (r.duration || 0), 0),
  };
}
