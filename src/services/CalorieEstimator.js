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

export function getUserWeight() {
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

  // Vélo sur le programme CAL 1 du Domyos EB900 : programme "Calories" à
  // résistance élevée, effort vigoureux et régulier. MET 7.0 (Compendium :
  // vélo stationnaire vigoureux ~100 W). Séances courtes de 10 min en fin de
  // séance de muscu.
  if (name.includes('vélo') || name.includes('velo')) return 7.0;
  if (name.includes('burpee') || name.includes('thruster') || name.includes('complexe')) return 8.0;
  if (name.includes('squat sauté') || name.includes('saut')) return 8.0;
  if (name.includes('soulevé') || name.includes('squat') || name.includes('fente')) return 6.0;
  if (name.includes('développé') || name.includes('rowing') || name.includes('hip thrust') || name.includes('push press')) return 6.0;
  if (name.includes('gainage') || name.includes('planche') || name.includes('isométrique')) return 3.5;
  if (name.includes('crunch') || name.includes('abdo')) return 3.8;
  if (name.includes('curl') || name.includes('élévation') || name.includes('oiseau') || name.includes('écarté')) return 3.5;

  return 4.5;
}

// ── Charge choisie par exercice (haltères 5/10/15/custom kg) ─────────────────
// L'utilisateur peut choisir la charge sur la fiche d'exercice ; elle est
// mémorisée par nom d'exercice et module l'estimation de calories.

const EXERCISE_LOADS_KEY = 'exercise_loads';

/** Charges proposées par défaut sur la fiche d'exercice. */
export const STANDARD_LOADS_KG = [5, 10, 15];

/** Charge mémorisée pour un exercice (kg), null si jamais choisie. */
export function getExerciseLoad(exerciseName) {
  try {
    const map = JSON.parse(localStorage.getItem(EXERCISE_LOADS_KEY) || '{}');
    const v = map[exerciseName];
    return Number.isFinite(v) && v > 0 ? v : null;
  } catch (e) {
    return null;
  }
}

/** Mémorise la charge choisie pour un exercice (kg). null pour revenir au défaut. */
export function setExerciseLoad(exerciseName, kg) {
  try {
    const map = JSON.parse(localStorage.getItem(EXERCISE_LOADS_KEY) || '{}');
    if (kg == null) delete map[exerciseName];
    else map[exerciseName] = Number(kg);
    localStorage.setItem(EXERCISE_LOADS_KEY, JSON.stringify(map));
    return true;
  } catch (e) {
    return false;
  }
}

/** Charge par défaut d'un exercice : celle inscrite dans son équipement ("2x10 kg"...). */
export function parseEquipmentLoad(exo) {
  const source = `${exo?.equip || ''} ${exo?.equipment || ''}`;
  // "2x10 kg" → 20 ; "15 kg" → 15
  const pair = source.match(/(\d+)\s*[x×]\s*(\d+(?:[.,]\d+)?)\s*kg/i);
  if (pair) return Number(pair[1]) * Number(String(pair[2]).replace(',', '.'));
  const single = source.match(/(\d+(?:[.,]\d+)?)\s*kg/i);
  if (single) return Number(String(single[1]).replace(',', '.'));
  return null;
}

/**
 * Calories pour 1 série, ajustées sur poids utilisateur et charge choisie.
 *
 * Modulation par la charge : les MET de musculation supposent une charge
 * modérée (référence 10 kg). L'énergie dépensée croît avec la charge externe
 * rapportée au poids de corps — approximation linéaire :
 * facteur = 1 + (charge − référence) / (2 × poids de corps).
 * Ex. 75 kg de poids de corps, passer de 10 à 15 kg ≈ +3 % ; à 5 kg ≈ −3 %.
 */
const REFERENCE_LOAD_KG = 10;

export function getCaloriesForSet(exo, userWeightKg = null) {
  const weight = userWeightKg || getUserWeight();
  const met = metFromExercise(exo);

  let durationMin = SET_DURATION_MIN;
  if (exo.timer && exo.duration) {
    durationMin = exo.duration / 60;
  }

  let kcal = (met * 3.5 * weight) / 200 * durationMin;

  // Charge choisie sur la fiche, sinon celle du matériel prévu au programme.
  const load = getExerciseLoad(exo.name) ?? parseEquipmentLoad(exo);
  if (load != null) {
    const factor = 1 + (load - REFERENCE_LOAD_KG) / (2 * weight);
    kcal *= Math.max(0.7, Math.min(1.6, factor));
  }

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
