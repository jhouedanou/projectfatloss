// Service Worker pour les notifications Project Fat Loss
const CACHE_NAME = 'project-fat-loss-v1';

// Installation du service worker
self.addEventListener('install', event => {
  console.log('Service Worker installé');
  self.skipWaiting();
});

// Activation du service worker
self.addEventListener('activate', event => {
  console.log('Service Worker activé');
  event.waitUntil(self.clients.claim());
});

// Gestion des clics sur les notifications
self.addEventListener('notificationclick', event => {
  console.log('Clic sur notification:', event.notification);
  
  event.notification.close();
  
  // Ouvrir l'application ou la focuser si déjà ouverte
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(clients => {
      // Chercher si l'app est déjà ouverte
      for (const client of clients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Si l'app n'est pas ouverte, l'ouvrir
      if (self.clients.openWindow) {
        return self.clients.openWindow('/');
      }
    })
  );
  
  // Envoyer un message aux clients pour indiquer le clic
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'notification-click',
        data: event.notification.data
      });
    });
  });
});

// Gestion de la fermeture des notifications
self.addEventListener('notificationclose', event => {
  console.log('Notification fermée:', event.notification);
});
