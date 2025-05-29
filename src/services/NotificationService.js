/**
 * Service de notifications pour l'application
 * Gère les notifications quotidiennes et les préférences utilisateur
 * Intégré avec OneSignal pour les notifications push
 * Optimisé pour Android et iOS
 */

import oneSignalService from './OneSignalService.js';

const NOTIFICATION_SETTINGS_KEY = 'notification_settings';
const DEFAULT_TIME = '16:00'; // 4h par défaut

/**
 * Détecte le type de plateforme et navigateur
 */
function getPlatformInfo() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  
  return {
    isAndroid: /android/i.test(userAgent),
    isIOS: /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream,
    isChrome: /Chrome/.test(userAgent) && /Google Inc/.test(navigator.vendor),
    isFirefox: /Firefox/.test(userAgent),
    isSamsung: /SamsungBrowser/.test(userAgent),
    isStandalone: window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone,
    isPWA: window.matchMedia('(display-mode: standalone)').matches
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
    useOneSignal: true,
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
  
  // Mettre à jour OneSignal si disponible
  if (newSettings.useOneSignal && oneSignalService.isAvailable()) {
    oneSignalService.updateNotificationPreferences(newSettings).catch(error => {
      console.error('Erreur mise à jour OneSignal:', error);
    });
  }
  
  // Reprogrammer les notifications avec les nouveaux paramètres
  scheduleWorkoutNotifications();
  
  return newSettings;
}

/**
 * Demande la permission pour les notifications avec gestion spéciale Android
 * @returns {Promise<boolean>} - True si la permission est accordée
 */
export async function requestNotificationPermission() {
  const settings = getNotificationSettings();
  const platform = getPlatformInfo();
  
  // Éviter les demandes trop fréquentes (Android limite les demandes)
  const now = Date.now();
  const timeSinceLastRequest = now - (settings.lastPermissionRequest || 0);
  const minInterval = 60000; // 1 minute minimum entre les demandes
  
  if (timeSinceLastRequest < minInterval) {
    console.log('Permission demandée trop récemment, attendre...');
    return false;
  }
  
  updateNotificationSettings({ lastPermissionRequest: now });

  // Stratégie spéciale pour Android
  if (platform.isAndroid) {
    return await requestAndroidNotificationPermission(settings, platform);
  }
  
  // Stratégie pour iOS
  if (platform.isIOS) {
    return await requestIOSNotificationPermission(settings);
  }
  
  // Fallback pour autres plateformes
  return await requestStandardNotificationPermission(settings);
}

/**
 * Gestion spécifique des permissions Android
 */
async function requestAndroidNotificationPermission(settings, platform) {
  console.log('Demande de permission Android:', platform);
  
  // 1. Essayer OneSignal en premier (plus fiable sur Android)
  if (settings.useOneSignal && oneSignalService.isAvailable()) {
    try {
      console.log('Tentative OneSignal pour Android...');
      const granted = await oneSignalService.requestPermission();
      if (granted) {
        updateNotificationSettings({ ...settings, permission: true });
        
        await oneSignalService.setUserTags({
          app: 'PFL',
          platform: 'android',
          browser: platform.isChrome ? 'chrome' : (platform.isSamsung ? 'samsung' : 'other'),
          language: 'fr',
          notifications_enabled: true,
          notification_time: settings.time
        });
        
        console.log('OneSignal configuré avec succès sur Android');
        return true;
      }
    } catch (error) {
      console.error('Erreur OneSignal Android:', error);
    }
  }
  
  // 2. Fallback vers notifications natives Android
  return await requestAndroidNativeNotifications(settings, platform);
}

/**
 * Notifications natives pour Android
 */
