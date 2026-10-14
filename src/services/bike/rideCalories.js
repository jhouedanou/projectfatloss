/**
 * Calories d'une sortie vélo — fonctions pures, testables en node.
 *
 * Priorité au compteur du vélo (console Domyos EB900, « Total Energy » FTMS) :
 * c'est le chiffre que l'utilisateur voit sur l'écran du vélo. On compte
 * l'écart depuis le début de la sortie, pas la valeur brute — la console peut
 * afficher les calories d'une séance précédente au moment de la connexion.
 *
 * L'estimation (puissance, sinon MET × poids) tourne toujours en parallèle :
 * elle prend le relais si le vélo n'a pas de compteur, ou si son compteur reste
 * bloqué à zéro alors qu'on pédale depuis deux minutes.
 */

/** MET vélo stationnaire vigoureux, utilisé quand la puissance est inconnue. */
const BIKE_MET = 7.0;
/** Délai avant de juger muet un compteur resté à zéro. */
export const DEVICE_GRACE_SEC = 120;
/** Saut maximal crédible du compteur entre deux ticks d'une seconde. */
const MAX_DEVICE_STEP_KCAL = 20;
/** Estimation minimale pour conclure que le compteur ne compte pas. */
const SILENT_MIN_ESTIMATE_KCAL = 5;

export function createCalorieState() {
  return {
    elapsedSec: 0,
    deviceKcal: 0,
    devicePrev: null,
    deviceSeen: false,
    estimateKcal: 0,
    powerSeen: false,
  };
}

/**
 * Avance d'un tick. Modifie `state` et renvoie les calories à afficher.
 * @param {Object} state createCalorieState()
 * @param {Object} sample { kcalTotal, watts, speedKmh, weightKg }
 * @param {number} [dtSec]
 * @returns {{ calories: number, source: 'device'|'power'|'estimate' }}
 */
export function stepCalories(state, { kcalTotal = null, watts = null, speedKmh = 0, weightKg = 70 }, dtSec = 1) {
  state.elapsedSec += dtSec;

  if (watts != null) {
    state.powerSeen = true;
    state.estimateKcal += (Math.max(0, watts) * 3.6 * dtSec) / 3600;
  } else if (speedKmh > 1) {
    state.estimateKcal += ((BIKE_MET * 3.5 * weightKg) / 200 / 60) * dtSec;
  }

  if (kcalTotal != null && Number.isFinite(kcalTotal)) {
    if (state.devicePrev != null) {
      const delta = kcalTotal - state.devicePrev;
      if (delta >= 0 && delta <= MAX_DEVICE_STEP_KCAL) {
        state.deviceKcal += delta;
      } else if (delta < 0 && kcalTotal <= MAX_DEVICE_STEP_KCAL) {
        // Compteur remis à zéro sur la console (bouton stop / reset) : il
        // repart de 0, ce qu'il affiche maintenant est déjà acquis.
        state.deviceKcal += kcalTotal;
      }
      // Autre saut : trame corrompue ou reconnexion, ignoré.
    }
    state.devicePrev = kcalTotal;
    state.deviceSeen = true;
  }

  const deviceSilent =
    state.deviceKcal === 0 &&
    state.elapsedSec >= DEVICE_GRACE_SEC &&
    state.estimateKcal >= SILENT_MIN_ESTIMATE_KCAL;

  if (state.deviceSeen && !deviceSilent) return { calories: state.deviceKcal, source: 'device' };
  return { calories: state.estimateKcal, source: state.powerSeen ? 'power' : 'estimate' };
}
