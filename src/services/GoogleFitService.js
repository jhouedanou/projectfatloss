// Service pour l'intégration avec Google Fit
const CLIENT_ID = 'VOTRE_CLIENT_ID'; // À remplacer par votre Client ID Google
const SCOPES = [
  'https://www.googleapis.com/auth/fitness.activity.write',
  'https://www.googleapis.com/auth/fitness.body.write'
];

class GoogleFitService {
  constructor() {
    this.isInitialized = false;
  }

  async init() {
    if (this.isInitialized) return;
    
    try {
      await this.loadGapiScript();
      await this.initGapiClient();
      this.isInitialized = true;
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de Google Fit:', error);
      throw error;
    }
  }

  loadGapiScript() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }

  async initGapiClient() {
    await new Promise((resolve) => gapi.load('client:auth2', resolve));
    await gapi.client.init({
      clientId: CLIENT_ID,
      scope: SCOPES.join(' ')
    });
  }

  async signIn() {
    if (!this.isInitialized) await this.init();
    
    try {
      const googleAuth = gapi.auth2.getAuthInstance();
      const user = await googleAuth.signIn();
      return user;
    } catch (error) {
      console.error('Erreur lors de la connexion à Google Fit:', error);
      throw error;
    }
  }

  async addActivity(activity) {
    if (!this.isInitialized) await this.init();
    
    const startTime = new Date(activity.startTime).getTime();
    const endTime = startTime + (activity.duration || 3600000); // Durée par défaut 1h

    const request = {
      userId: 'me',
      resource: {
        aggregateBy: [{
          dataTypeName: 'com.google.calories.expended',
          dataSourceId: 'derived:com.google.calories.expended:com.google.android.gms:merge_calories_expended'
        }],
        bucketByTime: { durationMillis: activity.duration || 3600000 },
        startTimeMillis: startTime,
        endTimeMillis: endTime,
        session: {
          name: activity.name,
          description: activity.description,
          startTimeMillis: startTime,
          endTimeMillis: endTime,
          application: {
            packageName: 'com.projectfatloss'
          },
          activityType: activity.activityType
        },
        point: [{
          dataTypeName: 'com.google.calories.expended',
          startTimeNanos: startTime * 1000000,
          endTimeNanos: endTime * 1000000,
          value: [{
            fpVal: activity.calories
          }]
        }]
      }
    };

    try {
      await gapi.client.request({
        path: 'https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate',
        method: 'POST',
        body: request
      });
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'activité:', error);
      throw error;
    }
  }
}

export default new GoogleFitService();