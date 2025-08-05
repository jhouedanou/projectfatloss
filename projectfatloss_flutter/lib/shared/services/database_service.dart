import 'dart:async';
import 'dart:io';
import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';
import '../models/workout_model.dart';

/// Service de base de données locale pour stocker les données d'entraînement
class DatabaseService {
  static Database? _database;
  static const String _databaseName = 'project_fat_loss.db';
  static const int _databaseVersion = 1;

  // Noms des tables
  static const String _tableWorkoutPlans = 'workout_plans';
  static const String _tableWorkoutDays = 'workout_days';
  static const String _tableExercises = 'exercises';
  static const String _tableWorkoutSessions = 'workout_sessions';
  static const String _tableUserProgress = 'user_progress';

  /// Initialise la base de données
  static Future<void> init() async {
    if (_database != null) return;

    final databasesPath = await getDatabasesPath();
    final path = join(databasesPath, _databaseName);

    _database = await openDatabase(
      path,
      version: _databaseVersion,
      onCreate: _onCreate,
      onUpgrade: _onUpgrade,
    );

    print('✅ Base de données initialisée avec succès');
  }

  /// Crée les tables lors de la première installation
  static Future<void> _onCreate(Database db, int version) async {
    // Table des plans d'entraînement
    await db.execute('''
      CREATE TABLE $_tableWorkoutPlans (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        total_days INTEGER NOT NULL,
        completed_days INTEGER DEFAULT 0,
        start_date TEXT NOT NULL,
        end_date TEXT,
        difficulty TEXT NOT NULL,
        total_calories_burned INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    ''');

    // Table des jours d'entraînement
    await db.execute('''
      CREATE TABLE $_tableWorkoutDays (
        id TEXT PRIMARY KEY,
        plan_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        total_duration INTEGER NOT NULL,
        difficulty TEXT NOT NULL,
        category TEXT NOT NULL,
        is_completed INTEGER DEFAULT 0,
        completed_at TEXT,
        calories_burned INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (plan_id) REFERENCES $_tableWorkoutPlans (id) ON DELETE CASCADE
      )
    ''');

    // Table des exercices
    await db.execute('''
      CREATE TABLE $_tableExercises (
        id TEXT PRIMARY KEY,
        day_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        image_url TEXT,
        video_url TEXT,
        duration INTEGER NOT NULL,
        sets INTEGER NOT NULL,
        reps INTEGER NOT NULL,
        category TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        muscles TEXT NOT NULL,
        instructions TEXT,
        is_completed INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (day_id) REFERENCES $_tableWorkoutDays (id) ON DELETE CASCADE
      )
    ''');

    // Table des sessions d'entraînement
    await db.execute('''
      CREATE TABLE $_tableWorkoutSessions (
        id TEXT PRIMARY KEY,
        day_id TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT,
        duration INTEGER NOT NULL,
        calories_burned INTEGER DEFAULT 0,
        exercises_completed INTEGER DEFAULT 0,
        total_exercises INTEGER NOT NULL,
        notes TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (day_id) REFERENCES $_tableWorkoutDays (id) ON DELETE CASCADE
      )
    ''');

    // Table des progrès utilisateur
    await db.execute('''
      CREATE TABLE $_tableUserProgress (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        weight REAL,
        height REAL,
        target_weight REAL,
        current_plan_id TEXT,
        total_workouts INTEGER DEFAULT 0,
        total_calories_burned INTEGER DEFAULT 0,
        streak_days INTEGER DEFAULT 0,
        last_workout_date TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (current_plan_id) REFERENCES $_tableWorkoutPlans (id)
      )
    ''');

    print('✅ Tables créées avec succès');
  }

  /// Met à jour la base de données lors des nouvelles versions
  static Future<void> _onUpgrade(Database db, int oldVersion, int newVersion) async {
    if (oldVersion < 2) {
      // Ajouter de nouvelles colonnes si nécessaire
      // await db.execute('ALTER TABLE $_tableWorkoutPlans ADD COLUMN new_column TEXT');
    }
  }

