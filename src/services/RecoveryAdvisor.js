/**
 * Recommandation du prochain créneau d'entraînement (date + heure) à partir
 * d'un temps de récupération estimé depuis la dernière séance enregistrée.
 *
 * Modèle (volontairement simple et explicable) :
 *  - base 22 h : le programme est un split 7 j/7, l'enchaînement quotidien est
 *    la norme tant que les groupes musculaires diffèrent d'un jour à l'autre ;
 *  - + jusqu'à 26 h selon le RECOUVREMENT MUSCULAIRE (pondéré par le volume)
 *    entre la dernière séance et la prochaine, sur une courbe cubique : le
 *    recouvrement résiduel normal d'un split (~25-40 %, tirages/poussées qui
 *    partagent épaules ou lombaires) ne pèse presque rien, tandis que répéter
 *    les mêmes muscles tend vers ~48 h, la fourchette classique ;
 *  - + jusqu'à 6 h si la dernière séance était nettement plus longue que
 *    l'habitude (charge inhabituelle → un peu plus de repos) ;
 *  - l'heure proposée est calée sur l'HEURE HABITUELLE d'entraînement
 *    (médiane des heures de début des dernières séances) : premier créneau à
 *    cette heure après la fin de récupération, avec 3 h de tolérance — si la
 *    récupération se termine peu après l'heure habituelle, on propose le jour
 *    même un peu plus tard plutôt que de glisser au lendemain.
 *
 * Les groupes musculaires viennent de `googleFitActivity.muscleGroups` dans le
 * plan ; la fin de séance est la date d'enregistrement (`workout.date`) et le
 * début est retrouvé via `workout.duration` (minutes).
 */

const BASE_RECOVERY_H = 22;
const OVERLAP_EXTRA_MAX_H = 26;
const INTENSITY_EXTRA_MAX_H = 6;
const DEFAULT_START_HOUR = 18;
const HISTORY_WINDOW = 14;
const SLOT_TOLERANCE_H = 3;

const HOUR_MS = 3600 * 1000;

function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

