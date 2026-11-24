/**
 * Import des données d'activité : Health Connect dans l'APK Android, Google
 * Fit sur le site (son API ferme fin 2026 : le site reçoit alors les données
 * par le compte, depuis le téléphone).
 *
 * Ce qui est lu :
 *   - totaux par jour : pas, calories actives, calories totales, distance ;
 *   - séances d'exercice de toutes les applications (Strava, Holofit, montre…),
 *     avec leurs calories et leur distance ;
 *   - pesées (Health Connect seulement).
 * Les séances et pesées écrites autrefois par Project Fat Loss sont ignorées :
 * elles sont déjà dans l'historique local.
 */

import GoogleFitService from './GoogleFitService';
import HealthConnect, { ensureHealthAccess, isHealthConnectApp } from './HealthConnect';
import { DAY_MS, dayKey } from './FitMetrics';
import {
  getFitMeta,
  getStoredFitSessions,
  mergeFitDays,
  mergeFitSessions,
  setFitMeta,
} from './FitStore';
import { getWeightHistory, importWeightRecords } from './WeightStorage';

const OWN_PACKAGE = 'com.houedanou.fatloss';

// Première synchro : un an de totaux par jour, quatre mois de séances.
// Ensuite : les cinq dernières semaines et les séances depuis la dernière synchro.
const FIRST_DAYS = 365;
const NEXT_DAYS = 35;
const FIRST_SESSION_DAYS = 120;
const SESSION_OVERLAP_DAYS = 3;

// ── Familles de séances ──────────────────────────────────────────────

// Health Connect (ExerciseSessionRecord.EXERCISE_TYPE_*).
const HC_TYPES = {
  8: ['bike', 'Vélo'],
  9: ['bike', "Vélo d'appartement"],
  10: ['strength', 'Boot camp'],
  13: ['strength', 'Gymnastique'],
  36: ['strength', 'Circuit intense'],
  70: ['strength', 'Musculation'],
  81: ['strength', 'Haltérophilie'],
  37: ['walk', 'Randonnée'],
  56: ['walk', 'Course'],
  57: ['walk', 'Course sur tapis'],
  79: ['walk', 'Marche'],
  25: ['other', 'Elliptique'],
  53: ['other', 'Aviron'],
  54: ['other', 'Rameur'],
  68: ['other', 'Escaliers'],
  69: ['other', "Machine d'escaliers"],
  73: ['other', 'Natation'],
  74: ['other', 'Natation'],
  83: ['other', 'Yoga'],
};

// Google Fit (table officielle des types d'activité).
const GF_TYPES = {
  1: ['bike', 'Vélo'], 14: ['bike', 'Vélo'], 15: ['bike', 'VTT'], 16: ['bike', 'Vélo de route'],
  17: ['bike', 'Spinning'], 18: ['bike', "Vélo d'appartement"], 19: ['bike', 'Vélo'],
  // Les séances de vélo virtuel Holofit / Strava arrivent sous le type 23.
  23: ['bike', 'Vélo virtuel'],
  21: ['strength', 'Gymnastique'], 22: ['strength', 'Circuit'], 80: ['strength', 'Musculation'],
  97: ['strength', 'Haltérophilie'], 114: ['strength', 'Circuit intense'], 115: ['strength', 'Circuit intense'],
  7: ['walk', 'Marche'], 93: ['walk', 'Marche'], 94: ['walk', 'Marche nordique'], 95: ['walk', 'Marche sur tapis'],
  8: ['walk', 'Course'], 56: ['walk', 'Footing'], 57: ['walk', 'Course'], 58: ['walk', 'Course sur tapis'],
  35: ['walk', 'Randonnée'],
};
// Ni une séance ni du sport : en voiture, immobile, sommeil, inconnu.
const GF_IGNORED = new Set([0, 3, 4, 5, 72, 109, 110, 111, 112]);

const BIKE_WORDS = /holofit|ride|v[ée]lo|bike|cycl|spin/i;

function classify(table, type, title) {
  const known = table[Number(type)];
  if (known) return { kind: known[0], label: known[1] };
  if (BIKE_WORDS.test(title || '')) return { kind: 'bike', label: 'Vélo' };
  return { kind: 'other', label: 'Autre sport' };
}

const APP_NAMES = [
  [/strava/i, 'Strava'],
  [/holo/i, 'Holofit'],
  [/samsung|shealth/i, 'Samsung Health'],
  [/fitbit/i, 'Fitbit'],
  [/garmin/i, 'Garmin'],
  [/google\.android\.apps\.fitness/i, 'Google Fit'],
  [/healthdata/i, 'Health Connect'],
  [/houedanou/i, 'Project Fat Loss'],
];

function appName(packageName, fallback = '') {
  const hit = APP_NAMES.find(([pattern]) => pattern.test(packageName || ''));
  return hit ? hit[1] : (fallback || packageName || '');
}

