import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_dimensions.dart';
import '../../../core/widgets/custom_card.dart' as custom_card;
import '../../../core/widgets/custom_gradient_button.dart';
import '../../../shared/models/workout_model.dart';
import '../../../shared/services/workout_service.dart';
import '../widgets/exercise_card.dart';
import '../widgets/timer_widget.dart';
import '../widgets/workout_progress.dart';

/// Écran d'entraînement reproduisant la PWA
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

class _WorkoutScreenState extends State<WorkoutScreen> {
  WorkoutPlan? _workoutPlan;
  int _currentDayIndex = 0;
  bool _isLoading = true;
  bool _stepMode = false;
  bool _autoMode = false;
  String _viewMode = 'workout';

  @override
  void initState() {
    super.initState();
    _loadWorkoutPlan();
  }

  Future<void> _loadWorkoutPlan() async {
    try {
      setState(() {
        _isLoading = true;
      });

      final workoutPlan = await WorkoutService.instance.getWorkoutPlan();
      final currentDay = await WorkoutService.instance.getCurrentDay();

      setState(() {
        _workoutPlan = workoutPlan;
        _currentDayIndex = currentDay;
        _isLoading = false;
      });
    } catch (e) {
      print('Erreur lors du chargement du plan d\'entraînement: $e');
      setState(() {
        _isLoading = false;
      });
    }
  }

  void _moveToNextDay() {
    if (_workoutPlan != null && _workoutPlan!.days.isNotEmpty) {
      setState(() {
        _currentDayIndex = (_currentDayIndex + 1) % _workoutPlan!.days.length;
      });
      WorkoutService.instance.setCurrentDay(_currentDayIndex);
    }
    setState(() {
      _stepMode = false;
    });
  }

  void _handleWorkoutComplete(WorkoutSession workoutData) {
    print('Entraînement terminé: ${workoutData.calories} calories');

    // Sauvegarder la session
    WorkoutService.instance.saveWorkoutSession(workoutData);

    _moveToNextDay();
    setState(() {
      _viewMode = 'history';
    });
  }

  void _startWorkout() {
    setState(() {
      _stepMode = true;
    });
  }

