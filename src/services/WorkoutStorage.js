/**
 * Services de stockage des données d'entraînement
 * Gestion complète de l'historique des entraînements en stockage local
 */

const WORKOUT_HISTORY_KEY = 'workout_history';
const WORKOUT_STATS_KEY = 'workout_stats';

/**
 * Sauvegarde un entraînement dans l'historique local
 * @param {Object} workout - Données de l'entraînement
 * @returns {Object} - L'entraînement sauvegardé avec son ID
 */
export function saveWorkout(workout) {
  // Récupérer l'historique existant
  const history = getWorkoutHistory();
  
  // Générer un ID unique pour cet entraînement
  const workoutId = Date.now();
  
  // Ajouter l'ID et la date actuelle à l'entraînement
  const workoutWithId = {
    ...workout,
    id: workoutId,
    date: workout.date || new Date().toISOString()
  };
  
  // Ajouter l'entraînement à l'historique
  history.unshift(workoutWithId); // Ajouter au début de la liste (plus récent en premier)
  
  // Sauvegarder l'historique mis à jour
  localStorage.setItem(WORKOUT_HISTORY_KEY, JSON.stringify(history));
  
  // Mettre à jour les statistiques globales
  updateWorkoutStats(workoutWithId);
  
  return workoutWithId;
}

/**
 * Récupère l'historique des entraînements
 * @returns {Array} - Liste des entraînements
 */
export function getWorkoutHistory() {
  const historyJson = localStorage.getItem(WORKOUT_HISTORY_KEY);
  return historyJson ? JSON.parse(historyJson) : [];
}

/**
 * Récupère un entraînement spécifique par son ID
 * @param {number} workoutId - ID de l'entraînement
 * @returns {Object|null} - L'entraînement ou null s'il n'existe pas
 */
export function getWorkoutById(workoutId) {
  const history = getWorkoutHistory();
  return history.find(workout => workout.id === workoutId) || null;
}

/**
 * Supprime un entraînement de l'historique
 * @param {number} workoutId - ID de l'entraînement à supprimer
 * @returns {boolean} - true si la suppression a réussi
 */
export function deleteWorkout(workoutId) {
  const history = getWorkoutHistory();
  const initialLength = history.length;
  
  // Filtrer l'entraînement à supprimer
  const updatedHistory = history.filter(workout => workout.id !== workoutId);
  
  // Si aucun changement, l'entraînement n'existait pas
  if (updatedHistory.length === initialLength) {
    return false;
  }
  
  // Sauvegarder l'historique mis à jour
  localStorage.setItem(WORKOUT_HISTORY_KEY, JSON.stringify(updatedHistory));
  
  // Recalculer les statistiques
  recalculateAllStats();
  
  return true;
}

/**
 * Met à jour les statistiques globales avec un nouvel entraînement
 * @param {Object} workout - Entraînement à ajouter aux statistiques
 */
function updateWorkoutStats(workout) {
  // Récupérer les statistiques actuelles
  const stats = getWorkoutStats();
  
  // Mettre à jour les statistiques
  stats.totalWorkouts += 1;
  stats.totalCalories += workout.calories || 0;
  stats.totalDuration += workout.duration || 0;
  stats.totalWeightLifted += workout.weightLifted || 0;
  
  // Mettre à jour la date du dernier entraînement si plus récente
  if (!stats.lastWorkoutDate || new Date(workout.date) > new Date(stats.lastWorkoutDate)) {
    stats.lastWorkoutDate = workout.date;
  }
  
  // Mettre à jour les poids soulevés par exercice
  if (workout.exercises && Array.isArray(workout.exercises)) {
    workout.exercises.forEach(exercise => {
      if (exercise.name && exercise.weightLifted) {
        if (!stats.weightByExercise) stats.weightByExercise = {};
        stats.weightByExercise[exercise.name] = (stats.weightByExercise[exercise.name] || 0) + exercise.weightLifted;
      }
    });
  }
  
  // Sauvegarder les statistiques mises à jour
  localStorage.setItem(WORKOUT_STATS_KEY, JSON.stringify(stats));
}

/**
 * Récupère les statistiques globales d'entraînement
 * @returns {Object} - Statistiques d'entraînement
 */
export function getWorkoutStats() {
  const statsJson = localStorage.getItem(WORKOUT_STATS_KEY);
  return statsJson ? JSON.parse(statsJson) : {
    totalWorkouts: 0,
    totalCalories: 0,
    totalDuration: 0,
    totalWeightLifted: 0,
    lastWorkoutDate: null,
    weightByExercise: {}
  };
}

/**
 * Récupère les poids soulevés par exercice
 * @returns {Object} - Map des poids par exercice
 */
export function getWeightLiftedByExercise() {
  const stats = getWorkoutStats();
  return stats.weightByExercise || {};
}

/**
 * Recalcule toutes les statistiques à partir de l'historique complet
 * Utile après des suppressions ou modifications importantes
 */
function recalculateAllStats() {
  // Réinitialiser les statistiques
  const emptyStats = {
    totalWorkouts: 0,
    totalCalories: 0,
    totalDuration: 0,
    totalWeightLifted: 0,
    lastWorkoutDate: null,
    weightByExercise: {}
  };
  
  // Récupérer tout l'historique
  const history = getWorkoutHistory();
  
  // Recalculer les statistiques pour chaque entraînement
  const updatedStats = history.reduce((stats, workout) => {
    // Mettre à jour les compteurs
    stats.totalWorkouts += 1;
    stats.totalCalories += workout.calories || 0;
    stats.totalDuration += workout.duration || 0;
    stats.totalWeightLifted += workout.weightLifted || 0;
    
    // Mettre à jour la date du dernier entraînement
    if (!stats.lastWorkoutDate || new Date(workout.date) > new Date(stats.lastWorkoutDate)) {
      stats.lastWorkoutDate = workout.date;
    }
    
    // Mettre à jour les poids soulevés par exercice
    if (workout.exercises && Array.isArray(workout.exercises)) {
      workout.exercises.forEach(exercise => {
        if (exercise.name && exercise.weightLifted) {
          stats.weightByExercise[exercise.name] = (stats.weightByExercise[exercise.name] || 0) + exercise.weightLifted;
        }
      });
    }
    
    return stats;
  }, emptyStats);
  
  // Sauvegarder les statistiques recalculées
  localStorage.setItem(WORKOUT_STATS_KEY, JSON.stringify(updatedStats));
}

/**
 * Récupère les entraînements pour une date spécifique
 * @param {Date} date - Date à rechercher 
 * @returns {Array} - Liste des entraînements pour cette date
 */
export function getWorkoutsForDate(date) {
  // Convertir la date en chaîne de caractères (YYYY-MM-DD)
  const dateString = date.toISOString().split('T')[0];
  
  // Récupérer tous les entraînements
  const history = getWorkoutHistory();
  
  // Filtrer les entraînements pour cette date
  return history.filter(workout => {
    const workoutDate = new Date(workout.date).toISOString().split('T')[0];
    return workoutDate === dateString;
  });
}

/**
 * Efface tout l'historique des entraînements et les statistiques
 * @returns {boolean} - true si l'opération a réussi
 */
export function clearAllWorkoutData() {
  try {
    localStorage.removeItem(WORKOUT_HISTORY_KEY);
    localStorage.removeItem(WORKOUT_STATS_KEY);
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression des données:', error);
    return false;
  }
}
