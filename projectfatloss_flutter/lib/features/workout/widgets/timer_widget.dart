import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_dimensions.dart';
import '../../../core/constants/app_typography.dart';

/// Widget de chronomètre reproduisant le design de la PWA
class TimerWidget extends StatelessWidget {
  final int remainingTime;
  final bool isPaused;
  final bool isCompleted;

  const TimerWidget({
    Key? key,
    required this.remainingTime,
    this.isPaused = false,
    this.isCompleted = false,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppDimensions.paddingLarge),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(AppDimensions.borderRadiusLarge),
        gradient: _getTimerGradient(),
        boxShadow: _getTimerShadow(),
      ),
      child: Column(
        children: [
          // Icône du timer
          _buildTimerIcon(),
          
          const SizedBox(height: AppDimensions.spacingMedium),
          
          // Affichage du temps
          _buildTimeDisplay(),
          
          const SizedBox(height: AppDimensions.spacingSmall),
          
          // Statut du timer
          _buildTimerStatus(),
        ],
      ),
    ).animate().fadeIn(
      duration: 600.milliseconds,
      curve: Curves.easeOut,
    ).scale(
      begin: const Offset(0.8, 0.8),
      duration: 600.milliseconds,
      curve: Curves.elasticOut,
    );
  }

  Widget _buildTimerIcon() {
    IconData icon;
    Color iconColor;
    
    if (isCompleted) {
      icon = Icons.check_circle;
      iconColor = AppColors.success['500']!;
    } else if (isPaused) {
      icon = Icons.pause_circle;
      iconColor = AppColors.warning['500']!;
    } else {
      icon = Icons.timer;
      iconColor = Colors.white;
    }

    return Container(
      width: 60,
      height: 60,
      decoration: BoxDecoration(
        color: iconColor.withOpacity(0.2),
        shape: BoxShape.circle,
        border: Border.all(
          color: iconColor.withOpacity(0.5),
          width: 2,
        ),
      ),
      child: Icon(
        icon,
        color: iconColor,
        size: 32,
      ),
    ).animate(onPlay: (controller) {
      if (isPaused) controller.repeat();
    }).shimmer(
      duration: 2.seconds,
      delay: 1.seconds,
    );
  }

  Widget _buildTimeDisplay() {
    final minutes = remainingTime ~/ 60;
    final seconds = remainingTime % 60;
    final timeString = '${minutes.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}';

    return Text(
      timeString,
      style: AppTypography.h1.copyWith(
        color: Colors.white,
        fontWeight: FontWeight.bold,
        fontSize: 48,
        letterSpacing: 2,
      ),
    ).animate(onPlay: (controller) {
      if (!isPaused && !isCompleted) controller.repeat();
    }).shimmer(
      duration: 1.seconds,
      delay: 500.milliseconds,
    );
  }

  Widget _buildTimerStatus() {
    String statusText;
    Color statusColor;
    
    if (isCompleted) {
      statusText = 'Terminé !';
      statusColor = AppColors.success['500']!;
    } else if (isPaused) {
      statusText = 'En pause';
      statusColor = AppColors.warning['500']!;
    } else {
      statusText = 'En cours...';
      statusColor = Colors.white;
    }

    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        if (!isCompleted && !isPaused)
          Container(
            width: 8,
            height: 8,
            decoration: BoxDecoration(
              color: statusColor,
              shape: BoxShape.circle,
            ),
          ).animate(onPlay: (controller) => controller.repeat())
            .shimmer(duration: 1.seconds, delay: 200.milliseconds),
        
        if (!isCompleted && !isPaused)
          const SizedBox(width: AppDimensions.spacingSmall),
        
        Text(
          statusText,
          style: AppTypography.body1.copyWith(
            color: statusColor,
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }

  LinearGradient _getTimerGradient() {
    if (isCompleted) {
      return LinearGradient(
        colors: AppColors.successGradient,
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      );
    }

    if (isPaused) {
      return LinearGradient(
        colors: [
          AppColors.warning['600']!,
          AppColors.warning['700']!,
        ],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      );
    }

    return LinearGradient(
      colors: AppColors.primaryGradient,
      begin: Alignment.topLeft,
      end: Alignment.bottomRight,
    );
  }

  List<BoxShadow> _getTimerShadow() {
    if (isCompleted) {
      return [
        BoxShadow(
          color: AppColors.success['500']!.withOpacity(0.4),
          blurRadius: 12,
          offset: const Offset(0, 4),
        ),
      ];
    }

    if (isPaused) {
      return [
        BoxShadow(
          color: AppColors.warning['500']!.withOpacity(0.4),
          blurRadius: 12,
          offset: const Offset(0, 4),
        ),
      ];
    }

    return [
      BoxShadow(
        color: AppColors.primaryWithOpacity(0.4),
        blurRadius: 12,
        offset: const Offset(0, 4),
      ),
    ];
  }
}

/// Widget de compte à rebours pour les exercices
class CountdownWidget extends StatefulWidget {
  final int duration;
  final VoidCallback? onComplete;
  final bool isActive;

  const CountdownWidget({
    Key? key,
    required this.duration,
    this.onComplete,
    this.isActive = false,
  }) : super(key: key);

  @override
  State<CountdownWidget> createState() => _CountdownWidgetState();
}

class _CountdownWidgetState extends State<CountdownWidget>
    with TickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _animation;
  int _remainingTime = 0;

  @override
  void initState() {
    super.initState();
    _remainingTime = widget.duration;
    _initializeAnimation();
  }

  @override
  void didUpdateWidget(CountdownWidget oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.isActive && !oldWidget.isActive) {
      _startCountdown();
    } else if (!widget.isActive && oldWidget.isActive) {
      _stopCountdown();
    }
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  void _initializeAnimation() {
    _animationController = AnimationController(
      duration: Duration(seconds: widget.duration),
      vsync: this,
    );

    _animation = Tween<double>(
      begin: 1.0,
      end: 0.0,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.linear,
    ));

    _animationController.addListener(() {
      setState(() {
        _remainingTime = (widget.duration * _animation.value).round();
      });

      if (_animation.value == 0.0) {
        widget.onComplete?.call();
      }
    });
  }

  void _startCountdown() {
    _animationController.forward();
  }

  void _stopCountdown() {
    _animationController.stop();
  }

  @override
  Widget build(BuildContext context) {
    final progress = _animation.value;
    final minutes = _remainingTime ~/ 60;
    final seconds = _remainingTime % 60;
    final timeString = '${minutes.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}';

    return Container(
      width: 120,
      height: 120,
      child: Stack(
        alignment: Alignment.center,
        children: [
          // Cercle de progression
          SizedBox(
            width: 120,
            height: 120,
            child: CircularProgressIndicator(
              value: progress,
              strokeWidth: 8,
              backgroundColor: Colors.white.withOpacity(0.2),
              valueColor: AlwaysStoppedAnimation<Color>(
                widget.isActive ? AppColors.vermilion : Colors.white.withOpacity(0.5),
              ),
            ),
          ),
          
          // Texte du temps
          Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                timeString,
                style: AppTypography.h3.copyWith(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                ),
              ),
              Text(
                'secondes',
                style: AppTypography.caption.copyWith(
                  color: Colors.white.withOpacity(0.8),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
} 