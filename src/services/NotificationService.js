/**
 * Service de notifications pour l'application
 * Gère les notifications quotidiennes et les préférences utilisateur
 * Optimisé pour Android et iOS
 */

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
  
  // Utiliser les notifications natives Android
  
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
  // Utiliser les notifications natives iOS
  
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
  try {
    // Vérifier si l'API Notification est supportée
    if (typeof Notification === 'undefined') {
      console.warn('API Notification non supportée sur ce navigateur');
      return;
    }
    
    const settings = getNotificationSettings();
    
    // Vérifier si les notifications sont activées
    if (!settings.enabled) {
      console.log('Notifications désactivées dans les paramètres');
      return;
    }
    
    // Détection d'iOS pour traitement spécial
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    
    // Forcer la vérification des permissions
    if (Notification.permission !== 'granted') {
      console.log('Permission de notification non accordée, tentative de demande...');
      // Sur iOS, la demande de permission doit être déclenchée par une action utilisateur
      if (isIOS) {
        console.log('Sur iOS, l\'utilisateur doit autoriser manuellement les notifications');
        return;
      }
      
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          updateNotificationSettings({...settings, permission: true});
          // Afficher la notification après avoir obtenu la permission
          _showActualNotification();
        }
      }).catch(error => {
        console.error('Erreur lors de la demande de permission:', error);
      });
      return;
    }
  } catch (error) {
    console.error('Erreur dans showWorkoutNotification:', error);
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
  
  // Fonction interne pour afficher la notification
  function _showActualNotification() {
    console.log('Affichage effectif de la notification...');
    
    // Détection d'iOS pour traitement spécial
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    
    if (!isIOS && 'serviceWorker' in navigator && 'showNotification' in ServiceWorkerRegistration.prototype) {
      // Notification via Service Worker (persiste même si l'app est fermée)
      // Ne pas utiliser cette méthode sur iOS car cela peut causer des problèmes
      navigator.serviceWorker.ready.then(registration => {
        registration.showNotification("Project Fat Loss", {
          body: randomMessage,
          icon: '/favicon.ico',
          badge: '/icon-192x192.png',
          tag: 'daily-workout',
          requireInteraction: !isIOS, // Pas d'interaction requise sur iOS
          actions: !isIOS ? [
            {
              action: 'start',
              title: 'Commencer'
            },
            {
              action: 'later',
              title: 'Plus tard'
            }
          ] : [], // Pas d'actions sur iOS
          data: {
            type: 'daily-workout',
            url: window.location.origin
          }
        });
        console.log('Notification envoyée via Service Worker');
      }).catch(error => {
        console.error('Erreur Service Worker:', error);
        // Fallback en cas d'erreur avec le service worker
        _showBasicNotification();
      });
    } else {
      _showBasicNotification();
    }
  }
  
  // Notification basique en fallback
  function _showBasicNotification() {
    try {
      // Utiliser l'API Notification de base - plus fiable sur iOS
      new Notification("Project Fat Loss", {
        body: randomMessage,
        icon: '/favicon.ico',
        tag: 'daily-workout'
      });
      console.log('Notification basique envoyée');
    } catch (error) {
      console.error('Erreur notification basique:', error);
      // Derniere tentative: alerter l'utilisateur si tout échoue sur iOS
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      if (isIOS) {
        console.log('Tentative d\'alerte simple sur iOS');
        // Sur iOS, nous pourrions utiliser une simple alerte
        // Ceci est désactivé pour ne pas perturber l'utilisateur
        // alert("C'est l'heure de votre entraînement quotidien !");
      }
    }
  }
  
  // Exécuter l'affichage
  _showActualNotification();
}

/**
 * Initialise le service de notifications
 */
export async function initNotificationService() {
  try {
    // Vérifier si l'API Notification est supportée
    if (typeof Notification === 'undefined') {
      console.warn('API Notification non supportée sur ce navigateur');
      return false;
    }
    
    // Service de notifications initialisé
    console.log('Service de notifications initialisé');
    
    // Vérifier le statut actuel des permissions
    const currentPermission = Notification.permission;
    console.log('Statut actuel des permissions de notification:', currentPermission);
    
    // Mettre à jour les paramètres locaux avec le statut réel
    const settings = getNotificationSettings();
    if (currentPermission === 'granted' && !settings.permission) {
      updateNotificationSettings({...settings, permission: true});
    }
    
    // Détection d'iOS pour traitement spécial
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (isIOS) {
      console.log('Plateforme iOS détectée, ajustement des fonctionnalités');
      // Sur iOS, on ne fait pas de demande proactive de permission
      // et on ne tente pas d'enregistrer le service worker qui pourrait causer des problèmes
      scheduleWorkoutNotifications();
      return true;
    }
    
    // Pour les autres plateformes, on continue normalement
    try {
      // Vérifier et demander les permissions si nécessaire
      const granted = await requestNotificationPermission();
      if (granted) {
        console.log('Permissions accordées, programmation des notifications');
        // Montrer une notification de test pour confirmer que tout fonctionne
        // mais seulement si ce n'est pas iOS
        setTimeout(() => {
          showTestNotification().then(success => {
            console.log('Test de notification:', success ? 'réussi' : 'échoué');
          }).catch(e => console.error('Erreur test notification:', e));
        }, 2000); // Attendre 2 secondes pour être sûr que tout est initialisé
        
        scheduleWorkoutNotifications();
      } else {
        console.warn('Permissions refusées, pas de notifications programmées');
      }
    } catch (permError) {
      console.error('Erreur lors de la demande de permission:', permError);
      // Continuer malgré l'erreur
    }
    
    // Enregistrer le service worker si disponible
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker enregistré avec succès');
      } catch (swError) {
        console.error('Erreur d\'enregistrement Service Worker:', swError);
        // Continuer malgré l'erreur
      }
    }
    
    return true;
  } catch (error) {
    console.error('Erreur critique dans initNotificationService:', error);
    return false;
  }
}

/**
 * Affiche une notification de test
 */
export async function showTestNotification() {
  const settings = getNotificationSettings();
  
  // Utiliser uniquement les notifications standard
  
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
  
  // Vérifier le statut des notifications natives
  
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

