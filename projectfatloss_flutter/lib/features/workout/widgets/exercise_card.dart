import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_dimensions.dart';
import '../../../shared/models/workout_model.dart';

/// Widget pour afficher une carte d'exercice
class ExerciseCard extends StatelessWidget {
  final Exercise exercise;
  final bool isActive;
  final bool isCompact;
  final int? setNumber;
  final int? totalSets;
  final VoidCallback? onTap;
  final VoidCallback? onComplete;

  const ExerciseCard({
    Key? key,
    required this.exercise,
    this.isActive = false,
    this.isCompact = false,
    this.setNumber,
    this.totalSets,
    this.onTap,
    this.onComplete,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: AppDimensions.spacingSmall),
        decoration: BoxDecoration(
          color: isActive
              ? AppColors.vermilion.withOpacity(0.1)
              : theme.colorScheme.surface,
          borderRadius: BorderRadius.circular(AppDimensions.borderRadiusMedium),
          border: Border.all(
            color: isActive
                ? AppColors.vermilion
                : theme.colorScheme.outline.withOpacity(0.2),
            width: isActive ? 2 : 1,
          ),
          boxShadow: [
            BoxShadow(
              color: theme.colorScheme.shadow.withOpacity(0.1),
              blurRadius: 4,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Padding(
          padding: const EdgeInsets.all(AppDimensions.paddingMedium),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // En-tête avec nom et icône
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(AppDimensions.paddingSmall),
                    decoration: BoxDecoration(
                      color: isActive
                          ? AppColors.vermilion
                          : theme.colorScheme.primary.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(
                        AppDimensions.borderRadiusSmall,
                      ),
                    ),
                    child: Icon(
                      _getExerciseIcon(exercise.name),
                      color: isActive
                          ? Colors.white
                          : theme.colorScheme.primary,
                      size: AppDimensions.iconMedium,
                    ),
                  ),
                  const SizedBox(width: AppDimensions.spacingMedium),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          exercise.name,
                          style: theme.textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                            color: isActive
                                ? AppColors.vermilion
                                : theme.colorScheme.onSurface,
                          ),
                        ),
                        if (setNumber != null && totalSets != null)
                          Text(
                            'Série $setNumber/$totalSets',
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: theme.colorScheme.onSurfaceVariant,
                            ),
                          ),
                      ],
                    ),
                  ),
                  if (isActive)
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: AppDimensions.paddingSmall,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.vermilion,
                        borderRadius: BorderRadius.circular(
                          AppDimensions.borderRadiusSmall,
                        ),
                      ),
                      child: Text(
                        'ACTIF',
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                ],
              ),

              if (!isCompact) ...[
                const SizedBox(height: AppDimensions.spacingMedium),

                // Détails de l'exercice
                _buildExerciseDetails(context),

                if (exercise.desc != null) ...[
                  const SizedBox(height: AppDimensions.spacingSmall),
                  Text(
                    exercise.desc!,
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: theme.colorScheme.onSurfaceVariant,
                    ),
                  ),
                ],

                // Bouton d'action si actif
                if (isActive && onComplete != null) ...[
                  const SizedBox(height: AppDimensions.spacingMedium),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: onComplete,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.vermilion,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(
                          vertical: AppDimensions.paddingMedium,
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(
                            AppDimensions.borderRadiusSmall,
                          ),
                        ),
                      ),
                      child: Text(
                        'Terminer la série',
                        style: theme.textTheme.bodyMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                ],
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildExerciseDetails(BuildContext context) {
    final theme = Theme.of(context);

    return Wrap(
      spacing: AppDimensions.spacingSmall,
      runSpacing: AppDimensions.spacingSmall,
      children: [
        if (exercise.sets.isNotEmpty)
          _buildDetailChip(
            context,
            'Séries',
            exercise.sets,
            AppColors.blueIndigo,
          ),
        if (exercise.equip != null)
          _buildDetailChip(
            context,
            'Équipement',
            exercise.equip!,
            AppColors.secondary['500']!,
          ),
        if (exercise.nbRep > 0)
          _buildDetailChip(
            context,
            'Répétitions',
            '${exercise.nbRep}',
            AppColors.darkGreen,
          ),
        if (exercise.timer == true && exercise.duration != null)
          _buildDetailChip(
            context,
            'Durée',
            '${exercise.duration}s',
            AppColors.vermilion,
          ),
      ],
    );
  }

  Widget _buildDetailChip(
    BuildContext context,
    String label,
    String value,
    Color color,
  ) {
    final theme = Theme.of(context);

    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppDimensions.paddingSmall,
        vertical: 4,
      ),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(AppDimensions.borderRadiusSmall),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Text(
        '$label: $value',
        style: theme.textTheme.bodySmall?.copyWith(
          color: color,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  IconData _getExerciseIcon(String exerciseName) {
    final name = exerciseName.toLowerCase();

    if (name.contains('pompe') || name.contains('push')) {
      return Icons.fitness_center;
    } else if (name.contains('squat')) {
      return Icons.accessibility_new;
    } else if (name.contains('planche')) {
      return Icons.timer;
    } else if (name.contains('curl')) {
      return Icons.fitness_center;
    } else if (name.contains('rowing')) {
      return Icons.fitness_center;
    } else if (name.contains('développé')) {
      return Icons.fitness_center;
    } else if (name.contains('élévation')) {
      return Icons.fitness_center;
    } else if (name.contains('crunch')) {
      return Icons.fitness_center;
    } else if (name.contains('cardio') || name.contains('vélo')) {
      return Icons.directions_bike;
    } else if (name.contains('étirement')) {
      return Icons.accessibility_new;
    } else {
      return Icons.fitness_center;
    }
  }
}
