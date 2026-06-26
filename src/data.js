/**
 * PROGRAMME PERTE DE GRAS — refonte v2 (profil > 135 kg, confirmé, dos solide).
 * Split Push / Pull / Legs / Push / Pull (Lundi → Vendredi). Samedi marche, Dimanche repos.
 * 4 semaines : Adaptation → Accumulation → Intensification → Allègement (deload actif).
 * Adapté : 100% debout/banc (aucun appui au sol), ZÉRO saut (low-impact), hinge surélevé 2x/sem.
 * Matériel : haltères 5/10/15 kg, barre 30 kg, veste lestée 10 kg, poids chevilles 2×4 + 2×2 kg.
 * Chaque séance Lun-Ven brûle >= 500 kcal (compteur MET, s'adapte au poids — lit ~700-1100 à ton gabarit).
 * Généré par scratchpad/gen2.mjs — ne pas éditer à la main.
 */
const fullPlan = [
  {
    title: 'JOUR 1: PUSH A (Pectoraux, Épaules, Triceps) — S1 Adaptation',
    isRestDay: false,
    exercises: [
      {
        name: 'Développé couché barre',
        sets: '4 × 12 (tempo 3-1-1)',
        equip: 'Barre 30 kg',
        desc: 'Sur banc, descendez la barre vers la poitrine puis poussez, tempo contrôlé. Pectoraux. (Le banc est surélevé : pas d\'appui au sol.)',
        caloriesPerSet: [19, 22],
        totalSets: 4,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Barbell Bench Press',
          muscleGroups: ['chest', 'triceps', 'shoulders']
        }
      },
      {
        name: 'Développé militaire barre',
        sets: '4 × 12 (tempo 3-1-1)',
        equip: 'Barre 30 kg',
        desc: 'Debout, gainé, poussez la barre au-dessus de la tête sans cambrer. Épaules complètes. 100% debout.',
        caloriesPerSet: [19, 22],
        totalSets: 4,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Military Press',
          muscleGroups: ['shoulders', 'triceps']
        }
      },
      {
        name: 'Développé incliné haltères',
        sets: '4 × 12 (tempo 3-1-1)',
        equip: 'Haltères 15 kg',
        desc: 'Banc incliné, poussez les haltères vers le haut en contrôlant la descente. Haut des pectoraux.',
        caloriesPerSet: [19, 22],
        totalSets: 4,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Incline Dumbbell Press',
          muscleGroups: ['chest', 'shoulders', 'triceps']
        }
      },
      {
        name: 'Élévations latérales haltères',
        sets: '3 × 15',
        equip: 'Haltères 10 kg',
        desc: 'Debout, montez les haltères latéralement jusqu\'aux épaules. Deltoïde moyen.',
        caloriesPerSet: [11, 13],
        totalSets: 3,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Lateral Raises',
          muscleGroups: ['shoulders']
        }
      },
      {
        name: 'Extension triceps nuque haltère',
        sets: '3 × 15',
        equip: 'Haltères 10 kg',
        desc: 'Debout ou assis, haltère derrière la nuque à deux mains, tendez les bras vers le haut. Triceps.',
        caloriesPerSet: [14, 17],
        totalSets: 3,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Overhead Triceps Extension',
          muscleGroups: ['triceps']
        }
      },
      {
        name: 'Thrusters haltères',
        sets: '3 × 15',
        equip: 'Haltères 10 kg',
        desc: 'Squat haltères aux épaules puis remontée et développé au-dessus de la tête, en continu. Corps entier, zéro impact.',
        caloriesPerSet: [25, 29],
        totalSets: 3,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Dumbbell Thrusters',
          muscleGroups: ['quadriceps', 'shoulders', 'glutes']
        }
      },
      {
        name: 'Circuit complexe haltères (HIIT)',
        sets: '12 min (40 s / 20 s)',
        equip: 'Haltères 10 kg',
        desc: 'Circuit debout en continu : épaulé + développé + squat + rowing aux haltères, 40 s d\'effort / 20 s de repos jusqu\'à la fin du chrono. Moteur métabolique, zéro impact.',
        caloriesPerSet: [202, 235],
        totalSets: 1,
        nbRep: 0,
        timer: true,
        duration: 720,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Dumbbell Complex Circuit',
          muscleGroups: ['full_body']
        }
      },
      {
        name: 'Crunch latéral debout (side bend)',
        sets: '3 × 15 /côté',
        equip: 'Haltère 15 kg',
        desc: 'Debout, un haltère d\'un côté, inclinez le buste latéralement puis redressez en contractant l\'oblique. Debout, aucun appui au sol.',
        caloriesPerSet: [12, 14],
        totalSets: 6,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Standing Side Bend',
          muscleGroups: ['obliques', 'abdominals']
        }
      },
      {
        name: 'Relevés de genoux debout',
        sets: '3 × 15 /côté',
        equip: 'Poids chevilles 4 kg',
        desc: 'Debout en appui léger, montez le genou vers la poitrine en contractant les abdos, alternez. Abdos bas, 100% debout.',
        caloriesPerSet: [14, 17],
        totalSets: 6,
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
    title: 'JOUR 2: PULL A (Dos, Biceps, Arrière épaule) — S1 Adaptation',
    isRestDay: false,
    exercises: [
      {
        name: 'Rowing barre buste penché',
        sets: '4 × 12 (tempo 3-1-1)',
        equip: 'Barre 30 kg',
        desc: 'Buste penché 45°, dos droit, tirez la barre vers le bas du ventre. Épaisseur du dos. Debout.',
        caloriesPerSet: [19, 22],
        totalSets: 4,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Bent Over Barbell Row',
          muscleGroups: ['back', 'biceps']
        }
      },
      {
        name: 'Soulevé de terre surélevé (rack pull)',
        sets: '4 × 12 (tempo 3-1-1)',
        equip: 'Barre 30 kg',
        desc: 'Barre posée à hauteur des genoux (cales/support), dos droit, tirez en poussant les hanches. JAMAIS depuis le sol : préserve le dos et contourne la gêne du buste.',
        caloriesPerSet: [19, 22],
        totalSets: 4,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Rack Pull',
          muscleGroups: ['back', 'glutes', 'hamstrings']
        }
      },
      {
        name: 'Rowing haltère un bras',
        sets: '4 × 12 (tempo 3-1-1) /côté',
        equip: 'Haltère 15 kg',
        desc: 'Un genou et une main sur le banc, tirez l\'haltère vers la hanche, coude près du corps. Appui sur banc, pas au sol.',
        caloriesPerSet: [19, 22],
        totalSets: 8,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'One Arm Dumbbell Row',
          muscleGroups: ['back', 'biceps']
        }
      },
      {
        name: 'Curl biceps haltères',
        sets: '3 × 15',
        equip: 'Haltères 15 kg',
        desc: 'Debout, fléchissez les coudes pour monter les haltères vers les épaules sans balancer. Biceps.',
        caloriesPerSet: [11, 13],
        totalSets: 3,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Dumbbell Curl',
          muscleGroups: ['biceps']
        }
      },
      {
        name: 'Oiseau haltères (arrière épaule)',
        sets: '3 × 15',
        equip: 'Haltères 10 kg',
        desc: 'Buste penché ou assis penché, montez les haltères sur les côtés en serrant les omoplates. Arrière de l\'épaule — corrige la posture.',
        caloriesPerSet: [11, 13],
        totalSets: 3,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Rear Delt Raise',
          muscleGroups: ['shoulders', 'back']
        }
      },
      {
        name: 'Swing haltère',
        sets: '3 × 15',
        equip: 'Haltère 15 kg',
        desc: 'Balancez l\'haltère entre les jambes puis projetez-le à hauteur des yeux par poussée explosive des hanches. Puissant mais sans impact au sol.',
        caloriesPerSet: [14, 17],
        totalSets: 3,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Dumbbell Swing',
          muscleGroups: ['glutes', 'hamstrings', 'back']
        }
      },
      {
        name: 'Circuit thrusters + swings (HIIT debout)',
        sets: '12 min (40 s / 20 s)',
        equip: 'Haltères 10 kg',
        desc: 'Circuit debout en continu : thrusters, swings, montées de genoux — 40 s d\'effort / 20 s de repos jusqu\'à la fin du chrono. Zéro saut, zéro sol, gros débit calorique.',
        caloriesPerSet: [202, 235],
        totalSets: 1,
        nbRep: 0,
        timer: true,
        duration: 720,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Standing HIIT Circuit',
          muscleGroups: ['full_body']
        }
      },
      {
        name: 'Woodchopper haltère',
        sets: '3 × 15 /côté',
        equip: 'Haltère 10 kg',
        desc: 'Debout, amenez l\'haltère en diagonale de la hanche basse vers l\'épaule opposée puis inversez. Rotation du tronc, debout.',
        caloriesPerSet: [14, 17],
        totalSets: 6,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Dumbbell Woodchopper',
          muscleGroups: ['obliques', 'abdominals', 'core']
        }
      },
      {
        name: 'Marche du fermier (farmer carry)',
        sets: '3 × 60 s',
        equip: 'Haltères 15 kg',
        desc: 'Un haltère lourd dans chaque main, marchez 60 s tronc gainé et droit, épaules basses. Anti-flexion, core et grip, debout.',
        caloriesPerSet: [9, 11],
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
    ],
  },
  {
    title: 'JOUR 3: LEGS (Quadriceps, Fessiers, Mollets) — S1 Adaptation',
    isRestDay: false,
    exercises: [
      {
        name: 'Squat barre',
        sets: '4 × 12 (tempo 3-1-1)',
        equip: 'Barre 30 kg',
        desc: 'Barre sur les trapèzes, descendez hanches sous parallèle si mobilité OK, puis remontez. Quadriceps, fessiers. Debout.',
        caloriesPerSet: [19, 22],
        totalSets: 4,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Barbell Squat',
          muscleGroups: ['quadriceps', 'glutes', 'hamstrings']
        }
      },
      {
        name: 'Fentes avant alternées haltères',
        sets: '4 × 12 (tempo 3-1-1) /côté',
        equip: 'Haltères 15 kg',
        desc: 'Un pas en avant, descendez le genou arrière vers le sol sans le poser, puis remontez. Alternez. Quadriceps, fessiers, équilibre.',
        caloriesPerSet: [19, 22],
        totalSets: 8,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Walking Lunges',
          muscleGroups: ['quadriceps', 'glutes']
        }
      },
      {
        name: 'Fentes bulgares haltères',
        sets: '4 × 12 (tempo 3-1-1) /côté',
        equip: 'Haltères 15 kg',
        desc: 'Pied arrière surélevé sur le banc, descendez sur la jambe avant. Très efficace quadriceps et fessiers. Debout, zéro impact.',
        caloriesPerSet: [19, 22],
        totalSets: 8,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Bulgarian Split Squat',
          muscleGroups: ['quadriceps', 'glutes']
        }
      },
      {
        name: 'Montées sur banc lestées',
        sets: '4 × 12 (tempo 3-1-1) /côté',
        equip: 'Haltères 15 kg',
        desc: 'Montez complètement sur un banc/marche stable, jambe motrice, contrôlez la descente. Alternez. Bas du corps fonctionnel, zéro impact.',
        caloriesPerSet: [14, 17],
        totalSets: 8,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Weighted Step-ups',
          muscleGroups: ['quadriceps', 'glutes']
        }
      },
      {
        name: 'Squat sumo haltère',
        sets: '3 × 15',
        equip: 'Haltère 15 kg',
        desc: 'Pieds très écartés, pointes vers l\'extérieur, haltère tenu entre les jambes. Adducteurs + fessiers. Debout.',
        caloriesPerSet: [19, 22],
        totalSets: 3,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Sumo Squat',
          muscleGroups: ['glutes', 'adductors', 'quadriceps']
        }
      },
      {
        name: 'Thrusters haltères',
        sets: '3 × 15',
        equip: 'Haltères 10 kg',
        desc: 'Squat haltères aux épaules puis remontée et développé au-dessus de la tête, en continu. Corps entier, zéro impact.',
        caloriesPerSet: [25, 29],
        totalSets: 3,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Dumbbell Thrusters',
          muscleGroups: ['quadriceps', 'shoulders', 'glutes']
        }
      },
      {
        name: 'Circuit thrusters + swings (HIIT debout)',
        sets: '12 min (40 s / 20 s)',
        equip: 'Haltères 10 kg',
        desc: 'Circuit debout en continu : thrusters, swings, montées de genoux — 40 s d\'effort / 20 s de repos jusqu\'à la fin du chrono. Zéro saut, zéro sol, gros débit calorique.',
        caloriesPerSet: [202, 235],
        totalSets: 1,
        nbRep: 0,
        timer: true,
        duration: 720,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Standing HIIT Circuit',
          muscleGroups: ['full_body']
        }
      },
      {
        name: 'Crunch latéral debout (side bend)',
        sets: '3 × 15 /côté',
        equip: 'Haltère 15 kg',
        desc: 'Debout, un haltère d\'un côté, inclinez le buste latéralement puis redressez en contractant l\'oblique. Debout, aucun appui au sol.',
        caloriesPerSet: [12, 14],
        totalSets: 6,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Standing Side Bend',
          muscleGroups: ['obliques', 'abdominals']
        }
      },
      {
        name: 'Woodchopper haltère',
        sets: '3 × 15 /côté',
        equip: 'Haltère 10 kg',
        desc: 'Debout, amenez l\'haltère en diagonale de la hanche basse vers l\'épaule opposée puis inversez. Rotation du tronc, debout.',
        caloriesPerSet: [14, 17],
        totalSets: 6,
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
    title: 'JOUR 4: PUSH B (Épaules, Pectoraux, Triceps) — S1 Adaptation',
    isRestDay: false,
    exercises: [
      {
        name: 'Développé Arnold haltères',
        sets: '4 × 12 (tempo 3-1-1)',
        equip: 'Haltères 15 kg',
        desc: 'Assis sur banc, paumes vers vous, tournez les poignets en poussant vers le haut. Tous les faisceaux de l\'épaule.',
        caloriesPerSet: [19, 22],
        totalSets: 4,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Arnold Press',
          muscleGroups: ['shoulders', 'triceps']
        }
      },
      {
        name: 'Développé incliné barre',
        sets: '4 × 12 (tempo 3-1-1)',
        equip: 'Barre 30 kg',
        desc: 'Banc incliné 30-45°, poussez la barre vers le haut. Haut des pectoraux et épaules.',
        caloriesPerSet: [19, 22],
        totalSets: 4,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Incline Barbell Press',
          muscleGroups: ['chest', 'shoulders', 'triceps']
        }
      },
      {
        name: 'Push press barre',
        sets: '4 × 12 (tempo 3-1-1)',
        equip: 'Barre 30 kg',
        desc: 'Debout, légère impulsion des jambes puis poussez la barre au-dessus de la tête. Épaules + puissance, zéro impact.',
        caloriesPerSet: [19, 22],
        totalSets: 4,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Push Press',
          muscleGroups: ['shoulders', 'triceps']
        }
      },
      {
        name: 'Élévations frontales haltères',
        sets: '3 × 15',
        equip: 'Haltères 10 kg',
        desc: 'Debout, montez les haltères devant vous jusqu\'aux épaules. Deltoïde antérieur.',
        caloriesPerSet: [11, 13],
        totalSets: 3,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Front Raises',
          muscleGroups: ['shoulders']
        }
      },
      {
        name: 'Oiseau haltères (arrière épaule)',
        sets: '3 × 15',
        equip: 'Haltères 10 kg',
        desc: 'Buste penché ou assis penché, montez les haltères sur les côtés en serrant les omoplates. Arrière de l\'épaule — corrige la posture.',
        caloriesPerSet: [11, 13],
        totalSets: 3,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Rear Delt Raise',
          muscleGroups: ['shoulders', 'back']
        }
      },
      {
        name: 'Thrusters haltères',
        sets: '3 × 15',
        equip: 'Haltères 10 kg',
        desc: 'Squat haltères aux épaules puis remontée et développé au-dessus de la tête, en continu. Corps entier, zéro impact.',
        caloriesPerSet: [25, 29],
        totalSets: 3,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Dumbbell Thrusters',
          muscleGroups: ['quadriceps', 'shoulders', 'glutes']
        }
      },
      {
        name: 'Circuit complexe haltères (HIIT)',
        sets: '12 min (40 s / 20 s)',
        equip: 'Haltères 10 kg',
        desc: 'Circuit debout en continu : épaulé + développé + squat + rowing aux haltères, 40 s d\'effort / 20 s de repos jusqu\'à la fin du chrono. Moteur métabolique, zéro impact.',
        caloriesPerSet: [202, 235],
        totalSets: 1,
        nbRep: 0,
        timer: true,
        duration: 720,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Dumbbell Complex Circuit',
          muscleGroups: ['full_body']
        }
      },
      {
        name: 'Woodchopper haltère',
        sets: '3 × 15 /côté',
        equip: 'Haltère 10 kg',
        desc: 'Debout, amenez l\'haltère en diagonale de la hanche basse vers l\'épaule opposée puis inversez. Rotation du tronc, debout.',
        caloriesPerSet: [14, 17],
        totalSets: 6,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Dumbbell Woodchopper',
          muscleGroups: ['obliques', 'abdominals', 'core']
        }
      },
      {
        name: 'Relevés de genoux debout',
        sets: '3 × 15 /côté',
        equip: 'Poids chevilles 4 kg',
        desc: 'Debout en appui léger, montez le genou vers la poitrine en contractant les abdos, alternez. Abdos bas, 100% debout.',
        caloriesPerSet: [14, 17],
        totalSets: 6,
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
    title: 'JOUR 5: PULL B (Dos, Trapèzes, Biceps) — S1 Adaptation',
    isRestDay: false,
    exercises: [
      {
        name: 'Soulevé de terre roumain (départ debout)',
        sets: '4 × 12 (tempo 3-1-1)',
        equip: 'Barre 30 kg',
        desc: 'Départ debout barre en mains, poussez les hanches en arrière et descendez la barre le long des cuisses, dos droit, sans poser au sol. Ischios + fessiers + lombaires.',
        caloriesPerSet: [19, 22],
        totalSets: 4,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Romanian Deadlift',
          muscleGroups: ['hamstrings', 'glutes', 'back']
        }
      },
      {
        name: 'Rowing haltères deux bras',
        sets: '4 × 12 (tempo 3-1-1)',
        equip: 'Haltères 15 kg',
        desc: 'Buste penché, tirez les deux haltères vers les hanches en serrant les omoplates. Dos complet. Debout.',
        caloriesPerSet: [19, 22],
        totalSets: 4,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Two Arm Dumbbell Row',
          muscleGroups: ['back', 'biceps']
        }
      },
      {
        name: 'Pullover haltère sur banc',
        sets: '4 × 12 (tempo 3-1-1)',
        equip: 'Haltère 15 kg',
        desc: 'Allongé en travers du banc, descendez l\'haltère derrière la tête bras tendus puis remontez. Grand dorsal. Sur banc.',
        caloriesPerSet: [14, 17],
        totalSets: 4,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Dumbbell Pullover',
          muscleGroups: ['back', 'chest']
        }
      },
      {
        name: 'Shrugs barre (haussements)',
        sets: '3 × 15',
        equip: 'Barre 30 kg',
        desc: 'Debout, barre devant, haussez les épaules vers les oreilles sans plier les bras. Trapèzes.',
        caloriesPerSet: [14, 17],
        totalSets: 3,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Barbell Shrugs',
          muscleGroups: ['trapezius', 'back']
        }
      },
      {
        name: 'Curl concentré haltère',
        sets: '3 × 15 /côté',
        equip: 'Haltère 15 kg',
        desc: 'Assis sur banc, coude calé contre la cuisse, fléchissez le bras lentement. Isolation du biceps.',
        caloriesPerSet: [11, 13],
        totalSets: 6,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Concentration Curl',
          muscleGroups: ['biceps']
        }
      },
      {
        name: 'Swing haltère',
        sets: '3 × 15',
        equip: 'Haltère 15 kg',
        desc: 'Balancez l\'haltère entre les jambes puis projetez-le à hauteur des yeux par poussée explosive des hanches. Puissant mais sans impact au sol.',
        caloriesPerSet: [14, 17],
        totalSets: 3,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Dumbbell Swing',
          muscleGroups: ['glutes', 'hamstrings', 'back']
        }
      },
      {
        name: 'Circuit thrusters + swings (HIIT debout)',
        sets: '12 min (40 s / 20 s)',
        equip: 'Haltères 10 kg',
        desc: 'Circuit debout en continu : thrusters, swings, montées de genoux — 40 s d\'effort / 20 s de repos jusqu\'à la fin du chrono. Zéro saut, zéro sol, gros débit calorique.',
        caloriesPerSet: [202, 235],
        totalSets: 1,
        nbRep: 0,
        timer: true,
        duration: 720,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Standing HIIT Circuit',
          muscleGroups: ['full_body']
        }
      },
      {
        name: 'Crunch latéral debout (side bend)',
        sets: '3 × 15 /côté',
        equip: 'Haltère 15 kg',
        desc: 'Debout, un haltère d\'un côté, inclinez le buste latéralement puis redressez en contractant l\'oblique. Debout, aucun appui au sol.',
        caloriesPerSet: [12, 14],
        totalSets: 6,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Standing Side Bend',
          muscleGroups: ['obliques', 'abdominals']
        }
      },
      {
        name: 'Marche du fermier (farmer carry)',
        sets: '3 × 60 s',
        equip: 'Haltères 15 kg',
        desc: 'Un haltère lourd dans chaque main, marchez 60 s tronc gainé et droit, épaules basses. Anti-flexion, core et grip, debout.',
        caloriesPerSet: [9, 11],
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
    ],
  },
  {
    title: 'JOUR 6: MARCHE (Récupération active) — S1',
    isRestDay: false,
    exercises: [
      {
        name: 'Marche rapide',
        sets: '45 min',
        equip: 'Veste lestée 10 kg (optionnel)',
        desc: '45 min de marche rapide, idéalement en côte ou avec la veste lestée. Récupération active à fort débit lipidique, zéro impact.',
        caloriesPerSet: [425, 496],
        totalSets: 1,
        nbRep: 0,
        timer: true,
        duration: 2700,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Brisk Walk',
          muscleGroups: ['full_body']
        }
      },
      {
        name: 'Mobilité articulaire',
        sets: '10 min',
        equip: 'Aucun',
        desc: '10 min de mobilité debout (épaules, hanches, chevilles). Entretient l\'amplitude, limite les blessures.',
        caloriesPerSet: [95, 110],
        totalSets: 1,
        nbRep: 0,
        timer: true,
        duration: 600,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Joint Mobility',
          muscleGroups: ['full_body']
        }
      },
    ],
  },
  {
    title: 'JOUR 7: REPOS COMPLET — S1',
    isRestDay: true,
    exercises: [

    ],
  },
  {
    title: 'JOUR 8: PUSH A (Pectoraux, Épaules, Triceps) — S2 Accumulation',
    isRestDay: false,
    exercises: [
      {
        name: 'Développé couché barre',
        sets: '5 × 12-15',
        equip: 'Barre 30 kg',
        desc: 'Sur banc, descendez la barre vers la poitrine puis poussez, tempo contrôlé. Pectoraux. (Le banc est surélevé : pas d\'appui au sol.)',
        caloriesPerSet: [19, 22],
        totalSets: 5,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Barbell Bench Press',
          muscleGroups: ['chest', 'triceps', 'shoulders']
        }
      },
      {
        name: 'Développé militaire barre',
        sets: '5 × 12-15',
        equip: 'Barre 30 kg',
        desc: 'Debout, gainé, poussez la barre au-dessus de la tête sans cambrer. Épaules complètes. 100% debout.',
        caloriesPerSet: [19, 22],
        totalSets: 5,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Military Press',
          muscleGroups: ['shoulders', 'triceps']
        }
      },
      {
        name: 'Développé incliné haltères',
        sets: '5 × 12-15',
        equip: 'Haltères 15 kg',
        desc: 'Banc incliné, poussez les haltères vers le haut en contrôlant la descente. Haut des pectoraux.',
        caloriesPerSet: [19, 22],
        totalSets: 5,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Incline Dumbbell Press',
          muscleGroups: ['chest', 'shoulders', 'triceps']
        }
      },
      {
        name: 'Élévations latérales haltères',
        sets: '3 × 15',
        equip: 'Haltères 10 kg',
        desc: 'Debout, montez les haltères latéralement jusqu\'aux épaules. Deltoïde moyen.',
        caloriesPerSet: [11, 13],
        totalSets: 3,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Lateral Raises',
          muscleGroups: ['shoulders']
        }
      },
      {
        name: 'Extension triceps nuque haltère',
        sets: '3 × 15',
        equip: 'Haltères 10 kg',
        desc: 'Debout ou assis, haltère derrière la nuque à deux mains, tendez les bras vers le haut. Triceps.',
        caloriesPerSet: [14, 17],
        totalSets: 3,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Overhead Triceps Extension',
          muscleGroups: ['triceps']
        }
      },
      {
        name: 'Thrusters haltères',
        sets: '4 × 15',
        equip: 'Haltères 10 kg',
        desc: 'Squat haltères aux épaules puis remontée et développé au-dessus de la tête, en continu. Corps entier, zéro impact.',
        caloriesPerSet: [25, 29],
        totalSets: 4,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Dumbbell Thrusters',
          muscleGroups: ['quadriceps', 'shoulders', 'glutes']
        }
      },
      {
        name: 'Circuit complexe haltères (HIIT)',
        sets: '14 min (40 s / 20 s)',
        equip: 'Haltères 10 kg',
        desc: 'Circuit debout en continu : épaulé + développé + squat + rowing aux haltères, 40 s d\'effort / 20 s de repos jusqu\'à la fin du chrono. Moteur métabolique, zéro impact.',
        caloriesPerSet: [235, 274],
        totalSets: 1,
        nbRep: 0,
        timer: true,
        duration: 840,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Dumbbell Complex Circuit',
          muscleGroups: ['full_body']
        }
      },
      {
        name: 'Crunch latéral debout (side bend)',
        sets: '3 × 18 /côté',
        equip: 'Haltère 15 kg',
        desc: 'Debout, un haltère d\'un côté, inclinez le buste latéralement puis redressez en contractant l\'oblique. Debout, aucun appui au sol.',
        caloriesPerSet: [12, 14],
        totalSets: 6,
        nbRep: 18,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Standing Side Bend',
          muscleGroups: ['obliques', 'abdominals']
        }
      },
      {
        name: 'Relevés de genoux debout',
        sets: '3 × 18 /côté',
        equip: 'Poids chevilles 4 kg',
        desc: 'Debout en appui léger, montez le genou vers la poitrine en contractant les abdos, alternez. Abdos bas, 100% debout.',
        caloriesPerSet: [14, 17],
        totalSets: 6,
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
    title: 'JOUR 9: PULL A (Dos, Biceps, Arrière épaule) — S2 Accumulation',
    isRestDay: false,
    exercises: [
      {
        name: 'Rowing barre buste penché',
        sets: '5 × 12-15',
        equip: 'Barre 30 kg',
        desc: 'Buste penché 45°, dos droit, tirez la barre vers le bas du ventre. Épaisseur du dos. Debout.',
        caloriesPerSet: [19, 22],
        totalSets: 5,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Bent Over Barbell Row',
          muscleGroups: ['back', 'biceps']
        }
      },
      {
        name: 'Soulevé de terre surélevé (rack pull)',
        sets: '5 × 12-15',
        equip: 'Barre 30 kg',
        desc: 'Barre posée à hauteur des genoux (cales/support), dos droit, tirez en poussant les hanches. JAMAIS depuis le sol : préserve le dos et contourne la gêne du buste.',
        caloriesPerSet: [19, 22],
        totalSets: 5,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Rack Pull',
          muscleGroups: ['back', 'glutes', 'hamstrings']
        }
      },
      {
        name: 'Rowing haltère un bras',
        sets: '5 × 12-15 /côté',
        equip: 'Haltère 15 kg',
        desc: 'Un genou et une main sur le banc, tirez l\'haltère vers la hanche, coude près du corps. Appui sur banc, pas au sol.',
        caloriesPerSet: [19, 22],
        totalSets: 10,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'One Arm Dumbbell Row',
          muscleGroups: ['back', 'biceps']
        }
      },
      {
        name: 'Curl biceps haltères',
        sets: '3 × 15',
        equip: 'Haltères 15 kg',
        desc: 'Debout, fléchissez les coudes pour monter les haltères vers les épaules sans balancer. Biceps.',
        caloriesPerSet: [11, 13],
        totalSets: 3,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Dumbbell Curl',
          muscleGroups: ['biceps']
        }
      },
      {
        name: 'Oiseau haltères (arrière épaule)',
        sets: '3 × 15',
        equip: 'Haltères 10 kg',
        desc: 'Buste penché ou assis penché, montez les haltères sur les côtés en serrant les omoplates. Arrière de l\'épaule — corrige la posture.',
        caloriesPerSet: [11, 13],
        totalSets: 3,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Rear Delt Raise',
          muscleGroups: ['shoulders', 'back']
        }
      },
      {
        name: 'Swing haltère',
        sets: '4 × 15',
        equip: 'Haltère 15 kg',
        desc: 'Balancez l\'haltère entre les jambes puis projetez-le à hauteur des yeux par poussée explosive des hanches. Puissant mais sans impact au sol.',
        caloriesPerSet: [14, 17],
        totalSets: 4,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Dumbbell Swing',
          muscleGroups: ['glutes', 'hamstrings', 'back']
        }
      },
      {
        name: 'Circuit thrusters + swings (HIIT debout)',
        sets: '14 min (40 s / 20 s)',
        equip: 'Haltères 10 kg',
        desc: 'Circuit debout en continu : thrusters, swings, montées de genoux — 40 s d\'effort / 20 s de repos jusqu\'à la fin du chrono. Zéro saut, zéro sol, gros débit calorique.',
        caloriesPerSet: [235, 274],
        totalSets: 1,
        nbRep: 0,
        timer: true,
        duration: 840,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Standing HIIT Circuit',
          muscleGroups: ['full_body']
        }
      },
      {
        name: 'Woodchopper haltère',
        sets: '3 × 18 /côté',
        equip: 'Haltère 10 kg',
        desc: 'Debout, amenez l\'haltère en diagonale de la hanche basse vers l\'épaule opposée puis inversez. Rotation du tronc, debout.',
        caloriesPerSet: [14, 17],
        totalSets: 6,
        nbRep: 18,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Dumbbell Woodchopper',
          muscleGroups: ['obliques', 'abdominals', 'core']
        }
      },
      {
        name: 'Marche du fermier (farmer carry)',
        sets: '3 × 60 s',
        equip: 'Haltères 15 kg',
        desc: 'Un haltère lourd dans chaque main, marchez 60 s tronc gainé et droit, épaules basses. Anti-flexion, core et grip, debout.',
        caloriesPerSet: [9, 11],
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
    ],
  },
  {
    title: 'JOUR 10: LEGS (Quadriceps, Fessiers, Mollets) — S2 Accumulation',
    isRestDay: false,
    exercises: [
      {
        name: 'Squat barre',
        sets: '5 × 12-15',
        equip: 'Barre 30 kg',
        desc: 'Barre sur les trapèzes, descendez hanches sous parallèle si mobilité OK, puis remontez. Quadriceps, fessiers. Debout.',
        caloriesPerSet: [19, 22],
        totalSets: 5,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Barbell Squat',
          muscleGroups: ['quadriceps', 'glutes', 'hamstrings']
        }
      },
      {
        name: 'Fentes avant alternées haltères',
        sets: '5 × 12-15 /côté',
        equip: 'Haltères 15 kg',
        desc: 'Un pas en avant, descendez le genou arrière vers le sol sans le poser, puis remontez. Alternez. Quadriceps, fessiers, équilibre.',
        caloriesPerSet: [19, 22],
        totalSets: 10,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Walking Lunges',
          muscleGroups: ['quadriceps', 'glutes']
        }
      },
      {
        name: 'Fentes bulgares haltères',
        sets: '5 × 12-15 /côté',
        equip: 'Haltères 15 kg',
        desc: 'Pied arrière surélevé sur le banc, descendez sur la jambe avant. Très efficace quadriceps et fessiers. Debout, zéro impact.',
        caloriesPerSet: [19, 22],
        totalSets: 10,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Bulgarian Split Squat',
          muscleGroups: ['quadriceps', 'glutes']
        }
      },
      {
        name: 'Montées sur banc lestées',
        sets: '5 × 12-15 /côté',
        equip: 'Haltères 15 kg',
        desc: 'Montez complètement sur un banc/marche stable, jambe motrice, contrôlez la descente. Alternez. Bas du corps fonctionnel, zéro impact.',
        caloriesPerSet: [14, 17],
        totalSets: 10,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Weighted Step-ups',
          muscleGroups: ['quadriceps', 'glutes']
        }
      },
      {
        name: 'Squat sumo haltère',
        sets: '3 × 15',
        equip: 'Haltère 15 kg',
        desc: 'Pieds très écartés, pointes vers l\'extérieur, haltère tenu entre les jambes. Adducteurs + fessiers. Debout.',
        caloriesPerSet: [19, 22],
        totalSets: 3,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Sumo Squat',
          muscleGroups: ['glutes', 'adductors', 'quadriceps']
        }
      },
      {
        name: 'Thrusters haltères',
        sets: '4 × 15',
        equip: 'Haltères 10 kg',
        desc: 'Squat haltères aux épaules puis remontée et développé au-dessus de la tête, en continu. Corps entier, zéro impact.',
        caloriesPerSet: [25, 29],
        totalSets: 4,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Dumbbell Thrusters',
          muscleGroups: ['quadriceps', 'shoulders', 'glutes']
        }
      },
      {
        name: 'Circuit thrusters + swings (HIIT debout)',
        sets: '14 min (40 s / 20 s)',
        equip: 'Haltères 10 kg',
        desc: 'Circuit debout en continu : thrusters, swings, montées de genoux — 40 s d\'effort / 20 s de repos jusqu\'à la fin du chrono. Zéro saut, zéro sol, gros débit calorique.',
        caloriesPerSet: [235, 274],
        totalSets: 1,
        nbRep: 0,
        timer: true,
        duration: 840,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Standing HIIT Circuit',
          muscleGroups: ['full_body']
        }
      },
      {
        name: 'Crunch latéral debout (side bend)',
        sets: '3 × 18 /côté',
        equip: 'Haltère 15 kg',
        desc: 'Debout, un haltère d\'un côté, inclinez le buste latéralement puis redressez en contractant l\'oblique. Debout, aucun appui au sol.',
        caloriesPerSet: [12, 14],
        totalSets: 6,
        nbRep: 18,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Standing Side Bend',
          muscleGroups: ['obliques', 'abdominals']
        }
      },
      {
        name: 'Woodchopper haltère',
        sets: '3 × 18 /côté',
        equip: 'Haltère 10 kg',
        desc: 'Debout, amenez l\'haltère en diagonale de la hanche basse vers l\'épaule opposée puis inversez. Rotation du tronc, debout.',
        caloriesPerSet: [14, 17],
        totalSets: 6,
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
    title: 'JOUR 11: PUSH B (Épaules, Pectoraux, Triceps) — S2 Accumulation',
    isRestDay: false,
    exercises: [
      {
        name: 'Développé Arnold haltères',
        sets: '5 × 12-15',
        equip: 'Haltères 15 kg',
        desc: 'Assis sur banc, paumes vers vous, tournez les poignets en poussant vers le haut. Tous les faisceaux de l\'épaule.',
        caloriesPerSet: [19, 22],
        totalSets: 5,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Arnold Press',
          muscleGroups: ['shoulders', 'triceps']
        }
      },
      {
        name: 'Développé incliné barre',
        sets: '5 × 12-15',
        equip: 'Barre 30 kg',
        desc: 'Banc incliné 30-45°, poussez la barre vers le haut. Haut des pectoraux et épaules.',
        caloriesPerSet: [19, 22],
        totalSets: 5,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Incline Barbell Press',
          muscleGroups: ['chest', 'shoulders', 'triceps']
        }
      },
      {
        name: 'Push press barre',
        sets: '5 × 12-15',
        equip: 'Barre 30 kg',
        desc: 'Debout, légère impulsion des jambes puis poussez la barre au-dessus de la tête. Épaules + puissance, zéro impact.',
        caloriesPerSet: [19, 22],
        totalSets: 5,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Push Press',
          muscleGroups: ['shoulders', 'triceps']
        }
      },
      {
        name: 'Élévations frontales haltères',
        sets: '3 × 15',
        equip: 'Haltères 10 kg',
        desc: 'Debout, montez les haltères devant vous jusqu\'aux épaules. Deltoïde antérieur.',
        caloriesPerSet: [11, 13],
        totalSets: 3,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Front Raises',
          muscleGroups: ['shoulders']
        }
      },
      {
        name: 'Oiseau haltères (arrière épaule)',
        sets: '3 × 15',
        equip: 'Haltères 10 kg',
        desc: 'Buste penché ou assis penché, montez les haltères sur les côtés en serrant les omoplates. Arrière de l\'épaule — corrige la posture.',
        caloriesPerSet: [11, 13],
        totalSets: 3,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Rear Delt Raise',
          muscleGroups: ['shoulders', 'back']
        }
      },
      {
        name: 'Thrusters haltères',
        sets: '4 × 15',
        equip: 'Haltères 10 kg',
        desc: 'Squat haltères aux épaules puis remontée et développé au-dessus de la tête, en continu. Corps entier, zéro impact.',
        caloriesPerSet: [25, 29],
        totalSets: 4,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Dumbbell Thrusters',
          muscleGroups: ['quadriceps', 'shoulders', 'glutes']
        }
      },
      {
        name: 'Circuit complexe haltères (HIIT)',
        sets: '14 min (40 s / 20 s)',
        equip: 'Haltères 10 kg',
        desc: 'Circuit debout en continu : épaulé + développé + squat + rowing aux haltères, 40 s d\'effort / 20 s de repos jusqu\'à la fin du chrono. Moteur métabolique, zéro impact.',
        caloriesPerSet: [235, 274],
        totalSets: 1,
        nbRep: 0,
        timer: true,
        duration: 840,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Dumbbell Complex Circuit',
          muscleGroups: ['full_body']
        }
      },
      {
        name: 'Woodchopper haltère',
        sets: '3 × 18 /côté',
        equip: 'Haltère 10 kg',
        desc: 'Debout, amenez l\'haltère en diagonale de la hanche basse vers l\'épaule opposée puis inversez. Rotation du tronc, debout.',
        caloriesPerSet: [14, 17],
        totalSets: 6,
        nbRep: 18,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Dumbbell Woodchopper',
          muscleGroups: ['obliques', 'abdominals', 'core']
        }
      },
      {
        name: 'Relevés de genoux debout',
        sets: '3 × 18 /côté',
        equip: 'Poids chevilles 4 kg',
        desc: 'Debout en appui léger, montez le genou vers la poitrine en contractant les abdos, alternez. Abdos bas, 100% debout.',
        caloriesPerSet: [14, 17],
        totalSets: 6,
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
    title: 'JOUR 12: PULL B (Dos, Trapèzes, Biceps) — S2 Accumulation',
    isRestDay: false,
    exercises: [
      {
        name: 'Soulevé de terre roumain (départ debout)',
        sets: '5 × 12-15',
        equip: 'Barre 30 kg',
        desc: 'Départ debout barre en mains, poussez les hanches en arrière et descendez la barre le long des cuisses, dos droit, sans poser au sol. Ischios + fessiers + lombaires.',
        caloriesPerSet: [19, 22],
        totalSets: 5,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Romanian Deadlift',
          muscleGroups: ['hamstrings', 'glutes', 'back']
        }
      },
      {
        name: 'Rowing haltères deux bras',
        sets: '5 × 12-15',
        equip: 'Haltères 15 kg',
        desc: 'Buste penché, tirez les deux haltères vers les hanches en serrant les omoplates. Dos complet. Debout.',
        caloriesPerSet: [19, 22],
        totalSets: 5,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Two Arm Dumbbell Row',
          muscleGroups: ['back', 'biceps']
        }
      },
      {
        name: 'Pullover haltère sur banc',
        sets: '5 × 12-15',
        equip: 'Haltère 15 kg',
        desc: 'Allongé en travers du banc, descendez l\'haltère derrière la tête bras tendus puis remontez. Grand dorsal. Sur banc.',
        caloriesPerSet: [14, 17],
        totalSets: 5,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Dumbbell Pullover',
          muscleGroups: ['back', 'chest']
        }
      },
      {
        name: 'Shrugs barre (haussements)',
        sets: '3 × 15',
        equip: 'Barre 30 kg',
        desc: 'Debout, barre devant, haussez les épaules vers les oreilles sans plier les bras. Trapèzes.',
        caloriesPerSet: [14, 17],
        totalSets: 3,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Barbell Shrugs',
          muscleGroups: ['trapezius', 'back']
        }
      },
      {
        name: 'Curl concentré haltère',
        sets: '3 × 15 /côté',
        equip: 'Haltère 15 kg',
        desc: 'Assis sur banc, coude calé contre la cuisse, fléchissez le bras lentement. Isolation du biceps.',
        caloriesPerSet: [11, 13],
        totalSets: 6,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Concentration Curl',
          muscleGroups: ['biceps']
        }
      },
      {
        name: 'Swing haltère',
        sets: '4 × 15',
        equip: 'Haltère 15 kg',
        desc: 'Balancez l\'haltère entre les jambes puis projetez-le à hauteur des yeux par poussée explosive des hanches. Puissant mais sans impact au sol.',
        caloriesPerSet: [14, 17],
        totalSets: 4,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Dumbbell Swing',
          muscleGroups: ['glutes', 'hamstrings', 'back']
        }
      },
      {
        name: 'Circuit thrusters + swings (HIIT debout)',
        sets: '14 min (40 s / 20 s)',
        equip: 'Haltères 10 kg',
        desc: 'Circuit debout en continu : thrusters, swings, montées de genoux — 40 s d\'effort / 20 s de repos jusqu\'à la fin du chrono. Zéro saut, zéro sol, gros débit calorique.',
        caloriesPerSet: [235, 274],
        totalSets: 1,
        nbRep: 0,
        timer: true,
        duration: 840,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Standing HIIT Circuit',
          muscleGroups: ['full_body']
        }
      },
      {
        name: 'Crunch latéral debout (side bend)',
        sets: '3 × 18 /côté',
        equip: 'Haltère 15 kg',
        desc: 'Debout, un haltère d\'un côté, inclinez le buste latéralement puis redressez en contractant l\'oblique. Debout, aucun appui au sol.',
        caloriesPerSet: [12, 14],
        totalSets: 6,
        nbRep: 18,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Standing Side Bend',
          muscleGroups: ['obliques', 'abdominals']
        }
      },
      {
        name: 'Marche du fermier (farmer carry)',
        sets: '3 × 60 s',
        equip: 'Haltères 15 kg',
        desc: 'Un haltère lourd dans chaque main, marchez 60 s tronc gainé et droit, épaules basses. Anti-flexion, core et grip, debout.',
        caloriesPerSet: [9, 11],
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
    ],
  },
  {
    title: 'JOUR 13: MARCHE (Récupération active) — S2',
    isRestDay: false,
    exercises: [
      {
        name: 'Marche rapide',
        sets: '45 min',
        equip: 'Veste lestée 10 kg',
        desc: '45 min de marche rapide, idéalement en côte ou avec la veste lestée. Récupération active à fort débit lipidique, zéro impact.',
        caloriesPerSet: [425, 496],
        totalSets: 1,
        nbRep: 0,
        timer: true,
        duration: 2700,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Brisk Walk',
          muscleGroups: ['full_body']
        }
      },
      {
        name: 'Mobilité articulaire',
        sets: '10 min',
        equip: 'Aucun',
        desc: '10 min de mobilité debout (épaules, hanches, chevilles). Entretient l\'amplitude, limite les blessures.',
        caloriesPerSet: [95, 110],
        totalSets: 1,
        nbRep: 0,
        timer: true,
        duration: 600,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Joint Mobility',
          muscleGroups: ['full_body']
        }
      },
    ],
  },
  {
    title: 'JOUR 14: REPOS COMPLET — S2',
    isRestDay: true,
    exercises: [

    ],
  },
  {
    title: 'JOUR 15: PUSH A (Pectoraux, Épaules, Triceps) — S3 Intensification',
    isRestDay: false,
    exercises: [
      {
        name: 'Développé couché barre',
        sets: '5 × 10-12 (tempo lent)',
        equip: 'Barre 30 kg',
        desc: 'Sur banc, descendez la barre vers la poitrine puis poussez, tempo contrôlé. Pectoraux. (Le banc est surélevé : pas d\'appui au sol.)',
        caloriesPerSet: [19, 22],
        totalSets: 5,
        nbRep: 10,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Barbell Bench Press',
          muscleGroups: ['chest', 'triceps', 'shoulders']
        }
      },
      {
        name: 'Développé militaire barre',
        sets: '5 × 10-12 (tempo lent)',
        equip: 'Barre 30 kg',
        desc: 'Debout, gainé, poussez la barre au-dessus de la tête sans cambrer. Épaules complètes. 100% debout.',
        caloriesPerSet: [19, 22],
        totalSets: 5,
        nbRep: 10,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Military Press',
          muscleGroups: ['shoulders', 'triceps']
        }
      },
      {
        name: 'Développé incliné haltères',
        sets: '5 × 10-12 (tempo lent)',
        equip: 'Haltères 15 kg',
        desc: 'Banc incliné, poussez les haltères vers le haut en contrôlant la descente. Haut des pectoraux.',
        caloriesPerSet: [19, 22],
        totalSets: 5,
        nbRep: 10,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Incline Dumbbell Press',
          muscleGroups: ['chest', 'shoulders', 'triceps']
        }
      },
      {
        name: 'Élévations latérales haltères',
        sets: '4 × 12-15',
        equip: 'Haltères 10 kg',
        desc: 'Debout, montez les haltères latéralement jusqu\'aux épaules. Deltoïde moyen.',
        caloriesPerSet: [11, 13],
        totalSets: 4,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Lateral Raises',
          muscleGroups: ['shoulders']
        }
      },
      {
        name: 'Extension triceps nuque haltère',
        sets: '4 × 12-15',
        equip: 'Haltères 10 kg',
        desc: 'Debout ou assis, haltère derrière la nuque à deux mains, tendez les bras vers le haut. Triceps.',
        caloriesPerSet: [14, 17],
        totalSets: 4,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Overhead Triceps Extension',
          muscleGroups: ['triceps']
        }
      },
      {
        name: 'Thrusters haltères',
        sets: '4 × 15',
        equip: 'Haltères 10 kg',
        desc: 'Squat haltères aux épaules puis remontée et développé au-dessus de la tête, en continu. Corps entier, zéro impact.',
        caloriesPerSet: [25, 29],
        totalSets: 4,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Dumbbell Thrusters',
          muscleGroups: ['quadriceps', 'shoulders', 'glutes']
        }
      },
      {
        name: 'Circuit complexe haltères (HIIT)',
        sets: '16 min (40 s / 20 s)',
        equip: 'Haltères 10 kg',
        desc: 'Circuit debout en continu : épaulé + développé + squat + rowing aux haltères, 40 s d\'effort / 20 s de repos jusqu\'à la fin du chrono. Moteur métabolique, zéro impact.',
        caloriesPerSet: [269, 314],
        totalSets: 1,
        nbRep: 0,
        timer: true,
        duration: 960,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Dumbbell Complex Circuit',
          muscleGroups: ['full_body']
        }
      },
      {
        name: 'Crunch latéral debout (side bend)',
        sets: '4 × 20 /côté',
        equip: 'Haltère 15 kg',
        desc: 'Debout, un haltère d\'un côté, inclinez le buste latéralement puis redressez en contractant l\'oblique. Debout, aucun appui au sol.',
        caloriesPerSet: [12, 14],
        totalSets: 8,
        nbRep: 20,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Standing Side Bend',
          muscleGroups: ['obliques', 'abdominals']
        }
      },
      {
        name: 'Relevés de genoux debout',
        sets: '4 × 20 /côté',
        equip: 'Poids chevilles 4 kg',
        desc: 'Debout en appui léger, montez le genou vers la poitrine en contractant les abdos, alternez. Abdos bas, 100% debout.',
        caloriesPerSet: [14, 17],
        totalSets: 8,
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
    title: 'JOUR 16: PULL A (Dos, Biceps, Arrière épaule) — S3 Intensification',
    isRestDay: false,
    exercises: [
      {
        name: 'Rowing barre buste penché',
        sets: '5 × 10-12 (tempo lent)',
        equip: 'Barre 30 kg',
        desc: 'Buste penché 45°, dos droit, tirez la barre vers le bas du ventre. Épaisseur du dos. Debout.',
        caloriesPerSet: [19, 22],
        totalSets: 5,
        nbRep: 10,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Bent Over Barbell Row',
          muscleGroups: ['back', 'biceps']
        }
      },
      {
        name: 'Soulevé de terre surélevé (rack pull)',
        sets: '5 × 10-12 (tempo lent)',
        equip: 'Barre 30 kg',
        desc: 'Barre posée à hauteur des genoux (cales/support), dos droit, tirez en poussant les hanches. JAMAIS depuis le sol : préserve le dos et contourne la gêne du buste.',
        caloriesPerSet: [19, 22],
        totalSets: 5,
        nbRep: 10,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Rack Pull',
          muscleGroups: ['back', 'glutes', 'hamstrings']
        }
      },
      {
        name: 'Rowing haltère un bras',
        sets: '5 × 10-12 (tempo lent) /côté',
        equip: 'Haltère 15 kg',
        desc: 'Un genou et une main sur le banc, tirez l\'haltère vers la hanche, coude près du corps. Appui sur banc, pas au sol.',
        caloriesPerSet: [19, 22],
        totalSets: 10,
        nbRep: 10,
        googleFitActivity: {
          type: 'strength_training',
          name: 'One Arm Dumbbell Row',
          muscleGroups: ['back', 'biceps']
        }
      },
      {
        name: 'Curl biceps haltères',
        sets: '4 × 12-15',
        equip: 'Haltères 15 kg',
        desc: 'Debout, fléchissez les coudes pour monter les haltères vers les épaules sans balancer. Biceps.',
        caloriesPerSet: [11, 13],
        totalSets: 4,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Dumbbell Curl',
          muscleGroups: ['biceps']
        }
      },
      {
        name: 'Oiseau haltères (arrière épaule)',
        sets: '4 × 12-15',
        equip: 'Haltères 10 kg',
        desc: 'Buste penché ou assis penché, montez les haltères sur les côtés en serrant les omoplates. Arrière de l\'épaule — corrige la posture.',
        caloriesPerSet: [11, 13],
        totalSets: 4,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Rear Delt Raise',
          muscleGroups: ['shoulders', 'back']
        }
      },
      {
        name: 'Swing haltère',
        sets: '4 × 15',
        equip: 'Haltère 15 kg',
        desc: 'Balancez l\'haltère entre les jambes puis projetez-le à hauteur des yeux par poussée explosive des hanches. Puissant mais sans impact au sol.',
        caloriesPerSet: [14, 17],
        totalSets: 4,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Dumbbell Swing',
          muscleGroups: ['glutes', 'hamstrings', 'back']
        }
      },
      {
        name: 'Circuit thrusters + swings (HIIT debout)',
        sets: '16 min (40 s / 20 s)',
        equip: 'Haltères 10 kg',
        desc: 'Circuit debout en continu : thrusters, swings, montées de genoux — 40 s d\'effort / 20 s de repos jusqu\'à la fin du chrono. Zéro saut, zéro sol, gros débit calorique.',
        caloriesPerSet: [269, 314],
        totalSets: 1,
        nbRep: 0,
        timer: true,
        duration: 960,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Standing HIIT Circuit',
          muscleGroups: ['full_body']
        }
      },
      {
        name: 'Woodchopper haltère',
        sets: '4 × 20 /côté',
        equip: 'Haltère 10 kg',
        desc: 'Debout, amenez l\'haltère en diagonale de la hanche basse vers l\'épaule opposée puis inversez. Rotation du tronc, debout.',
        caloriesPerSet: [14, 17],
        totalSets: 8,
        nbRep: 20,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Dumbbell Woodchopper',
          muscleGroups: ['obliques', 'abdominals', 'core']
        }
      },
      {
        name: 'Marche du fermier (farmer carry)',
        sets: '4 × 60 s',
        equip: 'Haltères 15 kg',
        desc: 'Un haltère lourd dans chaque main, marchez 60 s tronc gainé et droit, épaules basses. Anti-flexion, core et grip, debout.',
        caloriesPerSet: [9, 11],
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
    ],
  },
  {
    title: 'JOUR 17: LEGS (Quadriceps, Fessiers, Mollets) — S3 Intensification',
    isRestDay: false,
    exercises: [
      {
        name: 'Squat barre',
        sets: '5 × 10-12 (tempo lent)',
        equip: 'Barre 30 kg',
        desc: 'Barre sur les trapèzes, descendez hanches sous parallèle si mobilité OK, puis remontez. Quadriceps, fessiers. Debout.',
        caloriesPerSet: [19, 22],
        totalSets: 5,
        nbRep: 10,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Barbell Squat',
          muscleGroups: ['quadriceps', 'glutes', 'hamstrings']
        }
      },
      {
        name: 'Fentes avant alternées haltères',
        sets: '5 × 10-12 (tempo lent) /côté',
        equip: 'Haltères 15 kg',
        desc: 'Un pas en avant, descendez le genou arrière vers le sol sans le poser, puis remontez. Alternez. Quadriceps, fessiers, équilibre.',
        caloriesPerSet: [19, 22],
        totalSets: 10,
        nbRep: 10,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Walking Lunges',
          muscleGroups: ['quadriceps', 'glutes']
        }
      },
      {
        name: 'Fentes bulgares haltères',
        sets: '5 × 10-12 (tempo lent) /côté',
        equip: 'Haltères 15 kg',
        desc: 'Pied arrière surélevé sur le banc, descendez sur la jambe avant. Très efficace quadriceps et fessiers. Debout, zéro impact.',
        caloriesPerSet: [19, 22],
        totalSets: 10,
        nbRep: 10,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Bulgarian Split Squat',
          muscleGroups: ['quadriceps', 'glutes']
        }
      },
      {
        name: 'Montées sur banc lestées',
        sets: '5 × 10-12 (tempo lent) /côté',
        equip: 'Veste lestée 10 kg + Haltères 15 kg',
        desc: 'Montez complètement sur un banc/marche stable, jambe motrice, contrôlez la descente. Alternez. Bas du corps fonctionnel, zéro impact.',
        caloriesPerSet: [14, 17],
        totalSets: 10,
        nbRep: 10,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Weighted Step-ups',
          muscleGroups: ['quadriceps', 'glutes']
        }
      },
      {
        name: 'Squat sumo haltère',
        sets: '4 × 12-15',
        equip: 'Haltère 15 kg',
        desc: 'Pieds très écartés, pointes vers l\'extérieur, haltère tenu entre les jambes. Adducteurs + fessiers. Debout.',
        caloriesPerSet: [19, 22],
        totalSets: 4,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Sumo Squat',
          muscleGroups: ['glutes', 'adductors', 'quadriceps']
        }
      },
      {
        name: 'Thrusters haltères',
        sets: '4 × 15',
        equip: 'Haltères 10 kg',
        desc: 'Squat haltères aux épaules puis remontée et développé au-dessus de la tête, en continu. Corps entier, zéro impact.',
        caloriesPerSet: [25, 29],
        totalSets: 4,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Dumbbell Thrusters',
          muscleGroups: ['quadriceps', 'shoulders', 'glutes']
        }
      },
      {
        name: 'Circuit thrusters + swings (HIIT debout)',
        sets: '16 min (40 s / 20 s)',
        equip: 'Haltères 10 kg',
        desc: 'Circuit debout en continu : thrusters, swings, montées de genoux — 40 s d\'effort / 20 s de repos jusqu\'à la fin du chrono. Zéro saut, zéro sol, gros débit calorique.',
        caloriesPerSet: [269, 314],
        totalSets: 1,
        nbRep: 0,
        timer: true,
        duration: 960,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Standing HIIT Circuit',
          muscleGroups: ['full_body']
        }
      },
      {
        name: 'Crunch latéral debout (side bend)',
        sets: '4 × 20 /côté',
        equip: 'Haltère 15 kg',
        desc: 'Debout, un haltère d\'un côté, inclinez le buste latéralement puis redressez en contractant l\'oblique. Debout, aucun appui au sol.',
        caloriesPerSet: [12, 14],
        totalSets: 8,
        nbRep: 20,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Standing Side Bend',
          muscleGroups: ['obliques', 'abdominals']
        }
      },
      {
        name: 'Woodchopper haltère',
        sets: '4 × 20 /côté',
        equip: 'Haltère 10 kg',
        desc: 'Debout, amenez l\'haltère en diagonale de la hanche basse vers l\'épaule opposée puis inversez. Rotation du tronc, debout.',
        caloriesPerSet: [14, 17],
        totalSets: 8,
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
    title: 'JOUR 18: PUSH B (Épaules, Pectoraux, Triceps) — S3 Intensification',
    isRestDay: false,
    exercises: [
      {
        name: 'Développé Arnold haltères',
        sets: '5 × 10-12 (tempo lent)',
        equip: 'Haltères 15 kg',
        desc: 'Assis sur banc, paumes vers vous, tournez les poignets en poussant vers le haut. Tous les faisceaux de l\'épaule.',
        caloriesPerSet: [19, 22],
        totalSets: 5,
        nbRep: 10,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Arnold Press',
          muscleGroups: ['shoulders', 'triceps']
        }
      },
      {
        name: 'Développé incliné barre',
        sets: '5 × 10-12 (tempo lent)',
        equip: 'Barre 30 kg',
        desc: 'Banc incliné 30-45°, poussez la barre vers le haut. Haut des pectoraux et épaules.',
        caloriesPerSet: [19, 22],
        totalSets: 5,
        nbRep: 10,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Incline Barbell Press',
          muscleGroups: ['chest', 'shoulders', 'triceps']
        }
      },
      {
        name: 'Push press barre',
        sets: '5 × 10-12 (tempo lent)',
        equip: 'Barre 30 kg',
        desc: 'Debout, légère impulsion des jambes puis poussez la barre au-dessus de la tête. Épaules + puissance, zéro impact.',
        caloriesPerSet: [19, 22],
        totalSets: 5,
        nbRep: 10,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Push Press',
          muscleGroups: ['shoulders', 'triceps']
        }
      },
      {
        name: 'Élévations frontales haltères',
        sets: '4 × 12-15',
        equip: 'Haltères 10 kg',
        desc: 'Debout, montez les haltères devant vous jusqu\'aux épaules. Deltoïde antérieur.',
        caloriesPerSet: [11, 13],
        totalSets: 4,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Front Raises',
          muscleGroups: ['shoulders']
        }
      },
      {
        name: 'Oiseau haltères (arrière épaule)',
        sets: '4 × 12-15',
        equip: 'Haltères 10 kg',
        desc: 'Buste penché ou assis penché, montez les haltères sur les côtés en serrant les omoplates. Arrière de l\'épaule — corrige la posture.',
        caloriesPerSet: [11, 13],
        totalSets: 4,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Rear Delt Raise',
          muscleGroups: ['shoulders', 'back']
        }
      },
      {
        name: 'Thrusters haltères',
        sets: '4 × 15',
        equip: 'Haltères 10 kg',
        desc: 'Squat haltères aux épaules puis remontée et développé au-dessus de la tête, en continu. Corps entier, zéro impact.',
        caloriesPerSet: [25, 29],
        totalSets: 4,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Dumbbell Thrusters',
          muscleGroups: ['quadriceps', 'shoulders', 'glutes']
        }
      },
      {
        name: 'Circuit complexe haltères (HIIT)',
        sets: '16 min (40 s / 20 s)',
        equip: 'Haltères 10 kg',
        desc: 'Circuit debout en continu : épaulé + développé + squat + rowing aux haltères, 40 s d\'effort / 20 s de repos jusqu\'à la fin du chrono. Moteur métabolique, zéro impact.',
        caloriesPerSet: [269, 314],
        totalSets: 1,
        nbRep: 0,
        timer: true,
        duration: 960,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Dumbbell Complex Circuit',
          muscleGroups: ['full_body']
        }
      },
      {
        name: 'Woodchopper haltère',
        sets: '4 × 20 /côté',
        equip: 'Haltère 10 kg',
        desc: 'Debout, amenez l\'haltère en diagonale de la hanche basse vers l\'épaule opposée puis inversez. Rotation du tronc, debout.',
        caloriesPerSet: [14, 17],
        totalSets: 8,
        nbRep: 20,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Dumbbell Woodchopper',
          muscleGroups: ['obliques', 'abdominals', 'core']
        }
      },
      {
        name: 'Relevés de genoux debout',
        sets: '4 × 20 /côté',
        equip: 'Poids chevilles 4 kg',
        desc: 'Debout en appui léger, montez le genou vers la poitrine en contractant les abdos, alternez. Abdos bas, 100% debout.',
        caloriesPerSet: [14, 17],
        totalSets: 8,
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
    title: 'JOUR 19: PULL B (Dos, Trapèzes, Biceps) — S3 Intensification',
    isRestDay: false,
    exercises: [
      {
        name: 'Soulevé de terre roumain (départ debout)',
        sets: '5 × 10-12 (tempo lent)',
        equip: 'Barre 30 kg',
        desc: 'Départ debout barre en mains, poussez les hanches en arrière et descendez la barre le long des cuisses, dos droit, sans poser au sol. Ischios + fessiers + lombaires.',
        caloriesPerSet: [19, 22],
        totalSets: 5,
        nbRep: 10,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Romanian Deadlift',
          muscleGroups: ['hamstrings', 'glutes', 'back']
        }
      },
      {
        name: 'Rowing haltères deux bras',
        sets: '5 × 10-12 (tempo lent)',
        equip: 'Haltères 15 kg',
        desc: 'Buste penché, tirez les deux haltères vers les hanches en serrant les omoplates. Dos complet. Debout.',
        caloriesPerSet: [19, 22],
        totalSets: 5,
        nbRep: 10,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Two Arm Dumbbell Row',
          muscleGroups: ['back', 'biceps']
        }
      },
      {
        name: 'Pullover haltère sur banc',
        sets: '5 × 10-12 (tempo lent)',
        equip: 'Haltère 15 kg',
        desc: 'Allongé en travers du banc, descendez l\'haltère derrière la tête bras tendus puis remontez. Grand dorsal. Sur banc.',
        caloriesPerSet: [14, 17],
        totalSets: 5,
        nbRep: 10,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Dumbbell Pullover',
          muscleGroups: ['back', 'chest']
        }
      },
      {
        name: 'Shrugs barre (haussements)',
        sets: '4 × 12-15',
        equip: 'Barre 30 kg',
        desc: 'Debout, barre devant, haussez les épaules vers les oreilles sans plier les bras. Trapèzes.',
        caloriesPerSet: [14, 17],
        totalSets: 4,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Barbell Shrugs',
          muscleGroups: ['trapezius', 'back']
        }
      },
      {
        name: 'Curl concentré haltère',
        sets: '4 × 12-15 /côté',
        equip: 'Haltère 15 kg',
        desc: 'Assis sur banc, coude calé contre la cuisse, fléchissez le bras lentement. Isolation du biceps.',
        caloriesPerSet: [11, 13],
        totalSets: 8,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Concentration Curl',
          muscleGroups: ['biceps']
        }
      },
      {
        name: 'Swing haltère',
        sets: '4 × 15',
        equip: 'Haltère 15 kg',
        desc: 'Balancez l\'haltère entre les jambes puis projetez-le à hauteur des yeux par poussée explosive des hanches. Puissant mais sans impact au sol.',
        caloriesPerSet: [14, 17],
        totalSets: 4,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Dumbbell Swing',
          muscleGroups: ['glutes', 'hamstrings', 'back']
        }
      },
      {
        name: 'Circuit thrusters + swings (HIIT debout)',
        sets: '16 min (40 s / 20 s)',
        equip: 'Haltères 10 kg',
        desc: 'Circuit debout en continu : thrusters, swings, montées de genoux — 40 s d\'effort / 20 s de repos jusqu\'à la fin du chrono. Zéro saut, zéro sol, gros débit calorique.',
        caloriesPerSet: [269, 314],
        totalSets: 1,
        nbRep: 0,
        timer: true,
        duration: 960,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Standing HIIT Circuit',
          muscleGroups: ['full_body']
        }
      },
      {
        name: 'Crunch latéral debout (side bend)',
        sets: '4 × 20 /côté',
        equip: 'Haltère 15 kg',
        desc: 'Debout, un haltère d\'un côté, inclinez le buste latéralement puis redressez en contractant l\'oblique. Debout, aucun appui au sol.',
        caloriesPerSet: [12, 14],
        totalSets: 8,
        nbRep: 20,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Standing Side Bend',
          muscleGroups: ['obliques', 'abdominals']
        }
      },
      {
        name: 'Marche du fermier (farmer carry)',
        sets: '4 × 60 s',
        equip: 'Haltères 15 kg',
        desc: 'Un haltère lourd dans chaque main, marchez 60 s tronc gainé et droit, épaules basses. Anti-flexion, core et grip, debout.',
        caloriesPerSet: [9, 11],
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
    ],
  },
  {
    title: 'JOUR 20: MARCHE (Récupération active) — S3',
    isRestDay: false,
    exercises: [
      {
        name: 'Marche rapide',
        sets: '45 min',
        equip: 'Veste lestée 10 kg',
        desc: '45 min de marche rapide, idéalement en côte ou avec la veste lestée. Récupération active à fort débit lipidique, zéro impact.',
        caloriesPerSet: [425, 496],
        totalSets: 1,
        nbRep: 0,
        timer: true,
        duration: 2700,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Brisk Walk',
          muscleGroups: ['full_body']
        }
      },
      {
        name: 'Mobilité articulaire',
        sets: '10 min',
        equip: 'Aucun',
        desc: '10 min de mobilité debout (épaules, hanches, chevilles). Entretient l\'amplitude, limite les blessures.',
        caloriesPerSet: [95, 110],
        totalSets: 1,
        nbRep: 0,
        timer: true,
        duration: 600,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Joint Mobility',
          muscleGroups: ['full_body']
        }
      },
    ],
  },
  {
    title: 'JOUR 21: REPOS COMPLET — S3',
    isRestDay: true,
    exercises: [

    ],
  },
  {
    title: 'JOUR 22: PUSH A (Pectoraux, Épaules, Triceps) — S4 Allègement (deload actif)',
    isRestDay: false,
    exercises: [
      {
        name: 'Développé couché barre',
        sets: '3 × 12 (allégé)',
        equip: 'Barre 30 kg',
        desc: 'Sur banc, descendez la barre vers la poitrine puis poussez, tempo contrôlé. Pectoraux. (Le banc est surélevé : pas d\'appui au sol.)',
        caloriesPerSet: [19, 22],
        totalSets: 3,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Barbell Bench Press',
          muscleGroups: ['chest', 'triceps', 'shoulders']
        }
      },
      {
        name: 'Développé militaire barre',
        sets: '3 × 12 (allégé)',
        equip: 'Barre 30 kg',
        desc: 'Debout, gainé, poussez la barre au-dessus de la tête sans cambrer. Épaules complètes. 100% debout.',
        caloriesPerSet: [19, 22],
        totalSets: 3,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Military Press',
          muscleGroups: ['shoulders', 'triceps']
        }
      },
      {
        name: 'Développé incliné haltères',
        sets: '3 × 12 (allégé)',
        equip: 'Haltères 15 kg',
        desc: 'Banc incliné, poussez les haltères vers le haut en contrôlant la descente. Haut des pectoraux.',
        caloriesPerSet: [19, 22],
        totalSets: 3,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Incline Dumbbell Press',
          muscleGroups: ['chest', 'shoulders', 'triceps']
        }
      },
      {
        name: 'Élévations latérales haltères',
        sets: '3 × 15 (allégé)',
        equip: 'Haltères 10 kg',
        desc: 'Debout, montez les haltères latéralement jusqu\'aux épaules. Deltoïde moyen.',
        caloriesPerSet: [11, 13],
        totalSets: 3,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Lateral Raises',
          muscleGroups: ['shoulders']
        }
      },
      {
        name: 'Extension triceps nuque haltère',
        sets: '3 × 15 (allégé)',
        equip: 'Haltères 10 kg',
        desc: 'Debout ou assis, haltère derrière la nuque à deux mains, tendez les bras vers le haut. Triceps.',
        caloriesPerSet: [14, 17],
        totalSets: 3,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Overhead Triceps Extension',
          muscleGroups: ['triceps']
        }
      },
      {
        name: 'Thrusters haltères',
        sets: '2 × 12',
        equip: 'Haltères 10 kg',
        desc: 'Squat haltères aux épaules puis remontée et développé au-dessus de la tête, en continu. Corps entier, zéro impact.',
        caloriesPerSet: [25, 29],
        totalSets: 2,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Dumbbell Thrusters',
          muscleGroups: ['quadriceps', 'shoulders', 'glutes']
        }
      },
      {
        name: 'Circuit complexe haltères (HIIT)',
        sets: '14 min (40 s / 20 s)',
        equip: 'Haltères 10 kg',
        desc: 'Circuit debout en continu : épaulé + développé + squat + rowing aux haltères, 40 s d\'effort / 20 s de repos jusqu\'à la fin du chrono. Moteur métabolique, zéro impact.',
        caloriesPerSet: [235, 274],
        totalSets: 1,
        nbRep: 0,
        timer: true,
        duration: 840,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Dumbbell Complex Circuit',
          muscleGroups: ['full_body']
        }
      },
      {
        name: 'Crunch latéral debout (side bend)',
        sets: '3 × 15 /côté',
        equip: 'Haltère 15 kg',
        desc: 'Debout, un haltère d\'un côté, inclinez le buste latéralement puis redressez en contractant l\'oblique. Debout, aucun appui au sol.',
        caloriesPerSet: [12, 14],
        totalSets: 6,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Standing Side Bend',
          muscleGroups: ['obliques', 'abdominals']
        }
      },
      {
        name: 'Relevés de genoux debout',
        sets: '3 × 15 /côté',
        equip: 'Poids chevilles 4 kg',
        desc: 'Debout en appui léger, montez le genou vers la poitrine en contractant les abdos, alternez. Abdos bas, 100% debout.',
        caloriesPerSet: [14, 17],
        totalSets: 6,
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
    title: 'JOUR 23: PULL A (Dos, Biceps, Arrière épaule) — S4 Allègement (deload actif)',
    isRestDay: false,
    exercises: [
      {
        name: 'Rowing barre buste penché',
        sets: '3 × 12 (allégé)',
        equip: 'Barre 30 kg',
        desc: 'Buste penché 45°, dos droit, tirez la barre vers le bas du ventre. Épaisseur du dos. Debout.',
        caloriesPerSet: [19, 22],
        totalSets: 3,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Bent Over Barbell Row',
          muscleGroups: ['back', 'biceps']
        }
      },
      {
        name: 'Soulevé de terre surélevé (rack pull)',
        sets: '3 × 12 (allégé)',
        equip: 'Barre 30 kg',
        desc: 'Barre posée à hauteur des genoux (cales/support), dos droit, tirez en poussant les hanches. JAMAIS depuis le sol : préserve le dos et contourne la gêne du buste.',
        caloriesPerSet: [19, 22],
        totalSets: 3,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Rack Pull',
          muscleGroups: ['back', 'glutes', 'hamstrings']
        }
      },
      {
        name: 'Rowing haltère un bras',
        sets: '3 × 12 (allégé) /côté',
        equip: 'Haltère 15 kg',
        desc: 'Un genou et une main sur le banc, tirez l\'haltère vers la hanche, coude près du corps. Appui sur banc, pas au sol.',
        caloriesPerSet: [19, 22],
        totalSets: 6,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'One Arm Dumbbell Row',
          muscleGroups: ['back', 'biceps']
        }
      },
      {
        name: 'Curl biceps haltères',
        sets: '3 × 15 (allégé)',
        equip: 'Haltères 15 kg',
        desc: 'Debout, fléchissez les coudes pour monter les haltères vers les épaules sans balancer. Biceps.',
        caloriesPerSet: [11, 13],
        totalSets: 3,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Dumbbell Curl',
          muscleGroups: ['biceps']
        }
      },
      {
        name: 'Oiseau haltères (arrière épaule)',
        sets: '3 × 15 (allégé)',
        equip: 'Haltères 10 kg',
        desc: 'Buste penché ou assis penché, montez les haltères sur les côtés en serrant les omoplates. Arrière de l\'épaule — corrige la posture.',
        caloriesPerSet: [11, 13],
        totalSets: 3,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Rear Delt Raise',
          muscleGroups: ['shoulders', 'back']
        }
      },
      {
        name: 'Swing haltère',
        sets: '2 × 12',
        equip: 'Haltère 15 kg',
        desc: 'Balancez l\'haltère entre les jambes puis projetez-le à hauteur des yeux par poussée explosive des hanches. Puissant mais sans impact au sol.',
        caloriesPerSet: [14, 17],
        totalSets: 2,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Dumbbell Swing',
          muscleGroups: ['glutes', 'hamstrings', 'back']
        }
      },
      {
        name: 'Circuit thrusters + swings (HIIT debout)',
        sets: '14 min (40 s / 20 s)',
        equip: 'Haltères 10 kg',
        desc: 'Circuit debout en continu : thrusters, swings, montées de genoux — 40 s d\'effort / 20 s de repos jusqu\'à la fin du chrono. Zéro saut, zéro sol, gros débit calorique.',
        caloriesPerSet: [235, 274],
        totalSets: 1,
        nbRep: 0,
        timer: true,
        duration: 840,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Standing HIIT Circuit',
          muscleGroups: ['full_body']
        }
      },
      {
        name: 'Woodchopper haltère',
        sets: '3 × 15 /côté',
        equip: 'Haltère 10 kg',
        desc: 'Debout, amenez l\'haltère en diagonale de la hanche basse vers l\'épaule opposée puis inversez. Rotation du tronc, debout.',
        caloriesPerSet: [14, 17],
        totalSets: 6,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Dumbbell Woodchopper',
          muscleGroups: ['obliques', 'abdominals', 'core']
        }
      },
      {
        name: 'Marche du fermier (farmer carry)',
        sets: '3 × 60 s',
        equip: 'Haltères 15 kg',
        desc: 'Un haltère lourd dans chaque main, marchez 60 s tronc gainé et droit, épaules basses. Anti-flexion, core et grip, debout.',
        caloriesPerSet: [9, 11],
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
    ],
  },
  {
    title: 'JOUR 24: LEGS (Quadriceps, Fessiers, Mollets) — S4 Allègement (deload actif)',
    isRestDay: false,
    exercises: [
      {
        name: 'Squat barre',
        sets: '3 × 12 (allégé)',
        equip: 'Barre 30 kg',
        desc: 'Barre sur les trapèzes, descendez hanches sous parallèle si mobilité OK, puis remontez. Quadriceps, fessiers. Debout.',
        caloriesPerSet: [19, 22],
        totalSets: 3,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Barbell Squat',
          muscleGroups: ['quadriceps', 'glutes', 'hamstrings']
        }
      },
      {
        name: 'Fentes avant alternées haltères',
        sets: '3 × 12 (allégé) /côté',
        equip: 'Haltères 15 kg',
        desc: 'Un pas en avant, descendez le genou arrière vers le sol sans le poser, puis remontez. Alternez. Quadriceps, fessiers, équilibre.',
        caloriesPerSet: [19, 22],
        totalSets: 6,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Walking Lunges',
          muscleGroups: ['quadriceps', 'glutes']
        }
      },
      {
        name: 'Fentes bulgares haltères',
        sets: '3 × 12 (allégé) /côté',
        equip: 'Haltères 15 kg',
        desc: 'Pied arrière surélevé sur le banc, descendez sur la jambe avant. Très efficace quadriceps et fessiers. Debout, zéro impact.',
        caloriesPerSet: [19, 22],
        totalSets: 6,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Bulgarian Split Squat',
          muscleGroups: ['quadriceps', 'glutes']
        }
      },
      {
        name: 'Montées sur banc lestées',
        sets: '3 × 12 (allégé) /côté',
        equip: 'Veste lestée 10 kg + Haltères 15 kg',
        desc: 'Montez complètement sur un banc/marche stable, jambe motrice, contrôlez la descente. Alternez. Bas du corps fonctionnel, zéro impact.',
        caloriesPerSet: [14, 17],
        totalSets: 6,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Weighted Step-ups',
          muscleGroups: ['quadriceps', 'glutes']
        }
      },
      {
        name: 'Squat sumo haltère',
        sets: '3 × 15 (allégé)',
        equip: 'Haltère 15 kg',
        desc: 'Pieds très écartés, pointes vers l\'extérieur, haltère tenu entre les jambes. Adducteurs + fessiers. Debout.',
        caloriesPerSet: [19, 22],
        totalSets: 3,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Sumo Squat',
          muscleGroups: ['glutes', 'adductors', 'quadriceps']
        }
      },
      {
        name: 'Thrusters haltères',
        sets: '2 × 12',
        equip: 'Haltères 10 kg',
        desc: 'Squat haltères aux épaules puis remontée et développé au-dessus de la tête, en continu. Corps entier, zéro impact.',
        caloriesPerSet: [25, 29],
        totalSets: 2,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Dumbbell Thrusters',
          muscleGroups: ['quadriceps', 'shoulders', 'glutes']
        }
      },
      {
        name: 'Circuit thrusters + swings (HIIT debout)',
        sets: '14 min (40 s / 20 s)',
        equip: 'Haltères 10 kg',
        desc: 'Circuit debout en continu : thrusters, swings, montées de genoux — 40 s d\'effort / 20 s de repos jusqu\'à la fin du chrono. Zéro saut, zéro sol, gros débit calorique.',
        caloriesPerSet: [235, 274],
        totalSets: 1,
        nbRep: 0,
        timer: true,
        duration: 840,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Standing HIIT Circuit',
          muscleGroups: ['full_body']
        }
      },
      {
        name: 'Crunch latéral debout (side bend)',
        sets: '3 × 15 /côté',
        equip: 'Haltère 15 kg',
        desc: 'Debout, un haltère d\'un côté, inclinez le buste latéralement puis redressez en contractant l\'oblique. Debout, aucun appui au sol.',
        caloriesPerSet: [12, 14],
        totalSets: 6,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Standing Side Bend',
          muscleGroups: ['obliques', 'abdominals']
        }
      },
      {
        name: 'Woodchopper haltère',
        sets: '3 × 15 /côté',
        equip: 'Haltère 10 kg',
        desc: 'Debout, amenez l\'haltère en diagonale de la hanche basse vers l\'épaule opposée puis inversez. Rotation du tronc, debout.',
        caloriesPerSet: [14, 17],
        totalSets: 6,
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
    title: 'JOUR 25: PUSH B (Épaules, Pectoraux, Triceps) — S4 Allègement (deload actif)',
    isRestDay: false,
    exercises: [
      {
        name: 'Développé Arnold haltères',
        sets: '3 × 12 (allégé)',
        equip: 'Haltères 15 kg',
        desc: 'Assis sur banc, paumes vers vous, tournez les poignets en poussant vers le haut. Tous les faisceaux de l\'épaule.',
        caloriesPerSet: [19, 22],
        totalSets: 3,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Arnold Press',
          muscleGroups: ['shoulders', 'triceps']
        }
      },
      {
        name: 'Développé incliné barre',
        sets: '3 × 12 (allégé)',
        equip: 'Barre 30 kg',
        desc: 'Banc incliné 30-45°, poussez la barre vers le haut. Haut des pectoraux et épaules.',
        caloriesPerSet: [19, 22],
        totalSets: 3,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Incline Barbell Press',
          muscleGroups: ['chest', 'shoulders', 'triceps']
        }
      },
      {
        name: 'Push press barre',
        sets: '3 × 12 (allégé)',
        equip: 'Barre 30 kg',
        desc: 'Debout, légère impulsion des jambes puis poussez la barre au-dessus de la tête. Épaules + puissance, zéro impact.',
        caloriesPerSet: [19, 22],
        totalSets: 3,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Push Press',
          muscleGroups: ['shoulders', 'triceps']
        }
      },
      {
        name: 'Élévations frontales haltères',
        sets: '3 × 15 (allégé)',
        equip: 'Haltères 10 kg',
        desc: 'Debout, montez les haltères devant vous jusqu\'aux épaules. Deltoïde antérieur.',
        caloriesPerSet: [11, 13],
        totalSets: 3,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Front Raises',
          muscleGroups: ['shoulders']
        }
      },
      {
        name: 'Oiseau haltères (arrière épaule)',
        sets: '3 × 15 (allégé)',
        equip: 'Haltères 10 kg',
        desc: 'Buste penché ou assis penché, montez les haltères sur les côtés en serrant les omoplates. Arrière de l\'épaule — corrige la posture.',
        caloriesPerSet: [11, 13],
        totalSets: 3,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Rear Delt Raise',
          muscleGroups: ['shoulders', 'back']
        }
      },
      {
        name: 'Thrusters haltères',
        sets: '2 × 12',
        equip: 'Haltères 10 kg',
        desc: 'Squat haltères aux épaules puis remontée et développé au-dessus de la tête, en continu. Corps entier, zéro impact.',
        caloriesPerSet: [25, 29],
        totalSets: 2,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Dumbbell Thrusters',
          muscleGroups: ['quadriceps', 'shoulders', 'glutes']
        }
      },
      {
        name: 'Circuit complexe haltères (HIIT)',
        sets: '14 min (40 s / 20 s)',
        equip: 'Haltères 10 kg',
        desc: 'Circuit debout en continu : épaulé + développé + squat + rowing aux haltères, 40 s d\'effort / 20 s de repos jusqu\'à la fin du chrono. Moteur métabolique, zéro impact.',
        caloriesPerSet: [235, 274],
        totalSets: 1,
        nbRep: 0,
        timer: true,
        duration: 840,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Dumbbell Complex Circuit',
          muscleGroups: ['full_body']
        }
      },
      {
        name: 'Woodchopper haltère',
        sets: '3 × 15 /côté',
        equip: 'Haltère 10 kg',
        desc: 'Debout, amenez l\'haltère en diagonale de la hanche basse vers l\'épaule opposée puis inversez. Rotation du tronc, debout.',
        caloriesPerSet: [14, 17],
        totalSets: 6,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Dumbbell Woodchopper',
          muscleGroups: ['obliques', 'abdominals', 'core']
        }
      },
      {
        name: 'Relevés de genoux debout',
        sets: '3 × 15 /côté',
        equip: 'Poids chevilles 4 kg',
        desc: 'Debout en appui léger, montez le genou vers la poitrine en contractant les abdos, alternez. Abdos bas, 100% debout.',
        caloriesPerSet: [14, 17],
        totalSets: 6,
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
    title: 'JOUR 26: PULL B (Dos, Trapèzes, Biceps) — S4 Allègement (deload actif)',
    isRestDay: false,
    exercises: [
      {
        name: 'Soulevé de terre roumain (départ debout)',
        sets: '3 × 12 (allégé)',
        equip: 'Barre 30 kg',
        desc: 'Départ debout barre en mains, poussez les hanches en arrière et descendez la barre le long des cuisses, dos droit, sans poser au sol. Ischios + fessiers + lombaires.',
        caloriesPerSet: [19, 22],
        totalSets: 3,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Romanian Deadlift',
          muscleGroups: ['hamstrings', 'glutes', 'back']
        }
      },
      {
        name: 'Rowing haltères deux bras',
        sets: '3 × 12 (allégé)',
        equip: 'Haltères 15 kg',
        desc: 'Buste penché, tirez les deux haltères vers les hanches en serrant les omoplates. Dos complet. Debout.',
        caloriesPerSet: [19, 22],
        totalSets: 3,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Two Arm Dumbbell Row',
          muscleGroups: ['back', 'biceps']
        }
      },
      {
        name: 'Pullover haltère sur banc',
        sets: '3 × 12 (allégé)',
        equip: 'Haltère 15 kg',
        desc: 'Allongé en travers du banc, descendez l\'haltère derrière la tête bras tendus puis remontez. Grand dorsal. Sur banc.',
        caloriesPerSet: [14, 17],
        totalSets: 3,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Dumbbell Pullover',
          muscleGroups: ['back', 'chest']
        }
      },
      {
        name: 'Shrugs barre (haussements)',
        sets: '3 × 15 (allégé)',
        equip: 'Barre 30 kg',
        desc: 'Debout, barre devant, haussez les épaules vers les oreilles sans plier les bras. Trapèzes.',
        caloriesPerSet: [14, 17],
        totalSets: 3,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Barbell Shrugs',
          muscleGroups: ['trapezius', 'back']
        }
      },
      {
        name: 'Curl concentré haltère',
        sets: '3 × 15 (allégé) /côté',
        equip: 'Haltère 15 kg',
        desc: 'Assis sur banc, coude calé contre la cuisse, fléchissez le bras lentement. Isolation du biceps.',
        caloriesPerSet: [11, 13],
        totalSets: 6,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Concentration Curl',
          muscleGroups: ['biceps']
        }
      },
      {
        name: 'Swing haltère',
        sets: '2 × 12',
        equip: 'Haltère 15 kg',
        desc: 'Balancez l\'haltère entre les jambes puis projetez-le à hauteur des yeux par poussée explosive des hanches. Puissant mais sans impact au sol.',
        caloriesPerSet: [14, 17],
        totalSets: 2,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Dumbbell Swing',
          muscleGroups: ['glutes', 'hamstrings', 'back']
        }
      },
      {
        name: 'Circuit thrusters + swings (HIIT debout)',
        sets: '14 min (40 s / 20 s)',
        equip: 'Haltères 10 kg',
        desc: 'Circuit debout en continu : thrusters, swings, montées de genoux — 40 s d\'effort / 20 s de repos jusqu\'à la fin du chrono. Zéro saut, zéro sol, gros débit calorique.',
        caloriesPerSet: [235, 274],
        totalSets: 1,
        nbRep: 0,
        timer: true,
        duration: 840,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Standing HIIT Circuit',
          muscleGroups: ['full_body']
        }
      },
      {
        name: 'Crunch latéral debout (side bend)',
        sets: '3 × 15 /côté',
        equip: 'Haltère 15 kg',
        desc: 'Debout, un haltère d\'un côté, inclinez le buste latéralement puis redressez en contractant l\'oblique. Debout, aucun appui au sol.',
        caloriesPerSet: [12, 14],
        totalSets: 6,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Standing Side Bend',
          muscleGroups: ['obliques', 'abdominals']
        }
      },
      {
        name: 'Marche du fermier (farmer carry)',
        sets: '3 × 60 s',
        equip: 'Haltères 15 kg',
        desc: 'Un haltère lourd dans chaque main, marchez 60 s tronc gainé et droit, épaules basses. Anti-flexion, core et grip, debout.',
        caloriesPerSet: [9, 11],
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
    ],
  },
  {
    title: 'JOUR 27: MARCHE (Récupération active) — S4',
    isRestDay: false,
    exercises: [
      {
        name: 'Marche rapide',
        sets: '45 min',
        equip: 'Veste lestée 10 kg',
        desc: '45 min de marche rapide, idéalement en côte ou avec la veste lestée. Récupération active à fort débit lipidique, zéro impact.',
        caloriesPerSet: [425, 496],
        totalSets: 1,
        nbRep: 0,
        timer: true,
        duration: 2700,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Brisk Walk',
          muscleGroups: ['full_body']
        }
      },
      {
        name: 'Mobilité articulaire',
        sets: '10 min',
        equip: 'Aucun',
        desc: '10 min de mobilité debout (épaules, hanches, chevilles). Entretient l\'amplitude, limite les blessures.',
        caloriesPerSet: [95, 110],
        totalSets: 1,
        nbRep: 0,
        timer: true,
        duration: 600,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Joint Mobility',
          muscleGroups: ['full_body']
        }
      },
    ],
  },
  {
    title: 'JOUR 28: REPOS COMPLET — S4',
    isRestDay: true,
    exercises: [

    ],
  }
];

export const days = fullPlan;
