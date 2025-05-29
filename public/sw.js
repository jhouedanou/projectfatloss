// Service Worker pour les notifications Project Fat Loss
// Optimisé pour Android et iOS
const CACHE_NAME = 'project-fat-loss-v3';
const NOTIFICATION_TAG = 'pfl-workout';

// Configuration spécifique Android
const ANDROID_CONFIG = {
  vibrationPattern: [200, 100, 200, 100, 200],
  silentHours: { start: 22, end: 7 }, // 22h à 7h
  maxRetries: 3,
  retryInterval: 300000 // 5 minutes
};

// Installation du service worker
self.addEventListener('install', event => {
  console.log('Service Worker PFL installé - Version 3');
  
  // Forcer la mise à jour immédiate
  self.skipWaiting();
  
  // Pré-cache des ressources critiques
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll([
        '/',
        '/manifest.json',
        '/icon-192x192.png',
        '/icon-512x512.png'
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
  
  if (event.data && event.data.type === 'SCHEDULE_NOTIFICATION') {
    scheduleWorkoutNotification(event.data.payload);
  }
  
  if (event.data && event.data.type === 'CANCEL_NOTIFICATIONS') {
    cancelAllNotifications();
  }
  
  if (event.data && event.data.type === 'TEST_NOTIFICATION') {
    showWorkoutNotification(event.data.payload);
  }
});

// Gestion des clics sur les notifications
self.addEventListener('notificationclick', event => {
  console.log('SW: Clic sur notification:', event.notification.tag, event.action);
  
  // Fermer la notification
  event.notification.close();
  
  // Traitement des actions
  if (event.action === 'start') {
    // Ouvrir l'app et démarrer l'entraînement
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then(clientList => {
          // Chercher une fenêtre ouverte existante
          for (const client of clientList) {
            if (client.url.includes(self.location.origin) && 'focus' in client) {
              client.postMessage({ type: 'START_WORKOUT' });
              return client.focus();
            }
          }
          
          // Ouvrir une nouvelle fenêtre si aucune trouvée
          if (clients.openWindow) {
            return clients.openWindow('/?start=true');
          }
        })
    );
  } else if (event.action === 'later') {
    // Reporter de 1 heure
    scheduleDelayedNotification(3600000); // 1 heure en ms
  } else {
    // Clic sans action - ouvrir l'app
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then(clientList => {
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  }
  
  // Envoyer des analytics (optionnel)
  sendNotificationAnalytics(event.action || 'open', event.notification.data);
});

// Gestion de la fermeture des notifications
self.addEventListener('notificationclose', event => {
  console.log('SW: Notification fermée:', event.notification.tag);
  
  // Analytics pour les fermetures
  sendNotificationAnalytics('close', event.notification.data);
});

// Fonction pour afficher une notification d'entraînement optimisée Android
async function showWorkoutNotification(payload = {}) {
  const title = payload.title || "Project Fat Loss";
  const body = payload.body || "C'est l'heure de votre entraînement quotidien ! 💪";
  
  // Détecter si c'est Android
  const isAndroid = payload.isAndroid || false;
  
  // Configuration de base
  const options = {
    body: body,
    icon: '/android/android-launchericon-192-192.png',
    badge: '/android/android-launchericon-96-96.png',
    tag: NOTIFICATION_TAG,
    requireInteraction: true,
    renotify: true,
    timestamp: Date.now(),
    data: {
      type: 'workout-reminder',
      timestamp: Date.now(),
      url: '/',
      platform: isAndroid ? 'android' : 'other',
      ...payload.data
    },
    actions: [
      {
        action: 'start',
        title: '🏋️ Commencer',
        icon: '/android/android-launchericon-48-48.png'
      },
      {
        action: 'later',
        title: '⏰ Plus tard (1h)',
        icon: '/android/android-launchericon-48-48.png'
      }
    ]
  };

  // Options spécifiques Android
  if (isAndroid) {
    // Vibration plus longue pour Android
    options.vibrate = ANDROID_CONFIG.vibrationPattern;
    
    // Image de notification sur Android
    if (payload.image) {
      options.image = payload.image;
    }
    
    // Son personnalisé (si supporté)
    options.silent = false;
    
    // Couleur de notification sur Android
    options.color = '#F03D32';
    
    // Sticky notification pour Android
    options.sticky = true;
  } else {
    // Vibration plus douce pour autres plateformes
    options.vibrate = [200, 100, 200];
  }
  
  try {
    // Vérifier l'heure silencieuse
    const now = new Date();
    const hour = now.getHours();
    
    if (hour >= ANDROID_CONFIG.silentHours.start || hour < ANDROID_CONFIG.silentHours.end) {
      console.log('SW: Heure silencieuse, notification reportée');
      scheduleDelayedNotification(30 * 60 * 1000); // Reporter de 30 minutes
      return;
    }
    
    // Annuler les notifications existantes du même type
    const notifications = await self.registration.getNotifications({ tag: NOTIFICATION_TAG });
    notifications.forEach(notification => notification.close());
    
    // Afficher la nouvelle notification
    await self.registration.showNotification(title, options);
    console.log('SW: Notification affichée avec succès');
    
    // Programmer un rappel si pas d'interaction après 10 minutes
    setTimeout(async () => {
      const activeNotifications = await self.registration.getNotifications({ tag: NOTIFICATION_TAG });
      if (activeNotifications.length > 0) {
        // La notification est toujours là, programmer un rappel
        scheduleDelayedNotification(10 * 60 * 1000); // 10 minutes
      }
    }, 10 * 60 * 1000);
    
  } catch (error) {
    console.error('SW: Erreur affichage notification:', error);
    
    // Retry avec options simplifiées
    try {
      const simpleOptions = {
        body: body,
        icon: '/icon-192x192.png',
        tag: NOTIFICATION_TAG + '-simple',
        data: options.data
      };
      
      await self.registration.showNotification(title, simpleOptions);
      console.log('SW: Notification simple affichée en fallback');
    } catch (fallbackError) {
      console.error('SW: Erreur fallback notification:', fallbackError);
    }
  }
}

// Programmer une notification différée
function scheduleDelayedNotification(delay) {
  setTimeout(() => {
    showWorkoutNotification({
      body: "N'oubliez pas votre entraînement ! 🔔",
      isAndroid: true
    });
  }, delay);
}

// Annuler toutes les notifications
async function cancelAllNotifications() {
  try {
    const notifications = await self.registration.getNotifications();
    notifications.forEach(notification => {
      console.log('SW: Annulation notification:', notification.tag);
      notification.close();
    });
  } catch (error) {
    console.error('SW: Erreur annulation notifications:', error);
  }
}

// Envoyer des analytics de notification (optionnel)
function sendNotificationAnalytics(action, data) {
  // Envoyer à un service d'analytics si configuré
  console.log('SW: Analytics notification:', { action, data });
  
  // Exemple: envoyer à Google Analytics, Mixpanel, etc.
  // fetch('/api/analytics', { ... });
}

// Gestion du background sync pour Android
self.addEventListener('sync', event => {
  console.log('SW: Background sync:', event.tag);
  
  if (event.tag === 'workout-reminder') {
    event.waitUntil(
      showWorkoutNotification({
        body: "Rappel d'entraînement en arrière-plan 🏃‍♂️",
        isAndroid: true
      })
    );
  }
});

// Programmation initiale des notifications (si appelé directement)
function scheduleWorkoutNotification(config = {}) {
  const defaultConfig = {
    time: '16:00', // 16h par défaut
    enabled: true,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  };
  
  const settings = { ...defaultConfig, ...config };
  
  if (!settings.enabled) {
    console.log('SW: Notifications désactivées');
    return;
  }
  
  console.log('SW: Programmation notification pour', settings.time);
  
  // Calculer le délai jusqu'à la prochaine notification
  const now = new Date();
  const [hours, minutes] = settings.time.split(':').map(Number);
  
  const nextNotification = new Date();
  nextNotification.setHours(hours, minutes, 0, 0);
  
  // Si l'heure est déjà passée aujourd'hui, programmer pour demain
  if (nextNotification <= now) {
    nextNotification.setDate(nextNotification.getDate() + 1);
  }
  
  const delay = nextNotification.getTime() - now.getTime();
  
  console.log('SW: Prochaine notification dans', Math.round(delay / 1000 / 60), 'minutes');
  
  // Programmer la notification
  setTimeout(() => {
    showWorkoutNotification({
      body: "C'est l'heure de votre entraînement quotidien ! 💪",
      isAndroid: /Android/i.test(navigator.userAgent || '')
    });
    
    // Programmer la suivante (récursif)
    scheduleWorkoutNotification(settings);
  }, delay);
}

// Détection de la plateforme pour le SW
function isAndroidPlatform() {
  return /Android/i.test(navigator.userAgent || '');
}

console.log('SW: Service Worker PFL chargé - Android:', isAndroidPlatform());
