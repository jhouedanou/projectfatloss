// Couche de synchronisation Google Fit pour l'historique (séances, poids, nutrition).
//
// L'état "déjà synchronisé" est conservé dans une clé localStorage dédiée afin de
// NE PAS modifier les enregistrements métier (et donc ne pas déclencher les push
// Supabase associés). On évite ainsi les doublons côté Google Fit.
import GoogleFitService, { BIKE_ACTIVITY_TYPES, VIRTUAL_BIKE_ACTIVITY_TYPES } from './GoogleFitService';
import { getWorkoutHistory } from './WorkoutStorage';
import { getWeightHistory } from './WeightStorage';
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

export async function syncWorkoutToGoogleFit(workout) {
  const endTime = new Date(workout.date).getTime();
  // duration est enregistrée en minutes (chrono réel de la séance).
  const durationMs = minutesToMs(workout.duration, DEFAULT_WORKOUT_DURATION_MS);
  await GoogleFitService.addActivity({
    activityType: 80, // Strength training → affiché « Musculation » dans Google Fit
    name: `Project Fat Loss - ${workout.title || 'Entraînement'}`,
    description: `Séance de musculation. Poids total soulevé : ${workout.weightLifted || 0} kg.`,
    startTime: endTime - durationMs,
    duration: durationMs,
    calories: workout.calories || 0
  });
  markSynced('workout', workout.id);
}

export async function syncWeightToGoogleFit(record) {
  await GoogleFitService.addWeight(record.weight, new Date(record.date).getTime());
  markSynced('weight', record.id);
}

export async function syncCardioToGoogleFit(session) {
  const endTime = new Date(session.date).getTime();
  // duration est en minutes ; défaut 30 min si non renseignée.
  const durationMs = minutesToMs(session.duration, 30 * 60 * 1000);
  const isBike = session.type === 'bike';
  await GoogleFitService.addActivity({
    activityType: isBike ? 1 : 7, // 1 = Vélo, 7 = Marche
    name: `Project Fat Loss - ${isBike ? 'Vélo' : 'Marche'}`,
    description: `Séance cardio${session.distance ? ` — ${session.distance} km` : ''}.`,
    startTime: endTime - durationMs,
    duration: durationMs,
    calories: session.calories || 0,
    // Marche : les pas permettent à Google Fit de mesurer la cadence (Points cardio).
    steps: isBike ? 0 : estimateWalkSteps(session.distance, durationMs)
  });
  markSynced('cardio', session.id);
}

export async function syncNutritionDayToGoogleFit(dateStr) {
  const summary = getNutritionSummary(dateStr);
  // Horodatage à midi pour rattacher le résumé à la bonne journée.
  const timestamp = new Date(`${dateStr}T12:00:00`).getTime();
  await GoogleFitService.addNutrition(summary, timestamp);
  markSynced('nutrition', dateStr);
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

// Rameur et rameur d'appartement : Holofit propose aussi le rameur, exclu ici.
const ROWING_ACTIVITY_TYPES = [102, 103];

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

/**
 * Récupère les sorties vélo enregistrées dans Google Fit (vélo d'appartement,
 * route, VTT, spinning, séances Strava et #Holofit) sur les `days` derniers
 * jours et les ajoute aux séances cardio. Sans doublon :
 *   - une séance déjà importée est ignorée (id Google Fit mémorisé) ;
 *   - les séances écrites par Project Fat Loss elle-même sont ignorées ;
 *   - une sortie déjà présente localement (fin à ±5 min) est ignorée.
 * Les séances importées sont marquées « synchronisées » pour ne pas être
 * renvoyées vers Google Fit. Une séance cochée à la main dans la check-list le
 * même jour est remplacée par la séance importée (pas de double comptage).
 * @returns {Promise<{found:number, imported:number, skipped:number, minutes:number}>}
 */
export async function importBikeSessionsFromGoogleFit({ days = 365 } = {}) {
  await GoogleFitService.signIn();

  const end = Date.now();
  const start = end - days * 24 * 60 * 60 * 1000;
  const sessions = [];
  for (let from = start; from < end; from += IMPORT_WINDOW_MS) {
    const to = Math.min(end, from + IMPORT_WINDOW_MS);
    // Tous types : les séances Holofit/Strava ne sont pas toujours classées vélo.
    sessions.push(...await GoogleFitService.listSessions(from, to));
  }

  const imported = getImportedMap();
  const localBikeEnds = getCardioSessions()
    .filter((s) => s.type === 'bike' && !isChecklistSession(s))
    .map((s) => new Date(s.date).getTime());
  const seen = new Set();
  const toImport = [];

  for (const session of sessions) {
    const id = session.id;
    const origin = bikeSessionOrigin(session);
    if (!id || seen.has(id) || !origin) continue;
    seen.add(id);
    if (imported[id]) continue;
    if (id.startsWith('projectfatloss-') || session.application?.name === 'Project Fat Loss') continue;

    const startMs = Number(session.startTimeMillis);
    const endMs = Number(session.endTimeMillis);
    if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs <= startMs) continue;
    if (localBikeEnds.some((t) => Math.abs(t - endMs) <= 5 * 60 * 1000)) continue;

    const activeMs = Number(session.activeTimeMillis) || endMs - startMs;
    const minutes = Math.max(1, Math.round(activeMs / 60000));
    toImport.push({ id, name: session.name, activityType: Number(session.activityType), origin, startMs, endMs, minutes });
  }

  // Calories et distance de chaque sortie. Une donnée manquante n'empêche pas
  // l'import : calories estimées, distance laissée vide.
  const records = [];
  for (const s of toImport) {
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
      notes: JSON.stringify({ source: 'google_fit', origin: s.origin, name: s.name || '', activityType: s.activityType }),
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
 * La vraie séance remplace la case cochée à la main le même jour : supprime
 * les séances vélo de la check-list des jours où une séance a été importée.
 */
export function replaceChecklistSessions(importedRecords) {
  const importedDays = new Set(importedRecords.map((r) => dateKey(new Date(r.date))));
  getCardioSessions()
    .filter((s) => s.type === 'bike' && isChecklistSession(s) && importedDays.has(dateKey(new Date(s.date))))
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
export async function importStepsFromGoogleFit({ days = 365 } = {}) {
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
