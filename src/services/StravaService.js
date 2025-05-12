/**
 * Service pour l'intégration avec Strava
 */

// Configuration Strava
const STRAVA_CONFIG = {
  clientId: '159311',
  clientSecret: '6e2acab2c5731c20a946fe672afdfc8a6b6485f1',
  redirectUri: window.location.origin + '/strava-callback.html',  // Page callback spécifique
  scope: 'read,activity:write',
  authUrl: 'https://www.strava.com/oauth/authorize',  // Sans /api/v3/
  tokenUrl: 'https://www.strava.com/oauth/token'      // Sans /api/v3/
};

// Clé de stockage local pour les statistiques Strava
const STRAVA_STATS_KEY = 'project_fat_loss_strava_stats';

// Informations d'authentification de l'utilisateur
let stravaAuth = {
  accessToken: localStorage.getItem('strava_access_token') || '09dae37d7b963c3fe7fd1478e6c0315260e45404',
  refreshToken: localStorage.getItem('strava_refresh_token') || 'fb1159763f37433a9a135f70495360e87fa8201a',
  expiresAt: localStorage.getItem('strava_expires_at') || '2025-05-13T04:02:30Z'
};

/**
 * Initialise le service Strava
 */
export function initStravaService() {
  // Vérifier si le token est présent dans le localStorage
  if (!stravaAuth.accessToken) {
    console.log('Aucun token Strava trouvé');
    return false;
  }

  // Vérifier si le token est expiré
  const expiresAt = new Date(stravaAuth.expiresAt).getTime();
  const now = new Date().getTime();
  
  if (now >= expiresAt) {
    console.log('Token Strava expiré, rafraîchissement nécessaire');
    return refreshToken();
  }
  
  console.log('Service Strava initialisé avec succès');
  return true;
}

/**
 * Rafraîchit le token d'accès Strava lorsqu'il expire
 * @returns {Promise<boolean>} - true si le token a été rafraîchi avec succès
 */
async function refreshToken() {
  try {
    console.log('Tentative de rafraîchissement du token avec:', {
      refresh_token: `${stravaAuth.refreshToken.substring(0, 5)}...`,
      client_id: STRAVA_CONFIG.clientId
    });
    
    const response = await fetch(STRAVA_CONFIG.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client_id: STRAVA_CONFIG.clientId,
        client_secret: STRAVA_CONFIG.clientSecret,
        refresh_token: stravaAuth.refreshToken,
        grant_type: 'refresh_token'
      })
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const data = await response.json();
    
    // Mettre à jour les informations d'authentification
    stravaAuth = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000).toISOString()
    };

    // Sauvegarder dans localStorage
    localStorage.setItem('strava_access_token', data.access_token);
    localStorage.setItem('strava_refresh_token', data.refresh_token);
    localStorage.setItem('strava_expires_at', stravaAuth.expiresAt);
    
    console.log('Token Strava rafraîchi avec succès');
    return true;
  } catch (error) {
    console.error('Erreur lors du rafraîchissement du token Strava:', error);
    return false;
  }
}

/**
 * Authentifie l'utilisateur avec Strava via OAuth
 * @returns {Promise<boolean>} - true si l'authentification a réussi
 */
export function authenticateWithStrava() {
  // Forcer une nouvelle authentification en effaçant les tokens
  clearStravaAuth();
  
  // Rediriger vers la page d'authentification Strava
  const authUrl = `${STRAVA_CONFIG.authUrl}?client_id=${STRAVA_CONFIG.clientId}&redirect_uri=${encodeURIComponent(STRAVA_CONFIG.redirectUri)}&response_type=code&scope=${STRAVA_CONFIG.scope}&approval_prompt=force`;
  
  console.log('Redirection vers URL d\'authentification Strava:', authUrl);
  
  // Ouvrir dans une nouvelle fenêtre
  const authWindow = window.open(authUrl, 'StravaAuth', 'width=600,height=800');
  
  return new Promise((resolve) => {
    // Vérifier périodiquement si l'utilisateur a terminé l'authentification
    const checkAuth = setInterval(() => {
      if (authWindow.closed) {
        clearInterval(checkAuth);
        
        // Vérifier si l'authentification a réussi (le token est présent)
        if (localStorage.getItem('strava_access_token')) {
          stravaAuth.accessToken = localStorage.getItem('strava_access_token');
          stravaAuth.refreshToken = localStorage.getItem('strava_refresh_token');
          stravaAuth.expiresAt = localStorage.getItem('strava_expires_at');
          resolve(true);
        } else {
          resolve(false);
        }
      }
    }, 500);
  });
}

/**
 * Efface tous les tokens Strava
 */
export function clearStravaAuth() {
  console.log('Effacement des tokens Strava pour forcer une nouvelle authentification');
  localStorage.removeItem('strava_access_token');
  localStorage.removeItem('strava_refresh_token');
  localStorage.removeItem('strava_expires_at');
  stravaAuth = {
    accessToken: null,
    refreshToken: null,
    expiresAt: null
  };
}

/**
 * Enregistre un entraînement sur Strava
 * @param {Object} workout - Les données de l'entraînement
 * @returns {Promise<Object>} - Les données de l'entraînement enregistré
 */
