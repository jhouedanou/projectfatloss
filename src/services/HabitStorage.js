/**
 * Suivi des habitudes quotidiennes (habit tracker de la page d'accueil).
 *
 * Stockage localStorage :
 *  - `habit_log` : { 'YYYY-MM-DD': { [habitId]: true } } — seules les cases
 *    cochées sont stockées, décocher supprime la clé.
 *
 * L'habitude « Séance » n'est pas stockée ici : elle est dérivée de
 * l'historique d'entraînement (workout_history) par le composant.
 */

const LOG_KEY = 'habit_log';

/** Habitudes suivies (fixes — la séance est dérivée de l'historique). */
export const HABITS = [
  { id: 'water', icon: '💧', color: '#38BDF8', labelKey: 'home.habits.water', labelFr: 'Hydratation' },
  { id: 'sleep', icon: '😴', color: '#A78BFA', labelKey: 'home.habits.sleep', labelFr: 'Sommeil 7 h+' },
  { id: 'nutrition', icon: '🥗', color: '#30d158', labelKey: 'home.habits.nutrition', labelFr: 'Nutrition' },
  { id: 'walk', icon: '🚶', color: '#FBBF24', labelKey: 'home.habits.walk', labelFr: 'Marche' },
  { id: 'stretch', icon: '🧘', color: '#F472B6', labelKey: 'home.habits.stretch', labelFr: 'Étirements' },
];

export function dateKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function getHabitLog() {
  try {
    return JSON.parse(localStorage.getItem(LOG_KEY)) || {};
  } catch {
    return {};
  }
}

export function isHabitDone(log, date, habitId) {
  return Boolean(log?.[dateKey(date)]?.[habitId]);
}

/** Inverse une case et renvoie le journal mis à jour. */
export function toggleHabit(date, habitId) {
  const log = getHabitLog();
  const key = dateKey(date);
  const day = { ...(log[key] || {}) };
  if (day[habitId]) {
    delete day[habitId];
  } else {
    day[habitId] = true;
  }
  if (Object.keys(day).length) {
    log[key] = day;
  } else {
    delete log[key];
  }
  localStorage.setItem(LOG_KEY, JSON.stringify(log));
  return log;
}
