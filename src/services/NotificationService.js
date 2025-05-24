/**
 * Service de notifications pour l'application
 * Gère les notifications quotidiennes et les préférences utilisateur
 * Intégré avec OneSignal pour les notifications push
 */

import oneSignalService from './OneSignalService.js';

const NOTIFICATION_SETTINGS_KEY = 'notification_settings';
const DEFAULT_TIME = '16:00'; // 4h par défaut

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
    useOneSignal: true
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
 * Demande la permission pour les notifications
 * @returns {Promise<boolean>} - True si la permission est accordée
 */
export async function requestNotificationPermission() {
  const settings = getNotificationSettings();
  
  // Essayer d'abord OneSignal si activé
  if (settings.useOneSignal && oneSignalService.isAvailable()) {
    try {
      const granted = await oneSignalService.requestPermission();
      if (granted) {
        updateNotificationSettings({ ...settings, permission: true });
        
        // Définir des tags utilisateur pour la segmentation
        await oneSignalService.setUserTags({
          app: 'PFL',
          language: 'fr',
          notifications_enabled: true,
          notification_time: settings.time
        });
        
        return true;
      }
    } catch (error) {
      console.error('Erreur OneSignal, fallback vers notifications standard:', error);
    }
  }
  
  // Fallback vers les notifications standard
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
