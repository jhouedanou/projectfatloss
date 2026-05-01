import '../models/workout_model.dart';

/// Données d'entraînement par défaut basées sur la PWA
class DefaultWorkoutData {
  static WorkoutPlan get defaultWorkoutPlan {
    return WorkoutPlan(
      days: [
        _createDay1(),
        _createDay2(),
        _createDay3(),
        _createDay4(),
        _createDay5(),
        _createDay6(),
        _createDay7(),
      ],
    );
  }

  static WorkoutDay _createDay1() {
    return WorkoutDay(
      title: 'JOUR 1: PUSH (Pectoraux, Épaules, Triceps)',
      exercises: [
        Exercise(
          name: 'Développé haltères',
          sets: '4 × 12-15',
          equip: 'Haltères 15 kg',
          desc:
              "Position assise ou allongée, poussez les haltères vers le haut en alignant les coudes avec les épaules. Travaille les pectoraux, épaules et triceps.",
          caloriesPerSet: [10, 12],
          totalSets: 4,
          nbRep: 12,
        ),
        Exercise(
          name: 'Élévations latérales',
          sets: '4 × 12',
          equip: 'Haltères 10 kg',
          desc:
              "Debout, bras le long du corps, soulevez les haltères latéralement jusqu'à hauteur d'épaules. Cible le deltoïde moyen.",
          caloriesPerSet: [6, 8],
          totalSets: 4,
          nbRep: 12,
        ),
        Exercise(
          name: 'Développé incliné haltères',
          sets: '3 × 12',
          equip: 'Haltères 15 kg',
          desc:
              "Sur banc incliné (30-45°), poussez les haltères vers le haut. Accentue le travail du haut des pectoraux.",
          caloriesPerSet: [8, 10],
          totalSets: 3,
          nbRep: 12,
        ),
        Exercise(
          name: 'Élévations frontales',
          sets: '3 × 12',
          equip: 'Haltères 10 kg',
          desc:
              "Debout, bras devant vous, soulevez les haltères jusqu'à hauteur d'épaules. Cible le deltoïde antérieur.",
          caloriesPerSet: [6, 8],
          totalSets: 3,
          nbRep: 12,
        ),
        Exercise(
          name: 'Crunchs',
          sets: '4 × 20',
          equip: 'Poids du corps',
          desc:
              "Allongé sur le dos, genoux fléchis, contractez les abdominaux pour décoller les épaules du sol. Exercice de finition abdominal.",
          caloriesPerSet: [6, 8],
          totalSets: 4,
          nbRep: 20,
        ),
    
      ],
    );
  }

  static WorkoutDay _createDay2() {
    return WorkoutDay(
      title: 'JOUR 2: PULL (Dos, Biceps)',
      exercises: [
        Exercise(
          name: 'Rowing haltères un bras',
          sets: '4 × 12',
          equip: 'Haltère 15 kg',
          desc:
              "Un genou et une main sur un banc, tirez l'haltère vers la hanche en gardant le coude près du corps. Isole un côté du dos à la fois.",
          caloriesPerSet: [8, 10],
          totalSets: 4,
          nbRep: 12,
        ),
        Exercise(
          name: 'Rowing barre',
          sets: '4 × 10-12',
          equip: 'Barre 30 kg',
          desc:
              "Penché en avant, dos droit, tirez la barre vers le ventre puis redescendez. Travaille l'ensemble du dos.",
          caloriesPerSet: [10, 13],
          totalSets: 4,
          nbRep: 10,
        ),
        Exercise(
          name: 'Rowing haltères deux bras',
          sets: '3 × 12',
          equip: 'Haltères 10 kg',
          desc:
              "Penché en avant, tirez les haltères vers les hanches puis redescendez. Alternative au rowing barre.",
          caloriesPerSet: [8, 10],
          totalSets: 3,
          nbRep: 12,
        ),
        Exercise(
          name: 'Curl biceps haltères',
          sets: '3 × 12',
          equip: 'Haltères 15 kg',
          desc:
              "Debout, pliez les coudes pour ramener les haltères vers les épaules. Cible les biceps.",
          caloriesPerSet: [6, 8],
          totalSets: 3,
          nbRep: 12,
        ),
        Exercise(
          name: 'Crunchs',
          sets: '4 × 20',
          equip: 'Poids du corps',
          desc:
              "Allongé sur le dos, genoux fléchis, contractez les abdominaux pour décoller les épaules du sol. Exercice de finition abdominal.",
          caloriesPerSet: [6, 8],
          totalSets: 4,
          nbRep: 20,
        ),
    
      ],
    );
  }

