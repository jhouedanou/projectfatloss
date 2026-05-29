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
const NUTRITION_KEY = 'pfl_nutrition_logs';
const CUSTOM_FOODS_KEY = 'pfl_custom_foods';

const getNutritionLogs = () => {
  try {
    return JSON.parse(localStorage.getItem(NUTRITION_KEY) || '{}');
  } catch {
    return {};
  }
};

const getCustomFoods = () => {
  try {
    return JSON.parse(localStorage.getItem(CUSTOM_FOODS_KEY) || '[]');
  } catch {
    return [];
  }
};

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

const nutritionToRow = (day, data, userId) => ({
  user_id: userId,
  day,
  meals: data?.meals ?? null,
  calorie_goal: data?.calorieGoal ?? 2000,
  updated_at: new Date().toISOString(),
});

const customFoodToRow = (food, userId) => ({
  user_id: userId,
  entry_type: 'custom',
  name: food?.name || 'Aliment personnalisé',
  brand: food?.brand || null,
  quantity: null,
  unit: food?.unit || '100g',
  calories: food?.calories ?? 0,
  protein: food?.protein ?? 0,
  carbs: food?.carbs ?? 0,
  fat: food?.fat ?? 0,
  fiber: food?.fiber ?? null,
  sugar: food?.sugar ?? null,
  sodium: food?.sodium ?? null,
  meal_type: null,
  log_day: null,
  source_custom_id: null,
});

const rowToCustomFood = (r) => ({
  remoteId: r.id,
  name: r.name,
  calories: Number(r.calories ?? 0),
  protein: Number(r.protein ?? 0),
  carbs: Number(r.carbs ?? 0),
  fat: Number(r.fat ?? 0),
  category: 'custom',
  unit: r.unit || '100g',
});

