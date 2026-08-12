/**
 * PROGRAMME PERTE DE GRAS — musculation 7 jours / 7 (profil > 135 kg, confirmé, dos solide).
 * Split Push A / Pull A / Legs A / Push B / Pull B / Legs B / Full body — aucun jour de repos,
 * aucune séance de marche : chaque jour est une séance de musculation d'environ 1 heure.
 * 4 semaines : Adaptation → Accumulation → Intensification → Allègement (deload actif).
 * Adapté : 100% debout/banc (aucun appui au sol), ZÉRO saut (low-impact), hinge surélevé.
 * Matériel : haltères 5/10/15 kg, barre 30 kg, veste lestée 10 kg, poids chevilles 2×4 + 2×2 kg.
 * Le vélo de fin de séance (10 min, prog. CAL 1) est optionnel : l'heure de musculation tient sans lui.
 * Généré par scripts/gen-plan.mjs — ne pas éditer à la main.
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
        name: 'Développé militaire barre',
        sets: '4 × 12 (tempo 3-1-1)',
        equip: 'Barre 30 kg',
        desc: 'Debout, gainé, poussez la barre au-dessus de la tête sans cambrer. Épaules complètes. 100% debout.',
        caloriesPerSet: [21, 24],
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
        name: 'Extension triceps nuque haltère',
        sets: '4 × 15',
        equip: 'Haltères 10 kg',
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
      {
        name: 'Vélo (cardio fin de séance)',
        sets: '10 min (prog. CAL 1)',
        equip: 'Vélo',
        desc: '10 min sur le programme CAL 1 du Domyos EB900 (résistance élevée), en fin de séance. Cardio court et intense à haute résistance qui remplace le HIIT, sans impact ni appui au sol. Optionnel : désactivable dans les réglages, la musculation seule fait déjà l\'heure.',
        caloriesPerSet: [165, 185],
        totalSets: 1,
        nbRep: 0,
        timer: true,
        duration: 600,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Stationary Cycling',
          muscleGroups: ['quadriceps', 'glutes', 'cardio']
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
        caloriesPerSet: [21, 24],
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
        name: 'Curl biceps haltères',
        sets: '4 × 15',
        equip: 'Haltères 15 kg',
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
      {
        name: 'Marche du fermier (farmer carry)',
        sets: '4 × 60 s',
        equip: 'Haltères 15 kg',
        desc: 'Un haltère lourd dans chaque main, marchez 60 s tronc gainé et droit, épaules basses. Anti-flexion, core et grip, debout.',
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
        name: 'Vélo (cardio fin de séance)',
        sets: '10 min (prog. CAL 1)',
        equip: 'Vélo',
        desc: '10 min sur le programme CAL 1 du Domyos EB900 (résistance élevée), en fin de séance. Cardio court et intense à haute résistance qui remplace le HIIT, sans impact ni appui au sol. Optionnel : désactivable dans les réglages, la musculation seule fait déjà l\'heure.',
        caloriesPerSet: [165, 185],
        totalSets: 1,
        nbRep: 0,
        timer: true,
        duration: 600,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Stationary Cycling',
          muscleGroups: ['quadriceps', 'glutes', 'cardio']
        }
      },
    ],
  },
  {
    title: 'JOUR 3: LEGS A (Quadriceps, Fessiers, Mollets) — S1 Adaptation',
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
        name: 'Fentes bulgares haltères',
        sets: '4 × 12 (tempo 3-1-1) /côté',
        equip: 'Haltères 15 kg',
        desc: 'Pied arrière surélevé sur le banc, descendez sur la jambe avant. Très efficace quadriceps et fessiers. Debout, zéro impact.',
        caloriesPerSet: [21, 24],
        totalSets: 4,
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
        caloriesPerSet: [16, 18],
        totalSets: 4,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Weighted Step-ups',
          muscleGroups: ['quadriceps', 'glutes']
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
      {
        name: 'Vélo (cardio fin de séance)',
        sets: '10 min (prog. CAL 1)',
        equip: 'Vélo',
        desc: '10 min sur le programme CAL 1 du Domyos EB900 (résistance élevée), en fin de séance. Cardio court et intense à haute résistance qui remplace le HIIT, sans impact ni appui au sol. Optionnel : désactivable dans les réglages, la musculation seule fait déjà l\'heure.',
        caloriesPerSet: [165, 185],
        totalSets: 1,
        nbRep: 0,
        timer: true,
        duration: 600,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Stationary Cycling',
          muscleGroups: ['quadriceps', 'glutes', 'cardio']
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
        caloriesPerSet: [21, 24],
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
        caloriesPerSet: [21, 24],
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
        caloriesPerSet: [21, 24],
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
      {
        name: 'Vélo (cardio fin de séance)',
        sets: '10 min (prog. CAL 1)',
        equip: 'Vélo',
        desc: '10 min sur le programme CAL 1 du Domyos EB900 (résistance élevée), en fin de séance. Cardio court et intense à haute résistance qui remplace le HIIT, sans impact ni appui au sol. Optionnel : désactivable dans les réglages, la musculation seule fait déjà l\'heure.',
        caloriesPerSet: [165, 185],
        totalSets: 1,
        nbRep: 0,
        timer: true,
        duration: 600,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Stationary Cycling',
          muscleGroups: ['quadriceps', 'glutes', 'cardio']
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
        name: 'Pullover haltère sur banc',
        sets: '4 × 12 (tempo 3-1-1)',
        equip: 'Haltère 15 kg',
        desc: 'Allongé en travers du banc, descendez l\'haltère derrière la tête bras tendus puis remontez. Grand dorsal. Sur banc.',
        caloriesPerSet: [16, 18],
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
        name: 'Curl concentré haltère',
        sets: '4 × 15 /côté',
        equip: 'Haltère 15 kg',
        desc: 'Assis sur banc, coude calé contre la cuisse, fléchissez le bras lentement. Isolation du biceps.',
        caloriesPerSet: [12, 14],
        totalSets: 4,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Concentration Curl',
          muscleGroups: ['biceps']
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
      {
        name: 'Marche du fermier (farmer carry)',
        sets: '4 × 60 s',
        equip: 'Haltères 15 kg',
        desc: 'Un haltère lourd dans chaque main, marchez 60 s tronc gainé et droit, épaules basses. Anti-flexion, core et grip, debout.',
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
        name: 'Vélo (cardio fin de séance)',
        sets: '10 min (prog. CAL 1)',
        equip: 'Vélo',
        desc: '10 min sur le programme CAL 1 du Domyos EB900 (résistance élevée), en fin de séance. Cardio court et intense à haute résistance qui remplace le HIIT, sans impact ni appui au sol. Optionnel : désactivable dans les réglages, la musculation seule fait déjà l\'heure.',
        caloriesPerSet: [165, 185],
        totalSets: 1,
        nbRep: 0,
        timer: true,
        duration: 600,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Stationary Cycling',
          muscleGroups: ['quadriceps', 'glutes', 'cardio']
        }
      },
    ],
  },
  {
    title: 'JOUR 6: LEGS B (Ischios, Fessiers, Mollets) — S1 Adaptation',
    isRestDay: false,
    exercises: [
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
        name: 'Fentes arrière alternées haltères',
        sets: '4 × 12 (tempo 3-1-1) en alternance',
        equip: 'Haltères 15 kg',
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
        sets: '4 × 12 (tempo 3-1-1) /côté',
        equip: 'Haltère 15 kg',
        desc: 'Debout sur une jambe (main libre en appui léger si besoin), poussez la hanche en arrière et descendez l\'haltère le long de la jambe d\'appui, dos droit. Ischios, fessiers, équilibre.',
        caloriesPerSet: [21, 24],
        totalSets: 4,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Single Leg Romanian Deadlift',
          muscleGroups: ['hamstrings', 'glutes', 'core']
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
      {
        name: 'Marche du fermier (farmer carry)',
        sets: '4 × 60 s',
        equip: 'Haltères 15 kg',
        desc: 'Un haltère lourd dans chaque main, marchez 60 s tronc gainé et droit, épaules basses. Anti-flexion, core et grip, debout.',
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
        name: 'Vélo (cardio fin de séance)',
        sets: '10 min (prog. CAL 1)',
        equip: 'Vélo',
        desc: '10 min sur le programme CAL 1 du Domyos EB900 (résistance élevée), en fin de séance. Cardio court et intense à haute résistance qui remplace le HIIT, sans impact ni appui au sol. Optionnel : désactivable dans les réglages, la musculation seule fait déjà l\'heure.',
        caloriesPerSet: [165, 185],
        totalSets: 1,
        nbRep: 0,
        timer: true,
        duration: 600,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Stationary Cycling',
          muscleGroups: ['quadriceps', 'glutes', 'cardio']
        }
      },
    ],
  },
  {
    title: 'JOUR 7: FULL BODY (Bras, Épaules, Gainage) — S1 Adaptation',
    isRestDay: false,
    exercises: [
      {
        name: 'Développé couché haltères',
        sets: '4 × 12 (tempo 3-1-1)',
        equip: 'Haltères 15 kg',
        desc: 'Sur banc plat, poussez les haltères vers le haut en contrôlant la descente, amplitude complète. Pectoraux, triceps.',
        caloriesPerSet: [21, 24],
        totalSets: 4,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Dumbbell Bench Press',
          muscleGroups: ['chest', 'triceps', 'shoulders']
        }
      },
      {
        name: 'Tirage menton barre (upright row)',
        sets: '4 × 12 (tempo 3-1-1)',
        equip: 'Barre 30 kg',
        desc: 'Debout, barre devant les cuisses, tirez-la vers le menton coudes hauts, sans monter au-delà des épaules. Trapèzes et deltoïdes.',
        caloriesPerSet: [21, 24],
        totalSets: 4,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Upright Row',
          muscleGroups: ['shoulders', 'trapezius']
        }
      },
      {
        name: 'Curl marteau haltères',
        sets: '4 × 12 (tempo 3-1-1)',
        equip: 'Haltères 15 kg',
        desc: 'Debout, paumes face à face, fléchissez les coudes sans balancer le buste. Biceps et brachial (épaisseur du bras).',
        caloriesPerSet: [16, 18],
        totalSets: 4,
        nbRep: 12,
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
      {
        name: 'Marche du fermier (farmer carry)',
        sets: '4 × 60 s',
        equip: 'Haltères 15 kg',
        desc: 'Un haltère lourd dans chaque main, marchez 60 s tronc gainé et droit, épaules basses. Anti-flexion, core et grip, debout.',
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
        name: 'Vélo (cardio fin de séance)',
        sets: '10 min (prog. CAL 1)',
        equip: 'Vélo',
        desc: '10 min sur le programme CAL 1 du Domyos EB900 (résistance élevée), en fin de séance. Cardio court et intense à haute résistance qui remplace le HIIT, sans impact ni appui au sol. Optionnel : désactivable dans les réglages, la musculation seule fait déjà l\'heure.',
        caloriesPerSet: [165, 185],
        totalSets: 1,
        nbRep: 0,
        timer: true,
        duration: 600,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Stationary Cycling',
          muscleGroups: ['quadriceps', 'glutes', 'cardio']
        }
      },
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
        caloriesPerSet: [21, 24],
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
        caloriesPerSet: [21, 24],
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
        caloriesPerSet: [21, 24],
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
        name: 'Extension triceps nuque haltère',
        sets: '4 × 15',
        equip: 'Haltères 10 kg',
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
      {
        name: 'Vélo (cardio fin de séance)',
        sets: '10 min (prog. CAL 1)',
        equip: 'Vélo',
        desc: '10 min sur le programme CAL 1 du Domyos EB900 (résistance élevée), en fin de séance. Cardio court et intense à haute résistance qui remplace le HIIT, sans impact ni appui au sol. Optionnel : désactivable dans les réglages, la musculation seule fait déjà l\'heure.',
        caloriesPerSet: [165, 185],
        totalSets: 1,
        nbRep: 0,
        timer: true,
        duration: 600,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Stationary Cycling',
          muscleGroups: ['quadriceps', 'glutes', 'cardio']
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
        name: 'Soulevé de terre surélevé (rack pull)',
        sets: '5 × 12-15',
        equip: 'Barre 30 kg',
        desc: 'Barre posée à hauteur des genoux (cales/support), dos droit, tirez en poussant les hanches. JAMAIS depuis le sol : préserve le dos et contourne la gêne du buste.',
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
        name: 'Rowing haltère un bras',
        sets: '5 × 12-15 /côté',
        equip: 'Haltère 15 kg',
        desc: 'Un genou et une main sur le banc, tirez l\'haltère vers la hanche, coude près du corps. Appui sur banc, pas au sol.',
        caloriesPerSet: [21, 24],
        totalSets: 5,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'One Arm Dumbbell Row',
          muscleGroups: ['back', 'biceps']
        }
      },
      {
        name: 'Curl biceps haltères',
        sets: '4 × 15',
        equip: 'Haltères 15 kg',
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
      {
        name: 'Marche du fermier (farmer carry)',
        sets: '4 × 60 s',
        equip: 'Haltères 15 kg',
        desc: 'Un haltère lourd dans chaque main, marchez 60 s tronc gainé et droit, épaules basses. Anti-flexion, core et grip, debout.',
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
        name: 'Vélo (cardio fin de séance)',
        sets: '10 min (prog. CAL 1)',
        equip: 'Vélo',
        desc: '10 min sur le programme CAL 1 du Domyos EB900 (résistance élevée), en fin de séance. Cardio court et intense à haute résistance qui remplace le HIIT, sans impact ni appui au sol. Optionnel : désactivable dans les réglages, la musculation seule fait déjà l\'heure.',
        caloriesPerSet: [165, 185],
        totalSets: 1,
        nbRep: 0,
        timer: true,
        duration: 600,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Stationary Cycling',
          muscleGroups: ['quadriceps', 'glutes', 'cardio']
        }
      },
    ],
  },
  {
    title: 'JOUR 10: LEGS A (Quadriceps, Fessiers, Mollets) — S2 Accumulation',
    isRestDay: false,
    exercises: [
      {
        name: 'Squat barre',
        sets: '5 × 12-15',
        equip: 'Barre 30 kg',
        desc: 'Barre sur les trapèzes, descendez hanches sous parallèle si mobilité OK, puis remontez. Quadriceps, fessiers. Debout.',
        caloriesPerSet: [21, 24],
        totalSets: 5,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Barbell Squat',
          muscleGroups: ['quadriceps', 'glutes', 'hamstrings']
        }
      },
      {
        name: 'Fentes bulgares haltères',
        sets: '5 × 12-15 /côté',
        equip: 'Haltères 15 kg',
        desc: 'Pied arrière surélevé sur le banc, descendez sur la jambe avant. Très efficace quadriceps et fessiers. Debout, zéro impact.',
        caloriesPerSet: [21, 24],
        totalSets: 5,
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
        caloriesPerSet: [16, 18],
        totalSets: 5,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Weighted Step-ups',
          muscleGroups: ['quadriceps', 'glutes']
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
      {
        name: 'Vélo (cardio fin de séance)',
        sets: '10 min (prog. CAL 1)',
        equip: 'Vélo',
        desc: '10 min sur le programme CAL 1 du Domyos EB900 (résistance élevée), en fin de séance. Cardio court et intense à haute résistance qui remplace le HIIT, sans impact ni appui au sol. Optionnel : désactivable dans les réglages, la musculation seule fait déjà l\'heure.',
        caloriesPerSet: [165, 185],
        totalSets: 1,
        nbRep: 0,
        timer: true,
        duration: 600,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Stationary Cycling',
          muscleGroups: ['quadriceps', 'glutes', 'cardio']
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
        name: 'Développé incliné barre',
        sets: '5 × 12-15',
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
        name: 'Push press barre',
        sets: '5 × 12-15',
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
      {
        name: 'Vélo (cardio fin de séance)',
        sets: '10 min (prog. CAL 1)',
        equip: 'Vélo',
        desc: '10 min sur le programme CAL 1 du Domyos EB900 (résistance élevée), en fin de séance. Cardio court et intense à haute résistance qui remplace le HIIT, sans impact ni appui au sol. Optionnel : désactivable dans les réglages, la musculation seule fait déjà l\'heure.',
        caloriesPerSet: [165, 185],
        totalSets: 1,
        nbRep: 0,
        timer: true,
        duration: 600,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Stationary Cycling',
          muscleGroups: ['quadriceps', 'glutes', 'cardio']
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
        name: 'Rowing haltères deux bras',
        sets: '5 × 12-15',
        equip: 'Haltères 15 kg',
        desc: 'Buste penché, tirez les deux haltères vers les hanches en serrant les omoplates. Dos complet. Debout.',
        caloriesPerSet: [21, 24],
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
        name: 'Curl concentré haltère',
        sets: '4 × 15 /côté',
        equip: 'Haltère 15 kg',
        desc: 'Assis sur banc, coude calé contre la cuisse, fléchissez le bras lentement. Isolation du biceps.',
        caloriesPerSet: [12, 14],
        totalSets: 4,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Concentration Curl',
          muscleGroups: ['biceps']
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
      {
        name: 'Marche du fermier (farmer carry)',
        sets: '4 × 60 s',
        equip: 'Haltères 15 kg',
        desc: 'Un haltère lourd dans chaque main, marchez 60 s tronc gainé et droit, épaules basses. Anti-flexion, core et grip, debout.',
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
        name: 'Vélo (cardio fin de séance)',
        sets: '10 min (prog. CAL 1)',
        equip: 'Vélo',
        desc: '10 min sur le programme CAL 1 du Domyos EB900 (résistance élevée), en fin de séance. Cardio court et intense à haute résistance qui remplace le HIIT, sans impact ni appui au sol. Optionnel : désactivable dans les réglages, la musculation seule fait déjà l\'heure.',
        caloriesPerSet: [165, 185],
        totalSets: 1,
        nbRep: 0,
        timer: true,
        duration: 600,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Stationary Cycling',
          muscleGroups: ['quadriceps', 'glutes', 'cardio']
        }
      },
    ],
  },
  {
    title: 'JOUR 13: LEGS B (Ischios, Fessiers, Mollets) — S2 Accumulation',
    isRestDay: false,
    exercises: [
      {
        name: 'Squat gobelet haltère',
        sets: '5 × 12-15',
        equip: 'Haltère 15 kg',
        desc: 'Debout, haltère tenu verticalement contre la poitrine, descendez en squat buste droit puis remontez. Quadriceps, fessiers, gainage. Debout.',
        caloriesPerSet: [21, 24],
        totalSets: 5,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Goblet Squat',
          muscleGroups: ['quadriceps', 'glutes', 'core']
        }
      },
      {
        name: 'Fentes arrière alternées haltères',
        sets: '5 × 12-15 en alternance',
        equip: 'Haltères 15 kg',
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
        name: 'Soulevé de terre roumain unilatéral haltère',
        sets: '5 × 12-15 /côté',
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
      {
        name: 'Marche du fermier (farmer carry)',
        sets: '4 × 60 s',
        equip: 'Haltères 15 kg',
        desc: 'Un haltère lourd dans chaque main, marchez 60 s tronc gainé et droit, épaules basses. Anti-flexion, core et grip, debout.',
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
        name: 'Vélo (cardio fin de séance)',
        sets: '10 min (prog. CAL 1)',
        equip: 'Vélo',
        desc: '10 min sur le programme CAL 1 du Domyos EB900 (résistance élevée), en fin de séance. Cardio court et intense à haute résistance qui remplace le HIIT, sans impact ni appui au sol. Optionnel : désactivable dans les réglages, la musculation seule fait déjà l\'heure.',
        caloriesPerSet: [165, 185],
        totalSets: 1,
        nbRep: 0,
        timer: true,
        duration: 600,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Stationary Cycling',
          muscleGroups: ['quadriceps', 'glutes', 'cardio']
        }
      },
    ],
  },
  {
    title: 'JOUR 14: FULL BODY (Bras, Épaules, Gainage) — S2 Accumulation',
    isRestDay: false,
    exercises: [
      {
        name: 'Développé couché haltères',
        sets: '5 × 12-15',
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
        name: 'Tirage menton barre (upright row)',
        sets: '5 × 12-15',
        equip: 'Barre 30 kg',
        desc: 'Debout, barre devant les cuisses, tirez-la vers le menton coudes hauts, sans monter au-delà des épaules. Trapèzes et deltoïdes.',
        caloriesPerSet: [21, 24],
        totalSets: 5,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Upright Row',
          muscleGroups: ['shoulders', 'trapezius']
        }
      },
      {
        name: 'Curl marteau haltères',
        sets: '5 × 12-15',
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
      {
        name: 'Marche du fermier (farmer carry)',
        sets: '4 × 60 s',
        equip: 'Haltères 15 kg',
        desc: 'Un haltère lourd dans chaque main, marchez 60 s tronc gainé et droit, épaules basses. Anti-flexion, core et grip, debout.',
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
        name: 'Vélo (cardio fin de séance)',
        sets: '10 min (prog. CAL 1)',
        equip: 'Vélo',
        desc: '10 min sur le programme CAL 1 du Domyos EB900 (résistance élevée), en fin de séance. Cardio court et intense à haute résistance qui remplace le HIIT, sans impact ni appui au sol. Optionnel : désactivable dans les réglages, la musculation seule fait déjà l\'heure.',
        caloriesPerSet: [165, 185],
        totalSets: 1,
        nbRep: 0,
        timer: true,
        duration: 600,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Stationary Cycling',
          muscleGroups: ['quadriceps', 'glutes', 'cardio']
        }
      },
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
        caloriesPerSet: [21, 24],
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
        caloriesPerSet: [21, 24],
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
        caloriesPerSet: [21, 24],
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
        caloriesPerSet: [12, 14],
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
        caloriesPerSet: [16, 18],
        totalSets: 4,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Overhead Triceps Extension',
          muscleGroups: ['triceps']
        }
      },
      {
        name: 'Écarté haltères sur banc',
        sets: '4 × 12-15',
        equip: 'Haltères 10 kg',
        desc: 'Sur banc, bras légèrement fléchis, ouvrez les haltères en arc de cercle puis refermez au-dessus de la poitrine. Étirement des pectoraux.',
        caloriesPerSet: [16, 18],
        totalSets: 4,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Dumbbell Fly',
          muscleGroups: ['chest', 'shoulders']
        }
      },
      {
        name: 'Kickback triceps haltère',
        sets: '4 × 12-15 /côté',
        equip: 'Haltère 10 kg',
        desc: 'Buste penché, coude collé au corps et fixe, tendez l\'avant-bras vers l\'arrière puis revenez. Isolation triceps.',
        caloriesPerSet: [12, 14],
        totalSets: 4,
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
      {
        name: 'Vélo (cardio fin de séance)',
        sets: '10 min (prog. CAL 1)',
        equip: 'Vélo',
        desc: '10 min sur le programme CAL 1 du Domyos EB900 (résistance élevée), en fin de séance. Cardio court et intense à haute résistance qui remplace le HIIT, sans impact ni appui au sol. Optionnel : désactivable dans les réglages, la musculation seule fait déjà l\'heure.',
        caloriesPerSet: [165, 185],
        totalSets: 1,
        nbRep: 0,
        timer: true,
        duration: 600,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Stationary Cycling',
          muscleGroups: ['quadriceps', 'glutes', 'cardio']
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
        name: 'Soulevé de terre surélevé (rack pull)',
        sets: '5 × 10-12 (tempo lent)',
        equip: 'Barre 30 kg',
        desc: 'Barre posée à hauteur des genoux (cales/support), dos droit, tirez en poussant les hanches. JAMAIS depuis le sol : préserve le dos et contourne la gêne du buste.',
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
        name: 'Rowing haltère un bras',
        sets: '5 × 10-12 (tempo lent) /côté',
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
        name: 'Curl biceps haltères',
        sets: '4 × 12-15',
        equip: 'Haltères 15 kg',
        desc: 'Debout, fléchissez les coudes pour monter les haltères vers les épaules sans balancer. Biceps.',
        caloriesPerSet: [12, 14],
        totalSets: 4,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Dumbbell Curl',
          muscleGroups: ['biceps']
        }
      },
      {
        name: 'Curl marteau haltères',
        sets: '4 × 12-15',
        equip: 'Haltères 15 kg',
        desc: 'Debout, paumes face à face, fléchissez les coudes sans balancer le buste. Biceps et brachial (épaisseur du bras).',
        caloriesPerSet: [16, 18],
        totalSets: 4,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Hammer Curl',
          muscleGroups: ['biceps', 'forearms']
        }
      },
      {
        name: 'Oiseau haltères (arrière épaule)',
        sets: '4 × 12-15',
        equip: 'Haltères 10 kg',
        desc: 'Buste penché ou assis penché, montez les haltères sur les côtés en serrant les omoplates. Arrière de l\'épaule — corrige la posture.',
        caloriesPerSet: [12, 14],
        totalSets: 4,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Rear Delt Raise',
          muscleGroups: ['shoulders', 'back']
        }
      },
      {
        name: 'Shrugs barre (haussements)',
        sets: '4 × 12-15',
        equip: 'Barre 30 kg',
        desc: 'Debout, barre devant, haussez les épaules vers les oreilles sans plier les bras. Trapèzes.',
        caloriesPerSet: [16, 18],
        totalSets: 4,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Barbell Shrugs',
          muscleGroups: ['trapezius', 'back']
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
      {
        name: 'Marche du fermier (farmer carry)',
        sets: '4 × 60 s',
        equip: 'Haltères 15 kg',
        desc: 'Un haltère lourd dans chaque main, marchez 60 s tronc gainé et droit, épaules basses. Anti-flexion, core et grip, debout.',
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
        name: 'Vélo (cardio fin de séance)',
        sets: '10 min (prog. CAL 1)',
        equip: 'Vélo',
        desc: '10 min sur le programme CAL 1 du Domyos EB900 (résistance élevée), en fin de séance. Cardio court et intense à haute résistance qui remplace le HIIT, sans impact ni appui au sol. Optionnel : désactivable dans les réglages, la musculation seule fait déjà l\'heure.',
        caloriesPerSet: [165, 185],
        totalSets: 1,
        nbRep: 0,
        timer: true,
        duration: 600,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Stationary Cycling',
          muscleGroups: ['quadriceps', 'glutes', 'cardio']
        }
      },
    ],
  },
  {
    title: 'JOUR 17: LEGS A (Quadriceps, Fessiers, Mollets) — S3 Intensification',
    isRestDay: false,
    exercises: [
      {
        name: 'Squat barre',
        sets: '5 × 10-12 (tempo lent)',
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
        name: 'Fentes bulgares haltères',
        sets: '5 × 10-12 (tempo lent) /côté',
        equip: 'Haltères 15 kg',
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
        name: 'Montées sur banc lestées',
        sets: '5 × 10-12 (tempo lent) /côté',
        equip: 'Haltères 15 kg',
        desc: 'Montez complètement sur un banc/marche stable, jambe motrice, contrôlez la descente. Alternez. Bas du corps fonctionnel, zéro impact.',
        caloriesPerSet: [16, 18],
        totalSets: 5,
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
        caloriesPerSet: [21, 24],
        totalSets: 4,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Sumo Squat',
          muscleGroups: ['glutes', 'adductors', 'quadriceps']
        }
      },
      {
        name: 'Mollets debout lestés',
        sets: '4 × 12-15',
        equip: 'Veste lestée 10 kg',
        desc: 'Debout, avant-pieds sur une cale ou le bord du banc, montez sur la pointe des pieds puis descendez lentement le talon. Mollets, zéro impact.',
        caloriesPerSet: [12, 14],
        totalSets: 4,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Standing Calf Raise',
          muscleGroups: ['calves']
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
      {
        name: 'Vélo (cardio fin de séance)',
        sets: '10 min (prog. CAL 1)',
        equip: 'Vélo',
        desc: '10 min sur le programme CAL 1 du Domyos EB900 (résistance élevée), en fin de séance. Cardio court et intense à haute résistance qui remplace le HIIT, sans impact ni appui au sol. Optionnel : désactivable dans les réglages, la musculation seule fait déjà l\'heure.',
        caloriesPerSet: [165, 185],
        totalSets: 1,
        nbRep: 0,
        timer: true,
        duration: 600,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Stationary Cycling',
          muscleGroups: ['quadriceps', 'glutes', 'cardio']
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
        caloriesPerSet: [21, 24],
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
        name: 'Push press barre',
        sets: '5 × 10-12 (tempo lent)',
        equip: 'Barre 30 kg',
        desc: 'Debout, légère impulsion des jambes puis poussez la barre au-dessus de la tête. Épaules + puissance, zéro impact.',
        caloriesPerSet: [21, 24],
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
        caloriesPerSet: [12, 14],
        totalSets: 4,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Front Raises',
          muscleGroups: ['shoulders']
        }
      },
      {
        name: 'Élévations latérales haltères',
        sets: '4 × 12-15',
        equip: 'Haltères 10 kg',
        desc: 'Debout, montez les haltères latéralement jusqu\'aux épaules. Deltoïde moyen.',
        caloriesPerSet: [12, 14],
        totalSets: 4,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Lateral Raises',
          muscleGroups: ['shoulders']
        }
      },
      {
        name: 'Oiseau haltères (arrière épaule)',
        sets: '4 × 12-15',
        equip: 'Haltères 10 kg',
        desc: 'Buste penché ou assis penché, montez les haltères sur les côtés en serrant les omoplates. Arrière de l\'épaule — corrige la posture.',
        caloriesPerSet: [12, 14],
        totalSets: 4,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Rear Delt Raise',
          muscleGroups: ['shoulders', 'back']
        }
      },
      {
        name: 'Kickback triceps haltère',
        sets: '4 × 12-15 /côté',
        equip: 'Haltère 10 kg',
        desc: 'Buste penché, coude collé au corps et fixe, tendez l\'avant-bras vers l\'arrière puis revenez. Isolation triceps.',
        caloriesPerSet: [12, 14],
        totalSets: 4,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Triceps Kickback',
          muscleGroups: ['triceps']
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
      {
        name: 'Vélo (cardio fin de séance)',
        sets: '10 min (prog. CAL 1)',
        equip: 'Vélo',
        desc: '10 min sur le programme CAL 1 du Domyos EB900 (résistance élevée), en fin de séance. Cardio court et intense à haute résistance qui remplace le HIIT, sans impact ni appui au sol. Optionnel : désactivable dans les réglages, la musculation seule fait déjà l\'heure.',
        caloriesPerSet: [165, 185],
        totalSets: 1,
        nbRep: 0,
        timer: true,
        duration: 600,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Stationary Cycling',
          muscleGroups: ['quadriceps', 'glutes', 'cardio']
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
        caloriesPerSet: [21, 24],
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
        caloriesPerSet: [21, 24],
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
        caloriesPerSet: [16, 18],
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
        caloriesPerSet: [16, 18],
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
        caloriesPerSet: [12, 14],
        totalSets: 4,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Concentration Curl',
          muscleGroups: ['biceps']
        }
      },
      {
        name: 'Oiseau haltères (arrière épaule)',
        sets: '4 × 12-15',
        equip: 'Haltères 10 kg',
        desc: 'Buste penché ou assis penché, montez les haltères sur les côtés en serrant les omoplates. Arrière de l\'épaule — corrige la posture.',
        caloriesPerSet: [12, 14],
        totalSets: 4,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Rear Delt Raise',
          muscleGroups: ['shoulders', 'back']
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
      {
        name: 'Marche du fermier (farmer carry)',
        sets: '4 × 60 s',
        equip: 'Haltères 15 kg',
        desc: 'Un haltère lourd dans chaque main, marchez 60 s tronc gainé et droit, épaules basses. Anti-flexion, core et grip, debout.',
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
        name: 'Vélo (cardio fin de séance)',
        sets: '10 min (prog. CAL 1)',
        equip: 'Vélo',
        desc: '10 min sur le programme CAL 1 du Domyos EB900 (résistance élevée), en fin de séance. Cardio court et intense à haute résistance qui remplace le HIIT, sans impact ni appui au sol. Optionnel : désactivable dans les réglages, la musculation seule fait déjà l\'heure.',
        caloriesPerSet: [165, 185],
        totalSets: 1,
        nbRep: 0,
        timer: true,
        duration: 600,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Stationary Cycling',
          muscleGroups: ['quadriceps', 'glutes', 'cardio']
        }
      },
    ],
  },
  {
    title: 'JOUR 20: LEGS B (Ischios, Fessiers, Mollets) — S3 Intensification',
    isRestDay: false,
    exercises: [
      {
        name: 'Squat gobelet haltère',
        sets: '5 × 10-12 (tempo lent)',
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
        name: 'Fentes arrière alternées haltères',
        sets: '5 × 10-12 (tempo lent) en alternance',
        equip: 'Haltères 15 kg',
        desc: 'Un pas en arrière, descendez le genou arrière sans le poser, puis revenez debout. Alternez. Fessiers et ischios, plus doux pour les genoux que la fente avant.',
        caloriesPerSet: [21, 24],
        totalSets: 5,
        nbRep: 10,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Reverse Lunges',
          muscleGroups: ['glutes', 'hamstrings', 'quadriceps']
        }
      },
      {
        name: 'Soulevé de terre roumain unilatéral haltère',
        sets: '5 × 10-12 (tempo lent) /côté',
        equip: 'Haltère 15 kg',
        desc: 'Debout sur une jambe (main libre en appui léger si besoin), poussez la hanche en arrière et descendez l\'haltère le long de la jambe d\'appui, dos droit. Ischios, fessiers, équilibre.',
        caloriesPerSet: [21, 24],
        totalSets: 5,
        nbRep: 10,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Single Leg Romanian Deadlift',
          muscleGroups: ['hamstrings', 'glutes', 'core']
        }
      },
      {
        name: 'Mollets debout lestés',
        sets: '4 × 12-15',
        equip: 'Veste lestée 10 kg',
        desc: 'Debout, avant-pieds sur une cale ou le bord du banc, montez sur la pointe des pieds puis descendez lentement le talon. Mollets, zéro impact.',
        caloriesPerSet: [12, 14],
        totalSets: 4,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Standing Calf Raise',
          muscleGroups: ['calves']
        }
      },
      {
        name: 'Extension de hanche debout',
        sets: '4 × 12-15 /côté',
        equip: 'Poids chevilles 4 kg',
        desc: 'Debout en appui léger, tendez la jambe vers l\'arrière en serrant le fessier, sans cambrer le bas du dos. Fessiers, 100% debout.',
        caloriesPerSet: [12, 14],
        totalSets: 4,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Standing Hip Extension',
          muscleGroups: ['glutes', 'hamstrings']
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
      {
        name: 'Marche du fermier (farmer carry)',
        sets: '4 × 60 s',
        equip: 'Haltères 15 kg',
        desc: 'Un haltère lourd dans chaque main, marchez 60 s tronc gainé et droit, épaules basses. Anti-flexion, core et grip, debout.',
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
        name: 'Vélo (cardio fin de séance)',
        sets: '10 min (prog. CAL 1)',
        equip: 'Vélo',
        desc: '10 min sur le programme CAL 1 du Domyos EB900 (résistance élevée), en fin de séance. Cardio court et intense à haute résistance qui remplace le HIIT, sans impact ni appui au sol. Optionnel : désactivable dans les réglages, la musculation seule fait déjà l\'heure.',
        caloriesPerSet: [165, 185],
        totalSets: 1,
        nbRep: 0,
        timer: true,
        duration: 600,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Stationary Cycling',
          muscleGroups: ['quadriceps', 'glutes', 'cardio']
        }
      },
    ],
  },
  {
    title: 'JOUR 21: FULL BODY (Bras, Épaules, Gainage) — S3 Intensification',
    isRestDay: false,
    exercises: [
      {
        name: 'Développé couché haltères',
        sets: '5 × 10-12 (tempo lent)',
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
        name: 'Tirage menton barre (upright row)',
        sets: '5 × 10-12 (tempo lent)',
        equip: 'Barre 30 kg',
        desc: 'Debout, barre devant les cuisses, tirez-la vers le menton coudes hauts, sans monter au-delà des épaules. Trapèzes et deltoïdes.',
        caloriesPerSet: [21, 24],
        totalSets: 5,
        nbRep: 10,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Upright Row',
          muscleGroups: ['shoulders', 'trapezius']
        }
      },
      {
        name: 'Curl marteau haltères',
        sets: '5 × 10-12 (tempo lent)',
        equip: 'Haltères 15 kg',
        desc: 'Debout, paumes face à face, fléchissez les coudes sans balancer le buste. Biceps et brachial (épaisseur du bras).',
        caloriesPerSet: [16, 18],
        totalSets: 5,
        nbRep: 10,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Hammer Curl',
          muscleGroups: ['biceps', 'forearms']
        }
      },
      {
        name: 'Kickback triceps haltère',
        sets: '4 × 12-15 /côté',
        equip: 'Haltère 10 kg',
        desc: 'Buste penché, coude collé au corps et fixe, tendez l\'avant-bras vers l\'arrière puis revenez. Isolation triceps.',
        caloriesPerSet: [12, 14],
        totalSets: 4,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Triceps Kickback',
          muscleGroups: ['triceps']
        }
      },
      {
        name: 'Écarté haltères sur banc',
        sets: '4 × 12-15',
        equip: 'Haltères 10 kg',
        desc: 'Sur banc, bras légèrement fléchis, ouvrez les haltères en arc de cercle puis refermez au-dessus de la poitrine. Étirement des pectoraux.',
        caloriesPerSet: [16, 18],
        totalSets: 4,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Dumbbell Fly',
          muscleGroups: ['chest', 'shoulders']
        }
      },
      {
        name: 'Élévations latérales haltères',
        sets: '4 × 12-15',
        equip: 'Haltères 10 kg',
        desc: 'Debout, montez les haltères latéralement jusqu\'aux épaules. Deltoïde moyen.',
        caloriesPerSet: [12, 14],
        totalSets: 4,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Lateral Raises',
          muscleGroups: ['shoulders']
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
      {
        name: 'Marche du fermier (farmer carry)',
        sets: '4 × 60 s',
        equip: 'Haltères 15 kg',
        desc: 'Un haltère lourd dans chaque main, marchez 60 s tronc gainé et droit, épaules basses. Anti-flexion, core et grip, debout.',
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
        name: 'Vélo (cardio fin de séance)',
        sets: '10 min (prog. CAL 1)',
        equip: 'Vélo',
        desc: '10 min sur le programme CAL 1 du Domyos EB900 (résistance élevée), en fin de séance. Cardio court et intense à haute résistance qui remplace le HIIT, sans impact ni appui au sol. Optionnel : désactivable dans les réglages, la musculation seule fait déjà l\'heure.',
        caloriesPerSet: [165, 185],
        totalSets: 1,
        nbRep: 0,
        timer: true,
        duration: 600,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Stationary Cycling',
          muscleGroups: ['quadriceps', 'glutes', 'cardio']
        }
      },
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
        caloriesPerSet: [21, 24],
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
        name: 'Développé incliné haltères',
        sets: '3 × 12 (allégé)',
        equip: 'Haltères 15 kg',
        desc: 'Banc incliné, poussez les haltères vers le haut en contrôlant la descente. Haut des pectoraux.',
        caloriesPerSet: [21, 24],
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
        name: 'Extension triceps nuque haltère',
        sets: '3 × 15 (allégé)',
        equip: 'Haltères 10 kg',
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
        name: 'Écarté haltères sur banc',
        sets: '3 × 15 (allégé)',
        equip: 'Haltères 10 kg',
        desc: 'Sur banc, bras légèrement fléchis, ouvrez les haltères en arc de cercle puis refermez au-dessus de la poitrine. Étirement des pectoraux.',
        caloriesPerSet: [16, 18],
        totalSets: 3,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Dumbbell Fly',
          muscleGroups: ['chest', 'shoulders']
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
        name: 'Crunch latéral debout (side bend)',
        sets: '3 × 15 /côté',
        equip: 'Haltère 15 kg',
        desc: 'Debout, un haltère d\'un côté, inclinez le buste latéralement puis redressez en contractant l\'oblique. Debout, aucun appui au sol.',
        caloriesPerSet: [13, 15],
        totalSets: 3,
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
        caloriesPerSet: [16, 18],
        totalSets: 3,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Standing Knee Raises',
          muscleGroups: ['abdominals', 'core']
        }
      },
      {
        name: 'Vélo (cardio fin de séance)',
        sets: '10 min (prog. CAL 1)',
        equip: 'Vélo',
        desc: '10 min sur le programme CAL 1 du Domyos EB900 (résistance élevée), en fin de séance. Cardio court et intense à haute résistance qui remplace le HIIT, sans impact ni appui au sol. Optionnel : désactivable dans les réglages, la musculation seule fait déjà l\'heure.',
        caloriesPerSet: [165, 185],
        totalSets: 1,
        nbRep: 0,
        timer: true,
        duration: 600,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Stationary Cycling',
          muscleGroups: ['quadriceps', 'glutes', 'cardio']
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
        name: 'Soulevé de terre surélevé (rack pull)',
        sets: '3 × 12 (allégé)',
        equip: 'Barre 30 kg',
        desc: 'Barre posée à hauteur des genoux (cales/support), dos droit, tirez en poussant les hanches. JAMAIS depuis le sol : préserve le dos et contourne la gêne du buste.',
        caloriesPerSet: [21, 24],
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
        name: 'Curl biceps haltères',
        sets: '3 × 15 (allégé)',
        equip: 'Haltères 15 kg',
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
        name: 'Oiseau haltères (arrière épaule)',
        sets: '3 × 15 (allégé)',
        equip: 'Haltères 10 kg',
        desc: 'Buste penché ou assis penché, montez les haltères sur les côtés en serrant les omoplates. Arrière de l\'épaule — corrige la posture.',
        caloriesPerSet: [12, 14],
        totalSets: 3,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Rear Delt Raise',
          muscleGroups: ['shoulders', 'back']
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
        name: 'Woodchopper haltère',
        sets: '3 × 15 /côté',
        equip: 'Haltère 10 kg',
        desc: 'Debout, amenez l\'haltère en diagonale de la hanche basse vers l\'épaule opposée puis inversez. Rotation du tronc, debout.',
        caloriesPerSet: [16, 18],
        totalSets: 3,
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
        sets: '10 min (prog. CAL 1)',
        equip: 'Vélo',
        desc: '10 min sur le programme CAL 1 du Domyos EB900 (résistance élevée), en fin de séance. Cardio court et intense à haute résistance qui remplace le HIIT, sans impact ni appui au sol. Optionnel : désactivable dans les réglages, la musculation seule fait déjà l\'heure.',
        caloriesPerSet: [165, 185],
        totalSets: 1,
        nbRep: 0,
        timer: true,
        duration: 600,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Stationary Cycling',
          muscleGroups: ['quadriceps', 'glutes', 'cardio']
        }
      },
    ],
  },
  {
    title: 'JOUR 24: LEGS A (Quadriceps, Fessiers, Mollets) — S4 Allègement (deload actif)',
    isRestDay: false,
    exercises: [
      {
        name: 'Squat barre',
        sets: '3 × 12 (allégé)',
        equip: 'Barre 30 kg',
        desc: 'Barre sur les trapèzes, descendez hanches sous parallèle si mobilité OK, puis remontez. Quadriceps, fessiers. Debout.',
        caloriesPerSet: [21, 24],
        totalSets: 3,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Barbell Squat',
          muscleGroups: ['quadriceps', 'glutes', 'hamstrings']
        }
      },
      {
        name: 'Fentes bulgares haltères',
        sets: '3 × 12 (allégé) /côté',
        equip: 'Haltères 15 kg',
        desc: 'Pied arrière surélevé sur le banc, descendez sur la jambe avant. Très efficace quadriceps et fessiers. Debout, zéro impact.',
        caloriesPerSet: [21, 24],
        totalSets: 3,
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
        equip: 'Haltères 15 kg',
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
        name: 'Squat sumo haltère',
        sets: '3 × 15 (allégé)',
        equip: 'Haltère 15 kg',
        desc: 'Pieds très écartés, pointes vers l\'extérieur, haltère tenu entre les jambes. Adducteurs + fessiers. Debout.',
        caloriesPerSet: [21, 24],
        totalSets: 3,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Sumo Squat',
          muscleGroups: ['glutes', 'adductors', 'quadriceps']
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
        sets: '3 × 15 /côté',
        equip: 'Haltère 15 kg',
        desc: 'Debout, un haltère d\'un côté, inclinez le buste latéralement puis redressez en contractant l\'oblique. Debout, aucun appui au sol.',
        caloriesPerSet: [13, 15],
        totalSets: 3,
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
        caloriesPerSet: [16, 18],
        totalSets: 3,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Dumbbell Woodchopper',
          muscleGroups: ['obliques', 'abdominals', 'core']
        }
      },
      {
        name: 'Vélo (cardio fin de séance)',
        sets: '10 min (prog. CAL 1)',
        equip: 'Vélo',
        desc: '10 min sur le programme CAL 1 du Domyos EB900 (résistance élevée), en fin de séance. Cardio court et intense à haute résistance qui remplace le HIIT, sans impact ni appui au sol. Optionnel : désactivable dans les réglages, la musculation seule fait déjà l\'heure.',
        caloriesPerSet: [165, 185],
        totalSets: 1,
        nbRep: 0,
        timer: true,
        duration: 600,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Stationary Cycling',
          muscleGroups: ['quadriceps', 'glutes', 'cardio']
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
        caloriesPerSet: [21, 24],
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
        caloriesPerSet: [21, 24],
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
        caloriesPerSet: [21, 24],
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
        name: 'Oiseau haltères (arrière épaule)',
        sets: '3 × 15 (allégé)',
        equip: 'Haltères 10 kg',
        desc: 'Buste penché ou assis penché, montez les haltères sur les côtés en serrant les omoplates. Arrière de l\'épaule — corrige la posture.',
        caloriesPerSet: [12, 14],
        totalSets: 3,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Rear Delt Raise',
          muscleGroups: ['shoulders', 'back']
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
        name: 'Woodchopper haltère',
        sets: '3 × 15 /côté',
        equip: 'Haltère 10 kg',
        desc: 'Debout, amenez l\'haltère en diagonale de la hanche basse vers l\'épaule opposée puis inversez. Rotation du tronc, debout.',
        caloriesPerSet: [16, 18],
        totalSets: 3,
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
        caloriesPerSet: [16, 18],
        totalSets: 3,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Standing Knee Raises',
          muscleGroups: ['abdominals', 'core']
        }
      },
      {
        name: 'Vélo (cardio fin de séance)',
        sets: '10 min (prog. CAL 1)',
        equip: 'Vélo',
        desc: '10 min sur le programme CAL 1 du Domyos EB900 (résistance élevée), en fin de séance. Cardio court et intense à haute résistance qui remplace le HIIT, sans impact ni appui au sol. Optionnel : désactivable dans les réglages, la musculation seule fait déjà l\'heure.',
        caloriesPerSet: [165, 185],
        totalSets: 1,
        nbRep: 0,
        timer: true,
        duration: 600,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Stationary Cycling',
          muscleGroups: ['quadriceps', 'glutes', 'cardio']
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
        name: 'Pullover haltère sur banc',
        sets: '3 × 12 (allégé)',
        equip: 'Haltère 15 kg',
        desc: 'Allongé en travers du banc, descendez l\'haltère derrière la tête bras tendus puis remontez. Grand dorsal. Sur banc.',
        caloriesPerSet: [16, 18],
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
        name: 'Oiseau haltères (arrière épaule)',
        sets: '3 × 15 (allégé)',
        equip: 'Haltères 10 kg',
        desc: 'Buste penché ou assis penché, montez les haltères sur les côtés en serrant les omoplates. Arrière de l\'épaule — corrige la posture.',
        caloriesPerSet: [12, 14],
        totalSets: 3,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Rear Delt Raise',
          muscleGroups: ['shoulders', 'back']
        }
      },
      {
        name: 'Crunch latéral debout (side bend)',
        sets: '3 × 15 /côté',
        equip: 'Haltère 15 kg',
        desc: 'Debout, un haltère d\'un côté, inclinez le buste latéralement puis redressez en contractant l\'oblique. Debout, aucun appui au sol.',
        caloriesPerSet: [13, 15],
        totalSets: 3,
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
        caloriesPerSet: [16, 18],
        totalSets: 3,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Standing Knee Raises',
          muscleGroups: ['abdominals', 'core']
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
        sets: '10 min (prog. CAL 1)',
        equip: 'Vélo',
        desc: '10 min sur le programme CAL 1 du Domyos EB900 (résistance élevée), en fin de séance. Cardio court et intense à haute résistance qui remplace le HIIT, sans impact ni appui au sol. Optionnel : désactivable dans les réglages, la musculation seule fait déjà l\'heure.',
        caloriesPerSet: [165, 185],
        totalSets: 1,
        nbRep: 0,
        timer: true,
        duration: 600,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Stationary Cycling',
          muscleGroups: ['quadriceps', 'glutes', 'cardio']
        }
      },
    ],
  },
  {
    title: 'JOUR 27: LEGS B (Ischios, Fessiers, Mollets) — S4 Allègement (deload actif)',
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
        name: 'Fentes arrière alternées haltères',
        sets: '3 × 12 (allégé) en alternance',
        equip: 'Haltères 15 kg',
        desc: 'Un pas en arrière, descendez le genou arrière sans le poser, puis revenez debout. Alternez. Fessiers et ischios, plus doux pour les genoux que la fente avant.',
        caloriesPerSet: [21, 24],
        totalSets: 3,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Reverse Lunges',
          muscleGroups: ['glutes', 'hamstrings', 'quadriceps']
        }
      },
      {
        name: 'Soulevé de terre roumain unilatéral haltère',
        sets: '3 × 12 (allégé) /côté',
        equip: 'Haltère 15 kg',
        desc: 'Debout sur une jambe (main libre en appui léger si besoin), poussez la hanche en arrière et descendez l\'haltère le long de la jambe d\'appui, dos droit. Ischios, fessiers, équilibre.',
        caloriesPerSet: [21, 24],
        totalSets: 3,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Single Leg Romanian Deadlift',
          muscleGroups: ['hamstrings', 'glutes', 'core']
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
        name: 'Woodchopper haltère',
        sets: '3 × 15 /côté',
        equip: 'Haltère 10 kg',
        desc: 'Debout, amenez l\'haltère en diagonale de la hanche basse vers l\'épaule opposée puis inversez. Rotation du tronc, debout.',
        caloriesPerSet: [16, 18],
        totalSets: 3,
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
        sets: '10 min (prog. CAL 1)',
        equip: 'Vélo',
        desc: '10 min sur le programme CAL 1 du Domyos EB900 (résistance élevée), en fin de séance. Cardio court et intense à haute résistance qui remplace le HIIT, sans impact ni appui au sol. Optionnel : désactivable dans les réglages, la musculation seule fait déjà l\'heure.',
        caloriesPerSet: [165, 185],
        totalSets: 1,
        nbRep: 0,
        timer: true,
        duration: 600,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Stationary Cycling',
          muscleGroups: ['quadriceps', 'glutes', 'cardio']
        }
      },
    ],
  },
  {
    title: 'JOUR 28: FULL BODY (Bras, Épaules, Gainage) — S4 Allègement (deload actif)',
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
        name: 'Tirage menton barre (upright row)',
        sets: '3 × 12 (allégé)',
        equip: 'Barre 30 kg',
        desc: 'Debout, barre devant les cuisses, tirez-la vers le menton coudes hauts, sans monter au-delà des épaules. Trapèzes et deltoïdes.',
        caloriesPerSet: [21, 24],
        totalSets: 3,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Upright Row',
          muscleGroups: ['shoulders', 'trapezius']
        }
      },
      {
        name: 'Curl marteau haltères',
        sets: '3 × 12 (allégé)',
        equip: 'Haltères 15 kg',
        desc: 'Debout, paumes face à face, fléchissez les coudes sans balancer le buste. Biceps et brachial (épaisseur du bras).',
        caloriesPerSet: [16, 18],
        totalSets: 3,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Hammer Curl',
          muscleGroups: ['biceps', 'forearms']
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
        name: 'Écarté haltères sur banc',
        sets: '3 × 15 (allégé)',
        equip: 'Haltères 10 kg',
        desc: 'Sur banc, bras légèrement fléchis, ouvrez les haltères en arc de cercle puis refermez au-dessus de la poitrine. Étirement des pectoraux.',
        caloriesPerSet: [16, 18],
        totalSets: 3,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Dumbbell Fly',
          muscleGroups: ['chest', 'shoulders']
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
        name: 'Crunch latéral debout (side bend)',
        sets: '3 × 15 /côté',
        equip: 'Haltère 15 kg',
        desc: 'Debout, un haltère d\'un côté, inclinez le buste latéralement puis redressez en contractant l\'oblique. Debout, aucun appui au sol.',
        caloriesPerSet: [13, 15],
        totalSets: 3,
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
        caloriesPerSet: [16, 18],
        totalSets: 3,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Standing Knee Raises',
          muscleGroups: ['abdominals', 'core']
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
        sets: '10 min (prog. CAL 1)',
        equip: 'Vélo',
        desc: '10 min sur le programme CAL 1 du Domyos EB900 (résistance élevée), en fin de séance. Cardio court et intense à haute résistance qui remplace le HIIT, sans impact ni appui au sol. Optionnel : désactivable dans les réglages, la musculation seule fait déjà l\'heure.',
        caloriesPerSet: [165, 185],
        totalSets: 1,
        nbRep: 0,
        timer: true,
        duration: 600,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Stationary Cycling',
          muscleGroups: ['quadriceps', 'glutes', 'cardio']
        }
      },
    ],
  },
];

export const days = fullPlan;