  static WorkoutDay _createDay3() {
    return WorkoutDay(
      title: 'JOUR 3: LEGS (Jambes, Fessiers)',
      exercises: [
        Exercise(
          name: 'Squats',
          sets: '4 × 15',
          equip: 'Barre 30 kg',
          desc:
              "Debout, pieds écartés largeur d'épaules, barre sur les épaules, descendez comme pour s'asseoir puis remontez. Travaille quadriceps, ischio-jambiers et fessiers.",
          caloriesPerSet: [12, 15],
          totalSets: 4,
          nbRep: 15,
        ),
        Exercise(
          name: 'Fentes avant alternées',
          sets: '4 × 12/jambe',
          equip: 'Haltères 15 kg',
          desc:
              "Un pas en avant, haltères en main, fléchissez les genoux pour descendre, puis remontez. Cible quadriceps, fessiers et équilibre.",
          caloriesPerSet: [14, 18],
          totalSets: 8,
          nbRep: 12,
        ),
        Exercise(
          name: 'Soulevé de terre roumain',
          sets: '3 × 12',
          equip: 'Barre 30 kg',
          desc:
              "Debout, jambes légèrement fléchies, penchez le buste en avant en gardant le dos droit. Cible les ischio-jambiers et les lombaires.",
          caloriesPerSet: [10, 13],
          totalSets: 3,
          nbRep: 12,
        ),
        Exercise(
          name: 'Hip thrust',
          sets: '3 × 15',
          equip: 'Barre 30 kg',
          desc:
              "Épaules sur un banc/canapé, barre sur les hanches, soulevez le bassin. Maximise le travail des fessiers.",
          caloriesPerSet: [12, 15],
          totalSets: 3,
          nbRep: 15,
        ),
        Exercise(
          name: 'Crunchs',
          sets: '4 × 20',
          equip: 'Poids du corps',
          desc:
              "Allongé sur le dos, genoux fléchis, contractez les abdominaux pour décoller les épaules du sol. Exercice de finition abdominal.",
          caloriesPerSet: [6, 8],
          totalSets: 4,
          nbRep: 20,
        ),
    
      ],
    );
  }

  static WorkoutDay _createDay4() {
    return WorkoutDay(
      title: 'JOUR 4: PUSH (Variation)',
      exercises: [
        Exercise(
          name: 'Pompes',
          sets: '4 × 10',
          equip: 'Poids du corps',
          desc:
              "En appui sur mains et pieds, fléchissez les coudes puis poussez. Différentes positions des mains ciblent différentes parties des pectoraux.",
          caloriesPerSet: [10, 12],
          totalSets: 4,
          nbRep: 10,
        ),
        Exercise(
          name: 'Développé Arnold',
          sets: '4 × 12',
          equip: 'Haltères 10 kg',
          desc:
              "Assis, partez haltères devant vous, paumes face à vous, puis tournez les poignets en poussant vers le haut. Travaille tous les faisceaux des deltoïdes.",
          caloriesPerSet: [8, 10],
          totalSets: 4,
          nbRep: 12,
        ),
        Exercise(
          name: 'Écartés haltères',
          sets: '3 × 15',
          equip: 'Haltères 10 kg',
          desc:
              "Allongé, bras ouverts sur les côtés, rapprochez les haltères au-dessus de la poitrine. Étire et contracte les pectoraux.",
          caloriesPerSet: [6, 8],
          totalSets: 3,
          nbRep: 15,
        ),
        Exercise(
          name: 'Élévations latérales inclinées',
          sets: '3 × 12',
          equip: 'Haltères 10 kg',
          desc:
              "Penché en avant, effectuez des élévations latérales. Cible le deltoïde postérieur.",
          caloriesPerSet: [6, 8],
          totalSets: 3,
          nbRep: 12,
        ),
        Exercise(
          name: 'Crunchs',
          sets: '4 × 20',
          equip: 'Poids du corps',
          desc:
              "Allongé sur le dos, genoux fléchis, contractez les abdominaux pour décoller les épaules du sol. Exercice de finition abdominal.",
          caloriesPerSet: [6, 8],
          totalSets: 4,
          nbRep: 20,
        ),
    
      ],
    );
  }

