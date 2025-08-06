import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:audioplayers/audioplayers.dart';
import 'dart:async';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_dimensions.dart';

/// Widget pour compter le rythme des exercices avec métronome visuel et sonore
class RhythmCounter extends StatefulWidget {
  final int targetReps;
  final int tempo; // BPM du métronome
  final VoidCallback onComplete;
  final VoidCallback? onRepsChange;

  const RhythmCounter({
    Key? key,
    required this.targetReps,
    required this.onComplete,
    this.tempo = 60, // 60 BPM par défaut
    this.onRepsChange,
  }) : super(key: key);

  @override
  State<RhythmCounter> createState() => _RhythmCounterState();
}

class _RhythmCounterState extends State<RhythmCounter>
    with TickerProviderStateMixin {
  int _currentReps = 0;
  Timer? _tempoTimer;
  bool _isPlaying = false;
  bool _soundEnabled = true;
  late AnimationController _pulseController;
  late Animation<double> _pulseAnimation;
  final AudioPlayer _audioPlayer = AudioPlayer();

  @override
  void initState() {
    super.initState();
    _setupAnimation();
  }

  void _setupAnimation() {
    _pulseController = AnimationController(
      duration: Duration(milliseconds: (60000 / widget.tempo / 2).round()),
      vsync: this,
    );

    _pulseAnimation = Tween<double>(
      begin: 1.0,
      end: 1.2,
    ).animate(CurvedAnimation(
      parent: _pulseController,
      curve: Curves.easeInOut,
    ));
  }

  @override
  void dispose() {
    _tempoTimer?.cancel();
    _pulseController.dispose();
    _audioPlayer.dispose();
    super.dispose();
  }

  void _startStopTempo() {
    if (_isPlaying) {
      _stopTempo();
    } else {
      _startTempo();
    }
  }

  void _startTempo() {
    setState(() {
      _isPlaying = true;
    });

    _pulseController.repeat(reverse: true);
    
    _tempoTimer = Timer.periodic(
      Duration(milliseconds: (60000 / widget.tempo).round()),
      (timer) {
        if (_soundEnabled) {
          _playClick();
        }
        HapticFeedback.lightImpact();
      },
    );
  }

  void _stopTempo() {
    setState(() {
      _isPlaying = false;
    });
    
    _tempoTimer?.cancel();
    _pulseController.stop();
  }

  void _playClick() async {
    try {
      // Son de clic simple généré programmatically
      await _audioPlayer.play(AssetSource('sounds/click.wav'));
    } catch (e) {
      // Si le son n'est pas disponible, on utilise juste le haptic
      HapticFeedback.selectionClick();
    }
  }

  void _incrementReps() {
    if (_currentReps < widget.targetReps) {
      setState(() {
        _currentReps++;
      });
      
      HapticFeedback.heavyImpact();
      widget.onRepsChange?.call();
      
      if (_currentReps >= widget.targetReps) {
        _stopTempo();
        widget.onComplete();
      }
    }
  }

  void _decrementReps() {
    if (_currentReps > 0) {
      setState(() {
        _currentReps--;
      });
      HapticFeedback.lightImpact();
      widget.onRepsChange?.call();
    }
  }

  void _resetCounter() {
    _stopTempo();
    setState(() {
      _currentReps = 0;
    });
    HapticFeedback.mediumImpact();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final progress = _currentReps / widget.targetReps;

    return Container(
      padding: const EdgeInsets.all(AppDimensions.paddingLarge),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(AppDimensions.borderRadiusLarge),
        border: Border.all(
          color: AppColors.vermilion.withOpacity(0.3),
          width: 2,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          // Titre
          Text(
            'Compteur de répétitions',
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.bold,
              color: AppColors.vermilion,
            ),
          ),

          const SizedBox(height: AppDimensions.spacingLarge),

          // Compteur principal avec animation
          AnimatedBuilder(
            animation: _pulseAnimation,
            builder: (context, child) {
              return Transform.scale(
                scale: _isPlaying ? _pulseAnimation.value : 1.0,
                child: Container(
                  width: 120,
                  height: 120,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: _isPlaying
                        ? AppColors.vermilion.withOpacity(0.2)
                        : theme.colorScheme.surfaceContainerHighest,
                    border: Border.all(
                      color: AppColors.vermilion,
                      width: 3,
                    ),
                  ),
                  child: Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          '$_currentReps',
                          style: theme.textTheme.displayMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                            color: AppColors.vermilion,
                          ),
                        ),
                        Text(
                          '/ ${widget.targetReps}',
                          style: theme.textTheme.bodyMedium?.copyWith(
                            color: theme.colorScheme.onSurfaceVariant,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            },
          ),

          const SizedBox(height: AppDimensions.spacingMedium),

          // Barre de progression
          LinearProgressIndicator(
            value: progress,
            backgroundColor: theme.colorScheme.surfaceContainerHighest,
            valueColor: AlwaysStoppedAnimation<Color>(AppColors.vermilion),
            minHeight: 8,
          ),

          const SizedBox(height: AppDimensions.spacingLarge),

          // Contrôles du métronome
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Tempo: ${widget.tempo} BPM',
                      style: theme.textTheme.bodyMedium?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: AppDimensions.spacingSmall),
                    Row(
                      children: [
                        Switch(
                          value: _soundEnabled,
                          onChanged: (value) {
                            setState(() {
                              _soundEnabled = value;
                            });
                          },
                          activeColor: AppColors.vermilion,
                        ),
                        const SizedBox(width: AppDimensions.spacingSmall),
                        Icon(
                          _soundEnabled ? Icons.volume_up : Icons.volume_off,
                          size: 20,
                          color: theme.colorScheme.onSurfaceVariant,
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              ElevatedButton.icon(
                onPressed: _startStopTempo,
                style: ElevatedButton.styleFrom(
                  backgroundColor: _isPlaying 
                    ? theme.colorScheme.surfaceContainerHighest
                    : AppColors.vermilion,
                  foregroundColor: _isPlaying 
                    ? theme.colorScheme.onSurfaceVariant
                    : Colors.white,
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppDimensions.paddingMedium,
                    vertical: AppDimensions.paddingSmall,
                  ),
                ),
                icon: Icon(_isPlaying ? Icons.pause : Icons.play_arrow),
                label: Text(_isPlaying ? 'Pause' : 'Start'),
              ),
            ],
          ),

          const SizedBox(height: AppDimensions.spacingLarge),

          // Contrôles des répétitions
          Row(
            children: [
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: _currentReps > 0 ? _decrementReps : null,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: theme.colorScheme.surfaceContainerHighest,
                    foregroundColor: theme.colorScheme.onSurfaceVariant,
                    padding: const EdgeInsets.symmetric(
                      vertical: AppDimensions.paddingMedium,
                    ),
                  ),
                  icon: const Icon(Icons.remove),
                  label: const Text('-1'),
                ),
              ),
              const SizedBox(width: AppDimensions.spacingMedium),
              Expanded(
                flex: 2,
                child: ElevatedButton.icon(
                  onPressed: _incrementReps,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.vermilion,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(
                      vertical: AppDimensions.paddingMedium,
                    ),
                  ),
                  icon: const Icon(Icons.add),
                  label: const Text('Répétition'),
                ),
              ),
              const SizedBox(width: AppDimensions.spacingMedium),
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: _resetCounter,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: theme.colorScheme.surfaceContainerHighest,
                    foregroundColor: theme.colorScheme.onSurfaceVariant,
                    padding: const EdgeInsets.symmetric(
                      vertical: AppDimensions.paddingMedium,
                    ),
                  ),
                  icon: const Icon(Icons.refresh),
                  label: const Text('Reset'),
                ),
              ),
            ],
          ),

          const SizedBox(height: AppDimensions.spacingMedium),

          // Bouton de complétion
          if (_currentReps >= widget.targetReps) ...[
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: widget.onComplete,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.green,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(
                    vertical: AppDimensions.paddingMedium,
                  ),
                ),
                icon: const Icon(Icons.check),
                label: const Text('Exercice terminé !'),
              ),
            ),
          ],
        ],
      ),
    );
  }
}