---
name: Project Fat Loss
description: Carnet d'entraînement sombre pour perdre du poids — une séance par jour, 20 min de vélo, rien de superflu entre l'utilisateur et sa série.
colors:
  bg: "#000000"
  bg-el: "#0e0e10"
  surface: "#1c1c1e"
  surface-2: "#2c2c2e"
  surface-3: "#3a3a3c"
  label: "#ffffff"
  label-2: "rgba(235, 235, 245, .6)"
  label-3: "rgba(235, 235, 245, .32)"
  label-4: "rgba(235, 235, 245, .18)"
  sep: "rgba(84, 84, 88, .6)"
  sep-op: "rgba(84, 84, 88, .32)"
  acc: "#F03D32"
  acc-2: "#c9271d"
  on-acc: "#ffffff"
  acc-soft: "rgba(240, 61, 50, .16)"
  ok: "#30d158"
  err: "#ff453a"
  warn: "#ff9f0a"
  info: "#0a84ff"
  illustration-surface: "#101013"
typography:
  page-title:
    fontFamily: "Outfit, Inter, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Inter, -apple-system, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Inter, -apple-system, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: "-0.01em"
  label:
    fontFamily: "Inter, -apple-system, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 600
    lineHeight: 1.3
  tab:
    fontFamily: "Inter, -apple-system, sans-serif"
    fontSize: "11px"
    fontWeight: 500
    lineHeight: 1.2
rounded:
  sm: "8px"
  md: "12px"
  card: "14px"
  lg: "16px"
  xl: "22px"
  pill: "100px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  2xl: "24px"
components:
  button-primary:
    backgroundColor: "{colors.acc}"
    textColor: "{colors.on-acc}"
    rounded: "{rounded.md}"
    padding: "14px"
  button-primary-active:
    backgroundColor: "{colors.acc-2}"
  button-soft:
    backgroundColor: "{colors.acc-soft}"
    textColor: "{colors.acc}"
    rounded: "{rounded.pill}"
    padding: "8px 14px"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.card}"
    padding: "16px"
  tabbar:
    backgroundColor: "{colors.bg-el}"
    height: "64px"
  tabbar-start:
    backgroundColor: "{colors.acc}"
    textColor: "{colors.on-acc}"
    size: "60px"
  input:
    backgroundColor: "rgba(255, 255, 255, .05)"
    textColor: "{colors.label}"
    rounded: "{rounded.md}"
    padding: "14px"
---

# Design System : Project Fat Loss

## Overview

Une app de suivi utilisée par une seule personne, chez elle, à 147 kg, entre un vélo d'appartement Domyos EB900 et quelques haltères. Elle s'ouvre le matin pour savoir « qu'est-ce que je fais aujourd'hui », reste posée au sol ou sur le banc pendant la séance (lue à 1–2 m, mains occupées), puis sert le soir à noter le repas et la pesée.

Mode impeccable : **Operate**. La réussite, c'est faire la séance du jour et noter ce qu'on mange, pas admirer l'interface. D'où l'identité actuelle, à garder : sombre façon iOS (noir pur, cartes `#1c1c1e`, filets fins), une seule couleur d'action, le rouge `#F03D32`, et une seule famille de texte (Inter). L'écran le plus important est la séance pas à pas : c'est là que le design doit être le plus lisible et le plus calme.

## Colors

### Primary

`acc #F03D32` : action principale de l'écran (Démarrer, Commencer, Enregistrer), élément actif de la barre d'onglets, progression. `acc-2 #c9271d` pour l'état pressé, `acc-soft` (16 %) pour les boutons secondaires et les puces.

### Secondary

Couleurs d'état iOS, réservées à leur sens : `ok #30d158` (fait, perte de poids), `err #ff453a` (erreur, suppression), `warn #ff9f0a` (attention), `info #0a84ff` (vélo, information). Le bleu sert aussi d'identité au vélo dans la check-list et les statistiques.

### Neutral

`bg #000` (page), `bg-el #0e0e10` (barres d'en-tête et d'onglets), `surface #1c1c1e` → `surface-3 #3a3a3c` (cartes, pressé, pistes). Texte : `label` blanc, `label-2` (60 %) pour le secondaire, `label-3` (32 %) **uniquement pour les éléments décoratifs ou désactivés** : il donne 2,6:1 sur fond noir, sous le seuil de 4,5:1 pour du texte.

### Named Rules

- **Un seul rouge par écran.** Le rouge plein désigne l'action à faire maintenant ; les autres actions passent en `acc-soft` ou en neutre.
- **Le vert veut dire « fait » ou « perdu des kilos ».** Jamais de vert décoratif.
- **Pas de dégradé, pas de bordure colorée à gauche.** Les cartes sont plates, séparées par la surface, pas par un liseré.

