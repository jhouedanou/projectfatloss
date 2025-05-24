/**
 * Service de gestion des exercices personnalisés de l'utilisateur
 * Permet de sauvegarder et récupérer les exercices favoris
 */

const USER_EXERCISES_KEY = 'user_custom_exercises';

/**
 * Structure d'un exercice personnalisé
 * @typedef {Object} CustomExercise
 * @property {string} id - Identifiant unique de l'exercice
 * @property {string} name - Nom de l'exercice
 * @property {string} description - Description de l'exercice
 * @property {string} equipment - Équipement nécessaire
 * @property {number} difficulty - Niveau de difficulté (1-5)
 * @property {string} category - Catégorie de l'exercice
 * @property {string} muscleGroup - Groupe musculaire ciblé
 * @property {number} estimatedCalories - Calories estimées par série
 * @property {boolean} isTimer - Si l'exercice utilise un timer au lieu de répétitions
 * @property {number} defaultDuration - Durée par défaut en secondes (pour les exercices timer)
 * @property {number} defaultReps - Répétitions par défaut
 * @property {number} defaultSets - Séries par défaut
 * @property {Date} createdAt - Date de création
 * @property {Date} lastUsed - Dernière utilisation
 * @property {number} timesUsed - Nombre d'utilisations
 */

/**
 * Récupère tous les exercices personnalisés de l'utilisateur
 * @returns {Array<CustomExercise>} - Liste des exercices personnalisés
 */
export function getUserExercises() {
  const exercisesJson = localStorage.getItem(USER_EXERCISES_KEY);
  return exercisesJson ? JSON.parse(exercisesJson) : [];
}

/**
 * Sauvegarde un nouvel exercice personnalisé
 * @param {Object} exercise - Données de l'exercice
 * @returns {CustomExercise} - L'exercice sauvegardé avec son ID
 */
export function saveUserExercise(exercise) {
  const exercises = getUserExercises();
  
  const customExercise = {
    ...exercise,
    id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    createdAt: new Date().toISOString(),
    lastUsed: new Date().toISOString(),
    timesUsed: 0
  };
  
  exercises.push(customExercise);
  localStorage.setItem(USER_EXERCISES_KEY, JSON.stringify(exercises));
  
  return customExercise;
}

/**
 * Met à jour un exercice personnalisé existant
 * @param {string} exerciseId - ID de l'exercice à mettre à jour
 * @param {Object} updates - Modifications à apporter
 * @returns {CustomExercise|null} - L'exercice mis à jour ou null si non trouvé
 */
export function updateUserExercise(exerciseId, updates) {
  const exercises = getUserExercises();
  const exerciseIndex = exercises.findIndex(ex => ex.id === exerciseId);
  
  if (exerciseIndex === -1) {
    return null;
  }
  
  exercises[exerciseIndex] = {
    ...exercises[exerciseIndex],
    ...updates,
    lastUsed: new Date().toISOString()
  };
  
  localStorage.setItem(USER_EXERCISES_KEY, JSON.stringify(exercises));
  return exercises[exerciseIndex];
}

/**
 * Supprime un exercice personnalisé
 * @param {string} exerciseId - ID de l'exercice à supprimer
 * @returns {boolean} - True si la suppression a réussi
 */
export function deleteUserExercise(exerciseId) {
  const exercises = getUserExercises();
  const filteredExercises = exercises.filter(ex => ex.id !== exerciseId);
  
  if (filteredExercises.length === exercises.length) {
    return false; // Exercice non trouvé
  }
  
  localStorage.setItem(USER_EXERCISES_KEY, JSON.stringify(filteredExercises));
  return true;
}

/**
 * Récupère un exercice personnalisé par son ID
 * @param {string} exerciseId - ID de l'exercice
 * @returns {CustomExercise|null} - L'exercice ou null si non trouvé
 */
export function getUserExerciseById(exerciseId) {
  const exercises = getUserExercises();
  return exercises.find(ex => ex.id === exerciseId) || null;
}

/**
 * Marque un exercice comme utilisé (incrémente le compteur d'utilisation)
 * @param {string} exerciseId - ID de l'exercice
 * @returns {boolean} - True si l'opération a réussi
 */
