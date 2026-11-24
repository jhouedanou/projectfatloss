# Project Fat Loss — contexte produit

## Pour qui

Une seule personne : environ 147 kg pour 1,78 m, qui veut perdre du poids sur la durée. S'entraîne chez elle (vélo d'appartement **Domyos EB900**, haltères, barre, banc). Utilise un téléphone Android (APK) et le navigateur.

## Ce que fait l'app

Un seul écran : un **tableau de bord** pour suivre le poids et l'activité. L'app ne guide plus de séance, ne propose plus de programme et ne note plus les repas.

1. **Poids** : dernière pesée, tendance (moyenne des 7 derniers jours pesés), écart sur la période, rythme par semaine, poids visé et date estimée.
2. **Composition corporelle** (balance à impédance) : graisse, masse grasse, muscles, graisse viscérale, eau, IMC, avec leur évolution.
3. **Activité** : pas, minutes de sport, calories actives, distance ; comparaison avec la période d'avant ; graphique par jour, semaine ou mois.
4. **Régularité** : calendrier des 16 dernières semaines, jours de sport d'affilée.
5. **Semaine par semaine** : poids moyen, écart, pas, sport, calories — pour lire le lien entre activité et poids.
6. **Séances** : temps par famille (vélo, musculation, marche et course, autre) et liste des séances.

Un filtre de période (7 j, 30 j, 90 j, 1 an, tout) s'applique à tout l'écran.

## D'où viennent les données

- **APK Android** : Health Connect (pas, calories, distance, séances de toutes les applications, pesées). Lecture à l'ouverture et par le bouton « Synchroniser ».
- **Site** : les données arrivent du téléphone par le compte (Firebase). Import Google Fit possible tant que ce service existe (fermeture fin 2026).
- **Pesée** : saisie à la main ou capture d'écran de l'app de la balance oraimo, lue sur l'appareil.
- **Historique de l'ancienne app** (séances guidées, vélo coché, pas) : toujours lu, jamais modifié.

Code : `src/dashboard/` (écran, graphiques), `src/services/FitStore.js` (stockage), `FitSync.js` (import), `FitMetrics.js` (calculs), `SyncService.js` (compte).

## Ton

Français, vouvoiement, simple et direct. Des chiffres avec leur unité et leur période ; pas de jargon.

## Mode de design

**Operate** (outil de suivi). L'interface doit disparaître derrière la question : « est-ce que mon poids et mon activité vont dans le bon sens ? »

## Contraintes

- Thème sombre uniquement (noir pur, accent rouge `#F03D32` pour l'action principale).
- Graphiques : violet pour une mesure seule ; vélo bleu, musculation orange, marche vert d'eau, autre jaune (ordre fixe). Vert et orange restent réservés au sens « bon / à surveiller ».
- Hors-ligne d'abord : tout marche sans compte ; Firebase synchronise quand on est connecté.
- Mobile d'abord (360–412 px), deux colonnes à partir de 900 px ; APK Android (WebView Capacitor) et navigateur.
