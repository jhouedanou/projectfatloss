// Service Worker pour les notifications Project Fat Loss
// Optimisé pour Android 15 et notifications persistantes
const CACHE_NAME = 'project-fat-loss-v6';
const NOTIFICATION_TAG = 'pfl-workout';
const EXERCISE_NOTIFICATION_TAG = 'pfl-current-exercise';

// Configuration Android 15 améliorée
const ANDROID15_CONFIG = {
  vibrationPattern: [200, 100, 200, 100, 200, 300, 200],
  silentHours: { start: 22, end: 7 }, // 22h à 7h
  maxRetries: 5,
  retryInterval: 300000, // 5 minutes
  persistentOptions: {
    requireInteraction: false, // Important pour Android 15
    persistent: true,
    renotify: true,
    showTrigger: true,
    sticky: true,
    ongoing: true, // Notification persistante
    silent: false, // Permettre les sons
    timestamp: () => Date.now()
  },
  exerciseOptions: {
    requireInteraction: false,
    persistent: true,
    renotify: true,
    ongoing: true,
    sticky: true,
    silent: true, // Pas de son pour les mises à jour
    timestamp: () => Date.now()
  }
};

// Configuration de base pour compatibilité
const BASE_CONFIG = {
  vibrationPattern: [200, 100, 200],
  androidSpecificOptions: {
    requireInteraction: true,
    persistent: true,
    renotify: true,
    showTrigger: true
  }
};

// Configuration spéciale Android 15 pour GitHub Pages
const GITHUB_PAGES_CONFIG = {
  serviceWorkerScope: '/',
  notificationOptions: {
    requireInteraction: true,
    persistent: true,
    renotify: true,
    vibrate: [200, 100, 200, 100, 200],
    badge: '/android/android-launchericon-96-96.png',
    icon: '/android/android-launchericon-192-192.png'
  },
  android15Options: {
    showTrigger: true,
    sticky: true,
    ongoing: true,
    silent: false,
    timestamp: () => Date.now(),
    actions: [
      {
        action: 'open',
        title: '📱 Ouvrir App',
        icon: '/android/android-launchericon-48-48.png'
      },
      {
        action: 'dismiss',
        title: '❌ Fermer',
        icon: '/android/android-launchericon-48-48.png'
      }
    ]
  }
};

// Détection améliorée de la plateforme Android avec version
function getAndroidInfo() {
  const userAgent = self.navigator.userAgent || '';
  const androidMatch = userAgent.match(/Android (\d+)/);
  const androidVersion = androidMatch ? parseInt(androidMatch[1], 10) : 0;
  
  return {
    isAndroid: /android/i.test(userAgent) || /linux.*mobile/i.test(userAgent) || /samsung/i.test(userAgent),
    version: androidVersion,
    isAndroid15Plus: androidVersion >= 15,
    isChrome: /Chrome/.test(userAgent),
    isSamsung: /SamsungBrowser/.test(userAgent)
  };
}

// Variable globale pour le timer de notification d'exercice
let exerciseNotificationTimer = null;
let currentExerciseData = null;

// Installation du service worker
self.addEventListener('install', event => {
  console.log('Service Worker PFL installé - Version 6 (Android 15 optimisé)');
  
  // Forcer la mise à jour immédiate
  self.skipWaiting();
  
  // Pré-cache des ressources critiques
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll([
        '/',
        '/manifest.json',
        '/android/android-launchericon-192-192.png',
        '/android/android-launchericon-512-512.png'
      ]).catch(err => {
        console.warn('Erreur mise en cache:', err);
      });
    })
  );
});

// Activation du service worker
self.addEventListener('activate', event => {
  console.log('Service Worker PFL activé');
  
  // Nettoyer les anciens caches
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Suppression ancien cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Prendre le contrôle immédiatement
      return self.clients.claim();
    })
  );
});

