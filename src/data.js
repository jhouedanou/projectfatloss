/**
 * PROGRAMME PERTE DE POIDS — semaine type de 7 jours : 4 séances + 3 jours de repos.
 * Lundi FULL BODY A (poussée) / Mercredi FULL BODY B (tirage) / Vendredi FULL BODY C (jambes,
 * gainage) / Samedi VÉLO (sortie courte 20 min) — Mardi, Jeudi et Dimanche : récupération.
 * Le cardio est réparti sur la semaine en blocs courts (max 20 min d'affilée).
 * Adapté : profil ~147 kg, 100% debout/banc (aucun appui au sol), ZÉRO saut (low-impact).
 * Matériel : haltères 2×15 et 2×10 kg, barre 30 kg, veste lestée 10 kg, poids chevilles
 * 2×4 + 2×2 kg, vélo Domyos EB900. Progression : augmenter la charge dans l'app, pas le volume.
 * Généré par scripts/gen-plan.mjs — ne pas éditer à la main.
 */
const fullPlan = [
  {
    title: 'JOUR 1: FULL BODY A (Poussée) — Lundi',
    isRestDay: false,
    exercises: [
      {
        name: 'Vélo — échauffement',
        sets: '8 min (résistance légère)',
        equip: 'Vélo Domyos',
        desc: '8 min de pédalage à résistance légère pour monter progressivement en température avant la musculation. Cadence souple, respiration confortable.',
        caloriesPerSet: [55, 70],
        totalSets: 1,
        nbRep: 0,
        timer: true,
        duration: 480,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Stationary Cycling',
          muscleGroups: ['quadriceps', 'glutes', 'cardio']
        }
      },
      {
        name: 'Développé couché barre',
        sets: '4 × 10 (tempo 3-1-1)',
        equip: 'Barre 30 kg',
        desc: 'Sur banc, descendez la barre vers la poitrine puis poussez, tempo contrôlé. Pectoraux. (Le banc est surélevé : pas d\'appui au sol.)',
        caloriesPerSet: [21, 24],
        totalSets: 4,
        nbRep: 10,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Barbell Bench Press',
          muscleGroups: ['chest', 'triceps', 'shoulders']
        }
      },
      {
        name: 'Squat gobelet haltère',
        sets: '4 × 10 (tempo 3-1-1)',
        equip: 'Haltère 15 kg',
        desc: 'Debout, haltère tenu verticalement contre la poitrine, descendez en squat buste droit puis remontez. Quadriceps, fessiers, gainage. Debout.',
        caloriesPerSet: [21, 24],
        totalSets: 4,
        nbRep: 10,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Goblet Squat',
          muscleGroups: ['quadriceps', 'glutes', 'core']
        }
      },
      {
        name: 'Rowing haltères deux bras',
        sets: '4 × 10 (tempo 3-1-1)',
        equip: 'Haltères 15 kg',
        desc: 'Buste penché, tirez les deux haltères vers les hanches en serrant les omoplates. Dos complet. Debout.',
        caloriesPerSet: [21, 24],
        totalSets: 4,
        nbRep: 10,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Two Arm Dumbbell Row',
          muscleGroups: ['back', 'biceps']
        }
      },
      {
        name: 'Développé militaire barre',
        sets: '3 × 12',
        equip: 'Barre 30 kg',
        desc: 'Debout, gainé, poussez la barre au-dessus de la tête sans cambrer. Épaules complètes. 100% debout.',
        caloriesPerSet: [21, 24],
        totalSets: 3,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Military Press',
          muscleGroups: ['shoulders', 'triceps']
        }
      },
      {
        name: 'Curl biceps haltères',
        sets: '3 × 12',
        equip: 'Haltères 10 kg',
        desc: 'Debout, fléchissez les coudes pour monter les haltères vers les épaules sans balancer. Biceps.',
        caloriesPerSet: [12, 14],
        totalSets: 3,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Dumbbell Curl',
          muscleGroups: ['biceps']
        }
      },
      {
        name: 'Extension triceps nuque haltère',
        sets: '3 × 12',
        equip: 'Haltère 10 kg',
        desc: 'Debout ou assis, haltère derrière la nuque à deux mains, tendez les bras vers le haut. Triceps.',
        caloriesPerSet: [16, 18],
        totalSets: 3,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Overhead Triceps Extension',
          muscleGroups: ['triceps']
        }
      },
      {
        name: 'Relevés de genoux debout',
        sets: '3 × 12 /côté',
        equip: 'Poids chevilles 4 kg',
        desc: 'Debout en appui léger, montez le genou vers la poitrine en contractant les abdos, alternez. Abdos bas, 100% debout.',
        caloriesPerSet: [16, 18],
        totalSets: 3,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Standing Knee Raises',
          muscleGroups: ['abdominals', 'core']
        }
      },
      {
        name: 'Vélo (cardio fin de séance)',
        sets: '15 min (prog. CAL 1)',
        equip: 'Vélo',
        desc: '15 min sur le programme CAL 1 du Domyos EB900 (résistance moyenne-haute), en fin de séance. Cardio court sans impact ni appui au sol. Optionnel : désactivable dans les réglages.',
        caloriesPerSet: [248, 278],
        totalSets: 1,
        nbRep: 0,
        timer: true,
        duration: 900,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Stationary Cycling',
          muscleGroups: ['quadriceps', 'glutes', 'cardio']
        }
      },
    ],
  },
  {
    title: 'JOUR 2: REPOS (Récupération) — Mardi',
    isRestDay: true,
    exercises: [
    ],
  },
  {
    title: 'JOUR 3: FULL BODY B (Tirage) — Mercredi',
    isRestDay: false,
    exercises: [
      {
        name: 'Vélo — échauffement',
        sets: '8 min (résistance légère)',
        equip: 'Vélo Domyos',
        desc: '8 min de pédalage à résistance légère pour monter progressivement en température avant la musculation. Cadence souple, respiration confortable.',
        caloriesPerSet: [55, 70],
        totalSets: 1,
        nbRep: 0,
        timer: true,
        duration: 480,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Stationary Cycling',
          muscleGroups: ['quadriceps', 'glutes', 'cardio']
        }
      },
      {
        name: 'Soulevé de terre surélevé (rack pull)',
        sets: '4 × 10 (tempo 3-1-1)',
        equip: 'Barre 30 kg',
        desc: 'Barre posée à hauteur des genoux (cales/support), dos droit, tirez en poussant les hanches. JAMAIS depuis le sol : préserve le dos.',
        caloriesPerSet: [21, 24],
        totalSets: 4,
        nbRep: 10,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Rack Pull',
          muscleGroups: ['back', 'glutes', 'hamstrings']
        }
      },
      {
        name: 'Développé incliné haltères',
        sets: '4 × 10 (tempo 3-1-1)',
        equip: 'Haltères 15 kg',
        desc: 'Banc incliné, poussez les haltères vers le haut en contrôlant la descente. Haut des pectoraux.',
        caloriesPerSet: [21, 24],
        totalSets: 4,
        nbRep: 10,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Incline Dumbbell Press',
          muscleGroups: ['chest', 'shoulders', 'triceps']
        }
      },
      {
        name: 'Fentes arrière alternées haltères',
        sets: '4 × 10 (tempo 3-1-1) en alternance',
        equip: 'Haltères 10 kg',
        desc: 'Un pas en arrière, descendez le genou arrière sans le poser, puis revenez debout. Alternez. Fessiers et ischios, plus doux pour les genoux que la fente avant.',
        caloriesPerSet: [21, 24],
        totalSets: 4,
        nbRep: 10,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Reverse Lunges',
          muscleGroups: ['glutes', 'hamstrings', 'quadriceps']
        }
      },
      {
        name: 'Rowing barre buste penché',
        sets: '3 × 12',
        equip: 'Barre 30 kg',
        desc: 'Buste penché 45°, dos droit, tirez la barre vers le bas du ventre. Épaisseur du dos. Debout.',
        caloriesPerSet: [21, 24],
        totalSets: 3,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Bent Over Barbell Row',
          muscleGroups: ['back', 'biceps']
        }
      },
      {
        name: 'Élévations latérales haltères',
        sets: '3 × 12',
        equip: 'Haltères 10 kg',
        desc: 'Debout, montez les haltères latéralement jusqu\'aux épaules. Deltoïde moyen.',
        caloriesPerSet: [12, 14],
        totalSets: 3,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Lateral Raises',
          muscleGroups: ['shoulders']
        }
      },
      {
        name: 'Oiseau haltères (arrière épaule)',
        sets: '3 × 12',
        equip: 'Haltères 10 kg',
        desc: 'Buste penché ou assis penché, montez les haltères sur les côtés en serrant les omoplates. Arrière de l\'épaule — corrige la posture.',
        caloriesPerSet: [12, 14],
        totalSets: 3,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Rear Delt Raise',
          muscleGroups: ['shoulders', 'back']
        }
      },
      {
        name: 'Woodchopper haltère',
        sets: '3 × 12 /côté',
        equip: 'Haltère 10 kg',
        desc: 'Debout, amenez l\'haltère en diagonale de la hanche basse vers l\'épaule opposée puis inversez. Rotation du tronc, debout.',
        caloriesPerSet: [16, 18],
        totalSets: 3,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Dumbbell Woodchopper',
          muscleGroups: ['obliques', 'abdominals', 'core']
        }
      },
      {
        name: 'Vélo (cardio fin de séance)',
        sets: '15 min (prog. CAL 1)',
        equip: 'Vélo',
        desc: '15 min sur le programme CAL 1 du Domyos EB900 (résistance moyenne-haute), en fin de séance. Cardio court sans impact ni appui au sol. Optionnel : désactivable dans les réglages.',
        caloriesPerSet: [248, 278],
        totalSets: 1,
        nbRep: 0,
        timer: true,
        duration: 900,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Stationary Cycling',
          muscleGroups: ['quadriceps', 'glutes', 'cardio']
        }
      },
    ],
  },
  {
    title: 'JOUR 4: REPOS (Récupération) — Jeudi',
    isRestDay: true,
    exercises: [
    ],
  },
  {
    title: 'JOUR 5: FULL BODY C (Jambes, Gainage) — Vendredi',
    isRestDay: false,
    exercises: [
      {
        name: 'Vélo — échauffement',
        sets: '8 min (résistance légère)',
        equip: 'Vélo Domyos',
        desc: '8 min de pédalage à résistance légère pour monter progressivement en température avant la musculation. Cadence souple, respiration confortable.',
        caloriesPerSet: [55, 70],
        totalSets: 1,
        nbRep: 0,
        timer: true,
        duration: 480,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Stationary Cycling',
          muscleGroups: ['quadriceps', 'glutes', 'cardio']
        }
      },
      {
        name: 'Squat barre',
        sets: '4 × 10 (tempo 3-1-1)',
        equip: 'Barre 30 kg',
        desc: 'Barre sur les trapèzes, descendez hanches sous parallèle si mobilité OK, puis remontez. Quadriceps, fessiers. Debout.',
        caloriesPerSet: [21, 24],
        totalSets: 4,
        nbRep: 10,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Barbell Squat',
          muscleGroups: ['quadriceps', 'glutes', 'hamstrings']
        }
      },
      {
        name: 'Soulevé de terre roumain (départ debout)',
        sets: '4 × 10 (tempo 3-1-1)',
        equip: 'Barre 30 kg',
        desc: 'Départ debout barre en mains, poussez les hanches en arrière et descendez la barre le long des cuisses, dos droit, sans poser au sol. Ischios + fessiers + lombaires.',
        caloriesPerSet: [21, 24],
        totalSets: 4,
        nbRep: 10,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Romanian Deadlift',
          muscleGroups: ['hamstrings', 'glutes', 'back']
        }
      },
      {
        name: 'Développé couché haltères',
        sets: '4 × 10 (tempo 3-1-1)',
        equip: 'Haltères 15 kg',
        desc: 'Sur banc plat, poussez les haltères vers le haut en contrôlant la descente, amplitude complète. Pectoraux, triceps.',
        caloriesPerSet: [21, 24],
        totalSets: 4,
        nbRep: 10,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Dumbbell Bench Press',
          muscleGroups: ['chest', 'triceps', 'shoulders']
        }
      },
      {
        name: 'Montées sur banc lestées',
        sets: '3 × 12 /côté',
        equip: 'Haltères 10 kg',
        desc: 'Montez complètement sur un banc/marche stable, jambe motrice, contrôlez la descente. Alternez. Bas du corps fonctionnel, zéro impact.',
        caloriesPerSet: [16, 18],
        totalSets: 3,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Weighted Step-ups',
          muscleGroups: ['quadriceps', 'glutes']
        }
      },
      {
        name: 'Rowing haltère un bras',
        sets: '3 × 12 /côté',
        equip: 'Haltère 15 kg',
        desc: 'Un genou et une main sur le banc, tirez l\'haltère vers la hanche, coude près du corps. Appui sur banc, pas au sol.',
        caloriesPerSet: [21, 24],
        totalSets: 3,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'One Arm Dumbbell Row',
          muscleGroups: ['back', 'biceps']
        }
      },
      {
        name: 'Marche du fermier (farmer carry)',
        sets: '3 × 60 s',
        equip: 'Haltères 15 kg',
        desc: 'Un haltère lourd dans chaque main, marchez 60 s tronc gainé et droit, épaules basses. Anti-flexion, core et grip, debout.',
        caloriesPerSet: [11, 12],
        totalSets: 3,
        nbRep: 0,
        timer: true,
        duration: 60,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Farmer Carry',
          muscleGroups: ['core', 'forearms', 'trapezius']
        }
      },
      {
        name: 'Vélo (cardio fin de séance)',
        sets: '15 min (prog. CAL 1)',
        equip: 'Vélo',
        desc: '15 min sur le programme CAL 1 du Domyos EB900 (résistance moyenne-haute), en fin de séance. Cardio court sans impact ni appui au sol. Optionnel : désactivable dans les réglages.',
        caloriesPerSet: [248, 278],
        totalSets: 1,
        nbRep: 0,
        timer: true,
        duration: 900,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Stationary Cycling',
          muscleGroups: ['quadriceps', 'glutes', 'cardio']
        }
      },
    ],
  },
  {
    title: 'JOUR 6: VÉLO (Sortie courte) — Samedi',
    isRestDay: false,
    exercises: [
      {
        name: 'Vélo — sortie légère',
        sets: '20 min (résistance légère-moyenne)',
        equip: 'Vélo Domyos',
        desc: '20 min à résistance légère à moyenne, cadence confortable : vous devez pouvoir tenir une conversation. Le cardio de la semaine est réparti en petits blocs — celui-ci est le plus long.',
        caloriesPerSet: [150, 180],
        totalSets: 1,
        nbRep: 0,
        timer: true,
        duration: 1200,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Stationary Cycling',
          muscleGroups: ['quadriceps', 'glutes', 'cardio']
        }
      },
    ],
  },
  {
    title: 'JOUR 7: REPOS (Récupération) — Dimanche',
    isRestDay: true,
    exercises: [
    ],
  },
];

export const days = fullPlan;
