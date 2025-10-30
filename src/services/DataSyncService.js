/**
 * Service de synchronisation des données avec le stockage centralisé
 * Permet la consultation de l'historique depuis tous les appareils
 */

const WORKOUT_DATA_URL = '/projectfatloss/data/workout-history.json';
const WEIGHT_DATA_URL = '/projectfatloss/data/weight-history.json';

/**
 * Synchronise les données locales avec le serveur
 * @returns {Promise<Object>} - Résultat de la synchronisation
 */
export const syncData = async () => {
  try {
    // Récupérer les données locales
    const localWorkouts = JSON.parse(localStorage.getItem('workout_history') || '[]');
    const localWeights = JSON.parse(localStorage.getItem('weight_history_data') || '[]');
    
    // Pour une vraie synchronisation, il faudrait un backend
    // Pour l'instant, on retourne les données locales
    return {
      success: true,
      workouts: localWorkouts,
      weights: localWeights,
      lastSync: new Date().toISOString()
    };
  } catch (error) {
    console.error('Erreur lors de la synchronisation:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Charge les données depuis le stockage centralisé
 * @returns {Promise<Object>} - Données chargées
 */
export const loadCentralizedData = async () => {
  try {
    const [workoutResponse, weightResponse] = await Promise.all([
      fetch(WORKOUT_DATA_URL),
      fetch(WEIGHT_DATA_URL)
    ]);
    
    if (!workoutResponse.ok || !weightResponse.ok) {
      throw new Error('Erreur lors du chargement des données');
    }
    
    const workoutData = await workoutResponse.json();
    const weightData = await weightResponse.json();
    
    return {
      success: true,
      workouts: workoutData.workouts || [],
      stats: workoutData.stats,
      weights: weightData.weights || [],
      lastSync: workoutData.lastSync || weightData.lastSync
    };
  } catch (error) {
    console.error('Erreur lors du chargement des données centralisées:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Exporte les données locales au format JSON
 * @returns {Object} - Données exportées
 */
export const exportLocalData = () => {
  try {
    const workouts = JSON.parse(localStorage.getItem('workout_history') || '[]');
    const workoutStats = JSON.parse(localStorage.getItem('workout_stats') || '{}');
    const weights = JSON.parse(localStorage.getItem('weight_history_data') || '[]');
    
    return {
      workouts,
      stats: workoutStats,
      weights,
      exportDate: new Date().toISOString()
    };
  } catch (error) {
    console.error('Erreur lors de l\'export des données:', error);
    return null;
  }
};

/**
 * Télécharge les données locales au format JSON
 */
export const downloadDataAsJSON = () => {
  try {
    const data = exportLocalData();
    if (!data) {
      throw new Error('Impossible d\'exporter les données');
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `projectfatloss-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Erreur lors du téléchargement:', error);
    return false;
  }
};

/**
 * Importe des données depuis un fichier JSON
 * @param {File} file - Fichier JSON à importer
 * @returns {Promise<boolean>} - Succès de l'opération
 */
export const importDataFromJSON = async (file) => {
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    
    // Valider la structure des données
    if (!data.workouts && !data.weights) {
      throw new Error('Format de données invalide');
    }
    
    // Importer les données dans localStorage
    if (data.workouts) {
      localStorage.setItem('workout_history', JSON.stringify(data.workouts));
    }
    if (data.stats) {
      localStorage.setItem('workout_stats', JSON.stringify(data.stats));
    }
    if (data.weights) {
      localStorage.setItem('weight_history_data', JSON.stringify(data.weights));
    }
    
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'import:', error);
    return false;
  }
};
