import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';
import '../models/workout_model.dart';

/// Service de stockage SQLite complet
/// Gère l'historique des entraînements, les poids corporels, et la personnalisation
class StorageService {
  static Database? _database;
  static const String _dbName = 'project_fat_loss.db';
  static const int _dbVersion = 1;

  /// Tables
  static const String _workoutHistoryTable = 'workout_history';
  static const String _weightHistoryTable = 'weight_history';
  static const String _customExercisesTable = 'custom_exercises';
  static const String _workoutPlanTable = 'workout_plan';

  /// Initialise la base de données
  static Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDatabase();
    return _database!;
  }

  /// Initialise la base de données et crée les tables
  static Future<Database> _initDatabase() async {
    final dbPath = await getDatabasesPath();
    final path = join(dbPath, _dbName);

    return await openDatabase(
      path,
      version: _dbVersion,
      onCreate: _onCreate,
      onUpgrade: _onUpgrade,
    );
  }

  /// Crée les tables lors de la première installation
  static Future<void> _onCreate(Database db, int version) async {
    // Table historique des entraînements
    await db.execute('''
      CREATE TABLE $_workoutHistoryTable (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        dayNumber INTEGER NOT NULL,
        dayTitle TEXT NOT NULL,
        duration INTEGER NOT NULL,
        totalCalories REAL NOT NULL,
        totalWeight REAL NOT NULL,
        exercises TEXT NOT NULL,
        completed INTEGER NOT NULL DEFAULT 0,
        createdAt TEXT NOT NULL
      )
    ''');

    // Table historique du poids corporel
    await db.execute('''
      CREATE TABLE $_weightHistoryTable (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        weight REAL NOT NULL,
        notes TEXT,
        createdAt TEXT NOT NULL
      )
    ''');

    // Table exercices personnalisés
    await db.execute('''
      CREATE TABLE $_customExercisesTable (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        sets TEXT NOT NULL,
        equip TEXT NOT NULL,
        description TEXT NOT NULL,
        caloriesMin REAL NOT NULL,
        caloriesMax REAL NOT NULL,
        totalSets INTEGER NOT NULL,
        nbRep INTEGER NOT NULL,
        isTimer INTEGER NOT NULL DEFAULT 0,
        duration INTEGER,
        muscleGroups TEXT,
        createdAt TEXT NOT NULL
      )
    ''');

    // Table plan d'entraînement personnalisé
    await db.execute('''
      CREATE TABLE $_workoutPlanTable (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        dayNumber INTEGER NOT NULL,
        exerciseData TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      )
    ''');

    print('✅ Tables SQLite créées avec succès');
  }

  /// Gère les mises à jour de schéma
  static Future<void> _onUpgrade(
    Database db,
    int oldVersion,
    int newVersion,
  ) async {
    // Gérer les migrations futures ici
  }

  // ==================== WORKOUT HISTORY ====================

  /// Sauvegarde un entraînement dans l'historique
  static Future<int> saveWorkout({
    required DateTime date,
    required int dayNumber,
    required String dayTitle,
    required int duration,
    required double totalCalories,
    required double totalWeight,
    required List<Map<String, dynamic>> exercises,
    bool completed = true,
  }) async {
    final db = await database;

    final workout = {
      'date': date.toIso8601String(),
      'dayNumber': dayNumber,
      'dayTitle': dayTitle,
      'duration': duration,
      'totalCalories': totalCalories,
      'totalWeight': totalWeight,
      'exercises': exercises.toString(),
      'completed': completed ? 1 : 0,
      'createdAt': DateTime.now().toIso8601String(),
    };

    return await db.insert(_workoutHistoryTable, workout);
  }

  /// Récupère tous les entraînements
  static Future<List<Map<String, dynamic>>> getAllWorkouts() async {
    final db = await database;
    return await db.query(
      _workoutHistoryTable,
      orderBy: 'date DESC',
    );
  }

  /// Récupère les entraînements d'une période donnée
  static Future<List<Map<String, dynamic>>> getWorkoutsByDateRange({
    required DateTime startDate,
    required DateTime endDate,
  }) async {
    final db = await database;
    return await db.query(
      _workoutHistoryTable,
      where: 'date BETWEEN ? AND ?',
      whereArgs: [
        startDate.toIso8601String(),
        endDate.toIso8601String(),
      ],
      orderBy: 'date DESC',
    );
  }

  /// Récupère les statistiques globales
  static Future<Map<String, dynamic>> getWorkoutStats() async {
    final db = await database;

    final result = await db.rawQuery('''
      SELECT
        COUNT(*) as totalWorkouts,
        SUM(totalCalories) as totalCalories,
        SUM(totalWeight) as totalWeight,
        AVG(duration) as avgDuration,
        MAX(date) as lastWorkoutDate
      FROM $_workoutHistoryTable
      WHERE completed = 1
    ''');

    return result.first;
  }

  /// Supprime un entraînement
  static Future<int> deleteWorkout(int id) async {
    final db = await database;
    return await db.delete(
      _workoutHistoryTable,
      where: 'id = ?',
      whereArgs: [id],
    );
  }

  // ==================== WEIGHT HISTORY ====================

  /// Sauvegarde une mesure de poids
  static Future<int> saveWeight({
    required DateTime date,
    required double weight,
    String? notes,
  }) async {
    final db = await database;

    final weightEntry = {
      'date': date.toIso8601String(),
      'weight': weight,
      'notes': notes,
      'createdAt': DateTime.now().toIso8601String(),
    };

    return await db.insert(_weightHistoryTable, weightEntry);
  }

  /// Récupère toutes les mesures de poids
  static Future<List<Map<String, dynamic>>> getAllWeights() async {
    final db = await database;
    return await db.query(
      _weightHistoryTable,
      orderBy: 'date DESC',
    );
  }

  /// Récupère les poids d'une période donnée
  static Future<List<Map<String, dynamic>>> getWeightsByDateRange({
    required DateTime startDate,
    required DateTime endDate,
  }) async {
    final db = await database;
    return await db.query(
      _weightHistoryTable,
      where: 'date BETWEEN ? AND ?',
      whereArgs: [
        startDate.toIso8601String(),
        endDate.toIso8601String(),
      ],
      orderBy: 'date ASC',
    );
  }

  /// Récupère le dernier poids enregistré
  static Future<Map<String, dynamic>?> getLatestWeight() async {
    final db = await database;
    final results = await db.query(
      _weightHistoryTable,
      orderBy: 'date DESC',
      limit: 1,
    );

    return results.isNotEmpty ? results.first : null;
  }

  /// Met à jour une mesure de poids
  static Future<int> updateWeight({
    required int id,
    required double weight,
    String? notes,
  }) async {
    final db = await database;
    return await db.update(
      _weightHistoryTable,
      {
        'weight': weight,
        'notes': notes,
      },
      where: 'id = ?',
      whereArgs: [id],
    );
  }

  /// Supprime une mesure de poids
  static Future<int> deleteWeight(int id) async {
    final db = await database;
    return await db.delete(
      _weightHistoryTable,
      where: 'id = ?',
      whereArgs: [id],
    );
  }

  // ==================== CUSTOM EXERCISES ====================

  /// Ajoute un exercice personnalisé
  static Future<int> addCustomExercise({
    required String name,
    required String sets,
    required String equip,
    required String description,
    required double caloriesMin,
    required double caloriesMax,
    required int totalSets,
    required int nbRep,
    bool isTimer = false,
    int? duration,
    List<String>? muscleGroups,
  }) async {
    final db = await database;

    final exercise = {
      'name': name,
      'sets': sets,
      'equip': equip,
      'description': description,
      'caloriesMin': caloriesMin,
      'caloriesMax': caloriesMax,
      'totalSets': totalSets,
      'nbRep': nbRep,
      'isTimer': isTimer ? 1 : 0,
      'duration': duration,
      'muscleGroups': muscleGroups?.join(','),
      'createdAt': DateTime.now().toIso8601String(),
    };

    return await db.insert(_customExercisesTable, exercise);
  }

  /// Récupère tous les exercices personnalisés
  static Future<List<Map<String, dynamic>>> getAllCustomExercises() async {
    final db = await database;
    return await db.query(
      _customExercisesTable,
      orderBy: 'name ASC',
    );
  }

  /// Supprime un exercice personnalisé
  static Future<int> deleteCustomExercise(int id) async {
    final db = await database;
    return await db.delete(
      _customExercisesTable,
      where: 'id = ?',
      whereArgs: [id],
    );
  }

  // ==================== WORKOUT PLAN CUSTOMIZATION ====================

  /// Sauvegarde un plan d'entraînement personnalisé
  static Future<int> saveCustomWorkoutPlan({
    required int dayNumber,
    required String exerciseData,
  }) async {
    final db = await database;

    // Vérifier si le jour existe déjà
    final existing = await db.query(
      _workoutPlanTable,
      where: 'dayNumber = ?',
      whereArgs: [dayNumber],
    );

    final data = {
      'dayNumber': dayNumber,
      'exerciseData': exerciseData,
      'updatedAt': DateTime.now().toIso8601String(),
    };

    if (existing.isNotEmpty) {
      // Mettre à jour
      return await db.update(
        _workoutPlanTable,
        data,
        where: 'dayNumber = ?',
        whereArgs: [dayNumber],
      );
    } else {
      // Insérer
      return await db.insert(_workoutPlanTable, data);
    }
  }

  /// Récupère le plan personnalisé pour un jour
  static Future<Map<String, dynamic>?> getCustomWorkoutPlan(
    int dayNumber,
  ) async {
    final db = await database;
    final results = await db.query(
      _workoutPlanTable,
      where: 'dayNumber = ?',
      whereArgs: [dayNumber],
    );

    return results.isNotEmpty ? results.first : null;
  }

  /// Supprime la personnalisation d'un jour
  static Future<int> deleteCustomWorkoutPlan(int dayNumber) async {
    final db = await database;
    return await db.delete(
      _workoutPlanTable,
      where: 'dayNumber = ?',
      whereArgs: [dayNumber],
    );
  }

  /// Réinitialise tout le plan personnalisé
  static Future<int> resetAllCustomWorkoutPlans() async {
    final db = await database;
    return await db.delete(_workoutPlanTable);
  }

  // ==================== UTILITY ====================

  /// Ferme la base de données
  static Future<void> closeDatabase() async {
    final db = await database;
    await db.close();
    _database = null;
  }

  /// Supprime toutes les données (pour debug/reset)
  static Future<void> clearAllData() async {
    final db = await database;
    await db.delete(_workoutHistoryTable);
    await db.delete(_weightHistoryTable);
    await db.delete(_customExercisesTable);
    await db.delete(_workoutPlanTable);
    print('✅ Toutes les données supprimées');
  }

  /// Export des données pour backup (JSON)
  static Future<Map<String, dynamic>> exportData() async {
    final workouts = await getAllWorkouts();
    final weights = await getAllWeights();
    final customExercises = await getAllCustomExercises();

    return {
      'workouts': workouts,
      'weights': weights,
      'customExercises': customExercises,
      'exportDate': DateTime.now().toIso8601String(),
    };
  }
}