/**
 * Service de synthèse vocale pour l'application FatLoss
 * Utilise l'API Web Speech de Google intégrée dans les navigateurs modernes
 */

// Configuration initiale de la voix
let voiceConfig = {
  enabled: true,          // Activée par défaut maintenant
  volume: 1.0,             // Volume (0 à 1)
  rate: 1.0,               // Vitesse de parole (0.1 à 10)
  pitch: 1.0,              // Tonalité (0 à 2)
  lang: 'fr-FR',           // Langue par défaut
  voice: null,             // Voix spécifique (sera définie automatiquement)
  countdownEnabled: true,  // Annoncer les décomptes
  exerciseEnabled: true,   // Annoncer les exercices
  pauseEnabled: true       // Annoncer les pauses
};

// Liste des voix disponibles
let availableVoices = [];

/**
 * Initialiser le service de synthèse vocale
 */
export function initSpeechService() {
  if (!window.speechSynthesis) {
    console.error("La synthèse vocale n'est pas prise en charge par ce navigateur.");
    return false;
  }

  console.log("Initialisation du service de synthèse vocale...");

  // Nettoyer tout état précédent
  window.speechSynthesis.cancel();

  // Fonction pour mettre à jour les voix disponibles
  const updateVoices = () => {
    availableVoices = window.speechSynthesis.getVoices();
    console.log("Voix disponibles:", availableVoices.length);
    
    // Essayer de trouver une voix française
    const frenchVoice = availableVoices.find(voice => 
      voice.lang.includes('fr') || voice.name.includes('French') || voice.name.includes('français')
    );
    
    if (frenchVoice) {
      console.log("Voix française trouvée:", frenchVoice.name);
      voiceConfig.voice = frenchVoice;
    } else if (availableVoices.length > 0) {
      console.log("Aucune voix française trouvée, utilisation de:", availableVoices[0].name);
      voiceConfig.voice = availableVoices[0];
    }
  };

  // Chrome nécessite cet événement pour charger les voix
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = updateVoices;
  }

  // Essayer de charger les voix immédiatement (peut fonctionner sur Firefox)
  updateVoices();

  // Tester la synthèse avec un message court pour vérifier que ça fonctionne
  setTimeout(() => {
    speak("Synthèse vocale initialisée.", { volume: 0.7 });
  }, 1000);

  return true;
}

/**
 * Prononce un texte à voix haute
 * @param {string} text - Le texte à prononcer
 * @param {Object} options - Options de personnalisation (optionnel)
 * @returns {Promise} Une promesse résolue lorsque l'énoncé est terminé
 */
function speak(text, options = {}) {
  return new Promise((resolve, reject) => {
    if (!voiceConfig.enabled || !window.speechSynthesis) {
      resolve(); // Résout immédiatement si la synthèse est désactivée
      return;
    }

    // Annuler toute annonce en cours
    window.speechSynthesis.cancel();

    // Créer un nouvel objet d'énoncé
    const utterance = new SpeechSynthesisUtterance(text);

    // Configurer l'énoncé avec les options par défaut et personnalisées
    utterance.volume = options.volume !== undefined ? options.volume : voiceConfig.volume;
    utterance.rate = options.rate !== undefined ? options.rate : voiceConfig.rate;
    utterance.pitch = options.pitch !== undefined ? options.pitch : voiceConfig.pitch;
    utterance.lang = options.lang || voiceConfig.lang;
    utterance.voice = options.voice || voiceConfig.voice;

    // Ajouter des gestionnaires d'événements
    utterance.onend = () => resolve();
    utterance.onerror = (event) => {
      console.error("Erreur de synthèse vocale:", event);
      reject(event);
    };

    // Prononcer le texte
    window.speechSynthesis.speak(utterance);
  });
}

/**
 * Active ou désactive la synthèse vocale
 * @param {boolean} enabled - Indique si la synthèse vocale doit être activée
 */
function setEnabled(enabled) {
  voiceConfig.enabled = !!enabled;
  return voiceConfig.enabled;
}

/**
 * Modifie la configuration de la synthèse vocale
 * @param {Object} config - Nouvelles valeurs de configuration
 * @returns {Object} La configuration mise à jour
 */
function updateConfig(config = {}) {
  voiceConfig = { ...voiceConfig, ...config };
  return voiceConfig;
}

/**
 * Obtient la configuration actuelle de la synthèse vocale
 * @returns {Object} La configuration actuelle
 */
function getConfig() {
  return { ...voiceConfig };
}

/**
 * Obtient la liste des voix disponibles
 * @returns {Array} Liste des voix disponibles
 */
function getVoices() {
  return [...availableVoices];
}

/**
 * Annonce un exercice
 * @param {Object} exercise - L'exercice à annoncer
 * @param {number} setNum - Numéro de la série actuelle
 * @param {number} totalSets - Nombre total de séries
 */
function announceExercise(exercise, setNum = 0, totalSets = 1) {
  if (!voiceConfig.enabled || !voiceConfig.exerciseEnabled) return;
  
  // Extraire les informations de l'exercice
  const name = exercise.name || '';
  const equipment = exercise.equip || '';
  
  // Construire le texte à annoncer - simplifié selon la demande
  let text = `${name}.`;
  
  if (equipment) {
    text += ` Matériel: ${equipment}.`;
  }
  
  // Ajouter l'information sur la série en cours
  text += ` Série ${setNum + 1} sur ${totalSets}.`;
  
  speak(text);
}

/**
 * Annonce une pause
 * @param {number} duration - Durée de la pause en secondes
 * @param {boolean} isTransition - Indique s'il s'agit d'une transition entre exercices
 * @param {Object} nextExercise - Exercice suivant (si en transition)
 */
function announcePause(duration, isTransition, nextExercise) {
  if (!voiceConfig.enabled || !voiceConfig.pauseEnabled) return;
  
  let text = `Pause: ${duration} secondes.`;
  if (isTransition && nextExercise) {
    text += ` Prochain exercice: ${nextExercise.name}.`;
  }
  
  speak(text);
}

/**
 * Annonce un décompte
 * @param {number} count - Le nombre à annoncer
 */
function announceCount(count) {
  if (!voiceConfig.enabled || !voiceConfig.countdownEnabled) return;
  
  speak(`${count}`, { rate: 1.2 });
}

/**
 * Annonce une répétition d'exercice
 * @param {number} rep - Numéro de la répétition actuelle
 * @param {number} total - Nombre total de répétitions
 */
function announceRepetition(rep, total) {
  if (!voiceConfig.enabled || !voiceConfig.countdownEnabled) return;
  
  // Annoncer uniquement certaines répétitions pour ne pas trop submerger l'utilisateur
  if (rep === 1 || rep === Math.floor(total / 2) || rep === total) {
    speak(`Répétition ${rep}`, { rate: 1.2 });
  }
}

/**
 * Annonce la fin d'un entraînement
 * @param {Object} summary - Récapitulatif de l'entraînement
 */
function announceWorkoutComplete(summary) {
  if (!voiceConfig.enabled) return;
  
  const text = `Entraînement terminé. Vous avez brûlé ${summary.calories} calories. Félicitations!`;
  speak(text);
}

export {
  initSpeechService,
  speak,
  setEnabled,
  updateConfig,
  getConfig,
  getVoices,
  announceExercise,
  announcePause,
  announceCount,
  announceRepetition,
  announceWorkoutComplete
};
