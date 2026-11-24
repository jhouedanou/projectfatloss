/**
 * Synchronisation avec le compte (Firebase / Firestore), hors-ligne d'abord.
 * Le localStorage reste la source lue par l'écran ; le compte sert à retrouver
 * les mêmes données sur un autre appareil (le téléphone lit Health Connect, le
 * site reçoit ses données par ici).
 *
 * Sous users/{uid}/ :
 *   - weighIns          : une pesée par document (avec la composition) ;
 *   - fitDays           : un document par mois, totaux par jour ;
 *   - fitSessions       : un document par mois, séances importées ;
 *   - settings/goal     : poids visé ;
 *   - workouts, cardio  : séances de l'ancienne application, lues seulement.
 * Chaque document garde son contenu en texte JSON (champ `json`) : Firestore
 * refuse les tableaux imbriqués et les valeurs undefined.
 */
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
  writeBatch,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { getCurrentUser } from './AuthService';
import { getWeightEntries } from './WeightStorage';
import {
  getGoalKg,
  getStoredFitDays,
  getStoredFitSessions,
  mergeFitDays,
  mergeFitSessions,
  setGoalKg,
} from './FitStore';
import { dayKey } from './FitMetrics';

const WEIGHT_HISTORY_KEY = 'weight_history_data';
// Anciennes séances : rangées telles quelles, lues par FitStore.
const LEGACY_WORKOUTS_KEY = 'workout_history';
const LEGACY_CARDIO_KEY = 'cardio_sessions_data';

// Une écriture groupée Firestore accepte 500 opérations au plus.
const BATCH_SIZE = 400;

const notReady = () => ({ success: false, error: 'Synchronisation indisponible (non connecté ou Firebase non configuré)' });

const requireUser = async () => {
  if (!isFirebaseConfigured) return null;
  return getCurrentUser();
};

// --- Documents Firestore ------------------------------------------------------

/** Identifiant de document sûr (ni « / », ni « . » seul). */
const docId = (value) => encodeURIComponent(String(value)).replace(/\./g, '%2E');

const userDoc = (uid, name, id) => doc(db, 'users', uid, name, docId(id));
const userCollection = (uid, name) => collection(db, 'users', uid, name);

/** Retire les undefined (refusés par Firestore). */
const clean = (value) => JSON.parse(JSON.stringify(value ?? null));

/** Document : l'enregistrement entier en JSON + quelques champs lisibles. */
const toDoc = (record, summary = {}) => clean({
  ...summary,
  json: JSON.stringify(record ?? null),
  updatedAt: new Date().toISOString(),
});

const fromDoc = (snapshot) => {
  try {
    return JSON.parse(snapshot.data().json);
  } catch {
    return null;
  }
};

const readCollection = async (uid, name) => {
  const snapshot = await getDocs(userCollection(uid, name));
  return snapshot.docs.map((d) => ({ id: d.id, record: fromDoc(d), data: d.data() }));
};

/** Écrit des paires [référence, données] par paquets. */
const commitInChunks = async (writes) => {
  for (let i = 0; i < writes.length; i += BATCH_SIZE) {
    const batch = writeBatch(db);
    writes.slice(i, i + BATCH_SIZE).forEach(([ref, data]) => batch.set(ref, data));
    await batch.commit();
  }
};

const hasId = (item) => item && item.id !== undefined && item.id !== null && item.id !== '';

const weighDoc = (e) => toDoc(e, { date: e.date || null, weight: e.weight ?? null });

/** Fusion par id (les entrées locales priment en cas d'id identique). */
const mergeById = (local, remote) => {
  const map = new Map();
  remote.forEach((item) => map.set(String(item.id), item));
  local.forEach((item) => map.set(String(item.id), item));
  return Array.from(map.values());
};

/** Range des jours { 'AAAA-MM-JJ': … } par mois 'AAAA-MM'. */
const daysByMonth = (days) => {
  const months = {};
  Object.entries(days).forEach(([day, values]) => {
    const month = day.slice(0, 7);
    months[month] = { ...months[month], [day]: values };
  });
  return months;
};

/** Range des séances par mois de début. */
const sessionsByMonth = (sessions) => {
  const months = {};
  sessions.forEach((session) => {
    const month = dayKey(new Date(session.startMs)).slice(0, 7);
    (months[month] = months[month] || []).push(session);
  });
  return months;
};

// --- Envoi --------------------------------------------------------------------

