/**
 * Données d'activité du tableau de bord, gardées dans le localStorage.
 *
 *   fit_days     : { 'AAAA-MM-JJ': { steps, activeKcal, totalKcal, distanceM } }
 *   fit_sessions : [{ id, kind, label, title, app, startMs, endMs, minutes, kcal, km, source }]
 *   fit_meta     : { lastSyncAt, source }
 *   fit_goal_kg  : poids visé
 *
 * Elles viennent de Health Connect (APK) ou de Google Fit (site) : FitSync.js.
 *
 * L'ancienne application enregistrait aussi des séances (musculation guidée,
 * vélo coché ou importé) et des pas. Ces anciens enregistrements restent lus
 * ici, sans être modifiés, pour que l'historique ne disparaisse pas.
 */

import { dayKey } from './FitMetrics';

const DAYS_KEY = 'fit_days';
const SESSIONS_KEY = 'fit_sessions';
const META_KEY = 'fit_meta';
const GOAL_KEY = 'fit_goal_kg';

// Anciennes clés (lecture seule).
const LEGACY_STEPS_KEY = 'daily_steps';
const LEGACY_WORKOUTS_KEY = 'workout_history';
const LEGACY_CARDIO_KEY = 'cardio_sessions_data';

const DAY_FIELDS = ['steps', 'activeKcal', 'totalKcal', 'distanceM'];
// Deux séances de la même famille qui finissent à moins de 5 min d'écart : la même séance.
const SAME_SESSION_MS = 5 * 60 * 1000;

function read(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

// ── Jours ────────────────────────────────────────────────────────────

/** Totaux par jour, complétés par les pas de l'ancienne application. */
export function getFitDays() {
  const days = { ...read(DAYS_KEY, {}) };
  const legacySteps = read(LEGACY_STEPS_KEY, {});
  for (const [day, steps] of Object.entries(legacySteps)) {
    if (!Number.isFinite(steps)) continue;
    if (days[day]?.steps == null) days[day] = { ...days[day], steps };
  }
  return days;
}

/** Jours enregistrés par la nouvelle synchro seulement (pour l'envoi au compte). */
export const getStoredFitDays = () => read(DAYS_KEY, {});

/**
 * Fusionne des totaux par jour. Pour un même jour, la plus grande valeur de
 * chaque mesure est gardée : le total d'un jour ne fait que grandir.
 */
export function mergeFitDays(incoming) {
  const days = read(DAYS_KEY, {});
  for (const [day, values] of Object.entries(incoming || {})) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || !values) continue;
    const current = days[day] || {};
    for (const field of DAY_FIELDS) {
      const value = Number(values[field]);
      if (!Number.isFinite(value) || value < 0 || values[field] == null) continue;
      current[field] = Math.max(Number(current[field]) || 0, Math.round(value));
    }
    if (Object.keys(current).length) days[day] = current;
  }
  write(DAYS_KEY, days);
  return days;
}

// ── Séances ──────────────────────────────────────────────────────────

/** Séances enregistrées par la nouvelle synchro seulement. */
export const getStoredFitSessions = () => read(SESSIONS_KEY, []);

/** Ajoute ou remplace des séances (par id). */
export function mergeFitSessions(incoming) {
  const map = new Map(read(SESSIONS_KEY, []).map((s) => [String(s.id), s]));
  for (const s of incoming || []) {
    if (!s || s.id == null || !(Number(s.endMs) > Number(s.startMs))) continue;
    map.set(String(s.id), s);
  }
  const sessions = [...map.values()].sort((a, b) => b.startMs - a.startMs);
  write(SESSIONS_KEY, sessions);
  return sessions;
}

const isChecklistNote = (notes) => {
  try {
    return JSON.parse(notes || '{}').source === 'checklist';
  } catch {
    return false;
  }
};

const noteName = (notes) => {
  try {
    return JSON.parse(notes || '{}').name || '';
  } catch {
    return '';
  }
};