  void _backToMenu() {
    setState(() {
      _stepMode = false;
      _autoMode = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    if (_isLoading) {
      return Scaffold(
        backgroundColor: theme.colorScheme.background,
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              CircularProgressIndicator(color: AppColors.vermilion),
              const SizedBox(height: AppDimensions.spacingLarge),
              Text(
                'Chargement...',
                style: theme.textTheme.bodyLarge?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                ),
              ),
            ],
          ),
        ),
      );
    }

    if (_workoutPlan == null || _workoutPlan!.days.isEmpty) {
      return Scaffold(
        backgroundColor: theme.colorScheme.background,
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.error_outline,
                size: 64,
                color: theme.colorScheme.error,
              ),
              const SizedBox(height: AppDimensions.spacingLarge),
              Text(
                'Erreur de chargement',
                style: theme.textTheme.headlineSmall?.copyWith(
                  color: theme.colorScheme.error,
                ),
              ),
              const SizedBox(height: AppDimensions.spacingMedium),
              Text(
                'Impossible de charger le programme d\'entraînement',
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: AppDimensions.spacingLarge),
              CustomGradientButton(
                text: 'Réessayer',
                onPressed: _loadWorkoutPlan,
                icon: Icons.refresh,
              ),
            ],
          ),
        ),
      );
    }

    final currentDay = _workoutPlan!.days[_currentDayIndex];
    final isPlanAvailable =
        _workoutPlan != null &&
        _workoutPlan!.days.isNotEmpty &&
        _currentDayIndex < _workoutPlan!.days.length;

    return Scaffold(
      backgroundColor: theme.colorScheme.background,
      appBar: AppBar(
        title: Text(
          'PROJECT FAT LOSS',
          style: theme.textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        backgroundColor: AppColors.vermilion,
        foregroundColor: Colors.white,
        elevation: 0,
        actions: [
          IconButton(
            icon: Icon(widget.isDarkMode ? Icons.wb_sunny : Icons.nightlight),
            onPressed: widget.onThemeToggle,
            tooltip: widget.isDarkMode ? 'Mode clair' : 'Mode sombre',
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(AppDimensions.paddingLarge),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Header avec navigation
              _buildHeader(context),

              const SizedBox(height: AppDimensions.spacingLarge),

              // Contenu principal selon le mode
              if (_viewMode == 'workout') ...[
                if (isPlanAvailable) ...[
                  if (!_stepMode) ...[
                    _buildWorkoutOverview(context, currentDay),
                  ] else ...[
                    _buildStepWorkout(context, currentDay),
                  ],
                ] else ...[
                  _buildErrorView(context),
                ],
              ] else if (_viewMode == 'history') ...[
                _buildHistoryView(context),
              ] else ...[
                _buildWeightView(context),
              ],
            ],
          ),
        ),
      ),
      floatingActionButton: !_stepMode
          ? FloatingActionButton.extended(
              onPressed: isPlanAvailable ? _startWorkout : null,
              backgroundColor: AppColors.vermilion,
              foregroundColor: Colors.white,
              icon: const Icon(Icons.play_arrow),
              label: const Text('Commencer'),
            )
          : null,
    );
  }

  Widget _buildHeader(BuildContext context) {
    final theme = Theme.of(context);

    return custom_card.CustomCard(
      child: Column(
        children: [
          // Navigation des vues
          Row(
            children: [
              Expanded(
                child: _buildViewToggle(
                  context,
                  'workout',
                  '🏋️',
                  'Entraînement',
                  _viewMode == 'workout',
                ),
              ),
              const SizedBox(width: AppDimensions.spacingSmall),
              Expanded(
                child: _buildViewToggle(
                  context,
                  'history',
                  '📊',
                  'Historique',
                  _viewMode == 'history',
                  disabled: _stepMode,
                ),
              ),
              const SizedBox(width: AppDimensions.spacingSmall),
              Expanded(
                child: _buildViewToggle(
                  context,
                  'weight',
                  '⚖️',
                  'Poids',
                  _viewMode == 'weight',
                  disabled: _stepMode,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildViewToggle(
    BuildContext context,
    String value,
    String icon,
    String label,
    bool isActive, {
    bool disabled = false,
  }) {
    final theme = Theme.of(context);

    return GestureDetector(
      onTap: disabled
          ? null
          : () {
              setState(() {
                _viewMode = value;
              });
            },
      child: Container(
        padding: const EdgeInsets.symmetric(
          vertical: AppDimensions.paddingMedium,
          horizontal: AppDimensions.paddingSmall,
        ),
        decoration: BoxDecoration(
          color: isActive
              ? AppColors.vermilion.withOpacity(0.1)
              : Colors.transparent,
          borderRadius: BorderRadius.circular(AppDimensions.borderRadiusSmall),
          border: Border.all(
            color: isActive
                ? AppColors.vermilion
                : theme.colorScheme.outline.withOpacity(0.3),
          ),
        ),
        child: Column(
          children: [
            Text(icon, style: const TextStyle(fontSize: 20)),
            const SizedBox(height: AppDimensions.spacingSmall),
            Text(
              label,
              style: theme.textTheme.bodySmall?.copyWith(
                color: isActive
                    ? AppColors.vermilion
                    : disabled
                    ? theme.colorScheme.onSurface.withOpacity(0.38)
                    : theme.colorScheme.onSurface,
                fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildWorkoutOverview(BuildContext context, WorkoutDay day) {
    final theme = Theme.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Titre du jour
        Text(
          day.title,
          style: theme.textTheme.headlineSmall?.copyWith(
            fontWeight: FontWeight.bold,
            color: theme.colorScheme.onSurface,
          ),
        ),

        const SizedBox(height: AppDimensions.spacingLarge),

        // Bouton de démarrage
        CustomGradientButton(
          text: '💪 Commencer l\'entraînement',
          onPressed: _startWorkout,
          isFullWidth: true,
          icon: Icons.fitness_center,
        ),

        const SizedBox(height: AppDimensions.spacingLarge),

        // Liste des exercices
        Text(
          'Exercices du jour:',
          style: theme.textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),

        const SizedBox(height: AppDimensions.spacingMedium),

        ...day.exercises.map(
          (exercise) => Padding(
            padding: const EdgeInsets.only(bottom: AppDimensions.spacingMedium),
            child: ExerciseCard(
              exercise: exercise,
              onTap: () {
                // Navigation vers l'exercice spécifique
              },
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildStepWorkout(BuildContext context, WorkoutDay day) {
    return StepWorkoutWidget(
      day: day,
      onBack: _backToMenu,
      onComplete: _handleWorkoutComplete,
      autoMode: _autoMode,
    );
  }

  Widget _buildErrorView(BuildContext context) {
    final theme = Theme.of(context);

    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.error_outline, size: 64, color: theme.colorScheme.error),
          const SizedBox(height: AppDimensions.spacingLarge),
          Text(
            'Erreur de programme',
            style: theme.textTheme.headlineSmall?.copyWith(
              color: theme.colorScheme.error,
            ),
          ),
          const SizedBox(height: AppDimensions.spacingMedium),
          Text(
            'Le programme d\'entraînement n\'est pas disponible',
            style: theme.textTheme.bodyMedium?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildHistoryView(BuildContext context) {
    return FutureBuilder<List<WorkoutSession>>(
      future: WorkoutService.instance.getWorkoutHistory(),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        }

        if (snapshot.hasError) {
          return Center(
            child: Text(
              'Erreur lors du chargement de l\'historique',
              style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                color: Theme.of(context).colorScheme.error,
              ),
            ),
          );
        }

        final history = snapshot.data ?? [];

        if (history.isEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.history,
                  size: 64,
                  color: Theme.of(context).colorScheme.onSurfaceVariant,
                ),
                const SizedBox(height: AppDimensions.spacingLarge),
                Text(
                  'Aucun entraînement enregistré',
                  style: Theme.of(context).textTheme.headlineSmall,
                ),
                const SizedBox(height: AppDimensions.spacingMedium),
                Text(
                  'Commencez votre premier entraînement pour voir votre historique',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                  ),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          );
        }

        return ListView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: history.length,
          itemBuilder: (context, index) {
            final session = history[index];
            return custom_card.CustomCard(
              child: ListTile(
                leading: CircleAvatar(
                  backgroundColor: AppColors.vermilion,
                  child: Text(
                    '${index + 1}',
                    style: const TextStyle(color: Colors.white),
                  ),
                ),
                title: Text(session.title),
                subtitle: Text(
                  '${session.calories} calories • ${session.exerciseCount} exercices',
                ),
                trailing: Text(
                  '${session.date.day}/${session.date.month}/${session.date.year}',
                  style: Theme.of(context).textTheme.bodySmall,
                ),
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildWeightView(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.monitor_weight,
            size: 64,
            color: Theme.of(context).colorScheme.onSurfaceVariant,
          ),
          const SizedBox(height: AppDimensions.spacingLarge),
          Text(
            'Suivi du poids',
            style: Theme.of(context).textTheme.headlineSmall,
          ),
          const SizedBox(height: AppDimensions.spacingMedium),
          Text(
            'Fonctionnalité en cours de développement',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: Theme.of(context).colorScheme.onSurfaceVariant,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}

/// Widget pour l'entraînement étape par étape
class StepWorkoutWidget extends StatefulWidget {
  final WorkoutDay day;
  final VoidCallback onBack;
  final Function(WorkoutSession) onComplete;
  final bool autoMode;

  const StepWorkoutWidget({
    Key? key,
    required this.day,
    required this.onBack,
    required this.onComplete,
    this.autoMode = false,
  }) : super(key: key);

  @override
  State<StepWorkoutWidget> createState() => _StepWorkoutWidgetState();
}

class _StepWorkoutWidgetState extends State<StepWorkoutWidget> {
  int _currentExerciseIndex = 0;
  int _currentSetIndex = 0;
  bool _isPaused = false;
  int _totalCalories = 0;
  bool _workoutCompleted = false;

  Exercise get currentExercise => widget.day.exercises[_currentExerciseIndex];

  void _nextSet() {
    if (_currentSetIndex < currentExercise.totalSets - 1) {
      setState(() {
        _currentSetIndex++;
        _isPaused = true;
      });
    } else {
      _nextExercise();
    }
  }

  void _nextExercise() {
    if (_currentExerciseIndex < widget.day.exercises.length - 1) {
      setState(() {
        _currentExerciseIndex++;
        _currentSetIndex = 0;
        _isPaused = true;
      });
    } else {
      _completeWorkout();
    }
  }

  void _completeWorkout() {
    final session = WorkoutSession(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      title: widget.day.title,
      date: DateTime.now(),
      calories: _totalCalories,
      weightLifted: _calculateTotalWeight(),
      exerciseCount: widget.day.exercises.length,
      exercises: widget.day.exercises
          .map(
            (e) => WorkoutExercise(
              name: e.name,
              sets: e.totalSets,
              weightLifted: WorkoutService.instance.calculateWeight(e.equip),
            ),
          )
          .toList(),
      duration: widget.day.exercises.length * 180, // Estimation
      fatBurnerMode: widget.autoMode,
    );

    widget.onComplete(session);
  }

  int _calculateTotalWeight() {
    return widget.day.exercises.fold(0, (total, exercise) {
      final weight = WorkoutService.instance.calculateWeight(exercise.equip);
      final sets = WorkoutService.instance.parseSets(exercise.sets);
      return total + (weight * sets * exercise.nbRep);
    });
  }

  void _addCalories(int calories) {
    setState(() {
      _totalCalories += calories;
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Column(
      children: [
        // Header avec progression
        WorkoutProgressWidget(
          currentExercise: _currentExerciseIndex + 1,
          totalExercises: widget.day.exercises.length,
          currentSet: _currentSetIndex + 1,
          totalSets: currentExercise.totalSets,
          calories: _totalCalories,
        ),

        const SizedBox(height: AppDimensions.spacingLarge),

        // Contenu de l'exercice
        if (!_isPaused) ...[
          ExerciseCard(
            exercise: currentExercise,
            isActive: true,
            setNumber: _currentSetIndex + 1,
            totalSets: currentExercise.totalSets,
            onComplete: () {
              final calories = currentExercise.caloriesPerSet != null
                  ? (currentExercise.caloriesPerSet![0] +
                            currentExercise.caloriesPerSet![1]) ~/
                        2
                  : 10;
              _addCalories(calories);
              _nextSet();
            },
          ),
        ] else ...[
          // Écran de pause
          TimerWidget(
            duration: widget.autoMode ? 20 : 15,
            onComplete: () {
              setState(() {
                _isPaused = false;
              });
            },
            onSkip: () {
              setState(() {
                _isPaused = false;
              });
            },
            nextExercise:
                _currentExerciseIndex < widget.day.exercises.length - 1
                ? widget.day.exercises[_currentExerciseIndex + 1]
                : null,
          ),
        ],

        // Boutons de contrôle
        const SizedBox(height: AppDimensions.spacingLarge),

        Row(
          children: [
            Expanded(
              child: CustomGradientButton(
                text: 'Retour',
                onPressed: widget.onBack,
                icon: Icons.arrow_back,
              ),
            ),
            const SizedBox(width: AppDimensions.spacingMedium),
            Expanded(
              child: CustomGradientButton(
                text: 'Terminer',
                onPressed: _completeWorkout,
                icon: Icons.check,
              ),
            ),
          ],
        ),
      ],
    );
  }
}
