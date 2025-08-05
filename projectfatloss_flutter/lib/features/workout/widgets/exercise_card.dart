import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_dimensions.dart';
import '../../../core/constants/app_typography.dart';
import '../../../core/widgets/custom_card.dart';
import '../../../shared/models/workout_model.dart';

/// Carte d'exercice reproduisant le design de la PWA
class ExerciseCard extends StatelessWidget {
  final Exercise exercise;
  final bool isActive;
  final bool isCompleted;
  final bool isCompact;

  const ExerciseCard({
    Key? key,
    required this.exercise,
    this.isActive = false,
    this.isCompleted = false,
    this.isCompact = false,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    return CustomCard(
      child: Container(
        padding: EdgeInsets.all(isCompact 
            ? AppDimensions.paddingMedium 
            : AppDimensions.paddingLarge),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(AppDimensions.borderRadiusLarge),
          gradient: _getCardGradient(),
          boxShadow: _getCardShadow(),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // En-tête avec image et statut
            _buildHeader(context),
            
            if (!isCompact) ...[
              const SizedBox(height: AppDimensions.spacingMedium),
              _buildDescription(context),
              const SizedBox(height: AppDimensions.spacingMedium),
              _buildDetails(context),
            ],
          ],
        ),
      ),
    ).animate().fadeIn(
      duration: 400.milliseconds,
      curve: Curves.easeOut,
    ).slideY(
      begin: 0.2,
      duration: 400.milliseconds,
      curve: Curves.easeOut,
    );
  }

  Widget _buildHeader(BuildContext context) {
    return Row(
      children: [
        // Image de l'exercice
        Container(
          width: isCompact ? 40 : 60,
          height: isCompact ? 40 : 60,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(AppDimensions.borderRadiusMedium),
            gradient: AppColors.primaryGradient,
            boxShadow: [
              BoxShadow(
                color: AppColors.primaryWithOpacity(0.3),
                blurRadius: 8,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Icon(
            _getExerciseIcon(),
            color: Colors.white,
            size: isCompact ? 20 : 30,
          ),
        ),
        
        const SizedBox(width: AppDimensions.spacingMedium),
        
        // Informations principales
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                exercise.name,
                style: AppTypography.h4.copyWith(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              
              const SizedBox(height: AppDimensions.spacingSmall),
              
              Row(
                children: [
                  _buildDifficultyChip(),
                  const SizedBox(width: AppDimensions.spacingSmall),
                  _buildCategoryChip(),
                ],
              ),
            ],
          ),
        ),
        
        // Indicateur de statut
        _buildStatusIndicator(),
      ],
    );
  }

  Widget _buildDescription(BuildContext context) {
    return Text(
      exercise.description,
      style: AppTypography.body2.copyWith(
        color: Colors.white.withOpacity(0.9),
      ),
      maxLines: 3,
      overflow: TextOverflow.ellipsis,
    );
  }

  Widget _buildDetails(BuildContext context) {
    return Row(
      children: [
        _buildDetailItem(
          icon: Icons.timer,
          label: '${exercise.duration}s',
        ),
        const SizedBox(width: AppDimensions.spacingMedium),
        _buildDetailItem(
          icon: Icons.fitness_center,
          label: '${exercise.sets} séries',
        ),
        const SizedBox(width: AppDimensions.spacingMedium),
        _buildDetailItem(
          icon: Icons.repeat,
          label: '${exercise.reps} reps',
        ),
      ],
    );
  }

  Widget _buildDetailItem({
    required IconData icon,
    required String label,
  }) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(
          icon,
          size: 16,
          color: Colors.white.withOpacity(0.8),
        ),
        const SizedBox(width: AppDimensions.spacingSmall),
        Text(
          label,
          style: AppTypography.caption.copyWith(
            color: Colors.white.withOpacity(0.8),
          ),
        ),
      ],
    );
  }

  Widget _buildDifficultyChip() {
    Color chipColor;
    switch (exercise.difficulty) {
      case 'Débutant':
        chipColor = AppColors.success['500']!;
        break;
      case 'Intermédiaire':
        chipColor = AppColors.warning['500']!;
        break;
      case 'Avancé':
        chipColor = AppColors.error['500']!;
        break;
      default:
        chipColor = AppColors.neutral['500']!;
    }

    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppDimensions.spacingSmall,
        vertical: 2,
      ),
      decoration: BoxDecoration(
        color: chipColor.withOpacity(0.2),
        borderRadius: BorderRadius.circular(AppDimensions.borderRadiusSmall),
        border: Border.all(
          color: chipColor.withOpacity(0.5),
          width: 1,
        ),
      ),
      child: Text(
        exercise.difficulty,
        style: AppTypography.caption.copyWith(
          color: chipColor,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  Widget _buildCategoryChip() {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppDimensions.spacingSmall,
        vertical: 2,
      ),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.2),
        borderRadius: BorderRadius.circular(AppDimensions.borderRadiusSmall),
        border: Border.all(
          color: Colors.white.withOpacity(0.3),
          width: 1,
        ),
      ),
      child: Text(
        exercise.category,
        style: AppTypography.caption.copyWith(
          color: Colors.white,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  Widget _buildStatusIndicator() {
    if (isCompleted) {
      return Container(
        width: 24,
        height: 24,
        decoration: BoxDecoration(
          color: AppColors.success['500']!,
          shape: BoxShape.circle,
        ),
        child: const Icon(
          Icons.check,
          color: Colors.white,
          size: 16,
        ),
      );
    }

    if (isActive) {
      return Container(
        width: 24,
        height: 24,
        decoration: BoxDecoration(
          color: AppColors.vermilion,
          shape: BoxShape.circle,
        ),
        child: const Icon(
          Icons.play_arrow,
          color: Colors.white,
          size: 16,
        ),
      ).animate(onPlay: (controller) => controller.repeat())
        .shimmer(duration: 1.seconds, delay: 500.milliseconds);
    }

    return Container(
      width: 24,
      height: 24,
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.3),
        shape: BoxShape.circle,
      ),
      child: const Icon(
        Icons.fitness_center,
        color: Colors.white,
        size: 16,
      ),
    );
  }

  IconData _getExerciseIcon() {
    switch (exercise.category) {
      case 'Cardio':
        return Icons.directions_run;
      case 'Force':
        return Icons.fitness_center;
      case 'Flexibilité':
        return Icons.accessibility_new;
      default:
        return Icons.fitness_center;
    }
  }

  LinearGradient _getCardGradient() {
    if (isActive) {
      return LinearGradient(
        colors: AppColors.primaryGradient,
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      );
    }

    if (isCompleted) {
      return LinearGradient(
        colors: AppColors.successGradient,
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      );
    }

    return LinearGradient(
      colors: [
        AppColors.neutral['600']!,
        AppColors.neutral['700']!,
      ],
      begin: Alignment.topLeft,
      end: Alignment.bottomRight,
    );
  }

  List<BoxShadow> _getCardShadow() {
    if (isActive) {
      return [
        BoxShadow(
          color: AppColors.primaryWithOpacity(0.4),
          blurRadius: 12,
          offset: const Offset(0, 4),
        ),
      ];
    }

    return [
      BoxShadow(
        color: AppColors.blackWithOpacity(0.1),
        blurRadius: 8,
        offset: const Offset(0, 2),
      ),
    ];
  }
} 