export async function syncWorkout(workout) {
  console.log('Début de synchronisation avec Strava');
  
  // Vérifier si l'utilisateur est authentifié
  if (!isConnectedToStrava()) {
    console.log('Utilisateur non connecté, tentative d\'authentification...');
    const authenticated = await authenticateWithStrava();
    if (!authenticated) {
      throw new Error("L'utilisateur n'est pas authentifié avec Strava");
    }
  }

  // Vérifier si le token est expiré
  try {
    const expiresAt = new Date(stravaAuth.expiresAt).getTime();
    const now = Date.now();
    
    console.log('Vérification de l\'expiration du token:', {
      expiresAt: new Date(expiresAt).toISOString(),
      now: new Date(now).toISOString(),
      isExpired: now >= expiresAt
    });
    
    if (now >= expiresAt) {
      console.log('Token expiré, tentative de rafraîchissement...');
      const refreshed = await refreshToken();
      if (!refreshed) {
        throw new Error("Impossible de rafraîchir le token Strava");
      }
    }

    // Formatter les données pour Strava
    const stravaActivity = {
      name: workout.name || "Entraînement Project Fat Loss",
      type: "WeightTraining",
      start_date_local: workout.date ? new Date(workout.date).toISOString() : new Date().toISOString(),
      elapsed_time: workout.duration || 1800, // Par défaut 30 minutes
      description: workout.desc || `Entraînement de musculation: ${workout.exerciseCount || 0} exercices, ${workout.calories || 0} calories brûlées`,
    };

    console.log('Envoi des données à Strava:', {
      token: `${stravaAuth.accessToken.substring(0, 5)}...`,
      activity: stravaActivity
    });

    // Envoyer l'entraînement à Strava
    const response = await fetch('https://www.strava.com/api/v3/activities', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stravaAuth.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(stravaActivity)
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || response.statusText;
      } catch (e) {
        errorMessage = `${response.status} ${response.statusText}: ${errorText}`;
      }
      console.error('Erreur Strava:', {
        status: response.status,
        message: errorMessage
      });
      throw new Error(`Erreur Strava: ${errorMessage}`);
    }

    const data = await response.json();
    console.log('Entraînement synchronisé avec Strava:', data);
    
    return data;
  } catch (err) {
    console.error('Erreur lors de la synchronisation avec Strava:', err);
    throw err;
  }
}

/**
 * Récupère les entraînements de l'utilisateur depuis Strava
 * @param {number} limit - Nombre d'entraînements à récupérer
 * @returns {Promise<Array>} - Liste des entraînements
 */