async function requestAndroidNativeNotifications(settings, platform) {
  if (!('Notification' in window)) {
    console.warn('Notifications non supportées sur ce navigateur Android');
    return false;
  }

  // Vérifier si déjà accordé
  if (Notification.permission === 'granted') {
    updateNotificationSettings({ ...settings, permission: true });
    return true;
  }

  // Sur Android, il faut parfois attendre que l'utilisateur interagisse
  if (Notification.permission === 'default') {
    try {
      // Afficher un message explicatif pour Android
      const shouldRequest = await showAndroidPermissionDialog();
      
      if (shouldRequest) {
        const permission = await Notification.requestPermission();
        const granted = permission === 'granted';
        
        updateNotificationSettings({ ...settings, permission: granted });
        
        if (granted) {
          console.log('Permission native accordée sur Android');
          // Enregistrer le service worker pour Android
          await registerAndroidServiceWorker();
        }
        
        return granted;
      }
    } catch (error) {
      console.error('Erreur permission native Android:', error);
    }
  }

  return false;
}

/**
 * Affiche un dialog explicatif pour Android
 */
function showAndroidPermissionDialog() {
  return new Promise((resolve) => {
    // Créer un dialog natif avec explanation
    const message = `
Pour recevoir vos rappels d'entraînement quotidiens, 
autorisez les notifications.

Sur Android:
• Appuyez sur "Autoriser" dans la popup
• Si elle n'apparaît pas, vérifiez les paramètres de votre navigateur
• Vous pouvez aussi ajouter cette app à votre écran d'accueil
    `;
    
    const result = confirm(message);
    resolve(result);
  });
}

/**
 * Enregistre le service worker spécifiquement pour Android
 */
async function registerAndroidServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      
      // Attendre que le service worker soit prêt
      await navigator.serviceWorker.ready;
      
      console.log('Service Worker enregistré pour Android:', registration);
      return registration;
    } catch (error) {
      console.error('Erreur enregistrement Service Worker Android:', error);
    }
  }
}

/**
 * Gestion spécifique des permissions iOS
 */
async function requestIOSNotificationPermission(settings) {
  // Sur iOS, OneSignal fonctionne généralement bien
  if (settings.useOneSignal && oneSignalService.isAvailable()) {
    try {
      const granted = await oneSignalService.requestPermission();
      if (granted) {
        updateNotificationSettings({ ...settings, permission: true });
        
        await oneSignalService.setUserTags({
          app: 'PFL',
          platform: 'ios',
          language: 'fr',
          notifications_enabled: true,
          notification_time: settings.time
        });
        
        return true;
      }
    } catch (error) {
      console.error('Erreur OneSignal iOS:', error);
    }
  }
  
  // Fallback vers notifications standard iOS
  return await requestStandardNotificationPermission(settings);
}

/**
 * Demande de permission standard
 */
