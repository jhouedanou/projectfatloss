/**
 * Utilitaire pour gérer les chemins en production GitHub Pages
 */

// Détecte automatiquement la base URL
export function getBaseUrl() {
  if (typeof window === 'undefined') return '';
  
  // Pour GitHub Pages, vérifier si on est dans le sous-dossier projectfatloss
  const isGitHubPages = window.location.hostname === 'jhouedanou.github.io';
  const hasProjectFatlossPath = window.location.pathname.includes('/projectfatloss');
  
  if (isGitHubPages && hasProjectFatlossPath) {
    return '/projectfatloss';
  }
  
  return '';
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