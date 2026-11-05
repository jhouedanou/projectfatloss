/**
 * Parties d'une séance de musculation, pour Google Fit et Health Connect.
 *
 * Google Fit calcule les points cardio d'après le type d'activité : 1 point par
 * minute d'effort modéré (3 à 5,9 MET, comme la musculation), 2 points par
 * minute d'effort intense (6 MET et plus, comme un circuit enchaîné). On
 * envoie donc chaque partie avec son vrai type :
 *   - le circuit du mercredi est un circuit d'un bout à l'autre ;
 *   - ailleurs, seul le finisher (thrusters, complexe aux haltères, MET 8
 *     dans CalorieEstimator), en fin de séance, est un circuit ;
 *   - le reste est de la musculation.
 */

// Exercices du finisher (scripts/gen-plan.mjs).
const FINISHER_RE = /thruster|complexe/i;
// Durée d'une série avec sa récupération : même hypothèse que CalorieEstimator.
const SET_MINUTES = 1.5;
// Le finisher ne dépasse jamais la moitié de la séance enregistrée.
const MAX_FINISHER_SHARE = 0.5;
// En dessous d'une minute, une partie à part ne vaut pas la peine.
const MIN_PART_MS = 60 * 1000;

/** Circuit du mercredi (« CIRCUIT CORPS ENTIER ») ? */
export function isCircuitWorkout(workout) {
  return /CIRCUIT/i.test(workout?.title || '');
}

/**
 * Découpe une séance terminée en parties consécutives.
 * @param {Object} workout - séance enregistrée ({ title, exercises: [{ name, sets }] })
 * @param {number} durationMs - durée réelle de la séance
 * @returns {Array<{ kind: 'strength'|'circuit', startOffsetMs: number, endOffsetMs: number }>}
 */
export function workoutParts(workout, durationMs) {
  if (isCircuitWorkout(workout)) {
    return [{ kind: 'circuit', startOffsetMs: 0, endOffsetMs: durationMs }];
  }
  const finisherSets = (workout?.exercises || [])
    .filter((exercise) => FINISHER_RE.test(exercise?.name || ''))
    .reduce((total, exercise) => total + (Number(exercise.sets) || 0), 0);
  const finisherMs = Math.round(Math.min(finisherSets * SET_MINUTES * 60 * 1000, durationMs * MAX_FINISHER_SHARE));
  if (finisherMs < MIN_PART_MS) {
    return [{ kind: 'strength', startOffsetMs: 0, endOffsetMs: durationMs }];
  }
  const split = durationMs - finisherMs;
  return [
    { kind: 'strength', startOffsetMs: 0, endOffsetMs: split },
    { kind: 'circuit', startOffsetMs: split, endOffsetMs: durationMs },
  ];
}
