import 'package:flutter/material.dart';
import '../../constants/animation_constants.dart';

/// Animation de pulse reproduisant exactement celle de la PWA
/// Utilise la courbe cubic-bezier(0.4, 0, 0.6, 1) exacte
class PulseAnimation extends StatefulWidget {
  final Widget child;
  final Duration duration;
  final double minOpacity;
  final double maxOpacity;
  final double minScale;
  final double maxScale;
  final bool animateOpacity;
  final bool animateScale;
  final bool repeat;

  const PulseAnimation({
    Key? key,
    required this.child,
    this.duration = const Duration(milliseconds: AnimationConstants.pulse),
    this.minOpacity = AnimationConstants.opacityPulseMin,
    this.maxOpacity = AnimationConstants.opacityPulseMax,
    this.minScale = AnimationConstants.scalePulseMin,
    this.maxScale = AnimationConstants.scalePulseMax,
    this.animateOpacity = true,
    this.animateScale = false,
    this.repeat = true,
  }) : super(key: key);

  @override
  State<PulseAnimation> createState() => _PulseAnimationState();
}

class _PulseAnimationState extends State<PulseAnimation>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _opacityAnimation;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    
    _controller = AnimationController(
      duration: widget.duration,
      vsync: this,
    );

    // Courbe cubic-bezier(0.4, 0, 0.6, 1) exacte de la PWA
    final curve = Cubic(
      AnimationConstants.pulseA,
      AnimationConstants.pulseB,
      AnimationConstants.pulseC,
      AnimationConstants.pulseD,
    );

    _opacityAnimation = Tween<double>(
      begin: widget.minOpacity,
      end: widget.maxOpacity,
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: curve,
    ));

    _scaleAnimation = Tween<double>(
      begin: widget.minScale,
      end: widget.maxScale,
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: curve,
    ));

    if (widget.repeat) {
      _controller.repeat(reverse: true);
    } else {
      _controller.forward();
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        Widget result = widget.child;

        if (widget.animateScale) {
          result = Transform.scale(
            scale: _scaleAnimation.value,
            child: result,
          );
        }

        if (widget.animateOpacity) {
          result = Opacity(
            opacity: _opacityAnimation.value,
            child: result,
          );
        }

        return result;
      },
    );
  }
}

/// Animation de pulse spécialisée pour les boutons vocaux
class SpeakingPulseAnimation extends StatelessWidget {
  final Widget child;
  final bool isActive;

  const SpeakingPulseAnimation({
    Key? key,
    required this.child,
    this.isActive = false,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    if (!isActive) return child;

    return PulseAnimation(
      duration: const Duration(milliseconds: AnimationConstants.speaking),
      minOpacity: AnimationConstants.opacityPulseStart, // 0.6
      maxOpacity: AnimationConstants.opacityPulseMax,   // 1.0
      minScale: AnimationConstants.scalePulseMin,       // 0.8
      maxScale: AnimationConstants.scalePulseMax,       // 1.2
      animateOpacity: true,
      animateScale: true,
      child: child,
    );
  }
}

/// Animation de pulse pour les notifications
class NotificationPulseAnimation extends StatelessWidget {
  final Widget child;

  const NotificationPulseAnimation({
    Key? key,
    required this.child,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return PulseAnimation(
      duration: const Duration(milliseconds: AnimationConstants.fadeInOut),
      minOpacity: AnimationConstants.opacityWarning, // 0.7
      maxOpacity: AnimationConstants.opacityPulseMax, // 1.0
      animateOpacity: true,
      animateScale: false,
      child: child,
    );
  }
}

/// Animation de pulse pour les calories flottantes
class CaloriePulseAnimation extends StatefulWidget {
  final Widget child;
  final bool trigger;

  const CaloriePulseAnimation({
    Key? key,
    required this.child,
    this.trigger = false,
  }) : super(key: key);

  @override
  State<CaloriePulseAnimation> createState() => _CaloriePulseAnimationState();
}

class _CaloriePulseAnimationState extends State<CaloriePulseAnimation>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    
    _controller = AnimationController(
      duration: const Duration(milliseconds: AnimationConstants.caloriePulse),
      vsync: this,
    );

    _scaleAnimation = Tween<double>(
      begin: 1.0,
      end: 1.2,
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: Curves.easeOut,
    ));
  }

  @override
  void didUpdateWidget(CaloriePulseAnimation oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.trigger && !oldWidget.trigger) {
      _controller.forward().then((_) => _controller.reverse());
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _scaleAnimation,
      builder: (context, child) {
        return Transform.scale(
          scale: _scaleAnimation.value,
          child: widget.child,
        );
      },
    );
  }
}

/// Animation de pulse pour le mode Fat Burner
class FatBurnerPulseAnimation extends StatelessWidget {
  final Widget child;

  const FatBurnerPulseAnimation({
    Key? key,
    required this.child,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return PulseAnimation(
      duration: const Duration(milliseconds: AnimationConstants.fatBurnerPulse),
      minOpacity: AnimationConstants.pulseOpacityMin, // 0.8
      maxOpacity: AnimationConstants.pulseOpacityMax, // 1.0
      animateOpacity: true,
      animateScale: false,
      child: child,
    );
  }
}

/// Animation de pulse pour le mode automatique
class AutoModePulseAnimation extends StatelessWidget {
  final Widget child;

  const AutoModePulseAnimation({
    Key? key,
    required this.child,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return PulseAnimation(
      duration: const Duration(milliseconds: AnimationConstants.autoModePulse),
      minOpacity: AnimationConstants.pulseOpacityMin, // 0.8
      maxOpacity: AnimationConstants.pulseOpacityMax, // 1.0
      animateOpacity: true,
      animateScale: false,
      child: child,
    );
  }
}

/// Animation de pulse pour le timer en mode warning
class TimerWarningPulseAnimation extends StatelessWidget {
  final Widget child;
  final bool isWarning;
  final bool isCritical;

  const TimerWarningPulseAnimation({
    Key? key,
    required this.child,
    this.isWarning = false,
    this.isCritical = false,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    if (!isWarning && !isCritical) return child;

    return PulseAnimation(
      duration: Duration(
        milliseconds: isCritical 
          ? AnimationConstants.timerCritical 
          : AnimationConstants.timerPulse,
      ),
      minScale: 1.0,
      maxScale: 1.05,
      animateOpacity: false,
      animateScale: true,
      child: child,
    );
  }
}