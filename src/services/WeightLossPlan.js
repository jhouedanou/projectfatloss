/**
 * Objectif de perte de poids exprimé en DURÉES de séance.
 *
 * Principe : 1 kg de graisse ≈ 7 700 kcal. Perdre 3 à 4 kg par mois demande
 * donc un déficit de ~760 à ~1 010 kcal par jour. Une partie vient de
 * l'assiette (objectif calorique de NutritionGoals), le reste vient du sport :
 * surtout du vélo, la musculation légère complétant.
 *
 * Seules les calories EN PLUS du repos sont comptées (MET − 1) : le TDEE
 * contient déjà la dépense de repos, il ne faut pas la compter deux fois.
 *
 * MET (Compendium of Physical Activities 2011) :
 *   - vélo d'appartement 90-100 W, effort modéré : 6.8
 *   - musculation légère à modérée, plusieurs exercices : 3.5
 *
 * Le vélo ne fait pas partie de la séance guidée : ses minutes figurent dans
 * la check-list du jour de l'accueil (une seule séance de vélo par jour).
 */

import { getUserWeight, isBikeName } from './CalorieEstimator';
import { getTDEE, getCalorieTarget } from './NutritionGoals';
import { getWorkoutHistory } from './WorkoutStorage';
import { getCardioSessions } from './CardioStorage';

export const KCAL_PER_KG = 7700;
export const DAYS_PER_MONTH = 30.4;
export const GOAL_OPTIONS_KG = [3, 3.5, 4];
export const DEFAULT_GOAL_KG = 3.5;
const GOAL_KEY = 'monthly_loss_goal_kg';

export const BIKE_MET = 6.8;
export const STRENGTH_MET = 3.5;

// Une seule séance de vélo par jour de séance : 20 min minimum (accent sur le
// vélo), 60 min maximum ; au-delà, le reste passe en vélo libre les jours de repos.
const MIN_BIKE_PER_SESSION = 20;
const MAX_BIKE_PER_SESSION = 60;

// MET du vélo pour estimer les calories d'un bloc coché (comme CalorieEstimator).
const BIKE_LOG_MET = 7.0;

// Modèle de repos de StepWorkout.jsx (15 s + 5 s par série faite, plafond
// 40 s ; 45 s entre deux exercices) — même modèle que scripts/gen-plan.mjs.
const SET_PAUSE_BASE = 15;
const SET_PAUSE_INCREMENT = 5;
const SET_PAUSE_MAX = 40;
const EXERCISE_PAUSE = 45;

const ceil5 = (n) => Math.ceil(n / 5) * 5;

export function isBikeExercise(exercise) {
  return isBikeName(exercise?.name);
}

// ── Objectif mensuel ─────────────────────────────────────────────────

export function getMonthlyGoalKg() {
  try {
    const value = Number(localStorage.getItem(GOAL_KEY));
    return GOAL_OPTIONS_KG.includes(value) ? value : DEFAULT_GOAL_KG;
  } catch (e) {
    return DEFAULT_GOAL_KG;
  }
}

export function setMonthlyGoalKg(kg) {
  if (!GOAL_OPTIONS_KG.includes(kg)) return false;
  try {
    localStorage.setItem(GOAL_KEY, String(kg));
    return true;
  } catch (e) {
    return false;
  }
}

// ── Dépense et déficit ───────────────────────────────────────────────

/** kcal brûlées par minute en plus du repos. */
export function netKcalPerMin(met, weightKg = getUserWeight()) {
  return ((met - 1) * 3.5 * weightKg) / 200;
}

/** Calories estimées d'un bloc de vélo (kcal totales, comme CardioTracker). */
export function estimateBikeCalories(minutes, weightKg = getUserWeight()) {
  return Math.round(((BIKE_LOG_MET * 3.5 * weightKg) / 200) * minutes);
}

/** Déficit quotidien apporté par l'assiette (objectif calorique vs TDEE). */
export function getDietDeficitKcal() {
  return Math.max(0, getTDEE() - getCalorieTarget());
}

// ── Durée d'une séance ───────────────────────────────────────────────

function setWorkSeconds(exercise) {
  if (exercise.timer && exercise.duration) return exercise.duration;
  const sets = exercise.sets || '';
  const slow = /tempo/.test(sets);
  const perSide = (exercise.nbRep || 12) * (slow ? 5 : 3);
  return sets.includes('/côté') ? perSide * 2 + 3 : perSide;
}

/**
 * Minutes estimées d'une séance, vélo et musculation séparés.
 * @returns {{ bike: number, strength: number, total: number }}
 */