  /// Ferme la base de données
  static Future<void> close() async {
    await _database?.close();
    _database = null;
  }

  // ===== MÉTHODES POUR LES PLANS D'ENTRAÎNEMENT =====

  /// Insère un plan d'entraînement
  static Future<String> insertWorkoutPlan(WorkoutPlan plan) async {
    final now = DateTime.now().toIso8601String();
    
    await _database!.insert(
      _tableWorkoutPlans,
      {
        'id': plan.id,
        'name': plan.name,
        'description': plan.description,
        'total_days': plan.totalDays,
        'completed_days': plan.completedDays,
        'start_date': plan.startDate.toIso8601String(),
        'end_date': plan.endDate?.toIso8601String(),
        'difficulty': plan.difficulty,
        'total_calories_burned': plan.totalCaloriesBurned,
        'created_at': now,
        'updated_at': now,
      },
      conflictAlgorithm: ConflictAlgorithm.replace,
    );

    // Insérer les jours d'entraînement
    for (final day in plan.days) {
      await insertWorkoutDay(day, plan.id);
    }

    return plan.id;
  }

  /// Récupère tous les plans d'entraînement
  static Future<List<WorkoutPlan>> getAllWorkoutPlans() async {
    final List<Map<String, dynamic>> maps = await _database!.query(_tableWorkoutPlans);
    
    return Future.wait(maps.map((map) async {
      final days = await getWorkoutDaysByPlanId(map['id']);
      return WorkoutPlan(
        id: map['id'],
        name: map['name'],
        description: map['description'],
        days: days,
        totalDays: map['total_days'],
        completedDays: map['completed_days'],
        startDate: DateTime.parse(map['start_date']),
        endDate: map['end_date'] != null ? DateTime.parse(map['end_date']) : null,
        difficulty: map['difficulty'],
        totalCaloriesBurned: map['total_calories_burned'],
      );
    }).toList());
  }

  /// Récupère un plan d'entraînement par ID
  static Future<WorkoutPlan?> getWorkoutPlanById(String id) async {
    final List<Map<String, dynamic>> maps = await _database!.query(
      _tableWorkoutPlans,
      where: 'id = ?',
      whereArgs: [id],
    );

    if (maps.isEmpty) return null;

    final map = maps.first;
    final days = await getWorkoutDaysByPlanId(id);

    return WorkoutPlan(
      id: map['id'],
      name: map['name'],
      description: map['description'],
      days: days,
      totalDays: map['total_days'],
      completedDays: map['completed_days'],
      startDate: DateTime.parse(map['start_date']),
      endDate: map['end_date'] != null ? DateTime.parse(map['end_date']) : null,
      difficulty: map['difficulty'],
      totalCaloriesBurned: map['total_calories_burned'],
    );
  }

  /// Met à jour un plan d'entraînement
  static Future<int> updateWorkoutPlan(WorkoutPlan plan) async {
    return await _database!.update(
      _tableWorkoutPlans,
      {
        'name': plan.name,
        'description': plan.description,
        'completed_days': plan.completedDays,
        'total_calories_burned': plan.totalCaloriesBurned,
        'updated_at': DateTime.now().toIso8601String(),
      },
      where: 'id = ?',
      whereArgs: [plan.id],
    );
  }

  /// Supprime un plan d'entraînement
  static Future<int> deleteWorkoutPlan(String id) async {
    return await _database!.delete(
      _tableWorkoutPlans,
      where: 'id = ?',
      whereArgs: [id],
    );
  }

  // ===== MÉTHODES POUR LES JOURS D'ENTRAÎNEMENT =====

