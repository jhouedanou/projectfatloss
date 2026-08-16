/**
 * Générateur du programme d'entraînement (source unique).
 *
 * Écrit :
 *   - src/data.js                                          (application web)
 *   - projectfatloss_flutter/lib/shared/data/default_workout_data.dart (application Flutter)
 *
 * Programme : 28 jours = 4 semaines de 5 séances mixtes + 2 jours de repos.
 *   Lundi    : FULL BODY A (poussée)          — muscu + vélo
 *   Mardi    : FULL BODY B (tirage)           — muscu + vélo
 *   Mercredi : repos
 *   Jeudi    : FULL BODY C (jambes)           — muscu + vélo
 *   Vendredi : FULL BODY D (haut du corps)    — muscu + vélo
 *   Samedi   : FULL BODY E (gainage) + sortie vélo longue
 *   Dimanche : repos
 *
 * Chaque séance dure ~1 h et mélange musculation et vélo : échauffement vélo,
 * bloc de musculation, puis vélo de fin de séance (aucun bloc de vélo ne
 * dépasse 20 min d'affilée).
 *
 * Les exercices tournent sur les 4 semaines : chaque schéma de mouvement
 * (poussée horizontale, tirage, hinge, fentes…) a une variante différente par
 * semaine, avec une montée en charge S1 → S3 puis un allègement en S4.
 *
 * Objectif : perte de poids durable (profil ~147 kg) — low-impact, zéro saut,
 * 100% debout ou sur banc. Matériel : haltères 2×15 et 2×10 kg, barre 30 kg,
 * veste lestée 10 kg, poids chevilles 2×4 + 2×2 kg, vélo Domyos EB900.
 *
 * Usage : node scripts/gen-plan.mjs
 */

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// ---------------------------------------------------------------------------
// Catalogue d'exercices : 100% debout ou sur banc, zéro saut, zéro appui au sol.
// ---------------------------------------------------------------------------

