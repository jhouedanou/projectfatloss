// Couche de synchronisation santé pour l'historique (séances, poids, nutrition) :
// Google Fit sur le site, Health Connect dans l'APK Android (même interface,
// mêmes fonctions ; voir HealthConnect.js).
//
// L'état "déjà synchronisé" est conservé dans une clé localStorage dédiée afin de
// NE PAS modifier les enregistrements métier (et donc ne pas déclencher les push
// Firebase associés). On évite ainsi les doublons côté Google Fit / Health Connect.
import GoogleFitService, { BIKE_ACTIVITY_TYPES, VIRTUAL_BIKE_ACTIVITY_TYPES } from './GoogleFitService';
import HealthConnect, { ensureHealthAccess, isHealthConnectApp } from './HealthConnect';
import { workoutParts } from './WorkoutIntensity';
import { getWorkoutHistory } from './WorkoutStorage';
import { getWeightHistory, importWeightRecords } from './WeightStorage';
import { getCardioSessions, importCardioSessions, deleteCardioSession } from './CardioStorage';
import { getUserWeight } from './CalorieEstimator';
import { saveDailySteps } from './StepsStorage';
import { dateKey } from './HabitStorage';
import { getNutritionSummary } from '../data/foodDatabase';

const SYNCED_KEY = 'pfl_googlefit_synced';
const IMPORTED_KEY = 'pfl_googlefit_imported';
const NUTRITION_LOGS_KEY = 'pfl_nutrition_logs';

// Durée par défaut d'une séance dont la durée n'a pas été mesurée (45 min).
const DEFAULT_WORKOUT_DURATION_MS = 45 * 60 * 1000;

// Accès localStorage protégé pour les contextes non-navigateur (SSR, tests).
function getStorage() {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  return window.localStorage;
}

