// Service Worker Template pour Project Fat Loss
// Ce fichier est utilisé comme modèle pour le service worker final

// Détecter le chemin de base pour GitHub Pages
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  // Force le service worker à s'activer immédiatement
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activated');
  
  // Prendre le contrôle de tous les clients immédiatement
  event.waitUntil(clients.claim());
});

// Gérer les notifications même si l'application n'est pas active
self.addEventListener('notificationclick', (event) => {
  console.log('Notification cliquée:', event.notification.tag);
  
  // Fermer la notification
  event.notification.close();
  
  // Gestion personnalisée en fonction du type de notification
  const notificationData = event.notification.data || {};
  
  // Ouvrir l'application lors du clic sur notification
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Chercher une fenêtre déjà ouverte
        for (const client of clientList) {
          if ('focus' in client) {
            return client.focus();
          }
        }
        
        // Si aucune fenêtre n'est ouverte, en ouvrir une nouvelle
        if (clients.openWindow) {
          // Déterminer l'URL de base
          const baseUrl = self.registration.scope;
          return clients.openWindow(baseUrl);
        }
      })
  );
});

// Intercepter les requêtes de ressources
self.addEventListener('fetch', (event) => {
  // Stratégie simple de mise en cache avec mise à jour en arrière-plan
  // Pas de logique complexe pour éviter les problèmes sur iOS
  
  const url = new URL(event.request.url);
  
  // Ne pas intercepter les requêtes vers d'autres origines (sauf pour les polices)
  if (url.origin !== self.location.origin && !url.hostname.includes('fonts.googleapis.com')) {
    return;
  }
  
  // Gérer uniquement les requêtes GET
  if (event.request.method !== 'GET') {
    return;
  }

  // Stratégie simple : réseau d'abord, puis cache
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Mettre en cache la réponse si elle est valide
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open('pfl-cache-v1').then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Répondre depuis le cache si disponible
        return caches.match(event.request);
      })
  );
});

// Fonction simplifiée pour afficher une notification
function showNotification(title, options) {
  return self.registration.showNotification(title, options);
}

// Écouter les messages depuis l'application
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data;
    showNotification(title, options);
  }
});