function median(values) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/** « JOUR 4: PUSH B (…) — S1 » → « J4 · PUSH B » (même règle que la montre). */
export function shortDayTitle(title) {
  const m = /JOUR\s*(\d+)\s*:\s*([^(—]+)/.exec(title || '');
  return m ? `J${m[1]} · ${m[2].trim()}` : (title || '');
}

function setsOfExercise(ex) {
  if (typeof ex?.totalSets === 'number' && ex.totalSets > 0) return ex.totalSets;
  const m = /(\d+)\s*[x×]/i.exec(ex?.sets || '');
  return m ? parseInt(m[1], 10) : 1;
}

/**
 * Poids relatif de chaque groupe musculaire dans un jour du plan : part des
 * séries de la journée qui le sollicitent. Pondérer par le volume évite que
 * les accessoires (vélo de fin de séance, gainage) fassent croire qu'un jour
 * PULL et un jour LEGS travaillent les mêmes muscles.
 * @returns {Map<string, number>} groupe → poids (somme ≈ 1 par « slot » de groupe)
 */
export function muscleGroupsOfDay(day) {
  const weights = new Map();
  let totalSets = 0;
  for (const ex of day?.exercises || []) {
    const sets = setsOfExercise(ex);
    totalSets += sets;
    for (const g of ex?.googleFitActivity?.muscleGroups || []) {
      weights.set(g, (weights.get(g) || 0) + sets);
    }
  }
  if (totalSets > 0) {
    for (const [g, w] of weights) {
      weights.set(g, w / totalSets);
    }
  }
  return weights;
}

/**
 * Recouvrement de volume entre la dernière séance et la prochaine :
 * Σ min(poids_dernière, poids_prochaine) par groupe, normalisé par le volume
 * de la prochaine (0 = split parfait, 1 = mêmes muscles aux mêmes volumes).
 */
export function muscleOverlap(prevDay, nextDay) {
  const prev = muscleGroupsOfDay(prevDay);
  const next = muscleGroupsOfDay(nextDay);
  if (!prev.size || !next.size) return 0;
  let shared = 0;
  let nextTotal = 0;
  for (const [g, w] of next) {
    nextTotal += w;
    shared += Math.min(prev.get(g) || 0, w);
  }
  return nextTotal > 0 ? clamp(shared / nextTotal, 0, 1) : 0;
}

/** Heure habituelle de début de séance (médiane), sinon 18 h. */
export function usualStartHour(entries) {
  const hours = entries
    .slice(0, HISTORY_WINDOW)
    .map((w) => {
      const end = new Date(w.date);
      if (Number.isNaN(end.getTime())) return null;
      const startMs = end.getTime() - (w.duration > 0 ? w.duration : 0) * 60 * 1000;
      return new Date(startMs).getHours();
    })
    .filter((h) => h != null);
  const med = median(hours);
  return med == null ? DEFAULT_START_HOUR : Math.round(med);
}

/**
 * Calcule la recommandation.
 * @param {Object} p
 * @param {Array}  p.history          Historique WorkoutStorage (le plus récent d'abord ou non).
 * @param {Array}  p.plan             Plan effectif (jours, avec exercises + isRestDay).
 * @param {number} [p.currentDayIndex] Jour courant (repli si la dernière séance est introuvable dans le plan).
 * @param {Date}   [p.now]
 * @returns {null|Object} null sans plan ; sinon { firstSession, recommended, … }.
 */
export function recommendNextSession({ history = [], plan = [], currentDayIndex = 0, now = new Date() }) {
  if (!plan.length) return null;

  const entries = history
    .filter((w) => w && w.date && !Number.isNaN(new Date(w.date).getTime()))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  if (!entries.length) {
    const recommended = new Date(now);
    recommended.setHours(DEFAULT_START_HOUR, 0, 0, 0);
    if (recommended < now) recommended.setTime(now.getTime());
    return { firstSession: true, ready: true, recommended, usualHour: DEFAULT_START_HOUR };
  }

  const last = entries[0];
  const lastEnd = new Date(last.date);
  const lastIdx = plan.findIndex((d) => d.title === last.title);

  // Prochaine séance du programme (les jours de repos ne se planifient pas).
  let nextIdx = lastIdx >= 0 ? (lastIdx + 1) % plan.length : clamp(currentDayIndex, 0, plan.length - 1);
  let guard = 0;
  while (plan[nextIdx]?.isRestDay && guard++ < plan.length) {
    nextIdx = (nextIdx + 1) % plan.length;
  }

  const overlap = lastIdx >= 0 ? muscleOverlap(plan[lastIdx], plan[nextIdx]) : 0;

  // Charge inhabituelle : durée de la dernière séance vs médiane récente.
  const durations = entries
    .slice(0, HISTORY_WINDOW)
    .map((w) => w.duration)
    .filter((d) => typeof d === 'number' && d > 0);
  const medDuration = median(durations);
  const ratio = medDuration && last.duration > 0 ? last.duration / medDuration : 1;
  const intensityExtra = clamp((ratio - 1) * 12, 0, INTENSITY_EXTRA_MAX_H);

  // Courbe cubique : 30 % → +0,7 h, 60 % → +5,6 h, 100 % → +26 h.
  const recoveryHours = BASE_RECOVERY_H + OVERLAP_EXTRA_MAX_H * overlap ** 3 + intensityExtra;
  const earliest = new Date(lastEnd.getTime() + recoveryHours * HOUR_MS);

  const usualHour = usualStartHour(entries);
  const recommended = new Date(earliest);
  recommended.setHours(usualHour, 0, 0, 0);
  if (recommended < earliest) {
    if (earliest - recommended <= SLOT_TOLERANCE_H * HOUR_MS) {
      // Fin de récupération peu après l'heure habituelle : le jour même,
      // au quart d'heure suivant la fin de récupération.
      recommended.setTime(Math.ceil(earliest.getTime() / (15 * 60000)) * 15 * 60000);
    } else {
      recommended.setDate(recommended.getDate() + 1);
    }
  }

  const progress = clamp((now - lastEnd) / (earliest - lastEnd || 1), 0, 1);

  return {
    firstSession: false,
    lastEnd,
    lastTitle: last.title,
    recoveryHours: Math.round(recoveryHours),
    overlap,
    earliest,
    recommended,
    ready: now >= earliest,
    progress,
    usualHour,
    nextDay: { index: nextIdx, title: plan[nextIdx]?.title || '' },
  };
}
