/**
 * Service de notifications pour l'application
 * Gère les notifications quotidiennes et les préférences utilisateur
 * Optimisé pour Android 15 et iOS
 * Version 2.0 - Support widget/notification persistante
 */

const NOTIFICATION_SETTINGS_KEY = 'notification_settings';
const DEFAULT_TIME = '16:00'; // 4h par défaut

/**
 * Détecte le type de plateforme et navigateur avec support Android 15
 */
function getPlatformInfo() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  
  // Détection spécifique Android 15
  const androidVersion = userAgent.match(/Android (\d+)/);
  const androidVersionNumber = androidVersion ? parseInt(androidVersion[1], 10) : 0;
  
  return {
    isAndroid: /android/i.test(userAgent),
    isAndroid15Plus: androidVersionNumber >= 15,
    isIOS: /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream,
    isChrome: /Chrome/.test(userAgent) && /Google Inc/.test(navigator.vendor),
    isFirefox: /Firefox/.test(userAgent),
    isSamsung: /SamsungBrowser/.test(userAgent),
    isStandalone: window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone,
    isPWA: window.matchMedia('(display-mode: standalone)').matches,
    androidVersion: androidVersionNumber,
    supportsNotificationActions: 'ServiceWorkerRegistration' in window && 'showNotification' in ServiceWorkerRegistration.prototype
  };
}

/**
 * Obtient les paramètres de notification
 * @returns {Object} - Paramètres de notification
 */
export function getNotificationSettings() {
  const settings = localStorage.getItem(NOTIFICATION_SETTINGS_KEY);
  return settings ? JSON.parse(settings) : {
    enabled: true,
    time: DEFAULT_TIME,
    permission: false,
    androidFallback: true,
    lastPermissionRequest: 0
  };
}

/**
 * Met à jour les paramètres de notification
 * @param {Object} settings - Nouveaux paramètres
 * @returns {Object} - Paramètres mis à jour
 */
export function updateNotificationSettings(settings) {
  const currentSettings = getNotificationSettings();
  const newSettings = { ...currentSettings, ...settings };
  localStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(newSettings));
  
  // Notification service mis à jour
  
  // Reprogrammer les notifications avec les nouveaux paramètres
  scheduleWorkoutNotifications();
  
  return newSettings;
}

/**
 * Demande la permission pour les notifications - Version simplifiée
 * @returns {Promise<boolean>} - True si la permission est accordée
 */
export async function requestNotificationPermission() {
  console.log('🔔 Demande de permission de notification');
  
  // Vérifier si les notifications sont supportées
  if (!('Notification' in window)) {
    console.warn('Notifications non supportées par ce navigateur');
    return false;
  }
  
  // Si déjà accordé, retourner true
  if (Notification.permission === 'granted') {
    updateNotificationSettings({ permission: true });
    console.log('✅ Permission déjà accordée');
    return true;
  }
  
  // Si bloqué, retourner false
  if (Notification.permission === 'denied') {
    console.warn('Notifications bloquées par l\'utilisateur');
    updateNotificationSettings({ permission: false });
    return false;
  }

  // Demander la permission native directement
  try {
    console.log('🚀 Demande permission native...');
    const permission = await Notification.requestPermission();
    console.log('🔔 Résultat permission:', permission);
    
    if (permission === 'granted') {
      updateNotificationSettings({ permission: true });
      console.log('✅ Permission accordée !');
      
      // Programmer les notifications quotidiennes
      await scheduleWorkoutNotifications();
      
      return true;
    } else {
      updateNotificationSettings({ permission: false });
      console.log('❌ Permission refusée');
      return false;
    }
  } catch (error) {
    console.error('❌ Erreur demande permission:', error);
    updateNotificationSettings({ permission: false });
    return false;
  }
}

/**
 * Fonction de test de notification pour les composants
 */
