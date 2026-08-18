/**
 * Service de gestion de la personnalisation des entraînements
 * Utilise localStorage pour persister les modifications du programme
 */

import { days as defaultWorkoutPlan } from '../data';

// Clé de stockage dans localStorage
const CUSTOM_WORKOUT_KEY = 'custom_workout_plan';

// Version du programme par défaut : quand elle change, un éventuel plan
// personnalisé basé sur l'ancien programme est écarté pour que tout le monde
// reçoive le nouveau programme (semaine type 4 séances + 3 repos).
const PLAN_VERSION_KEY = 'plan_version';
const PLAN_VERSION = '28d-v3';

const migratePlanVersion = () => {
  try {
    if (localStorage.getItem(PLAN_VERSION_KEY) !== PLAN_VERSION) {
      localStorage.removeItem(CUSTOM_WORKOUT_KEY);
      localStorage.setItem(PLAN_VERSION_KEY, PLAN_VERSION);
    }
  } catch (error) {
    // localStorage indisponible : on servira le plan par défaut de toute façon.
  }
};

/**
 * Récupérer le programme d'entraînement (personnalisé ou par défaut)
 * @returns {Array} - Programme d'entraînement
 */
export const getWorkoutPlan = () => {
  try {
    migratePlanVersion();
    const storedPlan = localStorage.getItem(CUSTOM_WORKOUT_KEY);
    return storedPlan ? JSON.parse(storedPlan) : defaultWorkoutPlan;
  } catch (error) {
    console.error('Erreur lors de la récupération du programme personnalisé:', error);
    return defaultWorkoutPlan;
  }
};

/**
 * Sauvegarder un programme d'entraînement personnalisé
 * @param {Array} workoutPlan - Programme d'entraînement personnalisé
 */
export const saveWorkoutPlan = (workoutPlan) => {
  try {
    localStorage.setItem(CUSTOM_WORKOUT_KEY, JSON.stringify(workoutPlan));
    return true;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du programme personnalisé:', error);
    return false;
  }
};

// --- Vélo optionnel (cardio de fin de séance) ---------------------------------
// Le vélo peut être inclus ou non dans chaque séance sans modifier le programme
// (le réglage est global et réversible, mémorisé dans le localStorage).

const VELO_ENABLED_KEY = 'velo_enabled';

/**
 * Détecte le vélo optionnel de fin de séance d'après son nom exact.
 * Volontairement strict : l'échauffement vélo des séances de musculation et la
 * séance vélo dédiée du samedi ne doivent JAMAIS être retirés par ce réglage.
 */
const isVeloExercise = (exercise) =>
  (exercise?.name || '') === 'Vélo (cardio fin de séance)';

/**
 * Indique si le vélo de fin de séance est actif (inclus dans les séances).
 * @returns {boolean} true par défaut si aucun réglage enregistré.
 */
export const isVeloEnabled = () => {
  try {
    const stored = localStorage.getItem(VELO_ENABLED_KEY);
    return stored === null ? true : stored === 'true';
  } catch (error) {
    return true;
  }
};

/**
 * Active ou désactive le vélo de fin de séance (réglage global mémorisé).
 * @param {boolean} enabled
 * @returns {boolean} succès de l'écriture
 */
export const setVeloEnabled = (enabled) => {
  try {
    localStorage.setItem(VELO_ENABLED_KEY, String(!!enabled));
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement du réglage vélo:', error);
    return false;
  }
};

// --- Ride en début de séance (vélo connecté + vidéo) --------------------------
// Quand il est actif, la séance démarre par un écran « ride » (vidéo + HUD) et
// le vélo de fin de séance est retiré du programme (il est remplacé, pas doublé).

const RIDE_START_KEY = 'ride_start_enabled';

/**
 * Indique si le ride vélo en début de séance est actif.
 * @returns {boolean} false par défaut si aucun réglage enregistré.
 */
export const isRideStartEnabled = () => {
  try {
    return localStorage.getItem(RIDE_START_KEY) === 'true';
  } catch (error) {
    return false;
  }
};

/**
 * Active ou désactive le ride vélo en début de séance (réglage global mémorisé).
 * @param {boolean} enabled
 * @returns {boolean} succès de l'écriture
 */
export const setRideStartEnabled = (enabled) => {
  try {
    localStorage.setItem(RIDE_START_KEY, String(!!enabled));
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement du réglage ride:', error);
    return false;
  }
};

