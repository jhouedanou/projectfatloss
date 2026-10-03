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
 * Les minutes de vélo du programme (blocs « autoDuration ») sont recalculées
 * à partir de ces cibles : elles suivent l'objectif choisi et le poids actuel.
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

// Vélo par séance : 20 min minimum (accent sur le vélo), 2 blocs de 20 min
// maximum (jamais plus de 20 min d'affilée sur la selle).
const MIN_BIKE_PER_SESSION = 20;
const MAX_BIKE_BLOCK_MIN = 20;
const MAX_BIKE_PER_SESSION = 2 * MAX_BIKE_BLOCK_MIN;

// Noms figés des blocs de vélo générés par scripts/gen-plan.mjs.
export const BIKE_WARMUP_NAME = 'Vélo — échauffement';
export const BIKE_MAIN_NAME = 'Vélo (cardio fin de séance)';

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

/** Répartit les minutes de vélo d'une séance entre échauffement et bloc final. */
function splitBike(perSession) {
  const main = Math.min(MAX_BIKE_BLOCK_MIN, ceil5(perSession / 2));
  const warmup = Math.min(MAX_BIKE_BLOCK_MIN, Math.max(5, perSession - main));
  return { warmup, main };
}

/**
 * Cibles d'une semaine du programme (7 jours) pour l'objectif choisi.
 * @param {Array} weekDays jours de la semaine (plan complet, vélo compris)
 */
export function computeWeekTargets(weekDays, { goalKg = getMonthlyGoalKg(), weightKg = getUserWeight() } = {}) {
  const sessionDays = (weekDays || []).filter((d) => d && !d.isRestDay);
  const sessions = sessionDays.length;

  const bikeRate = netKcalPerMin(BIKE_MET, weightKg);
  const strengthRate = netKcalPerMin(STRENGTH_MET, weightKg);
  const dietDaily = getDietDeficitKcal();
  const dailyNeeded = (goalKg * KCAL_PER_KG) / DAYS_PER_MONTH;
  const weeklyExerciseKcal = Math.max(0, (dailyNeeded - dietDaily) * 7);

  const strengthMinutes = sessionDays.reduce(
    (sum, d) => sum + estimateSessionMinutes(d).strength, 0
  );
  const bikeNeeded = Math.max(0, weeklyExerciseKcal - strengthMinutes * strengthRate) / bikeRate;

  // Minutes par séance arrondies à 5 min ; au-delà de 2 × 20 min, le reste
  // se fait en sortie libre (onglet Cardio, n'importe quel jour).
  const perSessionRaw = sessions ? bikeNeeded / sessions : 0;
  const perSession = sessions
    ? Math.min(MAX_BIKE_PER_SESSION, Math.max(MIN_BIKE_PER_SESSION, ceil5(perSessionRaw)))
    : 0;
  const extraBike = ceil5(Math.max(0, bikeNeeded - perSession * sessions));
  const { warmup, main } = perSession ? splitBike(perSession) : { warmup: 0, main: 0 };
  const bikeMinutes = (warmup + main) * sessions + extraBike;

  const weeklyKcal = dietDaily * 7 + bikeMinutes * bikeRate + strengthMinutes * strengthRate;
  const projectedKgPerMonth = (weeklyKcal / 7) * DAYS_PER_MONTH / KCAL_PER_KG;

  return {
    goalKg,
    weightKg,
    sessions,
    dietDaily: Math.round(dietDaily),
    bikeMinutes,
    strengthMinutes,
    totalMinutes: bikeMinutes + strengthMinutes,
    bikePerSession: warmup + main,
    warmup,
    main,
    extraBike,
    projectedKgPerMonth,
  };
}

/**
 * Applique les durées de vélo calculées aux blocs « autoDuration » du plan
 * (semaine par semaine : la muscu allégée de S4 demande un peu plus de vélo).
 * Ne modifie pas le plan reçu.
 */
export function applyDurationTargets(plan, options) {
  if (!Array.isArray(plan)) return plan;
  const targetsByWeek = new Map();
  return plan.map((day, index) => {
    if (!day || day.isRestDay) return day;
    const exercises = day.exercises || [];
    if (!exercises.some((e) => e?.autoDuration && isBikeExercise(e))) return day;

    const week = Math.floor(index / 7);
    if (!targetsByWeek.has(week)) {
      targetsByWeek.set(week, computeWeekTargets(plan.slice(week * 7, week * 7 + 7), options));
    }
    const { warmup, main } = targetsByWeek.get(week);

    return {
      ...day,
      exercises: exercises.map((exercise) => {
        if (!exercise?.autoDuration || !isBikeExercise(exercise)) return exercise;
        const minutes = exercise.name === BIKE_WARMUP_NAME ? warmup : main;
        return {
          ...exercise,
          duration: minutes * 60,
          sets: `${minutes} min (allure modérée)`,
        };
      }),
    };
  });
}

// ── Minutes réalisées ────────────────────────────────────────────────

export function startOfWeek(d = new Date()) {
  const out = new Date(d);
  out.setHours(0, 0, 0, 0);
  out.setDate(out.getDate() - ((out.getDay() + 6) % 7));
  return out;
}

/** Minutes de vélo faites pendant une séance (blocs de vélo du programme). */
export function bikeMinutesOfWorkout(workout) {
  const planned = (workout?.exercises || [])
    .filter((e) => isBikeExercise(e))
    .reduce((sum, e) => sum + (Number(e.durationMin) || 0), 0);
  // Jamais plus que la durée réelle de la séance (bloc passé rapidement).
  return Math.min(planned, Number(workout?.duration) || 0);
}

/**
 * Minutes réalisées depuis lundi : séances du programme + séances cardio
 * (vélo connecté, saisie manuelle, import Google Fit).
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
    const bike = bikeMinutesOfWorkout(w);
    bikeMinutes += bike;
    strengthMinutes += Math.max(0, (Number(w.duration) || 0) - bike);
    sessions += 1;
  });

  getCardioSessions().filter((s) => inWeek(s.date)).forEach((s) => {
    const minutes = Number(s.duration) || 0;
    if (s.type === 'bike') bikeMinutes += minutes;
    else walkMinutes += minutes;
  });

  return { bikeMinutes, strengthMinutes, walkMinutes, sessions };
}