/** Envoie toutes les données locales au compte. */
export const syncData = async () => {
  try {
    const user = await requireUser();
    if (!user) return notReady();
    const { uid } = user;
    const goalKg = getGoalKg();

    const writes = [
      ...getWeightEntries().filter(hasId).map((e) => [userDoc(uid, 'weighIns', e.id), weighDoc(e)]),
      ...Object.entries(daysByMonth(getStoredFitDays()))
        .map(([month, days]) => [userDoc(uid, 'fitDays', month), toDoc(days, { month })]),
      ...Object.entries(sessionsByMonth(getStoredFitSessions()))
        .map(([month, sessions]) => [userDoc(uid, 'fitSessions', month), toDoc(sessions, { month, count: sessions.length })]),
      ...(goalKg ? [[userDoc(uid, 'settings', 'goal'), toDoc({ goalKg })]] : []),
    ];

    await commitInChunks(writes);

    return { success: true, syncedAt: new Date().toISOString() };
  } catch (error) {
    console.error('Erreur lors de la synchronisation des données:', error);
    return { success: false, error: error.message || 'Erreur lors de la synchronisation' };
  }
};

/** Écrit un document de l'utilisateur. Silencieux si non connecté ou hors-ligne. */
const pushOne = async (label, name, id, data) => {
  try {
    const user = await requireUser();
    if (!user) return false;
    await setDoc(userDoc(user.uid, name, id), data);
    return true;
  } catch (error) {
    console.warn(`[sync] ${label} différé:`, error?.message);
    return false;
  }
};

/** Envoie une seule pesée. */
export const pushWeighIn = async (entry) => {
  if (!hasId(entry)) return;
  await pushOne('pushWeighIn', 'weighIns', entry.id, weighDoc(entry));
};

/** Supprime une pesée du compte. */
export const deleteRemoteWeighIn = async (clientId) => {
  try {
    const user = await requireUser();
    if (!user) return;
    await deleteDoc(userDoc(user.uid, 'weighIns', clientId));
  } catch (error) {
    console.warn('[sync] deleteRemoteWeighIn différé:', error?.message);
  }
};

/** Envoie le poids visé. */
export const pushGoal = async (goalKg) => {
  await pushOne('pushGoal', 'settings', 'goal', toDoc({ goalKg: goalKg || null }));
};

// --- Réception ----------------------------------------------------------------

const records = (docs) => docs.map((d) => d.record).filter(hasId);

/** Lit les données du compte et les fusionne dans le localStorage. */
export const pullData = async () => {
  try {
    const user = await requireUser();
    if (!user) return notReady();

    const [weighIns, fitDays, fitSessions, settings, workouts, cardio] = await Promise.all([
      readCollection(user.uid, 'weighIns'),
      readCollection(user.uid, 'fitDays'),
      readCollection(user.uid, 'fitSessions'),
      readCollection(user.uid, 'settings'),
      readCollection(user.uid, 'workouts'),
      readCollection(user.uid, 'cardio'),
    ]);

    const weights = mergeById(getWeightEntries(), records(weighIns))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    localStorage.setItem(WEIGHT_HISTORY_KEY, JSON.stringify(weights));

    fitDays.forEach(({ record }) => {
      if (record && typeof record === 'object') mergeFitDays(record);
    });
    fitSessions.forEach(({ record }) => {
      if (Array.isArray(record)) mergeFitSessions(record);
    });

    // Poids visé : celui de cet appareil prime, le compte complète.
    const remoteGoal = settings.find((d) => d.id === 'goal')?.record?.goalKg;
    if (!getGoalKg() && remoteGoal) setGoalKg(remoteGoal);

    // Anciennes séances : union par id avec celles de cet appareil.
    const mergeLegacy = (key, remote) => {
      let local = [];
      try { local = JSON.parse(localStorage.getItem(key)) || []; } catch { /* vide */ }
      const merged = mergeById(local, records(remote)).sort((a, b) => new Date(b.date) - new Date(a.date));
      localStorage.setItem(key, JSON.stringify(merged));
    };
    mergeLegacy(LEGACY_WORKOUTS_KEY, workouts);
    mergeLegacy(LEGACY_CARDIO_KEY, cardio);

    return { success: true, syncedAt: new Date().toISOString() };
  } catch (error) {
    console.error('Erreur lors de la récupération des données synchronisées:', error);
    return { success: false, error: error.message || 'Erreur lors de la récupération des données' };
  }
};

/** Synchronisation complète : reçoit, fusionne, puis envoie. À la connexion. */
export const fullSync = async () => {
  const user = await requireUser();
  if (!user) return notReady();
  const pulled = await pullData();
  const pushed = await syncData();
  return pushed.success ? pulled : pushed;
};
