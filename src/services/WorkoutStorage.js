/**
 * Service de gestion du stockage des données d'entraînement
 * Utilise localStorage pour une persistance simple entre les sessions
 */

// Clé de stockage dans localStorage
const WORKOUT_HISTORY_KEY = 'workout_history_data';

/**
 * Sauvegarde un entraînement terminé
 * @param {Object} workout - Données de l'entraînement
 */
export const saveWorkout = (workout) => {
  try {
    // Récupérer l'historique existant
    const history = getWorkoutHistory();
    
    // Ajouter le nouvel entraînement avec un ID unique
    const workoutWithId = {
      ...workout,
      id: Date.now(), // Utilise le timestamp comme ID unique
      date: new Date().toISOString() // Date ISO pour faciliter le tri et l'affichage
    };
    
    // Mettre à jour l'historique
    history.push(workoutWithId);
    
    // Sauvegarder l'historique mis à jour
    localStorage.setItem(WORKOUT_HISTORY_KEY, JSON.stringify(history));
    
    return workoutWithId;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de l\'entraînement:', error);
    return null;
  }
};

/**
 * Récupère tout l'historique des entraînements
 * @returns {Array} - Liste des entraînements
 */
export const getWorkoutHistory = () => {
  try {
    const historyData = localStorage.getItem(WORKOUT_HISTORY_KEY);
    return historyData ? JSON.parse(historyData) : [];
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique:', error);
    return [];
  }
};

/**
 * Récupère les entraînements pour une période donnée
 * @param {Date} startDate - Date de début
 * @param {Date} endDate - Date de fin (optionnelle)
 * @returns {Array} - Liste des entraînements dans la période
 */
export const getWorkoutsByDateRange = (startDate, endDate = null) => {
  try {
    const history = getWorkoutHistory();
    
    return history.filter(workout => {
      const workoutDate = new Date(workout.date);
      return workoutDate >= startDate && (endDate === null || workoutDate <= endDate);
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des entraînements par date:', error);
    return [];
  }
};

/**
 * Récupère les statistiques globales des entraînements
 * @returns {Object} - Statistiques globales
 */
export const getWorkoutStats = () => {
  try {
    const history = getWorkoutHistory();
    
    return history.reduce((stats, workout) => {
      // Calories totales brûlées
      stats.totalCalories += workout.calories || 0;
      
      // Nombre total d'entraînements
      stats.totalWorkouts += 1;
      
      // Poids total soulevé (si disponible)
      if (workout.weightLifted) {
        stats.totalWeightLifted += workout.weightLifted;
      }
      
      // Mise à jour du dernier entraînement
      const workoutDate = new Date(workout.date);
      if (!stats.lastWorkoutDate || workoutDate > new Date(stats.lastWorkoutDate)) {
        stats.lastWorkoutDate = workout.date;
      }
      
      return stats;
    }, {
      totalCalories: 0,
      totalWorkouts: 0,
      totalWeightLifted: 0,
      lastWorkoutDate: null
    });
  } catch (error) {
    console.error('Erreur lors du calcul des statistiques:', error);
    return {
      totalCalories: 0,
      totalWorkouts: 0,
      totalWeightLifted: 0,
      lastWorkoutDate: null
    };
  }
};

/**
 * Supprime un entraînement par ID
 * @param {number} id - ID de l'entraînement à supprimer
 * @returns {boolean} - Succès de l'opération
 */
export const deleteWorkout = (id) => {
  try {
    const history = getWorkoutHistory();
    const updatedHistory = history.filter(workout => workout.id !== id);
    
    localStorage.setItem(WORKOUT_HISTORY_KEY, JSON.stringify(updatedHistory));
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'entraînement:', error);
    return false;
  }
};

/**
 * Calcule les poids totaux soulevés par exercice
 * @returns {Object} - Poids soulevés par exercice
 */
export const getWeightLiftedByExercise = () => {
  try {
    const history = getWorkoutHistory();
    const exerciseWeights = {};
    
    history.forEach(workout => {
      if (workout.exercises) {
        workout.exercises.forEach(exercise => {
          if (exercise.name && exercise.weightLifted) {
            if (!exerciseWeights[exercise.name]) {
              exerciseWeights[exercise.name] = 0;
            }
            exerciseWeights[exercise.name] += exercise.weightLifted;
          }
        });
      }
    });
    
    return exerciseWeights;
  } catch (error) {
    console.error('Erreur lors du calcul des poids par exercice:', error);
    return {};
  }
};

/**
 * Met à jour un entraînement avec l'ID Strava après synchronisation
 * @param {number} workoutId - ID de l'entraînement local
 * @param {number} stravaId - ID de l'activité Strava
 * @returns {boolean} - Succès de l'opération
 */
export const updateWorkoutWithStravaId = (workoutId, stravaId) => {
  try {
    const history = getWorkoutHistory();
    const workoutIndex = history.findIndex(w => w.id === workoutId);
    
    if (workoutIndex === -1) {
      return false;
    }
    
    // Ajouter l'ID Strava à l'entraînement
    history[workoutIndex] = {
      ...history[workoutIndex],
      stravaId: stravaId,
      syncedWithStrava: true,
      lastSyncDate: new Date().toISOString()
    };
    
    // Sauvegarder l'historique mis à jour
    localStorage.setItem(WORKOUT_HISTORY_KEY, JSON.stringify(history));
    return true;
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'ID Strava:', error);
    return false;
  }
};

/**
 * Sauvegarde la progression d'un entraînement non terminé
 * @param {string} dayId - Identifiant du jour d'entraînement
 * @param {Object} progress - Données de progression
 * @returns {boolean} - Succès de l'opération
 */
export const saveWorkoutProgress = (dayId, progress) => {
  try {
    const progressKey = `workout_progress_${dayId}`;
    localStorage.setItem(progressKey, JSON.stringify({
      ...progress,
      timestamp: Date.now()
    }));
    return true;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la progression:', error);
    return false;
  }
};
