/**
 * Objectif de perte de poids exprimé en DURÉES de séance.
 *
 * Principe : 1 kg de graisse ≈ 7 700 kcal. Perdre 3 à 4 kg par mois demande
 * donc un déficit de ~760 à ~1 010 kcal par jour. Une partie vient de
 * l'assiette (objectif calorique de NutritionGoals), le reste vient du sport :
 * 20 min de vélo chaque jour et une séance de musculation chaque jour.
 * Le vélo est fixe : l'objectif choisi (3 à 4 kg) dit seulement ce qu'il faut
 * encore retirer de l'assiette si le plan n'y suffit pas.
 *
 * Seules les calories EN PLUS du repos sont comptées (MET − 1) : le TDEE
 * contient déjà la dépense de repos, il ne faut pas la compter deux fois.
 *
 * MET (Compendium of Physical Activities 2011) :
 *   - vélo d'appartement 90-100 W, effort modéré : 6.8
 *   - musculation légère à modérée, plusieurs exercices : 3.5
 *
 * Le vélo ne fait pas partie de la séance guidée : ses minutes figurent dans
 * la check-list du jour de l'accueil (une séance de 20 min par jour).
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

// Vélo : 20 min chaque jour du programme, jours sans musculation compris.
export const BIKE_MINUTES_PER_DAY = 20;

// MET du vélo pour estimer les calories d'un bloc coché (comme CalorieEstimator).
const BIKE_LOG_MET = 7.0;

// Modèle de repos de StepWorkout.jsx (15 s + 5 s par série faite, plafond
// 40 s ; 45 s entre deux exercices) — même modèle que scripts/gen-plan.mjs.
const SET_PAUSE_BASE = 15;
const SET_PAUSE_INCREMENT = 5;
const SET_PAUSE_MAX = 40;
const EXERCISE_PAUSE = 45;

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
 * @param {Array} weekDays jours de la semaine (plan complet)
 */
export function computeWeekTargets(weekDays, { goalKg = getMonthlyGoalKg(), weightKg = getUserWeight() } = {}) {
  const days = (weekDays || []).filter(Boolean);
  const sessionDays = days.filter((d) => !d.isRestDay);
  const sessions = sessionDays.length;
  const restDays = days.length - sessions;

  const bikeRate = netKcalPerMin(BIKE_MET, weightKg);
  const strengthRate = netKcalPerMin(STRENGTH_MET, weightKg);
  const dietDaily = getDietDeficitKcal();
  const dailyNeeded = (goalKg * KCAL_PER_KG) / DAYS_PER_MONTH;

  const strengthMinutes = sessionDays.reduce(
    (sum, d) => sum + estimateSessionMinutes(d).strength, 0
  );
  const bikeMinutes = BIKE_MINUTES_PER_DAY * days.length;

  const weeklyKcal = dietDaily * 7 + bikeMinutes * bikeRate + strengthMinutes * strengthRate;
  const projectedKgPerMonth = (weeklyKcal / 7) * DAYS_PER_MONTH / KCAL_PER_KG;
  // Ce que l'assiette doit encore retirer chaque jour pour atteindre l'objectif.
  const missingKcalPerDay = Math.max(0, Math.round(dailyNeeded - weeklyKcal / 7));

  return {
    goalKg,
    weightKg,
    sessions,
    restDays,
    dietDaily: Math.round(dietDaily),
    bikeMinutes,
    strengthMinutes,
    totalMinutes: bikeMinutes + strengthMinutes,
    bikePerSession: BIKE_MINUTES_PER_DAY,
    projectedKgPerMonth,
    missingKcalPerDay,
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