// Gestion des messages depuis l'application
self.addEventListener('message', event => {
  console.log('SW: Message reçu:', event.data);
  
  // Nouveaux messages Android 15 GitHub Pages
  if (event.data && event.data.type === 'TEST_ANDROID15_GITHUB_PAGES') {
    testAndroid15GitHubPagesNotification(event.data.payload);
  }
  
  if (event.data && event.data.type === 'SCHEDULE_WORKOUT_GITHUB_PAGES') {
    scheduleWorkoutNotification(event.data.payload);
  }
  
  // Messages existants
  if (event.data && event.data.type === 'CONFIGURE_ANDROID15') {
    configureForAndroid15(event.data.payload);
  }
  
  if (event.data && event.data.type === 'TEST_ANDROID15_NOTIFICATION') {
    showAndroid15TestNotification(event.data.payload);
  }
  
  if (event.data && event.data.type === 'CURRENT_EXERCISE_NOTIFICATION_ANDROID15') {
    showCurrentExerciseNotificationAndroid15(event.data.payload);
  }
  
  if (event.data && event.data.type === 'UPDATE_EXERCISE_NOTIFICATION_ANDROID15') {
    updateCurrentExerciseNotificationAndroid15(event.data.payload);
  }
  
  if (event.data && event.data.type === 'CLEAR_EXERCISE_NOTIFICATION_ANDROID15') {
    clearCurrentExerciseNotificationAndroid15();
  }
  
  if (event.data && event.data.type === 'SCHEDULE_NOTIFICATION') {
    scheduleWorkoutNotification(event.data.payload);
  }
  
  if (event.data && event.data.type === 'CANCEL_NOTIFICATIONS') {
    cancelAllNotifications();
  }
  
  if (event.data && event.data.type === 'TEST_NOTIFICATION') {
    showWorkoutNotification(event.data.payload);
  }
  
  if (event.data && event.data.type === 'CURRENT_EXERCISE_NOTIFICATION') {
    showCurrentExerciseNotification(event.data.payload);
  }
  
  if (event.data && event.data.type === 'UPDATE_EXERCISE_NOTIFICATION') {
    updateCurrentExerciseNotification(event.data.payload);
  }
  
  if (event.data && event.data.type === 'CLEAR_EXERCISE_NOTIFICATION') {
    clearCurrentExerciseNotification();
  }
  
  if (event.data && event.data.type === 'PAUSE_NOTIFICATION') {
    showPauseNotification(event.data.payload);
  }
});

// Configuration pour Android 15
function configureForAndroid15(config) {
  console.log('SW: Configuration Android 15:', config);
  // Configuration globale pour Android 15
  if (config.persistentNotifications) {
    console.log('SW: Notifications persistantes activées pour Android 15');
  }
  if (config.workoutMode) {
    console.log('SW: Mode entraînement activé pour Android 15');
  }
}

// =================== NOTIFICATIONS DE TEST ET WORKOUT ===================

// Fonction de notification de test/workout
async function showWorkoutNotification(payload) {
  const { title = 'Test Notification ✅', body = 'Vos notifications fonctionnent parfaitement ! 🎉', tag = 'test-notification' } = payload;

  const options = {
    body: body,
    icon: '/android/android-launchericon-192-192.png',
    badge: '/android/android-launchericon-96-96.png',
    tag: tag,
    vibrate: [200, 100, 200],
    color: '#F03D32',
    data: {
      type: 'test-workout',
      timestamp: Date.now()
    }
  };

  try {
    await self.registration.showNotification(title, options);
    console.log('SW: Notification test/workout affichée');
  } catch (error) {
    console.error('SW: Erreur notification test/workout:', error);
  }
}

