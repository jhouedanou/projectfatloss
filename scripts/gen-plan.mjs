/**
 * Générateur du programme d'entraînement (source unique).
 *
 * Écrit :
 *   - src/data.js                                          (application web)
 *   - projectfatloss_flutter/lib/shared/data/default_workout_data.dart (application Flutter)
 *
 * Programme : musculation 7 jours / 7, objectif ~60 min de musculation par jour.
 * Split Push A / Pull A / Legs A / Push B / Pull B / Legs B / Full body.
 * 4 semaines : Adaptation -> Accumulation -> Intensification -> Allègement (deload actif).
 * Aucun jour de marche, aucun jour de repos complet.
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
  // --- Push A ---
  'Développé couché barre': {
    equip: 'Barre 30 kg',
    desc: 'Sur banc, descendez la barre vers la poitrine puis poussez, tempo contrôlé. Pectoraux. (Le banc est surélevé : pas d\'appui au sol.)',
    caloriesPerSet: [21, 24],
    gf: ['Barbell Bench Press', ['chest', 'triceps', 'shoulders']],
  },
  'Développé militaire barre': {
    equip: 'Barre 30 kg',
    desc: 'Debout, gainé, poussez la barre au-dessus de la tête sans cambrer. Épaules complètes. 100% debout.',
    caloriesPerSet: [21, 24],
    gf: ['Military Press', ['shoulders', 'triceps']],
  },
  'Développé incliné haltères': {
    equip: 'Haltères 15 kg',
    desc: 'Banc incliné, poussez les haltères vers le haut en contrôlant la descente. Haut des pectoraux.',
    caloriesPerSet: [21, 24],
    gf: ['Incline Dumbbell Press', ['chest', 'shoulders', 'triceps']],
  },
  'Élévations latérales haltères': {
    equip: 'Haltères 10 kg',
    desc: 'Debout, montez les haltères latéralement jusqu\'aux épaules. Deltoïde moyen.',
    caloriesPerSet: [12, 14],
    gf: ['Lateral Raises', ['shoulders']],
  },
  'Extension triceps nuque haltère': {
    equip: 'Haltères 10 kg',
    desc: 'Debout ou assis, haltère derrière la nuque à deux mains, tendez les bras vers le haut. Triceps.',
    caloriesPerSet: [16, 18],
    gf: ['Overhead Triceps Extension', ['triceps']],
  },

  // --- Pull A ---
  'Rowing barre buste penché': {
    equip: 'Barre 30 kg',
    desc: 'Buste penché 45°, dos droit, tirez la barre vers le bas du ventre. Épaisseur du dos. Debout.',
    caloriesPerSet: [21, 24],
    gf: ['Bent Over Barbell Row', ['back', 'biceps']],
  },
  'Soulevé de terre surélevé (rack pull)': {
    equip: 'Barre 30 kg',
    desc: 'Barre posée à hauteur des genoux (cales/support), dos droit, tirez en poussant les hanches. JAMAIS depuis le sol : préserve le dos et contourne la gêne du buste.',
    caloriesPerSet: [21, 24],
    gf: ['Rack Pull', ['back', 'glutes', 'hamstrings']],
  },
  'Rowing haltère un bras': {
    equip: 'Haltère 15 kg',
    desc: 'Un genou et une main sur le banc, tirez l\'haltère vers la hanche, coude près du corps. Appui sur banc, pas au sol.',
    caloriesPerSet: [21, 24],
    gf: ['One Arm Dumbbell Row', ['back', 'biceps']],
  },
  'Curl biceps haltères': {
    equip: 'Haltères 15 kg',
    desc: 'Debout, fléchissez les coudes pour monter les haltères vers les épaules sans balancer. Biceps.',
    caloriesPerSet: [12, 14],
    gf: ['Dumbbell Curl', ['biceps']],
  },
  'Oiseau haltères (arrière épaule)': {
    equip: 'Haltères 10 kg',
    desc: 'Buste penché ou assis penché, montez les haltères sur les côtés en serrant les omoplates. Arrière de l\'épaule — corrige la posture.',
    caloriesPerSet: [12, 14],
    gf: ['Rear Delt Raise', ['shoulders', 'back']],
  },

  // --- Legs A ---
  'Squat barre': {
    equip: 'Barre 30 kg',
    desc: 'Barre sur les trapèzes, descendez hanches sous parallèle si mobilité OK, puis remontez. Quadriceps, fessiers. Debout.',
    caloriesPerSet: [21, 24],
    gf: ['Barbell Squat', ['quadriceps', 'glutes', 'hamstrings']],
  },
  'Fentes avant alternées haltères': {
    equip: 'Haltères 15 kg',
    desc: 'Un pas en avant, descendez le genou arrière vers le sol sans le poser, puis remontez. Alternez. Quadriceps, fessiers, équilibre.',
    caloriesPerSet: [21, 24],
    gf: ['Walking Lunges', ['quadriceps', 'glutes']],
  },
  'Fentes bulgares haltères': {
    equip: 'Haltères 15 kg',
    desc: 'Pied arrière surélevé sur le banc, descendez sur la jambe avant. Très efficace quadriceps et fessiers. Debout, zéro impact.',
    caloriesPerSet: [21, 24],
    gf: ['Bulgarian Split Squat', ['quadriceps', 'glutes']],
  },
  'Montées sur banc lestées': {
    equip: 'Haltères 15 kg',
    desc: 'Montez complètement sur un banc/marche stable, jambe motrice, contrôlez la descente. Alternez. Bas du corps fonctionnel, zéro impact.',
    caloriesPerSet: [16, 18],
    gf: ['Weighted Step-ups', ['quadriceps', 'glutes']],
  },
  'Squat sumo haltère': {
    equip: 'Haltère 15 kg',
    desc: 'Pieds très écartés, pointes vers l\'extérieur, haltère tenu entre les jambes. Adducteurs + fessiers. Debout.',
    caloriesPerSet: [21, 24],
    gf: ['Sumo Squat', ['glutes', 'adductors', 'quadriceps']],
  },

  // --- Push B ---
  'Développé Arnold haltères': {
    equip: 'Haltères 15 kg',
    desc: 'Assis sur banc, paumes vers vous, tournez les poignets en poussant vers le haut. Tous les faisceaux de l\'épaule.',
    caloriesPerSet: [21, 24],
    gf: ['Arnold Press', ['shoulders', 'triceps']],
  },
  'Développé incliné barre': {
    equip: 'Barre 30 kg',
    desc: 'Banc incliné 30-45°, poussez la barre vers le haut. Haut des pectoraux et épaules.',
    caloriesPerSet: [21, 24],
    gf: ['Incline Barbell Press', ['chest', 'shoulders', 'triceps']],
  },
  'Push press barre': {
    equip: 'Barre 30 kg',
    desc: 'Debout, légère impulsion des jambes puis poussez la barre au-dessus de la tête. Épaules + puissance, zéro impact.',
    caloriesPerSet: [21, 24],
    gf: ['Push Press', ['shoulders', 'triceps']],
  },
  'Élévations frontales haltères': {
    equip: 'Haltères 10 kg',
    desc: 'Debout, montez les haltères devant vous jusqu\'aux épaules. Deltoïde antérieur.',
    caloriesPerSet: [12, 14],
    gf: ['Front Raises', ['shoulders']],
  },

  // --- Pull B ---
  'Soulevé de terre roumain (départ debout)': {
    equip: 'Barre 30 kg',
    desc: 'Départ debout barre en mains, poussez les hanches en arrière et descendez la barre le long des cuisses, dos droit, sans poser au sol. Ischios + fessiers + lombaires.',
    caloriesPerSet: [21, 24],
    gf: ['Romanian Deadlift', ['hamstrings', 'glutes', 'back']],
  },
  'Rowing haltères deux bras': {
    equip: 'Haltères 15 kg',
    desc: 'Buste penché, tirez les deux haltères vers les hanches en serrant les omoplates. Dos complet. Debout.',
    caloriesPerSet: [21, 24],
    gf: ['Two Arm Dumbbell Row', ['back', 'biceps']],
  },
  'Pullover haltère sur banc': {
    equip: 'Haltère 15 kg',
    desc: 'Allongé en travers du banc, descendez l\'haltère derrière la tête bras tendus puis remontez. Grand dorsal. Sur banc.',
    caloriesPerSet: [16, 18],
    gf: ['Dumbbell Pullover', ['back', 'chest']],
  },
  'Shrugs barre (haussements)': {
    equip: 'Barre 30 kg',
    desc: 'Debout, barre devant, haussez les épaules vers les oreilles sans plier les bras. Trapèzes.',
    caloriesPerSet: [16, 18],
    gf: ['Barbell Shrugs', ['trapezius', 'back']],
  },
  'Curl concentré haltère': {
    equip: 'Haltère 15 kg',
    desc: 'Assis sur banc, coude calé contre la cuisse, fléchissez le bras lentement. Isolation du biceps.',
    caloriesPerSet: [12, 14],
    gf: ['Concentration Curl', ['biceps']],
  },

  // --- Legs B (chaîne postérieure, mollets) ---
  'Squat gobelet haltère': {
    equip: 'Haltère 15 kg',
    desc: 'Debout, haltère tenu verticalement contre la poitrine, descendez en squat buste droit puis remontez. Quadriceps, fessiers, gainage. Debout.',
    caloriesPerSet: [21, 24],
    gf: ['Goblet Squat', ['quadriceps', 'glutes', 'core']],
  },
  'Fentes arrière alternées haltères': {
    equip: 'Haltères 15 kg',
    desc: 'Un pas en arrière, descendez le genou arrière sans le poser, puis revenez debout. Alternez. Fessiers et ischios, plus doux pour les genoux que la fente avant.',
    caloriesPerSet: [21, 24],
    gf: ['Reverse Lunges', ['glutes', 'hamstrings', 'quadriceps']],
  },
  'Soulevé de terre roumain unilatéral haltère': {
    equip: 'Haltère 15 kg',
    desc: 'Debout sur une jambe (main libre en appui léger si besoin), poussez la hanche en arrière et descendez l\'haltère le long de la jambe d\'appui, dos droit. Ischios, fessiers, équilibre.',
    caloriesPerSet: [21, 24],
    gf: ['Single Leg Romanian Deadlift', ['hamstrings', 'glutes', 'core']],
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

  // --- Full body (bras, épaules, gainage) ---
  'Développé couché haltères': {
    equip: 'Haltères 15 kg',
    desc: 'Sur banc plat, poussez les haltères vers le haut en contrôlant la descente, amplitude complète. Pectoraux, triceps.',
    caloriesPerSet: [21, 24],
    gf: ['Dumbbell Bench Press', ['chest', 'triceps', 'shoulders']],
  },
  'Tirage menton barre (upright row)': {
    equip: 'Barre 30 kg',
    desc: 'Debout, barre devant les cuisses, tirez-la vers le menton coudes hauts, sans monter au-delà des épaules. Trapèzes et deltoïdes.',
    caloriesPerSet: [21, 24],
    gf: ['Upright Row', ['shoulders', 'trapezius']],
  },
  'Curl marteau haltères': {
    equip: 'Haltères 15 kg',
    desc: 'Debout, paumes face à face, fléchissez les coudes sans balancer le buste. Biceps et brachial (épaisseur du bras).',
    caloriesPerSet: [16, 18],
    gf: ['Hammer Curl', ['biceps', 'forearms']],
  },
  'Kickback triceps haltère': {
    equip: 'Haltère 10 kg',
    desc: 'Buste penché, coude collé au corps et fixe, tendez l\'avant-bras vers l\'arrière puis revenez. Isolation triceps.',
    caloriesPerSet: [12, 14],
    gf: ['Triceps Kickback', ['triceps']],
  },
  'Écarté haltères sur banc': {
    equip: 'Haltères 10 kg',
    desc: 'Sur banc, bras légèrement fléchis, ouvrez les haltères en arc de cercle puis refermez au-dessus de la poitrine. Étirement des pectoraux.',
    caloriesPerSet: [16, 18],
    gf: ['Dumbbell Fly', ['chest', 'shoulders']],
  },

  // --- Gainage debout (commun) ---
  'Crunch latéral debout (side bend)': {
    equip: 'Haltère 15 kg',
    desc: 'Debout, un haltère d\'un côté, inclinez le buste latéralement puis redressez en contractant l\'oblique. Debout, aucun appui au sol.',
    caloriesPerSet: [13, 15],
    gf: ['Standing Side Bend', ['obliques', 'abdominals']],
  },
  'Relevés de genoux debout': {
    equip: 'Poids chevilles 4 kg',
    desc: 'Debout en appui léger, montez le genou vers la poitrine en contractant les abdos, alternez. Abdos bas, 100% debout.',
    caloriesPerSet: [16, 18],
    gf: ['Standing Knee Raises', ['abdominals', 'core']],
  },
  'Woodchopper haltère': {
    equip: 'Haltère 10 kg',
    desc: 'Debout, amenez l\'haltère en diagonale de la hanche basse vers l\'épaule opposée puis inversez. Rotation du tronc, debout.',
    caloriesPerSet: [16, 18],
    gf: ['Dumbbell Woodchopper', ['obliques', 'abdominals', 'core']],
  },
  'Marche du fermier (farmer carry)': {
    equip: 'Haltères 15 kg',
    desc: 'Un haltère lourd dans chaque main, marchez 60 s tronc gainé et droit, épaules basses. Anti-flexion, core et grip, debout.',
    caloriesPerSet: [11, 12],
    gf: ['Farmer Carry', ['core', 'forearms', 'trapezius']],
    timer: true,
    duration: 60,
  },

  // --- Cardio optionnel de fin de séance ---
  'Vélo (cardio fin de séance)': {
    equip: 'Vélo',
    desc: '10 min sur le programme CAL 1 du Domyos EB900 (résistance élevée), en fin de séance. Cardio court et intense à haute résistance qui remplace le HIIT, sans impact ni appui au sol. Optionnel : désactivable dans les réglages, la musculation seule fait déjà l\'heure.',
    caloriesPerSet: [165, 185],
    gf: ['Stationary Cycling', ['quadriceps', 'glutes', 'cardio']],
    timer: true,
    duration: 600,
  },
};

// ---------------------------------------------------------------------------
// Progression sur 4 semaines, par famille d'exercices.
// ---------------------------------------------------------------------------

const WEEKS = [
  {
    label: 'S1 Adaptation',
    main: { sets: '4 × 12 (tempo 3-1-1)', n: 4, rep: 12 },
    access: { sets: '4 × 15', n: 4, rep: 15 },
    core: { sets: '4 × 15', n: 4, rep: 15 },
    carry: { sets: '4 × 60 s', n: 4, rep: 0 },
  },
  {
    label: 'S2 Accumulation',
    main: { sets: '5 × 12-15', n: 5, rep: 12 },
    access: { sets: '4 × 15', n: 4, rep: 15 },
    core: { sets: '4 × 18', n: 4, rep: 18 },
    carry: { sets: '4 × 60 s', n: 4, rep: 0 },
  },
  {
    label: 'S3 Intensification',
    main: { sets: '5 × 10-12 (tempo lent)', n: 5, rep: 10 },
    access: { sets: '4 × 12-15', n: 4, rep: 12 },
    core: { sets: '4 × 20', n: 4, rep: 20 },
    carry: { sets: '4 × 60 s', n: 4, rep: 0 },
  },
  {
    label: 'S4 Allègement (deload actif)',
    main: { sets: '3 × 12 (allégé)', n: 3, rep: 12 },
    access: { sets: '3 × 15 (allégé)', n: 3, rep: 15 },
    core: { sets: '3 × 15', n: 3, rep: 15 },
    carry: { sets: '3 × 60 s', n: 3, rep: 0 },
  },
];

// ---------------------------------------------------------------------------
// Les 7 séances de la semaine — musculation tous les jours, ~60 min chacune.
// tier : main | access | core | carry. side:true => série par côté (x2).
// ---------------------------------------------------------------------------

const m = (name, side = false) => ({ name, tier: 'main', side });
const a = (name, side = false) => ({ name, tier: 'access', side });
const c = (name) => ({ name, tier: 'core', side: true });
const carry = (name) => ({ name, tier: 'carry', side: false });
const VELO = { name: 'Vélo (cardio fin de séance)', tier: 'fixed', side: false };

const TEMPLATES = [
  {
    title: 'PUSH A (Pectoraux, Épaules, Triceps)',
    exercises: [
      m('Développé couché barre'),
      m('Développé militaire barre'),
      m('Développé incliné haltères'),
      a('Élévations latérales haltères'),
      a('Extension triceps nuque haltère'),
      a('Écarté haltères sur banc'),
      a('Kickback triceps haltère', true),
      c('Crunch latéral debout (side bend)'),
      c('Relevés de genoux debout'),
      VELO,
    ],
  },
  {
    title: 'PULL A (Dos, Biceps, Arrière épaule)',
    exercises: [
      m('Rowing barre buste penché'),
      m('Soulevé de terre surélevé (rack pull)'),
      m('Rowing haltère un bras', true),
      a('Curl biceps haltères'),
      a('Curl marteau haltères'),
      a('Oiseau haltères (arrière épaule)'),
      a('Shrugs barre (haussements)'),
      c('Woodchopper haltère'),
      carry('Marche du fermier (farmer carry)'),
      VELO,
    ],
  },
  {
    title: 'LEGS A (Quadriceps, Fessiers, Mollets)',
    exercises: [
      m('Squat barre'),
      m('Fentes bulgares haltères', true),
      m('Montées sur banc lestées', true),
      a('Squat sumo haltère'),
      a('Mollets debout lestés'),
      c('Crunch latéral debout (side bend)'),
      c('Woodchopper haltère'),
      VELO,
    ],
  },
  {
    title: 'PUSH B (Épaules, Pectoraux, Triceps)',
    exercises: [
      m('Développé Arnold haltères'),
      m('Développé incliné barre'),
      m('Push press barre'),
      a('Élévations frontales haltères'),
      a('Élévations latérales haltères'),
      a('Oiseau haltères (arrière épaule)'),
      a('Kickback triceps haltère', true),
      c('Woodchopper haltère'),
      c('Relevés de genoux debout'),
      VELO,
    ],
  },
  {
    title: 'PULL B (Dos, Trapèzes, Biceps)',
    exercises: [
      m('Soulevé de terre roumain (départ debout)'),
      m('Rowing haltères deux bras'),
      m('Pullover haltère sur banc'),
      a('Shrugs barre (haussements)'),
      a('Curl concentré haltère', true),
      a('Oiseau haltères (arrière épaule)'),
      c('Crunch latéral debout (side bend)'),
      c('Relevés de genoux debout'),
      carry('Marche du fermier (farmer carry)'),
      VELO,
    ],
  },
  {
    title: 'LEGS B (Ischios, Fessiers, Mollets)',
    exercises: [
      m('Squat gobelet haltère'),
      m('Fentes arrière alternées haltères', true),
      m('Soulevé de terre roumain unilatéral haltère', true),
      a('Mollets debout lestés'),
      a('Extension de hanche debout', true),
      c('Woodchopper haltère'),
      carry('Marche du fermier (farmer carry)'),
      VELO,
    ],
  },
  {
    title: 'FULL BODY (Bras, Épaules, Gainage)',
    exercises: [
      m('Développé couché haltères'),
      m('Tirage menton barre (upright row)'),
      m('Curl marteau haltères'),
      a('Kickback triceps haltère', true),
      a('Écarté haltères sur banc'),
      a('Élévations latérales haltères'),
      c('Crunch latéral debout (side bend)'),
      c('Relevés de genoux debout'),
      carry('Marche du fermier (farmer carry)'),
      VELO,
    ],
  },
];

// ---------------------------------------------------------------------------
// Construction du plan (28 jours = 4 semaines × 7 séances).
// ---------------------------------------------------------------------------

/** Applique le schéma de séries de la semaine à une entrée de template. */
function buildExercise(entry, week) {
  const base = CATALOG[entry.name];
  if (!base) throw new Error(`Exercice absent du catalogue : ${entry.name}`);

  const exercise = {
    name: entry.name,
    equip: base.equip,
    desc: base.desc,
    caloriesPerSet: base.caloriesPerSet,
    googleFitActivity: {
      type: 'strength_training',
      name: base.gf[0],
      muscleGroups: base.gf[1],
    },
  };

  if (entry.tier === 'fixed') {
    // Vélo : identique toutes les semaines.
    exercise.sets = '10 min (prog. CAL 1)';
    exercise.totalSets = 1;
    exercise.nbRep = 0;
    exercise.timer = true;
    exercise.duration = base.duration;
    return exercise;
  }

  const scheme = week[entry.tier];
  const suffix = entry.side ? ' /côté' : '';
  exercise.sets = `${scheme.sets}${suffix}`;
  exercise.totalSets = entry.side ? scheme.n * 2 : scheme.n;
  exercise.nbRep = scheme.rep;
  if (base.timer) {
    exercise.timer = true;
    exercise.duration = base.duration;
  }
  return exercise;
}

