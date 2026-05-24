// Service pour l'intégration avec Google Fit
const CLIENT_ID = '310337608749-e771j9tp94c7i0mts2basfarc53i4ecl.apps.googleusercontent.com'; // À remplacer par votre Client ID Google
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
    const endTime = startTime + (activity.duration || 1800000); // Durée par défaut 30 min
    const sessionId = `projectfatloss-${startTime}`;

    try {
      // Créer la session d'entraînement via l'API Sessions
      await gapi.client.request({
        path: `https://www.googleapis.com/fitness/v1/users/me/sessions/${sessionId}`,
        method: 'PUT',
        body: {
          id: sessionId,
          name: activity.name,
          description: activity.description || '',
          startTimeMillis: startTime,
          endTimeMillis: endTime,
          activityType: activity.activityType || 97, // 97 = Musculation
          application: {
            packageName: 'com.projectfatloss',
            name: 'Project Fat Loss',
            version: '1'
          }
        }
      });
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'activité:', error);
      throw error;
    }
  }
}

export default new GoogleFitService();