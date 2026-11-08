/**
 * Service de synchronisation offline-first avec Firebase (Firestore).
 * - localStorage reste la source de lecture instantanée (l'app marche hors-ligne).
 * - syncData()        : pousse les données locales vers Firestore (écriture idempotente).
 * - fetchSyncedData() : récupère les données distantes de l'utilisateur.
 * - applySyncedData() : fusionne les données distantes dans le localStorage.
 * - fullSync()        : pull + merge + push (à appeler à la connexion).
 *
 * Données de l'utilisateur sous users/{uid}/ : workouts, weighIns, cardio,
 * nutrition (un document par jour), foods (aliments personnalisés),
 * exercises (exercices personnels) et settings/driveSync (lien du dossier
 * Health Sync et clé API, pour les retrouver sur chaque appareil). Chaque document garde l'enregistrement
 * local entier en texte JSON (champ `json`) : Firestore refuse les tableaux
 * imbriqués et les valeurs undefined. Quelques champs lisibles (date, titre…)
 * l'accompagnent pour la console Firebase.
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
import { getWorkoutHistory, recalculateAllStats } from './WorkoutStorage';
import { getWeightEntries } from './WeightStorage';
import { getUserExercises } from './UserExerciseStorage';
import { getCardioSessions } from './CardioStorage';

const WORKOUT_HISTORY_KEY = 'workout_history';
const WEIGHT_HISTORY_KEY = 'weight_history_data';
const USER_EXERCISES_KEY = 'user_custom_exercises';
const CARDIO_KEY = 'cardio_sessions_data';
const NUTRITION_KEY = 'pfl_nutrition_logs';
const CUSTOM_FOODS_KEY = 'pfl_custom_foods';
// Réglages de la synchro Health Sync / Google Drive (GoogleDriveImport.js).
const DRIVE_SETTINGS_KEY = 'pfl_drive_sync';

// Une écriture groupée Firestore accepte 500 opérations au plus.
const BATCH_SIZE = 400;

const getNutritionLogs = () => {
  try {
    return JSON.parse(localStorage.getItem(NUTRITION_KEY) || '{}');
  } catch {
    return {};
  }
};

/** Lien du dossier et clé API enregistrés sur cet appareil (sans la date de synchro). */
const getDriveSettings = () => {
  try {
    const { folderUrl = '', apiKey = '' } = JSON.parse(localStorage.getItem(DRIVE_SETTINGS_KEY) || '{}');
    return folderUrl || apiKey ? { folderUrl, apiKey } : null;
  } catch {
    return null;
  }
};

const getCustomFoods = () => {
  try {
    return JSON.parse(localStorage.getItem(CUSTOM_FOODS_KEY) || '[]');
  } catch {
    return [];
  }
};

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

// --- Mapping local <-> distant -----------------------------------------------

const hasId = (item) => item && item.id !== undefined && item.id !== null && item.id !== '';

const workoutDoc = (w) => toDoc(w, { date: w.date || null, title: w.title || null, calories: w.calories ?? null });
const weighDoc = (e) => toDoc(e, { date: e.date || null, weight: e.weight ?? null });
const cardioDoc = (s) => toDoc(s, { date: s.date || null, type: s.type || null, duration: s.duration ?? null });
const nutritionDoc = (day, data) => toDoc(
  { ...data, meals: data?.meals ?? null, calorieGoal: data?.calorieGoal ?? 2000 },
  { day, calorieGoal: data?.calorieGoal ?? 2000 }
);

const normalizeFoodName = (value) => String(value || '').trim().toLowerCase();
const foodKey = (food) => normalizeFoodName(food?.name || 'Aliment personnalisé');

const foodDoc = (food) => {
  const { remoteId, ...rest } = food || {};
  return toDoc(
    { ...rest, name: food?.name || 'Aliment personnalisé' },
    { name: food?.name || 'Aliment personnalisé', createdAt: food?.createdAt || new Date().toISOString() }
  );
};