export async function showTestNotification() {
  try {
    console.log('🧪 Test de notification démarré');
    
    // Vérifier le support
    if (!('Notification' in window)) {
      console.warn('Notifications non supportées');
      return false;
    }
    
    // Vérifier les permissions
    if (Notification.permission !== 'granted') {
      console.log('Permission nécessaire, demande...');
      const permission = await requestNotificationPermission();
      if (!permission) {
        console.log('Permission refusée pour le test');
        return false;
      }
    }
    
    // Afficher une notification de test via Service Worker si disponible
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        
        if (registration.active) {
          registration.active.postMessage({
            type: 'TEST_NOTIFICATION',
            payload: {
              title: 'Test Notification ✅',
              body: 'Vos notifications fonctionnent parfaitement ! 🎉',
              tag: 'test-notification'
            }
          });
          console.log('✅ Test notification envoyé via Service Worker');
          return true;
        }
      } catch (swError) {
        console.warn('Service Worker non disponible, fallback direct:', swError);
      }
    }
    
    // Fallback : notification directe
    try {
      new Notification('Test Notification ✅', {
        body: 'Vos notifications fonctionnent parfaitement ! 🎉',
        icon: '/android/android-launchericon-192-192.png',
        badge: '/android/android-launchericon-96-96.png',
        vibrate: [200, 100, 200],
        tag: 'test-notification',
        requireInteraction: false,
        silent: false
      });
      console.log('✅ Test notification envoyé directement');
      return true;
    } catch (directError) {
      console.error('❌ Erreur notification directe:', directError);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Erreur test notification:', error);
    return false;
  }
}

/**
 * Programme les notifications quotidiennes d'entraînement
 */
export async function scheduleWorkoutNotifications() {
  try {
    console.log('📅 Programmation des notifications quotidiennes');
    
    // Vérifier les permissions
    if (Notification.permission !== 'granted') {
      console.log('❌ Pas de permission pour programmer les notifications');
      return false;
    }
    
    // Obtenir les paramètres utilisateur
    const settings = getNotificationSettings();
    
    if (!settings.enabled) {
      console.log('⚠️ Notifications désactivées par l\'utilisateur');
      return false;
    }
    
    // Vérifier si le Service Worker est disponible
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        
        if (registration.active) {
          // Envoyer les paramètres au Service Worker
          registration.active.postMessage({
            type: 'SCHEDULE_NOTIFICATION',
            payload: {
              time: settings.time || DEFAULT_TIME,
              enabled: settings.enabled,
              title: '🏋️ Temps d\'Entraînement !',
              body: 'Il est temps de brûler des calories ! Votre corps vous attend 💪',
              tag: 'daily-workout-reminder',
              requireInteraction: true,
              actions: [
                {
                  action: 'start',
                  title: '🚀 Commencer',
                  icon: '/android/android-launchericon-48-48.png'
                },
                {
                  action: 'later',
                  title: '⏰ Plus tard',
                  icon: '/android/android-launchericon-48-48.png'
                }
              ]
            }
          });
          
          console.log(`✅ Notifications programmées pour ${settings.time}`);
          return true;
        }
      } catch (error) {
        console.error('❌ Erreur programmation Service Worker:', error);
      }
    }
    
    // Fallback : programmer via setTimeout (moins fiable)
    console.log('⚠️ Fallback: programmation locale');
    scheduleLocalNotification(settings.time || DEFAULT_TIME);
    return true;
    
  } catch (error) {
    console.error('❌ Erreur programmation notifications:', error);
    return false;
  }
}

/**
 * Programme une notification locale (fallback)
 */
