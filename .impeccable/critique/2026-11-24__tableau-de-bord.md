---
target: Project Fat Loss — tableau de bord (un écran)
total_score: 32
max_score: 40
na_heuristics: ""
p0_count: 0
p1_count: 0
mode: Operate
timestamp: 2026-11-24
---
⚠️ DEGRADED : critique faite par un seul agent, sans le skill impeccable (non installé dans la session) ; son format est suivi à la main. Mesures prises dans Chromium à 390 × 844, données de test. Skills utilisés : `ui-ux-pro-max` (priorités 1 à 10, liste de contrôle avant livraison) et `dataviz` (formes, palette validée).

## Mesures avant / après la passe de finition

| Mesure | Avant | Après |
|---|---|---|
| Cibles tactiles sous 44 px | 17 (filtres de période 40 px, boutons 36 px, liens 32 px, liens du pied de page 18 px) | 0 |
| Tailles de police différentes | 18, dont 3 sous 12 px (10,9 px, 11 px, 11,5 px) | 9, aucune sous 12 px |
| Textes sous 4,5:1 de contraste | 0 | 0 |
| Hiérarchie des titres | pas de `h1`, tout en `h2` | `h1` (en-tête), `h2` (semaine, évolution), `h3` (cartes) |
| Chiffres « héros » (≥ 48 px) | 2 (pas de la semaine, poids) | 1 (pas de la semaine) ; poids à 40 px |
| Défilement horizontal du tableau à 390 px | oui (520 px mini) | non (colonne calories masquée sous 480 px) |
| Fermeture des fenêtres au clavier | non | Échap ferme la feuille « pesée » et la connexion |

## Score de santé design (après)

| # | Heuristique | Score | Constat |
|---|---|---|---|
| 1 | Visibilité de l'état du système | 3 | Source et date de la dernière lecture en haut ; message après chaque synchro. Manque : pas d'indicateur pendant la synchro automatique du compte |
| 2 | Correspondance avec le monde réel | 4 | Unités et périodes partout, français simple, semaines du lundi au dimanche |
| 3 | Contrôle et liberté | 3 | Échap, bouton Fermer, confirmation avant de supprimer une pesée. Manque : annuler une suppression |
| 4 | Cohérence et standards | 3 | Une échelle de 9 tailles, une famille d'icônes, couleurs par rôle. Les boutons de `ScaleImport` gardent leur ancien style |
| 5 | Prévention des erreurs | 3 | Lien Drive vérifié avant l'appel, plages plausibles sur la pesée |
| 6 | Reconnaissance plutôt que rappel | 3 | Tout est sur un écran ; légende sous le graphique empilé |
| 7 | Flexibilité et efficacité | 3 | Filtre de période mémorisé, semaines précédentes, quatre mesures |
| 8 | Esthétique et minimalisme | 3 | Écran long sur téléphone (7 hauteurs d'écran) : pas de sommaire |
| 9 | Récupération après erreur | 4 | Messages qui disent la cause et quoi faire (API non activée, dossier non partagé, autorisation manquante) |
| 10 | Aide et documentation | 3 | Carte de mise en route, légendes sous les graphiques, carte « Sources de données » |
| **Total** | | **32/40** | |

## Ce qui reste (P2)

1. **Écran long sur téléphone.** Ajouter un sommaire collant (Semaine · Poids · Activité · Séances) ou replier les cartes du bas.
2. **Synchro automatique muette.** Montrer un état « lecture en cours » pendant la synchro du compte à l'ouverture.
3. **Suppression d'une pesée sans retour.** Proposer « Annuler » pendant quelques secondes.
4. **Table des données des graphiques.** Le tableau « Semaine par semaine » sert de vue en table ; les graphiques par jour n'en ont pas.
5. **`ScaleImport`** : aligner ses boutons et ses titres sur le reste (`h4` dans une feuille dont le titre est `h2`).

## Écart assumé avec `ui-ux-pro-max`

Le système proposé par le skill (« Data-Dense Dashboard », bleu `#1E40AF` sur fond clair, Fira) n'est pas repris : l'identité du produit est sombre, avec le rouge `#F03D32` pour l'action (voir `DESIGN.md`). Ses règles, elles, sont appliquées : cibles de 44 px, contraste, titres, états vides avec action, retour d'erreur, animations courtes coupées par « réduire les animations ».
