/**
 * Générateur du programme d'entraînement (source unique).
 *
 * Écrit :
 *   - src/data.js                                          (application web)
 *   - projectfatloss_flutter/lib/shared/data/default_workout_data.dart (application Flutter)
 *
 * Programme : 28 jours = 4 semaines, 6 séances intenses par semaine et le
 * dimanche en repos, en alternant les groupes musculaires pour ne pas
 * retravailler les mêmes muscles deux jours de suite :
 *   Lundi    : BAS DU CORPS A (squat, fessiers, mollets)
 *   Mardi    : HAUT DU CORPS A (poussée : pectoraux, épaules, triceps)
 *   Mercredi : CIRCUIT CORPS ENTIER (charges légères, enchaîné)
 *   Jeudi    : BAS DU CORPS B (fentes, ischios, fessiers)
 *   Vendredi : HAUT DU CORPS B (tirage : dos, biceps)
 *   Samedi   : FULL BODY FONCTIONNEL (jambes + poussée + port de charge)
 *   Dimanche : REPOS
 *
 * Intensité : chaque séance dépasse 400 kcal (estimation de l'app,
 * CalorieEstimator, à 147 kg) : 4 séries sur les mouvements principaux et un
 * « finisher » en fin de séance (thrusters ou complexe aux haltères, sans
 * saut). La semaine 4 allège les charges, pas le volume.
 *
 * Vélo : 20 min chaque jour, dans la check-list de l'accueil (hors séance
 * guidée).
 *
 * Les exercices tournent sur les 4 semaines : chaque schéma de mouvement
 * (poussée horizontale, tirage, hinge, fentes…) a une variante différente par
 * semaine, avec une montée en charge S1 → S3 puis un allègement en S4.
 *
 * Objectif : perte de poids durable (profil 147 kg pour 1,78 m, IMC ~46) —
 * low-impact, zéro saut, debout ou sur banc ; au sol, seulement des crunchs.
 * Matériel : haltères 2×15 et 2×10 kg, barre 30 kg, veste lestée 10 kg, poids
 * chevilles 2×4 + 2×2 kg, tapis de sol, vélo d'appartement.
 *
 * Usage : node scripts/gen-plan.mjs
 */

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// ---------------------------------------------------------------------------
// Catalogue d'exercices : debout ou sur banc, zéro saut. Seul exercice au sol :
// les crunchs (sur tapis).
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

  // --- Finishers : intensité sans saut (MET 8, CalorieEstimator) ---
  'Thruster haltères': {
    equip: 'Haltères 2×10 kg',
    desc: 'Haltères à hauteur d\'épaules, descendez en squat jusqu\'à frôler le banc derrière vous, puis remontez en poussant les haltères au-dessus de la tête d\'un seul élan. Pieds au sol, sans saut ; soufflez en poussant.',
    caloriesPerSet: [29, 33],
    gf: ['Dumbbell Thruster', ['quadriceps', 'glutes', 'shoulders']],
  },
  'Complexe haltères (soulevé, rowing, développé)': {
    equip: 'Haltères 2×10 kg',
    desc: 'Sans poser les haltères : 1 soulevé de terre roumain, 1 rowing buste penché, 1 développé au-dessus de la tête = 1 répétition. Dos droit, rythme régulier, sans saut.',
    caloriesPerSet: [29, 33],
    gf: ['Dumbbell Complex', ['hamstrings', 'back', 'shoulders']],
  },

  // --- Au sol (le seul) ---
  Crunchs: {
    equip: 'Tapis de sol',
    desc: 'Allongé sur le dos, genoux fléchis, pieds au sol : enroulez le haut du dos vers les genoux sans tirer sur la nuque, puis redescendez lentement. Pour vous allonger et vous relever, passez par le côté, sans à-coup.',
    caloriesPerSet: [10, 12],
    gf: ['Crunch', ['abdominals']],
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
// Progression sur 4 semaines : la charge monte S1 → S3, S4 allège les charges
// (pas le volume) pour récupérer avant de reprendre le cycle. 4 séries sur les
// mouvements principaux, 3 sur les accessoires, repos courts. `circuit` sert
// au circuit du mercredi (charges légères, enchaîné), `finisher` au bloc
// intense de fin de séance.
// ---------------------------------------------------------------------------

const WEEKS = [
  {
    label: 'S1 Adaptation',
    main: { sets: '4 × 12 (tempo 3-1-1)', n: 4, rep: 12 },
    access: { sets: '3 × 12', n: 3, rep: 12 },
    core: { sets: '2 × 15', n: 2, rep: 15 },
    carry: { sets: '3 × 45 s', n: 3, rep: 0 },
    circuit: { sets: '4 × 12 (léger, enchaîné)', n: 4, rep: 12 },
    finisher: { sets: '3 × 10 (enchaîné, léger)', n: 3, rep: 10 },
  },
  {
    label: 'S2 Accumulation',
    main: { sets: '4 × 12 (tempo 3-1-1)', n: 4, rep: 12 },
    access: { sets: '3 × 15', n: 3, rep: 15 },
    core: { sets: '3 × 15', n: 3, rep: 15 },
    carry: { sets: '3 × 45 s', n: 3, rep: 0 },
    circuit: { sets: '4 × 15 (léger, enchaîné)', n: 4, rep: 15 },
    finisher: { sets: '3 × 12 (enchaîné)', n: 3, rep: 12 },
  },
  {
    label: 'S3 Intensification',
    main: { sets: '4 × 10 (tempo lent, plus lourd)', n: 4, rep: 10 },
    access: { sets: '3 × 12', n: 3, rep: 12 },
    core: { sets: '3 × 15', n: 3, rep: 15 },
    carry: { sets: '3 × 60 s', n: 3, rep: 0 },
    circuit: { sets: '4 × 15 (léger, enchaîné)', n: 4, rep: 15 },
    finisher: { sets: '4 × 12 (enchaîné)', n: 4, rep: 12 },
  },
  {
    label: 'S4 Allègement',
    main: { sets: '4 × 12 (charges allégées)', n: 4, rep: 12 },
    access: { sets: '3 × 12 (charges allégées)', n: 3, rep: 12 },
    core: { sets: '2 × 15', n: 2, rep: 15 },
    carry: { sets: '3 × 45 s', n: 3, rep: 0 },
    circuit: { sets: '4 × 12 (léger, enchaîné)', n: 4, rep: 12 },
    finisher: { sets: '3 × 10 (enchaîné, léger)', n: 3, rep: 10 },
  },
];

// ---------------------------------------------------------------------------
// La semaine : six séances, dimanche en repos (le vélo de 20 min est dans la
// check-list du jour, hors séance guidée). Bas et haut du corps alternent ; le
// circuit du mercredi et le full body du samedi restent légers sur les muscles
// travaillés la veille ou le lendemain. Chaque séance finit par un finisher.
// Chaque « slot » liste 4 variantes — une par semaine — pour le même schéma
// de mouvement : les exercices changent tout au long du mois.
// ---------------------------------------------------------------------------

const slot = (tier, variants) => ({ tier, variants });

const SESSIONS = [
  {
    day: 'Lundi',
    title: 'BAS DU CORPS A (Squat, Fessiers, Mollets)',
    slots: [
      slot('main', ['Squat gobelet haltère', 'Squat barre', 'Squat gobelet haltère', 'Squat sumo haltère']),
      slot('main', ['Soulevé de terre roumain (départ debout)', 'Soulevé de terre surélevé (rack pull)', 'Soulevé de terre roumain (départ debout)', 'Soulevé de terre surélevé (rack pull)']),
      slot('access', ['Montées sur banc lestées', 'Fentes arrière alternées haltères', 'Montées sur banc lestées', 'Fentes avant alternées haltères']),
      slot('access', ['Extension de hanche debout', 'Squat sumo haltère', 'Extension de hanche debout', 'Squat gobelet haltère']),
      slot('access', ['Mollets debout lestés', 'Mollets debout lestés', 'Mollets debout lestés', 'Mollets debout lestés']),
      slot('core', ['Crunchs', 'Woodchopper haltère', 'Crunchs', 'Relevés de genoux debout']),
      slot('finisher', ['Complexe haltères (soulevé, rowing, développé)', 'Complexe haltères (soulevé, rowing, développé)', 'Complexe haltères (soulevé, rowing, développé)', 'Complexe haltères (soulevé, rowing, développé)']),
    ],
  },
  {
    day: 'Mardi',
    title: 'HAUT DU CORPS A (Poussée, Pectoraux, Épaules, Triceps)',
    slots: [
      slot('main', ['Développé couché haltères', 'Développé couché barre', 'Développé incliné haltères', 'Développé couché haltères']),
      slot('main', ['Développé militaire barre', 'Développé Arnold haltères', 'Push press barre', 'Développé Arnold haltères']),
      slot('access', ['Écarté haltères sur banc', 'Développé incliné haltères', 'Écarté haltères sur banc', 'Développé incliné barre']),
      slot('access', ['Élévations latérales haltères', 'Élévations frontales haltères', 'Élévations latérales haltères', 'Élévations frontales haltères']),
      slot('access', ['Extension triceps nuque haltère', 'Kickback triceps haltère', 'Extension triceps nuque haltère', 'Kickback triceps haltère']),
      slot('core', ['Crunch latéral debout (side bend)', 'Crunchs', 'Woodchopper haltère', 'Crunchs']),
      slot('finisher', ['Thruster haltères', 'Thruster haltères', 'Thruster haltères', 'Thruster haltères']),
    ],
  },
  {
    day: 'Mercredi',
    title: 'CIRCUIT CORPS ENTIER (Charges légères, enchaîné)',
    slots: [
      slot('circuit', ['Squat gobelet haltère', 'Squat sumo haltère', 'Squat gobelet haltère', 'Squat sumo haltère']),
      slot('circuit', ['Rowing haltères deux bras', 'Rowing haltère un bras', 'Rowing haltères deux bras', 'Rowing barre buste penché']),
      slot('circuit', ['Pullover haltère sur banc', 'Oiseau haltères (arrière épaule)', 'Pullover haltère sur banc', 'Oiseau haltères (arrière épaule)']),
      slot('circuit', ['Curl marteau haltères', 'Curl biceps haltères', 'Curl marteau haltères', 'Curl biceps haltères']),
      slot('circuit', ['Woodchopper haltère', 'Relevés de genoux debout', 'Woodchopper haltère', 'Relevés de genoux debout']),
      slot('carry', ['Marche du fermier (farmer carry)', 'Marche du fermier (farmer carry)', 'Marche du fermier (farmer carry)', 'Marche du fermier (farmer carry)']),
      slot('finisher', ['Thruster haltères', 'Complexe haltères (soulevé, rowing, développé)', 'Thruster haltères', 'Complexe haltères (soulevé, rowing, développé)']),
    ],
  },
  {
    day: 'Jeudi',
    title: 'BAS DU CORPS B (Fentes, Ischios, Fessiers)',
    slots: [
      slot('main', ['Fentes arrière alternées haltères', 'Fentes bulgares haltères', 'Fentes arrière alternées haltères', 'Fentes bulgares haltères']),
      slot('main', ['Soulevé de terre surélevé (rack pull)', 'Soulevé de terre roumain (départ debout)', 'Soulevé de terre surélevé (rack pull)', 'Soulevé de terre roumain (départ debout)']),
      slot('access', ['Soulevé de terre roumain unilatéral haltère', 'Extension de hanche debout', 'Soulevé de terre roumain unilatéral haltère', 'Extension de hanche debout']),
      slot('access', ['Squat sumo haltère', 'Montées sur banc lestées', 'Squat sumo haltère', 'Montées sur banc lestées']),
      slot('access', ['Mollets debout lestés', 'Mollets debout lestés', 'Mollets debout lestés', 'Mollets debout lestés']),
      slot('core', ['Crunchs', 'Crunch latéral debout (side bend)', 'Crunchs', 'Woodchopper haltère']),
      slot('finisher', ['Thruster haltères', 'Thruster haltères', 'Thruster haltères', 'Thruster haltères']),
    ],
  },
  {
    day: 'Vendredi',
    title: 'HAUT DU CORPS B (Tirage, Dos, Biceps)',
    slots: [
      slot('main', ['Rowing barre buste penché', 'Rowing haltères deux bras', 'Rowing haltère un bras', 'Rowing barre buste penché']),
      slot('main', ['Rowing haltère un bras', 'Pullover haltère sur banc', 'Rowing haltères deux bras', 'Pullover haltère sur banc']),
      slot('access', ['Oiseau haltères (arrière épaule)', 'Tirage menton barre (upright row)', 'Oiseau haltères (arrière épaule)', 'Shrugs barre (haussements)']),
      slot('access', ['Curl biceps haltères', 'Curl marteau haltères', 'Curl concentré haltère', 'Curl biceps haltères']),
      slot('access', ['Shrugs barre (haussements)', 'Oiseau haltères (arrière épaule)', 'Shrugs barre (haussements)', 'Oiseau haltères (arrière épaule)']),
      slot('core', ['Relevés de genoux debout', 'Crunchs', 'Woodchopper haltère', 'Crunchs']),
      slot('finisher', ['Thruster haltères', 'Thruster haltères', 'Thruster haltères', 'Thruster haltères']),
    ],
  },
  {
    day: 'Samedi',
    title: 'FULL BODY FONCTIONNEL (Jambes, Poussée, Port de charge)',
    slots: [
      slot('main', ['Squat sumo haltère', 'Fentes avant alternées haltères', 'Squat gobelet haltère', 'Fentes arrière alternées haltères']),
      slot('main', ['Développé incliné haltères', 'Développé couché haltères', 'Développé incliné barre', 'Développé couché haltères']),
      slot('access', ['Développé Arnold haltères', 'Élévations latérales haltères', 'Développé militaire barre', 'Élévations latérales haltères']),
      slot('access', ['Montées sur banc lestées', 'Extension de hanche debout', 'Montées sur banc lestées', 'Extension de hanche debout']),
      slot('carry', ['Marche du fermier (farmer carry)', 'Marche du fermier (farmer carry)', 'Marche du fermier (farmer carry)', 'Marche du fermier (farmer carry)']),
      slot('core', ['Woodchopper haltère', 'Crunchs', 'Relevés de genoux debout', 'Crunchs']),
      slot('finisher', ['Complexe haltères (soulevé, rowing, développé)', 'Complexe haltères (soulevé, rowing, développé)', 'Complexe haltères (soulevé, rowing, développé)', 'Complexe haltères (soulevé, rowing, développé)']),
    ],
  },
  { day: 'Dimanche', rest: true },
];

// ---------------------------------------------------------------------------
// Construction du plan (28 jours = 4 semaines × 7 jours, index 0 = lundi).
// ---------------------------------------------------------------------------

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

    const exercises = session.slots.map(
      (s) => buildExercise(s.variants[weekIndex], s.tier, week)
    );

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

/** Minutes estimées pour une séance. */
function estimateMinutes(day) {
  let seconds = 0;
  const exercises = day.exercises;
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
    ' * PROGRAMME PERTE DE POIDS — 28 jours = 4 semaines, 6 séances par semaine (≥ 400 kcal), dimanche repos.',
    ' * Lundi BAS DU CORPS A / Mardi HAUT DU CORPS A (poussée) / Mercredi CIRCUIT CORPS ENTIER /',
    ' * Jeudi BAS DU CORPS B / Vendredi HAUT DU CORPS B (tirage) / Samedi FULL BODY FONCTIONNEL /',
    ' * Dimanche REPOS. Chaque séance finit par un finisher (thrusters ou complexe aux haltères).',
    ' * Vélo : 20 min chaque jour, dans la check-list du jour de l\'accueil.',
    ' * Les exercices tournent sur les 4 semaines (une variante par semaine et par schéma de',
    ' * mouvement) ; la charge monte S1 → S3 puis S4 allège les charges.',
    ' * Adapté : profil 147 kg pour 1,78 m, debout/banc (au sol : seulement des crunchs), ZÉRO saut (low-impact).',
    ' * Matériel : haltères 2×15 et 2×10 kg, barre 30 kg, veste lestée 10 kg, poids chevilles',
    ' * 2×4 + 2×2 kg, tapis de sol, vélo d\'appartement.',
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
    '/// Programme perte de poids — 4 semaines, 6 séances par semaine et dimanche repos',
    '/// (bas et haut du corps en alternance). Les exercices tournent d\'une semaine à l\'autre.',
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
  console.log(`  ${String(estimateMinutes(day)).padStart(3)} min muscu — ${day.title}`);
});
