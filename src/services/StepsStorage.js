/**
 * Pas quotidiens (importés de Google Fit) — stockage local.
 *
 * `daily_steps` : { 'YYYY-MM-DD': nombre de pas } (date locale). Un nouvel
 * import remplace la valeur d'un jour : le total du jour en cours grandit au
 * fil des imports.
 */

import { dateKey } from './HabitStorage';

const STEPS_KEY = 'daily_steps';

export function getDailySteps() {
  try {
    return JSON.parse(localStorage.getItem(STEPS_KEY)) || {};
  } catch {
    return {};
  }
}

/** Pas d'une date (Date), null si aucune donnée. */
export function getStepsForDate(date = new Date()) {
  const value = getDailySteps()[dateKey(date)];
  return Number.isFinite(value) ? value : null;
}

/**
 * Enregistre des totaux journaliers.
 * @param {Object} byDay - { 'YYYY-MM-DD': pas }
 */
export function saveDailySteps(byDay) {
  const merged = { ...getDailySteps() };
  Object.entries(byDay).forEach(([day, steps]) => {
    if (Number.isFinite(steps) && steps >= 0) merged[day] = Math.round(steps);
  });
  localStorage.setItem(STEPS_KEY, JSON.stringify(merged));
  return merged;
}

/**
 * Résumé des `days` derniers jours (aujourd'hui compris).
 * @returns {{ today: number|null, average: number|null, days: Array<{ key: string, date: Date, steps: number|null }> }}
 */
export function getStepsSummary(days = 7, now = new Date()) {
  const all = getDailySteps();
  const list = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const date = new Date(now);
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() - i);
    const key = dateKey(date);
    list.push({ key, date, steps: Number.isFinite(all[key]) ? all[key] : null });
  }
  const known = list.filter((d) => d.steps != null);
  return {
    today: list[list.length - 1].steps,
    average: known.length ? Math.round(known.reduce((sum, d) => sum + d.steps, 0) / known.length) : null,
    days: list,
  };
}
