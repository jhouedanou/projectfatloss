/**
 * Vérifie le contenu des tables Supabase (service_role, contourne RLS).
 * Usage : node scripts/check-data.mjs
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

function loadEnv() {
  const env = {};
  try {
    const raw = readFileSync(resolve(root, '.env.local'), 'utf8');
    for (const line of raw.split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m) env[m[1]] = m[2].trim();
    }
  } catch {}
  return env;
}

const env = loadEnv();
const url = env.SUPABASE_URL || process.env.SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('❌ SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY manquant');
  process.exit(1);
}

const sb = createClient(url, key, { auth: { persistSession: false } });

const tables = ['profiles', 'workouts', 'weigh_ins', 'cardio_sessions', 'exercises'];

for (const t of tables) {
  const { data, count, error } = await sb
    .from(t)
    .select('*', { count: 'exact' })
    .limit(5)
    .order('created_at', { ascending: false });

  if (error) {
    console.log(`\n❌ ${t}: ${error.message}`);
    continue;
  }

  console.log(`\n=== ${t} — ${count} ligne(s) ===`);
  for (const row of data) {
    if (t === 'workouts')
      console.log(`  • ${row.title} | ${row.date} | ${row.calories ?? '?'} kcal | user ${String(row.user_id).slice(0, 8)}`);
    else if (t === 'weigh_ins')
      console.log(`  • ${row.weight} kg | ${row.date} | user ${String(row.user_id).slice(0, 8)}`);
    else if (t === 'cardio_sessions')
      console.log(`  • ${row.type} | ${row.duration ?? '?'}min | ${row.calories ?? '?'}kcal | ${row.date}`);
    else if (t === 'exercises')
      console.log(`  • ${row.name} | owner ${row.owner_id ? String(row.owner_id).slice(0, 8) : 'GLOBAL'}`);
    else if (t === 'profiles')
      console.log(`  • ${row.username || row.display_name || '?'} | ${String(row.id).slice(0, 8)}`);
  }
}

// Exercices : répartition global vs perso
const { count: globalCount } = await sb.from('exercises').select('*', { count: 'exact', head: true }).is('owner_id', null);
const { count: userCount } = await sb.from('exercises').select('*', { count: 'exact', head: true }).not('owner_id', 'is', null);
console.log(`\n=== exercises split ===\n  global: ${globalCount} | perso (users): ${userCount}`);

console.log('\n✅ Terminé.');
