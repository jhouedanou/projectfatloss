/**
 * Objectifs nutritionnels personnalisés pour la perte de poids.
 *
 * BMR par Mifflin-St Jeor :
 *   hommes : 10×poids + 6.25×taille − 5×âge + 5
 *   femmes : 10×poids + 6.25×taille − 5×âge − 161
 * TDEE = BMR × facteur d'activité (sédentaire/légèrement actif — le sport est
 * déjà compté à part dans le bilan énergétique, ne pas le compter deux fois).
 * Objectif calorique = TDEE − déficit quotidien, avec un plancher de sécurité.
 * Le déficit à table est modéré (500 kcal) : le vélo apporte le reste du
 * déficit nécessaire pour perdre 3 à 4 kg par mois (voir WeightLossPlan.js).
 *
 * Le poids vient de la dernière pesée (WeightTracker) via getUserWeight() :
 * l'objectif suit donc automatiquement la perte de poids.
 *
 * Sur demande (réglage dans la carte « Composition corporelle »), le BMR de la
 * balance à impédance remplace la formule tant que la mesure a moins de 90 jours.
 */

import { getUserProfile, getUserWeight } from './CalorieEstimator';
import { getLatestScaleBmr, isScaleBmrEnabled } from './BodyComposition';

export const ACTIVITY_FACTOR = 1.4;
export const DAILY_DEFICIT_KCAL = 500;
export const MIN_CALORIE_TARGET = 1500;

/** BMR par la formule de Mifflin-St Jeor (poids, taille, âge, sexe). */
export function getFormulaBMR() {
  const profile = getUserProfile();
  const weightKg = getUserWeight();
  const sexOffset = profile.sex === 'F' ? -161 : 5;
  return 10 * weightKg + 6.25 * profile.heightCm - 5 * profile.ageYears + sexOffset;
}

/** BMR utilisé : celui de la balance si l'utilisateur l'a choisi, sinon la formule. */
export function getBMR() {
  const scaleBmr = isScaleBmrEnabled() ? getLatestScaleBmr() : null;
  return scaleBmr || getFormulaBMR();
}

export function getTDEE() {
  return Math.round(getBMR() * ACTIVITY_FACTOR);
}

/** Objectif calorique quotidien obtenu à partir d'un BMR donné. */
export function calorieTargetForBMR(bmr) {
  return Math.max(MIN_CALORIE_TARGET, Math.round(bmr * ACTIVITY_FACTOR) - DAILY_DEFICIT_KCAL);
}

/** Objectif calorique quotidien (kcal) avec déficit pour perdre du poids. */
export function getCalorieTarget() {
  return calorieTargetForBMR(getBMR());
}

/**
 * Objectif protéines (g/jour) : 1.6 g/kg d'un poids de référence.
 * En cas d'obésité, la référence est plafonnée à un poids "cible" dérivé de la
 * taille (taille − 100 + 25) pour ne pas gonfler l'objectif avec la masse grasse.
 */
export function getProteinTargetGrams() {
  const profile = getUserProfile();
  const referenceKg = Math.min(getUserWeight(), profile.heightCm - 100 + 25);
  return Math.round(1.6 * referenceKg);
}