  /// Insère un jour d'entraînement
  static Future<String> insertWorkoutDay(WorkoutDay day, String planId) async {
    final now = DateTime.now().toIso8601String();
    
    await _database!.insert(
      _tableWorkoutDays,
      {
        'id': day.id,
        'plan_id': planId,
        'name': day.name,
        'description': day.description,
        'total_duration': day.totalDuration,
        'difficulty': day.difficulty,
        'category': day.category,
        'is_completed': day.isCompleted ? 1 : 0,
        'completed_at': day.completedAt?.toIso8601String(),
        'calories_burned': day.caloriesBurned,
        'created_at': now,
        'updated_at': now,
      },
      conflictAlgorithm: ConflictAlgorithm.replace,
    );

    // Insérer les exercices
    for (final exercise in day.exercises) {
      await insertExercise(exercise, day.id);
    }

    return day.id;
  }

  /// Récupère les jours d'entraînement d'un plan
  static Future<List<WorkoutDay>> getWorkoutDaysByPlanId(String planId) async {
    final List<Map<String, dynamic>> maps = await _database!.query(
      _tableWorkoutDays,
      where: 'plan_id = ?',
      whereArgs: [planId],
    );

    return Future.wait(maps.map((map) async {
      final exercises = await getExercisesByDayId(map['id']);
      return WorkoutDay(
        id: map['id'],
        name: map['name'],
        description: map['description'],
        exercises: exercises,
        totalDuration: map['total_duration'],
        difficulty: map['difficulty'],
        category: map['category'],
        isCompleted: map['is_completed'] == 1,
        completedAt: map['completed_at'] != null 
            ? DateTime.parse(map['completed_at']) 
            : null,
        caloriesBurned: map['calories_burned'],
      );
    }).toList());
  }

  /// Récupère un jour d'entraînement par ID
  static Future<WorkoutDay?> getWorkoutDayById(String id) async {
    final List<Map<String, dynamic>> maps = await _database!.query(
      _tableWorkoutDays,
      where: 'id = ?',
      whereArgs: [id],
    );

    if (maps.isEmpty) return null;

    final map = maps.first;
    final exercises = await getExercisesByDayId(id);

    return WorkoutDay(
      id: map['id'],
      name: map['name'],
      description: map['description'],
      exercises: exercises,
      totalDuration: map['total_duration'],
      difficulty: map['difficulty'],
      category: map['category'],
      isCompleted: map['is_completed'] == 1,
      completedAt: map['completed_at'] != null 
          ? DateTime.parse(map['completed_at']) 
          : null,
      caloriesBurned: map['calories_burned'],
    );
  }

  /// Met à jour un jour d'entraînement
  static Future<int> updateWorkoutDay(WorkoutDay day) async {
    return await _database!.update(
      _tableWorkoutDays,
      {
        'name': day.name,
        'description': day.description,
        'is_completed': day.isCompleted ? 1 : 0,
        'completed_at': day.completedAt?.toIso8601String(),
        'calories_burned': day.caloriesBurned,
        'updated_at': DateTime.now().toIso8601String(),
      },
      where: 'id = ?',
      whereArgs: [day.id],
    );
  }

  // ===== MÉTHODES POUR LES EXERCICES =====

  /// Insère un exercice
  static Future<String> insertExercise(Exercise exercise, String dayId) async {
    final now = DateTime.now().toIso8601String();
    
    await _database!.insert(
      _tableExercises,
      {
        'id': exercise.id,
        'day_id': dayId,
        'name': exercise.name,
        'description': exercise.description,
        'image_url': exercise.imageUrl,
        'video_url': exercise.videoUrl,
        'duration': exercise.duration,
        'sets': exercise.sets,
        'reps': exercise.reps,
        'category': exercise.category,
        'difficulty': exercise.difficulty,
        'muscles': exercise.muscles.join(','),
        'instructions': exercise.instructions,
        'is_completed': exercise.isCompleted ? 1 : 0,
        'created_at': now,
        'updated_at': now,
      },
      conflictAlgorithm: ConflictAlgorithm.replace,
    );

    return exercise.id;
  }

