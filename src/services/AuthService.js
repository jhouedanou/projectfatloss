/**
 * Service d'authentification Supabase — email + mot de passe (pas d'OAuth).
 * => Dashboard Supabase : Authentication > Providers > Email, activer le provider
 *    et "Allow new users to sign up". Optionnel : désactiver "Confirm email"
 *    pour une connexion immédiate sans email de confirmation.
 */
import { supabase, isSupabaseConfigured } from './supabase';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ensureConfigured = () => {
  if (!isSupabaseConfigured) {
    return { ok: false, error: 'Supabase non configuré (variables VITE_ manquantes)' };
  }
  return { ok: true };
};

const normalizeEmail = (email) => String(email).trim().toLowerCase();

const validate = (email, password) => {
  if (!email || !password) return 'Email et mot de passe requis';
  if (!EMAIL_RE.test(normalizeEmail(email))) return 'Adresse email invalide';
  if (String(password).length < 6) return 'Mot de passe : 6 caractères minimum';
  return null;
};

const friendlyError = (error) => {
  const msg = error.message || '';
  if (/signup.*disabled|disabled.*signup/i.test(msg)) {
    return 'Inscriptions désactivées côté Supabase (active "Allow new users to sign up").';
  }
  if (/already registered|already exists/i.test(msg)) {
    return 'Un compte existe déjà avec cet email.';
  }
  if (/invalid.*format|invalid email/i.test(msg)) {
    return 'Adresse email invalide ou refusée par le serveur.';
  }
  if (/invalid login credentials/i.test(msg)) {
    return 'Email ou mot de passe incorrect';
  }
  return msg;
};

/**
 * Inscription : crée un compte email + mot de passe.
 * @param {string} email
 * @param {string} password
 * @param {string} [displayName] - nom affiché optionnel
 */
export const signUp = async (email, password, displayName = '') => {
  const cfg = ensureConfigured();
  if (!cfg.ok) return { success: false, error: cfg.error };

  const err = validate(email, password);
  if (err) return { success: false, error: err };

  const { data, error } = await supabase.auth.signUp({
    email: normalizeEmail(email),
    password,
    options: { data: { username: displayName?.trim() || normalizeEmail(email).split('@')[0] } },
  });

  if (error) {
    console.error('[auth] signUp error:', error.status, error.message);
    return { success: false, error: friendlyError(error) };
  }
  // Si confirmation email désactivée, session est immédiate
  return { success: true, user: data.user, session: data.session };
};

/**
 * Connexion : email + mot de passe.
 */
export const signIn = async (email, password) => {
  const cfg = ensureConfigured();
  if (!cfg.ok) return { success: false, error: cfg.error };

  if (!email || !password) {
    return { success: false, error: 'Email et mot de passe requis' };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: normalizeEmail(email),
    password,
  });

  if (error) {
    console.error('[auth] signIn error:', error.status, error.message);
    return { success: false, error: friendlyError(error) };
  }
  return { success: true, user: data.user, session: data.session };
};

/**
 * Déconnexion.
 */
export const signOut = async () => {
  if (!isSupabaseConfigured) return true;
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Erreur lors de la déconnexion:', error);
    return false;
  }
  return true;
};

// Alias rétro-compatible
export const logout = signOut;

/**
 * Session courante (ou null).
 */
export const getSession = async () => {
  if (!isSupabaseConfigured) return null;
  const { data } = await supabase.auth.getSession();
  return data?.session ?? null;
};

/**
 * Utilisateur connecté (ou null).
 */
export const getCurrentUser = async () => {
  const session = await getSession();
  return session?.user ?? null;
};

/**
 * Nom d'affichage lisible d'un utilisateur Supabase.
 */
export const getDisplayName = (user) =>
  user?.user_metadata?.username || user?.email?.split('@')[0] || 'Utilisateur';

/**
 * S'abonne aux changements d'état d'authentification.
 * @param {(user: object|null) => void} callback
 * @returns {() => void} fonction de désabonnement
 */
export const onAuthChange = (callback) => {
  if (!isSupabaseConfigured) {
    callback(null);
    return () => {};
  }
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });
  return () => data?.subscription?.unsubscribe();
};