const round1 = (value) => Math.round(value * 10) / 10;

// ── Health Connect (APK) ─────────────────────────────────────────────

const HC_READ = [
  'READ_STEPS',
  'READ_EXERCISE',
  'READ_ACTIVE_CALORIES_BURNED',
  'READ_TOTAL_CALORIES_BURNED',
  'READ_DISTANCE',
  'READ_WEIGHT',
];

async function importFromHealthConnect({ prompt, days, sessionsFromMs }) {
  if (!await ensureHealthAccess(HC_READ, { prompt })) return null;
  const now = Date.now();

  const { days: rows = [] } = await HealthConnect.readDailyTotals({ days: Math.min(days, 400) });
  const byDay = {};
  rows.forEach((row) => {
    byDay[row.date] = {
      steps: row.steps,
      activeKcal: row.activeKcal,
      totalKcal: row.totalKcal,
      distanceM: row.distanceM,
    };
  });
  mergeFitDays(byDay);

  const { sessions: raw = [] } = await HealthConnect.readExerciseSessions({ startMs: sessionsFromMs, endMs: now });
  const sessions = raw
    .filter((s) => s.packageName !== OWN_PACKAGE && !String(s.clientRecordId || '').startsWith('pfl-'))
    .map((s) => {
      const startMs = Number(s.startMs);
      const endMs = Number(s.endMs);
      const { kind, label } = classify(HC_TYPES, s.exerciseType, `${s.title || ''} ${s.packageName || ''}`);
      return {
        id: `hc-${s.id}`,
        kind,
        label,
        title: s.title || label,
        app: appName(s.packageName),
        startMs,
        endMs,
        minutes: Math.max(1, Math.round((endMs - startMs) / 60000)),
        kcal: s.calories > 0 ? Math.round(s.calories) : null,
        km: s.distanceMeters > 0 ? round1(s.distanceMeters / 1000) : null,
        source: 'health_connect',
      };
    });
  mergeFitSessions(sessions);

  const weights = await importHealthWeights(now - days * DAY_MS, now);
  return { days: rows.length, sessions: sessions.length, weights, source: 'Health Connect' };
}

/** Ajoute les pesées de Health Connect absentes de l'historique (même jour, à 0,1 kg près). */
async function importHealthWeights(startMs, endMs) {
  const { weights = [] } = await HealthConnect.readWeights({ startMs, endMs });
  const outside = weights.filter((w) => w.packageName !== OWN_PACKAGE && !String(w.clientRecordId || '').startsWith('pfl-'));
  const known = getWeightHistory().map((r) => ({ day: dayKey(new Date(r.date)), kg: Number(r.weight) }));
  const toAdd = [];
  outside.forEach((w) => {
    const day = dayKey(new Date(w.timeMs));
    const kg = round1(Number(w.kg));
    if (!(kg > 0) || known.some((k) => k.day === day && Math.abs(k.kg - kg) < 0.1)) return;
    known.push({ day, kg });
    toAdd.push({ weight: kg, date: new Date(w.timeMs).toISOString(), notes: appName(w.packageName, 'Health Connect') });
  });
  importWeightRecords(toAdd);
  return toAdd.length;
}

// ── Google Fit (site) ────────────────────────────────────────────────

const GF_WINDOW_DAYS = 30;
const GF_ESTIMATED_STEPS = {
  dataSourceId: 'derived:com.google.step_count.delta:com.google.android.gms:estimated_steps',
};

/** Totaux par jour d'une donnée Google Fit, ou {} si elle n'est pas disponible. */
async function googleFitDaily(aggregateBy, fromMs, toMs, fallback = null) {
  try {
    return await GoogleFitService.aggregateDaily(aggregateBy, fromMs, toMs);
  } catch (error) {
    if (![400, 403, 404].includes(error.status)) throw error;
    if (fallback) return googleFitDaily(fallback, fromMs, toMs);
    return [];
  }
}

