/**
 * Enregistrement d'une sortie vélo faite dans l'app (séance immersive ou
 * échauffement avant la muscu) et des fantômes par parcours.
 */

import { addCardioSession, deleteCardioSession, getCardioSessions } from '../CardioStorage';
import GoogleFitService from '../GoogleFitService';
import { bikeSessionDayKey, isChecklistSession, syncCardioToGoogleFit } from '../GoogleFitSync';
import { isBetterGhost, GHOST_STEP_SEC } from './rideSession';

const GHOSTS_KEY = 'ride_ghosts';
/** Fantômes gardés au plus (les plus anciens partent). */
const MAX_GHOSTS = 40;

const readGhosts = () => {
  try {
    const all = JSON.parse(localStorage.getItem(GHOSTS_KEY) || '{}');
    return all && typeof all === 'object' ? all : {};
  } catch (error) {
    return {};
  }
};

/** Meilleur passage enregistré sur ce parcours, ou null. */
export function loadGhost(videoId) {
  const ghost = readGhosts()[videoId];
  return ghost && Array.isArray(ghost.positions) && ghost.positions.length ? ghost : null;
}

/**
 * Garde chaque passage qui bat le précédent sur son parcours.
 * @param {Array} segments [{ videoId, positions }]
 */
export function saveGhosts(segments) {
  const all = readGhosts();
  const date = new Date().toISOString();
  (segments || []).forEach(({ videoId, positions }) => {
    // Moins de 30 s sur un parcours : rien à battre.
    if (!videoId || !positions || positions.length < 6) return;
    const candidate = { date, step: GHOST_STEP_SEC, positions: positions.map((p) => Math.round(p * 10) / 10) };
    if (isBetterGhost(candidate, all[videoId])) all[videoId] = candidate;
  });
  const kept = Object.entries(all)
    .sort((a, b) => String(b[1].date).localeCompare(String(a[1].date)))
    .slice(0, MAX_GHOSTS);
  try {
    localStorage.setItem(GHOSTS_KEY, JSON.stringify(Object.fromEntries(kept)));
  } catch (error) {
    /* stockage plein : le fantôme ne sera pas gardé */
  }
}

/**
 * Enregistre la sortie comme séance cardio « vélo » et la pousse vers Google
 * Fit si un jeton valide existe déjà (pas de popup en pleine séance).
 *
 * Une case « vélo » cochée à la main le même jour, pour une durée que la
 * sortie couvre, est retirée : la vraie séance la remplace, sans double compte.
 * @returns {Object} la séance créée
 */
export function saveRideSession(ride) {
  const record = addCardioSession({
    type: 'bike',
    duration: ride.durationMin,
    distance: ride.distanceKm,
    calories: ride.calories,
    notes: JSON.stringify({
      source: ride.source,
      mode: ride.mode,
      calorieSource: ride.calorieSource,
      targetMin: ride.targetMin,
      videoId: ride.videoId,
      videoTitle: ride.videoTitle,
      routes: ride.routes,
      avgWatts: ride.avgWatts,
      avgBpm: ride.avgBpm,
      maxSpeedKmh: ride.maxSpeedKmh,
    }),
  });

  const day = bikeSessionDayKey(record);
  getCardioSessions()
    .filter(
      (session) =>
        session.type === 'bike' &&
        isChecklistSession(session) &&
        bikeSessionDayKey(session) === day &&
        (Number(session.duration) || 0) <= ride.durationMin
    )
    .forEach((session) => deleteCardioSession(session.id));

  if (GoogleFitService.isSignedIn()) {
    syncCardioToGoogleFit(record).catch((error) =>
      console.warn('Sync Google Fit de la sortie vélo reportée:', error?.message)
    );
  }

  return record;
}
