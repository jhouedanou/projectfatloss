/**
 * Client Supabase partagé pour toute l'application.
 * Les variables sont injectées par Vite (préfixe VITE_ uniquement).
 * NE JAMAIS utiliser la service_role key côté navigateur.
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Permet à l'app de fonctionner en mode local si Supabase n'est pas configuré
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn(
    '[supabase] VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY manquant — ' +
    'mode local uniquement (pas de synchronisation cloud).'
  );
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true, // nécessaire pour le retour OAuth / magic link
      },
    })
  : null;

export default supabase;