/** « JOUR 2: HAUT DU CORPS A (poussée) — Mardi · S1 » → « Haut du corps A (poussée) ». */
function workoutTitle(title) {
  const name = String(title || '').replace(/^JOUR\s*\d+\s*:\s*/i, '').replace(/\s*—.*$/, '').trim();
  if (!name) return 'Musculation';
  const lower = name.toLowerCase().replace(/(^|\s)([ab])(?=\s|$)/g, (m, space, letter) => space + letter.toUpperCase());
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

/** Séances de musculation guidée de l'ancienne application. */
function legacyWorkouts() {
  return read(LEGACY_WORKOUTS_KEY, []).flatMap((w) => {
    const endMs = new Date(w?.date).getTime();
    const minutes = Number(w?.duration) > 0 ? Number(w.duration) : 45;
    if (Number.isNaN(endMs)) return [];
    return [{
      id: `w-${w.id}`,
      kind: 'strength',
      label: 'Musculation',
      title: workoutTitle(w.title),
      app: 'Project Fat Loss',
      startMs: endMs - minutes * 60000,
      endMs,
      minutes: Math.round(minutes),
      kcal: Number(w.calories) > 0 ? Math.round(Number(w.calories)) : null,
      km: null,
      source: 'legacy',
    }];
  });
}

/** Séances de vélo et de marche de l'ancienne application. */
function legacyCardio() {
  return read(LEGACY_CARDIO_KEY, []).flatMap((s) => {
    const endMs = new Date(s?.date).getTime();
    const minutes = Number(s?.duration);
    if (Number.isNaN(endMs) || !(minutes > 0)) return [];
    const kind = s.type === 'bike' ? 'bike' : 'walk';
    return [{
      id: `c-${s.id}`,
      kind,
      label: kind === 'bike' ? 'Vélo' : 'Marche',
      title: noteName(s.notes) || (kind === 'bike' ? 'Vélo' : 'Marche'),
      app: 'Project Fat Loss',
      startMs: endMs - minutes * 60000,
      endMs,
      minutes: Math.round(minutes),
      kcal: Number(s.calories) > 0 ? Math.round(Number(s.calories)) : null,
      km: Number(s.distance) > 0 ? Number(s.distance) : null,
      source: 'legacy',
      // Case « vélo » cochée à la main : remplacée par une vraie séance du même jour.
      manual: isChecklistNote(s.notes),
    }];
  });
}

/**
 * Réunit les séances importées et les anciennes, sans doublon :
 *   - une séance importée qui finit à moins de 5 min d'une ancienne séance de
 *     la même famille est la même séance : l'ancienne est gardée ;
 *   - une case « vélo » cochée à la main disparaît s'il existe une vraie
 *     séance de vélo le même jour.
 * @returns {Array} séances, la plus récente d'abord
 */
export function mergeSessions(imported, legacy) {
  const out = [...legacy];
  for (const s of imported) {
    const duplicate = legacy.some((l) => l.kind === s.kind && Math.abs(l.endMs - s.endMs) <= SAME_SESSION_MS);
    if (!duplicate) out.push(s);
  }
  const realBikeDays = new Set(out.filter((s) => s.kind === 'bike' && !s.manual).map((s) => dayKey(new Date(s.startMs))));
  return out
    .filter((s) => !(s.manual && realBikeDays.has(dayKey(new Date(s.endMs)))))
    .sort((a, b) => b.startMs - a.startMs);
}

/** Toutes les séances connues (importées + anciennes), la plus récente d'abord. */
export function getAllSessions() {
  return mergeSessions(getStoredFitSessions(), [...legacyWorkouts(), ...legacyCardio()]);
}

// ── Dernière synchro et objectif ─────────────────────────────────────

export const getFitMeta = () => read(META_KEY, {});

export function setFitMeta(meta) {
  write(META_KEY, { ...getFitMeta(), ...meta });
}

/** Poids visé en kg, ou null. */
export function getGoalKg() {
  const value = Number(read(GOAL_KEY, null));
  return value >= 30 && value <= 300 ? value : null;
}

export function setGoalKg(kg) {
  const value = Number(kg);
  if (value >= 30 && value <= 300) return write(GOAL_KEY, Math.round(value * 10) / 10);
  try {
    localStorage.removeItem(GOAL_KEY);
    return true;
  } catch {
    return false;
  }
}
