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
