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
  // Try OneSignal first
  if (window.OneSignal && typeof OneSignal.Notifications?.requestPermission === 'function') {
    try {
      console.log('Attempting to request permission via OneSignal.');
      // Note: OneSignal.Notifications.requestPermission() often doesn't return a direct boolean
      // It triggers a prompt and state changes are observed via listeners or status properties.
      // We will rely on checking status after attempting.
      await OneSignal.Notifications.requestPermission();

      // Check if permission was granted after the request
      // OneSignal.isPushNotificationsEnabled() is a good check but might not be synchronous after request.
      // A more reliable way is to use OneSignal.Notifications.permission
      if (OneSignal.Notifications.permission === 'granted') {
        console.log('Permission granted via OneSignal.');
        updateNotificationSettings({ permission: true, onesignal_enabled: true });
        return true;
      } else if (OneSignal.Notifications.permission === 'denied') {
        console.log('Permission denied via OneSignal.');
        updateNotificationSettings({ permission: false, onesignal_enabled: false });
        return false;
      }
      // If 'default', it means the user closed the prompt or it wasn't shown. Fallback.
      console.log('OneSignal permission state is default, proceeding to fallback.');
    } catch (error) {
      console.error('Error requesting permission via OneSignal:', error);
      // Fallback to native methods if OneSignal errors
    }
  } else {
    console.log('OneSignal SDK not available or requestPermission not found, using native fallback.');
  }

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
 * Notifications natives pour Android avec gestion améliorée
 */
async function requestAndroidNativeNotifications(settings, platform) {
  if (!('Notification' in window)) {
    console.warn('Notifications non supportées sur ce navigateur Android');
    return false;
  }

  // Vérifier si déjà accordé
  if (Notification.permission === 'granted') {
    updateNotificationSettings({ ...settings, permission: true });
    // Tester immédiatement les notifications sur Android
    await testAndroidNotification();
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
          // Tester immédiatement les notifications
          await testAndroidNotification();
        } else {
          console.log('Permission Android refusée, affichage des instructions');
          showAndroidPermissionInstructions();
        }
        
        return granted;
      }
    } catch (error) {
      console.error('Erreur permission native Android:', error);
      // Fallback vers instructions manuelles
      showAndroidPermissionInstructions();
    }
  } else if (Notification.permission === 'denied') {
    console.log('Notifications bloquées sur Android, affichage instructions');
    showAndroidPermissionInstructions();
  }

  return false;
}

/**
 * Teste les notifications Android immédiatement après l'autorisation
 */
async function testAndroidNotification() {
  try {
    // Attendre que le service worker soit prêt
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      
      // Envoyer une notification de test via le service worker
      registration.active.postMessage({
        type: 'TEST_NOTIFICATION',
        payload: {
          title: 'Test Project Fat Loss',
          body: 'Notifications configurées avec succès sur Android ! 🎉',
          isAndroid: true
        }
      });
    } else {
      // Fallback : notification directe
      new Notification('Test Project Fat Loss', {
        body: 'Notifications configurées avec succès ! 🎉',
        icon: '/android/android-launchericon-192-192.png',
        vibrate: [200, 100, 200]
      });
    }
    
    console.log('Test de notification Android envoyé');
  } catch (error) {
    console.error('Erreur test notification Android:', error);
  }
}

/**
 * Affiche les instructions pour débloquer les notifications sur Android
 */
function showAndroidPermissionInstructions() {
  const instructions = `
🔔 Notifications bloquées sur Android

Pour activer les notifications :

1. Dans Chrome/Samsung Browser :
   • Menu (⋮) → Paramètres → Paramètres du site → Notifications
   • Trouvez ce site et autorisez les notifications

2. Si vous utilisez la PWA :
   • Paramètres Android → Applications
   • Trouvez "Project Fat Loss"
   • Notifications → Autoriser

3. Désactivez l'optimisation de batterie :
   • Paramètres → Batterie → Optimisation batterie
   • Trouvez votre navigateur → "Ne pas optimiser"

Rechargez la page après avoir modifié ces paramètres.
  `;
  
  alert(instructions);
}

/**
 * Affiche un dialog explicatif pour Android avec plus de détails
 */
