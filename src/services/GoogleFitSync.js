// Couche de synchronisation Google Fit pour l'historique (séances, poids, nutrition).
//
// L'état "déjà synchronisé" est conservé dans une clé localStorage dédiée afin de
// NE PAS modifier les enregistrements métier (et donc ne pas déclencher les push
// Supabase associés). On évite ainsi les doublons côté Google Fit.
import GoogleFitService from './GoogleFitService';
import { getWorkoutHistory } from './WorkoutStorage';
import { getWeightHistory } from './WeightStorage';
import { getNutritionSummary } from '../data/foodDatabase';

const SYNCED_KEY = 'pfl_googlefit_synced';

// Durée par défaut d'une séance enregistrée depuis l'historique (45 min).
const DEFAULT_WORKOUT_DURATION_MS = 45 * 60 * 1000;

function getSyncedMap() {
  try {
    return JSON.parse(localStorage.getItem(SYNCED_KEY) || '{}');
  } catch {
    return {};
  }
}

function markSynced(category, id) {
  const map = getSyncedMap();
  if (!map[category]) map[category] = {};
  map[category][String(id)] = Date.now();
  localStorage.setItem(SYNCED_KEY, JSON.stringify(map));
}

export function isSyncedWithGoogleFit(category, id) {
  const map = getSyncedMap();
  return !!(map[category] && map[category][String(id)]);
}

// ── Synchronisation d'un élément unique ──────────────────────────────

export async function syncWorkoutToGoogleFit(workout) {
  const endTime = new Date(workout.date).getTime();
  await GoogleFitService.addActivity({
    activityType: 97, // Strength Training
    name: `Project Fat Loss - ${workout.title || 'Entraînement'}`,
    description: `Séance de musculation. Poids total soulevé : ${workout.weightLifted || 0} kg.`,
    startTime: endTime - DEFAULT_WORKOUT_DURATION_MS,
    duration: DEFAULT_WORKOUT_DURATION_MS,
    calories: workout.calories || 0
  });
  markSynced('workout', workout.id);
}

export async function syncWeightToGoogleFit(record) {
  await GoogleFitService.addWeight(record.weight, new Date(record.date).getTime());
  markSynced('weight', record.id);
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
async function syncMany(items, syncOne, getId, getLabel) {
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

export async function syncAllWorkouts() {
  return syncMany(
    getUnsyncedWorkouts(),
    syncWorkoutToGoogleFit,
    w => w.id,
    w => `${w.title || 'Entraînement'} (${w.displayDate || ''})`
  );
}

export async function syncAllWeights() {
  return syncMany(
    getUnsyncedWeights(),
    syncWeightToGoogleFit,
    r => r.id,
    r => `${r.weight} kg`
  );
}

function getNutritionLogDates() {
  try {
    return Object.keys(JSON.parse(localStorage.getItem('pfl_nutrition_logs') || '{}'));
  } catch {
    return [];
  }
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
    d => d,
    d => d
  );
}
