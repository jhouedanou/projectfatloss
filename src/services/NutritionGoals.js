/**
 * Objectifs nutritionnels personnalisés pour la perte de poids.
 *
 * BMR par Mifflin-St Jeor :
 *   hommes : 10×poids + 6.25×taille − 5×âge + 5
 *   femmes : 10×poids + 6.25×taille − 5×âge − 161
 * TDEE = BMR × facteur d'activité (sédentaire/légèrement actif — le sport est
 * déjà compté à part dans le bilan énergétique, ne pas le compter deux fois).
 * Objectif calorique = TDEE − déficit quotidien, avec un plancher de sécurité.
 *
 * Le poids vient de la dernière pesée (WeightTracker) via getUserWeight() :
 * l'objectif suit donc automatiquement la perte de poids.
 */

import { getUserProfile, getUserWeight } from './CalorieEstimator';

export const ACTIVITY_FACTOR = 1.4;
export const DAILY_DEFICIT_KCAL = 750;
export const MIN_CALORIE_TARGET = 1500;

export function getBMR() {
  const profile = getUserProfile();
  const weightKg = getUserWeight();
  const sexOffset = profile.sex === 'F' ? -161 : 5;
  return 10 * weightKg + 6.25 * profile.heightCm - 5 * profile.ageYears + sexOffset;
}

export function getTDEE() {
  return Math.round(getBMR() * ACTIVITY_FACTOR);
}

/** Objectif calorique quotidien (kcal) avec déficit pour perdre du poids. */
export function getCalorieTarget() {
  return Math.max(MIN_CALORIE_TARGET, getTDEE() - DAILY_DEFICIT_KCAL);
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