const CATALOG = {
  // --- Poussée horizontale ---
  'Développé couché barre': {
    equip: 'Barre 30 kg',
    desc: 'Sur banc, descendez la barre vers la poitrine puis poussez, tempo contrôlé. Pectoraux. (Le banc est surélevé : pas d\'appui au sol.)',
    caloriesPerSet: [21, 24],
    gf: ['Barbell Bench Press', ['chest', 'triceps', 'shoulders']],
  },
  'Développé couché haltères': {
    equip: 'Haltères 15 kg',
    desc: 'Sur banc plat, poussez les haltères vers le haut en contrôlant la descente, amplitude complète. Pectoraux, triceps.',
    caloriesPerSet: [21, 24],
    gf: ['Dumbbell Bench Press', ['chest', 'triceps', 'shoulders']],
  },
  'Développé incliné haltères': {
    equip: 'Haltères 15 kg',
    desc: 'Banc incliné, poussez les haltères vers le haut en contrôlant la descente. Haut des pectoraux.',
    caloriesPerSet: [21, 24],
    gf: ['Incline Dumbbell Press', ['chest', 'shoulders', 'triceps']],
  },
  'Développé incliné barre': {
    equip: 'Barre 30 kg',
    desc: 'Banc incliné 30-45°, poussez la barre vers le haut. Haut des pectoraux et épaules.',
    caloriesPerSet: [21, 24],
    gf: ['Incline Barbell Press', ['chest', 'shoulders', 'triceps']],
  },
  'Écarté haltères sur banc': {
    equip: 'Haltères 10 kg',
    desc: 'Sur banc, bras légèrement fléchis, ouvrez les haltères en arc de cercle puis refermez au-dessus de la poitrine. Étirement des pectoraux.',
    caloriesPerSet: [16, 18],
    gf: ['Dumbbell Fly', ['chest', 'shoulders']],
  },

  // --- Poussée verticale / épaules ---
  'Développé militaire barre': {
    equip: 'Barre 30 kg',
    desc: 'Debout, gainé, poussez la barre au-dessus de la tête sans cambrer. Épaules complètes. 100% debout.',
    caloriesPerSet: [21, 24],
    gf: ['Military Press', ['shoulders', 'triceps']],
  },
  'Développé Arnold haltères': {
    equip: 'Haltères 15 kg',
    desc: 'Assis sur banc, paumes vers vous, tournez les poignets en poussant vers le haut. Tous les faisceaux de l\'épaule.',
    caloriesPerSet: [21, 24],
    gf: ['Arnold Press', ['shoulders', 'triceps']],
  },
  'Push press barre': {
    equip: 'Barre 30 kg',
    desc: 'Debout, légère impulsion des jambes puis poussez la barre au-dessus de la tête. Épaules + puissance, zéro impact.',
    caloriesPerSet: [21, 24],
    gf: ['Push Press', ['shoulders', 'triceps']],
  },
  'Élévations latérales haltères': {
    equip: 'Haltères 10 kg',
    desc: 'Debout, montez les haltères latéralement jusqu\'aux épaules. Deltoïde moyen.',
    caloriesPerSet: [12, 14],
    gf: ['Lateral Raises', ['shoulders']],
  },
  'Élévations frontales haltères': {
    equip: 'Haltères 10 kg',
    desc: 'Debout, montez les haltères devant vous jusqu\'aux épaules. Deltoïde antérieur.',
    caloriesPerSet: [12, 14],
    gf: ['Front Raises', ['shoulders']],
  },
  'Oiseau haltères (arrière épaule)': {
    equip: 'Haltères 10 kg',
    desc: 'Buste penché ou assis penché, montez les haltères sur les côtés en serrant les omoplates. Arrière de l\'épaule — corrige la posture.',
    caloriesPerSet: [12, 14],
    gf: ['Rear Delt Raise', ['shoulders', 'back']],
  },
  'Tirage menton barre (upright row)': {
    equip: 'Barre 30 kg',
    desc: 'Debout, barre devant les cuisses, tirez-la vers le menton coudes hauts, sans monter au-delà des épaules. Trapèzes et deltoïdes.',
    caloriesPerSet: [21, 24],
    gf: ['Upright Row', ['shoulders', 'trapezius']],
  },
  'Shrugs barre (haussements)': {
    equip: 'Barre 30 kg',
    desc: 'Debout, barre devant, haussez les épaules vers les oreilles sans plier les bras. Trapèzes.',
    caloriesPerSet: [16, 18],
    gf: ['Barbell Shrugs', ['trapezius', 'back']],
  },

  // --- Tirage ---
  'Rowing barre buste penché': {
    equip: 'Barre 30 kg',
    desc: 'Buste penché 45°, dos droit, tirez la barre vers le bas du ventre. Épaisseur du dos. Debout.',
    caloriesPerSet: [21, 24],
    gf: ['Bent Over Barbell Row', ['back', 'biceps']],
  },
  'Rowing haltères deux bras': {
    equip: 'Haltères 15 kg',
    desc: 'Buste penché, tirez les deux haltères vers les hanches en serrant les omoplates. Dos complet. Debout.',
    caloriesPerSet: [21, 24],
    gf: ['Two Arm Dumbbell Row', ['back', 'biceps']],
  },
  'Rowing haltère un bras': {
    equip: 'Haltère 15 kg',
    desc: 'Un genou et une main sur le banc, tirez l\'haltère vers la hanche, coude près du corps. Appui sur banc, pas au sol.',
    caloriesPerSet: [21, 24],
    gf: ['One Arm Dumbbell Row', ['back', 'biceps']],
  },
  'Pullover haltère sur banc': {
    equip: 'Haltère 15 kg',
    desc: 'Allongé en travers du banc, descendez l\'haltère derrière la tête bras tendus puis remontez. Grand dorsal. Sur banc.',
    caloriesPerSet: [16, 18],
    gf: ['Dumbbell Pullover', ['back', 'chest']],
  },

  // --- Hinge (chaîne postérieure) ---
  'Soulevé de terre surélevé (rack pull)': {
    equip: 'Barre 30 kg',
    desc: 'Barre posée à hauteur des genoux (cales/support), dos droit, tirez en poussant les hanches. JAMAIS depuis le sol : préserve le dos.',
    caloriesPerSet: [21, 24],
    gf: ['Rack Pull', ['back', 'glutes', 'hamstrings']],
  },
  'Soulevé de terre roumain (départ debout)': {
    equip: 'Barre 30 kg',
    desc: 'Départ debout barre en mains, poussez les hanches en arrière et descendez la barre le long des cuisses, dos droit, sans poser au sol. Ischios + fessiers + lombaires.',
    caloriesPerSet: [21, 24],
    gf: ['Romanian Deadlift', ['hamstrings', 'glutes', 'back']],
  },
  'Soulevé de terre roumain unilatéral haltère': {
    equip: 'Haltère 15 kg',
    desc: 'Debout sur une jambe (main libre en appui léger si besoin), poussez la hanche en arrière et descendez l\'haltère le long de la jambe d\'appui, dos droit. Ischios, fessiers, équilibre.',
    caloriesPerSet: [21, 24],
    gf: ['Single Leg Romanian Deadlift', ['hamstrings', 'glutes', 'core']],
  },

  // --- Squat / fentes ---
  'Squat barre': {
    equip: 'Barre 30 kg',
    desc: 'Barre sur les trapèzes, descendez hanches sous parallèle si mobilité OK, puis remontez. Quadriceps, fessiers. Debout.',
    caloriesPerSet: [21, 24],
    gf: ['Barbell Squat', ['quadriceps', 'glutes', 'hamstrings']],
  },
  'Squat gobelet haltère': {
    equip: 'Haltère 15 kg',
    desc: 'Debout, haltère tenu verticalement contre la poitrine, descendez en squat buste droit puis remontez. Quadriceps, fessiers, gainage. Debout.',
    caloriesPerSet: [21, 24],
    gf: ['Goblet Squat', ['quadriceps', 'glutes', 'core']],
  },
  'Squat sumo haltère': {
    equip: 'Haltère 15 kg',
    desc: 'Pieds très écartés, pointes vers l\'extérieur, haltère tenu entre les jambes. Adducteurs + fessiers. Debout.',
    caloriesPerSet: [21, 24],
    gf: ['Sumo Squat', ['glutes', 'adductors', 'quadriceps']],
  },
  'Fentes arrière alternées haltères': {
    equip: 'Haltères 10 kg',
    desc: 'Un pas en arrière, descendez le genou arrière sans le poser, puis revenez debout. Alternez. Fessiers et ischios, plus doux pour les genoux que la fente avant.',
    caloriesPerSet: [21, 24],
    gf: ['Reverse Lunges', ['glutes', 'hamstrings', 'quadriceps']],
  },
  'Fentes avant alternées haltères': {
    equip: 'Haltères 10 kg',
    desc: 'Un pas en avant, descendez le genou arrière vers le sol sans le poser, puis remontez. Alternez. Quadriceps, fessiers, équilibre.',
    caloriesPerSet: [21, 24],
    gf: ['Walking Lunges', ['quadriceps', 'glutes']],
  },
  'Fentes bulgares haltères': {
    equip: 'Haltères 10 kg',
    desc: 'Pied arrière surélevé sur le banc, descendez sur la jambe avant. Très efficace quadriceps et fessiers. Debout, zéro impact.',
    caloriesPerSet: [21, 24],
    gf: ['Bulgarian Split Squat', ['quadriceps', 'glutes']],
  },
  'Montées sur banc lestées': {
    equip: 'Haltères 10 kg',
    desc: 'Montez complètement sur un banc/marche stable, jambe motrice, contrôlez la descente. Alternez. Bas du corps fonctionnel, zéro impact.',
    caloriesPerSet: [16, 18],
    gf: ['Weighted Step-ups', ['quadriceps', 'glutes']],
  },
  'Mollets debout lestés': {
    equip: 'Veste lestée 10 kg',
    desc: 'Debout, avant-pieds sur une cale ou le bord du banc, montez sur la pointe des pieds puis descendez lentement le talon. Mollets, zéro impact.',
    caloriesPerSet: [12, 14],
    gf: ['Standing Calf Raise', ['calves']],
  },
  'Extension de hanche debout': {
    equip: 'Poids chevilles 4 kg',
    desc: 'Debout en appui léger, tendez la jambe vers l\'arrière en serrant le fessier, sans cambrer le bas du dos. Fessiers, 100% debout.',
    caloriesPerSet: [12, 14],
    gf: ['Standing Hip Extension', ['glutes', 'hamstrings']],
  },

  // --- Bras ---
  'Curl biceps haltères': {
    equip: 'Haltères 10 kg',
    desc: 'Debout, fléchissez les coudes pour monter les haltères vers les épaules sans balancer. Biceps.',
    caloriesPerSet: [12, 14],
    gf: ['Dumbbell Curl', ['biceps']],
  },
  'Curl marteau haltères': {
    equip: 'Haltères 15 kg',
    desc: 'Debout, paumes face à face, fléchissez les coudes sans balancer le buste. Biceps et brachial (épaisseur du bras).',
    caloriesPerSet: [16, 18],
    gf: ['Hammer Curl', ['biceps', 'forearms']],
  },
  'Curl concentré haltère': {
    equip: 'Haltère 15 kg',
    desc: 'Assis sur banc, coude calé contre la cuisse, fléchissez le bras lentement. Isolation du biceps.',
    caloriesPerSet: [12, 14],
    gf: ['Concentration Curl', ['biceps']],
  },
  'Extension triceps nuque haltère': {
    equip: 'Haltère 10 kg',
    desc: 'Debout ou assis, haltère derrière la nuque à deux mains, tendez les bras vers le haut. Triceps.',
    caloriesPerSet: [16, 18],
    gf: ['Overhead Triceps Extension', ['triceps']],
  },
  'Kickback triceps haltère': {
    equip: 'Haltère 10 kg',
    desc: 'Buste penché, coude collé au corps et fixe, tendez l\'avant-bras vers l\'arrière puis revenez. Isolation triceps.',
    caloriesPerSet: [12, 14],
    gf: ['Triceps Kickback', ['triceps']],
  },

  // --- Gainage debout ---
  'Relevés de genoux debout': {
    equip: 'Poids chevilles 4 kg',
    desc: 'Debout en appui léger, montez le genou vers la poitrine en contractant les abdos, alternez. Abdos bas, 100% debout.',
    caloriesPerSet: [16, 18],
    gf: ['Standing Knee Raises', ['abdominals', 'core']],
  },
  'Crunch latéral debout (side bend)': {
    equip: 'Haltère 15 kg',
    desc: 'Debout, un haltère d\'un côté, inclinez le buste latéralement puis redressez en contractant l\'oblique. Debout, aucun appui au sol.',
    caloriesPerSet: [13, 15],
    gf: ['Standing Side Bend', ['obliques', 'abdominals']],
  },
  'Woodchopper haltère': {
    equip: 'Haltère 10 kg',
    desc: 'Debout, amenez l\'haltère en diagonale de la hanche basse vers l\'épaule opposée puis inversez. Rotation du tronc, debout.',
    caloriesPerSet: [16, 18],
    gf: ['Dumbbell Woodchopper', ['obliques', 'abdominals', 'core']],
  },
  'Marche du fermier (farmer carry)': {
    equip: 'Haltères 15 kg',
    desc: 'Un haltère lourd dans chaque main, marchez tronc gainé et droit, épaules basses. Anti-flexion, core et grip, debout.',
    caloriesPerSet: [11, 12],
    gf: ['Farmer Carry', ['core', 'forearms', 'trapezius']],
    timer: true,
    duration: 60,
  },

  // --- Vélo (Domyos EB900) ---
  'Vélo — échauffement': {
    equip: 'Vélo Domyos',
    desc: '8 min de pédalage à résistance légère pour monter progressivement en température avant la musculation. Cadence souple, respiration confortable.',
    caloriesPerSet: [55, 70],
    gf: ['Stationary Cycling', ['quadriceps', 'glutes', 'cardio']],
    timer: true,
    duration: 480,
    setsLabel: '8 min (résistance légère)',
  },
  'Vélo — sortie longue': {
    equip: 'Vélo Domyos',
    desc: '20 min à résistance légère à moyenne, cadence confortable : vous devez pouvoir tenir une conversation. Le plus long bloc de vélo de la semaine, placé le samedi après une musculation courte.',
    caloriesPerSet: [150, 180],
    gf: ['Stationary Cycling', ['quadriceps', 'glutes', 'cardio']],
    timer: true,
    duration: 1200,
    setsLabel: '20 min (résistance légère-moyenne)',
  },
  'Vélo (cardio fin de séance)': {
    equip: 'Vélo',
    desc: '12 min sur le programme CAL 1 du Domyos EB900 (résistance moyenne-haute), en fin de séance. Cardio court sans impact ni appui au sol. Optionnel : désactivable dans les réglages.',
    caloriesPerSet: [198, 222],
    gf: ['Stationary Cycling', ['quadriceps', 'glutes', 'cardio']],
    timer: true,
    duration: 720,
    setsLabel: '12 min (prog. CAL 1)',
  },
};