function readJSON(key, fallback) {
  const storage = getStorage();
  if (!storage) return fallback;
  try {
    return JSON.parse(storage.getItem(key) || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
}

function getSyncedMap() {
  return readJSON(SYNCED_KEY, {});
}

/** Marque une séance cardio importée comme déjà présente dans Google Fit. */
export function markCardioSynced(id) {
  markSynced('cardio', id);
}

function markSynced(category, id) {
  const storage = getStorage();
  if (!storage) return;
  const map = getSyncedMap();
  if (!map[category]) map[category] = {};
  map[category][String(id)] = Date.now();
  storage.setItem(SYNCED_KEY, JSON.stringify(map));
}

export function isSyncedWithGoogleFit(category, id) {
  const map = getSyncedMap();
  return !!(map[category] && map[category][String(id)]);
}

// ── Synchronisation d'un élément unique ──────────────────────────────

// Durée (minutes) → millisecondes, avec valeur par défaut si absente ou nulle.
function minutesToMs(minutes, fallbackMs) {
  const value = Number(minutes);
  return Number.isFinite(value) && value > 0 ? value * 60 * 1000 : fallbackMs;
}

// Pas estimés pour une marche : ~1300 pas/km si la distance est connue,
// sinon ~100 pas/min (seuil de la marche rapide qui rapporte des Points cardio).
export function estimateWalkSteps(distanceKm, durationMs) {
  const km = Number(distanceKm);
  if (Number.isFinite(km) && km > 0) return Math.round(km * 1300);
  return Math.round((durationMs / 60000) * 100);
}

// Écriture Health Connect : séance avec ses calories actives et sa distance.
const HC_WRITE_EXERCISE = ['WRITE_EXERCISE', 'WRITE_ACTIVE_CALORIES_BURNED', 'WRITE_DISTANCE'];

async function writeHealthExercise({ clientId, type, title, notes, endTime, durationMs, calories, distanceKm }) {
  await ensureHealthAccess(HC_WRITE_EXERCISE);
  await HealthConnect.writeExercise({
    clientId,
    type,
    title,
    notes,
    startMs: endTime - durationMs,
    endMs: endTime,
    calories: Number(calories) || 0,
    distanceMeters: Number(distanceKm) > 0 ? Number(distanceKm) * 1000 : 0,
  });
}

// Types d'activité Google Fit : 80 = musculation, 22 = entraînement en circuit,
// 18 = vélo d'appartement, 7 = marche. Health Connect : voir HealthConnectPlugin.kt.
const GF_STRENGTH = 80;
const GF_CIRCUIT = 22;
const GF_STATIONARY_BIKE = 18;
const GF_WALKING = 7;

export async function syncWorkoutToGoogleFit(workout) {
  const endTime = new Date(workout.date).getTime();
  // duration est enregistrée en minutes (chrono réel de la séance).
  const durationMs = minutesToMs(workout.duration, DEFAULT_WORKOUT_DURATION_MS);
  const startTime = endTime - durationMs;
  const title = `Project Fat Loss - ${workout.title || 'Entraînement'}`;
  const description = `Séance de musculation. Poids total soulevé : ${workout.weightLifted || 0} kg.`;
  // Musculation puis finisher en circuit (ou circuit entier le mercredi) : les
  // points cardio suivent le vrai type d'effort de chaque partie.
  const parts = workoutParts(workout, durationMs);
  if (isHealthConnectApp()) {
    // Une séance Health Connect par partie, calories réparties selon la durée.
    for (const [index, part] of parts.entries()) {
      const partMs = part.endOffsetMs - part.startOffsetMs;
      const finisher = part.kind === 'circuit' && parts.length > 1;
      await writeHealthExercise({
        clientId: index === 0 ? `workout-${workout.id}` : `workout-${workout.id}-${part.kind}`,
        type: part.kind === 'circuit' ? 'hiit' : 'strength',
        title: finisher ? `${title} — finisher` : title,
        notes: description,
        endTime: startTime + part.endOffsetMs,
        durationMs: partMs,
        calories: Math.round((Number(workout.calories) || 0) * (partMs / durationMs)),
      });
    }
  } else {
    const gfType = (kind) => (kind === 'circuit' ? GF_CIRCUIT : GF_STRENGTH);
    await GoogleFitService.addActivity({
      // Séance affichée « Musculation », ou « Entraînement en circuit » le mercredi.
      activityType: parts.length === 1 ? gfType(parts[0].kind) : GF_STRENGTH,
      name: title,
      description,
      startTime,
      duration: durationMs,
      calories: workout.calories || 0,
      segments: parts.map((part) => ({
        activityType: gfType(part.kind),
        startOffsetMs: part.startOffsetMs,
        endOffsetMs: part.endOffsetMs,
      })),
    });
  }
  markSynced('workout', workout.id);
}

export async function syncWeightToGoogleFit(record) {
  const time = new Date(record.date).getTime();
  if (isHealthConnectApp()) {
    await ensureHealthAccess(['WRITE_WEIGHT']);
    await HealthConnect.writeWeight({ clientId: String(record.id), timeMs: time, kg: Number(record.weight) });
  } else {
    await GoogleFitService.addWeight(record.weight, time);
  }
  markSynced('weight', record.id);
}

export async function syncCardioToGoogleFit(session) {
  const endTime = new Date(session.date).getTime();
  // duration est en minutes ; défaut 30 min si non renseignée.
  const durationMs = minutesToMs(session.duration, 30 * 60 * 1000);
  const isBike = session.type === 'bike';
  const title = `Project Fat Loss - ${isBike ? 'Vélo' : 'Marche'}`;
  const description = `Séance cardio${session.distance ? ` — ${session.distance} km` : ''}.`;
  if (isHealthConnectApp()) {
    await writeHealthExercise({
      clientId: `cardio-${session.id}`, type: isBike ? 'bike' : 'walk', title, notes: description,
      endTime, durationMs, calories: session.calories, distanceKm: session.distance,
    });
  } else {
    await GoogleFitService.addActivity({
      activityType: isBike ? GF_STATIONARY_BIKE : GF_WALKING,
      name: title,
      description,
      startTime: endTime - durationMs,
      duration: durationMs,
      calories: session.calories || 0,
      // Marche : les pas permettent à Google Fit de mesurer la cadence (Points cardio).
      steps: isBike ? 0 : estimateWalkSteps(session.distance, durationMs)
    });
  }
  markSynced('cardio', session.id);
}

export async function syncNutritionDayToGoogleFit(dateStr) {
  const summary = getNutritionSummary(dateStr);
  if (isHealthConnectApp()) {
    await ensureHealthAccess(['WRITE_NUTRITION']);
    await HealthConnect.writeNutritionDay({
      day: dateStr, calories: summary.calories, protein: summary.protein, carbs: summary.carbs, fat: summary.fat,
    });
  } else {
    // Horodatage à midi pour rattacher le résumé à la bonne journée.
    const timestamp = new Date(`${dateStr}T12:00:00`).getTime();
    await GoogleFitService.addNutrition(summary, timestamp);
  }
  markSynced('nutrition', dateStr);
}

/**
 * Envoi automatique dans l'APK : une séance, une pesée ou une sortie vélo
 * enregistrée part vers Health Connect si l'accès est déjà accordé (aucune
 * demande d'autorisation ici). Les cases cochées à la main dans la
 * check-list ne partent pas : la vraie séance, importée ensuite, les remplace.
 * @param {'workout'|'weight'|'cardio'} category
 */
export async function autoSyncToHealth(category, item) {
  if (!isHealthConnectApp() || !item || isSyncedWithGoogleFit(category, item.id)) return;
  if (category === 'cardio' && isChecklistSession(item)) return;
  try {
    const needed = category === 'weight' ? ['WRITE_WEIGHT'] : HC_WRITE_EXERCISE;
    if (!await ensureHealthAccess(needed, { prompt: false })) return;
    if (category === 'workout') await syncWorkoutToGoogleFit(item);
    else if (category === 'weight') await syncWeightToGoogleFit(item);
    else if (category === 'cardio') await syncCardioToGoogleFit(item);
  } catch (error) {
    console.warn('[health] envoi automatique différé:', error?.message);
  }
}

// ── Synchronisation en masse ─────────────────────────────────────────

// Exécute `syncOne` sur chaque élément non encore synchronisé.
// Retourne { synced, failed, details }.
async function syncMany(items, syncOne, getLabel) {
  const result = { synced: 0, failed: 0, details: [] };
  for (const item of items) {
    try {
      await syncOne(item);
      result.synced += 1;
      result.details.push({ label: getLabel(item), status: 'success' });
    } catch (error) {
      result.failed += 1;
      result.details.push({ label: getLabel(item), status: 'failed', reason: error.message });
    }
  }
  return result;
}

export function getUnsyncedWorkouts() {
  return getWorkoutHistory().filter(w => !isSyncedWithGoogleFit('workout', w.id));
}

export function getUnsyncedWeights() {
  return getWeightHistory().filter(r => !isSyncedWithGoogleFit('weight', r.id));
}

export function getUnsyncedCardio() {
  return getCardioSessions().filter(s => !isSyncedWithGoogleFit('cardio', s.id));
}

export async function syncAllWorkouts() {
  return syncMany(
    getUnsyncedWorkouts(),
    syncWorkoutToGoogleFit,
    w => `${w.title || 'Entraînement'} (${w.displayDate || ''})`
  );
}

export async function syncAllWeights() {
  return syncMany(
    getUnsyncedWeights(),
    syncWeightToGoogleFit,
    r => `${r.weight} kg`
  );
}

export async function syncAllCardio() {
  return syncMany(
    getUnsyncedCardio(),
    syncCardioToGoogleFit,
    s => `${s.type === 'bike' ? 'Vélo' : 'Marche'} ${s.duration || ''} min`
  );
}

function getNutritionLogDates() {
  return Object.keys(readJSON(NUTRITION_LOGS_KEY, {}));
}

// Jours nutritionnels enregistrés (avec au moins une calorie) non encore synchronisés.
export function getUnsyncedNutritionDays() {
  return getNutritionLogDates().filter(
    d => !isSyncedWithGoogleFit('nutrition', d) && getNutritionSummary(d).calories > 0
  );
}

export async function syncAllNutritionDays() {
  return syncMany(
    getUnsyncedNutritionDays(),
    syncNutritionDayToGoogleFit,
    d => d
  );
}

// ── Import des sorties vélo depuis Google Fit ────────────────────────

// MET du vélo (CalorieEstimator / useBikeMetrics) pour estimer les calories
// quand Google Fit n'en fournit pas.
const BIKE_MET = 7.0;
// Fenêtres de lecture de 90 jours : requêtes légères, même sur un an.
const IMPORT_WINDOW_MS = 90 * 24 * 60 * 60 * 1000;

function getImportedMap() {
  return readJSON(IMPORTED_KEY, {});
}

// Rameur (53) et rameur d'appartement (54), d'après la table officielle des
// types d'activité Google Fit : Holofit propose aussi le rameur, exclu ici.
const ROWING_ACTIVITY_TYPES = [53, 54];

/**
 * Origine d'une séance vélo Google Fit, ou null si ce n'est pas du vélo :
 *   - 'holofit' : « Holofit » dans le nom ou la description (#Holofit) ;
 *   - 'strava'  : séance synchronisée depuis Strava et nommée comme une sortie ;
 *   - 'google_fit' : séance classée vélo par Google Fit (y compris le type
 *     23 « Cricket », sous lequel arrivent les séances Holofit / Strava).
 */
export function bikeSessionOrigin(session) {
  const type = Number(session?.activityType);
  if (ROWING_ACTIVITY_TYPES.includes(type)) return null;
  const text = `${session?.name || ''} ${session?.description || ''}`;
  if (/holofit/i.test(text)) return 'holofit';
  const app = `${session?.application?.packageName || ''} ${session?.application?.name || ''}`;
  const fromStrava = /strava/i.test(app);
  if (fromStrava && (BIKE_ACTIVITY_TYPES.includes(type) || /ride|v[ée]lo|bike|cycl|spin/i.test(text))) return 'strava';
  if (BIKE_ACTIVITY_TYPES.includes(type) || VIRTUAL_BIKE_ACTIVITY_TYPES.includes(type)) return 'google_fit';
  return null;
}

/** Séance cardio cochée depuis la check-list du jour ? */
export function isChecklistSession(session) {
  try {
    return JSON.parse(session?.notes || '{}').source === 'checklist';
  } catch {
    return false;
  }
}

// Health Connect : vélo (8) et vélo d'appartement (9) ; rameur (53, 54) exclu.
const HC_BIKE_TYPES = [8, 9];
const HC_ROWING_TYPES = [53, 54];
const OWN_PACKAGE = 'com.houedanou.fatloss';

/**
 * Origine d'une séance Health Connect, ou null si ce n'est pas du vélo :
 * 'holofit' (nom ou app), 'strava' (app Strava), 'health_connect' (autre app).
 */
export function healthBikeSessionOrigin(session) {
  const type = Number(session?.exerciseType);
  if (HC_ROWING_TYPES.includes(type)) return null;
  const title = session?.title || '';
  const app = session?.packageName || '';
  if (/holofit/i.test(`${title} ${app}`)) return 'holofit';
  if (!HC_BIKE_TYPES.includes(type) && !/ride|v[ée]lo|bike|cycl|spin/i.test(title)) return null;
  return /strava/i.test(app) ? 'strava' : 'health_connect';
}

/**
 * Séances vélo Google Fit candidates : [{ id, name, activityType, origin,
 * startMs, endMs, minutes }] (calories et distance lues plus tard, seulement
 * pour les séances vraiment nouvelles).
 */
async function listGoogleFitBikeSessions(start, end) {
  await GoogleFitService.signIn();
  const sessions = [];
  for (let from = start; from < end; from += IMPORT_WINDOW_MS) {
    const to = Math.min(end, from + IMPORT_WINDOW_MS);
    // Tous types : les séances Holofit/Strava ne sont pas toujours classées vélo.
    sessions.push(...await GoogleFitService.listSessions(from, to));
  }
  return sessions
    .filter((session) => !session.id?.startsWith('projectfatloss-') && session.application?.name !== 'Project Fat Loss')
    .map((session) => {
      const startMs = Number(session.startTimeMillis);
      const endMs = Number(session.endTimeMillis);
      const activeMs = Number(session.activeTimeMillis) || endMs - startMs;
      return {
        id: session.id,
        name: session.name,
        activityType: Number(session.activityType),
        origin: bikeSessionOrigin(session),
        startMs,
        endMs,
        minutes: Math.max(1, Math.round(activeMs / 60000)),
      };
    });
}

/** Calories et distance d'une sortie Google Fit (une donnée manquante reste null). */
async function readGoogleFitTotals(s) {
  let calories = null;
  let distance = null;
  try {
    calories = await GoogleFitService.aggregateSum('com.google.calories.expended', s.startMs, s.endMs);
  } catch (error) {
    console.warn('Calories Google Fit indisponibles:', error.message);
  }
  try {
    const meters = await GoogleFitService.aggregateSum('com.google.distance.delta', s.startMs, s.endMs);
    if (meters != null) distance = Math.round(meters / 100) / 10;
  } catch (error) {
    console.warn('Distance Google Fit indisponible:', error.message);
  }
  return { calories, distance };
}

const HC_READ_SESSIONS = ['READ_EXERCISE', 'READ_ACTIVE_CALORIES_BURNED', 'READ_TOTAL_CALORIES_BURNED', 'READ_DISTANCE'];

/** Séances vélo Health Connect candidates, calories et distance comprises. */
async function listHealthBikeSessions(start, end, { prompt = true } = {}) {
  if (!await ensureHealthAccess(HC_READ_SESSIONS, { prompt })) return [];
  const { sessions = [] } = await HealthConnect.readExerciseSessions({ startMs: start, endMs: end });
  return sessions
    .filter((session) => session.packageName !== OWN_PACKAGE && !String(session.clientRecordId || '').startsWith('pfl-'))
    .map((session) => ({
      id: `hc-${session.id}`,
      name: session.title,
      activityType: Number(session.exerciseType),
      origin: healthBikeSessionOrigin(session),
      startMs: Number(session.startMs),
      endMs: Number(session.endMs),
      minutes: Math.max(1, Math.round((Number(session.endMs) - Number(session.startMs)) / 60000)),
      totals: {
        calories: session.calories ?? null,
        distance: session.distanceMeters != null ? Math.round(session.distanceMeters / 100) / 10 : null,
      },
    }));
}

/**
 * Récupère les sorties vélo enregistrées dans Google Fit (site) ou Health
 * Connect (APK) — vélo d'appartement, route, VTT, spinning, séances Strava et
 * #Holofit — sur les `days` derniers jours et les ajoute aux séances cardio.
 * Sans doublon :
 *   - une séance déjà importée est ignorée (id mémorisé) ;
 *   - les séances écrites par Project Fat Loss elle-même sont ignorées ;
 *   - une sortie déjà présente localement (fin à ±5 min) est ignorée.
 * Les séances importées sont marquées « synchronisées » pour ne pas être
 * renvoyées. Une séance cochée à la main dans la check-list le même jour est
 * remplacée par la séance importée (pas de double comptage).
 * Health Connect ne donne que 30 jours d'historique avant la première autorisation.
 * @param {{ days?: number, prompt?: boolean }} options - prompt : false pour
 *   l'import automatique (aucune demande d'autorisation dans l'APK)
 * @returns {Promise<{found:number, imported:number, skipped:number, minutes:number}>}
 */
export async function importBikeSessionsFromGoogleFit({ days = 365, prompt = true } = {}) {
  const end = Date.now();
  const start = end - days * 24 * 60 * 60 * 1000;
  const healthConnect = isHealthConnectApp();
  const candidates = healthConnect
    ? await listHealthBikeSessions(start, end, { prompt })
    : await listGoogleFitBikeSessions(start, end);

  const imported = getImportedMap();
  const localBikeEnds = getCardioSessions()
    .filter((s) => s.type === 'bike' && !isChecklistSession(s))
    .map((s) => new Date(s.date).getTime());
  const seen = new Set();
  const toImport = [];

  for (const s of candidates) {
    if (!s.id || seen.has(s.id) || !s.origin) continue;
    seen.add(s.id);
    if (imported[s.id]) continue;
    if (!Number.isFinite(s.startMs) || !Number.isFinite(s.endMs) || s.endMs <= s.startMs) continue;
    if (localBikeEnds.some((t) => Math.abs(t - s.endMs) <= 5 * 60 * 1000)) continue;
    toImport.push(s);
  }

  // Calories manquantes : estimées ; distance manquante : laissée vide.
  const records = [];
  for (const s of toImport) {
    let { calories, distance } = s.totals || await readGoogleFitTotals(s);
    if (!calories) {
      calories = (BIKE_MET * 3.5 * getUserWeight()) / 200 * s.minutes;
    }
    records.push({
      gfitId: s.id,
      type: 'bike',
      date: new Date(s.endMs).toISOString(),
      duration: s.minutes,
      distance,
      calories: Math.round(calories),
      notes: JSON.stringify({
        source: healthConnect ? 'health_connect' : 'google_fit',
        origin: s.origin,
        name: s.name || '',
        activityType: s.activityType,
      }),
    });
  }

  const created = importCardioSessions(records);

  replaceChecklistSessions(created);

  const storage = getStorage();
  if (storage) {
    created.forEach((record, i) => {
      imported[records[i].gfitId] = record.id;
      markSynced('cardio', record.id);
    });
    storage.setItem(IMPORTED_KEY, JSON.stringify(imported));
  }

  return {
    found: seen.size,
    imported: created.length,
    skipped: seen.size - created.length,
    minutes: created.reduce((sum, r) => sum + (r.duration || 0), 0),
  };
}

/**
 * Jour (aaaa-mm-jj, heure locale) d'une séance vélo pour la check-list :
 * jour de DÉBUT pour une séance importée (son champ date est la fin : une
 * sortie de 23 h 50 à 0 h 20 compte pour la veille), jour de la coche pour
 * une séance cochée dans la check-list.
 */
export function bikeSessionDayKey(session) {
  const end = new Date(session.date).getTime();
  if (isChecklistSession(session)) return dateKey(new Date(end));
  return dateKey(new Date(end - (Number(session.duration) || 0) * 60 * 1000));
}

/**
 * La vraie séance remplace la case cochée à la main le même jour : supprime
 * les séances vélo de la check-list des jours où une séance a été importée.
 */
export function replaceChecklistSessions(importedRecords) {
  const importedDays = new Set(importedRecords.map(bikeSessionDayKey));
  getCardioSessions()
    .filter((s) => s.type === 'bike' && isChecklistSession(s) && importedDays.has(bikeSessionDayKey(s)))
    .forEach((s) => deleteCardioSession(s.id));
}

// ── Import des pas depuis Google Fit ─────────────────────────────────

// Source « pas estimés » : celle qu'affiche l'application Google Fit.
const ESTIMATED_STEPS = {
  dataSourceId: 'derived:com.google.step_count.delta:com.google.android.gms:estimated_steps'
};
// Fenêtres de 30 jours (30 compartiments journaliers par requête).
const STEPS_WINDOW_DAYS = 30;

/**
 * Récupère le total de pas de chaque jour sur les `days` derniers jours
 * (aujourd'hui compris) et l'enregistre localement.
 * @returns {Promise<{ days: number, total: number, today: number|null }>}
 */
export async function importStepsFromGoogleFit({ days = 365, prompt = true } = {}) {
  if (isHealthConnectApp()) return importStepsFromHealthConnect({ days, prompt });
  await GoogleFitService.signIn();

  const end = Date.now();
  const firstDay = new Date();
  firstDay.setHours(0, 0, 0, 0);
  firstDay.setDate(firstDay.getDate() - (days - 1));

  const byDay = {};
  for (let from = new Date(firstDay); from.getTime() < end;) {
    const to = new Date(from);
    to.setDate(to.getDate() + STEPS_WINDOW_DAYS);
    const toMs = Math.min(end, to.getTime());
    let buckets;
    try {
      buckets = await GoogleFitService.aggregateDaily(ESTIMATED_STEPS, from.getTime(), toMs);
    } catch (error) {
      // Source « estimated_steps » absente : flux de pas fusionné par défaut.
      if (error.status !== 403 && error.status !== 404 && error.status !== 400) throw error;
      buckets = await GoogleFitService.aggregateDaily(
        { dataTypeName: 'com.google.step_count.delta' }, from.getTime(), toMs
      );
    }
    buckets.forEach((b) => {
      if (b.value > 0) byDay[dateKey(new Date(b.startTimeMillis))] = b.value;
    });
    from = to;
  }

  saveDailySteps(byDay);
  const values = Object.values(byDay);
  return {
    days: values.length,
    total: values.reduce((sum, v) => sum + v, 0),
    today: byDay[dateKey(new Date())] ?? null,
  };
}

/** Pas de chaque jour lus dans Health Connect (APK), comme importStepsFromGoogleFit. */
async function importStepsFromHealthConnect({ days, prompt }) {
  if (!await ensureHealthAccess(['READ_STEPS'], { prompt })) return { days: 0, total: 0, today: null };
  const { days: rows = [] } = await HealthConnect.readDailySteps({ days: Math.min(days, 400) });
  const byDay = {};
  rows.forEach((row) => {
    if (row.steps > 0) byDay[row.date] = Number(row.steps);
  });
  saveDailySteps(byDay);
  const values = Object.values(byDay);
  return {
    days: values.length,
    total: values.reduce((sum, v) => sum + v, 0),
    today: byDay[dateKey(new Date())] ?? null,
  };
}

// ── Import des pesées depuis Health Connect (APK) ────────────────────

/**
 * Ajoute les pesées de Health Connect (balance connectée, Samsung Health,
 * Fitbit…) absentes de l'historique : une pesée du même jour à 0,1 kg près
 * est déjà là. Les pesées écrites par Project Fat Loss sont ignorées.
 * @returns {Promise<{found:number, imported:number}>}
 */
export async function importWeightsFromHealthConnect({ days = 365, prompt = true } = {}) {
  if (!isHealthConnectApp()) return { found: 0, imported: 0 };
  if (!await ensureHealthAccess(['READ_WEIGHT'], { prompt })) return { found: 0, imported: 0 };
  const end = Date.now();
  const { weights = [] } = await HealthConnect.readWeights({ startMs: end - days * 24 * 60 * 60 * 1000, endMs: end });
  const outside = weights.filter((w) => w.packageName !== OWN_PACKAGE && !String(w.clientRecordId || '').startsWith('pfl-'));

  const known = getWeightHistory().map((r) => ({ day: dateKey(new Date(r.date)), kg: Number(r.weight) }));
  const toAdd = [];
  outside.forEach((w) => {
    const day = dateKey(new Date(w.timeMs));
    const kg = Math.round(Number(w.kg) * 10) / 10;
    if (!(kg > 0) || known.some((k) => k.day === day && Math.abs(k.kg - kg) < 0.1)) return;
    known.push({ day, kg });
    toAdd.push({ kg, date: new Date(w.timeMs).toISOString() });
  });

  importWeightRecords(toAdd.map(({ kg, date }) => ({ weight: kg, date, notes: 'Health Connect' })))
    .forEach((record) => markSynced('weight', record.id));
  return { found: outside.length, imported: toAdd.length };
}