/**
 * Indique si un jour donné contient une séance de vélo (dans le plan brut,
 * indépendamment du réglage activé/désactivé). Sert à savoir s'il faut
 * proposer l'interrupteur pour ce jour.
 * @param {number} dayIndex
 * @returns {boolean}
 */
export const dayHasVelo = (dayIndex) => {
  const plan = getWorkoutPlan();
  const day = plan?.[dayIndex];
  return !!day && (day.exercises || []).some(isVeloExercise);
};

/**
 * Programme effectif pour l'affichage et la séance : identique au plan
 * personnalisé/par défaut, mais sans le vélo si celui-ci est désactivé ou si
 * le ride en début de séance le remplace.
 * N'altère jamais le plan enregistré (le WorkoutCustomizer garde le plan complet).
 * @returns {Array}
 */
export const getActiveWorkoutPlan = () => {
  const plan = getWorkoutPlan();
  if (isVeloEnabled() && !isRideStartEnabled()) return plan;
  return plan.map((day) => ({
    ...day,
    exercises: (day.exercises || []).filter((exercise) => !isVeloExercise(exercise)),
  }));
};

/**
 * Modifier un exercice dans le programme
 * @param {number} dayIndex - Index du jour à modifier
 * @param {number} exerciseIndex - Index de l'exercice à modifier
 * @param {Object} updatedExercise - Données de l'exercice mis à jour
 * @returns {boolean} - Succès de l'opération
 */
export const updateExercise = (dayIndex, exerciseIndex, updatedExercise) => {
  try {
    const workoutPlan = getWorkoutPlan();
    
    // Vérifier que les index sont valides
    if (dayIndex < 0 || dayIndex >= workoutPlan.length || 
        exerciseIndex < 0 || exerciseIndex >= workoutPlan[dayIndex].exercises.length) {
      console.error('Index de jour ou d\'exercice invalide');
      return false;
    }
    
    // Mettre à jour l'exercice
    workoutPlan[dayIndex].exercises[exerciseIndex] = {
      ...workoutPlan[dayIndex].exercises[exerciseIndex],
      ...updatedExercise
    };
    
    // Sauvegarder le programme mis à jour
    return saveWorkoutPlan(workoutPlan);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'exercice:', error);
    return false;
  }
};

/**
 * Réinitialiser le programme aux valeurs par défaut
 * @returns {boolean} - Succès de l'opération
 */
export const resetWorkoutPlan = () => {
  try {
    localStorage.removeItem(CUSTOM_WORKOUT_KEY);
    return true;
  } catch (error) {
    console.error('Erreur lors de la réinitialisation du programme:', error);
    return false;
  }
};

/**
 * Ajouter un nouvel exercice à un jour
 * @param {number} dayIndex - Index du jour où ajouter l'exercice
 * @param {Object} newExercise - Données du nouvel exercice
 * @returns {boolean} - Succès de l'opération
 */
export const addExercise = (dayIndex, newExercise) => {
  try {
    const workoutPlan = getWorkoutPlan();
    
    // Vérifier que l'index du jour est valide
    if (dayIndex < 0 || dayIndex >= workoutPlan.length) {
      console.error('Index de jour invalide');
      return false;
    }
    
    // Ajouter le nouvel exercice
    workoutPlan[dayIndex].exercises.push(newExercise);
    
    // Sauvegarder le programme mis à jour
    return saveWorkoutPlan(workoutPlan);
  } catch (error) {
    console.error('Erreur lors de l\'ajout de l\'exercice:', error);
    return false;
  }
};

/**
 * Supprimer un exercice d'un jour
 * @param {number} dayIndex - Index du jour où supprimer l'exercice
 * @param {number} exerciseIndex - Index de l'exercice à supprimer
 * @returns {boolean} - Succès de l'opération
 */
export const removeExercise = (dayIndex, exerciseIndex) => {
  try {
    const workoutPlan = getWorkoutPlan();
    
    // Vérifier que les index sont valides
    if (dayIndex < 0 || dayIndex >= workoutPlan.length || 
        exerciseIndex < 0 || exerciseIndex >= workoutPlan[dayIndex].exercises.length) {
      console.error('Index de jour ou d\'exercice invalide');
      return false;
    }
    
    // Supprimer l'exercice
    workoutPlan[dayIndex].exercises.splice(exerciseIndex, 1);
    
    // Sauvegarder le programme mis à jour
    return saveWorkoutPlan(workoutPlan);
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'exercice:', error);
    return false;
  }
};
