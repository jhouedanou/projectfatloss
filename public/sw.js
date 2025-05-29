// Service Worker pour les notifications Project Fat Loss
// Optimisé pour Android et iOS
const CACHE_NAME = 'project-fat-loss-v2';
const NOTIFICATION_TAG = 'pfl-workout';

// Installation du service worker
self.addEventListener('install', event => {
  console.log('Service Worker installé');
  self.skipWaiting();
});

// Activation du service worker
self.addEventListener('activate', event => {
  console.log('Service Worker activé');
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      // Nettoyer les anciens caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      })
    ])
  );
});

// Gestion des clics sur les notifications
self.addEventListener('notificationclick', event => {
  console.log('Clic sur notification:', event.notification);
  
  const notification = event.notification;
  const action = event.action;
  
  notification.close();
  
  // Gestion des actions de notification
  if (action === 'start') {
    // Action "Commencer l'entraînement"
    event.waitUntil(openApp('/workout'));
  } else if (action === 'later') {
    // Action "Plus tard" - programmer une nouvelle notification dans 30 minutes
    event.waitUntil(scheduleReminderNotification());
  } else {
    // Clic par défaut - ouvrir l'app
    event.waitUntil(openApp('/'));
  }
  
  // Envoyer un message aux clients pour indiquer le clic
  notifyClients({
    type: 'notification-click',
    action: action,
    data: notification.data
  });
});

// Gestion de la fermeture des notifications
self.addEventListener('notificationclose', event => {
  console.log('Notification fermée:', event.notification);
  
  // Analytics ou autre traitement
  notifyClients({
    type: 'notification-close',
    data: event.notification.data
  });
});

// Gestion des messages provenant de l'app principale
self.addEventListener('message', event => {
  console.log('Message reçu dans SW:', event.data);
  
  if (event.data.type === 'SHOW_NOTIFICATION') {
    showWorkoutNotification(event.data.payload);
  } else if (event.data.type === 'SCHEDULE_NOTIFICATION') {
    scheduleNotification(event.data.payload);
  } else if (event.data.type === 'CANCEL_NOTIFICATIONS') {
    cancelAllNotifications();
  }
});

// Fonction pour ouvrir l'application
async function openApp(url = '/') {
  const clients = await self.clients.matchAll({ type: 'window' });
  
  // Chercher si l'app est déjà ouverte
  for (const client of clients) {
    if (client.url.includes(self.location.origin) && 'focus' in client) {
      await client.focus();
      if (url !== '/') {
        client.navigate(url);
      }
      return client;
    }
  }
  
  // Si l'app n'est pas ouverte, l'ouvrir
  if (self.clients.openWindow) {
    return self.clients.openWindow(url);
  }
}

// Fonction pour envoyer des messages aux clients
async function notifyClients(message) {
  const clients = await self.clients.matchAll();
  clients.forEach(client => client.postMessage(message));
}

// Fonction pour afficher une notification d'entraînement
async function showWorkoutNotification(payload = {}) {
  const title = payload.title || "Project Fat Loss";
  const body = payload.body || "C'est l'heure de votre entraînement quotidien ! 💪";
  
  const options = {
    body: body,
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    tag: NOTIFICATION_TAG,
    requireInteraction: true,
    vibrate: [200, 100, 200], // Pattern de vibration pour Android
    actions: [
      {
        action: 'start',
        title: '🏋️ Commencer',
        icon: '/icon-96x96.png'
      },
      {
        action: 'later',
        title: '⏰ Plus tard'
      }
    ],
    data: {
      type: 'workout-reminder',
      timestamp: Date.now(),
      url: '/',
      ...payload.data
    },
    // Options spécifiques pour Android
    silent: false,
    renotify: true,
    timestamp: Date.now(),
    // Image de notification pour Android (si supporté)
    image: payload.image || null
  };
  
  try {
    await self.registration.showNotification(title, options);
    console.log('Notification affichée avec succès');
  } catch (error) {
    console.error('Erreur affichage notification:', error);
  }
}

// Fonction pour programmer une notification de rappel
async function scheduleReminderNotification() {
  // Programmer une notification dans 30 minutes
  setTimeout(async () => {
    await showWorkoutNotification({
      title: "Rappel d'entraînement",
      body: "N'oubliez pas votre séance ! Il est temps de bouger 🔥",
      data: { type: 'reminder' }
    });
  }, 30 * 60 * 1000); // 30 minutes
}

// Fonction pour annuler toutes les notifications
async function cancelAllNotifications() {
  try {
    const notifications = await self.registration.getNotifications({
      tag: NOTIFICATION_TAG
    });
    
    notifications.forEach(notification => {
      notification.close();
    });
    
    console.log(`${notifications.length} notification(s) annulée(s)`);
  } catch (error) {
    console.error('Erreur annulation notifications:', error);
  }
}

// Gestion du push (pour OneSignal ou autres services push)
self.addEventListener('push', event => {
  console.log('Push reçu:', event);
  
  if (event.data) {
    try {
      const data = event.data.json();
      event.waitUntil(showWorkoutNotification(data));
    } catch (error) {
      console.error('Erreur traitement push:', error);
    }
  }
});

// Gestion de la synchronisation en arrière-plan
self.addEventListener('sync', event => {
  console.log('Background sync:', event);
  
  if (event.tag === 'workout-reminder') {
    event.waitUntil(showWorkoutNotification());
  }
});
