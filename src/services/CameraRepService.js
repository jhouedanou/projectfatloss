/**
 * Réglage global : comptage des répétitions par la caméra (webcam + pose).
 * Désactivé par défaut (nécessite l'autorisation caméra et de la ressource).
 * Mémorisé dans le localStorage, comme SpeechService.
 */

const CAMERA_REP_ENABLED_KEY = 'camera_rep_enabled';

/** @returns {boolean} false par défaut si aucun réglage enregistré. */
export function isCameraRepEnabled() {
  try {
    return localStorage.getItem(CAMERA_REP_ENABLED_KEY) === 'true';
  } catch (e) {
    return false;
  }
}

/** Active/désactive le comptage caméra et mémorise le choix. */
export function setCameraRepEnabled(enabled) {
  try {
    localStorage.setItem(CAMERA_REP_ENABLED_KEY, String(!!enabled));
  } catch (e) {}
  return !!enabled;
}

/**
 * Amplitude du mouvement attendue pour valider une rep (squats partiels…).
 * 'full' = amplitude complète, 'partial' = réduite, 'mini' = très réduite.
 */
const CAMERA_REP_AMPLITUDE_KEY = 'camera_rep_amplitude';

export const AMPLITUDE_LEVELS = ['full', 'partial', 'mini'];

export const AMPLITUDE_LABELS = {
  full: 'Complète',
  partial: 'Partielle',
  mini: 'Mini',
};

/** @returns {'full'|'partial'|'mini'} 'full' par défaut. */
export function getCameraAmplitude() {
  try {
    const v = localStorage.getItem(CAMERA_REP_AMPLITUDE_KEY);
    return AMPLITUDE_LEVELS.includes(v) ? v : 'full';
  } catch (e) {
    return 'full';
  }
}

/** Mémorise le niveau d'amplitude. */
export function setCameraAmplitude(level) {
  const v = AMPLITUDE_LEVELS.includes(level) ? level : 'full';
  try {
    localStorage.setItem(CAMERA_REP_AMPLITUDE_KEY, v);
  } catch (e) {}
  return v;
}