## Typography

Inter pour tout le texte, Outfit 800 seulement pour le titre de page (« Aujourd'hui »). Corps à 17 px (taille iOS), lettrage -0,01 em.

### Hierarchy

| Rôle | Taille | Graisse | Usage |
|---|---|---|---|
| page-title | 2.25rem (36 px) | 800, Outfit | Titre d'onglet |
| title | 1.25rem (20 px) | 600 | Titre de section / carte |
| body | 17 px | 400 | Texte courant, noms d'exercices en liste |
| label | 0.8125rem (13 px) | 600 | Libellés de champs, puces |
| tab | 11 px | 500 | Barre d'onglets |

### Named Rules

- **Neuf tailles, pas vingt et une.** Échelle fixe `.75 / .875 / 1 / 1.0625 / 1.25 / 1.5 / 2 / 3 / 5 rem`. Rien sous 12 px pour du texte lisible.
- **Les chiffres de séance se lisent à 2 m.** Répétitions, minuteur, kcal : grands, gras, chiffres tabulaires (`font-variant-numeric: tabular-nums`).
- **Pas de PETITES MAJUSCULES espacées au-dessus d'un titre.** Le titre porte son propre poids.

## Layout

Colonne unique mobile (412 px de référence, 360 px minimum), centrée et plafonnée à 768 px sur tablette. Marges latérales 16–18 px, espacement entre cartes 10–12 px, intérieur de carte 16 px. Barre d'onglets fixe de 64 px (+ zone de geste) avec le bouton Démarrer central de 60 px qui déborde de 18 px : tout contenu défilant réserve `calc(94px + env(safe-area-inset-bottom))` en bas. En séance, la barre d'onglets disparaît au profit d'une barre de contrôle flottante.

## Elevation & Depth

Profondeur par la surface, pas par l'ombre : noir → `surface` → `surface-2`. Ombres réservées aux éléments flottants : bouton Démarrer (`0 6px 20px` lueur d'accent + anneau 6 px couleur de barre), feuilles et dialogues (`0 16px 40px rgba(0,0,0,.5)`).

## Shapes

Rayons : 8 (petits contrôles), 12 (boutons, champs), 14 (cartes), 16–22 (feuilles, dialogues), pilule 100 px (puces, boutons doux). Icônes Lucide, trait 2 px, 18–22 px.

## Components

### Buttons

- **Primaire** : fond rouge, texte blanc 600, rayon 12, 14 px de padding vertical, pleine largeur en bas d'écran. Pressé : `acc-2` + échelle 0,98.
- **Doux** : pilule `acc-soft`, texte rouge, pour les actions secondaires (Personnaliser, Rouler, Démarrer dans la check-list).
- **Icône seule** : seulement si l'icône est universelle (fermer, retour) ; zone tactile 44 × 44 px minimum.

### Chips

Pilules `surface-2` ; sélection = rouge plein (une seule à la fois). Ordre logique des valeurs (charges croissantes).

### Cards / Containers

`surface`, rayon 14, padding 16, sans bordure. Une carte = un sujet. Pas de carte dans une carte.

### Inputs / Fields

Fond blanc 5 %, filet 8 %, rayon 12, hauteur ≥ 44 px, **libellé visible au-dessus** (pas seulement un placeholder). Focus : filet `acc`.

### Navigation

Barre d'onglets du bas : 4 onglets + Démarrer central, icône + libellé en français. Onglet actif en rouge, inactifs en `label-2` (pas `label-3`).

### Séance pas à pas (signature)

Illustration de l'exercice, nom, charge, consignes, puis la barre flottante (liste, précédent, vidéo, lecture, suivant). Pendant le rythme, le compteur de répétitions est **l'élément le plus grand de l'écran**.

## Do's and Don'ts

### Do:

- Garder le noir pur et un seul rouge d'action par écran.
- Écrire en français, au vouvoiement, avec les mots de l'utilisateur (« séance », « série », « vélo »).
- Donner aux chiffres de séance une taille lisible à distance.
- Montrer un état vide qui dit quoi faire (« Notez votre première pesée »).

### Don't:

- Afficher le titre brut du programme (« JOUR 7: RÉCUPÉRATION ACTIVE (Séance légère, Gainage) — Dimanche · S1 Adaptation ») comme titre d'écran.
- Utiliser `label-3` pour du texte à lire.
- Empiler des sur-titres en petites majuscules (« PROCHAINE SÉANCE CONSEILLÉE », « JOUR 1 », « VÉLO »).
- Mettre deux actions primaires rouges l'une au-dessus de l'autre.
- Laisser l'interface passer en anglais selon la langue du navigateur.
