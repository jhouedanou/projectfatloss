/**
 * Détection du casque VR / des capacités WebXR, et réglage « mode immersif ».
 *
 * Les fonctions pures (isHeadsetUserAgent, chooseXrMode) sont testables en
 * node ; seules detectXrMode() et les accès localStorage touchent au
 * navigateur, toujours en best-effort (jamais d'exception).
 */

/** Navigateurs de casques connus (Meta Quest, Pico, Wolvic…). */
export const HEADSET_UA_RE = /OculusBrowser|Quest|Pico|Wolvic|VR/i;

/** L'user-agent est-il celui d'un navigateur de casque ? (pur) */
export function isHeadsetUserAgent(ua) {
  return HEADSET_UA_RE.test(String(ua || ''));
}

/**
 * Mode XR à utiliser d'après les capacités : passthrough (AR) en priorité,
 * sinon VR opaque, sinon rien. (pur)
 * @returns {'immersive-ar'|'immersive-vr'|null}
 */
export function chooseXrMode({ ar, vr }) {
  if (ar) return 'immersive-ar';
  if (vr) return 'immersive-vr';
  return null;
}

/** Interroge WebXR : quel mode immersif ce navigateur supporte-t-il ? */
export async function detectXrMode() {
  try {
    if (typeof navigator === 'undefined' || !navigator.xr || !navigator.xr.isSessionSupported) {
      return null;
    }
    const probe = (mode) => navigator.xr.isSessionSupported(mode).catch(() => false);
    const [ar, vr] = await Promise.all([probe('immersive-ar'), probe('immersive-vr')]);
    return chooseXrMode({ ar, vr });
  } catch (e) {
    return null;
  }
}

// ── Réglages mémorisés (même forme que WorkoutCustomization) ────────────────

const IMMERSIVE_ENABLED_KEY = 'immersive_mode_enabled';
const IMMERSIVE_BANNER_KEY = 'immersive_banner_dismissed';

/** Le mode immersif est-il activé ? (false par défaut) */
export function isImmersiveModeEnabled() {
  try {
    return localStorage.getItem(IMMERSIVE_ENABLED_KEY) === 'true';
  } catch (e) {
    return false;
  }
}

export function setImmersiveModeEnabled(enabled) {
  try {
    localStorage.setItem(IMMERSIVE_ENABLED_KEY, String(!!enabled));
    return true;
  } catch (e) {
    return false;
  }
}

/** La bannière d'accueil a-t-elle été masquée par l'utilisateur ? */
export function isImmersiveBannerDismissed() {
  try {
    return localStorage.getItem(IMMERSIVE_BANNER_KEY) === 'true';
  } catch (e) {
    return false;
  }
}

export function dismissImmersiveBanner() {
  try {
    localStorage.setItem(IMMERSIVE_BANNER_KEY, 'true');
    return true;
  } catch (e) {
    return false;
  }
}
