# Synchronisation des Données

## Vue d'ensemble

Le système de synchronisation permet de consulter l'historique complet des entraînements et des pesées depuis tous vos appareils en accédant au site web.

## Configuration

### Mot de passe d'accès

Le mot de passe pour accéder à l'historique protégé est configuré via une variable d'environnement :

1. Copiez le fichier `.env.example` vers `.env` :
   ```bash
   cp .env.example .env
   ```

2. Modifiez le mot de passe dans `.env` :
   ```
   VITE_HISTORY_PASSWORD=votre_mot_de_passe
   ```

**Note de sécurité :** Cette implémentation est simplifiée pour un usage local. Pour une vraie production, utilisez un backend avec authentification sécurisée (JWT, OAuth, etc.).

## Accès à l'historique

1. Sur la page principale, cliquez sur l'icône "🔐 Données" dans la barre de navigation
2. Entrez le mot de passe configuré (par défaut : `karniella`)
3. Vous accédez à l'historique complet avec :
   - Statistiques globales (séances, calories, durée, poids soulevé)
   - Tableau des séances d'entraînement
   - Tableau des pesées

## Fonctionnalités

### Export des données
- Cliquez sur l'icône de téléchargement (⬇️) pour exporter toutes vos données au format JSON
- Le fichier contient :
  - Historique des séances d'entraînement
  - Statistiques globales
  - Historique des pesées
  - Date d'export

### Import des données
- Cliquez sur l'icône d'upload (⬆️)
- Sélectionnez un fichier JSON précédemment exporté
- Vos données seront importées et fusionnées avec les données locales

### Synchronisation entre appareils

Pour synchroniser vos données entre plusieurs appareils :

1. Sur l'appareil source :
   - Accédez à "Données"
   - Exportez vos données (JSON)

2. Sur l'appareil cible :
   - Accédez à "Données"
   - Importez le fichier JSON

## Stockage des données

### Local (localStorage)
Les données sont stockées localement dans le navigateur :
- `workout_history` : Historique des séances
- `workout_stats` : Statistiques globales
- `weight_history_data` : Historique des pesées

### Centralisé (JSON)
Des fichiers JSON de référence sont disponibles dans `/public/data/` :
- `workout-history.json` : Template pour l'historique des séances
- `weight-history.json` : Template pour l'historique des pesées

## Sécurité

- L'accès à l'historique complet est protégé par mot de passe
- Les données restent stockées localement dans votre navigateur
- Aucune donnée n'est envoyée à un serveur externe

## Format des données

### Séance d'entraînement
```json
{
  "id": 1234567890,
  "title": "JOUR 1: HAUT DU CORPS",
  "date": "2025-10-30T15:00:00.000Z",
  "calories": 450,
  "duration": 3600,
  "weightLifted": 2500,
  "exercises": [...]
}
```

### Pesée
```json
{
  "id": 1234567890,
  "weight": 75.5,
  "date": "2025-10-30T08:00:00.000Z",
  "notes": "Matinée après petit-déjeuner"
}
```

## Notes techniques

- Le système utilise localStorage pour la persistance locale
- Les exports sont au format JSON pour une compatibilité maximale
- La synchronisation est manuelle via export/import
- Pour une synchronisation automatique, il faudrait implémenter un backend