function scheduleLocalNotification(time) {
  // Calculer le délai jusqu'à la prochaine notification
  const now = new Date();
  const [hours, minutes] = time.split(':').map(Number);
  
  const targetTime = new Date();
  targetTime.setHours(hours, minutes, 0, 0);
  
  // Si l'heure est déjà passée aujourd'hui, programmer pour demain
  if (targetTime <= now) {
    targetTime.setDate(targetTime.getDate() + 1);
  }
  
  const delay = targetTime.getTime() - now.getTime();
  
  console.log(`⏰ Prochaine notification dans ${Math.round(delay / (1000 * 60 * 60))}h ${Math.round((delay % (1000 * 60 * 60)) / (1000 * 60))}min`);
  
  // Programmer la notification
  setTimeout(() => {
    if (Notification.permission === 'granted') {
      new Notification('🏋️ Temps d\'Entraînement !', {
        body: 'Il est temps de brûler des calories ! Votre corps vous attend 💪',
        icon: '/android/android-launchericon-192-192.png',
        badge: '/android/android-launchericon-96-96.png',
        tag: 'daily-workout-reminder',
        requireInteraction: true,
        vibrate: [300, 100, 300, 100, 300],
        data: {
          type: 'daily-reminder',
          timestamp: Date.now()
        }
      });
      
      // Reprogrammer pour le lendemain
      scheduleLocalNotification(time);
    }
  }, delay);
}

export async function requestAndroidNotificationPermission(settings, platform) {
  console.log('Demande permission Android classique:', platform);
  
  try {
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      updateNotificationSettings({ permission: true });
      return true;
    } else {
      updateNotificationSettings({ permission: false });
      return false;
    }
  } catch (error) {
    console.error('Erreur permission Android:', error);
    return false;
  }
}

export async function requestIOSNotificationPermission(settings) {
  console.log('Demande permission iOS');
  
  try {
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      updateNotificationSettings({ permission: true });
      return true;
    } else {
      updateNotificationSettings({ permission: false });
      return false;
    }
  } catch (error) {
    console.error('Erreur permission iOS:', error);
    return false;
  }
}

export async function requestStandardNotificationPermission(settings) {
  console.log('Demande permission standard');
  
  try {
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      updateNotificationSettings({ permission: true });
      return true;
    } else {
      updateNotificationSettings({ permission: false });
      return false;
    }
  } catch (error) {
    console.error('Erreur permission standard:', error);
    return false;
  }
}

// Service de notification pour l'exercice en cours - Version améliorée
class NotificationService {
  constructor() {
    this.isSupported = 'serviceWorker' in navigator && 'Notification' in window;
    this.permission = Notification.permission;
    this.serviceWorker = null;
    this.currentExerciseNotificationShown = false;
    this.platform = getPlatformInfo();
    this.persistentNotificationId = null;
    
    this.init();
  }