// Exercices travaillant un côté à la fois : l'app enchaîne les deux côtés dans
// la MÊME série (marqueur « /côté »), ou en alternance pour les fentes.
const UNILATERAL = new Set([
  'Rowing haltère un bras',
  'Curl concentré haltère',
  'Kickback triceps haltère',
  'Fentes bulgares haltères',
  'Fentes avant alternées haltères',
  'Fentes arrière alternées haltères',
  'Montées sur banc lestées',
  'Soulevé de terre roumain unilatéral haltère',
  'Extension de hanche debout',
  'Crunch latéral debout (side bend)',
  'Relevés de genoux debout',
  'Woodchopper haltère',
]);

// ---------------------------------------------------------------------------
// Progression sur 4 semaines : la charge monte S1 → S3, S4 allège pour
// récupérer avant de reprendre le cycle.
// ---------------------------------------------------------------------------

const WEEKS = [
  {
    label: 'S1 Adaptation',
    main: { sets: '3 × 10 (tempo 3-1-1)', n: 3, rep: 10 },
    access: { sets: '3 × 12', n: 3, rep: 12 },
    core: { sets: '3 × 12', n: 3, rep: 12 },
    carry: { sets: '3 × 45 s', n: 3, rep: 0 },
  },
  {
    label: 'S2 Accumulation',
    main: { sets: '4 × 10 (tempo 3-1-1)', n: 4, rep: 10 },
    access: { sets: '3 × 12', n: 3, rep: 12 },
    core: { sets: '3 × 15', n: 3, rep: 15 },
    carry: { sets: '3 × 60 s', n: 3, rep: 0 },
  },
  {
    label: 'S3 Intensification',
    main: { sets: '4 × 8 (tempo lent, plus lourd)', n: 4, rep: 8 },
    access: { sets: '4 × 10', n: 4, rep: 10 },
    core: { sets: '3 × 15', n: 3, rep: 15 },
    carry: { sets: '3 × 60 s', n: 3, rep: 0 },
  },
  {
    label: 'S4 Allègement',
    main: { sets: '3 × 10 (allégé)', n: 3, rep: 10 },
    access: { sets: '3 × 12 (allégé)', n: 3, rep: 12 },
    core: { sets: '3 × 12', n: 3, rep: 12 },
    carry: { sets: '2 × 45 s', n: 2, rep: 0 },
  },
];