// Test de notification pour Android 15
async function showAndroid15TestNotification(payload) {
  const androidInfo = getAndroidInfo();
  
  const options = {
    body: payload.body || 'Test réussi pour Android 15 ! 🎉',
    icon: '/android/android-launchericon-192-192.png',
    badge: '/android/android-launchericon-96-96.png',
    tag: 'android15-test',
    ...ANDROID15_CONFIG.persistentOptions,
    vibrate: ANDROID15_CONFIG.vibrationPattern,
    color: '#F03D32',
    data: {
      type: 'android15-test',
      timestamp: Date.now(),
      platform: 'android15'
    }
  };

  try {
    await self.registration.showNotification(payload.title || 'Test Android 15 ✅', options);
    console.log('SW: Notification test Android 15 affichée');
  } catch (error) {
    console.error('SW: Erreur notification test Android 15:', error);
  }
}

// =================== NOTIFICATIONS D'EXERCICE STANDARD ===================

// Fonction de notification d'exercice standard
async function showCurrentExerciseNotification(payload) {
  const androidInfo = getAndroidInfo();
  
  // Utiliser la version Android 15 si disponible
  if (androidInfo.isAndroid15Plus) {
    return await showCurrentExerciseNotificationAndroid15(payload);
  }
  
  // Version standard pour autres plateformes
  const { exerciseName, setNum, totalSets, dayTitle, currentExercise, totalExercises, autoMode = false } = payload;
  
  const title = `🏋️ ${exerciseName}`;
  const body = `Série ${setNum}/${totalSets} • Exercice ${currentExercise}/${totalExercises}${autoMode ? ' • Mode Auto 🚀' : ''}`;

  const options = {
    body: body,
    icon: '/android/android-launchericon-192-192.png',
    badge: '/android/android-launchericon-96-96.png',
    tag: EXERCISE_NOTIFICATION_TAG,
    ...BASE_CONFIG.androidSpecificOptions,
    vibrate: BASE_CONFIG.vibrationPattern,
    color: '#F03D32',
    data: {
      type: 'current-exercise',
      exerciseName,
      setNum,
      totalSets,
      timestamp: Date.now()
    }
  };

  try {
    await self.registration.showNotification(title, options);
    console.log('SW: Notification exercice standard affichée:', exerciseName);
  } catch (error) {
    console.error('SW: Erreur notification exercice standard:', error);
  }
}

// Mettre à jour la notification d'exercice
async function updateCurrentExerciseNotification(payload) {
  const androidInfo = getAndroidInfo();
  
  // Utiliser la version Android 15 si disponible
  if (androidInfo.isAndroid15Plus) {
    return await updateCurrentExerciseNotificationAndroid15(payload);
  }
  
  // Pour les autres plateformes, simplement réafficher
  await showCurrentExerciseNotification(payload);
}

// Supprimer la notification d'exercice
async function clearCurrentExerciseNotification() {
  const androidInfo = getAndroidInfo();
  
  // Utiliser la version Android 15 si disponible
  if (androidInfo.isAndroid15Plus) {
    return await clearCurrentExerciseNotificationAndroid15();
  }
  
  // Version standard
  try {
    const notifications = await self.registration.getNotifications({ tag: EXERCISE_NOTIFICATION_TAG });
    notifications.forEach(notification => {
      console.log('SW: Fermeture notification exercice standard:', notification.tag);
      notification.close();
    });
  } catch (error) {
    console.error('SW: Erreur suppression notification exercice standard:', error);
  }
}

// =================== NOTIFICATIONS D'EXERCICE ANDROID 15 ===================