async function requestStandardNotificationPermission(settings) {
  if (!('Notification' in window)) {
    console.warn('Ce navigateur ne supporte pas les notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    updateNotificationSettings({ ...settings, permission: true });
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    const granted = permission === 'granted';
    
    updateNotificationSettings({ ...settings, permission: granted });
    
    return granted;
  }

  return false;
}

/**
 * Programme les notifications quotidiennes
 */
export function scheduleWorkoutNotifications() {
  // Annuler les notifications précédentes
  if ('serviceWorker' in navigator && 'showNotification' in ServiceWorkerRegistration.prototype) {
    // Nettoyer les notifications existantes
    navigator.serviceWorker.ready.then(registration => {
      registration.getNotifications().then(notifications => {
        notifications.forEach(notification => {
          if (notification.tag === 'daily-workout') {
            notification.close();
          }
        });
      });
    });
  }

  const settings = getNotificationSettings();
  
  if (!settings.enabled || !settings.permission) {
    return;
  }

  // Programmer la prochaine notification
  scheduleNextNotification();
}

/**
 * Programme la prochaine notification quotidienne
 */
function scheduleNextNotification() {
  const settings = getNotificationSettings();
  const [hours, minutes] = settings.time.split(':').map(Number);
  
  const now = new Date();
  const scheduledTime = new Date();
  scheduledTime.setHours(hours, minutes, 0, 0);
  
  // Si l'heure est déjà passée aujourd'hui, programmer pour demain
  if (scheduledTime <= now) {
    scheduledTime.setDate(scheduledTime.getDate() + 1);
  }
  
  const timeUntilNotification = scheduledTime.getTime() - now.getTime();
  
  setTimeout(() => {
    showWorkoutNotification();
    // Programmer la prochaine notification (24h plus tard)
    setTimeout(scheduleNextNotification, 24 * 60 * 60 * 1000);
  }, timeUntilNotification);
  
  console.log(`Prochaine notification programmée pour: ${scheduledTime.toLocaleString()}`);
}

/**
 * Affiche la notification d'exercice quotidien
 */
function showWorkoutNotification() {
  const settings = getNotificationSettings();
  
  if (!settings.enabled || !settings.permission) {
    return;
  }

  const messages = [
    "C'est l'heure de votre entraînement quotidien ! 💪",
    "Votre corps vous attend ! Il est temps de s'entraîner 🏋️‍♂️",
    "L'excellence commence par l'action ! Prêt pour votre séance ? 🔥",
    "Chaque jour compte ! Votre entraînement vous attend ⭐",
    "Transformez votre journée avec un bon workout ! 💯"
  ];
  
  const randomMessage = messages[Math.floor(Math.random() * messages.length)];
  
  if ('serviceWorker' in navigator && 'showNotification' in ServiceWorkerRegistration.prototype) {
    // Notification via Service Worker (persiste même si l'app est fermée)
    navigator.serviceWorker.ready.then(registration => {
      registration.showNotification("Project Fat Loss", {
        body: randomMessage,
        icon: '/favicon.ico',
        badge: '/icon-192x192.png',
        tag: 'daily-workout',
        requireInteraction: true,
        actions: [
          {
            action: 'start',
            title: 'Commencer'
          },
          {
            action: 'later',
            title: 'Plus tard'
          }
        ],
        data: {
          type: 'daily-workout',
          url: window.location.origin
        }
      });
    });
  } else {
    // Notification basique
    new Notification("Project Fat Loss", {
      body: randomMessage,
      icon: '/favicon.ico',
      tag: 'daily-workout'
    });
  }
}

/**
 * Initialise le service de notifications
 */
export function initNotificationService() {
  // Initialiser OneSignal
  oneSignalService.init().then(() => {
    console.log('Service de notifications initialisé avec OneSignal');
  }).catch(error => {
    console.error('Erreur initialisation OneSignal:', error);
  });
  
  // Vérifier et demander les permissions si nécessaire
  requestNotificationPermission().then(granted => {
    if (granted) {
      scheduleWorkoutNotifications();
    }
  });
  
  // Écouter les clics sur les notifications
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', event => {
      if (event.data && event.data.type === 'notification-click') {
        // L'utilisateur a cliqué sur la notification
        window.focus();
      }
    });
  }
}

/**
 * Affiche une notification de test
 */
export async function showTestNotification() {
  const settings = getNotificationSettings();
  
  // Essayer d'abord OneSignal si activé
  if (settings.useOneSignal && oneSignalService.isAvailable()) {
    try {
      const success = await oneSignalService.sendTestNotification();
      if (success) {
        return true;
      }
    } catch (error) {
      console.error('Erreur test OneSignal, fallback vers notification standard:', error);
    }
  }
  
  // Fallback vers notification standard
  const hasPermission = await requestNotificationPermission();
  
  if (hasPermission && Notification.permission === 'granted') {
    try {
      const notification = new Notification("🏋️ Test PFL", {
        body: "Les notifications fonctionnent correctement ! 🎉",
        icon: '/favicon.ico',
        tag: 'test-notification',
        requireInteraction: false
      });
      
      // Fermer automatiquement après 4 secondes
      setTimeout(() => {
        notification.close();
      }, 4000);
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la création de la notification:', error);
      return false;
    }
  } else {
    console.warn('Permission de notification refusée ou non disponible');
    return false;
  }
}

/**
 * Obtient le statut actuel des permissions
 * @returns {Promise<string>} - 'granted', 'denied', ou 'default'
 */