// ---------------------------------------------------------------------------
// La semaine : 5 séances mixtes (muscu + vélo) + 2 jours de repos.
// Chaque « slot » liste 4 variantes — une par semaine — pour le même schéma
// de mouvement : les exercices changent tout au long du mois.
// ---------------------------------------------------------------------------

const slot = (tier, variants) => ({ tier, variants });

const SESSIONS = [
  {
    day: 'Lundi',
    title: 'FULL BODY A (Poussée, Pectoraux, Épaules)',
    slots: [
      slot('main', ['Développé couché barre', 'Développé couché haltères', 'Développé incliné barre', 'Développé couché haltères']),
      slot('main', ['Squat gobelet haltère', 'Squat sumo haltère', 'Squat gobelet haltère', 'Squat gobelet haltère']),
      slot('access', ['Développé militaire barre', 'Développé Arnold haltères', 'Push press barre', 'Élévations latérales haltères']),
      slot('access', ['Extension triceps nuque haltère', 'Kickback triceps haltère', 'Extension triceps nuque haltère', 'Kickback triceps haltère']),
      slot('access', ['Écarté haltères sur banc', 'Élévations latérales haltères', 'Écarté haltères sur banc', 'Élévations frontales haltères']),
      slot('core', ['Relevés de genoux debout', 'Woodchopper haltère', 'Crunch latéral debout (side bend)', 'Relevés de genoux debout']),
    ],
  },
  {
    day: 'Mardi',
    title: 'FULL BODY B (Tirage, Dos, Biceps)',
    slots: [
      slot('main', ['Rowing haltères deux bras', 'Rowing barre buste penché', 'Rowing haltère un bras', 'Rowing haltères deux bras']),
      slot('main', ['Soulevé de terre surélevé (rack pull)', 'Soulevé de terre roumain (départ debout)', 'Soulevé de terre surélevé (rack pull)', 'Soulevé de terre roumain (départ debout)']),
      slot('access', ['Oiseau haltères (arrière épaule)', 'Tirage menton barre (upright row)', 'Oiseau haltères (arrière épaule)', 'Shrugs barre (haussements)']),
      slot('access', ['Curl biceps haltères', 'Curl marteau haltères', 'Curl concentré haltère', 'Curl biceps haltères']),
      slot('access', ['Shrugs barre (haussements)', 'Pullover haltère sur banc', 'Shrugs barre (haussements)', 'Curl marteau haltères']),
      slot('core', ['Woodchopper haltère', 'Crunch latéral debout (side bend)', 'Relevés de genoux debout', 'Woodchopper haltère']),
    ],
  },
  { day: 'Mercredi', rest: true },
  {
    day: 'Jeudi',
    title: 'FULL BODY C (Jambes, Fessiers)',
    slots: [
      slot('main', ['Squat barre', 'Fentes arrière alternées haltères', 'Squat barre', 'Squat gobelet haltère']),
      slot('main', ['Soulevé de terre roumain (départ debout)', 'Soulevé de terre roumain unilatéral haltère', 'Soulevé de terre surélevé (rack pull)', 'Soulevé de terre roumain (départ debout)']),
      slot('access', ['Montées sur banc lestées', 'Fentes bulgares haltères', 'Fentes avant alternées haltères', 'Montées sur banc lestées']),
      slot('access', ['Mollets debout lestés', 'Extension de hanche debout', 'Mollets debout lestés', 'Extension de hanche debout']),
      slot('access', ['Squat sumo haltère', 'Mollets debout lestés', 'Squat sumo haltère', 'Mollets debout lestés']),
      slot('core', ['Crunch latéral debout (side bend)', 'Relevés de genoux debout', 'Woodchopper haltère', 'Crunch latéral debout (side bend)']),
    ],
  },
  {
    day: 'Vendredi',
    title: 'FULL BODY D (Haut du corps complet)',
    slots: [
      slot('main', ['Développé incliné haltères', 'Développé incliné barre', 'Développé couché haltères', 'Écarté haltères sur banc']),
      slot('main', ['Rowing haltère un bras', 'Pullover haltère sur banc', 'Rowing barre buste penché', 'Rowing haltère un bras']),
      slot('access', ['Élévations latérales haltères', 'Élévations frontales haltères', 'Développé Arnold haltères', 'Élévations latérales haltères']),
      slot('access', ['Curl marteau haltères', 'Curl biceps haltères', 'Curl marteau haltères', 'Curl concentré haltère']),
      slot('access', ['Kickback triceps haltère', 'Extension triceps nuque haltère', 'Kickback triceps haltère', 'Extension triceps nuque haltère']),
      slot('core', ['Relevés de genoux debout', 'Woodchopper haltère', 'Crunch latéral debout (side bend)', 'Relevés de genoux debout']),
    ],
  },
  {
    day: 'Samedi',
    title: 'FULL BODY E (Gainage) + sortie vélo',
    longRide: true,
    slots: [
      slot('main', ['Fentes arrière alternées haltères', 'Squat sumo haltère', 'Fentes bulgares haltères', 'Squat gobelet haltère']),
      slot('access', ['Soulevé de terre roumain unilatéral haltère', 'Extension de hanche debout', 'Soulevé de terre roumain unilatéral haltère', 'Mollets debout lestés']),
      slot('carry', ['Marche du fermier (farmer carry)', 'Marche du fermier (farmer carry)', 'Marche du fermier (farmer carry)', 'Marche du fermier (farmer carry)']),
      slot('core', ['Crunch latéral debout (side bend)', 'Woodchopper haltère', 'Relevés de genoux debout', 'Woodchopper haltère']),
    ],
  },
  { day: 'Dimanche', rest: true },
];