const docToCustomFood = ({ id, record, data }) => ({
  remoteId: id,
  name: record?.name ?? data?.name,
  calories: Number(record?.calories ?? 0),
  protein: Number(record?.protein ?? 0),
  carbs: Number(record?.carbs ?? 0),
  fat: Number(record?.fat ?? 0),
  category: 'custom',
  unit: record?.unit || '100g',
});

const exerciseDoc = (ex) => toDoc(ex, { name: ex.name });

// Fusion par id (les entrées locales priment en cas de conflit d'id identique)
const mergeById = (local, remote) => {
  const map = new Map();
  remote.forEach((item) => map.set(String(item.id), item));
  local.forEach((item) => map.set(String(item.id), item));
  return Array.from(map.values());
};

// --- Push --------------------------------------------------------------------

/**
 * Pousse toutes les données locales vers Firestore.
 */
export const syncData = async () => {
  try {
    const user = await requireUser();
    if (!user) return notReady();
    const { uid } = user;

    const writes = [
      ...getWorkoutHistory().filter(hasId).map((w) => [userDoc(uid, 'workouts', w.id), workoutDoc(w)]),
      ...getWeightEntries().filter(hasId).map((e) => [userDoc(uid, 'weighIns', e.id), weighDoc(e)]),
      ...getCardioSessions().filter(hasId).map((s) => [userDoc(uid, 'cardio', s.id), cardioDoc(s)]),
      // Journal alimentaire (un document par jour)
      ...Object.entries(getNutritionLogs()).map(([day, data]) => [userDoc(uid, 'nutrition', day), nutritionDoc(day, data)]),
      // Aliments personnalisés : un document par nom
      ...getCustomFoods().map((food) => [userDoc(uid, 'foods', foodKey(food)), foodDoc(food)]),
      // Exercices personnels : un document par nom
      ...getUserExercises().filter((ex) => ex?.name).map((ex) => [userDoc(uid, 'exercises', ex.name), exerciseDoc(ex)]),
      // Réglages de la synchro Health Sync / Drive
      ...(getDriveSettings() ? [[userDoc(uid, 'settings', 'driveSync'), toDoc(getDriveSettings())]] : []),
    ];

    await commitInChunks(writes);

    return {
      success: true,
      message: 'Données synchronisées avec succès',
      syncedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Erreur lors de la synchronisation des données:', error);
    return { success: false, error: error.message || 'Erreur lors de la synchronisation' };
  }
};

// --- Push d'un seul enregistrement (offline-first, fire-and-forget) ----------

/** Écrit un document de l'utilisateur. Silencieux si non connecté/hors-ligne. */
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

/** Supprime un document de l'utilisateur. Silencieux si non connecté/hors-ligne. */
const deleteOne = async (label, name, id) => {
  try {
    const user = await requireUser();
    if (!user) return;
    await deleteDoc(userDoc(user.uid, name, id));
  } catch (error) {
    console.warn(`[sync] ${label} différé:`, error?.message);
  }
};

/**
 * Pousse une seule séance vers Firestore. Silencieux si non connecté/hors-ligne.
 */
export const pushWorkout = async (workout) => {
  if (!hasId(workout)) return;
  await pushOne('pushWorkout', 'workouts', workout.id, workoutDoc(workout));
};

/**
 * Pousse une seule pesée vers Firestore.
 */
export const pushWeighIn = async (entry) => {
  if (!hasId(entry)) return;
  await pushOne('pushWeighIn', 'weighIns', entry.id, weighDoc(entry));
};

export const deleteRemoteWorkout = (clientId) => deleteOne('deleteRemoteWorkout', 'workouts', clientId);

export const deleteRemoteWeighIn = (clientId) => deleteOne('deleteRemoteWeighIn', 'weighIns', clientId);

export const pushCardio = async (session) => {
  if (!hasId(session)) return;
  await pushOne('pushCardio', 'cardio', session.id, cardioDoc(session));
};

export const deleteRemoteCardio = (clientId) => deleteOne('deleteRemoteCardio', 'cardio', clientId);

/**
 * Pousse le journal alimentaire d'un jour (dateStr YYYY-MM-DD) vers Firestore.
 */
export const pushNutritionDay = async (day, data) => {
  await pushOne('pushNutritionDay', 'nutrition', day, nutritionDoc(day, data));
};

/**
 * Pousse un aliment personnalisé.
 * Retourne { id } (identifiant distant) si l'écriture a réussi.
 */
export const pushCustomFoodEntry = async (food) => {
  const key = foodKey(food);
  const ok = await pushOne('pushCustomFoodEntry', 'foods', key, foodDoc(food));
  return ok ? { id: docId(key) } : null;
};

/**
 * Supprime un aliment personnalisé distant (retrouvé par son nom).
 */
export const deleteRemoteCustomFoodEntry = async ({ remoteId, name }) => {
  if (name) {
    await deleteOne('deleteRemoteCustomFoodEntry', 'foods', normalizeFoodName(name));
  } else if (remoteId) {
    await deleteOne('deleteRemoteCustomFoodEntry', 'foods', decodeURIComponent(remoteId));
  }
};

/**
 * Récupère les aliments personnalisés de l'utilisateur (plus récents d'abord).
 */
export const fetchCustomFoodEntries = async () => {
  try {
    const user = await requireUser();
    if (!user) return [];
    const docs = await readCollection(user.uid, 'foods');
    return docs
      .sort((a, b) => String(b.data?.createdAt || '').localeCompare(String(a.data?.createdAt || '')))
      .map(docToCustomFood);
  } catch (error) {
    console.warn('[sync] fetchCustomFoodEntries différé:', error?.message);
    return [];
  }
};

/**
 * Pousse un exercice personnel vers Firestore (un document par nom).
 */
export const pushUserExercise = async (exercise) => {
  if (!exercise?.name) return;
  await pushOne('pushUserExercise', 'exercises', exercise.name, exerciseDoc(exercise));
};

export const deleteRemoteUserExercise = (name) => deleteOne('deleteRemoteUserExercise', 'exercises', name);

/**
 * Enregistre dans le compte le lien du dossier Health Sync et la clé API :
 * ils reviennent à la connexion sur un autre appareil ou navigateur.
 */
export const pushDriveSettings = async (settings) => {
  await pushOne('pushDriveSettings', 'settings', 'driveSync', toDoc({
    folderUrl: settings?.folderUrl || '',
    apiKey: settings?.apiKey || '',
  }));
};

// --- Pull --------------------------------------------------------------------

const records = (docs) => docs.map((d) => d.record).filter(hasId);

/**
 * Récupère les données distantes de l'utilisateur connecté.
 */
export const fetchSyncedData = async () => {
  try {
    const user = await requireUser();
    if (!user) return notReady();

    const [workouts, weighIns, cardio, nutrition, foods, settings] = await Promise.all([
      readCollection(user.uid, 'workouts'),
      readCollection(user.uid, 'weighIns'),
      readCollection(user.uid, 'cardio'),
      readCollection(user.uid, 'nutrition'),
      readCollection(user.uid, 'foods'),
      readCollection(user.uid, 'settings'),
    ]);

    // nutrition : reconstruit l'objet { [day]: { meals, calorieGoal } }
    const nutritionLogs = {};
    nutrition.forEach(({ record, data }) => {
      if (!data?.day || !record) return;
      nutritionLogs[data.day] = { ...record, calorieGoal: record.calorieGoal ?? 2000 };
    });

    return {
      success: true,
      data: {
        workoutHistory: records(workouts).sort((a, b) => new Date(b.date) - new Date(a.date)),
        weightEntries: records(weighIns).sort((a, b) => new Date(a.date) - new Date(b.date)),
        cardioSessions: records(cardio).sort((a, b) => new Date(b.date) - new Date(a.date)),
        nutritionLogs,
        customFoods: foods
          .sort((a, b) => String(b.data?.createdAt || '').localeCompare(String(a.data?.createdAt || '')))
          .map(docToCustomFood),
        driveSettings: settings.find((d) => d.id === 'driveSync')?.record || null,
      },
      syncedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des données synchronisées:', error);
    return { success: false, error: error.message || 'Erreur lors de la récupération des données' };
  }
};

// --- Merge into local --------------------------------------------------------

/**
 * Fusionne les données distantes dans le localStorage (union par id).
 */
export const applySyncedData = (syncedData) => {
  try {
    if (!syncedData) return false;

    if (Array.isArray(syncedData.workoutHistory)) {
      const merged = mergeById(getWorkoutHistory(), syncedData.workoutHistory)
        .sort((a, b) => new Date(b.date) - new Date(a.date));
      localStorage.setItem(WORKOUT_HISTORY_KEY, JSON.stringify(merged));
      // Les totaux d'Historique (séances, calories, durée) suivent la fusion.
      recalculateAllStats();
    }

    if (Array.isArray(syncedData.weightEntries)) {
      const merged = mergeById(getWeightEntries(), syncedData.weightEntries)
        .sort((a, b) => new Date(a.date) - new Date(b.date));
      localStorage.setItem(WEIGHT_HISTORY_KEY, JSON.stringify(merged));
    }

    if (Array.isArray(syncedData.cardioSessions)) {
      const merged = mergeById(getCardioSessions(), syncedData.cardioSessions)
        .sort((a, b) => new Date(b.date) - new Date(a.date));
      localStorage.setItem(CARDIO_KEY, JSON.stringify(merged));
    }

    // nutrition : fusion par jour (le local prime sur conflit de même jour)
    if (syncedData.nutritionLogs && typeof syncedData.nutritionLogs === 'object') {
      const merged = { ...syncedData.nutritionLogs, ...getNutritionLogs() };
      localStorage.setItem(NUTRITION_KEY, JSON.stringify(merged));
    }

    if (Array.isArray(syncedData.customFoods)) {
      const localCustoms = getCustomFoods();
      const map = new Map();

      syncedData.customFoods.forEach((food) => {
        map.set(normalizeFoodName(food.name), food);
      });

      localCustoms.forEach((food) => {
        map.set(normalizeFoodName(food.name), food);
      });

      localStorage.setItem(CUSTOM_FOODS_KEY, JSON.stringify(Array.from(map.values())));
    }

    // Réglages Health Sync / Drive : ce qui est réglé sur cet appareil prime,
    // le compte complète ce qui manque (nouvel appareil, nouveau navigateur).
    if (syncedData.driveSettings && typeof syncedData.driveSettings === 'object') {
      let local = {};
      try { local = JSON.parse(localStorage.getItem(DRIVE_SETTINGS_KEY) || '{}'); } catch { /* vide */ }
      localStorage.setItem(DRIVE_SETTINGS_KEY, JSON.stringify({
        ...local,
        folderUrl: local.folderUrl || syncedData.driveSettings.folderUrl || '',
        apiKey: local.apiKey || syncedData.driveSettings.apiKey || '',
      }));
    }

    return true;
  } catch (error) {
    console.error('Erreur lors de l\'application des données synchronisées:', error);
    return false;
  }
};

// --- Full sync ---------------------------------------------------------------

/**
 * Synchronisation complète : récupère le distant, fusionne en local, puis pousse.
 * À appeler à la connexion.
 */
export const fullSync = async () => {
  const user = await requireUser();
  if (!user) return notReady();

  const pulled = await fetchSyncedData();
  if (pulled.success && pulled.data) {
    applySyncedData(pulled.data);
  }

  const pushed = await syncData();
  return pushed;
};

export { USER_EXERCISES_KEY };