// Afficher une notification d'exercice persistante pour Android 15
async function showCurrentExerciseNotificationAndroid15(payload) {
  const { 
    exerciseName, 
    setNum, 
    totalSets, 
    dayTitle, 
    currentExercise, 
    totalExercises,
    autoMode = false,
    remainingTime,
    exerciseType,
    isPaused = false,
    calories = 0
  } = payload;
  
  // Stocker les données pour les mises à jour
  currentExerciseData = payload;
  
  const title = `🏋️ ${exerciseName}`;
  let body = `Série ${setNum}/${totalSets} • Exercice ${currentExercise}/${totalExercises}`;
  
  // Ajouter le timer si disponible
  if (remainingTime && exerciseType === 'timer') {
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;
    body += ` • ${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
  
  if (autoMode) {
    body += ' • Mode Auto 🚀';
  }
  
  if (isPaused) {
    body += ' • ⏸️ PAUSE';
  }
  
  if (calories > 0) {
    body += ` • ${calories} cal`;
  }

  const options = {
    body: body,
    icon: '/android/android-launchericon-192-192.png',
    badge: '/android/android-launchericon-96-96.png',
    tag: EXERCISE_NOTIFICATION_TAG,
    ...ANDROID15_CONFIG.exerciseOptions,
    color: isPaused ? '#FF9800' : '#F03D32',
    data: {
      type: 'current-exercise-android15',
      exerciseName,
      setNum,
      totalSets,
      remainingTime,
      exerciseType,
      isPaused,
      calories,
      timestamp: Date.now()
    },
    actions: [
      {
        action: 'open-app',
        title: '📱 Ouvrir App',
        icon: '/android/android-launchericon-48-48.png'
      },
      {
        action: isPaused ? 'resume' : 'pause',
        title: isPaused ? '▶️ Reprendre' : '⏸️ Pause',
        icon: '/android/android-launchericon-48-48.png'
      },
      {
        action: 'next',
        title: '⏭️ Suivant',
        icon: '/android/android-launchericon-48-48.png'
      }
    ]
  };

  try {
    // Fermer toute notification d'exercice existante
    await clearCurrentExerciseNotificationAndroid15();
    
    // Afficher la nouvelle notification
    await self.registration.showNotification(title, options);
    console.log('SW: Notification exercice Android 15 affichée:', exerciseName);
    
    // Démarrer le timer de mise à jour pour les exercices chronométrés
    if (exerciseType === 'timer' && remainingTime > 0 && !isPaused) {
      startExerciseTimer();
    }
    
  } catch (error) {
    console.error('SW: Erreur notification exercice Android 15:', error);
  }
}

// Mettre à jour la notification d'exercice pour Android 15
async function updateCurrentExerciseNotificationAndroid15(payload) {
  // Mettre à jour les données stockées
  currentExerciseData = { ...currentExerciseData, ...payload };
  
  // Réafficher la notification avec les nouvelles données
  await showCurrentExerciseNotificationAndroid15(currentExerciseData);
}

// Supprimer la notification d'exercice Android 15
async function clearCurrentExerciseNotificationAndroid15() {
  try {
    // Arrêter le timer
    stopExerciseTimer();
    
    // Fermer la notification
    const notifications = await self.registration.getNotifications({ tag: EXERCISE_NOTIFICATION_TAG });
    notifications.forEach(notification => {
      console.log('SW: Fermeture notification exercice Android 15:', notification.tag);
      notification.close();
    });
    
    // Réinitialiser les données
    currentExerciseData = null;
  } catch (error) {
    console.error('SW: Erreur suppression notification exercice Android 15:', error);
  }
}

// Démarrer le timer pour les mises à jour automatiques
function startExerciseTimer() {
  stopExerciseTimer(); // S'assurer qu'il n'y a pas de timer existant
  
  exerciseNotificationTimer = setInterval(async () => {
    if (currentExerciseData && currentExerciseData.remainingTime > 0 && !currentExerciseData.isPaused) {
      // Décrémenter le temps restant
      currentExerciseData.remainingTime -= 1;
      
      // Mettre à jour la notification
      await updateCurrentExerciseNotificationAndroid15(currentExerciseData);
      
      // Arrêter quand le temps est écoulé
      if (currentExerciseData.remainingTime <= 0) {
        stopExerciseTimer();
        
        // Vibration de fin d'exercice
        if ('vibrate' in navigator) {
          navigator.vibrate([300, 100, 300, 100, 300]);
        }
      }
    } else {
      stopExerciseTimer();
    }
  }, 1000); // Mise à jour chaque seconde
  
  console.log('SW: Timer de notification exercice démarré');
}

// Arrêter le timer
function stopExerciseTimer() {
  if (exerciseNotificationTimer) {
    clearInterval(exerciseNotificationTimer);
    exerciseNotificationTimer = null;
    console.log('SW: Timer de notification exercice arrêté');
  }
}

// Notification de pause avec timer
async function showPauseNotification(payload) {
  const { remainingTime, nextExercise, currentSet, totalSets, autoMode } = payload;
  
  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime % 60;
  
  const title = `⏸️ Pause ${autoMode ? 'Auto' : ''}`;
  const body = `${minutes}:${seconds.toString().padStart(2, '0')} restantes`;
  
  const options = {
    body: body,
    icon: '/android/android-launchericon-192-192.png',
    badge: '/android/android-launchericon-96-96.png',
    tag: 'pfl-pause',
    ...ANDROID15_CONFIG.exerciseOptions,
    color: '#FF9800',
    data: {
      type: 'pause',
      remainingTime,
      timestamp: Date.now()
    },
    actions: [
      {
        action: 'skip-pause',
        title: '⏭️ Passer',
        icon: '/android/android-launchericon-48-48.png'
      },
      {
        action: 'open-app',
        title: '📱 Ouvrir',
        icon: '/android/android-launchericon-48-48.png'
      }
    ]
  };

  try {
    await self.registration.showNotification(title, options);
    console.log('SW: Notification pause affichée');
  } catch (error) {
    console.error('SW: Erreur notification pause:', error);
  }
}

// Gestion des clics sur les notifications - Version étendue
self.addEventListener('notificationclick', event => {
  console.log('SW: Clic sur notification:', event.notification.tag, event.action);
  
  // Fermer la notification
  event.notification.close();
  
  // Traitement selon le type de notification et l'action
  const notificationData = event.notification.data || {};
  
  if (event.notification.tag === EXERCISE_NOTIFICATION_TAG) {
    // Gestion des notifications d'exercice en cours
    handleExerciseNotificationClick(event.action, notificationData);
  } else if (event.notification.tag === 'pfl-pause') {
    // Gestion des notifications de pause
    handlePauseNotificationClick(event.action, notificationData);
  } else {
    // Gestion des notifications d'entraînement classiques
    handleWorkoutNotificationClick(event.action, notificationData);
  }
});

// Gestion des clics sur notifications d'exercice
function handleExerciseNotificationClick(action, data) {
  if (action === 'open-app' || !action) {
    // Ouvrir l'app ou retourner au workout
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        // Chercher une fenêtre ouverte existante
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.postMessage({ type: 'FOCUS_WORKOUT' });
            return client.focus();
          }
        }
        
        // Ouvrir une nouvelle fenêtre si aucune trouvée
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      });
  } else if (action === 'pause' || action === 'resume') {
    // Envoyer un message à l'app pour pause/reprise
    clients.matchAll({ type: 'window' }).then(clientList => {
      clientList.forEach(client => {
        if (client.url.includes(self.location.origin)) {
          client.postMessage({ 
            type: action === 'pause' ? 'PAUSE_WORKOUT' : 'RESUME_WORKOUT' 
          });
        }
      });
    });
  } else if (action === 'next') {
    // Envoyer un message à l'app pour passer au suivant
    clients.matchAll({ type: 'window' }).then(clientList => {
      clientList.forEach(client => {
        if (client.url.includes(self.location.origin)) {
          client.postMessage({ type: 'NEXT_EXERCISE' });
        }
      });
    });
  }
}

// Gestion des clics sur notifications de pause
function handlePauseNotificationClick(action, data) {
  if (action === 'skip-pause') {
    // Passer la pause
    clients.matchAll({ type: 'window' }).then(clientList => {
      clientList.forEach(client => {
        if (client.url.includes(self.location.origin)) {
          client.postMessage({ type: 'SKIP_PAUSE' });
        }
      });
    });
  } else if (action === 'open-app' || !action) {
    // Ouvrir l'app
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      });
  }
}

// Gestion des clics sur notifications d'entraînement
function handleWorkoutNotificationClick(action, data) {
  if (action === 'start') {
    // Ouvrir l'app et démarrer l'entraînement
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.postMessage({ type: 'START_WORKOUT' });
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/?start=true');
        }
      });
  } else if (action === 'later') {
    // Reporter de 1 heure
    scheduleDelayedNotification(3600000); // 1 heure en ms
  } else {
    // Clic sans action - ouvrir l'app
    clients.matchAll({ type: 'window' }).then(clientList => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    });
  }
}

// =================== FONCTION SPÉCIALE ANDROID 15 GITHUB PAGES ===================

/**
 * Test de notification optimisé pour Android 15 sur GitHub Pages
 */
async function testAndroid15GitHubPagesNotification(payload) {
  const androidInfo = getAndroidInfo();
  
  console.log('SW: Test notification Android 15 GitHub Pages:', { androidInfo, payload });
  
  const options = {
    ...GITHUB_PAGES_CONFIG.notificationOptions,
    body: payload.body || 'Test réussi sur Android 15 ! 🎉\nNotifications push activées avec succès.',
    tag: 'android15-github-test',
    data: {
      type: 'android15-github-test',
      timestamp: Date.now(),
      android15: androidInfo.isAndroid15Plus,
      chrome: androidInfo.isChrome
    }
  };
  
  // Ajouter les options spéciales Android 15
  if (androidInfo.isAndroid15Plus) {
    Object.assign(options, GITHUB_PAGES_CONFIG.android15Options);
    options.body += '\n\n✨ Optimisations Android 15 activées';
  }
  
  try {
    await self.registration.showNotification(
      payload.title || '✅ Project Fat Loss - Android 15',
      options
    );
    
    console.log('SW: Notification Android 15 GitHub Pages envoyée avec succès');
    return true;
  } catch (error) {
    console.error('SW: Erreur notification Android 15 GitHub Pages:', error);
    return false;
  }
}

/**
 * Planifier une notification de rappel quotidien (GitHub Pages compatible)
 */
async function scheduleWorkoutNotification(payload) {
  console.log('SW: Programmation notification quotidienne GitHub Pages:', payload);
  
  const androidInfo = getAndroidInfo();
  
  const options = {
    ...GITHUB_PAGES_CONFIG.notificationOptions,
    body: payload.body || 'Il est temps de s\'entraîner ! 💪\nVotre corps vous attend, restez motivé !',
    tag: payload.tag || 'daily-workout-reminder',
    data: {
      type: 'daily-reminder',
      timestamp: Date.now(),
      url: '/',
      action: 'start-workout'
    }
  };
  
  // Actions spéciales pour Android 15
  if (androidInfo.isAndroid15Plus && payload.actions) {
    options.actions = payload.actions;
  }
  
  try {
    // Sur GitHub Pages, utiliser showNotification directement
    await self.registration.showNotification(
      payload.title || '🏋️ Rappel d\'Entraînement',
      options
    );
    
    console.log('SW: Notification quotidienne programmée');
    return true;
  } catch (error) {
    console.error('SW: Erreur programmation notification:', error);
    return false;
  }
}

/**
 * Annuler toutes les notifications
 */
async function cancelAllNotifications() {
  try {
    const notifications = await self.registration.getNotifications();
    notifications.forEach(notification => {
      console.log('SW: Fermeture notification:', notification.tag);
      notification.close();
    });
    console.log('SW: Toutes les notifications fermées');
  } catch (error) {
    console.error('SW: Erreur fermeture notifications:', error);
  }
}
