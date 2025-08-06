import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/workout_model.dart';
import '../data/default_workout_data.dart';

/// Service de gestion des entraînements
class WorkoutService {
  static const String _workoutPlanKey = 'custom_workout_plan';
  static const String _workoutHistoryKey = 'workout_history';
  static const String _currentDayKey = 'current_workout_day';

  static WorkoutService? _instance;
  static WorkoutService get instance => _instance ??= WorkoutService._();

  WorkoutService._();

  /// Récupérer le programme d'entraînement (personnalisé ou par défaut)
  Future<WorkoutPlan> getWorkoutPlan() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final storedPlan = prefs.getString(_workoutPlanKey);

      if (storedPlan != null) {
        final json = jsonDecode(storedPlan);
        return WorkoutPlan.fromJson(json);
      } else {
        // Retourner le plan par défaut
        return _getDefaultWorkoutPlan();
      }
    } catch (e) {
      print('Erreur lors de la récupération du programme: $e');
      return _getDefaultWorkoutPlan();
    }
  }

  /// Sauvegarder un programme d'entraînement personnalisé
  Future<bool> saveWorkoutPlan(WorkoutPlan workoutPlan) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final json = jsonEncode(workoutPlan.toJson());
      return await prefs.setString(_workoutPlanKey, json);
    } catch (e) {
      print('Erreur lors de la sauvegarde du programme: $e');
      return false;
    }
  }

  /// Modifier un exercice dans le programme
  Future<bool> updateExercise(
    int dayIndex,
    int exerciseIndex,
    Exercise updatedExercise,
  ) async {
    try {
      final workoutPlan = await getWorkoutPlan();

      if (dayIndex < 0 ||
          dayIndex >= workoutPlan.days.length ||
          exerciseIndex < 0 ||
          exerciseIndex >= workoutPlan.days[dayIndex].exercises.length) {
        print('Index de jour ou d\'exercice invalide');
        return false;
      }

      // Mettre à jour l'exercice
      final updatedDays = List<WorkoutDay>.from(workoutPlan.days);
      final updatedExercises = List<Exercise>.from(
        updatedDays[dayIndex].exercises,
      );
      updatedExercises[exerciseIndex] = updatedExercise;

      updatedDays[dayIndex] = updatedDays[dayIndex].copyWith(
        exercises: updatedExercises,
      );

      final updatedPlan = WorkoutPlan(days: updatedDays);
      return await saveWorkoutPlan(updatedPlan);
    } catch (e) {
      print('Erreur lors de la mise à jour de l\'exercice: $e');
      return false;
    }
  }

  /// Réinitialiser le programme aux valeurs par défaut
  Future<bool> resetWorkoutPlan() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      return await prefs.remove(_workoutPlanKey);
    } catch (e) {
      print('Erreur lors de la réinitialisation du programme: $e');
      return false;
    }
  }

  /// Ajouter un nouvel exercice à un jour
  Future<bool> addExercise(int dayIndex, Exercise newExercise) async {
    try {
      final workoutPlan = await getWorkoutPlan();

      if (dayIndex < 0 || dayIndex >= workoutPlan.days.length) {
        print('Index de jour invalide');
        return false;
      }

      final updatedDays = List<WorkoutDay>.from(workoutPlan.days);
      final updatedExercises = List<Exercise>.from(
        updatedDays[dayIndex].exercises,
      );
      updatedExercises.add(newExercise);

      updatedDays[dayIndex] = updatedDays[dayIndex].copyWith(
        exercises: updatedExercises,
      );

      final updatedPlan = WorkoutPlan(days: updatedDays);
      return await saveWorkoutPlan(updatedPlan);
    } catch (e) {
      print('Erreur lors de l\'ajout de l\'exercice: $e');
      return false;
    }
  }

  /// Supprimer un exercice d'un jour
  Future<bool> removeExercise(int dayIndex, int exerciseIndex) async {
    try {
      final workoutPlan = await getWorkoutPlan();

      if (dayIndex < 0 ||
          dayIndex >= workoutPlan.days.length ||
          exerciseIndex < 0 ||
          exerciseIndex >= workoutPlan.days[dayIndex].exercises.length) {
        print('Index de jour ou d\'exercice invalide');
        return false;
      }

      final updatedDays = List<WorkoutDay>.from(workoutPlan.days);
      final updatedExercises = List<Exercise>.from(
        updatedDays[dayIndex].exercises,
      );
      updatedExercises.removeAt(exerciseIndex);

      updatedDays[dayIndex] = updatedDays[dayIndex].copyWith(
        exercises: updatedExercises,
      );

      final updatedPlan = WorkoutPlan(days: updatedDays);
      return await saveWorkoutPlan(updatedPlan);
    } catch (e) {
      print('Erreur lors de la suppression de l\'exercice: $e');
      return false;
    }
  }

  /// Récupérer le jour d'entraînement actuel
  Future<int> getCurrentDay() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      return prefs.getInt(_currentDayKey) ?? 0;
    } catch (e) {
      print('Erreur lors de la récupération du jour actuel: $e');
      return 0;
    }
  }

  /// Sauvegarder le jour d'entraînement actuel
  Future<bool> setCurrentDay(int dayIndex) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      return await prefs.setInt(_currentDayKey, dayIndex);
    } catch (e) {
      print('Erreur lors de la sauvegarde du jour actuel: $e');
      return false;
    }
  }

  /// Sauvegarder une session d'entraînement
  Future<bool> saveWorkoutSession(WorkoutSession session) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final history = await getWorkoutHistory();
      history.add(session);

      final jsonList = history.map((s) => s.toJson()).toList();
      final json = jsonEncode(jsonList);

      return await prefs.setString(_workoutHistoryKey, json);
    } catch (e) {
      print('Erreur lors de la sauvegarde de la session: $e');
      return false;
    }
  }

  /// Récupérer l'historique des entraînements
  Future<List<WorkoutSession>> getWorkoutHistory() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final storedHistory = prefs.getString(_workoutHistoryKey);

      if (storedHistory != null) {
        final jsonList = jsonDecode(storedHistory) as List<dynamic>;
        return jsonList.map((json) => WorkoutSession.fromJson(json)).toList();
      }

      return [];
    } catch (e) {
      print('Erreur lors de la récupération de l\'historique: $e');
      return [];
    }
  }

  /// Calculer le poids soulevé à partir de l'équipement
  int calculateWeight(String? equipment) {
    if (equipment == null) return 0;

    final match = RegExp(
      r'(\d+)\s*kg',
      caseSensitive: false,
    ).firstMatch(equipment);
    return match != null ? int.parse(match.group(1)!) : 0;
  }

  /// Parser le nombre de séries à partir de la chaîne
  int parseSets(String sets) {
    final match = RegExp(
      r'(\d+)\s*[x×]',
      caseSensitive: false,
    ).firstMatch(sets);
    return match != null ? int.parse(match.group(1)!) : 1;
  }

  /// Obtenir le plan d'entraînement par défaut
  WorkoutPlan _getDefaultWorkoutPlan() {
    return DefaultWorkoutData.defaultWorkoutPlan;
  }
}
