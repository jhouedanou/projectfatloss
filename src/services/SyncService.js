/**
 * Service de synchronisation offline-first avec Supabase.
 * - localStorage reste la source de lecture instantanée (l'app marche hors-ligne).
 * - syncData()        : pousse les données locales vers Supabase (upsert idempotent).
 * - fetchSyncedData() : récupère les données distantes de l'utilisateur.
 * - applySyncedData() : fusionne les données distantes dans le localStorage.
 * - fullSync()        : pull + merge + push (à appeler à la connexion).
 */
import { supabase, isSupabaseConfigured } from './supabase';
import { getCurrentUser } from './AuthService';
import { getWorkoutHistory } from './WorkoutStorage';
import { getWeightEntries } from './WeightStorage';
import { getUserExercises } from './UserExerciseStorage';
import { getCardioSessions } from './CardioStorage';

const WORKOUT_HISTORY_KEY = 'workout_history';
const WEIGHT_HISTORY_KEY = 'weight_history_data';
const USER_EXERCISES_KEY = 'user_custom_exercises';
const CARDIO_KEY = 'cardio_sessions_data';

const notReady = () => ({ success: false, error: 'Synchronisation indisponible (non connecté ou Supabase non configuré)' });

const requireUser = async () => {
  if (!isSupabaseConfigured) return null;
  return getCurrentUser();
};

// --- Mapping local <-> remote -------------------------------------------------

const workoutToRow = (w, userId) => ({
  user_id: userId,
  client_id: typeof w.id === 'number' ? w.id : Number(w.id) || null,
  title: w.title || null,
  date: w.date || new Date().toISOString(),
  display_date: w.displayDate || null,
  duration: w.duration ?? null,
  calories: w.calories ?? null,
  weight_lifted: w.weightLifted ?? null,
  exercises: w.exercises ?? null,
});

const rowToWorkout = (r) => ({
  id: r.client_id ?? r.id,
  title: r.title,
  date: r.date,
  displayDate: r.display_date,
  duration: r.duration,
  calories: r.calories,
  weightLifted: r.weight_lifted,
  exercises: r.exercises,
});

const weighToRow = (e, userId) => ({
  user_id: userId,
  client_id: typeof e.id === 'number' ? e.id : Number(e.id) || null,
  weight: e.weight,
  date: e.date || new Date().toISOString(),
  notes: e.notes || null,
});

const rowToWeigh = (r) => ({
  id: r.client_id ?? r.id,
  weight: Number(r.weight),
  date: r.date,
  notes: r.notes || '',
});

const cardioToRow = (s, userId) => ({
  user_id: userId,
  client_id: typeof s.id === 'number' ? s.id : Number(s.id) || null,
  type: s.type,
  date: s.date || new Date().toISOString(),
  duration: s.duration ?? null,
  distance: s.distance ?? null,
  calories: s.calories ?? null,
  notes: s.notes || null,
});

const rowToCardio = (r) => ({
  id: r.client_id ?? r.id,
  type: r.type,
  date: r.date,
  duration: r.duration,
  distance: r.distance != null ? Number(r.distance) : null,
  calories: r.calories != null ? Number(r.calories) : null,
  notes: r.notes || '',
});

// Fusion par id (les entrées locales priment en cas de conflit d'id identique)
const mergeById = (local, remote) => {
  const map = new Map();
  remote.forEach((item) => map.set(String(item.id), item));
  local.forEach((item) => map.set(String(item.id), item));
  return Array.from(map.values());
};

// --- Push --------------------------------------------------------------------

/**
 * Pousse toutes les données locales vers Supabase.
 */
