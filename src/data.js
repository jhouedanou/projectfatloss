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
];

const CALORIE_TARGET = 200;
const ALLOWED_EQUIPMENT = ['haltère', 'haltères', 'barre'];
const EXCLUDED_EQUIPMENT = ['gilet', 'poids du corps', 'fixe', 'optionnel', 'chevilles'];

const calculateExerciseCalories = (exercise) => {
  if (!exercise?.caloriesPerSet || !exercise?.totalSets) return 0;
  const average = (exercise.caloriesPerSet[0] + exercise.caloriesPerSet[1]) / 2;
  return average * exercise.totalSets;
};

const usesAllowedEquipment = (exercise) => {
  const equip = (exercise.equip || '').toLowerCase();
  const hasAllowed = ALLOWED_EQUIPMENT.some(term => equip.includes(term));
  const hasExcluded = EXCLUDED_EQUIPMENT.some(term => equip.includes(term));
  return hasAllowed && !hasExcluded;
};

const getAllowedExercises = (plan) => 
  plan.flatMap(day => 
    day.exercises
      .filter(usesAllowedEquipment)
      .map(exercise => ({
        exercise,
        calories: calculateExerciseCalories(exercise)
      }))
      .filter(item => item.calories > 0)
  );

let allowedExercisesCache = null;
const getCachedAllowedExercises = () => {
  if (!allowedExercisesCache) {
    allowedExercisesCache = getAllowedExercises(fullPlan);
  }
  return allowedExercisesCache;
};

const buildCalorieFocusedPlan = () => {
  const allowedList = getCachedAllowedExercises();
  const selectedExercises = [];
  let totalCalories = 0;

  for (const { exercise, calories } of allowedList) {
    if (totalCalories >= CALORIE_TARGET) break;
    
    selectedExercises.push(exercise);
    totalCalories += calories;
  }

  return [{
    title: 'Séance 200 kcal - Barre & haltères',
    exercises: selectedExercises
  }];
};

export const days = buildCalorieFocusedPlan();