  async init() {
    if (!this.isSupported) {
      console.warn('Notifications non supportées sur ce navigateur');
      return;
    }

    try {
      // Enregistrer le service worker si pas déjà fait
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.register('/sw.js');
        this.serviceWorker = registration;
        console.log('NotificationService: Service Worker enregistré');
        
        // Configuration spéciale pour Android 15
        if (this.platform.isAndroid15Plus) {
          await this.configureForAndroid15();
        }
      }
    } catch (error) {
      console.error('NotificationService: Erreur enregistrement SW:', error);
    }
  }

  // Configuration spéciale pour Android 15
  async configureForAndroid15() {
    try {
      if (this.serviceWorker && this.serviceWorker.active) {
        this.serviceWorker.active.postMessage({
          type: 'CONFIGURE_ANDROID15',
          payload: {
            persistentNotifications: true,
            enhancedVibration: true,
            fullScreenIntent: true,
            workoutMode: true
          }
        });
        console.log('NotificationService: Configuré pour Android 15');
      }
    } catch (error) {
      console.error('NotificationService: Erreur configuration Android 15:', error);
    }
  }

  // Demander la permission pour les notifications avec support Android 15
  async requestPermission() {
    if (!this.isSupported) {
      return false;
    }

    // Utiliser la fonction de demande spécifique à la plateforme
    const granted = await requestNotificationPermission();
    this.permission = Notification.permission;
    
    return granted;
  }

  // Afficher une notification avec l'exercice en cours - Version améliorée
  async showCurrentExercise(exerciseData) {
    const hasPermission = await this.requestPermission();
    if (!hasPermission) {
      console.warn('NotificationService: Pas de permission pour les notifications');
      return;
    }

    const payload = {
      exerciseName: exerciseData.name,
      setNum: exerciseData.currentSet,
      totalSets: exerciseData.totalSets,
      dayTitle: exerciseData.dayTitle,
      currentExercise: exerciseData.currentExercise,
      totalExercises: exerciseData.totalExercises,
      autoMode: exerciseData.autoMode || false,
      timestamp: Date.now(),
      // Nouvelles données pour la notification persistante
      remainingTime: exerciseData.remainingTime,
      exerciseType: exerciseData.exerciseType, // 'timer', 'reps', 'chrono'
      isPaused: exerciseData.isPaused || false,
      calories: exerciseData.calories || 0
    };

    try {
      if (this.serviceWorker && this.serviceWorker.active) {
        // Message adapté selon la plateforme
        const messageType = this.platform.isAndroid15Plus ? 
          'CURRENT_EXERCISE_NOTIFICATION_ANDROID15' : 
          'CURRENT_EXERCISE_NOTIFICATION';
          
        this.serviceWorker.active.postMessage({
          type: messageType,
          payload: payload
        });
        
        this.currentExerciseNotificationShown = true;
        console.log('NotificationService: Notification exercice envoyée', payload);
      }
    } catch (error) {
      console.error('NotificationService: Erreur envoi notification:', error);
    }
  }

  // Mettre à jour la notification d'exercice avec timer en temps réel
  async updateCurrentExercise(exerciseData) {
    if (!this.currentExerciseNotificationShown) {
      return this.showCurrentExercise(exerciseData);
    }

    const payload = {
      exerciseName: exerciseData.name,
      setNum: exerciseData.currentSet,
      totalSets: exerciseData.totalSets,
      dayTitle: exerciseData.dayTitle,
      currentExercise: exerciseData.currentExercise,
      totalExercises: exerciseData.totalExercises,
      autoMode: exerciseData.autoMode || false,
      timestamp: Date.now(),
      // Mise à jour en temps réel
      remainingTime: exerciseData.remainingTime,
      currentRep: exerciseData.currentRep,
      totalReps: exerciseData.totalReps,
      exerciseType: exerciseData.exerciseType,
      isPaused: exerciseData.isPaused || false,
      calories: exerciseData.calories || 0,
      progress: exerciseData.progress || 0 // Pourcentage de progression
    };

    try {
      if (this.serviceWorker && this.serviceWorker.active) {
        const messageType = this.platform.isAndroid15Plus ? 
          'UPDATE_EXERCISE_NOTIFICATION_ANDROID15' : 
          'UPDATE_EXERCISE_NOTIFICATION';
          
        this.serviceWorker.active.postMessage({
          type: messageType,
          payload: payload
        });
        
        console.log('NotificationService: Notification exercice mise à jour', payload);
      }
    } catch (error) {
      console.error('NotificationService: Erreur mise à jour notification:', error);
    }
  }

  // Supprimer la notification d'exercice en cours
  async clearCurrentExercise() {
    try {
      if (this.serviceWorker && this.serviceWorker.active) {
        const messageType = this.platform.isAndroid15Plus ? 
          'CLEAR_EXERCISE_NOTIFICATION_ANDROID15' : 
          'CLEAR_EXERCISE_NOTIFICATION';
          
        this.serviceWorker.active.postMessage({
          type: messageType
        });
        
        this.currentExerciseNotificationShown = false;
        console.log('NotificationService: Notification exercice supprimée');
      }
    } catch (error) {
      console.error('NotificationService: Erreur suppression notification:', error);
    }
  }

  // Nouvelle méthode : Notification de pause avec timer
  async showPauseNotification(pauseData) {
    const hasPermission = await this.requestPermission();
    if (!hasPermission) return;

    const payload = {
      type: 'pause',
      remainingTime: pauseData.remainingTime,
      nextExercise: pauseData.nextExercise,
      currentSet: pauseData.currentSet,
      totalSets: pauseData.totalSets,
      autoMode: pauseData.autoMode || false
    };

    try {
      if (this.serviceWorker && this.serviceWorker.active) {
        this.serviceWorker.active.postMessage({
          type: 'PAUSE_NOTIFICATION',
          payload: payload
        });
        
        console.log('NotificationService: Notification pause envoyée', payload);
      }
    } catch (error) {
      console.error('NotificationService: Erreur notification pause:', error);
    }
  }

  // Vérifier si les notifications sont supportées et autorisées
  isEnabled() {
    return this.isSupported && this.permission === 'granted';
  }

  // Obtenir le statut des permissions avec info Android 15
  getPermissionStatus() {
    return {
      supported: this.isSupported,
      permission: this.permission,
      enabled: this.isEnabled(),
      platform: this.platform,
      android15Compatible: this.platform.isAndroid15Plus && this.permission === 'granted'
    };
  }
}