// ---------------------------------------------------------------------------
// Construction du plan (28 jours = 4 semaines × 7 jours, index 0 = lundi).
// ---------------------------------------------------------------------------

/** Construit un exercice de vélo (bloc chronométré, identique chaque semaine). */
function buildBike(name) {
  const base = CATALOG[name];
  return {
    name,
    sets: base.setsLabel,
    equip: base.equip,
    desc: base.desc,
    caloriesPerSet: base.caloriesPerSet,
    totalSets: 1,
    nbRep: 0,
    timer: true,
    duration: base.duration,
    googleFitActivity: {
      type: 'strength_training',
      name: base.gf[0],
      muscleGroups: base.gf[1],
    },
  };
}

/** Applique le schéma de séries de la semaine à la variante retenue. */
function buildExercise(name, tier, week) {
  const base = CATALOG[name];
  if (!base) throw new Error(`Exercice absent du catalogue : ${name}`);

  const scheme = week[tier];
  // Les exercices unilatéraux enchaînent les deux côtés DANS la même série
  // (le marqueur « /côté » déclenche le passage automatique au second côté),
  // donc totalSets reste le nombre de séries affiché. Les exercices
  // « alternés » travaillent aussi les deux côtés, sans marqueur « /côté ».
  const side = UNILATERAL.has(name);
  const alternating = side && /altern/i.test(name);
  const suffix = side ? (alternating ? ' en alternance' : ' /côté') : '';

  const exercise = {
    name,
    sets: `${scheme.sets}${suffix}`,
    equip: base.equip,
    desc: base.desc,
    caloriesPerSet: base.caloriesPerSet,
    totalSets: scheme.n,
    nbRep: scheme.rep,
    googleFitActivity: {
      type: 'strength_training',
      name: base.gf[0],
      muscleGroups: base.gf[1],
    },
  };
  if (base.timer) {
    exercise.timer = true;
    exercise.duration = base.duration;
  }
  return exercise;
}

