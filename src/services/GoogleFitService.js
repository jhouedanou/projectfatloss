// Service pour l'intégration avec Google Fit
// Utilise Google Identity Services (GIS) — l'ancien flux gapi.auth2 est déprécié
// et désactivé par Google depuis 2023.
//
// IMPORTANT : dans la Google Cloud Console, l'OAuth Client ID ci-dessous doit
// déclarer comme "Authorized JavaScript origins" :
//   - https://jhouedanou.github.io   (production GitHub Pages)
//   - http://localhost:5173          (développement local)
const CLIENT_ID = '310337608749-e771j9tp94c7i0mts2basfarc53i4ecl.apps.googleusercontent.com';
// Numéro de projet Google (préfixe du Client ID), utilisé pour l'ID des sources de données.
const PROJECT_NUMBER = CLIENT_ID.split('-')[0];

const SCOPES = [
  'https://www.googleapis.com/auth/fitness.activity.write',
  'https://www.googleapis.com/auth/fitness.body.write'
].join(' ');

const GIS_SRC = 'https://accounts.google.com/gsi/client';

class GoogleFitService {
  constructor() {
    this.tokenClient = null;
    this.accessToken = null;
    this.tokenExpiresAt = 0;
    this.isInitialized = false;
  }

  async init() {
    if (this.isInitialized) return;

    try {
      await this.loadScript(GIS_SRC);

      if (!window.google || !window.google.accounts || !window.google.accounts.oauth2) {
        throw new Error('Google Identity Services indisponible (script non chargé). Vérifiez votre connexion réseau ou un bloqueur de scripts.');
      }

      this.tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        // Le callback est défini dynamiquement à chaque demande de token (cf. signIn).
        callback: () => {}
      });

      this.isInitialized = true;
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de Google Fit:', error);
      throw error;
    }
  }

  loadScript(src) {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) {
        if (
          existing.dataset.loaded === 'true' ||
          (src === GIS_SRC && !!window.google?.accounts?.oauth2) ||
          existing.readyState === 'complete' ||
          existing.readyState === 'loaded'
        ) {
          resolve();
        } else {
          existing.addEventListener('load', () => resolve(), { once: true });
          existing.addEventListener('error', () => reject(new Error(`Échec du chargement du script ${src}`)), { once: true });
        }
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        script.dataset.loaded = 'true';
        resolve();
      };
      script.onerror = () => reject(new Error(`Échec du chargement du script ${src}`));
      document.body.appendChild(script);
    });
  }

  // Indique si un token d'accès valide est disponible (non expiré).
  isSignedIn() {
    return !!this.accessToken && Date.now() < this.tokenExpiresAt;
  }

  // Demande (ou réutilise) un token d'accès OAuth via GIS.
  async signIn() {
    if (!this.isInitialized) await this.init();

    if (this.isSignedIn()) {
      return this.accessToken;
    }

    return new Promise((resolve, reject) => {
      this.tokenClient.callback = (response) => {
        if (response.error) {
          const originHint = response.error === 'origin_mismatch'
            ? ' Vérifiez que l\'origine du site est autorisée dans la console Google Cloud.'
            : '';
          reject(new Error(`Erreur d'autorisation Google (${response.error}).${originHint}`));
          return;
        }
        this.accessToken = response.access_token;
        // expires_in est en secondes ; on garde une marge de 60 s.
        const ttl = Math.max(0, (response.expires_in || 3600) - 60);
        this.tokenExpiresAt = Date.now() + ttl * 1000;
        resolve(this.accessToken);
      };

      try {
        // prompt '' : silencieux si l'utilisateur a déjà consenti, sinon affiche le popup.
        this.tokenClient.requestAccessToken({ prompt: this.accessToken ? '' : 'consent' });
      } catch (error) {
        reject(error);
      }
    });
  }

  // Révoque le token courant et déconnecte l'utilisateur.
  signOut() {
    if (this.accessToken && window.google && window.google.accounts && window.google.accounts.oauth2) {
      window.google.accounts.oauth2.revoke(this.accessToken, () => {});
    }
    this.accessToken = null;
    this.tokenExpiresAt = 0;
  }

  // Appel REST authentifié vers l'API Fitness.
  async apiFetch(path, method, body) {
    const token = await this.signIn();
    const response = await fetch(`https://www.googleapis.com/fitness/v1/users/me/${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: body ? JSON.stringify(body) : undefined
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`API Google Fit ${response.status}: ${detail}`);
    }

    return response.status === 204 ? null : response.json();
  }

  async addActivity(activity) {
    if (!this.isInitialized) await this.init();

    const startTimeMillis = new Date(activity.startTime).getTime();
    const durationMillis = activity.duration || 3600000; // Durée par défaut 1h
    const endTimeMillis = startTimeMillis + durationMillis;

    // Les nanosecondes dépassent Number.MAX_SAFE_INTEGER : on utilise BigInt
    // puis on sérialise en chaîne (l'API accepte les int64 sous forme de string).
    const startTimeNanos = (BigInt(startTimeMillis) * 1000000n).toString();
    const endTimeNanos = (BigInt(endTimeMillis) * 1000000n).toString();

    // ID déterministe de la source de données "raw" (format imposé par l'API) :
    // type:dataType:projectNumber:manufacturer:model:uid:streamName
    const dataSourceId = `raw:com.google.calories.expended:${PROJECT_NUMBER}:ProjectFatLoss:web:1:ProjectFatLossCalories`;

    try {
      // 1. Créer la source de données (ignore l'erreur 409 si elle existe déjà).
      try {
        await this.apiFetch('dataSources', 'POST', {
          dataStreamName: 'ProjectFatLossCalories',
          type: 'raw',
          application: { name: 'Project Fat Loss' },
          dataType: {
            name: 'com.google.calories.expended',
            field: [{ name: 'calories', format: 'floatPoint' }]
          },
          device: {
            manufacturer: 'ProjectFatLoss',
            model: 'web',
            type: 'unknown',
            uid: '1',
            version: '1'
          }
        });
      } catch (error) {
        // 409 Conflict = source déjà existante, ce qui est attendu.
        if (!/\b409\b/.test(error.message)) throw error;
      }

      // 2. Écrire le point de calories dépensées dans le dataset.
      const datasetId = `${startTimeNanos}-${endTimeNanos}`;
      await this.apiFetch(`dataSources/${dataSourceId}/datasets/${datasetId}`, 'PATCH', {
        dataSourceId,
        minStartTimeNs: startTimeNanos,
        maxEndTimeNs: endTimeNanos,
        point: [{
          dataTypeName: 'com.google.calories.expended',
          startTimeNanos,
          endTimeNanos,
          value: [{ fpVal: activity.calories }]
        }]
      });

      // 3. Créer la séance (session) associée.
      const sessionId = `projectfatloss-${startTimeMillis}`;
      await this.apiFetch(`sessions/${sessionId}`, 'PUT', {
        id: sessionId,
        name: activity.name,
        description: activity.description,
        startTimeMillis,
        endTimeMillis,
        application: {
          name: 'Project Fat Loss',
          packageName: 'com.projectfatloss'
        },
        activityType: activity.activityType
      });

      return true;
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'activité:', error);
      throw error;
    }
  }
}

export default new GoogleFitService();