export async function getStravaActivities(limit = 10) {
  // Vérifier si l'utilisateur est authentifié
  if (!stravaAuth.accessToken) {
    const authenticated = await authenticateWithStrava();
    if (!authenticated) {
      throw new Error("L'utilisateur n'est pas authentifié avec Strava");
    }
  }

  // Vérifier si le token est expiré
  const expiresAt = new Date(stravaAuth.expiresAt).getTime();
  if (Date.now() >= expiresAt) {
    const refreshed = await refreshToken();
    if (!refreshed) {
      throw new Error("Impossible de rafraîchir le token Strava");
    }
  }

  try {
    const response = await fetch(`https://www.strava.com/api/v3/athlete/activities?per_page=${limit}`, {
      headers: {
        'Authorization': `Bearer ${stravaAuth.accessToken}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Erreur Strava: ${errorData.message || response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération des activités Strava:', error);
    throw error;
  }
}

/**
 * Synchronise l'historique des entraînements avec Strava
 * @param {number} limit - Nombre maximum d'entraînements à synchroniser
 * @returns {Promise<Object>} - Résultats de la synchronisation
 */
export async function syncWorkoutHistory(limit = 5) {
  console.log('Début de synchronisation de l\'historique avec Strava');
  
  // Vérifier si l'utilisateur est authentifié
  if (!isConnectedToStrava()) {
    console.log('Utilisateur non connecté, tentative d\'authentification...');
    const authenticated = await authenticateWithStrava();
    if (!authenticated) {
      throw new Error("L'utilisateur n'est pas authentifié avec Strava");
    }
  }

  // Vérifier si le token est expiré et le rafraîchir si nécessaire
  const expiresAt = new Date(stravaAuth.expiresAt).getTime();
  const now = Date.now();
  
  console.log('Vérification de l\'expiration du token:', {
    expiresAt: new Date(expiresAt).toISOString(),
    now: new Date(now).toISOString(),
    isExpired: now >= expiresAt
  });
  
  if (now >= expiresAt) {
    console.log('Token expiré, tentative de rafraîchissement...');
    const refreshed = await refreshToken();
    if (!refreshed) {
      throw new Error("Impossible de rafraîchir le token Strava");
    }
  }

  // Récupérer l'historique des entraînements
  const { getWorkoutHistory, updateWorkoutWithStravaId } = await import('./WorkoutStorage');
  const history = getWorkoutHistory();
  
  // Filtrer les entraînements qui n'ont pas encore été synchronisés
  const unsyncedWorkouts = history
    .filter(workout => !workout.syncedWithStrava && !workout.stravaId)
    .slice(0, limit);
  
  console.log(`${unsyncedWorkouts.length} entraînements à synchroniser`);
  
  const results = {
    synced: 0,
    failed: 0,
    details: []
  };
  
  // Synchroniser chaque entraînement non synchronisé
  for (const workout of unsyncedWorkouts) {
    try {
      console.log(`Synchronisation de l'entraînement: ${workout.title}`);
      
      // Vérifier si cet entraînement contient déjà un ID Strava (pour éviter les doublons)
      if (workout.stravaId) {
        results.details.push({
          title: workout.title,
          status: 'skipped',
          reason: 'Déjà synchronisé'
        });
        continue;
      }
      
      // Préparer les données pour Strava
      const stravaActivity = {
        name: workout.title || "Entraînement Project Fat Loss",
        type: "WeightTraining",
        start_date_local: workout.date,
        elapsed_time: workout.duration || workout.exerciseCount * 180 || 1800, // 3 min par exercice ou 30min par défaut
        description: `Entraînement de musculation: ${workout.exerciseCount} exercices, ${workout.calories} calories brûlées, ${workout.weightLifted || 0}kg soulevés`,
      };
      
      console.log('Envoi des données à Strava:', {
        token: `${stravaAuth.accessToken.substring(0, 5)}...`,
        activity: stravaActivity
      });
      
      // Envoyer l'entraînement à Strava
      const response = await fetch('https://www.strava.com/api/v3/activities', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${stravaAuth.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(stravaActivity)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || response.statusText;
        } catch (e) {
          errorMessage = `${response.status} ${response.statusText}: ${errorText}`;
        }
        console.error('Erreur Strava:', {
          status: response.status,
          message: errorMessage
        });
        throw new Error(`Erreur Strava: ${errorMessage}`);
      }
      
      const data = await response.json();
      console.log('Activité créée sur Strava:', data.id);
      
      // Mettre à jour l'entrainement local avec l'ID Strava
      await updateWorkoutWithStravaId(workout.id, data.id);
      
      results.synced++;
      results.details.push({
        title: workout.title,
        status: 'success',
        stravaId: data.id
      });
    } catch (error) {
      console.error(`Erreur lors de la synchronisation de l'entraînement ${workout.title}:`, error);
      results.failed++;
      results.details.push({
        title: workout.title,
        status: 'failed',
        error: error.message
      });
    }
  }
  
  return results;
}

/**
 * Vérifie si l'utilisateur est connecté à Strava
 * @returns {boolean} - true si l'utilisateur est connecté
 */
export function isConnectedToStrava() {
  const accessToken = localStorage.getItem('strava_access_token') || stravaAuth.accessToken;
  
  if (!accessToken) {
    console.log('Pas de token Strava: utilisateur non connecté');
    return false;
  }

  // Mettre à jour stravaAuth depuis localStorage si nécessaire
  if (accessToken !== stravaAuth.accessToken) {
    stravaAuth.accessToken = accessToken;
    stravaAuth.refreshToken = localStorage.getItem('strava_refresh_token') || stravaAuth.refreshToken;
    stravaAuth.expiresAt = localStorage.getItem('strava_expires_at') || stravaAuth.expiresAt;
  }
  
  return true;
}

/**
 * Déconnecte l'utilisateur de Strava
 */
export function disconnectFromStrava() {
  localStorage.removeItem('strava_access_token');
  localStorage.removeItem('strava_refresh_token');
  localStorage.removeItem('strava_expires_at');
  localStorage.removeItem(STRAVA_STATS_KEY);
  
  stravaAuth = {
    accessToken: null,
    refreshToken: null,
    expiresAt: null
  };
}

/**
 * Récupère les statistiques d'entraînements synchronisés avec Strava
 * @returns {Promise<Object>} - Les statistiques
 */
export async function getStravaSyncStats() {
  try {
    // Vérifier si les stats sont en cache
    const cachedStats = localStorage.getItem(STRAVA_STATS_KEY);
    if (cachedStats) {
      const stats = JSON.parse(cachedStats);
      const cacheAge = Date.now() - stats.lastUpdate;
      // Utiliser le cache si moins de 1 heure
      if (cacheAge < 3600000) {
        return stats;
      }
    }

    // Si pas connecté, retourner des stats vides
    if (!isConnectedToStrava()) {
      return {
        totalSynced: 0,
        totalDistance: 0,
        totalCalories: 0,
        lastSync: null,
        lastUpdate: Date.now()
      };
    }

    // Chercher les 100 dernières activités
    const activities = await getStravaActivities(100);
    const stats = {
      totalSynced: activities.length,
      totalDistance: activities.reduce((sum, act) => sum + (act.distance || 0), 0),
      totalCalories: activities.reduce((sum, act) => sum + (act.calories || 0), 0),
      lastSync: activities[0]?.start_date || null,
      lastUpdate: Date.now()
    };

    // Mettre en cache
    localStorage.setItem(STRAVA_STATS_KEY, JSON.stringify(stats));
    return stats;
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques Strava:', error);
    throw error;
  }
}
