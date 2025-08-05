import '../models/workout_model.dart';
import 'database_service.dart';

/// Service de données d'entraînement utilisant la base de données locale
class WorkoutDataService {
  static bool _isInitialized = false;

  /// Initialise le service avec des données par défaut si nécessaire
  static Future<void> init() async {
    if (_isInitialized) return;

    // Vérifier si des données existent déjà
    final existingPlans = await DatabaseService.getAllWorkoutPlans();
    
    if (existingPlans.isEmpty) {
      // Insérer les données par défaut
      await _insertDefaultData();
    }

    _isInitialized = true;
  }

  /// Insère les données par défaut dans la base de données
  static Future<void> _insertDefaultData() async {
    final defaultPlan = _createDefaultWorkoutPlan();
    await DatabaseService.insertWorkoutPlan(defaultPlan);
    print('✅ Données par défaut insérées dans la base de données');
  }

  /// Crée le plan d'entraînement par défaut
  static WorkoutPlan _createDefaultWorkoutPlan() {
    return WorkoutPlan(
      id: 'default_plan',
      name: 'Plan Fat Loss 30 jours',
      description: 'Programme complet de 30 jours pour perdre du poids',
      days: _createDefaultWorkoutDays(),
      totalDays: 3, // Pour commencer avec 3 jours
      startDate: DateTime.now(),
      difficulty: 'Intermédiaire',
    );
  }