  /// Récupère les exercices d'un jour
  static Future<List<Exercise>> getExercisesByDayId(String dayId) async {
    final List<Map<String, dynamic>> maps = await _database!.query(
      _tableExercises,
      where: 'day_id = ?',
      whereArgs: [dayId],
    );

    return maps.map((map) => Exercise(
      id: map['id'],
      name: map['name'],
      description: map['description'],
      imageUrl: map['image_url'],
      videoUrl: map['video_url'],
      duration: map['duration'],
      sets: map['sets'],
      reps: map['reps'],
      category: map['category'],
      difficulty: map['difficulty'],
      muscles: map['muscles'].split(','),
      instructions: map['instructions'],
      isCompleted: map['is_completed'] == 1,
    )).toList();
  }

  /// Met à jour un exercice
  static Future<int> updateExercise(Exercise exercise) async {
    return await _database!.update(
      _tableExercises,
      {
        'name': exercise.name,
        'description': exercise.description,
        'is_completed': exercise.isCompleted ? 1 : 0,
        'updated_at': DateTime.now().toIso8601String(),
      },
      where: 'id = ?',
      whereArgs: [exercise.id],
    );
  }

  // ===== MÉTHODES POUR LES SESSIONS D'ENTRAÎNEMENT =====

  /// Enregistre une session d'entraînement
  static Future<String> insertWorkoutSession({
    required String dayId,
    required DateTime startTime,
    DateTime? endTime,
    required int duration,
    int caloriesBurned = 0,
    int exercisesCompleted = 0,
    required int totalExercises,
    String? notes,
  }) async {
    final id = DateTime.now().millisecondsSinceEpoch.toString();
    
    await _database!.insert(
      _tableWorkoutSessions,
      {
        'id': id,
        'day_id': dayId,
        'start_time': startTime.toIso8601String(),
        'end_time': endTime?.toIso8601String(),
        'duration': duration,
        'calories_burned': caloriesBurned,
        'exercises_completed': exercisesCompleted,
        'total_exercises': totalExercises,
        'notes': notes,
        'created_at': DateTime.now().toIso8601String(),
      },
    );

    return id;
  }

  /// Récupère l'historique des sessions
  static Future<List<Map<String, dynamic>>> getWorkoutSessions({
    String? dayId,
    int limit = 50,
  }) async {
    String whereClause = '';
    List<Object> whereArgs = [];

    if (dayId != null) {
      whereClause = 'day_id = ?';
      whereArgs = [dayId];
    }

    return await _database!.query(
      _tableWorkoutSessions,
      where: whereClause.isEmpty ? null : whereClause,
      whereArgs: whereArgs.isEmpty ? null : whereArgs,
      orderBy: 'created_at DESC',
      limit: limit,
    );
  }

  // ===== MÉTHODES POUR LES STATISTIQUES =====

  /// Récupère les statistiques globales
  static Future<Map<String, dynamic>> getGlobalStats() async {
    final result = await _database!.rawQuery('''
      SELECT 
        COUNT(DISTINCT ws.id) as total_sessions,
        SUM(ws.calories_burned) as total_calories,
        SUM(ws.duration) as total_duration,
        COUNT(DISTINCT wd.id) as completed_days,
        MAX(ws.created_at) as last_workout
      FROM $_tableWorkoutSessions ws
      LEFT JOIN $_tableWorkoutDays wd ON ws.day_id = wd.id
    ''');

    return result.first;
  }

  /// Récupère les statistiques par semaine
  static Future<List<Map<String, dynamic>>> getWeeklyStats() async {
    return await _database!.rawQuery('''
      SELECT 
        strftime('%Y-%W', created_at) as week,
        COUNT(*) as sessions,
        SUM(calories_burned) as calories,
        SUM(duration) as duration
      FROM $_tableWorkoutSessions
      GROUP BY week
      ORDER BY week DESC
      LIMIT 12
    ''');
  }

  /// Vide toutes les données (pour les tests)
  static Future<void> clearAllData() async {
    await _database!.delete(_tableWorkoutSessions);
    await _database!.delete(_tableExercises);
    await _database!.delete(_tableWorkoutDays);
    await _database!.delete(_tableWorkoutPlans);
    await _database!.delete(_tableUserProgress);
  }
} 