import 'package:flutter/material.dart';
import '../../constants/animation_constants.dart';

/// Animation fade in reproduisant exactement celle de la PWA
class FadeInAnimation extends StatefulWidget {
  final Widget child;
  final Duration duration;
  final Duration delay;
  final Curve curve;
  final bool autoStart;

  const FadeInAnimation({
    Key? key,
    required this.child,
    this.duration = const Duration(milliseconds: AnimationConstants.fadeIn),
    this.delay = Duration.zero,
    this.curve = Curves.easeInOut,
    this.autoStart = true,
  }) : super(key: key);

  @override
  State<FadeInAnimation> createState() => _FadeInAnimationState();
}

class _FadeInAnimationState extends State<FadeInAnimation>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _opacityAnimation;
  late Animation<Offset> _translateAnimation;

  @override
  void initState() {
    super.initState();
    
    _controller = AnimationController(
      duration: widget.duration,
      vsync: this,
    );

    _opacityAnimation = Tween<double>(
      begin: AnimationConstants.opacityStart,
      end: AnimationConstants.opacityEnd,
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: widget.curve,
    ));

    _translateAnimation = Tween<Offset>(
      begin: const Offset(0, AnimationConstants.translateYFadeIn),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: widget.curve,
    ));

    if (widget.autoStart) {
      if (widget.delay == Duration.zero) {
        _controller.forward();
      } else {
        Future.delayed(widget.delay, () {
          if (mounted) _controller.forward();
        });
      }
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void start() {
    if (mounted) _controller.forward();
  }

  void reset() {
    if (mounted) _controller.reset();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return Transform.translate(
          offset: _translateAnimation.value,
          child: Opacity(
            opacity: _opacityAnimation.value,
            child: widget.child,
          ),
        );
      },
    );
  }
}

/// Animation fade in up reproduisant exactement celle de la PWA
class FadeInUpAnimation extends StatefulWidget {
  final Widget child;
  final Duration duration;
  final Duration delay;
  final Curve curve;
  final bool autoStart;

  const FadeInUpAnimation({
    Key? key,
    required this.child,
    this.duration = const Duration(milliseconds: AnimationConstants.fadeInUp),
    this.delay = Duration.zero,
    this.curve = Curves.easeOut,
    this.autoStart = true,
  }) : super(key: key);

  @override
  State<FadeInUpAnimation> createState() => _FadeInUpAnimationState();
}

class _FadeInUpAnimationState extends State<FadeInUpAnimation>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _opacityAnimation;
  late Animation<double> _translateAnimation;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    
    _controller = AnimationController(
      duration: widget.duration,
      vsync: this,
    );

    _opacityAnimation = Tween<double>(
      begin: AnimationConstants.opacityStart,
      end: AnimationConstants.opacityEnd,
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: widget.curve,
    ));

    _translateAnimation = Tween<double>(
      begin: AnimationConstants.translateYFadeInUp,
      end: 0.0,
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: widget.curve,
    ));

    _scaleAnimation = Tween<double>(
      begin: AnimationConstants.scaleFadeInStart,
      end: AnimationConstants.scaleEnd,
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: widget.curve,
    ));

    if (widget.autoStart) {
      if (widget.delay == Duration.zero) {
        _controller.forward();
      } else {
        Future.delayed(widget.delay, () {
          if (mounted) _controller.forward();
        });
      }
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void start() {
    if (mounted) _controller.forward();
  }

  void reset() {
    if (mounted) _controller.reset();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return Transform.translate(
          offset: Offset(0, _translateAnimation.value),
          child: Transform.scale(
            scale: _scaleAnimation.value,
            child: Opacity(
              opacity: _opacityAnimation.value,
              child: widget.child,
            ),
          ),
        );
      },
    );
  }
}

/// Animation fade in séquentielle pour listes
class SequentialFadeInAnimation extends StatefulWidget {
  final List<Widget> children;
  final Duration itemDelay;
  final Duration itemDuration;
  final Axis direction;
  final MainAxisAlignment mainAxisAlignment;
  final CrossAxisAlignment crossAxisAlignment;
  final bool autoStart;

  const SequentialFadeInAnimation({
    Key? key,
    required this.children,
    this.itemDelay = const Duration(milliseconds: AnimationConstants.sequentialDelay1),
    this.itemDuration = const Duration(milliseconds: AnimationConstants.fadeInUp),
    this.direction = Axis.vertical,
    this.mainAxisAlignment = MainAxisAlignment.start,
    this.crossAxisAlignment = CrossAxisAlignment.start,
    this.autoStart = true,
  }) : super(key: key);

  @override
  State<SequentialFadeInAnimation> createState() => _SequentialFadeInAnimationState();
}

class _SequentialFadeInAnimationState extends State<SequentialFadeInAnimation> {
  final List<GlobalKey<_FadeInUpAnimationState>> _keys = [];

  @override
  void initState() {
    super.initState();
    
    // Créer une clé pour chaque enfant
    for (int i = 0; i < widget.children.length; i++) {
      _keys.add(GlobalKey<_FadeInUpAnimationState>());
    }

    if (widget.autoStart) {
      _startSequentialAnimation();
    }
  }

