/**
 * Service de synthèse vocale pour l'application FatLoss
 * Utilise l'API Web Speech de Google intégrée dans les navigateurs modernes
 */

// Clé de persistance du réglage activé/désactivé (mémorisé entre les sessions)
const SPEECH_ENABLED_KEY = 'speech_enabled';

/**
 * Lit l'état activé/désactivé mémorisé dans le localStorage.
 * @returns {boolean} true par défaut (annonces activées) si aucun réglage enregistré.
 */
function loadStoredEnabled() {
  try {
    const stored = localStorage.getItem(SPEECH_ENABLED_KEY);
    if (stored !== null) return stored === 'true';
  } catch (e) {}
  return true;
}

// Configuration initiale de la voix - RÉACTIVÉE POUR LES EXERCICES
let voiceConfig = {
  enabled: loadStoredEnabled(), // Activée par défaut, mémorisée entre les sessions
  volume: 0.8,             // Volume (0 à 1)
  rate: 1.0,               // Vitesse de parole (0.1 à 10)
  pitch: 1.0,              // Tonalité (0 à 2)
  lang: 'fr-FR',           // Langue par défaut
  voice: null,             // Voix spécifique (sera définie automatiquement)
  countdownEnabled: false,  // Ne pas annoncer les décomptes
  exerciseEnabled: true,    // Annoncer uniquement les exercices
  pauseEnabled: false       // Ne pas annoncer les pauses
};

// Liste des voix disponibles
let availableVoices = [];

/**
 * Initialiser le service de synthèse vocale
 */
function initSpeechService() {
  if (!window.speechSynthesis) {
    console.error("La synthèse vocale n'est pas prise en charge par ce navigateur.");
    return false;
  }

  // Nettoyer tout état précédent
  window.speechSynthesis.cancel();

  // Fonction pour mettre à jour les voix disponibles
  const updateVoices = () => {
    availableVoices = window.speechSynthesis.getVoices();
    
    // Essayer de trouver une voix française
    const frenchVoice = availableVoices.find(voice => 
      voice.lang.includes('fr') || voice.name.includes('French') || voice.name.includes('français')
    );
    
    if (frenchVoice) {
      voiceConfig.voice = frenchVoice;
    } else if (availableVoices.length > 0) {
      voiceConfig.voice = availableVoices[0];
    }
  };

  // Chrome nécessite cet événement pour charger les voix
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = updateVoices;
  }

  // Essayer de charger les voix immédiatement (peut fonctionner sur Firefox)
  updateVoices();

  return true;
}

/**
 * Prononce un texte à voix haute
 * @param {string} text - Le texte à prononcer
 * @param {Object} options - Options de personnalisation (optionnel)
 * @returns {Promise} Une promesse résolue lorsque l'énoncé est terminé
 */
function speak(text, options = {}) {
  return new Promise((resolve) => {
    // Vérifier si la synthèse vocale est activée
    if (!voiceConfig.enabled || !window.speechSynthesis) {
      resolve();
      return;
    }

    // Annuler toute annonce en cours
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configurer la voix
    if (voiceConfig.voice) {
      utterance.voice = voiceConfig.voice;
    }
    
    // Appliquer les paramètres personnalisés
    utterance.volume = options.volume !== undefined ? options.volume : voiceConfig.volume;
    utterance.rate = options.rate !== undefined ? options.rate : voiceConfig.rate;
    utterance.pitch = options.pitch !== undefined ? options.pitch : voiceConfig.pitch;
    utterance.lang = options.lang || voiceConfig.lang;
    
    // Gérer les événements
    utterance.onend = () => resolve();
    utterance.onerror = (error) => {
      console.error('Erreur de synthèse vocale:', error);
      resolve();
    };
    
    // Démarrer la synthèse
    window.speechSynthesis.speak(utterance);
  });
}

/**
 * Active ou désactive la synthèse vocale
 * @param {boolean} enabled - Indique si la synthèse vocale doit être activée
 */
function setEnabled(enabled) {
  voiceConfig.enabled = !!enabled;
  try {
    localStorage.setItem(SPEECH_ENABLED_KEY, String(voiceConfig.enabled));
  } catch (e) {}
  // Couper immédiatement toute annonce en cours si on désactive
  if (!voiceConfig.enabled && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  return voiceConfig.enabled;
}

/**
 * Indique si la synthèse vocale est actuellement activée.
 * @returns {boolean}
 */
function isEnabled() {
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
 * @param {boolean} isPaused - Indique si l'exercice est en pause
 */
function announceExercise(exercise, setNum = 0, totalSets = 1, isPaused = false) {
  if (!voiceConfig.enabled || !voiceConfig.exerciseEnabled || isPaused) return;

  // Extraire les informations de l'exercice
  const name = exercise.name || '';

  // Annoncer l'exercice puis la série en cours
  let text = `${name}.`;
  if (totalSets > 1) {
    text += ` Série ${setNum + 1} sur ${totalSets}.`;
  }

  speak(text);
}

/**
 * Annonce uniquement la série en cours (changement de série au sein d'un même exercice)
 * @param {number} setNum - Index de la série actuelle (0 = première)
 * @param {number} totalSets - Nombre total de séries
 */
function announceSet(setNum = 0, totalSets = 1) {
  if (!voiceConfig.enabled || !voiceConfig.exerciseEnabled) return;
  if (totalSets <= 1) return;

  speak(`Série ${setNum + 1} sur ${totalSets}.`);
}

/**
 * Annonce une pause - DÉSACTIVÉE
 * @param {number} duration - Durée de la pause en secondes
 * @param {boolean} isTransition - Indique s'il s'agit d'une transition entre exercices
 * @param {Object} nextExercise - Exercice suivant (si en transition)
 */
function announcePause(duration, isTransition, nextExercise) {
  // Désactivé - plus d'annonces de pause
  return;
}

/**
 * Annonce un décompte - DÉSACTIVÉE
 * @param {number} count - Le nombre à annoncer
 */
function announceCount(count) {
  // Désactivé - plus d'annonces de décompte
  return;
}

/**
 * Annonce une répétition d'exercice - DÉSACTIVÉE
 * @param {number} rep - Numéro de la répétition actuelle
 * @param {number} total - Nombre total de répétitions
 */
function announceRepetition(rep, total) {
  // Désactivé - plus d'annonces de répétitions
  return;
}

/**
 * Annonce le changement de côté d'un exercice unilatéral (un bras / une jambe
 * à la fois) : le passage au second côté étant automatique, la voix prévient
 * l'utilisateur qui a les mains prises par l'haltère.
 * @param {number} side - Index du côté qui démarre (0 = premier, 1 = second)
 */
function announceSideChange(side = 1) {
  if (!voiceConfig.enabled || !voiceConfig.exerciseEnabled) return;

  speak(side === 0 ? 'Premier côté.' : 'Changez de côté. Second côté.');
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
  isEnabled,
  updateConfig,
  getConfig,
  getVoices,
  announceExercise,
  announceSet,
  announcePause,
  announceCount,
  announceRepetition,
  announceSideChange,
  announceWorkoutComplete
};