  static WorkoutDay _createDay5() {
    return WorkoutDay(
      title: 'JOUR 5: PULL (Variation)',
      exercises: [
        Exercise(
          name: 'Soulevé de terre',
          sets: '4 × 10',
          equip: 'Barre 30 kg',
          desc:
              "Debout, pieds écartés, saisissez la barre au sol et soulevez-la en gardant le dos droit. Travaille tout le corps, particulièrement le dos et les jambes.",
          caloriesPerSet: [12, 15],
          totalSets: 4,
          nbRep: 10,
        ),
        Exercise(
          name: 'Pull-over avec haltère',
          sets: '3 × 15',
          equip: 'Haltère 15 kg',
          desc:
              "Allongé, bras tendus au-dessus de la poitrine, amenez l'haltère derrière la tête puis remontez. Étire le grand dorsal et les pectoraux.",
          caloriesPerSet: [8, 10],
          totalSets: 3,
          nbRep: 15,
        ),
        Exercise(
          name: 'Good morning',
          sets: '3 × 15',
          equip: 'Barre 30 kg',
          desc:
              "Barre sur les épaules, penchez le buste en avant en gardant le dos droit. Alternative au face pull, travaille les trapèzes et le dos.",
          caloriesPerSet: [10, 13],
          totalSets: 3,
          nbRep: 15,
        ),
        Exercise(
          name: 'Curl concentré',
          sets: '3 × 12',
          equip: 'Haltère 15 kg',
          desc:
              "Assis, coude calé contre la cuisse, fléchissez le bras. Maximise l'isolation du biceps.",
          caloriesPerSet: [6, 8],
          totalSets: 3,
          nbRep: 12,
        ),
        Exercise(
          name: 'Crunchs',
          sets: '4 × 20',
          equip: 'Poids du corps',
          desc:
              "Allongé sur le dos, genoux fléchis, contractez les abdominaux pour décoller les épaules du sol. Exercice de finition abdominal.",
          caloriesPerSet: [6, 8],
          totalSets: 4,
          nbRep: 20,
        ),
    
      ],
    );
  }

  static WorkoutDay _createDay6() {
    return WorkoutDay(
      title: 'JOUR 6: LEGS (Variation)',
      exercises: [
        Exercise(
          name: 'Squats sumo',
          sets: '4 × 15',
          equip: 'Barre 30 kg',
          desc:
              "Pieds très écartés, pointes vers l'extérieur, descendez puis remontez. Accentue le travail des adducteurs et des fessiers.",
          caloriesPerSet: [14, 18],
          totalSets: 4,
          nbRep: 15,
        ),
        Exercise(
          name: 'Fentes latérales',
          sets: '3 × 12/côté',
          equip: 'Haltères 15 kg',
          desc:
              "Écartez une jambe sur le côté, fléchissez puis revenez. Cible particulièrement les adducteurs.",
          caloriesPerSet: [12, 15],
          totalSets: 6,
          nbRep: 12,
        ),
        Exercise(
          name: 'Pont fessier',
          sets: '4 × 15',
          equip: 'Barre 30 kg',
          desc:
              "Allongé, pieds au sol, barre sur les hanches, soulevez le bassin. Isolation des fessiers.",
          caloriesPerSet: [12, 15],
          totalSets: 4,
          nbRep: 15,
        ),
        Exercise(
          name: 'Extensions de hanche',
          sets: '3 × 15/jambe',
          equip: 'Haltère 10 kg',
          desc:
              "À quatre pattes, étendez une jambe vers l'arrière et le haut. Cible les fessiers et les lombaires.",
          caloriesPerSet: [10, 12],
          totalSets: 6,
          nbRep: 15,
        ),
        Exercise(
          name: 'Crunchs',
          sets: '4 × 20',
          equip: 'Poids du corps',
          desc:
              "Allongé sur le dos, genoux fléchis, contractez les abdominaux pour décoller les épaules du sol. Exercice de finition abdominal.",
          caloriesPerSet: [6, 8],
          totalSets: 4,
          nbRep: 20,
        ),
    
      ],
    );
  }

  static WorkoutDay _createDay7() {
    return WorkoutDay(
      title: 'JOUR 7: CARDIO & RÉCUPÉRATION',
      exercises: [
        Exercise(
          name: 'Crunchs',
          sets: '4 × 20',
          equip: 'Poids du corps',
          desc:
              "Allongé sur le dos, genoux fléchis, contractez les abdominaux pour décoller les épaules du sol. Exercice de finition abdominal.",
          caloriesPerSet: [6, 8],
          totalSets: 4,
          nbRep: 20,
        ),
        Exercise(
          name: 'Cardio au choix',
          sets: '20-30 min',
          equip: 'Poids du corps',
          desc:
              "Activité complémentaire pour augmenter la dépense calorique hebdomadaire.",
          timer: true,
          duration: 1800,
          caloriesPerSet: [15, 20],
          totalSets: 1,
          nbRep: 0,
        ),
        Exercise(
          name: 'Étirements complets',
          sets: '15-20 min',
          equip: 'Aucun',
          desc:
              "Augmente la flexibilité, réduit les courbatures et prévient les blessures.",
          timer: true,
          duration: 900,
          caloriesPerSet: [4, 6],
          totalSets: 1,
          nbRep: 0,
        ),
        Exercise(
          name: 'Mobilité articulaire',
          sets: '10 min',
          equip: 'Aucun',
          desc: "Maintient l'amplitude de mouvements des articulations.",
          timer: true,
          duration: 600,
          caloriesPerSet: [2, 4],
          totalSets: 1,
          nbRep: 0,
        ),
    
      ],
    );
  }
}