  void _startSequentialAnimation() {
    for (int i = 0; i < _keys.length; i++) {
      Future.delayed(
        Duration(milliseconds: widget.itemDelay.inMilliseconds * i),
        () {
          if (mounted && _keys[i].currentState != null) {
            _keys[i].currentState?.start();
          }
        },
      );
    }
  }

  void start() {
    _startSequentialAnimation();
  }

  void reset() {
    for (final key in _keys) {
      key.currentState?.reset();
    }
  }

  @override
  Widget build(BuildContext context) {
    final animatedChildren = widget.children.asMap().entries.map((entry) {
      final index = entry.key;
      final child = entry.value;
      
      return FadeInUpAnimation(
        key: _keys[index],
        duration: widget.itemDuration,
        autoStart: false,
        child: child,
      );
    }).toList();

    return Flex(
      direction: widget.direction,
      mainAxisAlignment: widget.mainAxisAlignment,
      crossAxisAlignment: widget.crossAxisAlignment,
      children: animatedChildren,
    );
  }
}

/// Animation fade in out pour les notifications
class FadeInOutAnimation extends StatefulWidget {
  final Widget child;
  final Duration fadeInDuration;
  final Duration holdDuration;
  final Duration fadeOutDuration;
  final bool autoStart;
  final VoidCallback? onComplete;

  const FadeInOutAnimation({
    Key? key,
    required this.child,
    this.fadeInDuration = const Duration(milliseconds: AnimationConstants.fadeIn),
    this.holdDuration = const Duration(milliseconds: 2000),
    this.fadeOutDuration = const Duration(milliseconds: AnimationConstants.fadeIn),
    this.autoStart = true,
    this.onComplete,
  }) : super(key: key);

  @override
  State<FadeInOutAnimation> createState() => _FadeInOutAnimationState();
}

class _FadeInOutAnimationState extends State<FadeInOutAnimation>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    
    final totalDuration = widget.fadeInDuration + 
                         widget.holdDuration + 
                         widget.fadeOutDuration;
    
    _controller = AnimationController(
      duration: totalDuration,
      vsync: this,
    );

    final fadeInEnd = widget.fadeInDuration.inMilliseconds / totalDuration.inMilliseconds;
    final holdEnd = (widget.fadeInDuration + widget.holdDuration).inMilliseconds / totalDuration.inMilliseconds;

    _animation = TweenSequence<double>([
      // Fade in
      TweenSequenceItem(
        tween: Tween<double>(begin: 0.0, end: 1.0).chain(
          CurveTween(curve: Curves.easeIn),
        ),
        weight: fadeInEnd,
      ),
      // Hold
      TweenSequenceItem(
        tween: ConstantTween<double>(1.0),
        weight: holdEnd - fadeInEnd,
      ),
      // Fade out
      TweenSequenceItem(
        tween: Tween<double>(begin: 1.0, end: 0.0).chain(
          CurveTween(curve: Curves.easeOut),
        ),
        weight: 1.0 - holdEnd,
      ),
    ]).animate(_controller);

    _controller.addStatusListener((status) {
      if (status == AnimationStatus.completed) {
        widget.onComplete?.call();
      }
    });

    if (widget.autoStart) {
      _controller.forward();
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void start() {
    if (mounted) _controller.forward();
  }

  void stop() {
    if (mounted) _controller.stop();
  }

  void reset() {
    if (mounted) _controller.reset();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _animation,
      builder: (context, child) {
        return Opacity(
          opacity: _animation.value,
          child: widget.child,
        );
      },
    );
  }
}

/// Animation de visibility avec fade
class VisibilityFadeAnimation extends StatefulWidget {
  final Widget child;
  final bool visible;
  final Duration duration;
  final Curve curve;

  const VisibilityFadeAnimation({
    Key? key,
    required this.child,
    required this.visible,
    this.duration = const Duration(milliseconds: AnimationConstants.normal),
    this.curve = Curves.easeInOut,
  }) : super(key: key);

  @override
  State<VisibilityFadeAnimation> createState() => _VisibilityFadeAnimationState();
}

class _VisibilityFadeAnimationState extends State<VisibilityFadeAnimation>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    
    _controller = AnimationController(
      duration: widget.duration,
      vsync: this,
    );

    _animation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: widget.curve,
    ));

    if (widget.visible) {
      _controller.forward();
    }
  }

  @override
  void didUpdateWidget(VisibilityFadeAnimation oldWidget) {
    super.didUpdateWidget(oldWidget);
    
    if (widget.visible != oldWidget.visible) {
      if (widget.visible) {
        _controller.forward();
      } else {
        _controller.reverse();
      }
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
      animation: _animation,
      builder: (context, child) {
        return Opacity(
          opacity: _animation.value,
          child: _animation.value == 0.0 
            ? const SizedBox.shrink() 
            : widget.child,
        );
      },
    );
  }
}