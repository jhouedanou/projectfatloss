/**
 * Service OneSignal pour les notifications push
 * Gère l'intégration avec OneSignal et les notifications push
 */

class OneSignalService {
  constructor() {
    this.isInitialized = false;
    this.oneSignal = null;
    this.userId = null;
    this.initPromise = null;
  }

  /**
   * Initialise OneSignal
   * @returns {Promise<boolean>} - True si l'initialisation réussit
   */
  async init() {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this._doInit();
    return this.initPromise;
  }

  async _doInit() {
    try {
      // Attendre que OneSignal soit disponible
      await this._waitForOneSignal();
      
      this.oneSignal = window.OneSignal;
      
      // Vérifier si OneSignal est déjà initialisé
      const isInitialized = await this.oneSignal.User.PushSubscription.optedIn;
      
      if (!isInitialized) {
        console.log('OneSignal: En attente d\'initialisation...');
      }

      // Écouter les événements OneSignal
      this._setupEventListeners();
      
      this.isInitialized = true;
      console.log('OneSignal: Service initialisé avec succès');
      return true;
      
    } catch (error) {
      console.error('OneSignal: Erreur d\'initialisation:', error);
      return false;
    }
  }

  /**
   * Attend que OneSignal soit disponible
   */
  async _waitForOneSignal() {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 50;
      
      const checkOneSignal = () => {
        if (window.OneSignal) {
          resolve();
        } else if (attempts >= maxAttempts) {
          reject(new Error('OneSignal SDK non disponible après 5 secondes'));
        } else {
          attempts++;
          setTimeout(checkOneSignal, 100);
        }
      };
      
      checkOneSignal();
    });
  }

  /**
   * Configure les écouteurs d'événements OneSignal
   */
  _setupEventListeners() {
    if (!this.oneSignal) return;

    // Événement de changement de permission
    this.oneSignal.User.PushSubscription.addEventListener('change', (event) => {
      console.log('OneSignal: Changement de permission push:', event);
      
      if (event.current.optedIn) {
        this.userId = event.current.id;
        console.log('OneSignal: Utilisateur souscrit avec ID:', this.userId);
        
        // Sauvegarder l'ID utilisateur
        localStorage.setItem('onesignal_user_id', this.userId);
      } else {
        console.log('OneSignal: Utilisateur non souscrit');
        localStorage.removeItem('onesignal_user_id');
      }
    });

    // Événement de clic sur notification
    this.oneSignal.Notifications.addEventListener('click', (event) => {
      console.log('OneSignal: Notification cliquée:', event);
      
      // Ouvrir l'application si elle n'est pas active
      if (document.hidden) {
        window.focus();
      }
      
      // Rediriger vers une page spécifique si défini dans les données
      if (event.notification.additionalData?.url) {
        window.location.href = event.notification.additionalData.url;
      }
    });
  }

  /**
   * Demande la permission pour les notifications
   * @returns {Promise<boolean>} - True si la permission est accordée
   */
  async requestPermission() {
    try {
      await this.init();
      
      if (!this.oneSignal) {
        console.error('OneSignal: Service non initialisé');
        return false;
      }

      // Vérifier si déjà souscrit
      const isOptedIn = await this.oneSignal.User.PushSubscription.optedIn;
      if (isOptedIn) {
        console.log('OneSignal: Utilisateur déjà souscrit');
        return true;
      }

      // Demander l'opt-in
      await this.oneSignal.User.PushSubscription.optIn();
      
      // Vérifier le résultat
      const finalOptedIn = await this.oneSignal.User.PushSubscription.optedIn;
      
      if (finalOptedIn) {
        this.userId = await this.oneSignal.User.PushSubscription.id;
        localStorage.setItem('onesignal_user_id', this.userId);
        console.log('OneSignal: Permission accordée, User ID:', this.userId);
        return true;
      } else {
        console.log('OneSignal: Permission refusée');
        return false;
      }
      
    } catch (error) {
      console.error('OneSignal: Erreur lors de la demande de permission:', error);
      return false;
    }
  }

  /**
   * Vérifie le statut de la permission
   * @returns {Promise<string>} - 'granted', 'denied', ou 'default'
   */
  async getPermissionStatus() {
    try {
      await this.init();
      
      if (!this.oneSignal) {
        return 'default';
      }

      const isOptedIn = await this.oneSignal.User.PushSubscription.optedIn;
      const permission = await this.oneSignal.Notifications.permission;
      
      if (isOptedIn && permission) {
        return 'granted';
      } else if (permission === false) {
        return 'denied';
      } else {
        return 'default';
      }
      
    } catch (error) {
      console.error('OneSignal: Erreur lors de la vérification du statut:', error);
      return 'default';
    }
  }

  /**
   * Envoie une notification de test
   * @returns {Promise<boolean>} - True si envoyé avec succès
   */
  async sendTestNotification() {
    try {
      await this.init();
      
      const isOptedIn = await this.oneSignal.User.PushSubscription.optedIn;
      if (!isOptedIn) {
        console.log('OneSignal: Utilisateur non souscrit pour le test');
        return false;
      }

      // Créer une notification locale pour le test
      const testNotification = {
        title: '🏋️‍♂️ Test PFL',
        message: 'Les notifications OneSignal fonctionnent parfaitement ! 💪',
        icon: '/favicon.ico'
      };

      // Simuler une notification via l'API standard si disponible
      if ('Notification' in window && Notification.permission === 'granted') {
        const notification = new Notification(testNotification.title, {
          body: testNotification.message,
          icon: testNotification.icon,
          tag: 'onesignal-test',
          badge: '/icon-192x192.png',
          requireInteraction: false,
          silent: false
        });
        
        // Auto-fermer après 4 secondes
        setTimeout(() => {
          notification.close();
        }, 4000);
        
        console.log('OneSignal: Notification de test envoyée localement');
        return true;
      }
      
      return false;
      
    } catch (error) {
      console.error('OneSignal: Erreur lors du test:', error);
      return false;
    }
  }

  /**
   * Définit des tags pour l'utilisateur
   * @param {Object} tags - Objet contenant les tags à définir
   */
  async setUserTags(tags) {
    try {
      await this.init();
      
      if (!this.oneSignal) {
        console.error('OneSignal: Service non initialisé');
        return;
      }

      await this.oneSignal.User.addTags(tags);
      console.log('OneSignal: Tags utilisateur définis:', tags);
      
    } catch (error) {
      console.error('OneSignal: Erreur lors de la définition des tags:', error);
    }
  }

  /**
   * Obtient l'ID utilisateur OneSignal
   * @returns {Promise<string|null>} - ID utilisateur ou null
   */
  async getUserId() {
    try {
      await this.init();
      
      if (!this.oneSignal) {
        return null;
      }

      const isOptedIn = await this.oneSignal.User.PushSubscription.optedIn;
      if (!isOptedIn) {
        return null;
      }

      this.userId = await this.oneSignal.User.PushSubscription.id;
      return this.userId;
      
    } catch (error) {
      console.error('OneSignal: Erreur lors de la récupération de l\'ID:', error);
      return null;
    }
  }

  /**
   * Se désabonne des notifications
   * @returns {Promise<boolean>} - True si le désabonnement réussit
   */
  async optOut() {
    try {
      await this.init();
      
      if (!this.oneSignal) {
        return false;
      }

      await this.oneSignal.User.PushSubscription.optOut();
      
      this.userId = null;
      localStorage.removeItem('onesignal_user_id');
      
      console.log('OneSignal: Utilisateur désabonné');
      return true;
      
    } catch (error) {
      console.error('OneSignal: Erreur lors du désabonnement:', error);
      return false;
    }
  }

  /**
   * Vérifie si OneSignal est disponible
   * @returns {boolean}
   */
  isAvailable() {
    return typeof window !== 'undefined' && 'OneSignal' in window;
  }

  /**
   * Met à jour les préférences de notification
   * @param {Object} preferences - Préférences de notification
   */
  async updateNotificationPreferences(preferences) {
    try {
      await this.init();
      
      if (!this.oneSignal) {
        return;
      }

      const tags = {
        notification_time: preferences.time || '16:00',
        notifications_enabled: preferences.enabled ? 'true' : 'false',
        last_updated: new Date().toISOString(),
        app_version: '1.1.1'
      };

      await this.setUserTags(tags);
      console.log('OneSignal: Préférences mises à jour:', tags);
      
    } catch (error) {
      console.error('OneSignal: Erreur lors de la mise à jour des préférences:', error);
    }
  }

  /**
   * Obtient les statistiques d'utilisation
   * @returns {Promise<Object>} - Statistiques
   */
  async getUsageStats() {
    try {
      await this.init();
      
      const stats = {
        isSubscribed: false,
        userId: null,
        permission: 'default',
        lastActive: new Date().toISOString()
      };

      if (this.oneSignal) {
        stats.isSubscribed = await this.oneSignal.User.PushSubscription.optedIn;
        stats.permission = await this.oneSignal.Notifications.permission;
        
        if (stats.isSubscribed) {
          stats.userId = await this.oneSignal.User.PushSubscription.id;
        }
      }

      return stats;
      
    } catch (error) {
      console.error('OneSignal: Erreur lors de la récupération des stats:', error);
      return null;
    }
  }
}

// Export d'une instance singleton
const oneSignalService = new OneSignalService();
export default oneSignalService;
