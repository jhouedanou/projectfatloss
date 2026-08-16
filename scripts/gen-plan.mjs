/**
 * Générateur du programme d'entraînement (source unique).
 *
 * Écrit :
 *   - src/data.js                                          (application web)
 *   - projectfatloss_flutter/lib/shared/data/default_workout_data.dart (application Flutter)
 *
 * Programme : semaine type de 7 jours — 4 séances (~1 h) + 3 jours de repos.
 *   Lundi    : FULL BODY A (poussée dominante)
 *   Mardi    : repos
 *   Mercredi : FULL BODY B (tirage dominante)
 *   Jeudi    : repos
 *   Vendredi : FULL BODY C (jambes / gainage)
 *   Samedi   : VÉLO (sortie courte 20 min)
 *   Dimanche : repos
 * Objectif : perte de poids durable (profil ~147 kg) — low-impact, zéro saut,
 * 100% debout ou sur banc. La récupération fait partie du programme.
 * Le cardio est réparti sur la semaine en blocs courts (8-20 min max).
 *
 * Usage : node scripts/gen-plan.mjs
 */

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// ---------------------------------------------------------------------------
// Catalogue d'exercices : 100% debout ou sur banc, zéro saut, zéro appui au sol.
// Matériel : haltères 2×15 kg et 2×10 kg, barre 30 kg, veste lestée 10 kg,
// poids chevilles 2×4 + 2×2 kg, vélo Domyos EB900.
// ---------------------------------------------------------------------------

