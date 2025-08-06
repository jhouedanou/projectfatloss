import 'dart:io';
import 'package:health/health.dart';
import '../models/workout_model.dart';

/// Service pour synchroniser les données d'entraînement avec Google Fit / Apple Health
class GoogleFitService {
  static final GoogleFitService _instance = GoogleFitService._internal();
  factory GoogleFitService() => _instance;
  GoogleFitService._internal();

  Health? _health;
  bool _initialized = false;
  bool get isInitialized => _initialized;

  /// Types de données à synchroniser
  static const List<HealthDataType> _dataTypes = [
    HealthDataType.ACTIVE_ENERGY_BURNED, // Calories brûlées
    HealthDataType.WORKOUT, // Sessions d'entraînement
    HealthDataType.WEIGHT, // Poids corporel
    HealthDataType.HEART_RATE, // Fréquence cardiaque
  ];

  /// Permissions nécessaires
  static const List<HealthDataAccess> _permissions = [
    HealthDataAccess.WRITE,
    HealthDataAccess.WRITE,
    HealthDataAccess.READ_WRITE,
    HealthDataAccess.READ,
  ];

  /// Initialise la connexion Google Fit / Apple Health
  Future<bool> initialize() async {
    try {
      _health = Health();
      
      // Demander les permissions
      final bool authorized = await _health!.requestAuthorization(
        _dataTypes,
        permissions: _permissions,
      );

      if (authorized) {
        _initialized = true;
        print('Google Fit / Apple Health initialisé avec succès');
      } else {
        print('Permissions Google Fit / Apple Health refusées');
      }

      return authorized;
    } catch (e) {
      print('Erreur lors de l\'initialisation Google Fit: $e');
      return false;
    }
  }

  /// Vérifie si les permissions sont accordées
  Future<bool> hasPermissions() async {
    if (_health == null) return false;
    
    try {
      return await _health!.hasPermissions(_dataTypes, permissions: _permissions) ?? false;
    } catch (e) {
      print('Erreur lors de la vérification des permissions: $e');
      return false;
    }
  }

  /// Exporte une session d'entraînement vers Google Fit
  Future<bool> exportWorkoutSession(WorkoutSession session) async {
    if (!_initialized || _health == null) {
      print('Google Fit non initialisé');
      return false;
    }

    try {
      final DateTime startTime = session.date;
      final DateTime endTime = session.date.add(Duration(seconds: session.duration));

      // 1. Ajouter la session d'entraînement
      final bool workoutAdded = await _health!.writeWorkoutData(
        activityType: HealthWorkoutActivityType.STRENGTH_TRAINING,
        start: startTime,
        end: endTime,
        totalEnergyBurned: session.calories,
        totalEnergyBurnedUnit: HealthDataUnit.KILOCALORIE,
      );

      // 2. Ajouter les calories brûlées séparément
      final bool caloriesAdded = await _health!.writeHealthData(
        value: session.calories.toDouble(),
        type: HealthDataType.ACTIVE_ENERGY_BURNED,
        startTime: startTime,
        endTime: endTime,
        unit: HealthDataUnit.KILOCALORIE,
      );

      if (workoutAdded && caloriesAdded) {
        print('Session exportée vers Google Fit: ${session.title}');
        return true;
      } else {
        print('Échec de l\'export vers Google Fit');
        return false;
      }
    } catch (e) {
      print('Erreur lors de l\'export vers Google Fit: $e');
      return false;
    }
  }

  /// Exporte uniquement les calories brûlées
  Future<bool> exportCalories(int calories, DateTime date, int durationSeconds) async {
    if (!_initialized || _health == null) {
      print('Google Fit non initialisé');
      return false;
    }

    try {
      final DateTime startTime = date;
      final DateTime endTime = date.add(Duration(seconds: durationSeconds));

      final bool success = await _health!.writeHealthData(
        value: calories.toDouble(),
        type: HealthDataType.ACTIVE_ENERGY_BURNED,
        startTime: startTime,
        endTime: endTime,
        unit: HealthDataUnit.KILOCALORIE,
      );

      if (success) {
        print('$calories calories exportées vers Google Fit');
      } else {
        print('Échec de l\'export des calories vers Google Fit');
      }

      return success;
    } catch (e) {
      print('Erreur lors de l\'export des calories: $e');
      return false;
    }
  }