export const syncData = async () => {
  try {
    const user = await requireUser();
    if (!user) return notReady();

    const workouts = getWorkoutHistory();
    const weighIns = getWeightEntries();
    const customExercises = getUserExercises();
    const cardioSessions = getCardioSessions();

    // Séances
    if (workouts.length) {
      const { error } = await supabase
        .from('workouts')
        .upsert(workouts.map((w) => workoutToRow(w, user.id)), { onConflict: 'user_id,client_id' });
      if (error) throw error;
    }

    // Pesées
    if (weighIns.length) {
      const { error } = await supabase
        .from('weigh_ins')
        .upsert(weighIns.map((e) => weighToRow(e, user.id)), { onConflict: 'user_id,client_id' });
      if (error) throw error;
    }

    // Séances cardio
    if (cardioSessions.length) {
      const { error } = await supabase
        .from('cardio_sessions')
        .upsert(cardioSessions.map((s) => cardioToRow(s, user.id)), { onConflict: 'user_id,client_id' });
      if (error) throw error;
    }

    // Exercices personnels : insère ceux qui n'existent pas encore (match par nom)
    if (customExercises.length) {
      const { data: existing, error: selErr } = await supabase
        .from('exercises')
        .select('name')
        .eq('owner_id', user.id);
      if (selErr) throw selErr;

      const known = new Set((existing || []).map((r) => r.name));
      const toInsert = customExercises
        .filter((ex) => !known.has(ex.name))
        .map((ex) => ({
          owner_id: user.id,
          name: ex.name,
          description: ex.description || null,
          equip: ex.equipment || null,
          category: ex.category || null,
          muscle_group: ex.muscleGroup || null,
          is_timer: !!ex.isTimer,
          default_duration: ex.defaultDuration ?? null,
          total_sets: ex.defaultSets ?? null,
          nb_rep: ex.defaultReps ?? null,
        }));

      if (toInsert.length) {
        const { error } = await supabase.from('exercises').insert(toInsert);
        if (error) throw error;
      }
    }

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

/**
 * Pousse une seule séance vers Supabase. Silencieux si non connecté/hors-ligne.
 */
export const pushWorkout = async (workout) => {
  try {
    const user = await requireUser();
    if (!user) return;
    await supabase
      .from('workouts')
      .upsert(workoutToRow(workout, user.id), { onConflict: 'user_id,client_id' });
  } catch (error) {
    console.warn('[sync] pushWorkout différé:', error?.message);
  }
};

/**
 * Pousse une seule pesée vers Supabase.
 */
export const pushWeighIn = async (entry) => {
  try {
    const user = await requireUser();
    if (!user) return;
    await supabase
      .from('weigh_ins')
      .upsert(weighToRow(entry, user.id), { onConflict: 'user_id,client_id' });
  } catch (error) {
    console.warn('[sync] pushWeighIn différé:', error?.message);
  }
};

export const deleteRemoteWorkout = async (clientId) => {
  try {
    const user = await requireUser();
    if (!user) return;
    await supabase.from('workouts').delete().eq('user_id', user.id).eq('client_id', clientId);
  } catch (error) {
    console.warn('[sync] deleteRemoteWorkout différé:', error?.message);
  }
};

export const deleteRemoteWeighIn = async (clientId) => {
  try {
    const user = await requireUser();
    if (!user) return;
    await supabase.from('weigh_ins').delete().eq('user_id', user.id).eq('client_id', clientId);
  } catch (error) {
    console.warn('[sync] deleteRemoteWeighIn différé:', error?.message);
  }
};

export const pushCardio = async (session) => {
  try {
    const user = await requireUser();
    if (!user) return;
    await supabase
      .from('cardio_sessions')
      .upsert(cardioToRow(session, user.id), { onConflict: 'user_id,client_id' });
  } catch (error) {
    console.warn('[sync] pushCardio différé:', error?.message);
  }
};

export const deleteRemoteCardio = async (clientId) => {
  try {
    const user = await requireUser();
    if (!user) return;
    await supabase.from('cardio_sessions').delete().eq('user_id', user.id).eq('client_id', clientId);
  } catch (error) {
    console.warn('[sync] deleteRemoteCardio différé:', error?.message);
  }
};

const customExerciseToRow = (ex, userId) => ({
  owner_id: userId,
  name: ex.name,
  description: ex.description || null,
  equip: ex.equipment || null,
  category: ex.category || null,
  muscle_group: ex.muscleGroup || null,
  is_timer: !!ex.isTimer,
  default_duration: ex.defaultDuration ?? null,
  total_sets: ex.defaultSets ?? null,
  nb_rep: ex.defaultReps ?? null,
});

/**
 * Pousse un exercice personnel vers Supabase (insère s'il n'existe pas, sinon met à jour par nom).
 */
export const pushUserExercise = async (exercise) => {
  try {
    const user = await requireUser();
    if (!user) return;
    const { data: existing } = await supabase
      .from('exercises')
      .select('id')
      .eq('owner_id', user.id)
      .eq('name', exercise.name)
      .maybeSingle();

    if (existing) {
      await supabase.from('exercises').update(customExerciseToRow(exercise, user.id)).eq('id', existing.id);
    } else {
      await supabase.from('exercises').insert(customExerciseToRow(exercise, user.id));
    }
  } catch (error) {
    console.warn('[sync] pushUserExercise différé:', error?.message);
  }
};

export const deleteRemoteUserExercise = async (name) => {
  try {
    const user = await requireUser();
    if (!user) return;
    await supabase.from('exercises').delete().eq('owner_id', user.id).eq('name', name);
  } catch (error) {
    console.warn('[sync] deleteRemoteUserExercise différé:', error?.message);
  }
};

// --- Pull --------------------------------------------------------------------

/**
 * Récupère les données distantes de l'utilisateur connecté.
 */
export const fetchSyncedData = async () => {
  try {
    const user = await requireUser();
    if (!user) return notReady();

    const [workoutsRes, weighRes, cardioRes] = await Promise.all([
      supabase.from('workouts').select('*').eq('user_id', user.id).order('date', { ascending: false }),
      supabase.from('weigh_ins').select('*').eq('user_id', user.id).order('date', { ascending: true }),
      supabase.from('cardio_sessions').select('*').eq('user_id', user.id).order('date', { ascending: false }),
    ]);

    if (workoutsRes.error) throw workoutsRes.error;
    if (weighRes.error) throw weighRes.error;
    if (cardioRes.error) throw cardioRes.error;

    return {
      success: true,
      data: {
        workoutHistory: (workoutsRes.data || []).map(rowToWorkout),
        weightEntries: (weighRes.data || []).map(rowToWeigh),
        cardioSessions: (cardioRes.data || []).map(rowToCardio),
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
