/**
 * Service pour l'intégration avec Strava
 */

// Configuration Strava
const STRAVA_CONFIG = {
  clientId: '159311',
  clientSecret: '6e2acab2c5731c20a946fe672afdfc8a6b6485f1',
  redirectUri: window.location.origin,
  scope: 'read',
};

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
    const response = await fetch('https://www.strava.com/oauth/token', {
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
  // Si déjà authentifié et token valide, ne rien faire
  if (stravaAuth.accessToken) {
    const expiresAt = new Date(stravaAuth.expiresAt).getTime();
    if (expiresAt > Date.now()) {
      return Promise.resolve(true);
    }
  }
  
  // Rediriger vers la page d'authentification Strava
  const authUrl = `https://www.strava.com/oauth/authorize?client_id=${STRAVA_CONFIG.clientId}&redirect_uri=${encodeURIComponent(STRAVA_CONFIG.redirectUri)}&response_type=code&scope=${STRAVA_CONFIG.scope}`;
  
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
 * Enregistre un entraînement sur Strava
 * @param {Object} workout - Les données de l'entraînement
 * @returns {Promise<Object>} - Les données de l'entraînement enregistré
 */
export async function syncWorkout(workout) {
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
    // Formatter les données pour Strava
    const stravaActivity = {
      name: workout.name || "Entraînement Project Fat Loss",
      type: "WeightTraining",
      start_date_local: workout.date ? new Date(workout.date).toISOString() : new Date().toISOString(),
      elapsed_time: workout.duration || 1800, // Par défaut 30 minutes
      description: workout.desc || `Entraînement de musculation: ${workout.exerciseCount || 0} exercices, ${workout.calories || 0} calories brûlées`,
    };

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
      const errorData = await response.json();
      throw new Error(`Erreur Strava: ${errorData.message || response.statusText}`);
    }

    const data = await response.json();
    console.log('Entraînement synchronisé avec Strava:', data);
    
    return data;
  } catch (error) {
    console.error('Erreur lors de la synchronisation avec Strava:', error);
    throw error;
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
 * Vérifie si l'utilisateur est connecté à Strava
 * @returns {boolean} - true si l'utilisateur est connecté
 */
export function isConnectedToStrava() {
  return !!stravaAuth.accessToken;
}

/**
 * Déconnecte l'utilisateur de Strava
 */
export function disconnectFromStrava() {
  localStorage.removeItem('strava_access_token');
  localStorage.removeItem('strava_refresh_token');
  localStorage.removeItem('strava_expires_at');
  
  stravaAuth = {
    accessToken: null,
    refreshToken: null,
    expiresAt: null
  };
}