const normalizeFoodName = (value) => String(value || '').trim().toLowerCase();

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
    const customFoods = getCustomFoods();

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

    // Journal alimentaire (1 ligne par jour)
    const nutritionLogs = getNutritionLogs();
    const nutritionRows = Object.entries(nutritionLogs).map(([day, data]) => nutritionToRow(day, data, user.id));
    if (nutritionRows.length) {
      const { error } = await supabase
        .from('nutrition_logs')
        .upsert(nutritionRows, { onConflict: 'user_id,day' });
      if (error) throw error;
    }

    // Aliments personnalisés : synchronisation par nom (insère ceux absents côté distant)
    if (customFoods.length) {
      const { data: existingCustoms, error: customSelErr } = await supabase
        .from('user_food_entries')
        .select('id,name')
        .eq('user_id', user.id)
        .eq('entry_type', 'custom');
      if (customSelErr) throw customSelErr;

      const knownNames = new Set((existingCustoms || []).map((r) => normalizeFoodName(r.name)));
      const toInsertCustoms = customFoods
        .filter((food) => !knownNames.has(normalizeFoodName(food.name)))
        .map((food) => customFoodToRow(food, user.id));

      if (toInsertCustoms.length) {
        const { error } = await supabase.from('user_food_entries').insert(toInsertCustoms);
        if (error) throw error;
      }
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

/**
 * Pousse le journal alimentaire d'un jour (dateStr YYYY-MM-DD) vers Supabase.
 */
export const pushNutritionDay = async (day, data) => {
  try {
    const user = await requireUser();
    if (!user) return;
    await supabase
      .from('nutrition_logs')
      .upsert(nutritionToRow(day, data, user.id), { onConflict: 'user_id,day' });
  } catch (error) {
    console.warn('[sync] pushNutritionDay différé:', error?.message);
  }
};

/**
 * Pousse un aliment personnalisé dans user_food_entries.
 * Retourne la ligne créée (incluant son id distant) si disponible.
 */
export const pushCustomFoodEntry = async (food) => {
  try {
    const user = await requireUser();
    if (!user) return null;

    const payload = customFoodToRow(food, user.id);
    const { data, error } = await supabase
      .from('user_food_entries')
      .insert(payload)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.warn('[sync] pushCustomFoodEntry différé:', error?.message);
    return null;
  }
};

/**
 * Enregistre un aliment ajouté à un repas.
 */
export const pushAddedFoodEntry = async ({ day, mealType, item, sourceCustomId = null }) => {
  try {
    const user = await requireUser();
    if (!user) return null;

    const payload = {
      user_id: user.id,
      entry_type: 'added',
      name: item?.name || 'Aliment',
      quantity: item?.quantity ?? null,
      unit: item?.unit || item?.unitLabel || 'g',
      calories: item?.calories ?? 0,
      protein: item?.protein ?? 0,
      carbs: item?.carbs ?? 0,
      fat: item?.fat ?? 0,
      meal_type: mealType,
      log_day: day,
      source_custom_id: sourceCustomId,
    };

    const { error } = await supabase.from('user_food_entries').insert(payload);
    if (error) throw error;
    return true;
  } catch (error) {
    console.warn('[sync] pushAddedFoodEntry différé:', error?.message);
    return false;
  }
};

/**
 * Supprime un aliment personnalisé distant.
 */
export const deleteRemoteCustomFoodEntry = async ({ remoteId, name }) => {
  try {
    const user = await requireUser();
    if (!user) return;

    if (remoteId) {
      await supabase
        .from('user_food_entries')
        .delete()
        .eq('user_id', user.id)
        .eq('entry_type', 'custom')
        .eq('id', remoteId);
      return;
    }

    await supabase
      .from('user_food_entries')
      .delete()
      .eq('user_id', user.id)
      .eq('entry_type', 'custom')
      .eq('name', name);
  } catch (error) {
    console.warn('[sync] deleteRemoteCustomFoodEntry différé:', error?.message);
  }
};

/**
 * Récupère les aliments personnalisés de l'utilisateur.
 */
export const fetchCustomFoodEntries = async () => {
  try {
    const user = await requireUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('user_food_entries')
      .select('*')
      .eq('user_id', user.id)
      .eq('entry_type', 'custom')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(rowToCustomFood);
  } catch (error) {
    console.warn('[sync] fetchCustomFoodEntries différé:', error?.message);
    return [];
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

    const [workoutsRes, weighRes, cardioRes, nutritionRes, customFoodsRes] = await Promise.all([
      supabase.from('workouts').select('*').eq('user_id', user.id).order('date', { ascending: false }),
      supabase.from('weigh_ins').select('*').eq('user_id', user.id).order('date', { ascending: true }),
      supabase.from('cardio_sessions').select('*').eq('user_id', user.id).order('date', { ascending: false }),
      supabase.from('nutrition_logs').select('*').eq('user_id', user.id),
      supabase.from('user_food_entries').select('*').eq('user_id', user.id).eq('entry_type', 'custom').order('created_at', { ascending: false }),
    ]);

    if (workoutsRes.error) throw workoutsRes.error;
    if (weighRes.error) throw weighRes.error;
    if (cardioRes.error) throw cardioRes.error;
    if (nutritionRes.error) throw nutritionRes.error;
    if (customFoodsRes.error) throw customFoodsRes.error;

    // nutrition : reconstruit l'objet { [day]: { meals, calorieGoal } }
    const nutritionLogs = {};
    (nutritionRes.data || []).forEach((r) => {
      nutritionLogs[r.day] = { meals: r.meals, calorieGoal: r.calorie_goal ?? 2000 };
    });

    return {
      success: true,
      data: {
        workoutHistory: (workoutsRes.data || []).map(rowToWorkout),
        weightEntries: (weighRes.data || []).map(rowToWeigh),
        cardioSessions: (cardioRes.data || []).map(rowToCardio),
        nutritionLogs,
        customFoods: (customFoodsRes.data || []).map(rowToCustomFood),
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