  /// Crée les jours d'entraînement par défaut
  static List<WorkoutDay> _createDefaultWorkoutDays() {
    return [
    WorkoutDay(
      id: 'day1',
      name: 'Jour 1 - Démarrage',
      description: 'Entraînement de début pour s\'échauffer',
      exercises: [
        Exercise(
          id: 'ex1',
          name: 'Jumping Jacks',
          description: 'Exercice cardio pour s\'échauffer',
          imageUrl: 'assets/images/jumping_jacks.jpg',
          videoUrl: 'assets/videos/jumping_jacks.mp4',
          duration: 30,
          sets: 3,
          reps: 10,
          category: 'Cardio',
          difficulty: 'Débutant',
          muscles: ['Jambes', 'Épaules'],
          instructions: 'Sauter en écartant les jambes et levant les bras',
        ),
        Exercise(
          id: 'ex2',
          name: 'Push-ups',
          description: 'Pompes pour renforcer le haut du corps',
          imageUrl: 'assets/images/push_ups.jpg',
          videoUrl: 'assets/videos/push_ups.mp4',
          duration: 45,
          sets: 3,
          reps: 8,
          category: 'Force',
          difficulty: 'Débutant',
          muscles: ['Pectoraux', 'Triceps'],
          instructions: 'Pompes classiques au sol',
        ),
        Exercise(
          id: 'ex3',
          name: 'Squats',
          description: 'Squats pour renforcer les jambes',
          imageUrl: 'assets/images/squats.jpg',
          videoUrl: 'assets/videos/squats.mp4',
          duration: 60,
          sets: 3,
          reps: 12,
          category: 'Force',
          difficulty: 'Débutant',
          muscles: ['Quadriceps', 'Fessiers'],
          instructions: 'Squats classiques avec les pieds écartés',
        ),
      ],
      totalDuration: 135,
      difficulty: 'Débutant',
      category: 'Cardio + Force',
    ),
    WorkoutDay(
      id: 'day2',
      name: 'Jour 2 - Cardio',
      description: 'Entraînement cardio intensif',
      exercises: [
        Exercise(
          id: 'ex4',
          name: 'Burpees',
          description: 'Exercice complet cardio',
          imageUrl: 'assets/images/burpees.jpg',
          videoUrl: 'assets/videos/burpees.mp4',
          duration: 40,
          sets: 4,
          reps: 6,
          category: 'Cardio',
          difficulty: 'Intermédiaire',
          muscles: ['Tout le corps'],
          instructions: 'Combinaison squat, push-up et saut',
        ),
        Exercise(
          id: 'ex5',
          name: 'Mountain Climbers',
          description: 'Exercice cardio dynamique',
          imageUrl: 'assets/images/mountain_climbers.jpg',
          videoUrl: 'assets/videos/mountain_climbers.mp4',
          duration: 50,
          sets: 3,
          reps: 15,
          category: 'Cardio',
          difficulty: 'Intermédiaire',
          muscles: ['Abdominaux', 'Épaules'],
          instructions: 'Alterner les genoux vers la poitrine',
        ),
      ],
      totalDuration: 90,
      difficulty: 'Intermédiaire',
      category: 'Cardio',
    ),
    WorkoutDay(
      id: 'day3',
      name: 'Jour 3 - Force',
      description: 'Entraînement de force et musculation',
      exercises: [
        Exercise(
          id: 'ex6',
          name: 'Plank',
          description: 'Gainage pour renforcer le core',
          imageUrl: 'assets/images/plank.jpg',
          videoUrl: 'assets/videos/plank.mp4',
          duration: 60,
          sets: 3,
          reps: 1,
          category: 'Force',
          difficulty: 'Débutant',
          muscles: ['Abdominaux', 'Lombaires'],
          instructions: 'Maintenir la position de planche',
        ),
        Exercise(
          id: 'ex7',
          name: 'Lunges',
          description: 'Fentes pour renforcer les jambes',
          imageUrl: 'assets/images/lunges.jpg',
          videoUrl: 'assets/videos/lunges.mp4',
          duration: 45,
          sets: 3,
          reps: 10,
          category: 'Force',
          difficulty: 'Débutant',
          muscles: ['Quadriceps', 'Fessiers'],
          instructions: 'Fentes alternées avant',
        ),
        Exercise(
          id: 'ex8',
          name: 'Dips',
          description: 'Dips pour renforcer les triceps',
          imageUrl: 'assets/images/dips.jpg',
          videoUrl: 'assets/videos/dips.mp4',
          duration: 40,
          sets: 3,
          reps: 8,
          category: 'Force',
          difficulty: 'Intermédiaire',
          muscles: ['Triceps', 'Épaules'],
          instructions: 'Dips sur chaise ou barres parallèles',
        ),
      ],
      totalDuration: 145,
      difficulty: 'Intermédiaire',
      category: 'Force',
    ),
  ];

  /// Récupère le plan d'entraînement par défaut depuis la base de données
  static Future<WorkoutPlan?> getDefaultWorkoutPlan() async {
    await init();
    return await DatabaseService.getWorkoutPlanById('default_plan');
  }

  /// Récupère un jour d'entraînement spécifique depuis la base de données
  static Future<WorkoutDay?> getWorkoutDay(String dayId) async {
    await init();
    return await DatabaseService.getWorkoutDayById(dayId);
  }

  /// Récupère tous les jours d'entraînement depuis la base de données
  static Future<List<WorkoutDay>> getAllWorkoutDays() async {
    await init();
    final plan = await getDefaultWorkoutPlan();
    return plan?.days ?? [];
  }

  /// Calcule les calories brûlées pour un exercice
  static int calculateCaloriesBurned(Exercise exercise, int weight) {
    // Formule simplifiée : calories = durée * intensité * poids / 100
    double intensity = 1.0;
    switch (exercise.difficulty) {
      case 'Débutant':
        intensity = 0.8;
        break;
      case 'Intermédiaire':
        intensity = 1.0;
        break;
      case 'Avancé':
        intensity = 1.2;
        break;
    }
    
    return ((exercise.duration * intensity * weight) / 100).round();
  }

  /// Calcule les calories totales pour un jour d'entraînement
  static int calculateDayCalories(WorkoutDay day, int weight) {
    int totalCalories = 0;
    for (var exercise in day.exercises) {
      totalCalories += calculateCaloriesBurned(exercise, weight);
    }
    return totalCalories;
  }

  /// Met à jour un jour d'entraînement dans la base de données
  static Future<void> updateWorkoutDay(WorkoutDay day) async {
    await DatabaseService.updateWorkoutDay(day);
  }

  /// Met à jour un exercice dans la base de données
  static Future<void> updateExercise(Exercise exercise) async {
    await DatabaseService.updateExercise(exercise);
  }

  /// Enregistre une session d'entraînement
  static Future<String> recordWorkoutSession({
    required String dayId,
    required DateTime startTime,
    DateTime? endTime,
    required int duration,
    int caloriesBurned = 0,
    int exercisesCompleted = 0,
    required int totalExercises,
    String? notes,
  }) async {
    return await DatabaseService.insertWorkoutSession(
      dayId: dayId,
      startTime: startTime,
      endTime: endTime,
      duration: duration,
      caloriesBurned: caloriesBurned,
      exercisesCompleted: exercisesCompleted,
      totalExercises: totalExercises,
      notes: notes,
    );
  }

  /// Récupère l'historique des sessions d'entraînement
  static Future<List<Map<String, dynamic>>> getWorkoutHistory({
    String? dayId,
    int limit = 50,
  }) async {
    return await DatabaseService.getWorkoutSessions(
      dayId: dayId,
      limit: limit,
    );
  }

  /// Récupère les statistiques globales
  static Future<Map<String, dynamic>> getGlobalStats() async {
    return await DatabaseService.getGlobalStats();
  }

  /// Récupère les statistiques par semaine
  static Future<List<Map<String, dynamic>>> getWeeklyStats() async {
    return await DatabaseService.getWeeklyStats();
  }

  /// Récupère les exercices par catégorie depuis la base de données
  static Future<List<Exercise>> getExercisesByCategory(String category) async {
    await init();
    final allDays = await getAllWorkoutDays();
    List<Exercise> exercises = [];
    
    for (var day in allDays) {
      for (var exercise in day.exercises) {
        if (exercise.category == category) {
          exercises.add(exercise);
        }
      }
    }
    
    return exercises;
  }

  /// Récupère les exercices par difficulté depuis la base de données
  static Future<List<Exercise>> getExercisesByDifficulty(String difficulty) async {
    await init();
    final allDays = await getAllWorkoutDays();
    List<Exercise> exercises = [];
    
    for (var day in allDays) {
      for (var exercise in day.exercises) {
        if (exercise.difficulty == difficulty) {
          exercises.add(exercise);
        }
      }
    }
    
    return exercises;
  }

  /// Récupère les statistiques du plan d'entraînement
  static Future<Map<String, dynamic>> getWorkoutStats(WorkoutPlan plan) async {
    int totalExercises = 0;
    int totalDuration = 0;
    int totalCalories = 0;
    
    for (var day in plan.days) {
      totalExercises += day.exercises.length;
      totalDuration += day.totalDuration;
      totalCalories += day.caloriesBurned;
    }
    
    return {
      'totalExercises': totalExercises,
      'totalDuration': totalDuration,
      'totalCalories': totalCalories,
      'averageDuration': totalDuration / plan.days.length,
      'completionRate': plan.progressPercentage,
    };
  }

  /// Ajoute un nouveau plan d'entraînement personnalisé
  static Future<String> addCustomWorkoutPlan(WorkoutPlan plan) async {
    return await DatabaseService.insertWorkoutPlan(plan);
  }

  /// Supprime un plan d'entraînement
  static Future<void> deleteWorkoutPlan(String planId) async {
    await DatabaseService.deleteWorkoutPlan(planId);
  }

  /// Vide toutes les données (pour les tests)
  static Future<void> clearAllData() async {
    await DatabaseService.clearAllData();
  }
} 