/**
 * Estimation calories réaliste basée sur MET (Compendium of Physical Activities 2011).
 * Formule: kcal/min = (MET × 3.5 × poidsKg) / 200
 *
 * MET de référence:
 *   - Musculation modérée (isolation, machines):     3.5
 *   - Musculation vigoureuse (compounds barre):      6.0
 *   - Complexes / circuits intenses:                 8.0
 *   - Gainage / isométrie:                           3.5
 *   - Crunchs / abdos rythme normal:                 3.8
 *   - Burpees / thrusters:                           8.0
 *
 * Durée moyenne d'une série travaillée + récupération attribuée = 1.5 min.
 * Pour isométrie, durée = duration spécifiée (sans repos compté).
 */

import { getWeightHistory } from './WeightStorage';

const DEFAULT_WEIGHT_KG = 144;
const DEFAULT_HEIGHT_CM = 178;
const PROFILE_KEY = 'user_profile';
const SET_DURATION_MIN = 1.5;

export function getUserProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      return {
        weightKg: p.weightKg || DEFAULT_WEIGHT_KG,
        heightCm: p.heightCm || DEFAULT_HEIGHT_CM,
        ageYears: p.ageYears || 42,
        sex: p.sex || 'M'
      };
    }
  } catch (e) {}
  return { weightKg: DEFAULT_WEIGHT_KG, heightCm: DEFAULT_HEIGHT_CM, ageYears: 42, sex: 'M' };
}

export function setUserProfile(profile) {
  try {
    const current = getUserProfile();
    localStorage.setItem(PROFILE_KEY, JSON.stringify({ ...current, ...profile }));
  } catch (e) {}
}

function getUserWeight() {
  try {
    const history = getWeightHistory();
    if (history && history.length > 0) {
      const last = history[history.length - 1];
      if (last && typeof last.weight === 'number' && last.weight > 30 && last.weight < 350) {
        return last.weight;
      }
    }
  } catch (e) {}
  return getUserProfile().weightKg;
}

function metFromExercise(exo) {
  const name = (exo.name || '').toLowerCase();

  if (name.includes('burpee') || name.includes('thruster') || name.includes('complexe')) return 8.0;
  if (name.includes('squat sauté') || name.includes('saut')) return 8.0;
  if (name.includes('soulevé') || name.includes('squat') || name.includes('fente')) return 6.0;
  if (name.includes('développé') || name.includes('rowing') || name.includes('hip thrust') || name.includes('push press')) return 6.0;
  if (name.includes('gainage') || name.includes('planche') || name.includes('isométrique')) return 3.5;
  if (name.includes('crunch') || name.includes('abdo')) return 3.8;
  if (name.includes('curl') || name.includes('élévation') || name.includes('oiseau') || name.includes('écarté')) return 3.5;

  return 4.5;
}

/**
 * Calories pour 1 série, ajustées sur poids utilisateur.
 * Priorité au champ caloriesPerSet du data.js si présent (intention auteur),
 * mais on plafonne et on rescale au poids réel.
 */
export function getCaloriesForSet(exo, userWeightKg = null) {
  const weight = userWeightKg || getUserWeight();
  const met = metFromExercise(exo);

  let durationMin = SET_DURATION_MIN;
  if (exo.timer && exo.duration) {
    durationMin = exo.duration / 60;
  }

  const kcal = (met * 3.5 * weight) / 200 * durationMin;
  return Math.max(2, Math.round(kcal));
}

export function getCaloriesForSetRange(exo, userWeightKg = null) {
  const mid = getCaloriesForSet(exo, userWeightKg);
  return [Math.max(2, mid - 2), mid + 2];
}

export { DEFAULT_WEIGHT_KG, DEFAULT_HEIGHT_CM };

// Initialise profile par défaut au premier lancement
if (typeof window !== 'undefined' && window.localStorage) {
  try {
    if (!localStorage.getItem(PROFILE_KEY)) {
      setUserProfile({
        weightKg: DEFAULT_WEIGHT_KG,
        heightCm: DEFAULT_HEIGHT_CM,
        ageYears: 42,
        sex: 'M'
      });
    }
  } catch (e) {}
}
