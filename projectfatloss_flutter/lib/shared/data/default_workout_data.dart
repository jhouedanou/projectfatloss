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
          name: 'Extensions triceps',
          sets: '3 × 15',
          equip: 'Haltère 15 kg (à deux mains)',
          desc:
              "Allongé ou assis, haltère tenu à deux mains au-dessus de la tête, pliez les coudes puis tendez les bras. Isole les triceps.",
          caloriesPerSet: [8, 10],
          totalSets: 3,
          nbRep: 15,
        ),
        Exercise(
          name: 'Dips lestés',
          sets: '3 × 10',
          equip: 'Gilet lesté 10 kg',
          desc:
              "Mains sur un banc/chaise, fléchissez les coudes pour descendre le corps puis remontez. Travaille triceps et pectoraux.",
          caloriesPerSet: [10, 12],
          totalSets: 3,
          nbRep: 10,
        ),
        Exercise(
          name: 'Crunchs lestés',
          sets: '3 × 25',
          equip: 'Haltère 10 kg',
          desc:
              "Allongé sur le dos, haltère sur la poitrine, soulevez les épaules du sol. Intensifie le travail abdominal.",
          caloriesPerSet: [6, 8],
          totalSets: 3,
          nbRep: 25,
        ),
        Exercise(
          name: 'Planche lestée',
          sets: '3 × 30-60 sec',
          equip: 'Gilet lesté 10 kg',
          desc:
              "En appui sur les avant-bras et les orteils, maintenez le corps droit. Renforce la ceinture abdominale.",
          timer: true,
          duration: 60,
          caloriesPerSet: [4, 6],
          totalSets: 3,
          nbRep: 0,
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
          name: 'Curl marteau',
          sets: '3 × 12',
          equip: 'Haltères 15 kg',
          desc:
              "Comme le curl biceps mais paumes face à face. Travaille biceps et avant-bras.",
          caloriesPerSet: [6, 8],
          totalSets: 3,
          nbRep: 12,
        ),
        Exercise(
          name: 'Shrugs',
          sets: '3 × 15',
          equip: 'Haltères 15 kg ou barre 30 kg',
          desc:
              "Debout, soulevez les épaules vers les oreilles sans plier les coudes. Isole les trapèzes.",
          caloriesPerSet: [5, 7],
          totalSets: 3,
          nbRep: 15,
        ),
        Exercise(
          name: 'Mountain climbers lestés',
          sets: '3 × 30 sec',
          equip: 'Gilet lesté 10 kg',
          desc:
              "En position de planche, ramenez alternativement les genoux vers la poitrine. Cardio et abdominaux.",
          timer: true,
          duration: 30,
          caloriesPerSet: [12, 15],
          totalSets: 3,
          nbRep: 0,
        ),
        Exercise(
          name: 'Russian twists',
          sets: '3 × 20',
          equip: 'Haltère 10 kg',
          desc:
              "Assis, pieds décollés, tournez le torse alternativement de chaque côté. Cible les obliques.",
          caloriesPerSet: [8, 10],
          totalSets: 3,
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
          name: 'Step-ups',
          sets: '3 × 15/jambe',
          equip: 'Haltères 10 kg',
          desc:
              "Montez sur une marche/banc avec un pied, puis l'autre. Alternative aux extensions de jambes.",
          caloriesPerSet: [10, 12],
          totalSets: 6,
          nbRep: 15,
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
          name: 'Mollets debout',
          sets: '4 × 20',
          equip: 'Haltères 15 kg',
          desc:
              "Debout sur une marche/livre, montez sur la pointe des pieds puis redescendez. Cible les mollets.",
          caloriesPerSet: [8, 10],
          totalSets: 4,
          nbRep: 20,
        ),
        Exercise(
          name: 'Crunchs inversés lestés',
          sets: '3 × 15',
          equip: 'Gilet lesté 10 kg',
          desc:
              "Allongé, soulevez les jambes et le bassin vers le haut. Travaille le bas des abdominaux.",
          caloriesPerSet: [8, 10],
          totalSets: 3,
          nbRep: 15,
        ),
        Exercise(
          name: 'Relevé de jambes',
          sets: '3 × 15',
          equip: 'Lestage aux chevilles (optionnel)',
          desc:
              "Allongé, soulevez les jambes tendues à 90°. Cible le bas des abdominaux.",
          caloriesPerSet: [6, 8],
          totalSets: 3,
          nbRep: 15,
        ),
      ],
    );
  }

  static WorkoutDay _createDay4() {
    return WorkoutDay(
      title: 'JOUR 4: PUSH (Variation)',
      exercises: [
        Exercise(
          name: 'Pompes lestées',
          sets: '4 × 10',
          equip: 'Gilet lesté 10 kg',
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
          name: 'Extensions triceps au-dessus',
          sets: '3 × 15',
          equip: 'Haltère 15 kg (à deux mains)',
          desc:
              "Bras au-dessus de la tête, pliez le coude derrière la nuque puis tendez. Étire complètement le triceps.",
          caloriesPerSet: [8, 10],
          totalSets: 3,
          nbRep: 15,
        ),
        Exercise(
          name: 'Barre au front',
          sets: '3 × 15',
          equip: 'Barre 30 kg',
          desc:
              "Allongé, descendez la barre vers le front puis remontez en tendant les bras. Alternative aux kickbacks, cible les triceps.",
          caloriesPerSet: [8, 10],
          totalSets: 3,
          nbRep: 15,
        ),
        Exercise(
          name: 'Crunchs obliques',
          sets: '3 × 25',
          equip: 'Haltère 10 kg',
          desc:
              "Allongé, fléchissez le buste en orientant le coude vers le genou opposé. Cible les obliques.",
          caloriesPerSet: [6, 8],
          totalSets: 3,
          nbRep: 25,
        ),
        Exercise(
          name: 'Hollow hold',
          sets: '3 × 30 sec',
          equip: 'Gilet lesté 10 kg',
          desc:
              "Allongé, bras et jambes légèrement soulevés, creusez le ventre. Renforce profondément les abdominaux.",
          timer: true,
          duration: 30,
          caloriesPerSet: [4, 6],
          totalSets: 3,
          nbRep: 0,
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
          name: 'Curl 21s',
          sets: '3 séries',
          equip: 'Barre 30 kg',
          desc:
              "7 répétitions partie basse + 7 répétitions partie haute + 7 répétitions complètes. Bombarde le biceps sous tous les angles.",
          caloriesPerSet: [8, 10],
          totalSets: 3,
          nbRep: 21,
        ),
        Exercise(
          name: 'Reverse fly',
          sets: '3 × 15',
          equip: 'Haltères 10 kg',
          desc:
              "Penché en avant, écartez les bras sur les côtés. Renforce les muscles posturaux du haut du dos.",
          caloriesPerSet: [6, 8],
          totalSets: 3,
          nbRep: 15,
        ),
        Exercise(
          name: 'Planche latérale',
          sets: '3 × 30 sec/côté',
          equip: 'Gilet lesté 10 kg',
          desc:
              "En appui sur un avant-bras et le côté du pied, maintenez le corps droit. Travaille les obliques et les stabilisateurs latéraux.",
          timer: true,
          duration: 30,
          caloriesPerSet: [4, 6],
          totalSets: 6,
          nbRep: 0,
        ),
        Exercise(
          name: 'Bicycle crunch',
          sets: '3 × 20',
          equip: 'Lesté (optionnel)',
          desc:
              "Allongé, amenez le coude vers le genou opposé en alternant. Excellent pour cibler tous les abdominaux.",
          caloriesPerSet: [8, 10],
          totalSets: 3,
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
          name: 'Pont fessier lesté',
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
          equip: 'Haltère 10 kg (derrière le genou)',
          desc:
              "À quatre pattes, étendez une jambe vers l'arrière et le haut. Cible les fessiers et les lombaires.",
          caloriesPerSet: [10, 12],
          totalSets: 6,
          nbRep: 15,
        ),
        Exercise(
          name: 'Squats bulgares',
          sets: '3 × 12/jambe',
          equip: 'Haltères 10 kg',
          desc:
              "Pied arrière sur un banc, descendez en fente. Alternative au good morning, cible les quadriceps et les fessiers.",
          caloriesPerSet: [12, 15],
          totalSets: 6,
          nbRep: 12,
        ),
        Exercise(
          name: 'Mollets assis',
          sets: '4 × 20',
          equip: 'Barre 30 kg sur les genoux',
          desc:
              "Assis, montez sur la pointe des pieds puis redescendez. Cible différemment les mollets.",
          caloriesPerSet: [8, 10],
          totalSets: 4,
          nbRep: 20,
        ),
        Exercise(
          name: 'Crunchs lestés',
          sets: '3 × 25',
          equip: 'Haltère 10 kg',
          desc:
              "Allongé sur le dos, jambes fléchies, soulevez les épaules du sol. Travaille la partie supérieure des abdominaux.",
          caloriesPerSet: [6, 8],
          totalSets: 3,
          nbRep: 25,
        ),
        Exercise(
          name: 'Dead bug',
          sets: '3 × 10/côté',
          equip: 'Lesté avec haltère 10 kg',
          desc:
              "Allongé, bras et jambes en l'air, descendez le bras et la jambe opposés. Excellent pour la stabilité du core.",
          caloriesPerSet: [6, 8],
          totalSets: 6,
          nbRep: 10,
        ),
      ],
    );
  }

  static WorkoutDay _createDay7() {
    return WorkoutDay(
      title: 'JOUR 7: CARDIO & RÉCUPÉRATION',
      exercises: [
        Exercise(
          name: 'Vélo',
          sets: '30-45 min à intensité modérée',
          equip: 'Gilet lesté 10 kg (optionnel)',
          desc:
              "Maintient la fréquence cardiaque à 60-70% du maximum pour une combustion optimale des graisses.",
          timer: true,
          duration: 2700,
          caloriesPerSet: [20, 25],
          totalSets: 1,
          nbRep: 0,
        ),
        Exercise(
          name: 'Cardio au choix',
          sets: '20-30 min',
          equip: 'Gilet lesté 10 kg (optionnel)',
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