export function estimateSessionMinutes(day) {
  if (!day || day.isRestDay) return { bike: 0, strength: 0, total: 0 };
  let bikeSeconds = 0;
  let strengthSeconds = 0;
  const exercises = day.exercises || [];
  exercises.forEach((exercise, index) => {
    if (isBikeExercise(exercise)) {
      bikeSeconds += exercise.duration || 0;
      return;
    }
    const sets = Math.max(1, exercise.totalSets || 1);
    for (let set = 0; set < sets; set += 1) {
      strengthSeconds += setWorkSeconds(exercise);
      if (set < sets - 1) {
        strengthSeconds += Math.min(SET_PAUSE_BASE + set * SET_PAUSE_INCREMENT, SET_PAUSE_MAX);
      }
    }
    if (index < exercises.length - 1) strengthSeconds += EXERCISE_PAUSE;
  });
  const bike = Math.round(bikeSeconds / 60);
  const strength = Math.round(strengthSeconds / 60);
  return { bike, strength, total: bike + strength };
}

// ── Cibles de la semaine ─────────────────────────────────────────────

/**
 * Cibles d'une semaine du programme (7 jours) pour l'objectif choisi.
 * @param {Array} weekDays jours de la semaine (plan complet, vélo compris)
 */
export function computeWeekTargets(weekDays, { goalKg = getMonthlyGoalKg(), weightKg = getUserWeight() } = {}) {
  const sessionDays = (weekDays || []).filter((d) => d && !d.isRestDay);
  const sessions = sessionDays.length;
  const restDays = (weekDays || []).filter((d) => d && d.isRestDay).length;

  const bikeRate = netKcalPerMin(BIKE_MET, weightKg);
  const strengthRate = netKcalPerMin(STRENGTH_MET, weightKg);
  const dietDaily = getDietDeficitKcal();
  const dailyNeeded = (goalKg * KCAL_PER_KG) / DAYS_PER_MONTH;
  const weeklyExerciseKcal = Math.max(0, (dailyNeeded - dietDaily) * 7);

  const strengthMinutes = sessionDays.reduce(
    (sum, d) => sum + estimateSessionMinutes(d).strength, 0
  );
  const bikeNeeded = Math.max(0, weeklyExerciseKcal - strengthMinutes * strengthRate) / bikeRate;

  // Minutes de la séance de vélo, arrondies à 5 min ; au-delà de 60 min, le
  // reste se fait en vélo libre les jours de repos.
  const perSessionRaw = sessions ? bikeNeeded / sessions : 0;
  const perSession = sessions
    ? Math.min(MAX_BIKE_PER_SESSION, Math.max(MIN_BIKE_PER_SESSION, ceil5(perSessionRaw)))
    : 0;
  const extraBike = ceil5(Math.max(0, bikeNeeded - perSession * sessions));
  const bikeMinutes = perSession * sessions + extraBike;

  const weeklyKcal = dietDaily * 7 + bikeMinutes * bikeRate + strengthMinutes * strengthRate;
  const projectedKgPerMonth = (weeklyKcal / 7) * DAYS_PER_MONTH / KCAL_PER_KG;

  return {
    goalKg,
    weightKg,
    sessions,
    restDays,
    dietDaily: Math.round(dietDaily),
    bikeMinutes,
    strengthMinutes,
    totalMinutes: bikeMinutes + strengthMinutes,
    bikePerSession: perSession,
    extraBike,
    extraPerRestDay: restDays ? ceil5(extraBike / restDays) : extraBike,
    projectedKgPerMonth,
  };
}

// ── Minutes réalisées ────────────────────────────────────────────────

export function startOfWeek(d = new Date()) {
  const out = new Date(d);
  out.setHours(0, 0, 0, 0);
  out.setDate(out.getDate() - ((out.getDay() + 6) % 7));
  return out;
}

/**
 * Minutes réalisées depuis lundi : séances de musculation + séances cardio
 * (check-list du jour, saisie manuelle, import Google Fit).
 */
export function getWeekProgress(now = new Date()) {
  const weekStart = startOfWeek(now);
  const inWeek = (iso) => {
    const date = new Date(iso);
    return date >= weekStart && date <= now;
  };

  let bikeMinutes = 0;
  let strengthMinutes = 0;
  let walkMinutes = 0;
  let sessions = 0;

  getWorkoutHistory().filter((w) => inWeek(w.date)).forEach((w) => {
    strengthMinutes += Number(w.duration) || 0;
    sessions += 1;
  });

  getCardioSessions().filter((s) => inWeek(s.date)).forEach((s) => {
    const minutes = Number(s.duration) || 0;
    if (s.type === 'bike') bikeMinutes += minutes;
    else walkMinutes += minutes;
  });

  return { bikeMinutes, strengthMinutes, walkMinutes, sessions };
}