  /// Exporte le temps d'entraînement uniquement
  Future<bool> exportWorkoutTime(DateTime startTime, DateTime endTime, String title) async {
    if (!_initialized || _health == null) {
      print('Google Fit non initialisé');
      return false;
    }

    try {
      final bool success = await _health!.writeWorkoutData(
        activityType: HealthWorkoutActivityType.STRENGTH_TRAINING,
        start: startTime,
        end: endTime,
      );

      if (success) {
        final duration = endTime.difference(startTime);
        print('Temps d\'entraînement exporté: ${duration.inMinutes} minutes');
      } else {
        print('Échec de l\'export du temps d\'entraînement');
      }

      return success;
    } catch (e) {
      print('Erreur lors de l\'export du temps: $e');
      return false;
    }
  }

  /// Récupère les données de santé depuis Google Fit
  Future<List<HealthDataPoint>> getHealthData({
    required DateTime startTime,
    required DateTime endTime,
    List<HealthDataType>? types,
  }) async {
    if (!_initialized || _health == null) {
      print('Google Fit non initialisé');
      return [];
    }

    try {
      final dataTypes = types ?? _dataTypes;
      final List<HealthDataPoint> healthData = await _health!.getHealthDataFromTypes(
        types: dataTypes,
        startTime: startTime,
        endTime: endTime,
      );

      return healthData;
    } catch (e) {
      print('Erreur lors de la récupération des données: $e');
      return [];
    }
  }

  /// Récupère les calories brûlées pour une période donnée
  Future<double> getTotalCalories({
    required DateTime startTime,
    required DateTime endTime,
  }) async {
    try {
      final List<HealthDataPoint> healthData = await getHealthData(
        startTime: startTime,
        endTime: endTime,
        types: [HealthDataType.ACTIVE_ENERGY_BURNED],
      );

      double totalCalories = 0.0;
      for (final point in healthData) {
        if (point.value is NumericHealthValue) {
          totalCalories += (point.value as NumericHealthValue).numericValue;
        }
      }

      return totalCalories;
    } catch (e) {
      print('Erreur lors du calcul des calories totales: $e');
      return 0.0;
    }
  }

  /// Exporte un lot de sessions d'entraînement
  Future<bool> exportWorkoutSessions(List<WorkoutSession> sessions) async {
    if (!_initialized) {
      final initialized = await initialize();
      if (!initialized) return false;
    }

    int successCount = 0;
    for (final session in sessions) {
      final success = await exportWorkoutSession(session);
      if (success) successCount++;
    }

    print('$successCount/${sessions.length} sessions exportées vers Google Fit');
    return successCount == sessions.length;
  }

  /// Vérifie l'état de la connexion
  Future<Map<String, dynamic>> getConnectionStatus() async {
    return {
      'initialized': _initialized,
      'platform': Platform.isAndroid ? 'Google Fit' : 'Apple Health',
      'hasPermissions': await hasPermissions(),
      'supportedTypes': _dataTypes.map((type) => type.name).toList(),
    };
  }

  /// Nettoie les ressources
  void dispose() {
    _health = null;
    _initialized = false;
  }
}

/// Extensions pour faciliter l'utilisation
extension WorkoutSessionGoogleFit on WorkoutSession {
  /// Exporte cette session vers Google Fit
  Future<bool> exportToGoogleFit() async {
    return await GoogleFitService().exportWorkoutSession(this);
  }
}

/// Utilitaires pour la conversion des types d'exercices
class WorkoutTypeMapper {
  static final Map<String, HealthWorkoutActivityType> _exerciseTypeMap = {
    'strength': HealthWorkoutActivityType.STRENGTH_TRAINING,
    'yoga': HealthWorkoutActivityType.YOGA,
    'running': HealthWorkoutActivityType.RUNNING,
    'walking': HealthWorkoutActivityType.WALKING,
    'swimming': HealthWorkoutActivityType.SWIMMING,
  };

  static HealthWorkoutActivityType getWorkoutType(String? exerciseType) {
    if (exerciseType == null) return HealthWorkoutActivityType.STRENGTH_TRAINING;
    
    final type = _exerciseTypeMap[exerciseType.toLowerCase()];
    return type ?? HealthWorkoutActivityType.STRENGTH_TRAINING;
  }
}