const plan = [];
WEEKS.forEach((week, weekIndex) => {
  SESSIONS.forEach((session, dayIndex) => {
    const dayNumber = weekIndex * 7 + dayIndex + 1;

    if (session.rest) {
      plan.push({
        title: `JOUR ${dayNumber}: REPOS (Récupération) — ${session.day}`,
        isRestDay: true,
        exercises: [],
      });
      return;
    }

    const exercises = [
      buildBike('Vélo — échauffement'),
      ...session.slots.map((s) => buildExercise(s.variants[weekIndex], s.tier, week)),
      buildBike(session.longRide ? 'Vélo — sortie longue' : 'Vélo (cardio fin de séance)'),
    ];

    plan.push({
      title: `JOUR ${dayNumber}: ${session.title} — ${session.day} · ${week.label}`,
      isRestDay: false,
      exercises,
    });
  });
});

// ---------------------------------------------------------------------------
// Estimation de durée — reprend le modèle de repos de StepWorkout.jsx
// (15 s + 5 s par série déjà faite, plafond 40 s ; 45 s entre exercices).
// ---------------------------------------------------------------------------

const SET_PAUSE_BASE = 15;
const SET_PAUSE_INCREMENT = 5;
const SET_PAUSE_MAX = 40;
const EXERCISE_PAUSE = 45;

