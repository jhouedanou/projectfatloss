/**
 * Lecture de l'API Google Health (https://health.googleapis.com/v4), qui
 * succède à l'API Web de Fitbit et à Google Fit. Elle renvoie les données de
 * l'application Google Health (Fitbit, Pixel Watch, saisies), et celles de
 * Health Connect d'après sa documentation (famille de sources « all-sources »).
 *
 * Ce qui est lu ici :
 *   - pas par jour : dataPoints:rollUp sur des fenêtres de 24 h ;
 *   - pesées : type « weight » (weightGrams, sampleTime.physicalTime) ;
 *   - taux de graisse : type « body-fat » (percentage).
 * Distance, calories, sommeil et séances ne sont pas encore lus : la forme
 * exacte de leurs réponses reste à vérifier sur un vrai compte.
 *
 * À faire une fois dans la console Google Cloud du projet (même client OAuth
 * que Google Fit) : activer « Google Health API », ajouter les deux portées
 * ci-dessous à l'écran de consentement, et s'ajouter comme utilisateur de test.
 * Ce code n'a pas pu être essayé sur un vrai compte.
 */

import GoogleFitService, { GOOGLE_CLIENT_ID } from './GoogleFitService';
import { DAY_MS, dayKey } from './FitMetrics';
import { mergeFitDays, setFitMeta } from './FitStore';
import { addWeightRecord, getWeightHistory, importWeightRecords } from './WeightStorage';

const API = 'https://health.googleapis.com/v4/users/me/dataTypes';
const SCOPES = [
  'https://www.googleapis.com/auth/googlehealth.activity_and_fitness.readonly',
  'https://www.googleapis.com/auth/googlehealth.health_metrics_and_measurements.readonly',
].join(' ');
const DAYS = 90;
const MAX_PAGES = 20;

let tokenClient = null;
let accessToken = null;
let tokenExpiresAt = 0;

async function getToken() {
  if (accessToken && Date.now() < tokenExpiresAt) return accessToken;
  await GoogleFitService.init(); // charge Google Identity Services
  return new Promise((resolve, reject) => {
    if (!tokenClient) {
      tokenClient = window.google.accounts.oauth2.initTokenClient({ client_id: GOOGLE_CLIENT_ID, scope: SCOPES, callback: () => {} });
    }
    tokenClient.callback = (response) => {
      if (response.error) {
        reject(new Error(`Autorisation Google Health refusée (${response.error}).`));
        return;
      }
      accessToken = response.access_token;
      tokenExpiresAt = Date.now() + Math.max(0, (response.expires_in || 3600) - 60) * 1000;
      resolve(accessToken);
    };
    try {
      tokenClient.requestAccessToken({ prompt: accessToken ? '' : 'consent' });
    } catch (error) {
      reject(error);
    }
  });
}

