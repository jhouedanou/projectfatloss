import 'package:flutter/material.dart';

/// Modèle représentant un exercice
class Exercise {
  final String name;
  final String sets;
  final String? equip;
  final String? desc;
  final List<int>? caloriesPerSet;
  final int totalSets;
  final int nbRep;
  final bool? timer;
  final int? duration;
  final GoogleFitActivity? googleFitActivity;

  Exercise({
    required this.name,
    required this.sets,
    this.equip,
    this.desc,
    this.caloriesPerSet,
    required this.totalSets,
    required this.nbRep,
    this.timer,
    this.duration,
    this.googleFitActivity,
  });

  factory Exercise.fromJson(Map<String, dynamic> json) {
    return Exercise(
      name: json['name'] ?? '',
      sets: json['sets'] ?? '',
      equip: json['equip'],
      desc: json['desc'],
      caloriesPerSet: json['caloriesPerSet'] != null
          ? List<int>.from(json['caloriesPerSet'])
          : null,
      totalSets: json['totalSets'] ?? 1,
      nbRep: json['nbRep'] ?? 0,
      timer: json['timer'],
      duration: json['duration'],
      googleFitActivity: json['googleFitActivity'] != null
          ? GoogleFitActivity.fromJson(json['googleFitActivity'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'sets': sets,
      'equip': equip,
      'desc': desc,
      'caloriesPerSet': caloriesPerSet,
      'totalSets': totalSets,
      'nbRep': nbRep,
      'timer': timer,
      'duration': duration,
      'googleFitActivity': googleFitActivity?.toJson(),
    };
  }

  Exercise copyWith({
    String? name,
    String? sets,
    String? equip,
    String? desc,
    List<int>? caloriesPerSet,
    int? totalSets,
    int? nbRep,
    bool? timer,
    int? duration,
    GoogleFitActivity? googleFitActivity,
  }) {
    return Exercise(
      name: name ?? this.name,
      sets: sets ?? this.sets,
      equip: equip ?? this.equip,
      desc: desc ?? this.desc,
      caloriesPerSet: caloriesPerSet ?? this.caloriesPerSet,
      totalSets: totalSets ?? this.totalSets,
      nbRep: nbRep ?? this.nbRep,
      timer: timer ?? this.timer,
      duration: duration ?? this.duration,
      googleFitActivity: googleFitActivity ?? this.googleFitActivity,
    );
  }
}

class GoogleFitActivity {
  final String type;
  final String name;
  final List<String> muscleGroups;

  GoogleFitActivity({
    required this.type,
    required this.name,
    required this.muscleGroups,
  });

  factory GoogleFitActivity.fromJson(Map<String, dynamic> json) {
    return GoogleFitActivity(
      type: json['type'] ?? '',
      name: json['name'] ?? '',
      muscleGroups: List<String>.from(json['muscleGroups'] ?? []),
    );
  }

  Map<String, dynamic> toJson() {
    return {'type': type, 'name': name, 'muscleGroups': muscleGroups};
  }
}

/// Modèle représentant un jour d'entraînement
class WorkoutDay {
  final String title;
  final List<Exercise> exercises;

  WorkoutDay({required this.title, required this.exercises});

  factory WorkoutDay.fromJson(Map<String, dynamic> json) {
    return WorkoutDay(
      title: json['title'] ?? '',
      exercises:
          (json['exercises'] as List<dynamic>?)
              ?.map((e) => Exercise.fromJson(e))
              .toList() ??
          [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'title': title,
      'exercises': exercises.map((e) => e.toJson()).toList(),
    };
  }

  WorkoutDay copyWith({String? title, List<Exercise>? exercises}) {
    return WorkoutDay(
      title: title ?? this.title,
      exercises: exercises ?? this.exercises,
    );
  }
}

/// Modèle représentant un plan d'entraînement complet
class WorkoutPlan {
  final List<WorkoutDay> days;

  WorkoutPlan({required this.days});

  factory WorkoutPlan.fromJson(Map<String, dynamic> json) {
    return WorkoutPlan(
      days:
          (json['days'] as List<dynamic>?)
              ?.map((e) => WorkoutDay.fromJson(e))
              .toList() ??
          [],
    );
  }

  Map<String, dynamic> toJson() {
    return {'days': days.map((e) => e.toJson()).toList()};
  }
}

class WorkoutSession {
  final String id;
  final String title;
  final DateTime date;
  final int calories;
  final int weightLifted;
  final int exerciseCount;
  final List<WorkoutExercise> exercises;
  final int duration;
  final bool fatBurnerMode;

  WorkoutSession({
    required this.id,
    required this.title,
    required this.date,
    required this.calories,
    required this.weightLifted,
    required this.exerciseCount,
    required this.exercises,
    required this.duration,
    this.fatBurnerMode = false,
  });

  factory WorkoutSession.fromJson(Map<String, dynamic> json) {
    return WorkoutSession(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      date: DateTime.parse(json['date']),
      calories: json['calories'] ?? 0,
      weightLifted: json['weightLifted'] ?? 0,
      exerciseCount: json['exerciseCount'] ?? 0,
      exercises:
          (json['exercises'] as List<dynamic>?)
              ?.map((e) => WorkoutExercise.fromJson(e))
              .toList() ??
          [],
      duration: json['duration'] ?? 0,
      fatBurnerMode: json['fatBurnerMode'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'date': date.toIso8601String(),
      'calories': calories,
      'weightLifted': weightLifted,
      'exerciseCount': exerciseCount,
      'exercises': exercises.map((e) => e.toJson()).toList(),
      'duration': duration,
      'fatBurnerMode': fatBurnerMode,
    };
  }
}

class WorkoutExercise {
  final String name;
  final int sets;
  final int weightLifted;

  WorkoutExercise({
    required this.name,
    required this.sets,
    required this.weightLifted,
  });

  factory WorkoutExercise.fromJson(Map<String, dynamic> json) {
    return WorkoutExercise(
      name: json['name'] ?? '',
      sets: json['sets'] ?? 0,
      weightLifted: json['weightLifted'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {'name': name, 'sets': sets, 'weightLifted': weightLifted};
  }
}

class WeightEntry {
  final String id;
  final double weight;
  final DateTime date;
  final String? notes;

  WeightEntry({
    required this.id,
    required this.weight,
    required this.date,
    this.notes,
  });

  factory WeightEntry.fromJson(Map<String, dynamic> json) {
    return WeightEntry(
      id: json['id'] ?? '',
      weight: (json['weight'] ?? 0).toDouble(),
      date: DateTime.parse(json['date']),
      notes: json['notes'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'weight': weight,
      'date': date.toIso8601String(),
      'notes': notes,
    };
  }
}
