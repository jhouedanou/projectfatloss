import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_dimensions.dart';
import '../../../core/constants/app_typography.dart';
import '../../../core/widgets/app_header.dart';
import '../../../core/widgets/custom_card.dart';
import '../../../core/widgets/custom_gradient_button.dart';
import '../../../shared/models/workout_model.dart';
import '../../../shared/services/workout_data_service.dart';
import '../../../shared/services/audio_service.dart';
import '../../../shared/services/notification_service.dart';
import '../widgets/exercise_card.dart';
import '../widgets/workout_progress.dart';
import '../widgets/timer_widget.dart';

/// Écran d'entraînement principal reproduisant la PWA
class WorkoutScreen extends StatefulWidget {
  final String dayId;
  final bool isDarkMode;
  final VoidCallback onThemeToggle;

  const WorkoutScreen({
    Key? key,
    required this.dayId,
    required this.isDarkMode,
    required this.onThemeToggle,
  }) : super(key: key);

  @override
  State<WorkoutScreen> createState() => _WorkoutScreenState();
}

class _WorkoutScreenState extends State<WorkoutScreen>
    with TickerProviderStateMixin {
  WorkoutDay? _workoutDay;
  int _currentExerciseIndex = 0;
  bool _isWorkoutStarted = false;
  bool _isWorkoutPaused = false;
  bool _isWorkoutCompleted = false;
  int _totalDuration = 0;
  int _elapsedTime = 0;
  late AnimationController _timerController;
  late AnimationController _progressController;

  @override
  void initState() {
    super.initState();
    _loadWorkoutDay();
    _initializeAnimations();
  }

  @override
  void dispose() {
    _timerController.dispose();
    _progressController.dispose();
    super.dispose();
  }

  /// Charge les données du jour d'entraînement
  Future<void> _loadWorkoutDay() async {
    final workoutDay = await WorkoutDataService.getWorkoutDay(widget.dayId);
    if (workoutDay != null) {
      setState(() {
        _workoutDay = workoutDay;
        _totalDuration = workoutDay.totalDuration;
      });
    }
  }

  /// Initialise les animations
  void _initializeAnimations() {
    _timerController = AnimationController(
      duration: const Duration(seconds: 1),
      vsync: this,
    );

    _progressController = AnimationController(
      duration: const Duration(milliseconds: 500),
      vsync: this,
    );

    _timerController.addListener(() {
      if (_isWorkoutStarted && !_isWorkoutPaused) {
        setState(() {
          _elapsedTime++;
        });
      }
    });
  }

  /// Démarre l'entraînement
  Future<void> _startWorkout() async {
    if (_workoutDay == null) return;

    setState(() {
      _isWorkoutStarted = true;
      _isWorkoutPaused = false;
    });

    // Jouer le son de démarrage
    await AudioService.playWorkoutStartSound();

    // Afficher la notification de démarrage
    await NotificationService.showWorkoutStartNotification(
      title: 'Entraînement démarré !',
      body: 'Bonne séance avec ${_workoutDay!.name}',
    );

    // Démarrer le timer
    _timerController.repeat();

    // Haptic feedback
    HapticFeedback.mediumImpact();
  }

  /// Met en pause l'entraînement
  void _pauseWorkout() {
    setState(() {
      _isWorkoutPaused = true;
    });
    _timerController.stop();
    HapticFeedback.lightImpact();
  }

  /// Reprend l'entraînement
  void _resumeWorkout() {
    setState(() {
      _isWorkoutPaused = false;
    });
    _timerController.repeat();
    HapticFeedback.lightImpact();
  }

  /// Termine l'entraînement
  Future<void> _completeWorkout() async {
    if (_workoutDay == null) return;

    setState(() {
      _isWorkoutCompleted = true;
      _isWorkoutStarted = false;
      _isWorkoutPaused = false;
    });

    _timerController.stop();

    // Enregistrer la session dans la base de données
    await WorkoutDataService.recordWorkoutSession(
      dayId: _workoutDay!.id,
      startTime: DateTime.now().subtract(Duration(seconds: _elapsedTime)),
      endTime: DateTime.now(),
      duration: _elapsedTime,
      caloriesBurned: _calculateCaloriesBurned(),
      exercisesCompleted: _workoutDay!.exercises.length,
      totalExercises: _workoutDay!.exercises.length,
      notes: 'Entraînement terminé avec succès',
    );

    // Mettre à jour le jour d'entraînement comme terminé
    final updatedDay = _workoutDay!.copyWith(
      isCompleted: true,
      completedAt: DateTime.now(),
      caloriesBurned: _calculateCaloriesBurned(),
    );
    await WorkoutDataService.updateWorkoutDay(updatedDay);

    // Jouer le son de fin
    await AudioService.playWorkoutCompleteSound();

    // Afficher la notification de fin
    await NotificationService.showWorkoutCompleteNotification(
      title: 'Entraînement terminé !',
      body: 'Félicitations ! Vous avez terminé ${_workoutDay!.name}',
    );

    // Haptic feedback
    HapticFeedback.heavyImpact();

    // Animation de progression
    _progressController.forward();
  }

  /// Calcule les calories brûlées
  int _calculateCaloriesBurned() {
    if (_workoutDay == null) return 0;
    
    // Estimation basée sur la durée et l'intensité
    const weight = 70; // Poids moyen en kg
    return WorkoutDataService.calculateDayCalories(_workoutDay!, weight);
  }

  /// Passe à l'exercice suivant
  void _nextExercise() {
    if (_workoutDay == null) return;

    if (_currentExerciseIndex < _workoutDay!.exercises.length - 1) {
      setState(() {
        _currentExerciseIndex++;
      });
      HapticFeedback.selectionClick();
    } else {
      _completeWorkout();
    }
  }

  /// Passe à l'exercice précédent
  void _previousExercise() {
    if (_currentExerciseIndex > 0) {
      setState(() {
        _currentExerciseIndex--;
      });
      HapticFeedback.selectionClick();
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_workoutDay == null) {
      return Scaffold(
        backgroundColor: Theme.of(context).colorScheme.background,
        appBar: AppHeader(
          title: 'Entraînement',
          showBackButton: true,
        ),
        body: const Center(
          child: Text('Entraînement non trouvé'),
        ),
      );
    }

    final currentExercise = _workoutDay!.exercises[_currentExerciseIndex];
    final progress = _elapsedTime / _totalDuration;
    final remainingTime = _totalDuration - _elapsedTime;

    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.background,
      appBar: AppHeader(
        title: _workoutDay!.name,
        showBackButton: true,
      ),
      body: Column(
        children: [
          // Barre de progression
          WorkoutProgress(
            progress: progress,
            elapsedTime: _elapsedTime,
            totalTime: _totalDuration,
            isPaused: _isWorkoutPaused,
          ),
          
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(AppDimensions.paddingLarge),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Timer principal
                  TimerWidget(
                    remainingTime: remainingTime,
                    isPaused: _isWorkoutPaused,
                    isCompleted: _isWorkoutCompleted,
                  ),
                  
                  const SizedBox(height: AppDimensions.spacingLarge),
                  
                  // Carte de l'exercice actuel
                  ExerciseCard(
                    exercise: currentExercise,
                    isActive: _isWorkoutStarted && !_isWorkoutPaused,
                    isCompleted: _isWorkoutCompleted,
                  ),
                  
                  const SizedBox(height: AppDimensions.spacingLarge),
                  
                  // Contrôles
                  _buildControls(),
                  
                  const SizedBox(height: AppDimensions.spacingLarge),
                  
                  // Liste des exercices
                  _buildExerciseList(),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildControls() {
    if (_isWorkoutCompleted) {
      return CustomGradientButton(
        onPressed: () => Navigator.of(context).pop(),
        text: 'Retour à l\'accueil',
        gradient: AppColors.successGradient,
      );
    }

    return Row(
      children: [
        // Bouton précédent
        if (_currentExerciseIndex > 0)
          Expanded(
            child: CustomGradientButton(
              onPressed: _previousExercise,
              text: 'Précédent',
              gradient: AppColors.secondaryGradient,
            ),
          ),
        
        if (_currentExerciseIndex > 0)
          const SizedBox(width: AppDimensions.spacingMedium),
        
        // Bouton principal
        Expanded(
          flex: 2,
          child: _isWorkoutStarted
              ? _buildMainControlButton()
              : CustomGradientButton(
                  onPressed: _startWorkout,
                  text: 'Commencer',
                  gradient: AppColors.primaryGradient,
                ),
        ),
        
        // Bouton suivant
        if (_currentExerciseIndex < _workoutDay!.exercises.length - 1) ...[
          const SizedBox(width: AppDimensions.spacingMedium),
          Expanded(
            child: CustomGradientButton(
              onPressed: _nextExercise,
              text: 'Suivant',
              gradient: AppColors.secondaryGradient,
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildMainControlButton() {
    return CustomGradientButton(
      onPressed: _isWorkoutPaused ? _resumeWorkout : _pauseWorkout,
      text: _isWorkoutPaused ? 'Reprendre' : 'Pause',
      gradient: _isWorkoutPaused 
          ? AppColors.successGradient 
          : AppColors.warningGradient,
    );
  }

  Widget _buildExerciseList() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Exercices (${_workoutDay!.exercises.length})',
          style: AppTypography.h3.copyWith(
            color: Theme.of(context).colorScheme.onBackground,
          ),
        ),
        const SizedBox(height: AppDimensions.spacingMedium),
        ..._workoutDay!.exercises.asMap().entries.map((entry) {
          final index = entry.key;
          final exercise = entry.value;
          final isCurrent = index == _currentExerciseIndex;
          final isCompleted = index < _currentExerciseIndex;

          return Padding(
            padding: const EdgeInsets.only(bottom: AppDimensions.spacingSmall),
            child: ExerciseCard(
              exercise: exercise,
              isActive: isCurrent && _isWorkoutStarted && !_isWorkoutPaused,
              isCompleted: isCompleted,
              isCompact: true,
            ),
          );
        }).toList(),
      ],
    );
  }
} 