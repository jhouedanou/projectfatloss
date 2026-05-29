/**
 * Client Supabase partagé pour toute l'application.
 * Les variables sont injectées par Vite (préfixe VITE_ uniquement).
 * NE JAMAIS utiliser la service_role key côté navigateur.
 */
import { createClient } from '@supabase/supabase-js';

// Nettoie d'éventuels guillemets / espaces / retours ligne dans les secrets CI
const clean = (v) => String(v ?? '').trim().replace(/^["']|["']$/g, '');

const supabaseUrl = clean(import.meta.env.VITE_SUPABASE_URL);
const supabaseAnonKey = clean(import.meta.env.VITE_SUPABASE_ANON_KEY);

const isValidUrl = /^https?:\/\/.+/i.test(supabaseUrl);

let client = null;
if (isValidUrl && supabaseAnonKey) {
  try {
    client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true, // nécessaire pour le retour OAuth / magic link
      },
    });
  } catch (error) {
    // Ne jamais crasher l'app à cause d'une config invalide → mode local
    console.error('[supabase] createClient a échoué, mode local:', error?.message);
    client = null;
  }
} else {
  console.warn(
    '[supabase] Config absente ou invalide ' +
    `(url="${supabaseUrl}", key présente=${Boolean(supabaseAnonKey)}) — mode local uniquement.`
  );
}

// true seulement si le client a réellement été créé
export const isSupabaseConfigured = Boolean(client);
export const supabase = client;
export default supabase;
