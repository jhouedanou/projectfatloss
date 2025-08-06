import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_dimensions.dart';
import '../../../core/constants/app_typography.dart';

/// Widget pour afficher la progression de l'entraînement
class WorkoutProgressWidget extends StatelessWidget {
  final int currentExercise;
  final int totalExercises;
  final int currentSet;
  final int totalSets;
  final int calories;

  const WorkoutProgressWidget({
    Key? key,
    required this.currentExercise,
    required this.totalExercises,
    required this.currentSet,
    required this.totalSets,
    required this.calories,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final exerciseProgress = currentExercise / totalExercises;
    final setProgress = currentSet / totalSets;

    return Container(
      padding: const EdgeInsets.all(AppDimensions.paddingMedium),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(AppDimensions.borderRadiusMedium),
        border: Border.all(color: theme.colorScheme.outline.withOpacity(0.2)),
      ),
      child: Column(
        children: [
          // Progression générale
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Progression',
                      style: theme.textTheme.titleSmall?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: AppDimensions.spacingSmall),
                    LinearProgressIndicator(
                      value: exerciseProgress,
                      backgroundColor: theme.colorScheme.surfaceVariant,
                      valueColor: AlwaysStoppedAnimation<Color>(
                        AppColors.vermilion,
                      ),
                    ),
                    const SizedBox(height: AppDimensions.spacingSmall),
                    Text(
                      'Exercice $currentExercise/$totalExercises',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: theme.colorScheme.onSurfaceVariant,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: AppDimensions.spacingLarge),
              // Calories
              Container(
                padding: const EdgeInsets.all(AppDimensions.paddingSmall),
                decoration: BoxDecoration(
                  color: AppColors.vermilion.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(
                    AppDimensions.borderRadiusSmall,
                  ),
                ),
                child: Column(
                  children: [
                    Text(
                      '$calories',
                      style: theme.textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: AppColors.vermilion,
                      ),
                    ),
                    Text(
                      'CALORIES',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: AppColors.vermilion,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),

          const SizedBox(height: AppDimensions.spacingMedium),

          // Progression de la série
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Série actuelle',
                      style: theme.textTheme.titleSmall?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: AppDimensions.spacingSmall),
                    LinearProgressIndicator(
                      value: setProgress,
                      backgroundColor: theme.colorScheme.surfaceVariant,
                      valueColor: AlwaysStoppedAnimation<Color>(
                        AppColors.blueIndigo,
                      ),
                    ),
                    const SizedBox(height: AppDimensions.spacingSmall),
                    Text(
                      'Série $currentSet/$totalSets',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: theme.colorScheme.onSurfaceVariant,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

/// Widget de progression circulaire pour les exercices
class CircularProgressWidget extends StatelessWidget {
  final double progress;
  final double size;
  final Color? color;
  final bool showPercentage;

  const CircularProgressWidget({
    Key? key,
    required this.progress,
    this.size = 100,
    this.color,
    this.showPercentage = true,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: size,
      height: size,
      child: Stack(
        alignment: Alignment.center,
        children: [
          // Cercle de fond
          SizedBox(
            width: size,
            height: size,
            child: CircularProgressIndicator(
              value: 1.0,
              strokeWidth: 8,
              backgroundColor: Colors.white.withOpacity(0.2),
              valueColor: AlwaysStoppedAnimation<Color>(
                color ?? AppColors.vermilion,
              ),
            ),
          ),

          // Cercle de progression
          SizedBox(
            width: size,
            height: size,
            child: CircularProgressIndicator(
              value: progress,
              strokeWidth: 8,
              backgroundColor: Colors.transparent,
              valueColor: AlwaysStoppedAnimation<Color>(
                color ?? AppColors.vermilion,
              ),
            ),
          ),

          // Texte de pourcentage
          if (showPercentage)
            Text(
              '${(progress * 100).toInt()}%',
              style: AppTypography.h4.copyWith(
                color: Colors.white,
                fontWeight: FontWeight.bold,
              ),
            ),
        ],
      ),
    );
  }
}

/// Widget de progression avec étapes
class StepProgressWidget extends StatelessWidget {
  final int currentStep;
  final int totalSteps;
  final List<String> stepLabels;

  const StepProgressWidget({
    Key? key,
    required this.currentStep,
    required this.totalSteps,
    this.stepLabels = const [],
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Barre de progression
        Row(
          children: List.generate(totalSteps, (index) {
            final isCompleted = index < currentStep;
            final isCurrent = index == currentStep;

            return Expanded(
              child: Container(
                height: 4,
                margin: EdgeInsets.only(
                  right: index < totalSteps - 1
                      ? AppDimensions.spacingSmall
                      : 0,
                ),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(2),
                  color: _getStepColor(isCompleted, isCurrent),
                ),
              ),
            );
          }),
        ),

        // Labels des étapes
        if (stepLabels.isNotEmpty) ...[
          const SizedBox(height: AppDimensions.spacingMedium),
          Row(
            children: List.generate(totalSteps, (index) {
              final isCompleted = index < currentStep;
              final isCurrent = index == currentStep;
              final label = index < stepLabels.length
                  ? stepLabels[index]
                  : 'Étape ${index + 1}';

              return Expanded(
                child: Text(
                  label,
                  style: AppTypography.caption.copyWith(
                    color: _getStepTextColor(isCompleted, isCurrent),
                    fontWeight: isCurrent ? FontWeight.bold : FontWeight.normal,
                  ),
                  textAlign: TextAlign.center,
                ),
              );
            }),
          ),
        ],
      ],
    );
  }

  Color _getStepColor(bool isCompleted, bool isCurrent) {
    if (isCompleted) {
      return AppColors.success['500']!;
    }

    if (isCurrent) {
      return AppColors.vermilion;
    }

    return Colors.white.withOpacity(0.3);
  }

  Color _getStepTextColor(bool isCompleted, bool isCurrent) {
    if (isCompleted || isCurrent) {
      return Colors.white;
    }

    return Colors.white.withOpacity(0.6);
  }
}
