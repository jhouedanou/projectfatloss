const fullPlan = [
  {
    title: 'JOUR 1: HAUT DU CORPS (Pectoraux, Épaules, Triceps)',
    exercises: [
      {
        name: 'Développé couché barre',
        sets: '4 × 12',
        equip: 'Barre 30 kg',
        desc: "Allongé sur banc, descendez la barre jusqu'à la poitrine puis poussez. Exercice roi pour les pectoraux.",
        caloriesPerSet: [12, 15],
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
        sets: '4 × 10',
        equip: 'Barre 30 kg',
        desc: "Debout ou assis, poussez la barre au-dessus de la tête. Exercice complet pour les épaules.",
        caloriesPerSet: [10, 13],
        totalSets: 4,
        nbRep: 10,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Military Press',
          muscleGroups: ['shoulders', 'triceps']
        }
      },
      {
        name: 'Développé incliné haltères',
        sets: '3 × 12',
        equip: 'Haltères 15 kg',
        desc: "Sur banc incliné (30-45°), poussez les haltères vers le haut. Accentue le travail du haut des pectoraux.",
        caloriesPerSet: [8, 10],
        totalSets: 3,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Incline Dumbbell Press',
          muscleGroups: ['chest', 'shoulders', 'triceps']
        }
      },
      {
        name: 'Élévations latérales',
        sets: '3 × 12',
        equip: 'Haltères 10 kg',
        desc: "Debout, bras le long du corps, soulevez les haltères latéralement jusqu'à hauteur d'épaules. Cible le deltoïde moyen.",
        caloriesPerSet: [6, 8],
        totalSets: 3,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Lateral Raises',
          muscleGroups: ['shoulders']
        }
      },
      {
        name: 'Dips lestés',
        sets: '3 × 10',
        equip: 'Gilet lesté 10 kg',
        desc: "Mains sur un banc/chaise, fléchissez les coudes pour descendre le corps puis remontez. Travaille triceps et pectoraux.",
        caloriesPerSet: [10, 12],
        totalSets: 3,
        nbRep: 10,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Weighted Dips',
          muscleGroups: ['chest', 'triceps']
        }
      },
      {
        name: 'Extensions triceps',
        sets: '3 × 15',
        equip: 'Haltère 15 kg (à deux mains)',
        desc: "Allongé ou assis, haltère tenu à deux mains au-dessus de la tête, pliez les coudes puis tendez les bras. Isole les triceps.",
        caloriesPerSet: [8, 10],
        totalSets: 3,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Triceps Extensions',
          muscleGroups: ['triceps']
        }
      },
      {
        name: 'Crunchs',
        sets: '3 × 25',
        equip: 'Poids du corps',
        desc: "Allongé, jambes fléchies, remontez le buste en contractant les abdominaux. Exercice de finition obligatoire.",
        caloriesPerSet: [5, 7],
        totalSets: 3,
        nbRep: 25,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Crunches',
          muscleGroups: ['abdominals']
        }
      },
    ],
  },
  {
    title: 'JOUR 2: HAUT DU CORPS (Dos, Biceps)',
    exercises: [
      {
        name: 'Rowing buste penché barre',
        sets: '4 × 12',
        equip: 'Barre 30 kg',
        desc: "Buste penché à 45°, tirez la barre vers le bas des abdominaux. Développe l'épaisseur du dos.",
        caloriesPerSet: [12, 15],
        totalSets: 4,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Bent Over Barbell Row',
          muscleGroups: ['back', 'biceps']
        }
      },
      {
        name: 'Tractions lestées (ou rowing inversé)',
        sets: '4 × 10',
        equip: 'Barre fixe ou barre basse',
        desc: "Suspendez-vous à une barre, tirez jusqu'à amener le menton au-dessus. Si trop difficile, utilisez rowing inversé sous une barre basse.",
        caloriesPerSet: [12, 15],
        totalSets: 4,
        nbRep: 10,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Pull-ups',
          muscleGroups: ['back', 'biceps']
        }
      },
      {
        name: 'Rowing haltères un bras',
        sets: '3 × 12',
        equip: 'Haltère 15 kg',
        desc: "Un genou et une main sur un banc, tirez l'haltère vers la hanche en gardant le coude près du corps. Isole un côté du dos à la fois.",
        caloriesPerSet: [8, 10],
        totalSets: 3,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'One-Arm Dumbbell Row',
          muscleGroups: ['back', 'biceps']
        }
      },
      {
        name: 'Curl barre',
        sets: '3 × 12',
        equip: 'Barre 30 kg',
        desc: "Debout, coudes fixes, curl la barre vers les épaules. Maximise la congestion des biceps.",
        caloriesPerSet: [8, 10],
        totalSets: 3,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Barbell Curl',
          muscleGroups: ['biceps']
        }
      },
      {
        name: 'Curl marteau',
        sets: '3 × 12',
        equip: 'Haltères 15 kg',
        desc: "Comme le curl biceps mais paumes face à face. Travaille biceps et avant-bras.",
        caloriesPerSet: [6, 8],
        totalSets: 3,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Hammer Curl',
          muscleGroups: ['biceps', 'forearms']
        }
      },
      {
        name: 'Shrugs barre',
        sets: '3 × 15',
        equip: 'Barre 30 kg',
        desc: "Debout, barre en main, haussez les épaules vers les oreilles. Développe les trapèzes supérieurs.",
        caloriesPerSet: [8, 10],
        totalSets: 3,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Barbell Shrugs',
          muscleGroups: ['trapezius']
        }
      },
      {
        name: 'Crunchs',
        sets: '3 × 25',
        equip: 'Poids du corps',
        desc: "Allongé, jambes fléchies, remontez le buste en contractant les abdominaux. Exercice de finition obligatoire.",
        caloriesPerSet: [5, 7],
        totalSets: 3,
        nbRep: 25,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Crunches',
          muscleGroups: ['abdominals']
        }
      },
    ],
  },
  {
    title: 'JOUR 3: HAUT DU CORPS (Pectoraux, Épaules, Dos)',
    exercises: [
      {
        name: 'Pompes lestées',
        sets: '4 × 10',
        equip: 'Gilet lesté 10 kg',
        desc: "En appui sur mains et pieds, fléchissez les coudes puis poussez. Différentes positions des mains ciblent différentes parties des pectoraux.",
        caloriesPerSet: [10, 12],
        totalSets: 4,
        nbRep: 10,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Weighted Push-Ups',
          muscleGroups: ['chest', 'triceps']
        }
      },
      {
        name: 'Développé Arnold',
        sets: '3 × 12',
        equip: 'Haltères 10 kg',
        desc: "Assis, partez haltères devant vous, paumes face à vous, puis tournez les poignets en poussant vers le haut. Travaille tous les faisceaux des deltoïdes.",
        caloriesPerSet: [8, 10],
        totalSets: 3,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Arnold Press',
          muscleGroups: ['shoulders']
        }
      },
      {
        name: 'Soulevé de terre',
        sets: '4 × 10',
        equip: 'Barre 30 kg',
        desc: "Debout, pieds écartés, saisissez la barre au sol et soulevez-la en gardant le dos droit. Travaille tout le corps, particulièrement le dos et les jambes.",
        caloriesPerSet: [12, 15],
        totalSets: 4,
        nbRep: 10,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Deadlift',
          muscleGroups: ['back', 'legs']
        }
      },
      {
        name: 'Oiseau haltères',
        sets: '3 × 15',
        equip: 'Haltères 10 kg',
        desc: "Penché à 90°, écartez les haltères sur les côtés. Renforce les deltoïdes postérieurs et le haut du dos.",
        caloriesPerSet: [8, 10],
        totalSets: 3,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Reverse Fly',
          muscleGroups: ['rear_deltoids', 'upper_back']
        }
      },
      {
        name: 'Curl concentré',
        sets: '3 × 12',
        equip: 'Haltère 15 kg',
        desc: "Assis, coude calé contre la cuisse, fléchissez le bras. Maximise l'isolation du biceps.",
        caloriesPerSet: [6, 8],
        totalSets: 3,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Concentration Curl',
          muscleGroups: ['biceps']
        }
      },
      {
        name: 'Barre au front',
        sets: '3 × 15',
        equip: 'Barre 30 kg',
        desc: "Allongé, descendez la barre vers le front puis remontez en tendant les bras. Alternative aux kickbacks, cible les triceps.",
        caloriesPerSet: [8, 10],
        totalSets: 3,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Skull Crushers',
          muscleGroups: ['triceps']
        }
      },
      {
        name: 'Crunchs',
        sets: '3 × 25',
        equip: 'Poids du corps',
        desc: "Allongé, jambes fléchies, remontez le buste en contractant les abdominaux. Exercice de finition obligatoire.",
        caloriesPerSet: [5, 7],
        totalSets: 3,
        nbRep: 25,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Crunches',
          muscleGroups: ['abdominals']
        }
      },
    ],
  },
  {
    title: 'JOUR 4: BAS DU CORPS (Jambes, Fessiers)',
    exercises: [
      {
        name: 'Squats',
        sets: '4 × 15',
        equip: 'Barre 30 kg',
        desc: "Debout, pieds écartés largeur d'épaules, barre sur les épaules, descendez comme pour s'asseoir puis remontez. Travaille quadriceps, ischio-jambiers et fessiers.",
        caloriesPerSet: [12, 15],
        totalSets: 4,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Squats',
          muscleGroups: ['quadriceps', 'hamstrings', 'glutes']
        }
      },
      {
        name: 'Soulevé de terre roumain',
        sets: '4 × 12',
        equip: 'Barre 30 kg',
        desc: "Debout, jambes légèrement fléchies, penchez le buste en avant en gardant le dos droit. Cible les ischio-jambiers et les lombaires.",
        caloriesPerSet: [10, 13],
        totalSets: 4,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Romanian Deadlift',
          muscleGroups: ['hamstrings', 'lower_back']
        }
      },
      {
        name: 'Fentes avant alternées',
        sets: '3 × 12/jambe',
        equip: 'Haltères 15 kg',
        desc: "Un pas en avant, haltères en main, fléchissez les genoux pour descendre, puis remontez. Cible quadriceps, fessiers et équilibre.",
        caloriesPerSet: [14, 18],
        totalSets: 6,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Alternating Lunges',
          muscleGroups: ['quadriceps', 'glutes']
        }
      },
      {
        name: 'Hip thrust',
        sets: '3 × 15',
        equip: 'Barre 30 kg',
        desc: "Épaules sur un banc/canapé, barre sur les hanches, soulevez le bassin. Maximise le travail des fessiers.",
        caloriesPerSet: [12, 15],
        totalSets: 3,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Hip Thrust',
          muscleGroups: ['glutes']
        }
      },
      {
        name: 'Mollets debout',
        sets: '3 × 20',
        equip: 'Haltères 15 kg',
        desc: "Debout sur une marche/livre, montez sur la pointe des pieds puis redescendez. Cible les mollets.",
        caloriesPerSet: [8, 10],
        totalSets: 3,
        nbRep: 20,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Standing Calf Raises',
          muscleGroups: ['calves']
        }
      },
      {
        name: 'Relevé de jambes',
        sets: '3 × 15',
        equip: 'Lestage aux chevilles (optionnel)',
        desc: "Allongé, soulevez les jambes tendues à 90°. Cible le bas des abdominaux.",
        caloriesPerSet: [6, 8],
        totalSets: 3,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Leg Raises',
          muscleGroups: ['abdominals']
        }
      },
      {
        name: 'Crunchs',
        sets: '3 × 25',
        equip: 'Poids du corps',
        desc: "Allongé, jambes fléchies, remontez le buste en contractant les abdominaux. Exercice de finition obligatoire.",
        caloriesPerSet: [5, 7],
        totalSets: 3,
        nbRep: 25,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Crunches',
          muscleGroups: ['abdominals']
        }
      },
    ],
  },
  {
    title: 'JOUR 5: BAS DU CORPS (Quadriceps, Fessiers)',
    exercises: [
      {
        name: 'Squat avant barre',
        sets: '4 × 12',
        equip: 'Barre 30 kg',
        desc: "Barre devant sur les épaules (position front squat), descendez en squat. Met l'accent sur les quadriceps.",
        caloriesPerSet: [14, 18],
        totalSets: 4,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Front Squat',
          muscleGroups: ['quadriceps', 'glutes']
        }
      },
      {
        name: 'Soulevé de terre jambes raides barre',
        sets: '4 × 12',
        equip: 'Barre 30 kg',
        desc: "Jambes presque tendues, barre descend le long des tibias. Cible ischio-jambiers et lombaires.",
        caloriesPerSet: [12, 15],
        totalSets: 4,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Stiff-Leg Barbell Deadlift',
          muscleGroups: ['hamstrings', 'lower_back']
        }
      },
      {
        name: 'Fentes marchées haltères',
        sets: '3 × 12/jambe',
        equip: 'Haltères 15 kg',
        desc: "Fentes en avançant sur plusieurs mètres. Excellent pour l'équilibre et le développement des jambes.",
        caloriesPerSet: [12, 15],
        totalSets: 6,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Walking Lunges',
          muscleGroups: ['quadriceps', 'glutes']
        }
      },
      {
        name: 'Goblet squat',
        sets: '3 × 15',
        equip: 'Haltère 15 kg',
        desc: "Tenez un haltère contre votre poitrine, descendez en squat profond. Parfait pour la mobilité et les quadriceps.",
        caloriesPerSet: [10, 12],
        totalSets: 3,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Goblet Squat',
          muscleGroups: ['quadriceps', 'glutes']
        }
      },
      {
        name: 'Step-ups',
        sets: '3 × 15/jambe',
        equip: 'Haltères 10 kg',
        desc: "Montez sur une marche/banc avec un pied, puis l'autre. Alternative aux extensions de jambes.",
        caloriesPerSet: [10, 12],
        totalSets: 6,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Step-Ups',
          muscleGroups: ['quadriceps', 'glutes']
        }
      },
      {
        name: 'Russian twists',
        sets: '3 × 20',
        equip: 'Haltère 10 kg',
        desc: "Assis, pieds décollés, tournez le torse alternativement de chaque côté. Cible les obliques.",
        caloriesPerSet: [8, 10],
        totalSets: 3,
        nbRep: 20,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Russian Twists',
          muscleGroups: ['obliques', 'abdominals']
        }
      },
      {
        name: 'Crunchs',
        sets: '3 × 25',
        equip: 'Poids du corps',
        desc: "Allongé, jambes fléchies, remontez le buste en contractant les abdominaux. Exercice de finition obligatoire.",
        caloriesPerSet: [5, 7],
        totalSets: 3,
        nbRep: 25,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Crunches',
          muscleGroups: ['abdominals']
        }
      },
    ],
  },
  {
    title: 'JOUR 6: BAS DU CORPS (Jambes, Adducteurs)',
    exercises: [
      {
        name: 'Squats sumo',
        sets: '4 × 15',
        equip: 'Barre 30 kg',
        desc: "Pieds très écartés, pointes vers l'extérieur, descendez puis remontez. Accentue le travail des adducteurs et des fessiers.",
        caloriesPerSet: [14, 18],
        totalSets: 4,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Sumo Squats',
          muscleGroups: ['quadriceps', 'glutes', 'adductors']
        }
      },
      {
        name: 'Soulevé de terre sumo',
        sets: '4 × 10',
        equip: 'Barre 30 kg',
        desc: "Pieds très écartés, barre entre les jambes, soulevez en gardant le dos droit. Variante qui cible davantage les adducteurs.",
        caloriesPerSet: [14, 18],
        totalSets: 4,
        nbRep: 10,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Sumo Deadlift',
          muscleGroups: ['legs', 'back']
        }
      },
      {
        name: 'Squats bulgares',
        sets: '3 × 12/jambe',
        equip: 'Haltères 10 kg',
        desc: "Pied arrière sur un banc, descendez en fente. Excellent exercice unilatéral pour les quadriceps et les fessiers.",
        caloriesPerSet: [12, 15],
        totalSets: 6,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Bulgarian Split Squats',
          muscleGroups: ['quadriceps', 'glutes']
        }
      },
      {
        name: 'Fentes latérales',
        sets: '3 × 12/côté',
        equip: 'Haltères 15 kg',
        desc: "Écartez une jambe sur le côté, fléchissez puis revenez. Cible particulièrement les adducteurs.",
        caloriesPerSet: [12, 15],
        totalSets: 6,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Lateral Lunges',
          muscleGroups: ['adductors', 'quadriceps']
        }
      },
      {
        name: 'Mollets assis',
        sets: '3 × 20',
        equip: 'Barre 30 kg sur les genoux',
        desc: "Assis, montez sur la pointe des pieds puis redescendez. Cible différemment les mollets.",
        caloriesPerSet: [8, 10],
        totalSets: 3,
        nbRep: 20,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Seated Calf Raises',
          muscleGroups: ['calves']
        }
      },
      {
        name: 'Bicycle crunch',
        sets: '3 × 20',
        equip: 'Lesté (optionnel)',
        desc: "Allongé, amenez le coude vers le genou opposé en alternant. Excellent pour cibler tous les abdominaux.",
        caloriesPerSet: [8, 10],
        totalSets: 3,
        nbRep: 20,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Bicycle Crunches',
          muscleGroups: ['abdominals', 'obliques']
        }
      },
      {
        name: 'Crunchs',
        sets: '3 × 25',
        equip: 'Poids du corps',
        desc: "Allongé, jambes fléchies, remontez le buste en contractant les abdominaux. Exercice de finition obligatoire.",
        caloriesPerSet: [5, 7],
        totalSets: 3,
        nbRep: 25,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Crunches',
          muscleGroups: ['abdominals']
        }
      },
    ],
  },
  {
    title: 'JOUR 7: REPOS',
    isRestDay: true,
    exercises: [],
  },
  {
    title: 'JOUR 8: HAUT DU CORPS (Pectoraux, Épaules, Triceps)',
    exercises: [
      {
        name: 'Développé couché haltères',
        sets: '4 × 12',
        equip: 'Haltères 15 kg',
        desc: "Allongé sur banc, poussez les haltères vers le haut en contractant les pectoraux. Variante offrant une plus grande amplitude de mouvement.",
        caloriesPerSet: [10, 13],
        totalSets: 4,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Dumbbell Bench Press',
          muscleGroups: ['chest', 'triceps', 'shoulders']
        }
      },
      {
        name: 'Push press',
        sets: '4 × 10',
        equip: 'Barre 30 kg',
        desc: "Debout, fléchissez légèrement les genoux puis poussez la barre au-dessus de la tête de manière explosive. Combine force et puissance.",
        caloriesPerSet: [12, 15],
        totalSets: 4,
        nbRep: 10,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Push Press',
          muscleGroups: ['shoulders', 'triceps']
        }
      },
      {
        name: 'Écartés haltères',
        sets: '3 × 12',
        equip: 'Haltères 10 kg',
        desc: "Allongé sur banc, bras légèrement fléchis, écartez les haltères puis ramenez-les au-dessus de la poitrine. Isole les pectoraux.",
        caloriesPerSet: [7, 9],
        totalSets: 3,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Dumbbell Flyes',
          muscleGroups: ['chest']
        }
      },
      {
        name: 'Élévations frontales',
        sets: '3 × 12',
        equip: 'Haltères 10 kg',
        desc: "Debout, soulevez les haltères devant vous jusqu'à hauteur d'épaules. Cible le deltoïde antérieur.",
        caloriesPerSet: [6, 8],
        totalSets: 3,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Front Raises',
          muscleGroups: ['shoulders']
        }
      },
      {
        name: 'Kickbacks triceps',
        sets: '3 × 15',
        equip: 'Haltères 10 kg',
        desc: "Penché en avant, bras le long du corps, tendez l'avant-bras vers l'arrière. Excellent exercice d'isolation pour les triceps.",
        caloriesPerSet: [6, 8],
        totalSets: 3,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Triceps Kickbacks',
          muscleGroups: ['triceps']
        }
      },
      {
        name: 'Pompes diamant',
        sets: '3 × 12',
        equip: 'Poids du corps',
        desc: "Mains rapprochées en forme de losange, descendez puis remontez. Sollicite fortement les triceps et l'intérieur des pectoraux.",
        caloriesPerSet: [8, 10],
        totalSets: 3,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Diamond Push-Ups',
          muscleGroups: ['triceps', 'chest']
        }
      },
      {
        name: 'Planche',
        sets: '3 × 45s',
        equip: 'Poids du corps',
        desc: "En appui sur les avant-bras et les pointes de pieds, maintenez le corps aligné. Renforce la sangle abdominale en profondeur.",
        caloriesPerSet: [5, 7],
        totalSets: 3,
        nbRep: 45,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Plank',
          muscleGroups: ['abdominals']
        }
      },
    ],
  },
  {
    title: 'JOUR 9: HAUT DU CORPS (Dos, Biceps)',
    exercises: [
      {
        name: 'Rowing Pendlay',
        sets: '4 × 10',
        equip: 'Barre 30 kg',
        desc: "Penché à 90°, tirez la barre depuis le sol vers le ventre de manière explosive. Développe la puissance et l'épaisseur du dos.",
        caloriesPerSet: [12, 15],
        totalSets: 4,
        nbRep: 10,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Pendlay Row',
          muscleGroups: ['back', 'biceps']
        }
      },
      {
        name: 'Tractions supination',
        sets: '4 × 10',
        equip: 'Barre fixe',
        desc: "Mains en supination (paumes vers soi), tirez le menton au-dessus de la barre. Recrute fortement les biceps et le grand dorsal.",
        caloriesPerSet: [10, 13],
        totalSets: 4,
        nbRep: 10,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Chin-Ups',
          muscleGroups: ['back', 'biceps']
        }
      },
      {
        name: 'Tirage menton',
        sets: '3 × 12',
        equip: 'Barre 30 kg',
        desc: "Debout, tirez la barre le long du corps jusqu'au menton, coudes hauts. Travaille les trapèzes et les épaules.",
        caloriesPerSet: [8, 10],
        totalSets: 3,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Upright Row',
          muscleGroups: ['shoulders', 'trapezius']
        }
      },
      {
        name: 'Curl incliné',
        sets: '3 × 12',
        equip: 'Haltères 10 kg',
        desc: "Assis sur banc incliné, bras pendants, réalisez un curl. L'inclinaison étire davantage le biceps pour un meilleur travail musculaire.",
        caloriesPerSet: [6, 8],
        totalSets: 3,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Incline Curl',
          muscleGroups: ['biceps']
        }
      },
      {
        name: 'Curl inversé',
        sets: '3 × 12',
        equip: 'Barre 30 kg',
        desc: "Debout, barre en prise pronation, réalisez un curl. Cible les avant-bras et le brachial pour un bras complet.",
        caloriesPerSet: [6, 8],
        totalSets: 3,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Reverse Curl',
          muscleGroups: ['forearms', 'biceps']
        }
      },
      {
        name: 'Face pulls haltères',
        sets: '3 × 15',
        equip: 'Haltères 10 kg',
        desc: "Penché en avant, tirez les haltères vers le visage, coudes hauts. Renforce l'arrière des épaules et améliore la posture.",
        caloriesPerSet: [6, 8],
        totalSets: 3,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Dumbbell Face Pulls',
          muscleGroups: ['rear_deltoids', 'upper_back']
        }
      },
      {
        name: 'Gainage latéral',
        sets: '3 × 30s/côté',
        equip: 'Poids du corps',
        desc: "En appui sur un avant-bras, maintenez le corps aligné sur le côté. Renforce les obliques et la stabilité du tronc.",
        caloriesPerSet: [5, 7],
        totalSets: 6,
        nbRep: 30,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Side Plank',
          muscleGroups: ['obliques', 'abdominals']
        }
      },
    ],
  },
  {
    title: 'JOUR 10: HAUT DU CORPS (Pectoraux, Épaules, Dos)',
    exercises: [
      {
        name: 'Développé décliné barre',
        sets: '4 × 12',
        equip: 'Barre 30 kg',
        desc: "Allongé sur banc décliné, descendez la barre vers le bas de la poitrine puis poussez. Accentue le travail du bas des pectoraux.",
        caloriesPerSet: [12, 15],
        totalSets: 4,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Decline Bench Press',
          muscleGroups: ['chest', 'triceps']
        }
      },
      {
        name: 'Développé haltères épaules',
        sets: '3 × 12',
        equip: 'Haltères 15 kg',
        desc: "Assis ou debout, poussez les haltères au-dessus de la tête. Offre une meilleure liberté de mouvement que la barre.",
        caloriesPerSet: [8, 10],
        totalSets: 3,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Dumbbell Shoulder Press',
          muscleGroups: ['shoulders']
        }
      },
      {
        name: 'Rowing barre prise large',
        sets: '4 × 10',
        equip: 'Barre 30 kg',
        desc: "Penché en avant, tirez la barre avec une prise large vers la poitrine. Cible davantage le deltoïde postérieur et le haut du dos.",
        caloriesPerSet: [10, 13],
        totalSets: 4,
        nbRep: 10,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Wide Grip Barbell Row',
          muscleGroups: ['back', 'rear_deltoids']
        }
      },
      {
        name: 'Oiseau incliné',
        sets: '3 × 15',
        equip: 'Haltères 10 kg',
        desc: "Penché sur un banc incliné, écartez les bras latéralement. Isole efficacement l'arrière des épaules.",
        caloriesPerSet: [6, 8],
        totalSets: 3,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Incline Reverse Fly',
          muscleGroups: ['rear_deltoids', 'upper_back']
        }
      },
      {
        name: 'Curl 21s',
        sets: '3 × 21',
        equip: 'Barre 30 kg',
        desc: "7 répétitions en demi-basse, 7 en demi-haute, 7 complètes. Technique intense qui brûle les biceps en profondeur.",
        caloriesPerSet: [8, 10],
        totalSets: 3,
        nbRep: 21,
        googleFitActivity: {
          type: 'strength_training',
          name: '21s Curl',
          muscleGroups: ['biceps']
        }
      },
      {
        name: 'Extensions triceps overhead haltère',
        sets: '3 × 15',
        equip: 'Haltère 15 kg',
        desc: "Debout, haltère tenu à deux mains derrière la tête, tendez les bras vers le haut. Excellent étirement et contraction des triceps.",
        caloriesPerSet: [8, 10],
        totalSets: 3,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Overhead Triceps Extension',
          muscleGroups: ['triceps']
        }
      },
      {
        name: 'Crunchs obliques',
        sets: '3 × 20',
        equip: 'Poids du corps',
        desc: "Allongé, amenez le coude vers le genou opposé en rotation du buste. Cible les obliques pour une taille sculptée.",
        caloriesPerSet: [5, 7],
        totalSets: 3,
        nbRep: 20,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Oblique Crunches',
          muscleGroups: ['obliques', 'abdominals']
        }
      },
    ],
  },
  {
    title: 'JOUR 11: BAS DU CORPS (Jambes, Fessiers)',
    exercises: [
      {
        name: 'Squat pause',
        sets: '4 × 12',
        equip: 'Barre 30 kg',
        desc: "Descendez en squat, marquez une pause de 2 secondes en bas puis remontez. La pause élimine l'élan et intensifie le travail musculaire.",
        caloriesPerSet: [14, 18],
        totalSets: 4,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Pause Squat',
          muscleGroups: ['quadriceps', 'glutes', 'hamstrings']
        }
      },
      {
        name: 'Soulevé de terre classique',
        sets: '4 × 10',
        equip: 'Barre 30 kg',
        desc: "Pieds largeur des épaules, soulevez la barre du sol en gardant le dos droit. Mouvement fondamental pour la chaîne postérieure.",
        caloriesPerSet: [14, 18],
        totalSets: 4,
        nbRep: 10,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Conventional Deadlift',
          muscleGroups: ['back', 'hamstrings', 'glutes']
        }
      },
      {
        name: 'Fentes arrière',
        sets: '3 × 12/jambe',
        equip: 'Haltères 15 kg',
        desc: "Faites un pas en arrière puis descendez en fente. Moins de stress sur les genoux que les fentes avant tout en ciblant bien les fessiers.",
        caloriesPerSet: [12, 15],
        totalSets: 6,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Reverse Lunges',
          muscleGroups: ['quadriceps', 'glutes']
        }
      },
      {
        name: 'Pont fessier barre',
        sets: '3 × 15',
        equip: 'Barre 30 kg',
        desc: "Dos contre un banc, barre sur les hanches, poussez les hanches vers le haut. Activation maximale des fessiers.",
        caloriesPerSet: [10, 12],
        totalSets: 3,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Barbell Glute Bridge',
          muscleGroups: ['glutes']
        }
      },
      {
        name: 'Mollets unilatéral',
        sets: '3 × 15/jambe',
        equip: 'Haltère 15 kg',
        desc: "Sur un pied, montez sur la pointe puis redescendez lentement. Le travail unilatéral corrige les déséquilibres entre les deux jambes.",
        caloriesPerSet: [6, 8],
        totalSets: 6,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Single Leg Calf Raise',
          muscleGroups: ['calves']
        }
      },
      {
        name: 'Crunchs inversés',
        sets: '3 × 15',
        equip: 'Poids du corps',
        desc: "Allongé, ramenez les genoux vers la poitrine en décollant les hanches du sol. Cible le bas des abdominaux.",
        caloriesPerSet: [5, 7],
        totalSets: 3,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Reverse Crunches',
          muscleGroups: ['abdominals']
        }
      },
      {
        name: 'Gainage',
        sets: '3 × 45s',
        equip: 'Poids du corps',
        desc: "En appui sur les avant-bras et les pointes de pieds, maintenez le corps droit. Renforce le core en profondeur.",
        caloriesPerSet: [5, 7],
        totalSets: 3,
        nbRep: 45,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Plank',
          muscleGroups: ['abdominals']
        }
      },
    ],
  },
  {
    title: 'JOUR 12: BAS DU CORPS (Quadriceps, Fessiers)',
    exercises: [
      {
        name: 'Hack squat (haltère)',
        sets: '4 × 12',
        equip: 'Haltères 15 kg',
        desc: "Haltères le long du corps, descendez en squat en gardant le buste droit. Variante qui cible davantage les quadriceps.",
        caloriesPerSet: [12, 15],
        totalSets: 4,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Dumbbell Hack Squat',
          muscleGroups: ['quadriceps', 'glutes']
        }
      },
      {
        name: 'Good morning barre',
        sets: '4 × 12',
        equip: 'Barre 30 kg',
        desc: "Barre sur les épaules, penchez le buste vers l'avant en gardant les jambes légèrement fléchies. Renforce les ischio-jambiers et le bas du dos.",
        caloriesPerSet: [10, 13],
        totalSets: 4,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Good Morning',
          muscleGroups: ['hamstrings', 'lower_back']
        }
      },
      {
        name: 'Fentes croisées',
        sets: '3 × 12/jambe',
        equip: 'Haltères 10 kg',
        desc: "Faites un pas croisé derrière l'autre jambe puis descendez en fente. Sollicite les fessiers sous un angle différent.",
        caloriesPerSet: [10, 12],
        totalSets: 6,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Curtsy Lunges',
          muscleGroups: ['glutes', 'quadriceps']
        }
      },
      {
        name: 'Squat pistol assisté',
        sets: '3 × 8/jambe',
        equip: 'Poids du corps',
        desc: "Sur un pied, descendez en squat complet en utilisant un support pour l'équilibre. Développe la force unilatérale des jambes.",
        caloriesPerSet: [10, 12],
        totalSets: 6,
        nbRep: 8,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Assisted Pistol Squat',
          muscleGroups: ['quadriceps', 'glutes']
        }
      },
      {
        name: 'Box jumps',
        sets: '3 × 12',
        equip: 'Poids du corps',
        desc: "Sautez sur une surface surélevée de manière explosive puis redescendez. Développe la puissance des jambes et brûle les calories.",
        caloriesPerSet: [10, 13],
        totalSets: 3,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Box Jumps',
          muscleGroups: ['quadriceps', 'glutes', 'calves']
        }
      },
      {
        name: 'Planche abdominale',
        sets: '3 × 45s',
        equip: 'Poids du corps',
        desc: "En appui sur les avant-bras, maintenez le corps parfaitement aligné. Gainage fondamental pour la stabilité du tronc.",
        caloriesPerSet: [5, 7],
        totalSets: 3,
        nbRep: 45,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Plank',
          muscleGroups: ['abdominals']
        }
      },
      {
        name: 'Dead bug',
        sets: '3 × 15',
        equip: 'Poids du corps',
        desc: "Allongé sur le dos, bras et jambes levés, étendez alternativement un bras et la jambe opposée. Renforce le core en douceur.",
        caloriesPerSet: [5, 7],
        totalSets: 3,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Dead Bug',
          muscleGroups: ['abdominals']
        }
      },
    ],
  },
  {
    title: 'JOUR 13: BAS DU CORPS (Jambes, Adducteurs)',
    exercises: [
      {
        name: 'Squat goblet sumo',
        sets: '4 × 15',
        equip: 'Haltère 15 kg',
        desc: "Pieds très écartés, haltère tenu devant la poitrine, descendez puis remontez. Cible les adducteurs et les fessiers en profondeur.",
        caloriesPerSet: [12, 15],
        totalSets: 4,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Sumo Goblet Squat',
          muscleGroups: ['quadriceps', 'glutes', 'adductors']
        }
      },
      {
        name: 'Soulevé de terre valise',
        sets: '4 × 10/côté',
        equip: 'Haltère 15 kg',
        desc: "Un haltère dans une main, soulevez comme un soulevé de terre. L'asymétrie engage fortement les obliques et la stabilité du tronc.",
        caloriesPerSet: [10, 13],
        totalSets: 8,
        nbRep: 10,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Suitcase Deadlift',
          muscleGroups: ['legs', 'obliques']
        }
      },
      {
        name: 'Split squat',
        sets: '3 × 12/jambe',
        equip: 'Haltères 10 kg',
        desc: "Un pied devant l'autre, descendez en fente sans bouger les pieds. Exercice unilatéral efficace pour les quadriceps et les fessiers.",
        caloriesPerSet: [10, 12],
        totalSets: 6,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Split Squat',
          muscleGroups: ['quadriceps', 'glutes']
        }
      },
      {
        name: 'Adducteur au sol',
        sets: '3 × 15/jambe',
        equip: 'Poids du corps',
        desc: "Allongé sur le côté, soulevez la jambe du bas vers le haut. Isole les adducteurs de manière ciblée.",
        caloriesPerSet: [4, 6],
        totalSets: 6,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Lying Adductor Raise',
          muscleGroups: ['adductors']
        }
      },
      {
        name: 'Mollets sautés',
        sets: '3 × 20',
        equip: 'Poids du corps',
        desc: "Montez sur la pointe des pieds puis sautez légèrement. La composante pliométrique augmente la puissance des mollets.",
        caloriesPerSet: [8, 10],
        totalSets: 3,
        nbRep: 20,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Jumping Calf Raises',
          muscleGroups: ['calves']
        }
      },
      {
        name: 'Mountain climbers',
        sets: '3 × 20',
        equip: 'Poids du corps',
        desc: "En position de pompe, amenez alternativement les genoux vers la poitrine rapidement. Exercice cardio et abdominaux combiné.",
        caloriesPerSet: [8, 10],
        totalSets: 3,
        nbRep: 20,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Mountain Climbers',
          muscleGroups: ['abdominals']
        }
      },
      {
        name: 'Crunchs vélo',
        sets: '3 × 20',
        equip: 'Poids du corps',
        desc: "Allongé, pédalez dans le vide en amenant le coude vers le genou opposé. Travaille abdominaux et obliques simultanément.",
        caloriesPerSet: [5, 7],
        totalSets: 3,
        nbRep: 20,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Bicycle Crunches',
          muscleGroups: ['abdominals', 'obliques']
        }
      },
    ],
  },
  {
    title: 'JOUR 14: REPOS',
    isRestDay: true,
    exercises: [],
  },
  {
    title: 'JOUR 15: HAUT DU CORPS (Pectoraux, Épaules, Triceps)',
    exercises: [
      {
        name: 'Floor press haltères',
        sets: '4 × 12',
        equip: 'Haltères 15 kg',
        desc: "Allongé au sol, poussez les haltères vers le haut. Le sol limite l'amplitude et protège les épaules tout en ciblant les triceps.",
        caloriesPerSet: [10, 13],
        totalSets: 4,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Dumbbell Floor Press',
          muscleGroups: ['chest', 'triceps']
        }
      },
      {
        name: 'Z-press haltères',
        sets: '4 × 10',
        equip: 'Haltères 10 kg',
        desc: "Assis au sol jambes tendues, poussez les haltères au-dessus de la tête. Exige une grande stabilité du tronc et isole les épaules.",
        caloriesPerSet: [8, 10],
        totalSets: 4,
        nbRep: 10,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Z-Press',
          muscleGroups: ['shoulders']
        }
      },
      {
        name: 'Développé serré barre',
        sets: '3 × 12',
        equip: 'Barre 30 kg',
        desc: "Allongé sur banc, prise rapprochée, descendez la barre puis poussez. La prise serrée accentue le travail des triceps.",
        caloriesPerSet: [10, 13],
        totalSets: 3,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Close Grip Bench Press',
          muscleGroups: ['triceps', 'chest']
        }
      },
      {
        name: 'Élévations en Y',
        sets: '3 × 12',
        equip: 'Haltères 10 kg',
        desc: "Penché en avant, soulevez les bras en formant un Y. Renforce les épaules et améliore la stabilité de la coiffe des rotateurs.",
        caloriesPerSet: [6, 8],
        totalSets: 3,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Y-Raises',
          muscleGroups: ['shoulders']
        }
      },
      {
        name: 'Dips entre chaises',
        sets: '3 × 12',
        equip: 'Gilet lesté 10 kg',
        desc: "Mains sur deux chaises, descendez entre elles en fléchissant les coudes. Amplitude maximale pour les triceps et les pectoraux.",
        caloriesPerSet: [10, 12],
        totalSets: 3,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Weighted Chair Dips',
          muscleGroups: ['triceps', 'chest']
        }
      },
      {
        name: 'Extension triceps unilatéral',
        sets: '3 × 12/bras',
        equip: 'Haltère 10 kg',
        desc: "Un bras à la fois, haltère derrière la tête, tendez le bras vers le haut. Le travail unilatéral corrige les déséquilibres.",
        caloriesPerSet: [6, 8],
        totalSets: 6,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Single Arm Triceps Extension',
          muscleGroups: ['triceps']
        }
      },
      {
        name: 'Hollow body hold',
        sets: '3 × 30s',
        equip: 'Poids du corps',
        desc: "Allongé, bras et jambes tendus et légèrement décollés du sol, maintenez la position. Gainage intense pour les abdominaux profonds.",
        caloriesPerSet: [5, 7],
        totalSets: 3,
        nbRep: 30,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Hollow Body Hold',
          muscleGroups: ['abdominals']
        }
      },
    ],
  },
  {
    title: 'JOUR 16: HAUT DU CORPS (Dos, Biceps)',
    exercises: [
      {
        name: 'Rowing Yates',
        sets: '4 × 12',
        equip: 'Barre 30 kg',
        desc: "Penché à 45°, prise en supination, tirez la barre vers le ventre. Variante qui recrute davantage les biceps.",
        caloriesPerSet: [10, 13],
        totalSets: 4,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Yates Row',
          muscleGroups: ['back', 'biceps']
        }
      },
      {
        name: 'Tractions neutres',
        sets: '4 × 8',
        equip: 'Barre fixe',
        desc: "Paumes face à face, tirez le menton au-dessus de la barre. La prise neutre est la plus naturelle pour les articulations.",
        caloriesPerSet: [10, 13],
        totalSets: 4,
        nbRep: 8,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Neutral Grip Pull-Ups',
          muscleGroups: ['back', 'biceps']
        }
      },
      {
        name: 'Pullover haltère',
        sets: '3 × 12',
        equip: 'Haltère 15 kg',
        desc: "Allongé en travers d'un banc, descendez l'haltère derrière la tête puis ramenez-le au-dessus de la poitrine. Travaille le dos et les pectoraux.",
        caloriesPerSet: [8, 10],
        totalSets: 3,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Dumbbell Pullover',
          muscleGroups: ['back', 'chest']
        }
      },
      {
        name: 'Curl Zottman',
        sets: '3 × 12',
        equip: 'Haltères 10 kg',
        desc: "Curl en supination à la montée, tournez en pronation pour la descente. Travaille les biceps et les avant-bras en un seul mouvement.",
        caloriesPerSet: [6, 8],
        totalSets: 3,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Zottman Curl',
          muscleGroups: ['biceps', 'forearms']
        }
      },
      {
        name: 'Curl prise inversée',
        sets: '3 × 12',
        equip: 'Barre 30 kg',
        desc: "Debout, barre en prise pronation, réalisez un curl classique. Renforce les avant-bras et le brachial antérieur.",
        caloriesPerSet: [6, 8],
        totalSets: 3,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Reverse Grip Curl',
          muscleGroups: ['forearms', 'biceps']
        }
      },
      {
        name: 'Shrugs haltères',
        sets: '3 × 15',
        equip: 'Haltères 15 kg',
        desc: "Debout, haltères le long du corps, haussez les épaules vers les oreilles. Développe les trapèzes supérieurs.",
        caloriesPerSet: [6, 8],
        totalSets: 3,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Dumbbell Shrugs',
          muscleGroups: ['trapezius']
        }
      },
      {
        name: 'Gainage superman',
        sets: '3 × 15',
        equip: 'Poids du corps',
        desc: "Allongé sur le ventre, soulevez bras et jambes simultanément puis maintenez. Renforce le bas du dos et les érecteurs du rachis.",
        caloriesPerSet: [5, 7],
        totalSets: 3,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Superman',
          muscleGroups: ['lower_back', 'abdominals']
        }
      },
    ],
  },
  {
    title: 'JOUR 17: HAUT DU CORPS (Pectoraux, Épaules, Dos)',
    exercises: [
      {
        name: 'Pompes inclinées lestées',
        sets: '4 × 10',
        equip: 'Gilet lesté 10 kg',
        desc: "Pieds surélevés avec gilet lesté, réalisez des pompes. L'inclinaison cible le haut des pectoraux et les épaules.",
        caloriesPerSet: [10, 13],
        totalSets: 4,
        nbRep: 10,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Weighted Decline Push-Ups',
          muscleGroups: ['chest', 'shoulders', 'triceps']
        }
      },
      {
        name: 'Développé militaire haltères',
        sets: '3 × 12',
        equip: 'Haltères 15 kg',
        desc: "Assis ou debout, poussez les haltères au-dessus de la tête en gardant le core gainé. Développe les deltoïdes de manière équilibrée.",
        caloriesPerSet: [8, 10],
        totalSets: 3,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Dumbbell Military Press',
          muscleGroups: ['shoulders']
        }
      },
      {
        name: 'Rowing un bras haltère (lourd)',
        sets: '4 × 10',
        equip: 'Haltère 15 kg',
        desc: "Un genou et une main sur un banc, tirez l'haltère vers la hanche. Le travail unilatéral permet de charger davantage chaque côté.",
        caloriesPerSet: [10, 13],
        totalSets: 4,
        nbRep: 10,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Heavy Single Arm Dumbbell Row',
          muscleGroups: ['back', 'biceps']
        }
      },
      {
        name: 'Oiseau debout',
        sets: '3 × 15',
        equip: 'Haltères 10 kg',
        desc: "Penché en avant, bras pendants, écartez les haltères latéralement. Cible l'arrière des épaules et le haut du dos.",
        caloriesPerSet: [6, 8],
        totalSets: 3,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Standing Reverse Fly',
          muscleGroups: ['rear_deltoids', 'upper_back']
        }
      },
      {
        name: 'Curl concentré alterné',
        sets: '3 × 10/bras',
        equip: 'Haltère 10 kg',
        desc: "Assis, coude calé contre la cuisse, réalisez un curl strict. L'isolation maximale garantit un travail pur du biceps.",
        caloriesPerSet: [5, 7],
        totalSets: 6,
        nbRep: 10,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Alternating Concentration Curl',
          muscleGroups: ['biceps']
        }
      },
      {
        name: 'Barre au front prise serrée',
        sets: '3 × 15',
        equip: 'Barre 30 kg',
        desc: "Allongé, descendez la barre vers le front puis tendez les bras. Exercice classique d'isolation des triceps.",
        caloriesPerSet: [8, 10],
        totalSets: 3,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Close Grip Skull Crusher',
          muscleGroups: ['triceps']
        }
      },
      {
        name: 'Crunchs lestés',
        sets: '3 × 20',
        equip: 'Haltère 10 kg',
        desc: "Allongé, haltère contre la poitrine, réalisez des crunchs. La charge supplémentaire intensifie le travail des abdominaux.",
        caloriesPerSet: [6, 8],
        totalSets: 3,
        nbRep: 20,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Weighted Crunches',
          muscleGroups: ['abdominals']
        }
      },
    ],
  },
  {
    title: 'JOUR 18: BAS DU CORPS (Jambes, Fessiers)',
    exercises: [
      {
        name: 'Squat étroit',
        sets: '4 × 12',
        equip: 'Barre 30 kg',
        desc: "Pieds rapprochés, descendez en squat complet. La position étroite accentue le travail des quadriceps.",
        caloriesPerSet: [14, 18],
        totalSets: 4,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Narrow Squat',
          muscleGroups: ['quadriceps', 'glutes']
        }
      },
      {
        name: 'Soulevé de terre déficit',
        sets: '4 × 10',
        equip: 'Barre 30 kg',
        desc: "Debout sur une surface surélevée, soulevez la barre depuis un point plus bas. Augmente l'amplitude et l'activation musculaire.",
        caloriesPerSet: [14, 18],
        totalSets: 4,
        nbRep: 10,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Deficit Deadlift',
          muscleGroups: ['hamstrings', 'back', 'glutes']
        }
      },
      {
        name: 'Fentes latérales lestées',
        sets: '3 × 12/côté',
        equip: 'Haltères 15 kg',
        desc: "Faites un grand pas sur le côté avec haltères, fléchissez la jambe puis revenez. Travaille les adducteurs et les quadriceps.",
        caloriesPerSet: [12, 15],
        totalSets: 6,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Weighted Lateral Lunges',
          muscleGroups: ['adductors', 'quadriceps']
        }
      },
      {
        name: 'Hip thrust unilatéral',
        sets: '3 × 12/jambe',
        equip: 'Barre 30 kg',
        desc: "Dos contre un banc, un pied au sol, poussez les hanches vers le haut. Le travail unilatéral intensifie l'activation des fessiers.",
        caloriesPerSet: [10, 12],
        totalSets: 6,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Single Leg Hip Thrust',
          muscleGroups: ['glutes']
        }
      },
      {
        name: 'Mollets escalier',
        sets: '3 × 20',
        equip: 'Haltères 15 kg',
        desc: "Sur une marche d'escalier, descendez les talons sous le niveau de la marche puis remontez. L'amplitude maximale travaille les mollets en profondeur.",
        caloriesPerSet: [8, 10],
        totalSets: 3,
        nbRep: 20,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Stair Calf Raises',
          muscleGroups: ['calves']
        }
      },
      {
        name: 'Relevé de jambes suspendu',
        sets: '3 × 12',
        equip: 'Barre fixe',
        desc: "Suspendu à la barre, montez les jambes tendues devant vous. Exercice avancé pour les abdominaux inférieurs.",
        caloriesPerSet: [8, 10],
        totalSets: 3,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Hanging Leg Raise',
          muscleGroups: ['abdominals']
        }
      },
      {
        name: 'Hollow hold',
        sets: '3 × 30s',
        equip: 'Poids du corps',
        desc: "Allongé sur le dos, bras et jambes tendus décollés du sol, maintenez la position. Gainage intense pour le transverse.",
        caloriesPerSet: [5, 7],
        totalSets: 3,
        nbRep: 30,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Hollow Hold',
          muscleGroups: ['abdominals']
        }
      },
    ],
  },
  {
    title: 'JOUR 19: BAS DU CORPS (Quadriceps, Fessiers)',
    exercises: [
      {
        name: 'Squat sauté',
        sets: '4 × 12',
        equip: 'Poids du corps',
        desc: "Descendez en squat puis explosez vers le haut en sautant. Développe la puissance et brûle un maximum de calories.",
        caloriesPerSet: [12, 15],
        totalSets: 4,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Jump Squat',
          muscleGroups: ['quadriceps', 'glutes', 'calves']
        }
      },
      {
        name: 'Soulevé de terre roumain haltères',
        sets: '4 × 12',
        equip: 'Haltères 15 kg',
        desc: "Debout, haltères devant les cuisses, penchez le buste en gardant les jambes légèrement fléchies. Étire et renforce les ischio-jambiers.",
        caloriesPerSet: [10, 13],
        totalSets: 4,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Dumbbell Romanian Deadlift',
          muscleGroups: ['hamstrings', 'lower_back']
        }
      },
      {
        name: 'Fentes marchées lourdes',
        sets: '3 × 10/jambe',
        equip: 'Haltères 15 kg',
        desc: "Avancez en fentes successives avec des haltères lourds. Exercice fonctionnel complet pour les quadriceps et les fessiers.",
        caloriesPerSet: [12, 15],
        totalSets: 6,
        nbRep: 10,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Heavy Walking Lunges',
          muscleGroups: ['quadriceps', 'glutes']
        }
      },
      {
        name: 'Squat isométrique mur',
        sets: '3 × 45s',
        equip: 'Poids du corps',
        desc: "Dos contre un mur, cuisses parallèles au sol, maintenez la position. La contraction isométrique brûle intensément les quadriceps.",
        caloriesPerSet: [8, 10],
        totalSets: 3,
        nbRep: 45,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Wall Sit',
          muscleGroups: ['quadriceps']
        }
      },
      {
        name: 'Extension de hanche au sol',
        sets: '3 × 15/jambe',
        equip: 'Poids du corps',
        desc: "À quatre pattes, poussez une jambe tendue vers l'arrière et le haut. Isole les fessiers et les ischio-jambiers.",
        caloriesPerSet: [5, 7],
        totalSets: 6,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Hip Extension',
          muscleGroups: ['glutes', 'hamstrings']
        }
      },
      {
        name: 'Bicycle crunch lesté',
        sets: '3 × 20',
        equip: 'Haltère 10 kg',
        desc: "Allongé, haltère contre la poitrine, amenez le coude vers le genou opposé en alternant. Version intensifiée du bicycle crunch.",
        caloriesPerSet: [8, 10],
        totalSets: 3,
        nbRep: 20,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Weighted Bicycle Crunch',
          muscleGroups: ['abdominals', 'obliques']
        }
      },
      {
        name: 'Planche dynamique',
        sets: '3 × 12',
        equip: 'Poids du corps',
        desc: "En position de planche, passez des avant-bras aux mains tendues en alternant. Ajoute un élément dynamique au gainage classique.",
        caloriesPerSet: [6, 8],
        totalSets: 3,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Dynamic Plank',
          muscleGroups: ['abdominals']
        }
      },
    ],
  },
  {
    title: 'JOUR 20: BAS DU CORPS (Jambes, Adducteurs)',
    exercises: [
      {
        name: 'Squat cosaques',
        sets: '4 × 10/côté',
        equip: 'Poids du corps',
        desc: "Jambes très écartées, fléchissez une jambe en gardant l'autre tendue. Excellent pour la mobilité et les adducteurs.",
        caloriesPerSet: [10, 13],
        totalSets: 8,
        nbRep: 10,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Cossack Squat',
          muscleGroups: ['adductors', 'quadriceps', 'glutes']
        }
      },
      {
        name: 'Soulevé de terre sumo haltères',
        sets: '4 × 12',
        equip: 'Haltères 15 kg',
        desc: "Pieds très écartés, haltères entre les jambes, soulevez en gardant le dos droit. Cible les adducteurs et le dos.",
        caloriesPerSet: [12, 15],
        totalSets: 4,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Dumbbell Sumo Deadlift',
          muscleGroups: ['legs', 'back', 'adductors']
        }
      },
      {
        name: 'Fentes pendulaires',
        sets: '3 × 10/jambe',
        equip: 'Haltères 10 kg',
        desc: "Alternez fente avant et fente arrière sans reposer le pied au milieu. Le mouvement de balancier intensifie le travail des jambes.",
        caloriesPerSet: [10, 12],
        totalSets: 6,
        nbRep: 10,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Pendulum Lunges',
          muscleGroups: ['quadriceps', 'glutes']
        }
      },
      {
        name: 'Adducteur debout',
        sets: '3 × 15/jambe',
        equip: 'Poids du corps',
        desc: "Debout, ramenez la jambe vers l'intérieur contre une résistance. Renforce les adducteurs en position fonctionnelle.",
        caloriesPerSet: [4, 6],
        totalSets: 6,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Standing Adductor',
          muscleGroups: ['adductors']
        }
      },
      {
        name: 'Mollets pliométriques',
        sets: '3 × 15',
        equip: 'Poids du corps',
        desc: "Enchaînez des sauts sur la pointe des pieds rapidement. Le travail pliométrique développe la puissance et la réactivité des mollets.",
        caloriesPerSet: [8, 10],
        totalSets: 3,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Plyometric Calf Raises',
          muscleGroups: ['calves']
        }
      },
      {
        name: 'Gainage latéral dynamique',
        sets: '3 × 12/côté',
        equip: 'Poids du corps',
        desc: "En position de gainage latéral, descendez la hanche vers le sol puis remontez. Ajoute un mouvement dynamique pour les obliques.",
        caloriesPerSet: [6, 8],
        totalSets: 6,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Dynamic Side Plank',
          muscleGroups: ['obliques', 'abdominals']
        }
      },
      {
        name: 'V-ups',
        sets: '3 × 15',
        equip: 'Poids du corps',
        desc: "Allongé, montez simultanément le buste et les jambes tendues pour toucher les pieds. Exercice complet pour les abdominaux.",
        caloriesPerSet: [6, 8],
        totalSets: 3,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'V-Ups',
          muscleGroups: ['abdominals']
        }
      },
    ],
  },
  {
    title: 'JOUR 21: REPOS',
    isRestDay: true,
    exercises: [],
  },
  {
    title: 'JOUR 22: HAUT DU CORPS (Pectoraux, Épaules, Triceps)',
    exercises: [
      {
        name: 'Développé couché pause',
        sets: '4 × 10',
        equip: 'Barre 30 kg',
        desc: "Allongé sur banc, descendez la barre, marquez une pause de 2 secondes sur la poitrine puis poussez. Élimine l'élan pour un travail pur.",
        caloriesPerSet: [12, 15],
        totalSets: 4,
        nbRep: 10,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Pause Bench Press',
          muscleGroups: ['chest', 'triceps', 'shoulders']
        }
      },
      {
        name: 'Push press barre',
        sets: '4 × 10',
        equip: 'Barre 30 kg',
        desc: "Debout, utilisez l'élan des jambes pour pousser la barre au-dessus de la tête. Mouvement de force-puissance pour les épaules.",
        caloriesPerSet: [12, 15],
        totalSets: 4,
        nbRep: 10,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Barbell Push Press',
          muscleGroups: ['shoulders', 'triceps']
        }
      },
      {
        name: 'Pompes déclinées lestées',
        sets: '3 × 12',
        equip: 'Gilet lesté 10 kg',
        desc: "Pieds surélevés avec gilet lesté, réalisez des pompes. Intensifie le travail du haut des pectoraux et des épaules.",
        caloriesPerSet: [10, 12],
        totalSets: 3,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Weighted Decline Push-Ups',
          muscleGroups: ['chest', 'shoulders', 'triceps']
        }
      },
      {
        name: 'Élévations latérales penchées',
        sets: '3 × 12',
        equip: 'Haltères 10 kg',
        desc: "Penché en avant à 45°, soulevez les haltères latéralement. Cible le deltoïde postérieur et le moyen.",
        caloriesPerSet: [6, 8],
        totalSets: 3,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Bent-Over Lateral Raises',
          muscleGroups: ['shoulders']
        }
      },
      {
        name: 'Dips profonds',
        sets: '3 × 10',
        equip: 'Gilet lesté 10 kg',
        desc: "Descendez le plus bas possible entre deux supports avec le gilet lesté. L'amplitude maximale intensifie le travail des pectoraux et des triceps.",
        caloriesPerSet: [10, 13],
        totalSets: 3,
        nbRep: 10,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Deep Weighted Dips',
          muscleGroups: ['chest', 'triceps']
        }
      },
      {
        name: 'Extension triceps overhead barre',
        sets: '3 × 12',
        equip: 'Barre 30 kg',
        desc: "Debout, barre tenue au-dessus de la tête, pliez les coudes puis tendez les bras. Étirement complet des triceps sous charge.",
        caloriesPerSet: [8, 10],
        totalSets: 3,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Overhead Barbell Triceps Extension',
          muscleGroups: ['triceps']
        }
      },
      {
        name: 'Planche bras tendus',
        sets: '3 × 45s',
        equip: 'Poids du corps',
        desc: "En position haute de pompe, maintenez le corps aligné bras tendus. Variante de gainage qui sollicite aussi les épaules.",
        caloriesPerSet: [5, 7],
        totalSets: 3,
        nbRep: 45,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Straight Arm Plank',
          muscleGroups: ['abdominals']
        }
      },
    ],
  },
  {
    title: 'JOUR 23: HAUT DU CORPS (Dos, Biceps)',
    exercises: [
      {
        name: 'Rowing meadows',
        sets: '4 × 10/côté',
        equip: 'Barre 30 kg',
        desc: "Un bras tire l'extrémité de la barre vers la hanche. Variante unilatérale puissante pour le grand dorsal.",
        caloriesPerSet: [10, 13],
        totalSets: 8,
        nbRep: 10,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Meadows Row',
          muscleGroups: ['back', 'biceps']
        }
      },
      {
        name: 'Tractions larges',
        sets: '4 × 8',
        equip: 'Barre fixe',
        desc: "Prise très large en pronation, tirez le menton au-dessus de la barre. Développe la largeur du dos.",
        caloriesPerSet: [10, 13],
        totalSets: 4,
        nbRep: 8,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Wide Grip Pull-Ups',
          muscleGroups: ['back', 'biceps']
        }
      },
      {
        name: 'Rowing renegade',
        sets: '3 × 10',
        equip: 'Haltères 10 kg',
        desc: "En position de pompe sur les haltères, tirez alternativement un haltère vers la hanche. Combine gainage et rowing.",
        caloriesPerSet: [10, 12],
        totalSets: 3,
        nbRep: 10,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Renegade Row',
          muscleGroups: ['back', 'abdominals']
        }
      },
      {
        name: 'Curl 21s barre',
        sets: '3 × 21',
        equip: 'Barre 30 kg',
        desc: "7 répétitions en demi-basse, 7 en demi-haute, 7 complètes. Technique d'intensification redoutable pour les biceps.",
        caloriesPerSet: [8, 10],
        totalSets: 3,
        nbRep: 21,
        googleFitActivity: {
          type: 'strength_training',
          name: '21s Barbell Curl',
          muscleGroups: ['biceps']
        }
      },
      {
        name: 'Curl marteau croisé',
        sets: '3 × 12',
        equip: 'Haltères 10 kg',
        desc: "Debout, réalisez un curl marteau en croisant l'haltère devant le corps. Cible le brachial et les avant-bras.",
        caloriesPerSet: [6, 8],
        totalSets: 3,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Cross Body Hammer Curl',
          muscleGroups: ['biceps', 'forearms']
        }
      },
      {
        name: 'Shrugs unilatéral',
        sets: '3 × 15/côté',
        equip: 'Haltère 15 kg',
        desc: "Un haltère à la fois, haussez l'épaule vers l'oreille. Le travail unilatéral permet de corriger les déséquilibres des trapèzes.",
        caloriesPerSet: [6, 8],
        totalSets: 6,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Single Arm Shrug',
          muscleGroups: ['trapezius']
        }
      },
      {
        name: 'Superman hold',
        sets: '3 × 30s',
        equip: 'Poids du corps',
        desc: "Allongé sur le ventre, bras et jambes tendus décollés du sol, maintenez la position. Renforce les érecteurs du rachis.",
        caloriesPerSet: [5, 7],
        totalSets: 3,
        nbRep: 30,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Superman Hold',
          muscleGroups: ['lower_back', 'abdominals']
        }
      },
    ],
  },
  {
    title: 'JOUR 24: HAUT DU CORPS (Pectoraux, Épaules, Dos)',
    exercises: [
      {
        name: 'Pompes archer',
        sets: '4 × 8/côté',
        equip: 'Poids du corps',
        desc: "En position de pompe large, fléchissez un bras en gardant l'autre tendu. Exercice avancé qui prépare aux pompes à un bras.",
        caloriesPerSet: [10, 12],
        totalSets: 8,
        nbRep: 8,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Archer Push-Ups',
          muscleGroups: ['chest', 'triceps']
        }
      },
      {
        name: 'Développé Arnold lourd',
        sets: '3 × 10',
        equip: 'Haltères 15 kg',
        desc: "Partez paumes vers vous, poussez en tournant les poignets pour finir paumes vers l'avant. Mouvement complet pour toutes les portions du deltoïde.",
        caloriesPerSet: [8, 10],
        totalSets: 3,
        nbRep: 10,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Heavy Arnold Press',
          muscleGroups: ['shoulders']
        }
      },
      {
        name: 'Soulevé de terre snatch grip',
        sets: '4 × 10',
        equip: 'Barre 30 kg',
        desc: "Soulevé de terre avec prise très large. L'écartement des mains augmente l'amplitude et le travail du haut du dos.",
        caloriesPerSet: [14, 18],
        totalSets: 4,
        nbRep: 10,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Snatch Grip Deadlift',
          muscleGroups: ['back', 'hamstrings']
        }
      },
      {
        name: 'Oiseau sur banc incliné',
        sets: '3 × 12',
        equip: 'Haltères 10 kg',
        desc: "Allongé face contre un banc incliné, écartez les bras latéralement. Le support élimine la triche et isole l'arrière des épaules.",
        caloriesPerSet: [6, 8],
        totalSets: 3,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Incline Bench Reverse Fly',
          muscleGroups: ['rear_deltoids', 'upper_back']
        }
      },
      {
        name: 'Curl spider',
        sets: '3 × 12',
        equip: 'Haltères 10 kg',
        desc: "Allongé face contre un banc incliné, réalisez des curls. La position empêche toute triche et isole parfaitement les biceps.",
        caloriesPerSet: [6, 8],
        totalSets: 3,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Spider Curl',
          muscleGroups: ['biceps']
        }
      },
      {
        name: 'Kickback triceps haltère',
        sets: '3 × 12',
        equip: 'Haltère 10 kg',
        desc: "Penché en avant, tendez l'avant-bras vers l'arrière en maintenant le coude fixe. Finition efficace pour les triceps.",
        caloriesPerSet: [6, 8],
        totalSets: 3,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Dumbbell Triceps Kickback',
          muscleGroups: ['triceps']
        }
      },
      {
        name: 'Crunchs jambes levées',
        sets: '3 × 20',
        equip: 'Poids du corps',
        desc: "Allongé, jambes levées à 90°, réalisez des crunchs. La position des jambes augmente la difficulté et l'activation des abdominaux.",
        caloriesPerSet: [5, 7],
        totalSets: 3,
        nbRep: 20,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Legs Up Crunches',
          muscleGroups: ['abdominals']
        }
      },
    ],
  },
  {
    title: 'JOUR 25: BAS DU CORPS (Jambes, Fessiers)',
    exercises: [
      {
        name: 'Squat tempo 3-1-3',
        sets: '4 × 10',
        equip: 'Barre 30 kg',
        desc: "3 secondes pour descendre, 1 seconde de pause, 3 secondes pour remonter. Le tempo lent maximise le temps sous tension.",
        caloriesPerSet: [14, 18],
        totalSets: 4,
        nbRep: 10,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Tempo Squat',
          muscleGroups: ['quadriceps', 'glutes', 'hamstrings']
        }
      },
      {
        name: 'Soulevé de terre conventionnel lourd',
        sets: '4 × 8',
        equip: 'Barre 30 kg',
        desc: "Pieds largeur des épaules, soulevez la barre avec moins de répétitions pour plus d'intensité. Mouvement fondamental de force pure.",
        caloriesPerSet: [14, 18],
        totalSets: 4,
        nbRep: 8,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Heavy Conventional Deadlift',
          muscleGroups: ['back', 'hamstrings', 'glutes']
        }
      },
      {
        name: 'Fentes avant avec pause',
        sets: '3 × 10/jambe',
        equip: 'Haltères 15 kg',
        desc: "Faites un pas en avant, descendez en fente et marquez une pause en bas. La pause élimine l'élan et intensifie le travail.",
        caloriesPerSet: [12, 15],
        totalSets: 6,
        nbRep: 10,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Pause Forward Lunges',
          muscleGroups: ['quadriceps', 'glutes']
        }
      },
      {
        name: 'Hip thrust pause',
        sets: '3 × 12',
        equip: 'Barre 30 kg',
        desc: "Dos contre un banc, poussez les hanches vers le haut et marquez une pause de 2 secondes en haut. Activation maximale des fessiers.",
        caloriesPerSet: [10, 12],
        totalSets: 3,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Pause Hip Thrust',
          muscleGroups: ['glutes']
        }
      },
      {
        name: 'Mollets charge lourde',
        sets: '3 × 15',
        equip: 'Barre 30 kg',
        desc: "Barre sur les épaules, montez sur la pointe des pieds puis redescendez lentement. La charge lourde développe la masse des mollets.",
        caloriesPerSet: [8, 10],
        totalSets: 3,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Heavy Calf Raises',
          muscleGroups: ['calves']
        }
      },
      {
        name: 'Relevé de jambes lesté',
        sets: '3 × 12',
        equip: 'Poids du corps (lestage chevilles)',
        desc: "Allongé, montez les jambes tendues vers le plafond avec un lestage aux chevilles. Intensifie le travail des abdominaux inférieurs.",
        caloriesPerSet: [6, 8],
        totalSets: 3,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Weighted Leg Raise',
          muscleGroups: ['abdominals']
        }
      },
      {
        name: 'Dragon flag assisté',
        sets: '3 × 8',
        equip: 'Poids du corps',
        desc: "Allongé sur un banc, agrippez le bord et soulevez le corps en un bloc rigide. Exercice avancé pour les abdominaux profonds.",
        caloriesPerSet: [8, 10],
        totalSets: 3,
        nbRep: 8,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Assisted Dragon Flag',
          muscleGroups: ['abdominals']
        }
      },
    ],
  },
  {
    title: 'JOUR 26: BAS DU CORPS (Quadriceps, Fessiers)',
    exercises: [
      {
        name: 'Squat sauté lesté',
        sets: '4 × 10',
        equip: 'Gilet lesté 10 kg',
        desc: "Descendez en squat puis explosez vers le haut avec le gilet lesté. Développe la puissance explosive des jambes.",
        caloriesPerSet: [14, 18],
        totalSets: 4,
        nbRep: 10,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Weighted Jump Squat',
          muscleGroups: ['quadriceps', 'glutes', 'calves']
        }
      },
      {
        name: 'Good morning haltères',
        sets: '4 × 12',
        equip: 'Haltères 15 kg',
        desc: "Haltères sur les épaules, penchez le buste vers l'avant en gardant le dos droit. Variante avec haltères pour les ischio-jambiers.",
        caloriesPerSet: [10, 13],
        totalSets: 4,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Dumbbell Good Morning',
          muscleGroups: ['hamstrings', 'lower_back']
        }
      },
      {
        name: 'Fentes bulgares lourdes',
        sets: '3 × 10/jambe',
        equip: 'Haltères 15 kg',
        desc: "Pied arrière surélevé, descendez en fente avec des haltères lourds. Version intensifiée pour les quadriceps et les fessiers.",
        caloriesPerSet: [12, 15],
        totalSets: 6,
        nbRep: 10,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Heavy Bulgarian Split Squat',
          muscleGroups: ['quadriceps', 'glutes']
        }
      },
      {
        name: 'Pistol squat assisté',
        sets: '3 × 8/jambe',
        equip: 'Poids du corps',
        desc: "Sur un pied, descendez en squat complet avec un support pour l'équilibre. Développe la force unilatérale maximale.",
        caloriesPerSet: [10, 12],
        totalSets: 6,
        nbRep: 8,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Assisted Pistol Squat',
          muscleGroups: ['quadriceps', 'glutes']
        }
      },
      {
        name: 'Box step-up lourd',
        sets: '3 × 10/jambe',
        equip: 'Haltères 15 kg',
        desc: "Montez sur une surface surélevée un pied à la fois avec des haltères lourds. Exercice fonctionnel pour les quadriceps et les fessiers.",
        caloriesPerSet: [10, 13],
        totalSets: 6,
        nbRep: 10,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Heavy Box Step-Up',
          muscleGroups: ['quadriceps', 'glutes']
        }
      },
      {
        name: 'Planche abdominale lestée',
        sets: '3 × 45s',
        equip: 'Gilet lesté 10 kg',
        desc: "En appui sur les avant-bras avec le gilet lesté, maintenez le corps aligné. La charge augmente l'intensité du gainage.",
        caloriesPerSet: [6, 8],
        totalSets: 3,
        nbRep: 45,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Weighted Plank',
          muscleGroups: ['abdominals']
        }
      },
      {
        name: 'Dead bug lesté',
        sets: '3 × 12',
        equip: 'Haltère 10 kg',
        desc: "Allongé sur le dos, haltère tenu au-dessus de la poitrine, étendez alternativement bras et jambe opposés. Version intensifiée du dead bug.",
        caloriesPerSet: [6, 8],
        totalSets: 3,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Weighted Dead Bug',
          muscleGroups: ['abdominals']
        }
      },
    ],
  },
  {
    title: 'JOUR 27: BAS DU CORPS (Jambes, Adducteurs)',
    exercises: [
      {
        name: 'Sumo squat pulse',
        sets: '4 × 15',
        equip: 'Barre 30 kg',
        desc: "En position sumo, réalisez de petites pulsations en bas du mouvement. Les pulsations augmentent le temps sous tension des adducteurs.",
        caloriesPerSet: [14, 18],
        totalSets: 4,
        nbRep: 15,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Sumo Squat Pulse',
          muscleGroups: ['quadriceps', 'glutes', 'adductors']
        }
      },
      {
        name: 'Soulevé de terre roumain unilatéral',
        sets: '4 × 10/jambe',
        equip: 'Haltère 15 kg',
        desc: "Sur un pied, penchez le buste vers l'avant avec un haltère. Développe l'équilibre et cible les ischio-jambiers et les fessiers.",
        caloriesPerSet: [10, 13],
        totalSets: 8,
        nbRep: 10,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Single Leg Romanian Deadlift',
          muscleGroups: ['hamstrings', 'glutes']
        }
      },
      {
        name: 'Squat cosaque profond',
        sets: '3 × 10/côté',
        equip: 'Poids du corps',
        desc: "Descendez le plus bas possible d'un côté en gardant l'autre jambe tendue. Améliore la mobilité et la force des adducteurs.",
        caloriesPerSet: [10, 12],
        totalSets: 6,
        nbRep: 10,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Deep Cossack Squat',
          muscleGroups: ['adductors', 'quadriceps']
        }
      },
      {
        name: 'Fentes latérales glissées',
        sets: '3 × 12/côté',
        equip: 'Poids du corps',
        desc: "Glissez un pied sur le côté en fléchissant l'autre jambe. Le mouvement de glisse intensifie le travail des adducteurs.",
        caloriesPerSet: [8, 10],
        totalSets: 6,
        nbRep: 12,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Sliding Lateral Lunges',
          muscleGroups: ['adductors', 'quadriceps']
        }
      },
      {
        name: 'Mollets assis lourd',
        sets: '3 × 20',
        equip: 'Barre 30 kg',
        desc: "Assis, barre sur les genoux, montez sur la pointe des pieds. La charge lourde en position assise cible le soléaire.",
        caloriesPerSet: [8, 10],
        totalSets: 3,
        nbRep: 20,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Heavy Seated Calf Raises',
          muscleGroups: ['calves']
        }
      },
      {
        name: 'Mountain climbers lestés',
        sets: '3 × 20',
        equip: 'Gilet lesté 10 kg',
        desc: "En position de pompe avec gilet lesté, amenez les genoux vers la poitrine rapidement. Version intensifiée du mountain climber.",
        caloriesPerSet: [10, 12],
        totalSets: 3,
        nbRep: 20,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Weighted Mountain Climbers',
          muscleGroups: ['abdominals']
        }
      },
      {
        name: 'Crunchs complets',
        sets: '3 × 25',
        equip: 'Poids du corps',
        desc: "Allongé, remontez le buste entièrement vers les genoux en contractant les abdominaux. Finition complète pour la sangle abdominale.",
        caloriesPerSet: [5, 7],
        totalSets: 3,
        nbRep: 25,
        googleFitActivity: {
          type: 'strength_training',
          name: 'Full Crunches',
          muscleGroups: ['abdominals']
        }
      },
    ],
  },
  {
    title: 'JOUR 28: REPOS',
    isRestDay: true,
    exercises: [],
  },
];

export const days = fullPlan;
