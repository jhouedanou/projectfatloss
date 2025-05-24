// Configuration OneSignal pour Project Fat Loss
// Ce fichier configure les options avancées d'OneSignal

// Options globales OneSignal
window.OneSignalConfig = {
  appId: "4b3067b6-a9db-4e53-9e9a-2be01ed43805",
  
  // Configuration du bouton de notification (désactivé car nous gérons cela dans l'app)
  notifyButton: {
    enable: false
  },
  
  // Configuration des invites
  promptOptions: {
    slidedown: {
      enabled: true,
      actionMessage: "Nous aimerions vous envoyer des rappels d'entraînement.",
      acceptButtonText: "Autoriser",
      cancelButtonText: "Non merci",
      categories: {
        tags: [
          {
            tag: "workout_reminders",
            label: "Rappels d'entraînement"
          },
          {
            tag: "progress_updates", 
            label: "Mises à jour de progression"
          }
        ]
      }
    },
    
    customlink: {
      enabled: false
    },
    
    native: {
      enabled: true,
      autoPrompt: false // Nous gérons manuellement les invites
    }
  },
  
  // Configuration des webhooks et événements
  webhooks: {
    cors: true,
    
    // Événements de notification
    'notification.displayed': function(event) {
      console.log('OneSignal: Notification affichée', event);
    },
    
    'notification.clicked': function(event) {
      console.log('OneSignal: Notification cliquée', event);
      
      // Ouvrir l'app si pas active
      if (event.notification.url) {
        window.open(event.notification.url, '_blank');
      } else {
        // Rediriger vers l'accueil
        window.open(window.location.origin, '_self');
      }
    },
    
    'subscription.changed': function(event) {
      console.log('OneSignal: Souscription changée', event);
      
      // Sauvegarder l'état de souscription
      localStorage.setItem('onesignal_subscribed', event.to.optedIn);
      
      if (event.to.optedIn) {
        localStorage.setItem('onesignal_user_id', event.to.userId);
      } else {
        localStorage.removeItem('onesignal_user_id');
      }
    }
  },
  
  // Configuration de la persistance des notifications
  persistNotification: false,
  
  // Configuration du service worker
  serviceWorkerParam: {
    scope: '/'
  },
  
  // Paramètres de développement
  allowLocalhostAsSecureOrigin: true
};

// Export pour utilisation dans les modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = window.OneSignalConfig;
}