export async function getNotificationPermissionStatus() {
  const settings = getNotificationSettings();
  
  // Vérifier OneSignal d'abord si activé
  if (settings.useOneSignal && oneSignalService.isAvailable()) {
    try {
      const status = await oneSignalService.getPermissionStatus();
      return status;
    } catch (error) {
      console.error('Erreur lors de la vérification du statut OneSignal:', error);
    }
  }
  
  // Fallback vers API standard
  if ('Notification' in window) {
    return Notification.permission;
  }
  
  return 'default';
}

/**
 * Obtient les heures disponibles pour les notifications
 * @returns {Array} - Liste des heures formatées
 */
export function getAvailableNotificationTimes() {
  const times = [];
  for (let hour = 6; hour <= 22; hour++) {
    times.push(`${hour.toString().padStart(2, '0')}:00`);
    times.push(`${hour.toString().padStart(2, '0')}:30`);
  }
  return times;
}

// Service de notification pour l'exercice en cours
// Gère l'affichage persistant sur l'écran de verrouillage

class NotificationService {
  constructor() {
    this.isSupported = 'serviceWorker' in navigator && 'Notification' in window;
    this.permission = Notification.permission;
    this.serviceWorker = null;
    this.currentExerciseNotificationShown = false;
    
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
      }
    } catch (error) {
      console.error('NotificationService: Erreur enregistrement SW:', error);
    }
  }

  // Demander la permission pour les notifications
  async requestPermission() {
    if (!this.isSupported) {
      return false;
    }

    if (this.permission === 'granted') {
      return true;
    }

    if (this.permission === 'denied') {
      console.warn('NotificationService: Permission refusée par l\'utilisateur');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      
      if (permission === 'granted') {
        console.log('NotificationService: Permission accordée');
        return true;
      } else {
        console.warn('NotificationService: Permission refusée');
        return false;
      }
    } catch (error) {
      console.error('NotificationService: Erreur demande permission:', error);
      return false;
    }
  }

  // Afficher une notification avec l'exercice en cours
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
      autoMode: exerciseData.autoMode || false
    };

    try {
      if (this.serviceWorker && this.serviceWorker.active) {
        this.serviceWorker.active.postMessage({
          type: 'CURRENT_EXERCISE_NOTIFICATION',
          payload: payload
        });
        
        this.currentExerciseNotificationShown = true;
        console.log('NotificationService: Notification exercice envoyée', payload);
      }
    } catch (error) {
      console.error('NotificationService: Erreur envoi notification:', error);
    }
  }

  // Mettre à jour la notification d'exercice
  async updateCurrentExercise(exerciseData) {
    if (!this.currentExerciseNotificationShown) {
      // Si aucune notification n'est affichée, en créer une
      return this.showCurrentExercise(exerciseData);
    }

    const payload = {
      exerciseName: exerciseData.name,
      setNum: exerciseData.currentSet,
      totalSets: exerciseData.totalSets,
      dayTitle: exerciseData.dayTitle,
      currentExercise: exerciseData.currentExercise,
      totalExercises: exerciseData.totalExercises,
      autoMode: exerciseData.autoMode || false
    };

    try {
      if (this.serviceWorker && this.serviceWorker.active) {
        this.serviceWorker.active.postMessage({
          type: 'UPDATE_EXERCISE_NOTIFICATION',
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
        this.serviceWorker.active.postMessage({
          type: 'CLEAR_EXERCISE_NOTIFICATION'
        });
        
        this.currentExerciseNotificationShown = false;
        console.log('NotificationService: Notification exercice supprimée');
      }
    } catch (error) {
      console.error('NotificationService: Erreur suppression notification:', error);
    }
  }

  // Vérifier si les notifications sont supportées et autorisées
  isEnabled() {
    return this.isSupported && this.permission === 'granted';
  }

  // Obtenir le statut des permissions
  getPermissionStatus() {
    return {
      supported: this.isSupported,
      permission: this.permission,
      enabled: this.isEnabled()
    };
  }
}

// Instance singleton
const notificationService = new NotificationService();

export default notificationService;

