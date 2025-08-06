import 'package:flutter/material.dart';
import 'dart:async';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_dimensions.dart';
import '../../../shared/models/workout_model.dart';

/// Widget pour afficher un timer de pause
class TimerWidget extends StatefulWidget {
  final int duration;
  final VoidCallback onComplete;
  final VoidCallback onSkip;
  final Exercise? nextExercise;

  const TimerWidget({
    Key? key,
    required this.duration,
    required this.onComplete,
    required this.onSkip,
    this.nextExercise,
  }) : super(key: key);

  @override
  State<TimerWidget> createState() => _TimerWidgetState();
}

class _TimerWidgetState extends State<TimerWidget> {
  late int _remainingTime;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _remainingTime = widget.duration;
    _startTimer();
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  void _startTimer() {
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      setState(() {
        if (_remainingTime > 0) {
          _remainingTime--;
        } else {
          timer.cancel();
          widget.onComplete();
        }
      });
    });
  }

  String _formatTime(int seconds) {
    final mins = seconds ~/ 60;
    final secs = seconds % 60;
    return '${mins.toString().padLeft(2, '0')}:${secs.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      padding: const EdgeInsets.all(AppDimensions.paddingLarge),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(AppDimensions.borderRadiusLarge),
        border: Border.all(
          color: AppColors.vermilion.withOpacity(0.3),
          width: 2,
        ),
      ),
      child: Column(
        children: [
          // Titre
          Text(
            'Pause',
            style: theme.textTheme.headlineSmall?.copyWith(
              fontWeight: FontWeight.bold,
              color: AppColors.vermilion,
            ),
          ),

          const SizedBox(height: AppDimensions.spacingLarge),

          // Timer principal
          Text(
            _formatTime(_remainingTime),
            style: theme.textTheme.displayMedium?.copyWith(
              fontFamily: 'monospace',
              fontWeight: FontWeight.bold,
              color: _remainingTime <= 5
                  ? AppColors.vermilion
                  : theme.colorScheme.onSurface,
            ),
          ),

          const SizedBox(height: AppDimensions.spacingLarge),

          // Prochain exercice si disponible
          if (widget.nextExercise != null) ...[
            Container(
              padding: const EdgeInsets.all(AppDimensions.paddingMedium),
              decoration: BoxDecoration(
                color: theme.colorScheme.surfaceVariant,
                borderRadius: BorderRadius.circular(
                  AppDimensions.borderRadiusMedium,
                ),
              ),
              child: Column(
                children: [
                  Text(
                    'Prochain exercice:',
                    style: theme.textTheme.titleSmall?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: AppDimensions.spacingSmall),
                  Text(
                    widget.nextExercise!.name,
                    style: theme.textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                      color: AppColors.vermilion,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  if (widget.nextExercise!.equip != null) ...[
                    const SizedBox(height: AppDimensions.spacingSmall),
                    Text(
                      widget.nextExercise!.equip!,
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: theme.colorScheme.onSurfaceVariant,
                      ),
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(height: AppDimensions.spacingLarge),
          ],

          // Boutons
          Row(
            children: [
              Expanded(
                child: ElevatedButton(
                  onPressed: widget.onSkip,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: theme.colorScheme.surfaceVariant,
                    foregroundColor: theme.colorScheme.onSurfaceVariant,
                    padding: const EdgeInsets.symmetric(
                      vertical: AppDimensions.paddingMedium,
                    ),
                  ),
                  child: const Text('Passer'),
                ),
              ),
              const SizedBox(width: AppDimensions.spacingMedium),
              Expanded(
                child: ElevatedButton(
                  onPressed: () {
                    _timer?.cancel();
                    widget.onComplete();
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.vermilion,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(
                      vertical: AppDimensions.paddingMedium,
                    ),
                  ),
                  child: const Text('Terminer'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
