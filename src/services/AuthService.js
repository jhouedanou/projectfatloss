/**
 * Service d'authentification Firebase.
 *   - site web : « Continuer avec Google » (fenêtre Google) ou email + mot de passe ;
 *   - APK : email + mot de passe seulement (Google refuse sa connexion dans une
 *     WebView). « Mot de passe oublié » donne aussi un mot de passe à un compte
 *     créé avec Google, pour s'en servir dans l'APK.
 * => Console Firebase : Authentication > Méthode de connexion, activer Google et
 *    E-mail/Mot de passe ; Paramètres > Domaines autorisés, ajouter
 *    jhouedanou.github.io.
 */
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile,
} from 'firebase/auth';
import { auth, isFirebaseConfigured, isNativeApp } from './firebase';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** La connexion Google n'est proposée que dans un navigateur. */
export const canUseGoogleSignIn = isFirebaseConfigured && !isNativeApp;

const ensureConfigured = () => {
  if (!isFirebaseConfigured) {
    return { ok: false, error: 'Firebase non configuré (variables VITE_FIREBASE_ manquantes)' };
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

const FRIENDLY_ERRORS = {
  'auth/invalid-credential': 'Email ou mot de passe incorrect',
  'auth/wrong-password': 'Email ou mot de passe incorrect',
  'auth/user-not-found': 'Email ou mot de passe incorrect',
  'auth/email-already-in-use': 'Un compte existe déjà avec cet email.',
  'auth/invalid-email': 'Adresse email invalide',
  'auth/weak-password': 'Mot de passe : 6 caractères minimum',
  'auth/missing-password': 'Mot de passe requis',
  'auth/too-many-requests': 'Trop d\'essais : réessaie dans quelques minutes.',
  'auth/network-request-failed': 'Pas de connexion internet.',
  'auth/popup-closed-by-user': 'Fenêtre Google fermée avant la fin.',
  'auth/cancelled-popup-request': 'Fenêtre Google fermée avant la fin.',
  'auth/popup-blocked': 'Fenêtre Google bloquée : autorise les pop-up pour ce site.',
  'auth/unauthorized-domain':
    'Domaine non autorisé : ajoute-le dans Firebase → Authentication → Paramètres → Domaines autorisés.',
  'auth/operation-not-allowed':
    'Mode de connexion désactivé : active-le dans Firebase → Authentication → Méthode de connexion.',
};

const friendlyError = (error) => FRIENDLY_ERRORS[error?.code] || error?.message || 'Erreur';

/**
 * Inscription : crée un compte email + mot de passe (connecté tout de suite).
 * @param {string} email
 * @param {string} password
 * @param {string} [displayName] - nom affiché optionnel
 */
export const signUp = async (email, password, displayName = '') => {
  const cfg = ensureConfigured();
  if (!cfg.ok) return { success: false, error: cfg.error };

  const err = validate(email, password);
  if (err) return { success: false, error: err };

  try {
    const { user } = await createUserWithEmailAndPassword(auth, normalizeEmail(email), password);
    const name = displayName?.trim() || normalizeEmail(email).split('@')[0];
    await updateProfile(user, { displayName: name }).catch(() => {});
    return { success: true, user, session: true };
  } catch (error) {
    console.error('[auth] signUp error:', error.code, error.message);
    return { success: false, error: friendlyError(error) };
  }
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

  try {
    const { user } = await signInWithEmailAndPassword(auth, normalizeEmail(email), password);
    return { success: true, user, session: true };
  } catch (error) {
    console.error('[auth] signIn error:', error.code, error.message);
    return { success: false, error: friendlyError(error) };
  }
};

/**
 * Connexion avec Google (fenêtre Google, navigateur seulement).
 */
export const signInWithGoogle = async () => {
  const cfg = ensureConfigured();
  if (!cfg.ok) return { success: false, error: cfg.error };
  if (!canUseGoogleSignIn) {
    return { success: false, error: 'Connexion Google indisponible dans l\'application : utilise email + mot de passe.' };
  }

  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const { user } = await signInWithPopup(auth, provider);
    return { success: true, user, session: true };
  } catch (error) {
    console.error('[auth] Google error:', error.code, error.message);
    return { success: false, error: friendlyError(error) };
  }
};

/**
 * Envoie l'email « Mot de passe oublié ». Sur un compte créé avec Google, le
 * lien permet aussi de choisir un mot de passe (pour se connecter dans l'APK).
 */
export const resetPassword = async (email) => {
  const cfg = ensureConfigured();
  if (!cfg.ok) return { success: false, error: cfg.error };
  if (!email || !EMAIL_RE.test(normalizeEmail(email))) {
    return { success: false, error: 'Entre ton adresse email.' };
  }

  try {
    await sendPasswordResetEmail(auth, normalizeEmail(email));
    return { success: true };
  } catch (error) {
    console.error('[auth] reset error:', error.code, error.message);
    return { success: false, error: friendlyError(error) };
  }
};

/**
 * Déconnexion.
 */
export const signOut = async () => {
  if (!isFirebaseConfigured) return true;
  try {
    await firebaseSignOut(auth);
    return true;
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    return false;
  }
};

// Alias rétro-compatible
export const logout = signOut;

/**
 * Utilisateur connecté (ou null), une fois la session restaurée.
 */
export const getCurrentUser = async () => {
  if (!isFirebaseConfigured) return null;
  await auth.authStateReady();
  return auth.currentUser ?? null;
};

/**
 * Session courante (ou null) : l'utilisateur Firebase connecté.
 */
export const getSession = getCurrentUser;

/**
 * Nom d'affichage lisible d'un utilisateur Firebase.
 */
export const getDisplayName = (user) =>
  user?.displayName || user?.email?.split('@')[0] || 'Utilisateur';

/**
 * S'abonne aux changements d'état d'authentification.
 * @param {(user: object|null) => void} callback
 * @returns {() => void} fonction de désabonnement
 */
export const onAuthChange = (callback) => {
  if (!isFirebaseConfigured) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, (user) => callback(user ?? null));
};
