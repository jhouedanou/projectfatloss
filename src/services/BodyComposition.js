/**
 * Composition corporelle mesurée par une balance à impédance (oraimo…).
 *
 * Elle est rangée dans la pesée elle-même (champ `composition` d'un
 * enregistrement de WeightStorage) : elle suit donc la synchro Firebase des
 * pesées sans rien de plus.
 */

import { getWeightHistory } from './WeightStorage';

/**
 * Valeurs gardées, dans l'ordre de l'écran oraimo.
 * - min/max : plage plausible (rejette une lecture absurde) ;
 * - decimals : arrondi affiché et enregistré ;
 * - better : sens d'une bonne évolution ('down' ou 'up'), pour la couleur.
 */
export const COMPOSITION_FIELDS = [
  { key: 'bmi', label: 'IMC', short: 'IMC', unit: '', min: 10, max: 90, decimals: 1, better: 'down' },
  { key: 'bodyFat', label: 'Graisse corporelle', short: 'Graisse', unit: '%', min: 2, max: 75, decimals: 1, better: 'down' },
  { key: 'muscleKg', label: 'Masse musculaire', short: 'Muscles', unit: 'kg', min: 10, max: 150, decimals: 1, better: 'up' },
  { key: 'visceral', label: 'Graisse viscérale (indice)', short: 'Viscérale', unit: '', min: 1, max: 59, decimals: 0, better: 'down' },
  { key: 'water', label: 'Eau', short: 'Eau', unit: '%', min: 20, max: 80, decimals: 1, better: 'up' },
  { key: 'boneKg', label: 'Masse osseuse', short: 'Os', unit: 'kg', min: 0.5, max: 10, decimals: 1 },
  { key: 'protein', label: 'Protéines', short: 'Protéines', unit: '%', min: 3, max: 40, decimals: 1, better: 'up' },
  { key: 'bmr', label: 'Métabolisme de base (BMR)', short: 'BMR', unit: 'kcal', min: 600, max: 5000, decimals: 0 },
];

/** Le poids, lu sur la même capture mais rangé à part (champ `weight` de la pesée). */
export const WEIGHT_FIELD = { key: 'weight', label: 'Poids', short: 'Poids', unit: 'kg', min: 20, max: 350, decimals: 1 };

export const roundTo = (value, decimals) => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

/** « 54.1 » → « 54,1 » (affichage à la française). */
export const formatValue = (value, field) =>
  Number(value).toLocaleString('fr-FR', {
    minimumFractionDigits: field.decimals,
    maximumFractionDigits: field.decimals,
  });

/** Valeur dans la plage plausible du champ ? */
export const isPlausible = (value, field) =>
  Number.isFinite(value) && value >= field.min && value <= field.max;

/**
 * Ne garde que les valeurs chiffrées et plausibles, arrondies.
 * @returns {Object|null} null si rien n'est renseigné
 */
export function cleanComposition(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const out = {};
  for (const field of COMPOSITION_FIELDS) {
    const value = Number(String(raw[field.key] ?? '').replace(',', '.'));
    if (raw[field.key] !== '' && raw[field.key] != null && isPlausible(value, field)) {
      out[field.key] = roundTo(value, field.decimals);
    }
  }
  return Object.keys(out).length ? out : null;
}

/** Pesées qui portent une composition, de la plus ancienne à la plus récente. */
export function getCompositionHistory() {
  return getWeightHistory().filter((record) => record.composition && typeof record.composition === 'object');
}

/**
 * Dernière mesure de composition et la précédente (pour l'évolution).
 * @returns {{ latest: Object|null, previous: Object|null }}
 */
export function getLatestCompositions() {
  const history = getCompositionHistory();
  return {
    latest: history[history.length - 1] || null,
    previous: history[history.length - 2] || null,
  };
}

// --- BMR de la balance pour l'objectif calories ------------------------------

const SCALE_BMR_KEY = 'pfl_use_scale_bmr';
// Au-delà, la mesure est trop ancienne : retour au calcul par la formule.
const SCALE_BMR_MAX_AGE_DAYS = 90;

export function isScaleBmrEnabled() {
  try {
    return localStorage.getItem(SCALE_BMR_KEY) === '1';
  } catch {
    return false;
  }
}

export function setScaleBmrEnabled(enabled) {
  try {
    if (enabled) localStorage.setItem(SCALE_BMR_KEY, '1');
    else localStorage.removeItem(SCALE_BMR_KEY);
  } catch { /* stockage indisponible */ }
}

/** BMR de la dernière mesure de moins de 90 jours, ou null. */
export function getLatestScaleBmr() {
  const history = getCompositionHistory().filter((record) => Number(record.composition.bmr) > 0);
  const last = history[history.length - 1];
  if (!last) return null;
  const ageDays = (Date.now() - new Date(last.date).getTime()) / 86400000;
  return ageDays <= SCALE_BMR_MAX_AGE_DAYS ? Number(last.composition.bmr) : null;
}
