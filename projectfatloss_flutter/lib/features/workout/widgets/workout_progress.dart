import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_dimensions.dart';
import '../../../core/constants/app_typography.dart';

/// Widget de progression d'entraînement reproduisant le design de la PWA
class WorkoutProgress extends StatelessWidget {
  final double progress;
  final int elapsedTime;
  final int totalTime;
  final bool isPaused;

  const WorkoutProgress({
    Key? key,
    required this.progress,
    required this.elapsedTime,
    required this.totalTime,
    this.isPaused = false,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 8,
      margin: const EdgeInsets.symmetric(
        horizontal: AppDimensions.paddingLarge,
        vertical: AppDimensions.spacingMedium,
      ),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(AppDimensions.borderRadiusSmall),
        color: Colors.white.withOpacity(0.1),
      ),
      child: Stack(
        children: [
          // Barre de progression de base
          Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(AppDimensions.borderRadiusSmall),
              gradient: LinearGradient(
                colors: AppColors.primaryGradient,
                begin: Alignment.centerLeft,
                end: Alignment.centerRight,
              ),
            ),
          ),
          
          // Barre de progression animée
          AnimatedContainer(
            duration: const Duration(milliseconds: 300),
            width: MediaQuery.of(context).size.width * progress,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(AppDimensions.borderRadiusSmall),
              gradient: _getProgressGradient(),
              boxShadow: _getProgressShadow(),
            ),
          ),
          
          // Indicateur de pause
          if (isPaused)
            Positioned(
              right: 0,
              top: 0,
              bottom: 0,
              child: Container(
                width: 4,
                decoration: BoxDecoration(
                  color: AppColors.warning['500']!,
                  borderRadius: BorderRadius.circular(2),
                ),
              ).animate(onPlay: (controller) => controller.repeat())
                .shimmer(duration: 1.seconds, delay: 200.milliseconds),
            ),
        ],
      ),
    );
  }

  LinearGradient _getProgressGradient() {
    if (isPaused) {
      return LinearGradient(
        colors: [
          AppColors.warning['400']!,
          AppColors.warning['500']!,
        ],
        begin: Alignment.centerLeft,
        end: Alignment.centerRight,
      );
    }

    return LinearGradient(
      colors: AppColors.primaryGradient,
      begin: Alignment.centerLeft,
      end: Alignment.centerRight,
    );
  }

  List<BoxShadow> _getProgressShadow() {
    if (isPaused) {
      return [
        BoxShadow(
          color: AppColors.warning['500']!.withOpacity(0.5),
          blurRadius: 4,
          offset: const Offset(0, 1),
        ),
      ];
    }

    return [
      BoxShadow(
        color: AppColors.primaryWithOpacity(0.3),
        blurRadius: 4,
        offset: const Offset(0, 1),
      ),
    ];
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