const plan = [];
WEEKS.forEach((week, weekIndex) => {
  TEMPLATES.forEach((template, dayIndex) => {
    const dayNumber = weekIndex * 7 + dayIndex + 1;
    plan.push({
      title: `JOUR ${dayNumber}: ${template.title} — ${week.label}`,
      isRestDay: false,
      exercises: template.exercises.map((entry) => buildExercise(entry, week)),
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

/** Secondes de travail estimées pour une série (tempo lent = 5 s/rep, sinon 3 s). */
function setWorkSeconds(exercise) {
  if (exercise.timer) return exercise.duration;
  const slow = /tempo/.test(exercise.sets);
  return exercise.nbRep * (slow ? 5 : 3);
}

/** Minutes estimées de musculation (vélo exclu) pour une séance. */
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
    ' * PROGRAMME PERTE DE GRAS — musculation 7 jours / 7 (profil > 135 kg, confirmé, dos solide).',
    ' * Split Push A / Pull A / Legs A / Push B / Pull B / Legs B / Full body — aucun jour de repos,',
    ' * aucune séance de marche : chaque jour est une séance de musculation d\'environ 1 heure.',
    ' * 4 semaines : Adaptation → Accumulation → Intensification → Allègement (deload actif).',
    ' * Adapté : 100% debout/banc (aucun appui au sol), ZÉRO saut (low-impact), hinge surélevé.',
    ' * Matériel : haltères 5/10/15 kg, barre 30 kg, veste lestée 10 kg, poids chevilles 2×4 + 2×2 kg.',
    ' * Le vélo de fin de séance (10 min, prog. CAL 1) est optionnel : l\'heure de musculation tient sans lui.',
    ' * Supplémentation : créatine monohydrate 5 g/jour (voir src/utils/creatineReminder.js).',
    ' * Généré par scripts/gen-plan.mjs — ne pas éditer à la main.',
    ' */',
    'const fullPlan = [',
  ];
  plan.forEach((day) => {
    out.push('  {');
    out.push(`    title: ${q(day.title)},`);
    out.push('    isRestDay: false,');
    out.push('    exercises: [');
    day.exercises.forEach((exercise) => out.push(jsExercise(exercise)));
    out.push('    ],');
    out.push('  },');
  });
  out.push('];', '', 'export const days = fullPlan;', '');
  return out.join('\n');
}

// ---------------------------------------------------------------------------
// Écriture du fichier Dart
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
  const out = [
    "import '../models/workout_model.dart';",
    '',
    '/// Programme perte de gras — musculation 7 jours / 7 (Push A / Pull A / Legs A /',
    '/// Push B / Pull B / Legs B / Full body), 4 semaines, low-impact, 100% debout.',
    '/// Aucun jour de marche ni de repos complet : ~1 h de musculation par jour.',
    '/// Généré par scripts/gen-plan.mjs — ne pas éditer à la main.',
    'class DefaultWorkoutData {',
    '  static WorkoutPlan get defaultWorkoutPlan {',
    '    return WorkoutPlan(',
    '      days: [',
  ];
  plan.forEach((_, index) => out.push(`        _createDay${index + 1}(),`));
  out.push('      ],', '    );', '  }', '');

  plan.forEach((day, index) => {
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

// Récapitulatif : durée estimée de musculation par séance (vélo exclu).
console.log('Jours générés :', plan.length);
plan.forEach((day) => {
  const lifting = estimateMinutes(day);
  const total = estimateMinutes(day, { withVelo: true });
  console.log(
    `  ${String(lifting).padStart(3)} min musculation (+vélo ${total} min) — ${day.title}`
  );
});
