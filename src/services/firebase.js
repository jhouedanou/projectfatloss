/**
 * Client Firebase partagé pour toute l'application (compte + base Firestore).
 * La configuration est injectée par Vite (préfixe VITE_ uniquement), depuis
 * les secrets GitHub du déploiement et de la construction de l'APK.
 * Sans configuration, l'application reste en mode local.
 */
import { initializeApp } from 'firebase/app';
import {
  browserLocalPersistence,
  browserPopupRedirectResolver,
  connectAuthEmulator,
  indexedDBLocalPersistence,
  initializeAuth,
} from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';

// Nettoie d'éventuels guillemets / espaces / retours ligne dans les secrets CI
const clean = (v) => String(v ?? '').trim().replace(/^["']|["']$/g, '');

const config = {
  apiKey: clean(import.meta.env.VITE_FIREBASE_API_KEY),
  authDomain: clean(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
  projectId: clean(import.meta.env.VITE_FIREBASE_PROJECT_ID),
  appId: clean(import.meta.env.VITE_FIREBASE_APP_ID),
};

// Tests locaux : émulateurs Auth (9099) et Firestore (8080) de firebase-tools.
const useEmulator = Boolean(clean(import.meta.env.VITE_FIREBASE_EMULATOR));

/** true dans l'APK Android (WebView Capacitor), false dans un navigateur. */
export const isNativeApp = typeof window !== 'undefined'
  && Boolean(window.Capacitor?.isNativePlatform?.());

let app = null;
let auth = null;
let db = null;

if (config.apiKey && config.projectId) {
  try {
    app = initializeApp(config);
    auth = initializeAuth(app, {
      persistence: [indexedDBLocalPersistence, browserLocalPersistence],
      // Google refuse sa fenêtre de connexion dans une WebView : pas de popup dans l'APK.
      ...(isNativeApp ? {} : { popupRedirectResolver: browserPopupRedirectResolver }),
    });
    db = getFirestore(app);
    if (useEmulator) {
      connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
      connectFirestoreEmulator(db, '127.0.0.1', 8080);
    }
  } catch (error) {
    // Ne jamais crasher l'app à cause d'une config invalide → mode local
    console.error('[firebase] initialisation échouée, mode local:', error?.message);
    app = null;
    auth = null;
    db = null;
  }
} else {
  console.warn(
    '[firebase] Config absente ' +
    `(projectId="${config.projectId}", clé présente=${Boolean(config.apiKey)}) — mode local uniquement.`
  );
}

// true seulement si Firebase a réellement été initialisé
export const isFirebaseConfigured = Boolean(db);
export { app, auth, db };
