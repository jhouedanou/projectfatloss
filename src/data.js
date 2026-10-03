/**
 * PROGRAMME PERTE DE POIDS — 28 jours = 4 semaines de 5 séances de musculation + 2 jours de repos.
 * Lundi FULL BODY A (poussée) / Mardi FULL BODY B (tirage) / Jeudi FULL BODY C (jambes) /
 * Vendredi FULL BODY D (haut du corps) / Samedi FULL BODY E (gainage, fonctionnel).
 * Mercredi et dimanche : récupération complète.
 * 100 % musculation, sans vélo : le volume de répétitions est augmenté en conséquence
 * (~1 h par séance). Échauffement libre conseillé avant chaque séance (5 min).
 * Les exercices tournent sur les 4 semaines (une variante par semaine et par schéma de
 * mouvement) ; la charge monte S1 → S3 puis S4 allège.
 * Adapté : profil ~147 kg, 100% debout/banc (aucun appui au sol), ZÉRO saut (low-impact).
 * Matériel : haltères 2×15 et 2×10 kg, barre 30 kg, veste lestée 10 kg, poids chevilles
 * 2×4 + 2×2 kg.
 * Généré par scripts/gen-plan.mjs — ne pas éditer à la main.
 */
const fullPlan = [
  {
    title: 'JOUR 1: FULL BODY A (Poussée, Pectoraux, Épaules) — Lundi · S1 Adaptation',
    isRestDay: false,
    exercises: [
      {
        name: 'Développé couché barre',
        sets: '4 × 12 (tempo 3-1-1)',
        equip: 'Barre 30 kg',
        desc: 'Sur banc, descendez la barre vers la poitrine puis poussez, tempo contrôlé. Pectoraux. (Le banc est surélevé : pas d\'appui au sol.)',
        caloriesPerSet: [21, 24],
        totalSets: 4,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Barbell Bench Press',
          muscleGroups: ['chest', 'triceps', 'shoulders']
        }
      },
      {
        name: 'Squat gobelet haltère',
        sets: '4 × 12 (tempo 3-1-1)',
        equip: 'Haltère 15 kg',
        desc: 'Debout, haltère tenu verticalement contre la poitrine, descendez en squat buste droit puis remontez. Quadriceps, fessiers, gainage. Debout.',
        caloriesPerSet: [21, 24],
        totalSets: 4,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Goblet Squat',
          muscleGroups: ['quadriceps', 'glutes', 'core']
        }
      },
      {
        name: 'Développé militaire barre',
        sets: '4 × 15',
        equip: 'Barre 30 kg',
        desc: 'Debout, gainé, poussez la barre au-dessus de la tête sans cambrer. Épaules complètes. 100% debout.',
        caloriesPerSet: [21, 24],
        totalSets: 4,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Military Press',
          muscleGroups: ['shoulders', 'triceps']
        }
      },
      {
        name: 'Extension triceps nuque haltère',
        sets: '4 × 15',
        equip: 'Haltère 10 kg',
        desc: 'Debout ou assis, haltère derrière la nuque à deux mains, tendez les bras vers le haut. Triceps.',
        caloriesPerSet: [16, 18],
        totalSets: 4,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Overhead Triceps Extension',
          muscleGroups: ['triceps']
        }
      },
      {
        name: 'Écarté haltères sur banc',
        sets: '4 × 15',
        equip: 'Haltères 10 kg',
        desc: 'Sur banc, bras légèrement fléchis, ouvrez les haltères en arc de cercle puis refermez au-dessus de la poitrine. Étirement des pectoraux.',
        caloriesPerSet: [16, 18],
        totalSets: 4,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Dumbbell Fly',
          muscleGroups: ['chest', 'shoulders']
        }
      },
      {
        name: 'Relevés de genoux debout',
        sets: '4 × 15 /côté',
        equip: 'Poids chevilles 4 kg',
        desc: 'Debout en appui léger, montez le genou vers la poitrine en contractant les abdos, alternez. Abdos bas, 100% debout.',
        caloriesPerSet: [16, 18],
        totalSets: 4,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Standing Knee Raises',
          muscleGroups: ['abdominals', 'core']
        }
      },
    ],
  },
  {
    title: 'JOUR 2: FULL BODY B (Tirage, Dos, Biceps) — Mardi · S1 Adaptation',
    isRestDay: false,
    exercises: [
      {
        name: 'Rowing haltères deux bras',
        sets: '4 × 12 (tempo 3-1-1)',
        equip: 'Haltères 15 kg',
        desc: 'Buste penché, tirez les deux haltères vers les hanches en serrant les omoplates. Dos complet. Debout.',
        caloriesPerSet: [21, 24],
        totalSets: 4,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Two Arm Dumbbell Row',
          muscleGroups: ['back', 'biceps']
        }
      },
      {
        name: 'Soulevé de terre surélevé (rack pull)',
        sets: '4 × 12 (tempo 3-1-1)',
        equip: 'Barre 30 kg',
        desc: 'Barre posée à hauteur des genoux (cales/support), dos droit, tirez en poussant les hanches. JAMAIS depuis le sol : préserve le dos.',
        caloriesPerSet: [21, 24],
        totalSets: 4,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Rack Pull',
          muscleGroups: ['back', 'glutes', 'hamstrings']
        }
      },
      {
        name: 'Oiseau haltères (arrière épaule)',
        sets: '4 × 15',
        equip: 'Haltères 10 kg',
        desc: 'Buste penché ou assis penché, montez les haltères sur les côtés en serrant les omoplates. Arrière de l\'épaule — corrige la posture.',
        caloriesPerSet: [12, 14],
        totalSets: 4,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Rear Delt Raise',
          muscleGroups: ['shoulders', 'back']
        }
      },
      {
        name: 'Curl biceps haltères',
        sets: '4 × 15',
        equip: 'Haltères 10 kg',
        desc: 'Debout, fléchissez les coudes pour monter les haltères vers les épaules sans balancer. Biceps.',
        caloriesPerSet: [12, 14],
        totalSets: 4,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Dumbbell Curl',
          muscleGroups: ['biceps']
        }
      },
      {
        name: 'Shrugs barre (haussements)',
        sets: '4 × 15',
        equip: 'Barre 30 kg',
        desc: 'Debout, barre devant, haussez les épaules vers les oreilles sans plier les bras. Trapèzes.',
        caloriesPerSet: [16, 18],
        totalSets: 4,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Barbell Shrugs',
          muscleGroups: ['trapezius', 'back']
        }
      },
      {
        name: 'Woodchopper haltère',
        sets: '4 × 15 /côté',
        equip: 'Haltère 10 kg',
        desc: 'Debout, amenez l\'haltère en diagonale de la hanche basse vers l\'épaule opposée puis inversez. Rotation du tronc, debout.',
        caloriesPerSet: [16, 18],
        totalSets: 4,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Dumbbell Woodchopper',
          muscleGroups: ['obliques', 'abdominals', 'core']
        }
      },
    ],
  },
  {
    title: 'JOUR 3: REPOS (Récupération) — Mercredi',
    isRestDay: true,
    exercises: [
    ],
  },
  {
    title: 'JOUR 4: FULL BODY C (Jambes, Fessiers) — Jeudi · S1 Adaptation',
    isRestDay: false,
    exercises: [
      {
        name: 'Squat barre',
        sets: '4 × 12 (tempo 3-1-1)',
        equip: 'Barre 30 kg',
        desc: 'Barre sur les trapèzes, descendez hanches sous parallèle si mobilité OK, puis remontez. Quadriceps, fessiers. Debout.',
        caloriesPerSet: [21, 24],
        totalSets: 4,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Barbell Squat',
          muscleGroups: ['quadriceps', 'glutes', 'hamstrings']
        }
      },
      {
        name: 'Soulevé de terre roumain (départ debout)',
        sets: '4 × 12 (tempo 3-1-1)',
        equip: 'Barre 30 kg',
        desc: 'Départ debout barre en mains, poussez les hanches en arrière et descendez la barre le long des cuisses, dos droit, sans poser au sol. Ischios + fessiers + lombaires.',
        caloriesPerSet: [21, 24],
        totalSets: 4,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Romanian Deadlift',
          muscleGroups: ['hamstrings', 'glutes', 'back']
        }
      },
      {
        name: 'Montées sur banc lestées',
        sets: '4 × 15 /côté',
        equip: 'Haltères 10 kg',
        desc: 'Montez complètement sur un banc/marche stable, jambe motrice, contrôlez la descente. Alternez. Bas du corps fonctionnel, zéro impact.',
        caloriesPerSet: [16, 18],
        totalSets: 4,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Weighted Step-ups',
          muscleGroups: ['quadriceps', 'glutes']
        }
      },
      {
        name: 'Mollets debout lestés',
        sets: '4 × 15',
        equip: 'Veste lestée 10 kg',
        desc: 'Debout, avant-pieds sur une cale ou le bord du banc, montez sur la pointe des pieds puis descendez lentement le talon. Mollets, zéro impact.',
        caloriesPerSet: [12, 14],
        totalSets: 4,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Standing Calf Raise',
          muscleGroups: ['calves']
        }
      },
      {
        name: 'Squat sumo haltère',
        sets: '4 × 15',
        equip: 'Haltère 15 kg',
        desc: 'Pieds très écartés, pointes vers l\'extérieur, haltère tenu entre les jambes. Adducteurs + fessiers. Debout.',
        caloriesPerSet: [21, 24],
        totalSets: 4,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Sumo Squat',
          muscleGroups: ['glutes', 'adductors', 'quadriceps']
        }
      },
      {
        name: 'Crunch latéral debout (side bend)',
        sets: '4 × 15 /côté',
        equip: 'Haltère 15 kg',
        desc: 'Debout, un haltère d\'un côté, inclinez le buste latéralement puis redressez en contractant l\'oblique. Debout, aucun appui au sol.',
        caloriesPerSet: [13, 15],
        totalSets: 4,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Standing Side Bend',
          muscleGroups: ['obliques', 'abdominals']
        }
      },
    ],
  },
  {
    title: 'JOUR 5: FULL BODY D (Haut du corps complet) — Vendredi · S1 Adaptation',
    isRestDay: false,
    exercises: [
      {
        name: 'Développé incliné haltères',
        sets: '4 × 12 (tempo 3-1-1)',
        equip: 'Haltères 15 kg',
        desc: 'Banc incliné, poussez les haltères vers le haut en contrôlant la descente. Haut des pectoraux.',
        caloriesPerSet: [21, 24],
        totalSets: 4,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Incline Dumbbell Press',
          muscleGroups: ['chest', 'shoulders', 'triceps']
        }
      },
      {
        name: 'Rowing haltère un bras',
        sets: '4 × 12 (tempo 3-1-1) /côté',
        equip: 'Haltère 15 kg',
        desc: 'Un genou et une main sur le banc, tirez l\'haltère vers la hanche, coude près du corps. Appui sur banc, pas au sol.',
        caloriesPerSet: [21, 24],
        totalSets: 4,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'One Arm Dumbbell Row',
          muscleGroups: ['back', 'biceps']
        }
      },
      {
        name: 'Élévations latérales haltères',
        sets: '4 × 15',
        equip: 'Haltères 10 kg',
        desc: 'Debout, montez les haltères latéralement jusqu\'aux épaules. Deltoïde moyen.',
        caloriesPerSet: [12, 14],
        totalSets: 4,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Lateral Raises',
          muscleGroups: ['shoulders']
        }
      },
      {
        name: 'Curl marteau haltères',
        sets: '4 × 15',
        equip: 'Haltères 15 kg',
        desc: 'Debout, paumes face à face, fléchissez les coudes sans balancer le buste. Biceps et brachial (épaisseur du bras).',
        caloriesPerSet: [16, 18],
        totalSets: 4,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Hammer Curl',
          muscleGroups: ['biceps', 'forearms']
        }
      },
      {
        name: 'Kickback triceps haltère',
        sets: '4 × 15 /côté',
        equip: 'Haltère 10 kg',
        desc: 'Buste penché, coude collé au corps et fixe, tendez l\'avant-bras vers l\'arrière puis revenez. Isolation triceps.',
        caloriesPerSet: [12, 14],
        totalSets: 4,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Triceps Kickback',
          muscleGroups: ['triceps']
        }
      },
      {
        name: 'Relevés de genoux debout',
        sets: '4 × 15 /côté',
        equip: 'Poids chevilles 4 kg',
        desc: 'Debout en appui léger, montez le genou vers la poitrine en contractant les abdos, alternez. Abdos bas, 100% debout.',
        caloriesPerSet: [16, 18],
        totalSets: 4,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Standing Knee Raises',
          muscleGroups: ['abdominals', 'core']
        }
      },
    ],
  },
  {
    title: 'JOUR 6: FULL BODY E (Gainage, Fonctionnel) — Samedi · S1 Adaptation',
    isRestDay: false,
    exercises: [
      {
        name: 'Fentes arrière alternées haltères',
        sets: '4 × 12 (tempo 3-1-1) en alternance',
        equip: 'Haltères 10 kg',
        desc: 'Un pas en arrière, descendez le genou arrière sans le poser, puis revenez debout. Alternez. Fessiers et ischios, plus doux pour les genoux que la fente avant.',
        caloriesPerSet: [21, 24],
        totalSets: 4,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Reverse Lunges',
          muscleGroups: ['glutes', 'hamstrings', 'quadriceps']
        }
      },
      {
        name: 'Soulevé de terre roumain unilatéral haltère',
        sets: '4 × 15 /côté',
        equip: 'Haltère 15 kg',
        desc: 'Debout sur une jambe (main libre en appui léger si besoin), poussez la hanche en arrière et descendez l\'haltère le long de la jambe d\'appui, dos droit. Ischios, fessiers, équilibre.',
        caloriesPerSet: [21, 24],
        totalSets: 4,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Single Leg Romanian Deadlift',
          muscleGroups: ['hamstrings', 'glutes', 'core']
        }
      },
      {
        name: 'Squat gobelet haltère',
        sets: '4 × 15',
        equip: 'Haltère 15 kg',
        desc: 'Debout, haltère tenu verticalement contre la poitrine, descendez en squat buste droit puis remontez. Quadriceps, fessiers, gainage. Debout.',
        caloriesPerSet: [21, 24],
        totalSets: 4,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Goblet Squat',
          muscleGroups: ['quadriceps', 'glutes', 'core']
        }
      },
      {
        name: 'Marche du fermier (farmer carry)',
        sets: '4 × 45 s',
        equip: 'Haltères 15 kg',
        desc: 'Un haltère lourd dans chaque main, marchez tronc gainé et droit, épaules basses. Anti-flexion, core et grip, debout.',
        caloriesPerSet: [11, 12],
        totalSets: 4,
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
        name: 'Crunch latéral debout (side bend)',
        sets: '4 × 15 /côté',
        equip: 'Haltère 15 kg',
        desc: 'Debout, un haltère d\'un côté, inclinez le buste latéralement puis redressez en contractant l\'oblique. Debout, aucun appui au sol.',
        caloriesPerSet: [13, 15],
        totalSets: 4,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Standing Side Bend',
          muscleGroups: ['obliques', 'abdominals']
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
  {
    title: 'JOUR 8: FULL BODY A (Poussée, Pectoraux, Épaules) — Lundi · S2 Accumulation',
    isRestDay: false,
    exercises: [
      {
        name: 'Développé couché haltères',
        sets: '5 × 12 (tempo 3-1-1)',
        equip: 'Haltères 15 kg',
        desc: 'Sur banc plat, poussez les haltères vers le haut en contrôlant la descente, amplitude complète. Pectoraux, triceps.',
        caloriesPerSet: [21, 24],
        totalSets: 5,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Dumbbell Bench Press',
          muscleGroups: ['chest', 'triceps', 'shoulders']
        }
      },
      {
        name: 'Squat sumo haltère',
        sets: '5 × 12 (tempo 3-1-1)',
        equip: 'Haltère 15 kg',
        desc: 'Pieds très écartés, pointes vers l\'extérieur, haltère tenu entre les jambes. Adducteurs + fessiers. Debout.',
        caloriesPerSet: [21, 24],
        totalSets: 5,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Sumo Squat',
          muscleGroups: ['glutes', 'adductors', 'quadriceps']
        }
      },
      {
        name: 'Développé Arnold haltères',
        sets: '4 × 15',
        equip: 'Haltères 15 kg',
        desc: 'Assis sur banc, paumes vers vous, tournez les poignets en poussant vers le haut. Tous les faisceaux de l\'épaule.',
        caloriesPerSet: [21, 24],
        totalSets: 4,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Arnold Press',
          muscleGroups: ['shoulders', 'triceps']
        }
      },
      {
        name: 'Kickback triceps haltère',
        sets: '4 × 15 /côté',
        equip: 'Haltère 10 kg',
        desc: 'Buste penché, coude collé au corps et fixe, tendez l\'avant-bras vers l\'arrière puis revenez. Isolation triceps.',
        caloriesPerSet: [12, 14],
        totalSets: 4,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Triceps Kickback',
          muscleGroups: ['triceps']
        }
      },
      {
        name: 'Élévations latérales haltères',
        sets: '4 × 15',
        equip: 'Haltères 10 kg',
        desc: 'Debout, montez les haltères latéralement jusqu\'aux épaules. Deltoïde moyen.',
        caloriesPerSet: [12, 14],
        totalSets: 4,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Lateral Raises',
          muscleGroups: ['shoulders']
        }
      },
      {
        name: 'Woodchopper haltère',
        sets: '4 × 18 /côté',
        equip: 'Haltère 10 kg',
        desc: 'Debout, amenez l\'haltère en diagonale de la hanche basse vers l\'épaule opposée puis inversez. Rotation du tronc, debout.',
        caloriesPerSet: [16, 18],
        totalSets: 4,
        nbRep: 18,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Dumbbell Woodchopper',
          muscleGroups: ['obliques', 'abdominals', 'core']
        }
      },
    ],
  },
  {
    title: 'JOUR 9: FULL BODY B (Tirage, Dos, Biceps) — Mardi · S2 Accumulation',
    isRestDay: false,
    exercises: [
      {
        name: 'Rowing barre buste penché',
        sets: '5 × 12 (tempo 3-1-1)',
        equip: 'Barre 30 kg',
        desc: 'Buste penché 45°, dos droit, tirez la barre vers le bas du ventre. Épaisseur du dos. Debout.',
        caloriesPerSet: [21, 24],
        totalSets: 5,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Bent Over Barbell Row',
          muscleGroups: ['back', 'biceps']
        }
      },
      {
        name: 'Soulevé de terre roumain (départ debout)',
        sets: '5 × 12 (tempo 3-1-1)',
        equip: 'Barre 30 kg',
        desc: 'Départ debout barre en mains, poussez les hanches en arrière et descendez la barre le long des cuisses, dos droit, sans poser au sol. Ischios + fessiers + lombaires.',
        caloriesPerSet: [21, 24],
        totalSets: 5,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Romanian Deadlift',
          muscleGroups: ['hamstrings', 'glutes', 'back']
        }
      },
      {
        name: 'Tirage menton barre (upright row)',
        sets: '4 × 15',
        equip: 'Barre 30 kg',
        desc: 'Debout, barre devant les cuisses, tirez-la vers le menton coudes hauts, sans monter au-delà des épaules. Trapèzes et deltoïdes.',
        caloriesPerSet: [21, 24],
        totalSets: 4,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Upright Row',
          muscleGroups: ['shoulders', 'trapezius']
        }
      },
      {
        name: 'Curl marteau haltères',
        sets: '4 × 15',
        equip: 'Haltères 15 kg',
        desc: 'Debout, paumes face à face, fléchissez les coudes sans balancer le buste. Biceps et brachial (épaisseur du bras).',
        caloriesPerSet: [16, 18],
        totalSets: 4,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Hammer Curl',
          muscleGroups: ['biceps', 'forearms']
        }
      },
      {
        name: 'Pullover haltère sur banc',
        sets: '4 × 15',
        equip: 'Haltère 15 kg',
        desc: 'Allongé en travers du banc, descendez l\'haltère derrière la tête bras tendus puis remontez. Grand dorsal. Sur banc.',
        caloriesPerSet: [16, 18],
        totalSets: 4,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Dumbbell Pullover',
          muscleGroups: ['back', 'chest']
        }
      },
      {
        name: 'Crunch latéral debout (side bend)',
        sets: '4 × 18 /côté',
        equip: 'Haltère 15 kg',
        desc: 'Debout, un haltère d\'un côté, inclinez le buste latéralement puis redressez en contractant l\'oblique. Debout, aucun appui au sol.',
        caloriesPerSet: [13, 15],
        totalSets: 4,
        nbRep: 18,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Standing Side Bend',
          muscleGroups: ['obliques', 'abdominals']
        }
      },
    ],
  },
  {
    title: 'JOUR 10: REPOS (Récupération) — Mercredi',
    isRestDay: true,
    exercises: [
    ],
  },
  {
    title: 'JOUR 11: FULL BODY C (Jambes, Fessiers) — Jeudi · S2 Accumulation',
    isRestDay: false,
    exercises: [
      {
        name: 'Fentes arrière alternées haltères',
        sets: '5 × 12 (tempo 3-1-1) en alternance',
        equip: 'Haltères 10 kg',
        desc: 'Un pas en arrière, descendez le genou arrière sans le poser, puis revenez debout. Alternez. Fessiers et ischios, plus doux pour les genoux que la fente avant.',
        caloriesPerSet: [21, 24],
        totalSets: 5,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Reverse Lunges',
          muscleGroups: ['glutes', 'hamstrings', 'quadriceps']
        }
      },
      {
        name: 'Soulevé de terre surélevé (rack pull)',
        sets: '5 × 12 (tempo 3-1-1)',
        equip: 'Barre 30 kg',
        desc: 'Barre posée à hauteur des genoux (cales/support), dos droit, tirez en poussant les hanches. JAMAIS depuis le sol : préserve le dos.',
        caloriesPerSet: [21, 24],
        totalSets: 5,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Rack Pull',
          muscleGroups: ['back', 'glutes', 'hamstrings']
        }
      },
      {
        name: 'Fentes bulgares haltères',
        sets: '4 × 15 /côté',
        equip: 'Haltères 10 kg',
        desc: 'Pied arrière surélevé sur le banc, descendez sur la jambe avant. Très efficace quadriceps et fessiers. Debout, zéro impact.',
        caloriesPerSet: [21, 24],
        totalSets: 4,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Bulgarian Split Squat',
          muscleGroups: ['quadriceps', 'glutes']
        }
      },
      {
        name: 'Extension de hanche debout',
        sets: '4 × 15 /côté',
        equip: 'Poids chevilles 4 kg',
        desc: 'Debout en appui léger, tendez la jambe vers l\'arrière en serrant le fessier, sans cambrer le bas du dos. Fessiers, 100% debout.',
        caloriesPerSet: [12, 14],
        totalSets: 4,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Standing Hip Extension',
          muscleGroups: ['glutes', 'hamstrings']
        }
      },
      {
        name: 'Mollets debout lestés',
        sets: '4 × 15',
        equip: 'Veste lestée 10 kg',
        desc: 'Debout, avant-pieds sur une cale ou le bord du banc, montez sur la pointe des pieds puis descendez lentement le talon. Mollets, zéro impact.',
        caloriesPerSet: [12, 14],
        totalSets: 4,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Standing Calf Raise',
          muscleGroups: ['calves']
        }
      },
      {
        name: 'Relevés de genoux debout',
        sets: '4 × 18 /côté',
        equip: 'Poids chevilles 4 kg',
        desc: 'Debout en appui léger, montez le genou vers la poitrine en contractant les abdos, alternez. Abdos bas, 100% debout.',
        caloriesPerSet: [16, 18],
        totalSets: 4,
        nbRep: 18,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Standing Knee Raises',
          muscleGroups: ['abdominals', 'core']
        }
      },
    ],
  },
  {
    title: 'JOUR 12: FULL BODY D (Haut du corps complet) — Vendredi · S2 Accumulation',
    isRestDay: false,
    exercises: [
      {
        name: 'Développé incliné barre',
        sets: '5 × 12 (tempo 3-1-1)',
        equip: 'Barre 30 kg',
        desc: 'Banc incliné 30-45°, poussez la barre vers le haut. Haut des pectoraux et épaules.',
        caloriesPerSet: [21, 24],
        totalSets: 5,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Incline Barbell Press',
          muscleGroups: ['chest', 'shoulders', 'triceps']
        }
      },
      {
        name: 'Pullover haltère sur banc',
        sets: '5 × 12 (tempo 3-1-1)',
        equip: 'Haltère 15 kg',
        desc: 'Allongé en travers du banc, descendez l\'haltère derrière la tête bras tendus puis remontez. Grand dorsal. Sur banc.',
        caloriesPerSet: [16, 18],
        totalSets: 5,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Dumbbell Pullover',
          muscleGroups: ['back', 'chest']
        }
      },
      {
        name: 'Élévations frontales haltères',
        sets: '4 × 15',
        equip: 'Haltères 10 kg',
        desc: 'Debout, montez les haltères devant vous jusqu\'aux épaules. Deltoïde antérieur.',
        caloriesPerSet: [12, 14],
        totalSets: 4,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Front Raises',
          muscleGroups: ['shoulders']
        }
      },
      {
        name: 'Curl biceps haltères',
        sets: '4 × 15',
        equip: 'Haltères 10 kg',
        desc: 'Debout, fléchissez les coudes pour monter les haltères vers les épaules sans balancer. Biceps.',
        caloriesPerSet: [12, 14],
        totalSets: 4,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Dumbbell Curl',
          muscleGroups: ['biceps']
        }
      },
      {
        name: 'Extension triceps nuque haltère',
        sets: '4 × 15',
        equip: 'Haltère 10 kg',
        desc: 'Debout ou assis, haltère derrière la nuque à deux mains, tendez les bras vers le haut. Triceps.',
        caloriesPerSet: [16, 18],
        totalSets: 4,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Overhead Triceps Extension',
          muscleGroups: ['triceps']
        }
      },
      {
        name: 'Woodchopper haltère',
        sets: '4 × 18 /côté',
        equip: 'Haltère 10 kg',
        desc: 'Debout, amenez l\'haltère en diagonale de la hanche basse vers l\'épaule opposée puis inversez. Rotation du tronc, debout.',
        caloriesPerSet: [16, 18],
        totalSets: 4,
        nbRep: 18,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Dumbbell Woodchopper',
          muscleGroups: ['obliques', 'abdominals', 'core']
        }
      },
    ],
  },
  {
    title: 'JOUR 13: FULL BODY E (Gainage, Fonctionnel) — Samedi · S2 Accumulation',
    isRestDay: false,
    exercises: [
      {
        name: 'Squat sumo haltère',
        sets: '5 × 12 (tempo 3-1-1)',
        equip: 'Haltère 15 kg',
        desc: 'Pieds très écartés, pointes vers l\'extérieur, haltère tenu entre les jambes. Adducteurs + fessiers. Debout.',
        caloriesPerSet: [21, 24],
        totalSets: 5,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Sumo Squat',
          muscleGroups: ['glutes', 'adductors', 'quadriceps']
        }
      },
      {
        name: 'Extension de hanche debout',
        sets: '4 × 15 /côté',
        equip: 'Poids chevilles 4 kg',
        desc: 'Debout en appui léger, tendez la jambe vers l\'arrière en serrant le fessier, sans cambrer le bas du dos. Fessiers, 100% debout.',
        caloriesPerSet: [12, 14],
        totalSets: 4,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Standing Hip Extension',
          muscleGroups: ['glutes', 'hamstrings']
        }
      },
      {
        name: 'Élévations latérales haltères',
        sets: '4 × 15',
        equip: 'Haltères 10 kg',
        desc: 'Debout, montez les haltères latéralement jusqu\'aux épaules. Deltoïde moyen.',
        caloriesPerSet: [12, 14],
        totalSets: 4,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Lateral Raises',
          muscleGroups: ['shoulders']
        }
      },
      {
        name: 'Marche du fermier (farmer carry)',
        sets: '4 × 60 s',
        equip: 'Haltères 15 kg',
        desc: 'Un haltère lourd dans chaque main, marchez tronc gainé et droit, épaules basses. Anti-flexion, core et grip, debout.',
        caloriesPerSet: [11, 12],
        totalSets: 4,
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
        name: 'Woodchopper haltère',
        sets: '4 × 18 /côté',
        equip: 'Haltère 10 kg',
        desc: 'Debout, amenez l\'haltère en diagonale de la hanche basse vers l\'épaule opposée puis inversez. Rotation du tronc, debout.',
        caloriesPerSet: [16, 18],
        totalSets: 4,
        nbRep: 18,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Dumbbell Woodchopper',
          muscleGroups: ['obliques', 'abdominals', 'core']
        }
      },
    ],
  },
  {
    title: 'JOUR 14: REPOS (Récupération) — Dimanche',
    isRestDay: true,
    exercises: [
    ],
  },
  {
    title: 'JOUR 15: FULL BODY A (Poussée, Pectoraux, Épaules) — Lundi · S3 Intensification',
    isRestDay: false,
    exercises: [
      {
        name: 'Développé incliné barre',
        sets: '5 × 10 (tempo lent, plus lourd)',
        equip: 'Barre 30 kg',
        desc: 'Banc incliné 30-45°, poussez la barre vers le haut. Haut des pectoraux et épaules.',
        caloriesPerSet: [21, 24],
        totalSets: 5,
        nbRep: 10,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Incline Barbell Press',
          muscleGroups: ['chest', 'shoulders', 'triceps']
        }
      },
      {
        name: 'Squat gobelet haltère',
        sets: '5 × 10 (tempo lent, plus lourd)',
        equip: 'Haltère 15 kg',
        desc: 'Debout, haltère tenu verticalement contre la poitrine, descendez en squat buste droit puis remontez. Quadriceps, fessiers, gainage. Debout.',
        caloriesPerSet: [21, 24],
        totalSets: 5,
        nbRep: 10,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Goblet Squat',
          muscleGroups: ['quadriceps', 'glutes', 'core']
        }
      },
      {
        name: 'Push press barre',
        sets: '5 × 12',
        equip: 'Barre 30 kg',
        desc: 'Debout, légère impulsion des jambes puis poussez la barre au-dessus de la tête. Épaules + puissance, zéro impact.',
        caloriesPerSet: [21, 24],
        totalSets: 5,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Push Press',
          muscleGroups: ['shoulders', 'triceps']
        }
      },
      {
        name: 'Extension triceps nuque haltère',
        sets: '5 × 12',
        equip: 'Haltère 10 kg',
        desc: 'Debout ou assis, haltère derrière la nuque à deux mains, tendez les bras vers le haut. Triceps.',
        caloriesPerSet: [16, 18],
        totalSets: 5,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Overhead Triceps Extension',
          muscleGroups: ['triceps']
        }
      },
      {
        name: 'Écarté haltères sur banc',
        sets: '5 × 12',
        equip: 'Haltères 10 kg',
        desc: 'Sur banc, bras légèrement fléchis, ouvrez les haltères en arc de cercle puis refermez au-dessus de la poitrine. Étirement des pectoraux.',
        caloriesPerSet: [16, 18],
        totalSets: 5,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Dumbbell Fly',
          muscleGroups: ['chest', 'shoulders']
        }
      },
      {
        name: 'Crunch latéral debout (side bend)',
        sets: '4 × 20 /côté',
        equip: 'Haltère 15 kg',
        desc: 'Debout, un haltère d\'un côté, inclinez le buste latéralement puis redressez en contractant l\'oblique. Debout, aucun appui au sol.',
        caloriesPerSet: [13, 15],
        totalSets: 4,
        nbRep: 20,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Standing Side Bend',
          muscleGroups: ['obliques', 'abdominals']
        }
      },
    ],
  },
  {
    title: 'JOUR 16: FULL BODY B (Tirage, Dos, Biceps) — Mardi · S3 Intensification',
    isRestDay: false,
    exercises: [
      {
        name: 'Rowing haltère un bras',
        sets: '5 × 10 (tempo lent, plus lourd) /côté',
        equip: 'Haltère 15 kg',
        desc: 'Un genou et une main sur le banc, tirez l\'haltère vers la hanche, coude près du corps. Appui sur banc, pas au sol.',
        caloriesPerSet: [21, 24],
        totalSets: 5,
        nbRep: 10,
        googleFitActivity: {
          type: 'strength_training',
          name: 'One Arm Dumbbell Row',
          muscleGroups: ['back', 'biceps']
        }
      },
      {
        name: 'Soulevé de terre surélevé (rack pull)',
        sets: '5 × 10 (tempo lent, plus lourd)',
        equip: 'Barre 30 kg',
        desc: 'Barre posée à hauteur des genoux (cales/support), dos droit, tirez en poussant les hanches. JAMAIS depuis le sol : préserve le dos.',
        caloriesPerSet: [21, 24],
        totalSets: 5,
        nbRep: 10,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Rack Pull',
          muscleGroups: ['back', 'glutes', 'hamstrings']
        }
      },
      {
        name: 'Oiseau haltères (arrière épaule)',
        sets: '5 × 12',
        equip: 'Haltères 10 kg',
        desc: 'Buste penché ou assis penché, montez les haltères sur les côtés en serrant les omoplates. Arrière de l\'épaule — corrige la posture.',
        caloriesPerSet: [12, 14],
        totalSets: 5,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Rear Delt Raise',
          muscleGroups: ['shoulders', 'back']
        }
      },
      {
        name: 'Curl concentré haltère',
        sets: '5 × 12 /côté',
        equip: 'Haltère 15 kg',
        desc: 'Assis sur banc, coude calé contre la cuisse, fléchissez le bras lentement. Isolation du biceps.',
        caloriesPerSet: [12, 14],
        totalSets: 5,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Concentration Curl',
          muscleGroups: ['biceps']
        }
      },
      {
        name: 'Shrugs barre (haussements)',
        sets: '5 × 12',
        equip: 'Barre 30 kg',
        desc: 'Debout, barre devant, haussez les épaules vers les oreilles sans plier les bras. Trapèzes.',
        caloriesPerSet: [16, 18],
        totalSets: 5,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Barbell Shrugs',
          muscleGroups: ['trapezius', 'back']
        }
      },
      {
        name: 'Relevés de genoux debout',
        sets: '4 × 20 /côté',
        equip: 'Poids chevilles 4 kg',
        desc: 'Debout en appui léger, montez le genou vers la poitrine en contractant les abdos, alternez. Abdos bas, 100% debout.',
        caloriesPerSet: [16, 18],
        totalSets: 4,
        nbRep: 20,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Standing Knee Raises',
          muscleGroups: ['abdominals', 'core']
        }
      },
    ],
  },
  {
    title: 'JOUR 17: REPOS (Récupération) — Mercredi',
    isRestDay: true,
    exercises: [
    ],
  },
  {
    title: 'JOUR 18: FULL BODY C (Jambes, Fessiers) — Jeudi · S3 Intensification',
    isRestDay: false,
    exercises: [
      {
        name: 'Squat barre',
        sets: '5 × 10 (tempo lent, plus lourd)',
        equip: 'Barre 30 kg',
        desc: 'Barre sur les trapèzes, descendez hanches sous parallèle si mobilité OK, puis remontez. Quadriceps, fessiers. Debout.',
        caloriesPerSet: [21, 24],
        totalSets: 5,
        nbRep: 10,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Barbell Squat',
          muscleGroups: ['quadriceps', 'glutes', 'hamstrings']
        }
      },
      {
        name: 'Soulevé de terre surélevé (rack pull)',
        sets: '5 × 10 (tempo lent, plus lourd)',
        equip: 'Barre 30 kg',
        desc: 'Barre posée à hauteur des genoux (cales/support), dos droit, tirez en poussant les hanches. JAMAIS depuis le sol : préserve le dos.',
        caloriesPerSet: [21, 24],
        totalSets: 5,
        nbRep: 10,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Rack Pull',
          muscleGroups: ['back', 'glutes', 'hamstrings']
        }
      },
      {
        name: 'Fentes avant alternées haltères',
        sets: '5 × 12 en alternance',
        equip: 'Haltères 10 kg',
        desc: 'Un pas en avant, descendez le genou arrière vers le sol sans le poser, puis remontez. Alternez. Quadriceps, fessiers, équilibre.',
        caloriesPerSet: [21, 24],
        totalSets: 5,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Walking Lunges',
          muscleGroups: ['quadriceps', 'glutes']
        }
      },
      {
        name: 'Mollets debout lestés',
        sets: '5 × 12',
        equip: 'Veste lestée 10 kg',
        desc: 'Debout, avant-pieds sur une cale ou le bord du banc, montez sur la pointe des pieds puis descendez lentement le talon. Mollets, zéro impact.',
        caloriesPerSet: [12, 14],
        totalSets: 5,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Standing Calf Raise',
          muscleGroups: ['calves']
        }
      },
      {
        name: 'Squat sumo haltère',
        sets: '5 × 12',
        equip: 'Haltère 15 kg',
        desc: 'Pieds très écartés, pointes vers l\'extérieur, haltère tenu entre les jambes. Adducteurs + fessiers. Debout.',
        caloriesPerSet: [21, 24],
        totalSets: 5,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Sumo Squat',
          muscleGroups: ['glutes', 'adductors', 'quadriceps']
        }
      },
      {
        name: 'Woodchopper haltère',
        sets: '4 × 20 /côté',
        equip: 'Haltère 10 kg',
        desc: 'Debout, amenez l\'haltère en diagonale de la hanche basse vers l\'épaule opposée puis inversez. Rotation du tronc, debout.',
        caloriesPerSet: [16, 18],
        totalSets: 4,
        nbRep: 20,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Dumbbell Woodchopper',
          muscleGroups: ['obliques', 'abdominals', 'core']
        }
      },
    ],
  },
  {
    title: 'JOUR 19: FULL BODY D (Haut du corps complet) — Vendredi · S3 Intensification',
    isRestDay: false,
    exercises: [
      {
        name: 'Développé couché haltères',
        sets: '5 × 10 (tempo lent, plus lourd)',
        equip: 'Haltères 15 kg',
        desc: 'Sur banc plat, poussez les haltères vers le haut en contrôlant la descente, amplitude complète. Pectoraux, triceps.',
        caloriesPerSet: [21, 24],
        totalSets: 5,
        nbRep: 10,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Dumbbell Bench Press',
          muscleGroups: ['chest', 'triceps', 'shoulders']
        }
      },
      {
        name: 'Rowing barre buste penché',
        sets: '5 × 10 (tempo lent, plus lourd)',
        equip: 'Barre 30 kg',
        desc: 'Buste penché 45°, dos droit, tirez la barre vers le bas du ventre. Épaisseur du dos. Debout.',
        caloriesPerSet: [21, 24],
        totalSets: 5,
        nbRep: 10,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Bent Over Barbell Row',
          muscleGroups: ['back', 'biceps']
        }
      },
      {
        name: 'Développé Arnold haltères',
        sets: '5 × 12',
        equip: 'Haltères 15 kg',
        desc: 'Assis sur banc, paumes vers vous, tournez les poignets en poussant vers le haut. Tous les faisceaux de l\'épaule.',
        caloriesPerSet: [21, 24],
        totalSets: 5,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Arnold Press',
          muscleGroups: ['shoulders', 'triceps']
        }
      },
      {
        name: 'Curl marteau haltères',
        sets: '5 × 12',
        equip: 'Haltères 15 kg',
        desc: 'Debout, paumes face à face, fléchissez les coudes sans balancer le buste. Biceps et brachial (épaisseur du bras).',
        caloriesPerSet: [16, 18],
        totalSets: 5,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Hammer Curl',
          muscleGroups: ['biceps', 'forearms']
        }
      },
      {
        name: 'Kickback triceps haltère',
        sets: '5 × 12 /côté',
        equip: 'Haltère 10 kg',
        desc: 'Buste penché, coude collé au corps et fixe, tendez l\'avant-bras vers l\'arrière puis revenez. Isolation triceps.',
        caloriesPerSet: [12, 14],
        totalSets: 5,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Triceps Kickback',
          muscleGroups: ['triceps']
        }
      },
      {
        name: 'Crunch latéral debout (side bend)',
        sets: '4 × 20 /côté',
        equip: 'Haltère 15 kg',
        desc: 'Debout, un haltère d\'un côté, inclinez le buste latéralement puis redressez en contractant l\'oblique. Debout, aucun appui au sol.',
        caloriesPerSet: [13, 15],
        totalSets: 4,
        nbRep: 20,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Standing Side Bend',
          muscleGroups: ['obliques', 'abdominals']
        }
      },
    ],
  },
  {
    title: 'JOUR 20: FULL BODY E (Gainage, Fonctionnel) — Samedi · S3 Intensification',
    isRestDay: false,
    exercises: [
      {
        name: 'Fentes bulgares haltères',
        sets: '5 × 10 (tempo lent, plus lourd) /côté',
        equip: 'Haltères 10 kg',
        desc: 'Pied arrière surélevé sur le banc, descendez sur la jambe avant. Très efficace quadriceps et fessiers. Debout, zéro impact.',
        caloriesPerSet: [21, 24],
        totalSets: 5,
        nbRep: 10,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Bulgarian Split Squat',
          muscleGroups: ['quadriceps', 'glutes']
        }
      },
      {
        name: 'Soulevé de terre roumain unilatéral haltère',
        sets: '5 × 12 /côté',
        equip: 'Haltère 15 kg',
        desc: 'Debout sur une jambe (main libre en appui léger si besoin), poussez la hanche en arrière et descendez l\'haltère le long de la jambe d\'appui, dos droit. Ischios, fessiers, équilibre.',
        caloriesPerSet: [21, 24],
        totalSets: 5,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Single Leg Romanian Deadlift',
          muscleGroups: ['hamstrings', 'glutes', 'core']
        }
      },
      {
        name: 'Fentes avant alternées haltères',
        sets: '5 × 12 en alternance',
        equip: 'Haltères 10 kg',
        desc: 'Un pas en avant, descendez le genou arrière vers le sol sans le poser, puis remontez. Alternez. Quadriceps, fessiers, équilibre.',
        caloriesPerSet: [21, 24],
        totalSets: 5,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Walking Lunges',
          muscleGroups: ['quadriceps', 'glutes']
        }
      },
      {
        name: 'Marche du fermier (farmer carry)',
        sets: '4 × 60 s',
        equip: 'Haltères 15 kg',
        desc: 'Un haltère lourd dans chaque main, marchez tronc gainé et droit, épaules basses. Anti-flexion, core et grip, debout.',
        caloriesPerSet: [11, 12],
        totalSets: 4,
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
        name: 'Relevés de genoux debout',
        sets: '4 × 20 /côté',
        equip: 'Poids chevilles 4 kg',
        desc: 'Debout en appui léger, montez le genou vers la poitrine en contractant les abdos, alternez. Abdos bas, 100% debout.',
        caloriesPerSet: [16, 18],
        totalSets: 4,
        nbRep: 20,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Standing Knee Raises',
          muscleGroups: ['abdominals', 'core']
        }
      },
    ],
  },
  {
    title: 'JOUR 21: REPOS (Récupération) — Dimanche',
    isRestDay: true,
    exercises: [
    ],
  },
  {
    title: 'JOUR 22: FULL BODY A (Poussée, Pectoraux, Épaules) — Lundi · S4 Allègement',
    isRestDay: false,
    exercises: [
      {
        name: 'Développé couché haltères',
        sets: '3 × 12 (allégé)',
        equip: 'Haltères 15 kg',
        desc: 'Sur banc plat, poussez les haltères vers le haut en contrôlant la descente, amplitude complète. Pectoraux, triceps.',
        caloriesPerSet: [21, 24],
        totalSets: 3,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Dumbbell Bench Press',
          muscleGroups: ['chest', 'triceps', 'shoulders']
        }
      },
      {
        name: 'Squat gobelet haltère',
        sets: '3 × 12 (allégé)',
        equip: 'Haltère 15 kg',
        desc: 'Debout, haltère tenu verticalement contre la poitrine, descendez en squat buste droit puis remontez. Quadriceps, fessiers, gainage. Debout.',
        caloriesPerSet: [21, 24],
        totalSets: 3,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Goblet Squat',
          muscleGroups: ['quadriceps', 'glutes', 'core']
        }
      },
      {
        name: 'Élévations latérales haltères',
        sets: '3 × 15 (allégé)',
        equip: 'Haltères 10 kg',
        desc: 'Debout, montez les haltères latéralement jusqu\'aux épaules. Deltoïde moyen.',
        caloriesPerSet: [12, 14],
        totalSets: 3,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Lateral Raises',
          muscleGroups: ['shoulders']
        }
      },
      {
        name: 'Kickback triceps haltère',
        sets: '3 × 15 (allégé) /côté',
        equip: 'Haltère 10 kg',
        desc: 'Buste penché, coude collé au corps et fixe, tendez l\'avant-bras vers l\'arrière puis revenez. Isolation triceps.',
        caloriesPerSet: [12, 14],
        totalSets: 3,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Triceps Kickback',
          muscleGroups: ['triceps']
        }
      },
      {
        name: 'Élévations frontales haltères',
        sets: '3 × 15 (allégé)',
        equip: 'Haltères 10 kg',
        desc: 'Debout, montez les haltères devant vous jusqu\'aux épaules. Deltoïde antérieur.',
        caloriesPerSet: [12, 14],
        totalSets: 3,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Front Raises',
          muscleGroups: ['shoulders']
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
    ],
  },
  {
    title: 'JOUR 23: FULL BODY B (Tirage, Dos, Biceps) — Mardi · S4 Allègement',
    isRestDay: false,
    exercises: [
      {
        name: 'Rowing haltères deux bras',
        sets: '3 × 12 (allégé)',
        equip: 'Haltères 15 kg',
        desc: 'Buste penché, tirez les deux haltères vers les hanches en serrant les omoplates. Dos complet. Debout.',
        caloriesPerSet: [21, 24],
        totalSets: 3,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Two Arm Dumbbell Row',
          muscleGroups: ['back', 'biceps']
        }
      },
      {
        name: 'Soulevé de terre roumain (départ debout)',
        sets: '3 × 12 (allégé)',
        equip: 'Barre 30 kg',
        desc: 'Départ debout barre en mains, poussez les hanches en arrière et descendez la barre le long des cuisses, dos droit, sans poser au sol. Ischios + fessiers + lombaires.',
        caloriesPerSet: [21, 24],
        totalSets: 3,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Romanian Deadlift',
          muscleGroups: ['hamstrings', 'glutes', 'back']
        }
      },
      {
        name: 'Shrugs barre (haussements)',
        sets: '3 × 15 (allégé)',
        equip: 'Barre 30 kg',
        desc: 'Debout, barre devant, haussez les épaules vers les oreilles sans plier les bras. Trapèzes.',
        caloriesPerSet: [16, 18],
        totalSets: 3,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Barbell Shrugs',
          muscleGroups: ['trapezius', 'back']
        }
      },
      {
        name: 'Curl biceps haltères',
        sets: '3 × 15 (allégé)',
        equip: 'Haltères 10 kg',
        desc: 'Debout, fléchissez les coudes pour monter les haltères vers les épaules sans balancer. Biceps.',
        caloriesPerSet: [12, 14],
        totalSets: 3,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Dumbbell Curl',
          muscleGroups: ['biceps']
        }
      },
      {
        name: 'Curl marteau haltères',
        sets: '3 × 15 (allégé)',
        equip: 'Haltères 15 kg',
        desc: 'Debout, paumes face à face, fléchissez les coudes sans balancer le buste. Biceps et brachial (épaisseur du bras).',
        caloriesPerSet: [16, 18],
        totalSets: 3,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Hammer Curl',
          muscleGroups: ['biceps', 'forearms']
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
    ],
  },
  {
    title: 'JOUR 24: REPOS (Récupération) — Mercredi',
    isRestDay: true,
    exercises: [
    ],
  },
  {
    title: 'JOUR 25: FULL BODY C (Jambes, Fessiers) — Jeudi · S4 Allègement',
    isRestDay: false,
    exercises: [
      {
        name: 'Squat gobelet haltère',
        sets: '3 × 12 (allégé)',
        equip: 'Haltère 15 kg',
        desc: 'Debout, haltère tenu verticalement contre la poitrine, descendez en squat buste droit puis remontez. Quadriceps, fessiers, gainage. Debout.',
        caloriesPerSet: [21, 24],
        totalSets: 3,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Goblet Squat',
          muscleGroups: ['quadriceps', 'glutes', 'core']
        }
      },
      {
        name: 'Soulevé de terre roumain (départ debout)',
        sets: '3 × 12 (allégé)',
        equip: 'Barre 30 kg',
        desc: 'Départ debout barre en mains, poussez les hanches en arrière et descendez la barre le long des cuisses, dos droit, sans poser au sol. Ischios + fessiers + lombaires.',
        caloriesPerSet: [21, 24],
        totalSets: 3,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Romanian Deadlift',
          muscleGroups: ['hamstrings', 'glutes', 'back']
        }
      },
      {
        name: 'Montées sur banc lestées',
        sets: '3 × 15 (allégé) /côté',
        equip: 'Haltères 10 kg',
        desc: 'Montez complètement sur un banc/marche stable, jambe motrice, contrôlez la descente. Alternez. Bas du corps fonctionnel, zéro impact.',
        caloriesPerSet: [16, 18],
        totalSets: 3,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Weighted Step-ups',
          muscleGroups: ['quadriceps', 'glutes']
        }
      },
      {
        name: 'Extension de hanche debout',
        sets: '3 × 15 (allégé) /côté',
        equip: 'Poids chevilles 4 kg',
        desc: 'Debout en appui léger, tendez la jambe vers l\'arrière en serrant le fessier, sans cambrer le bas du dos. Fessiers, 100% debout.',
        caloriesPerSet: [12, 14],
        totalSets: 3,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Standing Hip Extension',
          muscleGroups: ['glutes', 'hamstrings']
        }
      },
      {
        name: 'Mollets debout lestés',
        sets: '3 × 15 (allégé)',
        equip: 'Veste lestée 10 kg',
        desc: 'Debout, avant-pieds sur une cale ou le bord du banc, montez sur la pointe des pieds puis descendez lentement le talon. Mollets, zéro impact.',
        caloriesPerSet: [12, 14],
        totalSets: 3,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Standing Calf Raise',
          muscleGroups: ['calves']
        }
      },
      {
        name: 'Crunch latéral debout (side bend)',
        sets: '3 × 12 /côté',
        equip: 'Haltère 15 kg',
        desc: 'Debout, un haltère d\'un côté, inclinez le buste latéralement puis redressez en contractant l\'oblique. Debout, aucun appui au sol.',
        caloriesPerSet: [13, 15],
        totalSets: 3,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Standing Side Bend',
          muscleGroups: ['obliques', 'abdominals']
        }
      },
    ],
  },
  {
    title: 'JOUR 26: FULL BODY D (Haut du corps complet) — Vendredi · S4 Allègement',
    isRestDay: false,
    exercises: [
      {
        name: 'Écarté haltères sur banc',
        sets: '3 × 12 (allégé)',
        equip: 'Haltères 10 kg',
        desc: 'Sur banc, bras légèrement fléchis, ouvrez les haltères en arc de cercle puis refermez au-dessus de la poitrine. Étirement des pectoraux.',
        caloriesPerSet: [16, 18],
        totalSets: 3,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Dumbbell Fly',
          muscleGroups: ['chest', 'shoulders']
        }
      },
      {
        name: 'Rowing haltère un bras',
        sets: '3 × 12 (allégé) /côté',
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
        name: 'Élévations latérales haltères',
        sets: '3 × 15 (allégé)',
        equip: 'Haltères 10 kg',
        desc: 'Debout, montez les haltères latéralement jusqu\'aux épaules. Deltoïde moyen.',
        caloriesPerSet: [12, 14],
        totalSets: 3,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Lateral Raises',
          muscleGroups: ['shoulders']
        }
      },
      {
        name: 'Curl concentré haltère',
        sets: '3 × 15 (allégé) /côté',
        equip: 'Haltère 15 kg',
        desc: 'Assis sur banc, coude calé contre la cuisse, fléchissez le bras lentement. Isolation du biceps.',
        caloriesPerSet: [12, 14],
        totalSets: 3,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Concentration Curl',
          muscleGroups: ['biceps']
        }
      },
      {
        name: 'Extension triceps nuque haltère',
        sets: '3 × 15 (allégé)',
        equip: 'Haltère 10 kg',
        desc: 'Debout ou assis, haltère derrière la nuque à deux mains, tendez les bras vers le haut. Triceps.',
        caloriesPerSet: [16, 18],
        totalSets: 3,
        nbRep: 15,
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
    ],
  },
  {
    title: 'JOUR 27: FULL BODY E (Gainage, Fonctionnel) — Samedi · S4 Allègement',
    isRestDay: false,
    exercises: [
      {
        name: 'Squat gobelet haltère',
        sets: '3 × 12 (allégé)',
        equip: 'Haltère 15 kg',
        desc: 'Debout, haltère tenu verticalement contre la poitrine, descendez en squat buste droit puis remontez. Quadriceps, fessiers, gainage. Debout.',
        caloriesPerSet: [21, 24],
        totalSets: 3,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Goblet Squat',
          muscleGroups: ['quadriceps', 'glutes', 'core']
        }
      },
      {
        name: 'Mollets debout lestés',
        sets: '3 × 15 (allégé)',
        equip: 'Veste lestée 10 kg',
        desc: 'Debout, avant-pieds sur une cale ou le bord du banc, montez sur la pointe des pieds puis descendez lentement le talon. Mollets, zéro impact.',
        caloriesPerSet: [12, 14],
        totalSets: 3,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Standing Calf Raise',
          muscleGroups: ['calves']
        }
      },
      {
        name: 'Tirage menton barre (upright row)',
        sets: '3 × 15 (allégé)',
        equip: 'Barre 30 kg',
        desc: 'Debout, barre devant les cuisses, tirez-la vers le menton coudes hauts, sans monter au-delà des épaules. Trapèzes et deltoïdes.',
        caloriesPerSet: [21, 24],
        totalSets: 3,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Upright Row',
          muscleGroups: ['shoulders', 'trapezius']
        }
      },
      {
        name: 'Marche du fermier (farmer carry)',
        sets: '3 × 45 s',
        equip: 'Haltères 15 kg',
        desc: 'Un haltère lourd dans chaque main, marchez tronc gainé et droit, épaules basses. Anti-flexion, core et grip, debout.',
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
    ],
  },
  {
    title: 'JOUR 28: REPOS (Récupération) — Dimanche',
    isRestDay: true,
    exercises: [
    ],
  },
];

export const days = fullPlan;
