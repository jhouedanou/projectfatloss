/**
 * Stockage local des séances cardio (marche / vélo) — offline-first.
 * Chaque séance pousse vers Supabase (table cardio_sessions) quand connecté.
 */

const CARDIO_KEY = 'cardio_sessions_data';

export const CARDIO_TYPES = {
  walk: { label: 'Marche', icon: 'walk' },
  bike: { label: 'Vélo', icon: 'bike' },
};

/**
 * Récupère toutes les séances cardio (plus récentes en premier).
 * @returns {Array}
 */
export function getCardioSessions() {
  try {
    const json = localStorage.getItem(CARDIO_KEY);
    return json ? JSON.parse(json) : [];
  } catch (error) {
    console.error('Erreur lecture cardio:', error);
    return [];
  }
}

/**
 * Ajoute une séance cardio.
 * @param {Object} session - { type:'walk'|'bike', date?, duration?, distance?, calories, notes? }
 * @returns {Object} la séance créée
 */
export function addCardioSession({ type, date = null, duration = null, distance = null, calories = null, notes = '' }) {
  if (type !== 'walk' && type !== 'bike') {
    throw new Error('Type cardio invalide (walk|bike)');
  }

  const sessions = getCardioSessions();
  const record = {
    id: Date.now(),
    type,
    date: date || new Date().toISOString(),
    duration: duration != null ? Number(duration) : null,
    distance: distance != null ? Number(distance) : null,
    calories: calories != null ? Number(calories) : null,
    notes,
  };

  sessions.unshift(record);
  localStorage.setItem(CARDIO_KEY, JSON.stringify(sessions));

  import('./SyncService')
    .then(({ pushCardio }) => pushCardio(record))
    .catch(() => {});

  return record;
}

/**
 * Supprime une séance cardio.
 * @param {number} id
 * @returns {boolean}
 */
export function deleteCardioSession(id) {
  const sessions = getCardioSessions();
  const updated = sessions.filter((s) => s.id !== id);
  if (updated.length === sessions.length) return false;

  localStorage.setItem(CARDIO_KEY, JSON.stringify(updated));

  import('./SyncService')
    .then(({ deleteRemoteCardio }) => deleteRemoteCardio(id))
    .catch(() => {});

  return true;
}

/**
 * Séances d'une date donnée (YYYY-MM-DD local).
 */
export function getCardioForDate(date) {
  const target = new Date(date).toISOString().split('T')[0];
  return getCardioSessions().filter(
    (s) => new Date(s.date).toISOString().split('T')[0] === target
  );
}

/**
 * Statistiques cardio agrégées.
 * @returns {Object} { totalSessions, totalCalories, totalDistance, totalDuration, byType }
 */
export function getCardioStats() {
  const sessions = getCardioSessions();
  const base = { totalSessions: 0, totalCalories: 0, totalDistance: 0, totalDuration: 0,
    byType: { walk: { count: 0, calories: 0 }, bike: { count: 0, calories: 0 } } };

  return sessions.reduce((acc, s) => {
    acc.totalSessions += 1;
    acc.totalCalories += s.calories || 0;
    acc.totalDistance += s.distance || 0;
    acc.totalDuration += s.duration || 0;
    if (acc.byType[s.type]) {
      acc.byType[s.type].count += 1;
      acc.byType[s.type].calories += s.calories || 0;
    }
    return acc;
  }, base);
}