export function markExerciseAsUsed(exerciseId) {
  const exercise = getUserExerciseById(exerciseId);
  if (!exercise) {
    return false;
  }
  
  const updates = {
    timesUsed: (exercise.timesUsed || 0) + 1,
    lastUsed: new Date().toISOString()
  };
  
  updateUserExercise(exerciseId, updates);
  return true;
}

/**
 * Recherche des exercices par nom ou catégorie
 * @param {string} query - Terme de recherche
 * @returns {Array<CustomExercise>} - Exercices correspondants
 */
export function searchUserExercises(query) {
  const exercises = getUserExercises();
  const lowercaseQuery = query.toLowerCase();
  
  return exercises.filter(exercise => 
    exercise.name.toLowerCase().includes(lowercaseQuery) ||
    exercise.category.toLowerCase().includes(lowercaseQuery) ||
    exercise.muscleGroup.toLowerCase().includes(lowercaseQuery) ||
    exercise.description.toLowerCase().includes(lowercaseQuery)
  );
}

/**
 * Récupère les exercices par catégorie
 * @param {string} category - Catégorie recherchée
 * @returns {Array<CustomExercise>} - Exercices de la catégorie
 */
export function getUserExercisesByCategory(category) {
  const exercises = getUserExercises();
  return exercises.filter(exercise => 
    exercise.category.toLowerCase() === category.toLowerCase()
  );
}

/**
 * Récupère les exercices les plus utilisés
 * @param {number} limit - Nombre d'exercices à retourner (défaut: 10)
 * @returns {Array<CustomExercise>} - Exercices triés par utilisation
 */
export function getMostUsedExercises(limit = 10) {
  const exercises = getUserExercises();
  return exercises
    .sort((a, b) => (b.timesUsed || 0) - (a.timesUsed || 0))
    .slice(0, limit);
}

/**
 * Récupère les exercices récemment créés
 * @param {number} limit - Nombre d'exercices à retourner (défaut: 5)
 * @returns {Array<CustomExercise>} - Exercices triés par date de création
 */
export function getRecentlyCreatedExercises(limit = 5) {
  const exercises = getUserExercises();
  return exercises
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit);
}

/**
 * Exporte tous les exercices personnalisés vers un fichier JSON
 * @returns {string} - JSON des exercices
 */
export function exportUserExercises() {
  const exercises = getUserExercises();
  return JSON.stringify(exercises, null, 2);
}

/**
 * Importe des exercices depuis un JSON
 * @param {string} jsonData - Données JSON des exercices
 * @param {boolean} replace - Si true, remplace tous les exercices existants
 * @returns {boolean} - True si l'import a réussi
 */
export function importUserExercises(jsonData, replace = false) {
  try {
    const importedExercises = JSON.parse(jsonData);
    
    if (!Array.isArray(importedExercises)) {
      return false;
    }
    
    let exercises = replace ? [] : getUserExercises();
    
    // Ajouter les exercices importés avec de nouveaux IDs
    importedExercises.forEach(exercise => {
      const customExercise = {
        ...exercise,
        id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        createdAt: new Date().toISOString(),
        lastUsed: exercise.lastUsed || new Date().toISOString(),
        timesUsed: exercise.timesUsed || 0
      };
      exercises.push(customExercise);
    });
    
    localStorage.setItem(USER_EXERCISES_KEY, JSON.stringify(exercises));
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'import des exercices:', error);
    return false;
  }
}

/**
 * Efface tous les exercices personnalisés
 * @returns {boolean} - True si l'opération a réussi
 */
export function clearAllUserExercises() {
  try {
    localStorage.removeItem(USER_EXERCISES_KEY);
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression des exercices:', error);
    return false;
  }
}

/**
 * Catégories d'exercices prédéfinies
 */
export const EXERCISE_CATEGORIES = [
  'Pectoraux',
  'Dos',
  'Épaules',
  'Biceps',
  'Triceps',
  'Jambes',
  'Fessiers',
  'Abdominaux',
  'Cardio',
  'Étirements',
  'Fonctionnel',
  'Autres'
];

/**
 * Groupes musculaires prédéfinis
 */
export const MUSCLE_GROUPS = [
  'Haut du corps',
  'Bas du corps',
  'Core',
  'Cardio',
  'Corps entier',
  'Mobilité'
];