async function importFromGoogleFit({ days, sessionsFromMs }) {
  await GoogleFitService.signIn();
  const now = Date.now();
  const first = new Date();
  first.setHours(0, 0, 0, 0);
  first.setDate(first.getDate() - (days - 1));

  const byDay = {};
  const put = (buckets, field) => buckets.forEach((b) => {
    if (!(b.value > 0)) return;
    const key = dayKey(new Date(b.startTimeMillis));
    byDay[key] = { ...byDay[key], [field]: b.value };
  });
  for (let from = new Date(first); from.getTime() < now;) {
    const to = new Date(from);
    to.setDate(to.getDate() + GF_WINDOW_DAYS);
    const toMs = Math.min(now, to.getTime());
    put(await googleFitDaily(GF_ESTIMATED_STEPS, from.getTime(), toMs, { dataTypeName: 'com.google.step_count.delta' }), 'steps');
    // Google Fit ne donne que les calories totales (repos compris).
    put(await googleFitDaily({ dataTypeName: 'com.google.calories.expended' }, from.getTime(), toMs), 'totalKcal');
    put(await googleFitDaily({ dataTypeName: 'com.google.distance.delta' }, from.getTime(), toMs), 'distanceM');
    from = to;
  }
  mergeFitDays(byDay);

  const known = new Set(getStoredFitSessions().map((s) => String(s.id)));
  const raw = [];
  for (let from = sessionsFromMs; from < now; from += GF_WINDOW_DAYS * DAY_MS) {
    raw.push(...await GoogleFitService.listSessions(from, Math.min(now, from + GF_WINDOW_DAYS * DAY_MS)));
  }
  const sessions = [];
  for (const s of raw) {
    const id = `gf-${s.id}`;
    const type = Number(s.activityType);
    if (known.has(id) || GF_IGNORED.has(type)) continue;
    if (String(s.id || '').startsWith('projectfatloss-') || s.application?.name === 'Project Fat Loss') continue;
    const startMs = Number(s.startTimeMillis);
    const endMs = Number(s.endTimeMillis);
    if (!(endMs > startMs)) continue;
    known.add(id);
    const { kind, label } = classify(GF_TYPES, type, `${s.name || ''} ${s.description || ''}`);
    const activeMs = Number(s.activeTimeMillis) || endMs - startMs;
    let kcal = null;
    let km = null;
    try {
      kcal = await GoogleFitService.aggregateSum('com.google.calories.expended', startMs, endMs);
      const meters = await GoogleFitService.aggregateSum('com.google.distance.delta', startMs, endMs);
      if (meters > 0) km = round1(meters / 1000);
    } catch (error) {
      console.warn('[fit] calories ou distance indisponibles :', error?.message);
    }
    sessions.push({
      id,
      kind,
      label,
      title: s.name || label,
      app: appName(s.application?.packageName, s.application?.name),
      startMs,
      endMs,
      minutes: Math.max(1, Math.round(activeMs / 60000)),
      kcal: kcal > 0 ? Math.round(kcal) : null,
      km,
      source: 'google_fit',
    });
  }
  mergeFitSessions(sessions);
  return { days: Object.keys(byDay).length, sessions: sessions.length, weights: 0, source: 'Google Fit' };
}

// ── Synchro ──────────────────────────────────────────────────────────

/** Nom du service lu sur cet appareil. */
export const fitSourceName = () => (isHealthConnectApp() ? 'Health Connect' : 'Google Fit');

/**
 * Importe les données d'activité, puis les envoie au compte si l'utilisateur
 * est connecté.
 * @param {{ prompt?: boolean }} options - prompt : false pour la synchro
 *   automatique (aucune demande d'autorisation ni fenêtre de connexion)
 * @returns {Promise<null|{days:number, sessions:number, weights:number, source:string}>}
 *   null si l'accès n'est pas donné et que `prompt` est faux
 */
export async function syncFit({ prompt = true } = {}) {
  const meta = getFitMeta();
  const now = Date.now();
  const last = Number(meta.lastSyncAt) || 0;
  const options = {
    prompt,
    days: last ? NEXT_DAYS : FIRST_DAYS,
    sessionsFromMs: last ? last - SESSION_OVERLAP_DAYS * DAY_MS : now - FIRST_SESSION_DAYS * DAY_MS,
  };

  let result;
  if (isHealthConnectApp()) {
    result = await importFromHealthConnect(options);
  } else {
    // Sur le site, pas de fenêtre Google sans un clic de l'utilisateur.
    if (!prompt && !GoogleFitService.isSignedIn()) return null;
    result = await importFromGoogleFit(options);
  }
  if (!result) return null;

  setFitMeta({ lastSyncAt: now, source: result.source });
  import('./SyncService')
    .then(({ syncData }) => syncData())
    .catch(() => {});
  return result;
}

/**
 * APK : écrit une pesée (et son taux de graisse) dans Health Connect si
 * l'accès est déjà donné. Ne demande jamais d'autorisation.
 */
export async function sendWeightToHealth(record) {
  if (!isHealthConnectApp() || !record) return;
  try {
    if (!await ensureHealthAccess(['WRITE_WEIGHT'], { prompt: false })) return;
    const timeMs = new Date(record.date).getTime();
    await HealthConnect.writeWeight({ clientId: String(record.id), timeMs, kg: Number(record.weight) });
    const percent = Number(record.composition?.bodyFat) || 0;
    if (percent > 0 && await ensureHealthAccess(['WRITE_BODY_FAT'], { prompt: false })) {
      await HealthConnect.writeBodyFat({ clientId: String(record.id), timeMs, percent });
    }
  } catch (error) {
    console.warn('[fit] pesée non envoyée à Health Connect :', error?.message);
  }
}