/** Secondes de travail estimées pour une série (tempo lent = 5 s/rep, sinon 3 s).
 *  Une série « /côté » enchaîne les deux côtés : travail doublé + 3 s de bascule. */
function setWorkSeconds(exercise) {
  if (exercise.timer) return exercise.duration;
  const slow = /tempo/.test(exercise.sets);
  const perSide = exercise.nbRep * (slow ? 5 : 3);
  return exercise.sets.includes('/côté') ? perSide * 2 + 3 : perSide;
}

/** Minutes estimées pour une séance (vélo inclus ou non). */
function estimateMinutes(day, { withVelo = false } = {}) {
  let seconds = 0;
  const exercises = day.exercises.filter(
    (e) => withVelo || !e.name.toLowerCase().includes('vélo')
  );
  exercises.forEach((exercise, index) => {
    for (let set = 0; set < exercise.totalSets; set += 1) {
      seconds += setWorkSeconds(exercise);
      if (set < exercise.totalSets - 1) {
        seconds += Math.min(SET_PAUSE_BASE + set * SET_PAUSE_INCREMENT, SET_PAUSE_MAX);
      }
    }
    if (index < exercises.length - 1) seconds += EXERCISE_PAUSE;
  });
  return Math.round(seconds / 60);
}

// ---------------------------------------------------------------------------
// Écriture de src/data.js
// ---------------------------------------------------------------------------

