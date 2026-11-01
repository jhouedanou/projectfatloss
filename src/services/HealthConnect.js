/**
 * Health Connect (l'app santé d'Android) dans l'APK : elle remplace Google Fit,
 * dont l'API ferme fin 2026. Pas de connexion Google : Android demande
 * seulement l'autorisation d'accéder aux données (plugin natif
 * android/app/src/main/java/com/houedanou/fatloss/HealthConnectPlugin.kt).
 *
 * Sur le site, rien ne change : la synchro passe toujours par Google Fit.
 */
import { Capacitor, registerPlugin } from '@capacitor/core';

const HealthConnect = registerPlugin('HealthConnect');

export default HealthConnect;

/** true dans l'APK Android : la synchro santé passe par Health Connect. */
export const isHealthConnectApp = () =>
  Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';

/** Nom du service de santé affiché dans l'interface. */
export const healthServiceName = () => (isHealthConnectApp() ? 'Health Connect' : 'Google Fit');

// Données demandées à Health Connect, et ce qu'elles servent à faire.
const ACCESS_LABELS = {
  READ_STEPS: 'lire les pas',
  READ_EXERCISE: 'lire les séances',
  READ_ACTIVE_CALORIES_BURNED: 'lire les calories',
  READ_TOTAL_CALORIES_BURNED: 'lire les calories',
  READ_DISTANCE: 'lire la distance',
  READ_WEIGHT: 'lire le poids',
  WRITE_EXERCISE: 'écrire les séances',
  WRITE_ACTIVE_CALORIES_BURNED: 'écrire les calories',
  WRITE_DISTANCE: 'écrire la distance',
  WRITE_WEIGHT: 'écrire le poids',
  WRITE_NUTRITION: 'écrire les repas',
};

const shortName = (permission) => String(permission).replace('android.permission.health.', '');

const missingFrom = (access, needed) => {
  const missing = new Set((access?.missing || []).map(shortName));
  return needed.filter((name) => missing.has(name));
};

/**
 * Vérifie que Health Connect est là et que les autorisations `needed` sont
 * accordées ; sinon les demande (si `prompt`).
 * @param {string[]} needed - ex. ['READ_EXERCISE', 'READ_DISTANCE']
 * @returns {Promise<boolean>} false si l'accès manque et que `prompt` est faux
 */
export async function ensureHealthAccess(needed, { prompt = true } = {}) {
  const { status } = await HealthConnect.availability();
  if (status !== 'available') {
    if (!prompt) return false;
    await HealthConnect.openSettings().catch(() => {});
    throw new Error(status === 'update_required'
      ? 'Mets à jour « Health Connect » depuis le Play Store, puis réessaie.'
      : 'Installe « Health Connect » depuis le Play Store, puis réessaie.');
  }

  let access = await HealthConnect.checkAccess();
  if (missingFrom(access, needed).length === 0) return true;
  if (!prompt) return false;

  access = await HealthConnect.requestAccess();
  const stillMissing = missingFrom(access, needed);
  if (stillMissing.length === 0) return true;

  const what = [...new Set(stillMissing.map((name) => ACCESS_LABELS[name] || name))].join(', ');
  throw new Error(`Autorisation refusée (${what}). Ouvre Health Connect → Autorisations des applis → Project Fat Loss, puis réessaie.`);
}

/** Demande toutes les autorisations (bouton « Connecter » des réglages). */
export const connectHealthConnect = ({ prompt = true } = {}) =>
  ensureHealthAccess(Object.keys(ACCESS_LABELS), { prompt });

/** Ouvre les réglages de Health Connect (ou sa page Play Store). */
export const openHealthConnectSettings = () => HealthConnect.openSettings();