// Instance singleton
const notificationService = new NotificationService();

export default notificationService;

/**
 * Obtient le statut des permissions de notification
 * @returns {Promise<string>} - Le statut de permission ('granted', 'denied', 'default', 'not-supported')
 */
export async function getNotificationPermissionStatus() {
  try {
    // Vérifier le support des notifications
    if (!('Notification' in window)) {
      return 'not-supported';
    }
    
    // Retourner directement le statut de permission natif
    const permission = Notification.permission;
    console.log('📋 Statut permission:', permission);
    
    return permission;
    
  } catch (error) {
    console.error('❌ Erreur vérification permission:', error);
    return 'error';
  }
}

/**
 * Obtient les heures disponibles pour les notifications
 * @returns {Array} - Liste des heures disponibles
 */
export function getAvailableNotificationTimes() {
  const times = [];
  
  // Générer les heures de 6h à 23h par intervalles de 30 minutes
  for (let hour = 6; hour <= 23; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const displayTime = minute === 0 ? `${hour}h00` : `${hour}h30`;
      
      times.push({
        value: timeString,
        label: displayTime,
        description: minute === 0 ? 
          (hour < 12 ? 'Matin' : hour < 18 ? 'Après-midi' : 'Soir') : 
          (hour < 12 ? 'Matin' : hour < 18 ? 'Après-midi' : 'Soir')
      });
    }
  }
  
  return times;
}

/**
 * Initialise le service de notifications
 * @returns {Promise<void>}
 */
export async function initNotificationService() {
  try {
    console.log('Initialisation du service de notifications...');
    
    // Initialiser le service singleton
    await notificationService.init();
    
    // Vérifier si les notifications sont supportées
    if (!('Notification' in window)) {
      console.warn('Les notifications ne sont pas supportées par ce navigateur');
      return;
    }
    
    // Obtenir les paramètres actuels
    const settings = getNotificationSettings();
    
    // Si les notifications sont activées mais pas autorisées, ne pas forcer la demande
    if (settings.enabled && Notification.permission === 'default') {
      console.log('Notifications activées mais permission non demandée - en attente de l\'action utilisateur');
    }
    
    // Programmer les notifications quotidiennes si autorisées
    if (Notification.permission === 'granted') {
      await scheduleWorkoutNotifications();
      console.log('Notifications quotidiennes programmées');
    }
    
    // Enregistrer le service worker pour les notifications
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (!registration) {
          await navigator.serviceWorker.register('/sw.js');
          console.log('Service Worker enregistré pour les notifications');
        }
      } catch (error) {
        console.warn('Erreur enregistrement Service Worker:', error);
      }
    }
    
    console.log('Service de notifications initialisé avec succès');
    
  } catch (error) {
    console.error('Erreur lors de l\'initialisation du service de notifications:', error);
    // Ne pas bloquer l'application si les notifications échouent
  }
}

