/**
 * Utilitaire pour gérer les chemins en production GitHub Pages
 */

// Détecte automatiquement la base URL.
// On s'appuie sur import.meta.env.BASE_URL, injecté par Vite au build à partir
// de l'option `base` (vite.config.js). En prod GitHub Pages il vaut
// '/projectfatloss/', en dev '/'. C'est plus fiable qu'un test d'hostname codé
// en dur : les chemins d'assets restent corrects quel que soit le domaine
// (domaine personnalisé, prévisualisation, www., etc.).
export function getBaseUrl() {
  const base = (import.meta.env.BASE_URL || '/');
  // Retourner sans le slash final : getAssetPath ajoute un chemin commençant par '/'.
  return base === '/' ? '' : base.replace(/\/$/, '');
}

// Fonctions utilitaires pour les chemins
export function getAssetPath(path) {
  const baseUrl = getBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}

export function getServiceWorkerPath() {
  return getAssetPath('/sw.js');
}

export function getIconPath(iconName) {
  return getAssetPath(`/icons/${iconName}`);
}

export function getManifestPath() {
  return getAssetPath('/manifest.json');
}

export function getExerciseIconsPath() {
  return getAssetPath('/exo-icons.json');
}

// Pour OneSignal qui ne peut pas utiliser notre base URL
export function isProduction() {
  return process.env.NODE_ENV === 'production' || window.location.hostname === 'jhouedanou.github.io';
}

export default {
  getBaseUrl,
  getAssetPath,
  getServiceWorkerPath,
  getIconPath,
  getManifestPath,
  getExerciseIconsPath,
  isProduction
}; 