function showAndroidPermissionDialog() {
  return new Promise((resolve) => {
    const message = `
🏋️ Project Fat Loss - Notifications d'entraînement

Pour recevoir vos rappels quotidiens :

✅ Autorisez les notifications dans la popup qui va apparaître
✅ Si aucune popup : vérifiez les paramètres de votre navigateur
✅ Optionnel : installez l'app sur votre écran d'accueil

Sur Android, les notifications peuvent être bloquées par l'optimisation de batterie. Nous vous guiderons pour les configurer correctement.

Voulez-vous continuer ?
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
    console.log('scheduleWorkoutNotifications: Notifications disabled or permission not granted.');
    return;
  }

  if (settings.onesignal_enabled && window.OneSignal && OneSignal.Notifications.permission === 'granted') {
    console.log('scheduleWorkoutNotifications: OneSignal is active. Scheduling would be handled by OneSignal (likely server-side). Skipping local scheduling.');
    // Potentially trigger a sync with backend or use OneSignal's client-side scheduling if available/suitable.
    // For now, we are assuming OneSignal handles scheduling elsewhere or this function's role changes.
    // If client-side scheduling with OneSignal is needed, it would be implemented here.
    // OneSignal.sendTag("last_app_open_time", Math.floor(Date.now() / 1000)); // Example: update tags
    return; // Exit if OneSignal is primary, to avoid duplicate native scheduling
  }

  // Programmer la prochaine notification (fallback to native)
  console.log('scheduleWorkoutNotifications: Using native scheduling.');
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

  if (!settings.enabled) {
    console.log('showWorkoutNotification: Notifications disabled in settings.');
    return;
  }

  if (settings.onesignal_enabled && window.OneSignal && OneSignal.Notifications.permission === 'granted') {
    console.log('showWorkoutNotification: OneSignal is active. Notification would be displayed via OneSignal.');
    // Example for testing (local notification, not a true push):
    // OneSignal.sendSelfNotification(
    //   "Project Fat Loss (OneSignal)",
    //   messages[Math.floor(Math.random() * messages.length)],
    //   window.location.origin, // URL
    //   '/icon-192x192.png', // Icon
    //   {
    //     notificationType: 'daily-workout-os'
    //   }
    // );
    // For now, we will let it fall through to native to ensure user still gets something
    // if full OneSignal display isn't implemented here yet.
    // In a full implementation, you might 'return' here.
    // --- MODIFICATION: Now actually sending and returning ---
    const messages = [ // Define messages array here as it's used by OneSignal path too
      "C'est l'heure de votre entraînement quotidien ! 💪",
      "Votre corps vous attend ! Il est temps de s'entraîner 🏋️‍♂️",
      "L'excellence commence par l'action ! Prêt pour votre séance ? 🔥",
      "Chaque jour compte ! Votre entraînement vous attend ⭐",
      "Transformez votre journée avec un bon workout ! 💯"
    ];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    try {
      OneSignal.sendSelfNotification(
        "Project Fat Loss", // Title
        randomMessage,      // Body
        window.location.origin, // URL to open
        '/icon-192x192.png', // Icon, consider matching sw.js or OneSignal dashboard
        {
          notificationType: 'daily-workout-onesignal',
          tag: 'pfl-workout' // Use the same tag as native for consistency if desired, or a new one
        }
      );
      console.log('showWorkoutNotification: OneSignal self-notification sent for daily workout.');
      return; // IMPORTANT: Return here to prevent native fallback
    } catch (osError) {
      console.error('showWorkoutNotification: Error sending OneSignal self-notification:', osError);
      // If OneSignal fails, could fall through to native as a last resort.
      // For now, if onesignal_enabled is true, we expect it to work or fail clearly.
    }
  }

  // Native fallback logic starts here if OneSignal wasn't used or failed and fell through
  const messagesForNative = [ // Re-define if not already defined above for OneSignal path
      "C'est l'heure de votre entraînement quotidien ! 💪",
      "Votre corps vous attend ! Il est temps de s'entraîner 🏋️‍♂️",
      "L'excellence commence par l'action ! Prêt pour votre séance ? 🔥",
      "Chaque jour compte ! Votre entraînement vous attend ⭐",
      "Transformez votre journée avec un bon workout ! 💯"
  ];
  const randomMessageForNative = messagesForNative[Math.floor(Math.random() * messagesForNative.length)];


  try {
    // Vérifier si l'API Notification est supportée (native fallback)
    if (typeof Notification === 'undefined') {
      console.warn('showWorkoutNotification: Native Notification API not supported on this browser.');
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

  // const messages = [...] // This is now defined above or as messagesForNative
  // const randomMessage = messages[Math.floor(Math.random() * messages.length)]; // This is now randomMessageForNative
  
  // Fonction interne pour afficher la notification
  function _showActualNotification() {
    console.log('Affichage effectif de la notification (native fallback)...');
    
    // Détection d'iOS pour traitement spécial
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    
    if (!isIOS && 'serviceWorker' in navigator && 'showNotification' in ServiceWorkerRegistration.prototype) {
      // Notification via Service Worker (persiste même si l'app est fermée)
      // Ne pas utiliser cette méthode sur iOS car cela peut causer des problèmes
      navigator.serviceWorker.ready.then(registration => {
        registration.showNotification("Project Fat Loss", {
          body: randomMessageForNative, // Use randomMessageForNative
          icon: '/favicon.ico', // Consider using icons consistent with sw.js like '/android/android-launchericon-192-192.png'
          badge: '/icon-192x192.png', // Consider using badges consistent with sw.js like '/android/android-launchericon-96-96.png'
          tag: 'pfl-workout', // Changed from 'daily-workout' to match sw.js NOTIFICATION_TAG
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
        body: randomMessageForNative, // Use randomMessageForNative
        icon: '/favicon.ico', // Consistent icon
        tag: 'pfl-workout' // Changed from 'daily-workout'
      });
      console.log('Notification basique envoyée (native fallback)');
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
 * Initialise le service de notification avec optimisations Android
 */
export async function initNotificationService() {
  console.log('Initialisation du service de notification...');
  
  const platform = getPlatformInfo();
  console.log('Plateforme détectée:', platform);
  
  // Enregistrement du service worker avec gestion d'erreur améliorée
  if ('serviceWorker' in navigator) {
    try {
      // Vérifier s'il y a déjà un service worker actif
      const existingRegistration = await navigator.serviceWorker.getRegistration();
      
      if (existingRegistration) {
        console.log('Service Worker déjà enregistré:', existingRegistration);
        
        // Forcer la mise à jour si nécessaire
        if (existingRegistration.waiting) {
          existingRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
        
        // Vérifier s'il est mis à jour
        await existingRegistration.update();
      } else {
        // Enregistrer un nouveau service worker
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none' // Toujours vérifier les mises à jour
        });
        console.log('Nouveau Service Worker enregistré:', registration);
      }
      
      // Attendre que le service worker soit prêt
      const registration = await navigator.serviceWorker.ready;
      console.log('Service Worker prêt:', registration);
      
      // Configuration spéciale pour Android
      if (platform.isAndroid) {
        console.log('Configuration Android spéciale...');
        
        // Envoyer les informations de plateforme au service worker
        if (registration.active) {
          registration.active.postMessage({
            type: 'PLATFORM_INFO',
            payload: {
              isAndroid: true,
              browser: platform.isChrome ? 'chrome' : (platform.isSamsung ? 'samsung' : 'other'),
              isPWA: platform.isPWA,
              userAgent: navigator.userAgent
            }
          });
        }
        
        // Test de connectivité pour les notifications Android
        await testAndroidNotificationSupport();
      }
      
      return true;
    } catch (error) {
      console.error('Erreur initialisation service worker:', error);
      
      // Fallback pour Android sans service worker
      if (platform.isAndroid) {
        console.log('Fallback Android sans service worker');
        return await initAndroidFallbackNotifications();
      }
      
      return false;
    }
  } else {
    console.warn('Service Worker non supporté');
    
    // Fallback pour navigateurs anciens sur Android
    if (platform.isAndroid) {
      return await initAndroidFallbackNotifications();
    }
    
    return false;
  }
}

/**
 * Test du support des notifications sur Android
 */
async function testAndroidNotificationSupport() {
  try {
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
    // Check OneSignal status
    if (window.OneSignal && typeof OneSignal.isInitialized === 'function' && OneSignal.isInitialized()) {
      console.log('OneSignal is initialized.');
      // Potentially check OneSignal's own permission status here too
      if (await OneSignal.isPushNotificationsEnabled()) {
        console.log('OneSignal push notifications are already enabled.');
        updateNotificationSettings({ permission: true, onesignal_enabled: true });
      } else {
         // If OneSignal is init but permission not granted, requestNotificationPermission will handle it.
         console.log('OneSignal initialized, but push notifications not enabled yet.');
      }
    } else if (window.OneSignal) {
      console.log('OneSignal is present but not fully initialized yet. SDK in index.html will handle it.');
      // Listen for OneSignal initialization if needed, e.g., OneSignal.push(() => console.log("OneSignal JS SDK Initialized"));
    } else {
      console.log('OneSignal SDK not found. Native notifications will be used if available.');
    }

    // Vérifier si l'API Notification est supportée
    if (typeof Notification === 'undefined' && !(window.OneSignal && OneSignal.Notifications.isSupported())) {
      console.warn('Native Notification API not supported and OneSignal notifications not supported/available.');
=======
    if (!('Notification' in window)) {
      console.warn('API Notification non disponible sur Android');
>>>>>>> Stashed changes
=======
    if (!('Notification' in window)) {
      console.warn('API Notification non disponible sur Android');
>>>>>>> Stashed changes
=======
    if (!('Notification' in window)) {
      console.warn('API Notification non disponible sur Android');
>>>>>>> Stashed changes
      return false;
    }
    
    console.log('Permission actuelle:', Notification.permission);
    
    // Test des capacités
    const capabilities = {
      vibration: 'vibrate' in navigator,
      serviceWorker: 'serviceWorker' in navigator,
      push: 'PushManager' in window,
      backgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype
    };
    
    console.log('Capacités Android détectées:', capabilities);
    
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
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
        // Notification de test supprimée - plus d'affichage automatique au lancement
        
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
        // Déterminer le chemin correct du service worker en fonction de l'environnement
        const isProduction = window.location.hostname !== 'localhost' && !window.location.hostname.includes('127.0.0.1');
        const swPath = isProduction 
          ? (new URL('./sw.js', window.location.href)).pathname // Chemin relatif pour la production
          : '/sw.js'; // Chemin absolu pour le développement
          
        console.log('Tentative d\'enregistrement du Service Worker avec le chemin:', swPath);
        
        const registration = await navigator.serviceWorker.register(swPath);
        console.log('Service Worker enregistré avec succès');
      } catch (swError) {
        console.error('Erreur d\'enregistrement Service Worker:', swError);
        // Continuer malgré l'erreur
      }
    }
    
    return true;
=======
    return capabilities;
>>>>>>> Stashed changes
=======
    return capabilities;
>>>>>>> Stashed changes
=======
    return capabilities;
>>>>>>> Stashed changes
  } catch (error) {
    console.error('Erreur test support Android:', error);
    return false;
  }
}

/**
 * Initialisation fallback pour Android sans service worker
 */
async function initAndroidFallbackNotifications() {
  console.log('Initialisation fallback Android...');
  
  try {
    if ('Notification' in window) {
      const permission = Notification.permission;
      console.log('Permission fallback Android:', permission);
      
      if (permission === 'granted') {
        // Tester une notification simple
        const testNotification = new Notification('Project Fat Loss', {
          body: 'Notifications configurées (mode de compatibilité Android)',
          icon: '/android/android-launchericon-192-192.png',
          vibrate: [200, 100, 200],
          tag: 'test-fallback'
        });
        
        setTimeout(() => testNotification.close(), 3000);
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Erreur fallback Android:', error);
    return false;
  }
}

/**
 * Affiche une notification de test
 */
export async function showTestNotification() {
  const settings = getNotificationSettings();

  // Ensure permission is first requested and hopefully granted.
  // This call will attempt OneSignal first if available.
  const hasPermission = await requestNotificationPermission();

  if (!hasPermission) {
    console.warn('showTestNotification: Permission de notification refusée ou non disponible.');
    return false;
  }

  // Check if OneSignal should be used
  if (settings.onesignal_enabled && window.OneSignal && OneSignal.Notifications.permission === 'granted') {
    console.log('showTestNotification: Attempting to send test notification via OneSignal.');
    try {
      await window.OneSignal.sendSelfNotification(
        "🏋️ Test PFL (OneSignal)",
        "Les notifications OneSignal fonctionnent correctement ! 🎉",
        window.location.origin, // URL to open when clicked
        '/icon-192x192.png',    // Icon
        {
          notificationType: 'onesignal-test-notification',
          tag: 'onesignal-test-notification' // Keep it distinct from other test tags
        }
      );
      console.log('showTestNotification: OneSignal self-notification sent.');
      return true;
    } catch (error) {
      console.error('showTestNotification: Erreur lors de l\'envoi de la notification test OneSignal:', error);
      // Fallback to native if OneSignal send fails? Or just return false?
      // For a test function, perhaps returning false is better to indicate the OneSignal part failed.
      return false;
    }
  } else if (Notification.permission === 'granted') {
    // Fallback to native notification
    console.log('showTestNotification: Attempting to send test notification via native API.');
    try {
      const notification = new Notification("🏋️ Test PFL (Native)", {
        body: "Les notifications natives fonctionnent correctement ! 🎉",
        icon: '/favicon.ico',
        tag: 'native-test-notification', // Distinct tag
        requireInteraction: false
      });
      
      setTimeout(() => {
        notification.close();
      }, 4000);
      
      console.log('showTestNotification: Native test notification sent.');
      return true;
    } catch (error) {
      console.error('showTestNotification: Erreur lors de la création de la notification native:', error);
      return false;
    }
  } else {
    console.warn('showTestNotification: Permission status unclear or denied for native notifications after check.');
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

