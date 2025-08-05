import 'package:flutter/material.dart';

/// Modèle représentant un exercice
class Exercise {
  final String id;
  final String name;
  final String description;
  final String imageUrl;
  final String videoUrl;
  final int duration; // en secondes
  final int sets;
  final int reps;
  final String category;
  final String difficulty;
  final List<String> muscles;
  final String instructions;
  final bool isCompleted;

  const Exercise({
    required this.id,
    required this.name,
    required this.description,
    required this.imageUrl,
    required this.videoUrl,
    required this.duration,
    required this.sets,
    required this.reps,
    required this.category,
    required this.difficulty,
    required this.muscles,
    required this.instructions,
    this.isCompleted = false,
  });

  Exercise copyWith({
    String? id,
    String? name,
    String? description,
    String? imageUrl,
    String? videoUrl,
    int? duration,
    int? sets,
    int? reps,
    String? category,
    String? difficulty,
    List<String>? muscles,
    String? instructions,
    bool? isCompleted,
  }) {
    return Exercise(
      id: id ?? this.id,
      name: name ?? this.name,
      description: description ?? this.description,
      imageUrl: imageUrl ?? this.imageUrl,
      videoUrl: videoUrl ?? this.videoUrl,
      duration: duration ?? this.duration,
      sets: sets ?? this.sets,
      reps: reps ?? this.reps,
      category: category ?? this.category,
      difficulty: difficulty ?? this.difficulty,
      muscles: muscles ?? this.muscles,
      instructions: instructions ?? this.instructions,
      isCompleted: isCompleted ?? this.isCompleted,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'imageUrl': imageUrl,
      'videoUrl': videoUrl,
      'duration': duration,
      'sets': sets,
      'reps': reps,
      'category': category,
      'difficulty': difficulty,
      'muscles': muscles,
      'instructions': instructions,
      'isCompleted': isCompleted,
    };
  }

  factory Exercise.fromJson(Map<String, dynamic> json) {
    return Exercise(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String,
      imageUrl: json['imageUrl'] as String,
      videoUrl: json['videoUrl'] as String,
      duration: json['duration'] as int,
      sets: json['sets'] as int,
      reps: json['reps'] as int,
      category: json['category'] as String,
      difficulty: json['difficulty'] as String,
      muscles: List<String>.from(json['muscles']),
      instructions: json['instructions'] as String,
      isCompleted: json['isCompleted'] as bool? ?? false,
    );
  }
}

/// Modèle représentant un jour d'entraînement
class WorkoutDay {
  final String id;
  final String name;
  final String description;
  final List<Exercise> exercises;
  final int totalDuration; // en secondes
  final String difficulty;
  final String category;
  final bool isCompleted;
  final DateTime? completedAt;
  final int caloriesBurned;

  const WorkoutDay({
    required this.id,
    required this.name,
    required this.description,
    required this.exercises,
    required this.totalDuration,
    required this.difficulty,
    required this.category,
    this.isCompleted = false,
    this.completedAt,
    this.caloriesBurned = 0,
  });

  WorkoutDay copyWith({
    String? id,
    String? name,
    String? description,
    List<Exercise>? exercises,
    int? totalDuration,
    String? difficulty,
    String? category,
    bool? isCompleted,
    DateTime? completedAt,
    int? caloriesBurned,
  }) {
    return WorkoutDay(
      id: id ?? this.id,
      name: name ?? this.name,
      description: description ?? this.description,
      exercises: exercises ?? this.exercises,
      totalDuration: totalDuration ?? this.totalDuration,
      difficulty: difficulty ?? this.difficulty,
      category: category ?? this.category,
      isCompleted: isCompleted ?? this.isCompleted,
      completedAt: completedAt ?? this.completedAt,
      caloriesBurned: caloriesBurned ?? this.caloriesBurned,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'exercises': exercises.map((e) => e.toJson()).toList(),
      'totalDuration': totalDuration,
      'difficulty': difficulty,
      'category': category,
      'isCompleted': isCompleted,
      'completedAt': completedAt?.toIso8601String(),
      'caloriesBurned': caloriesBurned,
    };
  }

  factory WorkoutDay.fromJson(Map<String, dynamic> json) {
    return WorkoutDay(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String,
      exercises: (json['exercises'] as List)
          .map((e) => Exercise.fromJson(e as Map<String, dynamic>))
          .toList(),
      totalDuration: json['totalDuration'] as int,
      difficulty: json['difficulty'] as String,
      category: json['category'] as String,
      isCompleted: json['isCompleted'] as bool? ?? false,
      completedAt: json['completedAt'] != null
          ? DateTime.parse(json['completedAt'] as String)
          : null,
      caloriesBurned: json['caloriesBurned'] as int? ?? 0,
    );
  }
}

/// Modèle représentant un plan d'entraînement complet
class WorkoutPlan {
  final String id;
  final String name;
  final String description;
  final List<WorkoutDay> days;
  final int totalDays;
  final int completedDays;
  final DateTime startDate;
  final DateTime? endDate;
  final String difficulty;
  final int totalCaloriesBurned;

  const WorkoutPlan({
    required this.id,
    required this.name,
    required this.description,
    required this.days,
    required this.totalDays,
    this.completedDays = 0,
    required this.startDate,
    this.endDate,
    required this.difficulty,
    this.totalCaloriesBurned = 0,
  });

  WorkoutPlan copyWith({
    String? id,
    String? name,
    String? description,
    List<WorkoutDay>? days,
    int? totalDays,
    int? completedDays,
    DateTime? startDate,
    DateTime? endDate,
    String? difficulty,
    int? totalCaloriesBurned,
  }) {
    return WorkoutPlan(
      id: id ?? this.id,
      name: name ?? this.name,
      description: description ?? this.description,
      days: days ?? this.days,
      totalDays: totalDays ?? this.totalDays,
      completedDays: completedDays ?? this.completedDays,
      startDate: startDate ?? this.startDate,
      endDate: endDate ?? this.endDate,
      difficulty: difficulty ?? this.difficulty,
      totalCaloriesBurned: totalCaloriesBurned ?? this.totalCaloriesBurned,
    );
  }

  double get progressPercentage => totalDays > 0 ? completedDays / totalDays : 0.0;

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'days': days.map((d) => d.toJson()).toList(),
      'totalDays': totalDays,
      'completedDays': completedDays,
      'startDate': startDate.toIso8601String(),
      'endDate': endDate?.toIso8601String(),
      'difficulty': difficulty,
      'totalCaloriesBurned': totalCaloriesBurned,
    };
  }

  factory WorkoutPlan.fromJson(Map<String, dynamic> json) {
    return WorkoutPlan(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String,
      days: (json['days'] as List)
          .map((d) => WorkoutDay.fromJson(d as Map<String, dynamic>))
          .toList(),
      totalDays: json['totalDays'] as int,
      completedDays: json['completedDays'] as int? ?? 0,
      startDate: DateTime.parse(json['startDate'] as String),
      endDate: json['endDate'] != null
          ? DateTime.parse(json['endDate'] as String)
          : null,
      difficulty: json['difficulty'] as String,
      totalCaloriesBurned: json['totalCaloriesBurned'] as int? ?? 0,
    );
  }
} 