/**
 * Catalogue d'exercices : combine le catalogue partagé (Supabase, owner_id null)
 * et les exercices personnels de l'utilisateur, avec repli local sur data.js.
 */
import { supabase, isSupabaseConfigured } from './supabase';
import { days as localPlan } from '../data';
import { getUserExercises } from './UserExerciseStorage';

/**
 * Aplatit data.js en liste d'exercices (repli hors-ligne / Supabase non configuré).
 */
const flattenLocalPlan = () =>
  localPlan
    .filter((day) => Array.isArray(day.exercises))
    .flatMap((day) =>
      day.exercises.map((ex) => ({
        name: ex.name,
        sets: ex.sets,
        equip: ex.equip,
        description: ex.desc,
        calories_per_set: ex.caloriesPerSet,
        total_sets: ex.totalSets,
        nb_rep: ex.nbRep,
        muscle_groups: ex.googleFitActivity?.muscleGroups || [],
        day_title: day.title,
        owner_id: null,
        source: 'local',
      }))
    );

/**
 * Récupère tous les exercices visibles (catalogue partagé + perso).
 * Repli sur data.js si Supabase indisponible.
 */
export const getAllExercises = async () => {
  if (!isSupabaseConfigured) return flattenLocalPlan();

  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .order('day_title', { ascending: true })
    .order('sort_order', { ascending: true });

  if (error || !data || data.length === 0) {
    if (error) console.warn('[catalog] lecture Supabase échouée, repli local:', error.message);
    return flattenLocalPlan();
  }
  return data;
};

/**
 * Catalogue partagé uniquement (owner_id null).
 */
export const getSharedCatalog = async () => {
  const all = await getAllExercises();
  return all.filter((ex) => !ex.owner_id);
};

/**
 * Exercices personnels de l'utilisateur connecté (repli sur localStorage).
 */
export const getMyExercises = async () => {
  if (!isSupabaseConfigured) return getUserExercises();

  const { data: { user } = {} } = await supabase.auth.getUser();
  if (!user) return getUserExercises();

  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .eq('owner_id', user.id);

  if (error) {
    console.warn('[catalog] lecture exercices perso échouée:', error.message);
    return getUserExercises();
  }
  return data || [];
};