const q = (s) => `'${String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;

function jsExercise(exercise) {
  const lines = [
    '      {',
    `        name: ${q(exercise.name)},`,
    `        sets: ${q(exercise.sets)},`,
    `        equip: ${q(exercise.equip)},`,
    `        desc: ${q(exercise.desc)},`,
    `        caloriesPerSet: [${exercise.caloriesPerSet.join(', ')}],`,
    `        totalSets: ${exercise.totalSets},`,
    `        nbRep: ${exercise.nbRep},`,
  ];
  if (exercise.timer) {
    lines.push('        timer: true,');
    lines.push(`        duration: ${exercise.duration},`);
  }
  lines.push(
    '        googleFitActivity: {',
    `          type: ${q(exercise.googleFitActivity.type)},`,
    `          name: ${q(exercise.googleFitActivity.name)},`,
    `          muscleGroups: [${exercise.googleFitActivity.muscleGroups.map(q).join(', ')}]`,
    '        }',
    '      },'
  );
  return lines.join('\n');
}

function renderDataJs() {
  const out = [
    '/**',
    ' * PROGRAMME PERTE DE POIDS — 28 jours = 4 semaines de 5 séances mixtes + 2 jours de repos.',
    ' * Lundi FULL BODY A (poussée) / Mardi FULL BODY B (tirage) / Jeudi FULL BODY C (jambes) /',
    ' * Vendredi FULL BODY D (haut du corps) / Samedi FULL BODY E (gainage) + sortie vélo longue.',
    ' * Mercredi et dimanche : récupération complète.',
    ' * Chaque séance mélange musculation et vélo (échauffement 8 min, bloc muscu, vélo de fin) :',
    ' * aucun bloc de vélo ne dépasse 20 min d\'affilée.',
    ' * Les exercices tournent sur les 4 semaines (une variante par semaine et par schéma de',
    ' * mouvement) ; la charge monte S1 → S3 puis S4 allège.',
    ' * Adapté : profil ~147 kg, 100% debout/banc (aucun appui au sol), ZÉRO saut (low-impact).',
    ' * Matériel : haltères 2×15 et 2×10 kg, barre 30 kg, veste lestée 10 kg, poids chevilles',
    ' * 2×4 + 2×2 kg, vélo Domyos EB900.',
    ' * Généré par scripts/gen-plan.mjs — ne pas éditer à la main.',
    ' */',
    'const fullPlan = [',
  ];
  plan.forEach((day) => {
    out.push('  {');
    out.push(`    title: ${q(day.title)},`);
    out.push(`    isRestDay: ${day.isRestDay},`);
    out.push('    exercises: [');
    day.exercises.forEach((exercise) => out.push(jsExercise(exercise)));
    out.push('    ],');
    out.push('  },');
  });
  out.push('];', '', 'export const days = fullPlan;', '');
  return out.join('\n');
}

// ---------------------------------------------------------------------------
// Écriture du fichier Dart (jours d'entraînement uniquement : le modèle
// Flutter WorkoutDay n'a pas de notion de jour de repos).
// ---------------------------------------------------------------------------

const dq = (s) => `"${String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\$/g, '\\$')}"`;

function dartExercise(exercise) {
  const lines = [
    '        Exercise(',
    `          name: ${dq(exercise.name)},`,
    `          sets: ${dq(exercise.sets)},`,
    `          equip: ${dq(exercise.equip)},`,
    `          desc: ${dq(exercise.desc)},`,
    `          caloriesPerSet: [${exercise.caloriesPerSet.join(', ')}],`,
    `          totalSets: ${exercise.totalSets},`,
    `          nbRep: ${exercise.nbRep},`,
  ];
  if (exercise.timer) {
    lines.push('          timer: true,');
    lines.push(`          duration: ${exercise.duration},`);
  }
  lines.push(
    '          googleFitActivity: GoogleFitActivity(',
    `            type: ${dq(exercise.googleFitActivity.type)},`,
    `            name: ${dq(exercise.googleFitActivity.name)},`,
    `            muscleGroups: [${exercise.googleFitActivity.muscleGroups.map(dq).join(', ')}],`,
    '          ),',
    '        ),'
  );
  return lines.join('\n');
}

function renderDart() {
  const trainingDays = plan.filter((day) => !day.isRestDay);
  const out = [
    "import '../models/workout_model.dart';",
    '',
    '/// Programme perte de poids — 4 semaines de 5 séances mixtes (muscu + vélo)',
    '/// et 2 jours de repos. Les exercices tournent d\'une semaine à l\'autre.',
    '/// Low-impact, 100% debout ou sur banc.',
    '/// Généré par scripts/gen-plan.mjs — ne pas éditer à la main.',
    'class DefaultWorkoutData {',
    '  static WorkoutPlan get defaultWorkoutPlan {',
    '    return WorkoutPlan(',
    '      days: [',
  ];
  trainingDays.forEach((_, index) => out.push(`        _createDay${index + 1}(),`));
  out.push('      ],', '    );', '  }', '');

  trainingDays.forEach((day, index) => {
    out.push(`  static WorkoutDay _createDay${index + 1}() {`);
    out.push('    return WorkoutDay(');
    out.push(`      title: ${dq(day.title)},`);
    out.push('      exercises: [');
    day.exercises.forEach((exercise) => out.push(dartExercise(exercise)));
    out.push('      ],');
    out.push('    );');
    out.push('  }');
    out.push('');
  });

  out.push('}', '');
  return out.join('\n');
}

writeFileSync(join(ROOT, 'src', 'data.js'), renderDataJs(), 'utf8');
writeFileSync(
  join(ROOT, 'projectfatloss_flutter', 'lib', 'shared', 'data', 'default_workout_data.dart'),
  renderDart(),
  'utf8'
);

// Récapitulatif : durée estimée par séance.
console.log('Jours générés :', plan.length);
plan.forEach((day) => {
  if (day.isRestDay) {
    console.log(`    repos — ${day.title}`);
    return;
  }
  const lifting = estimateMinutes(day);
  const total = estimateMinutes(day, { withVelo: true });
  console.log(
    `  ${String(lifting).padStart(3)} min muscu (total avec vélo ${String(total).padStart(2)} min) — ${day.title}`
  );
});