const CATALOG = {
  // --- Poussée ---
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
  'Développé couché haltères': {
    equip: 'Haltères 15 kg',
    desc: 'Sur banc plat, poussez les haltères vers le haut en contrôlant la descente, amplitude complète. Pectoraux, triceps.',
    caloriesPerSet: [21, 24],
    gf: ['Dumbbell Bench Press', ['chest', 'triceps', 'shoulders']],
  },
  'Élévations latérales haltères': {
    equip: 'Haltères 10 kg',
    desc: 'Debout, montez les haltères latéralement jusqu\'aux épaules. Deltoïde moyen.',
    caloriesPerSet: [12, 14],
    gf: ['Lateral Raises', ['shoulders']],
  },
  'Extension triceps nuque haltère': {
    equip: 'Haltère 10 kg',
    desc: 'Debout ou assis, haltère derrière la nuque à deux mains, tendez les bras vers le haut. Triceps.',
    caloriesPerSet: [16, 18],
    gf: ['Overhead Triceps Extension', ['triceps']],
  },

  // --- Tirage ---
  'Rowing barre buste penché': {
    equip: 'Barre 30 kg',
    desc: 'Buste penché 45°, dos droit, tirez la barre vers le bas du ventre. Épaisseur du dos. Debout.',
    caloriesPerSet: [21, 24],
    gf: ['Bent Over Barbell Row', ['back', 'biceps']],
  },
  'Soulevé de terre surélevé (rack pull)': {
    equip: 'Barre 30 kg',
    desc: 'Barre posée à hauteur des genoux (cales/support), dos droit, tirez en poussant les hanches. JAMAIS depuis le sol : préserve le dos.',
    caloriesPerSet: [21, 24],
    gf: ['Rack Pull', ['back', 'glutes', 'hamstrings']],
  },
  'Rowing haltère un bras': {
    equip: 'Haltère 15 kg',
    desc: 'Un genou et une main sur le banc, tirez l\'haltère vers la hanche, coude près du corps. Appui sur banc, pas au sol.',
    caloriesPerSet: [21, 24],
    gf: ['One Arm Dumbbell Row', ['back', 'biceps']],
  },
  'Rowing haltères deux bras': {
    equip: 'Haltères 15 kg',
    desc: 'Buste penché, tirez les deux haltères vers les hanches en serrant les omoplates. Dos complet. Debout.',
    caloriesPerSet: [21, 24],
    gf: ['Two Arm Dumbbell Row', ['back', 'biceps']],
  },
  'Curl biceps haltères': {
    equip: 'Haltères 10 kg',
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

  // --- Jambes ---
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
  'Fentes arrière alternées haltères': {
    equip: 'Haltères 10 kg',
    desc: 'Un pas en arrière, descendez le genou arrière sans le poser, puis revenez debout. Alternez. Fessiers et ischios, plus doux pour les genoux que la fente avant.',
    caloriesPerSet: [21, 24],
    gf: ['Reverse Lunges', ['glutes', 'hamstrings', 'quadriceps']],
  },
  'Soulevé de terre roumain (départ debout)': {
    equip: 'Barre 30 kg',
    desc: 'Départ debout barre en mains, poussez les hanches en arrière et descendez la barre le long des cuisses, dos droit, sans poser au sol. Ischios + fessiers + lombaires.',
    caloriesPerSet: [21, 24],
    gf: ['Romanian Deadlift', ['hamstrings', 'glutes', 'back']],
  },
  'Montées sur banc lestées': {
    equip: 'Haltères 10 kg',
    desc: 'Montez complètement sur un banc/marche stable, jambe motrice, contrôlez la descente. Alternez. Bas du corps fonctionnel, zéro impact.',
    caloriesPerSet: [16, 18],
    gf: ['Weighted Step-ups', ['quadriceps', 'glutes']],
  },

  // --- Gainage debout ---
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
  'Vélo — sortie légère': {
    equip: 'Vélo Domyos',
    desc: '20 min à résistance légère à moyenne, cadence confortable : vous devez pouvoir tenir une conversation. Le cardio de la semaine est réparti en petits blocs — celui-ci est le plus long.',
    caloriesPerSet: [150, 180],
    gf: ['Stationary Cycling', ['quadriceps', 'glutes', 'cardio']],
    timer: true,
    duration: 1200,
    setsLabel: '20 min (résistance légère-moyenne)',
  },
  'Vélo (cardio fin de séance)': {
    equip: 'Vélo',
    desc: '15 min sur le programme CAL 1 du Domyos EB900 (résistance moyenne-haute), en fin de séance. Cardio court sans impact ni appui au sol. Optionnel : désactivable dans les réglages.',
    caloriesPerSet: [248, 278],
    gf: ['Stationary Cycling', ['quadriceps', 'glutes', 'cardio']],
    timer: true,
    duration: 900,
    setsLabel: '15 min (prog. CAL 1)',
  },
};

// ---------------------------------------------------------------------------
// Schéma de séries unique (semaine répétée) : la progression se fait sur la
// charge choisie dans l'app, pas sur le volume.
// ---------------------------------------------------------------------------

const SCHEME = {
  main: { sets: '4 × 10 (tempo 3-1-1)', n: 4, rep: 10 },
  access: { sets: '3 × 12', n: 3, rep: 12 },
  core: { sets: '3 × 12', n: 3, rep: 12 },
  carry: { sets: '3 × 60 s', n: 3, rep: 0 },
};

// ---------------------------------------------------------------------------
// La semaine type : 4 séances + 3 jours de repos (index 0 = lundi).
// tier : main | access | core | carry | cardio. side:true => exercice
// unilatéral (les deux côtés s'enchaînent dans la MÊME série).
// ---------------------------------------------------------------------------

const m = (name, side = false) => ({ name, tier: 'main', side });
const a = (name, side = false) => ({ name, tier: 'access', side });
const c = (name) => ({ name, tier: 'core', side: true });
const carry = (name) => ({ name, tier: 'carry', side: false });
const bike = (name) => ({ name, tier: 'cardio', side: false });
const WARMUP = bike('Vélo — échauffement');
const VELO = bike('Vélo (cardio fin de séance)');

const WEEK_TEMPLATE = [
  {
    title: 'FULL BODY A (Poussée) — Lundi',
    exercises: [
      WARMUP,
      m('Développé couché barre'),
      m('Squat gobelet haltère'),
      m('Rowing haltères deux bras'),
      a('Développé militaire barre'),
      a('Curl biceps haltères'),
      a('Extension triceps nuque haltère'),
      c('Relevés de genoux debout'),
      VELO,
    ],
  },
  {
    title: 'REPOS (Récupération) — Mardi',
    isRestDay: true,
    exercises: [],
  },
  {
    title: 'FULL BODY B (Tirage) — Mercredi',
    exercises: [
      WARMUP,
      m('Soulevé de terre surélevé (rack pull)'),
      m('Développé incliné haltères'),
      m('Fentes arrière alternées haltères', true),
      a('Rowing barre buste penché'),
      a('Élévations latérales haltères'),
      a('Oiseau haltères (arrière épaule)'),
      c('Woodchopper haltère'),
      VELO,
    ],
  },
  {
    title: 'REPOS (Récupération) — Jeudi',
    isRestDay: true,
    exercises: [],
  },
  {
    title: 'FULL BODY C (Jambes, Gainage) — Vendredi',
    exercises: [
      WARMUP,
      m('Squat barre'),
      m('Soulevé de terre roumain (départ debout)'),
      m('Développé couché haltères'),
      a('Montées sur banc lestées', true),
      a('Rowing haltère un bras', true),
      carry('Marche du fermier (farmer carry)'),
      VELO,
    ],
  },
  {
    title: 'VÉLO (Sortie courte) — Samedi',
    exercises: [
      bike('Vélo — sortie légère'),
    ],
  },
  {
    title: 'REPOS (Récupération) — Dimanche',
    isRestDay: true,
    exercises: [],
  },
];

// ---------------------------------------------------------------------------
// Construction du plan (7 jours = 1 semaine type, répétée).
// ---------------------------------------------------------------------------

/** Applique le schéma de séries à une entrée de template. */
function buildExercise(entry) {
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

  if (entry.tier === 'cardio') {
    exercise.sets = base.setsLabel;
    exercise.totalSets = 1;
    exercise.nbRep = 0;
    exercise.timer = true;
    exercise.duration = base.duration;
    return exercise;
  }

  const scheme = SCHEME[entry.tier];
  // Exercices unilatéraux : l'app enchaîne déjà les deux côtés DANS la même
  // série (le marqueur « /côté » déclenche le passage automatique au second
  // côté), donc totalSets reste le nombre de séries affiché. Les exercices
  // « alternés » travaillent les deux côtés dans la même série, sans marqueur.
  const alternating = entry.side && /altern/i.test(entry.name);
  const suffix = entry.side ? (alternating ? ' en alternance' : ' /côté') : '';
  exercise.sets = `${scheme.sets}${suffix}`;
  exercise.totalSets = scheme.n;
  exercise.nbRep = scheme.rep;
  if (base.timer) {
    exercise.timer = true;
    exercise.duration = base.duration;
  }
  return exercise;
}

const plan = WEEK_TEMPLATE.map((template, dayIndex) => ({
  title: `JOUR ${dayIndex + 1}: ${template.title}`,
  isRestDay: template.isRestDay === true,
  exercises: template.exercises.map((entry) => buildExercise(entry)),
}));

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
    ' * PROGRAMME PERTE DE POIDS — semaine type de 7 jours : 4 séances + 3 jours de repos.',
    ' * Lundi FULL BODY A (poussée) / Mercredi FULL BODY B (tirage) / Vendredi FULL BODY C (jambes,',
    ' * gainage) / Samedi VÉLO (sortie courte 20 min) — Mardi, Jeudi et Dimanche : récupération.',
    ' * Le cardio est réparti sur la semaine en blocs courts (max 20 min d\'affilée).',
    ' * Adapté : profil ~147 kg, 100% debout/banc (aucun appui au sol), ZÉRO saut (low-impact).',
    ' * Matériel : haltères 2×15 et 2×10 kg, barre 30 kg, veste lestée 10 kg, poids chevilles',
    ' * 2×4 + 2×2 kg, vélo Domyos EB900. Progression : augmenter la charge dans l\'app, pas le volume.',
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
    '/// Programme perte de poids — semaine type : 4 séances (~1 h) + 3 jours de repos.',
    '/// FULL BODY A (poussée) / FULL BODY B (tirage) / FULL BODY C (jambes, gainage) /',
    '/// VÉLO (cardio Domyos). Low-impact, 100% debout ou sur banc.',
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
    `  ${String(lifting).padStart(3)} min musculation (total avec vélo ${total} min) — ${day.title}`
  );
});
