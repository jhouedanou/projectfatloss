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
  'https://www.googleapis.com/auth/fitness.body.write',
  'https://www.googleapis.com/auth/fitness.nutrition.write'
].join(' ');

const GIS_SRC = 'https://accounts.google.com/gsi/client';

// Erreur d'appel à l'API Fitness, porteuse du code HTTP pour un test fiable
// (plutôt qu'un parsing de chaîne).
class GoogleFitApiError extends Error {
  constructor(message, status, body) {
    super(message);
    this.name = 'GoogleFitApiError';
    this.status = status;
    this.body = body;
  }
}

// Construit un message d'erreur concis et lisible à partir d'une réponse d'erreur
// de l'API (qui renvoie souvent un gros JSON), pour l'affichage utilisateur.
function describeApiError(status, rawBody) {
  let message;
  try {
    const parsed = JSON.parse(rawBody);
    message = parsed?.error?.message || parsed?.error_description || parsed?.error;
  } catch {
    // Le corps n'est pas du JSON : on le garde tel quel s'il est court.
  }
  if (!message) {
    message = rawBody && rawBody.length <= 200 ? rawBody : `Erreur HTTP ${status}`;
  }
  return `Google Fit (${status}) : ${message}`;
}

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
      await this.loadScript(GIS_SRC, () => !!(window.google && window.google.accounts && window.google.accounts.oauth2));

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

  // Charge un script externe. `isReady` (optionnel) est un prédicat indiquant que
  // la lib est déjà disponible : il évite tout blocage si le script a été injecté
  // ailleurs (sans data-loaded) et a déjà fini de charger — l'événement `load`
  // ne se redéclenchant pas dans ce cas.
  loadScript(src, isReady) {
    return new Promise((resolve, reject) => {
      if (typeof isReady === 'function' && isReady()) {
        resolve();
        return;
      }

      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) {
        if (existing.dataset.loaded === 'true') {
          resolve();
        } else {
          existing.addEventListener('load', () => resolve());
          existing.addEventListener('error', () => reject(new Error(`Échec du chargement du script ${src}`)));
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
          reject(new Error(`Erreur d'autorisation Google (${response.error}). Vérifiez que l'origine du site est autorisée dans la console Google Cloud.`));
          return;
        }
        this.accessToken = response.access_token;
        // expires_in est en secondes ; on garde une marge de 60 s.
        const ttl = (response.expires_in || 3600) - 60;
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

  // Construit l'ID déterministe d'une source de données "raw"
  // (format imposé : type:dataType:projectNumber:manufacturer:model:uid:streamName).
  buildDataSourceId(dataTypeName, streamName) {
    return `raw:${dataTypeName}:${PROJECT_NUMBER}:ProjectFatLoss:web:1:${streamName}`;
  }

  // Crée la source de données si elle n'existe pas déjà (ignore l'erreur 409).
  async ensureDataSource(dataTypeName, streamName) {
    try {
      await this.apiFetch('dataSources', 'POST', {
        dataStreamName: streamName,
        type: 'raw',
        application: { name: 'Project Fat Loss' },
        dataType: { name: dataTypeName },
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
      if (error.status !== 409) throw error;
    }
  }

  // Convertit des millisecondes en nanosecondes (chaîne) après validation.
  // Les nanosecondes dépassent Number.MAX_SAFE_INTEGER : on passe par BigInt.
  toNanos(timestampMillis) {
    if (!Number.isFinite(timestampMillis)) {
      throw new Error('Horodatage invalide pour Google Fit.');
    }
    return (BigInt(timestampMillis) * 1000000n).toString();
  }

  // Écrit un point instantané (startTime == endTime) dans un dataset.
  async writeInstantPoint(dataTypeName, streamName, timestampMillis, value) {
    const dataSourceId = this.buildDataSourceId(dataTypeName, streamName);
    const ts = this.toNanos(timestampMillis);
    const datasetId = `${ts}-${ts}`;
    await this.apiFetch(`dataSources/${dataSourceId}/datasets/${datasetId}`, 'PATCH', {
      dataSourceId,
      minStartTimeNs: ts,
      maxEndTimeNs: ts,
      point: [{
        dataTypeName,
        startTimeNanos: ts,
        endTimeNanos: ts,
        value
      }]
    });
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
      throw new GoogleFitApiError(describeApiError(response.status, detail), response.status, detail);
    }

    return response.status === 204 ? null : response.json();
  }

  async addActivity(activity) {
    if (!this.isInitialized) await this.init();

    const startTimeMillis = new Date(activity.startTime).getTime();
    const durationMillis = activity.duration || 3600000; // Durée par défaut 1h
    const endTimeMillis = startTimeMillis + durationMillis;

    // toNanos valide les horodatages (lève une erreur si startTime est invalide)
    // et sérialise en chaîne (l'API accepte les int64 sous forme de string).
    const startTimeNanos = this.toNanos(startTimeMillis);
    const endTimeNanos = this.toNanos(endTimeMillis);

    const dataSourceId = this.buildDataSourceId('com.google.calories.expended', 'ProjectFatLossCalories');

    try {
      // 1. Créer la source de données (ignore l'erreur 409 si elle existe déjà).
      await this.ensureDataSource('com.google.calories.expended', 'ProjectFatLossCalories');

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
        // Pas de packageName : un client web/REST n'est pas une app Android de
        // confiance, et Google Fit rejette alors la session (403 "un-trusted source").
        application: {
          name: 'Project Fat Loss'
        },
        activityType: activity.activityType
      });

      return true;
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'activité:', error);
      throw error;
    }
  }

  // Enregistre une pesée (poids corporel) dans Google Fit.
  async addWeight(weightKg, timestampMillis = Date.now()) {
    if (!this.isInitialized) await this.init();

    try {
      await this.ensureDataSource('com.google.weight', 'ProjectFatLossWeight');
      await this.writeInstantPoint('com.google.weight', 'ProjectFatLossWeight', timestampMillis, [
        { fpVal: weightKg }
      ]);
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'ajout du poids:', error);
      throw error;
    }
  }

  // Enregistre un résumé nutritionnel (calories + macros) dans Google Fit.
  async addNutrition(nutrition, timestampMillis = Date.now()) {
    if (!this.isInitialized) await this.init();

    try {
      await this.ensureDataSource('com.google.nutrition', 'ProjectFatLossNutrition');
      await this.writeInstantPoint('com.google.nutrition', 'ProjectFatLossNutrition', timestampMillis, [
        {
          mapVal: [
            { key: 'calories', value: { fpVal: nutrition.calories || 0 } },
            { key: 'protein', value: { fpVal: nutrition.protein || 0 } },
            { key: 'fat.total', value: { fpVal: nutrition.fat || 0 } },
            { key: 'carbs.total', value: { fpVal: nutrition.carbs || 0 } }
          ]
        },
        { intVal: 1 }, // meal_type : 1 = inconnu (résumé journalier)
        { stringVal: 'Résumé journalier Project Fat Loss' }
      ]);
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la nutrition:', error);
      throw error;
    }
  }
}

export default new GoogleFitService();