async function healthFetch(path, { method = 'GET', body = null } = {}) {
  const token = await getToken();
  let response;
  try {
    response = await fetch(`${API}/${path}`, {
      method,
      headers: { Authorization: `Bearer ${token}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    throw new Error("Google Health ne répond pas depuis le navigateur (réseau, ou appel refusé par le service).");
  }
  if (!response.ok) {
    const text = await response.text();
    let message = `erreur HTTP ${response.status}`;
    try { message = JSON.parse(text)?.error?.message || message; } catch { /* corps non JSON */ }
    if (response.status === 403 && /has not been used|is disabled|SERVICE_DISABLED/i.test(text)) {
      message = "« Google Health API » n'est pas activée sur le projet Google Cloud.";
    } else if (/MISSING_OAUTH_SCOPE|insufficient/i.test(text)) {
      message = "l'autorisation de lecture n'a pas été donnée (portées Google Health manquantes sur l'écran de consentement).";
    }
    throw new Error(`Google Health (${response.status}) : ${message}`);
  }
  return response.json();
}

/** Pas de chaque jour (heure locale) sur `days` jours. */
async function readDailySteps(days) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));
  const data = await healthFetch('steps/dataPoints:rollUp', {
    method: 'POST',
    body: {
      range: { startTime: start.toISOString(), endTime: new Date().toISOString() },
      windowSize: '86400s',
    },
  });
  const byDay = {};
  (data.rollupDataPoints || []).forEach((point) => {
    const steps = Number(point.steps?.countSum);
    if (!(steps > 0) || !point.startTime) return;
    // Milieu de la fenêtre : à l'abri d'un changement d'heure.
    const key = dayKey(new Date(new Date(point.startTime).getTime() + DAY_MS / 2));
    byDay[key] = { steps: (byDay[key]?.steps || 0) + steps };
  });
  return byDay;
}

/** Tous les points d'un type sur `days` jours (pagination comprise). */
async function listPoints(type, field, days) {
  const since = new Date(Date.now() - days * DAY_MS).toISOString();
  const filter = `${field}.sample_time.physical_time >= "${since}"`;
  const points = [];
  let pageToken = '';
  for (let page = 0; page < MAX_PAGES; page += 1) {
    const query = new URLSearchParams({ filter, ...(pageToken ? { pageToken } : {}) });
    const data = await healthFetch(`${type}/dataPoints?${query.toString()}`);
    points.push(...(data.dataPoints || []));
    pageToken = data.nextPageToken || '';
    if (!pageToken) break;
  }
  return points;
}

/**
 * Importe les pas et les pesées de Google Health.
 * @returns {Promise<{ days:number, weights:number, bodyFat:number }>}
 */
export async function importFromGoogleHealth({ days = DAYS } = {}) {
  const byDay = await readDailySteps(days);
  mergeFitDays(byDay);

  // Pesées absentes de l'historique (même jour, à 0,1 kg près).
  const known = getWeightHistory().map((r) => ({ day: dayKey(new Date(r.date)), kg: Number(r.weight) }));
  const weights = (await listPoints('weight', 'weight', days)).flatMap((point) => {
    const kg = Math.round(Number(point.weight?.weightGrams) / 100) / 10;
    const time = new Date(point.weight?.sampleTime?.physicalTime).getTime();
    if (!(kg > 20) || Number.isNaN(time)) return [];
    const day = dayKey(new Date(time));
    if (known.some((k) => k.day === day && Math.abs(k.kg - kg) < 0.1)) return [];
    known.push({ day, kg });
    return [{ weight: kg, date: new Date(time).toISOString(), notes: 'Google Health' }];
  });

  // Taux de graisse : rattaché à la pesée du même jour quand elle n'en a pas.
  let bodyFat = 0;
  try {
    const fatByDay = {};
    (await listPoints('body-fat', 'body_fat', days)).forEach((point) => {
      const percent = Number(point.bodyFat?.percentage);
      const time = new Date(point.bodyFat?.sampleTime?.physicalTime).getTime();
      if (percent > 2 && percent < 75 && !Number.isNaN(time)) fatByDay[dayKey(new Date(time))] = Math.round(percent * 10) / 10;
    });
    weights.forEach((w) => {
      const percent = fatByDay[dayKey(new Date(w.date))];
      if (percent) { w.composition = { bodyFat: percent }; bodyFat += 1; }
    });
  } catch (error) {
    console.warn('[google health] taux de graisse non lu :', error?.message);
  }

  // importWeightRecords ne garde pas la composition : ces pesées passent une à une.
  importWeightRecords(weights.filter((w) => !w.composition));
  weights.filter((w) => w.composition).forEach((w) => addWeightRecord(w.weight, w.date, w.notes, w.composition));

  setFitMeta({ lastSyncAt: Date.now(), source: 'Google Health' });
  import('./SyncService').then(({ syncData }) => syncData()).catch(() => {});
  return { days: Object.keys(byDay).length, weights: weights.length, bodyFat };
}
