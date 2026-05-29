/**
 * Seed du catalogue d'exercices partagé (owner_id = null) depuis src/data.js.
 *
 * Usage : node scripts/seed-exercises.mjs
 * Requiert dans .env.local : SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
 * (service_role contourne RLS — à n'exécuter QUE localement, jamais dans le navigateur).
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

// Charge .env.local sans dépendance externe
function loadEnv() {
  const env = {};
  try {
    const raw = readFileSync(resolve(root, '.env.local'), 'utf8');
    for (const line of raw.split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m) env[m[1]] = m[2].trim();
    }
  } catch {
    /* ignore */
  }
  return env;
}

const env = loadEnv();
const url = env.SUPABASE_URL || process.env.SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('❌ SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant dans .env.local');
  process.exit(1);
}

const { days } = await import(resolve(root, 'src/data.js'));

const rows = days
  .filter((day) => Array.isArray(day.exercises))
  .flatMap((day, dayIdx) =>
    day.exercises.map((ex, i) => ({
      owner_id: null,
      name: ex.name,
      sets: ex.sets ?? null,
      equip: ex.equip ?? null,
      description: ex.desc ?? null,
      calories_per_set: ex.caloriesPerSet ?? null,
      total_sets: ex.totalSets ?? null,
      nb_rep: ex.nbRep ?? null,
      muscle_groups: ex.googleFitActivity?.muscleGroups ?? null,
      day_title: day.title ?? null,
      sort_order: dayIdx * 100 + i,
    }))
  );

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

console.log(`Seed de ${rows.length} exercices dans le catalogue partagé…`);

// Repart de zéro pour le catalogue global (n'efface PAS les exercices des users)
const { error: delErr } = await supabase.from('exercises').delete().is('owner_id', null);
if (delErr) {
  console.error('❌ Échec du nettoyage du catalogue:', delErr.message);
  process.exit(1);
}

const { error } = await supabase.from('exercises').insert(rows);
if (error) {
  console.error('❌ Échec du seed:', error.message);
  process.exit(1);
}

console.log('✅ Catalogue partagé initialisé.');
