/**
 * Configuration de l'authentification
 * Pour des raisons de sécurité, le mot de passe devrait être stocké côté serveur
 * et vérifié via une API. Cette implémentation est simplifiée pour un usage local.
 */

// En production, utiliser une vraie API d'authentification
// Pour l'instant, on utilise une variable d'environnement ou une valeur par défaut
const AUTH_PASSWORD = import.meta.env.VITE_HISTORY_PASSWORD || 'default_password';

/**
 * Vérifie si le mot de passe fourni est correct
 * @param {string} password - Le mot de passe à vérifier
 * @returns {boolean} - True si le mot de passe est correct
 */
export const verifyPassword = (password) => {
  return password === AUTH_PASSWORD;
};

/**
 * Note de sécurité:
 * Cette implémentation n'est pas sécurisée pour une vraie production.
 * Pour une sécurité réelle, il faudrait:
 * 1. Un backend avec authentification JWT ou session
 * 2. Hasher les mots de passe avec bcrypt ou similaire
 * 3. Utiliser HTTPS
 * 4. Implémenter un rate limiting
 */
