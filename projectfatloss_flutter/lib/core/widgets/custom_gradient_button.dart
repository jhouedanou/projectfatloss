import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../constants/app_dimensions.dart';
import '../constants/animation_constants.dart';
import '../theme/app_theme.dart';

/// Bouton avec gradient personnalisé reproduisant exactement les boutons de la PWA
class CustomGradientButton extends StatefulWidget {
  final String text;
  final VoidCallback? onPressed;
  final IconData? icon;
  final bool isLoading;
  final bool isFullWidth;
  final EdgeInsetsGeometry? padding;
  final double? width;
  final double? height;
  final List<Color>? gradientColors;
  final BorderRadius? borderRadius;
  final TextStyle? textStyle;
  final bool enabled;

  const CustomGradientButton({
    Key? key,
    required this.text,
    this.onPressed,
    this.icon,
    this.isLoading = false,
    this.isFullWidth = false,
    this.padding,
    this.width,
    this.height,
    this.gradientColors,
    this.borderRadius,
    this.textStyle,
    this.enabled = true,
  }) : super(key: key);

  @override
  State<CustomGradientButton> createState() => _CustomGradientButtonState();
}

class _CustomGradientButtonState extends State<CustomGradientButton>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _scaleAnimation;
  late Animation<double> _elevationAnimation;
  bool _isPressed = false;
  bool _isHovered = false;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: AnimationConstants.normal),
      vsync: this,
    );

    _scaleAnimation = Tween<double>(
      begin: 1.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    ));

    _elevationAnimation = Tween<double>(
      begin: 0.0,
      end: AppDimensions.shadowBlurRadiusLarge,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    ));
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  void _onTapDown(TapDownDetails details) {
    if (!widget.enabled || widget.isLoading) return;
    setState(() {
      _isPressed = true;
    });
    _animationController.forward();
  }

  void _onTapUp(TapUpDetails details) {
    if (!widget.enabled || widget.isLoading) return;
    setState(() {
      _isPressed = false;
    });
    _animationController.reverse();
  }

  void _onTapCancel() {
    if (!widget.enabled || widget.isLoading) return;
    setState(() {
      _isPressed = false;
    });
    _animationController.reverse();
  }

  void _onHoverChange(bool isHovered) {
    if (!widget.enabled || widget.isLoading) return;
    setState(() {
      _isHovered = isHovered;
    });
    if (isHovered) {
      _animationController.forward();
    } else {
      _animationController.reverse();
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDisabled = !widget.enabled || widget.isLoading;
    final gradientColors = widget.gradientColors ?? AppColors.primaryGradient;
    
    return MouseRegion(
      onEnter: (_) => _onHoverChange(true),
      onExit: (_) => _onHoverChange(false),
      child: GestureDetector(
        onTapDown: _onTapDown,
        onTapUp: _onTapUp,
        onTapCancel: _onTapCancel,
        onTap: isDisabled ? null : widget.onPressed,
        child: AnimatedBuilder(
          animation: _animationController,
          builder: (context, child) {
            return Transform.translate(
              offset: Offset(
                0,
                _isPressed 
                  ? AppDimensions.activeTranslateY 
                  : (_isHovered ? AppDimensions.hoverTranslateY : 0),
              ),
              child: AnimatedScale(
                scale: _isPressed ? AppDimensions.scaleActive : AppDimensions.scaleNormal,
                duration: const Duration(milliseconds: AnimationConstants.fast),
                child: Container(
                  width: widget.isFullWidth 
                    ? double.infinity 
                    : widget.width,
                  height: widget.height ?? AppDimensions.buttonHeight,
                  padding: widget.padding ?? const EdgeInsets.symmetric(
                    horizontal: AppDimensions.buttonPaddingHorizontal,
                    vertical: AppDimensions.buttonPaddingVertical,
                  ),
                  decoration: BoxDecoration(
                    gradient: isDisabled
                      ? LinearGradient(
                          colors: [
                            AppColors.neutral['400']!,
                            AppColors.neutral['500']!,
                          ],
                        )
                      : LinearGradient(
                          begin: const Alignment(-0.5, -1.0),
                          end: const Alignment(0.5, 1.0),
                          colors: gradientColors,
                          stops: const [0.3, 0.9],
                        ),
                    borderRadius: widget.borderRadius ?? 
                      BorderRadius.circular(AppDimensions.buttonBorderRadius),
                    boxShadow: isDisabled 
                      ? null 
                      : [
                          BoxShadow(
                            color: gradientColors.first.withOpacity(0.3),
                            blurRadius: _elevationAnimation.value,
                            offset: Offset(0, _elevationAnimation.value / 3),
                          ),
                        ],
                  ),
                  child: Material(
                    color: Colors.transparent,
                    child: Center(
                      child: widget.isLoading
                        ? SizedBox(
                            width: AppDimensions.iconSmall,
                            height: AppDimensions.iconSmall,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              valueColor: AlwaysStoppedAnimation<Color>(
                                Colors.white,
                              ),
                            ),
                          )
                        : Row(
                            mainAxisSize: MainAxisSize.min,
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              if (widget.icon != null) ...[
                                Icon(
                                  widget.icon,
                                  size: AppDimensions.buttonIconSize,
                                  color: Colors.white,
                                ),
                                const SizedBox(width: AppDimensions.spacingSmall),
                              ],
                              Text(
                                widget.text,
                                style: widget.textStyle ?? 
                                  Theme.of(context).textTheme.labelLarge?.copyWith(
                                    color: Colors.white,
                                    fontWeight: FontWeight.w600,
                                    fontSize: 15.2, // 0.95rem exact de la PWA
                                  ),
                                textAlign: TextAlign.center,
                              ),
                            ],
                          ),
                    ),
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}

/// Bouton outline personnalisé
class CustomOutlineButton extends StatefulWidget {
  final String text;
  final VoidCallback? onPressed;
  final IconData? icon;
  final bool isLoading;
  final bool isFullWidth;
  final Color? borderColor;
  final Color? textColor;
  final EdgeInsetsGeometry? padding;
  final double? width;
  final double? height;
  final bool enabled;

  const CustomOutlineButton({
    Key? key,
    required this.text,
    this.onPressed,
    this.icon,
    this.isLoading = false,
    this.isFullWidth = false,
    this.borderColor,
    this.textColor,
    this.padding,
    this.width,
    this.height,
    this.enabled = true,
  }) : super(key: key);

  @override
  State<CustomOutlineButton> createState() => _CustomOutlineButtonState();
}

class _CustomOutlineButtonState extends State<CustomOutlineButton> {
  bool _isPressed = false;
  bool _isHovered = false;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDisabled = !widget.enabled || widget.isLoading;
    final borderColor = widget.borderColor ?? theme.colorScheme.primary;
    final textColor = widget.textColor ?? theme.colorScheme.primary;

    return MouseRegion(
      onEnter: (_) => setState(() => _isHovered = true),
      onExit: (_) => setState(() => _isHovered = false),
      child: GestureDetector(
        onTapDown: (_) => setState(() => _isPressed = true),
        onTapUp: (_) => setState(() => _isPressed = false),
        onTapCancel: () => setState(() => _isPressed = false),
        onTap: isDisabled ? null : widget.onPressed,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: AnimationConstants.normal),
          width: widget.isFullWidth ? double.infinity : widget.width,
          height: widget.height ?? AppDimensions.buttonHeight,
          padding: widget.padding ?? const EdgeInsets.symmetric(
            horizontal: AppDimensions.buttonPaddingHorizontal,
            vertical: AppDimensions.buttonPaddingVertical,
          ),
          decoration: BoxDecoration(
            color: _isHovered && !isDisabled 
              ? borderColor.withOpacity(0.04) 
              : Colors.transparent,
            border: Border.all(
              color: isDisabled 
                ? AppColors.neutral['400']! 
                : borderColor,
              width: 2,
            ),
            borderRadius: BorderRadius.circular(AppDimensions.buttonBorderRadius),
          ),
          transform: Matrix4.translationValues(
            0,
            _isPressed ? AppDimensions.activeTranslateY : 
            (_isHovered ? AppDimensions.hoverTranslateY : 0),
            0,
          ),
          child: Center(
            child: widget.isLoading
              ? SizedBox(
                  width: AppDimensions.iconSmall,
                  height: AppDimensions.iconSmall,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    valueColor: AlwaysStoppedAnimation<Color>(textColor),
                  ),
                )
              : Row(
                  mainAxisSize: MainAxisSize.min,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    if (widget.icon != null) ...[
                      Icon(
                        widget.icon,
                        size: AppDimensions.buttonIconSize,
                        color: isDisabled 
                          ? AppColors.neutral['400']! 
                          : textColor,
                      ),
                      const SizedBox(width: AppDimensions.spacingSmall),
                    ],
                    Text(
                      widget.text,
                      style: theme.textTheme.labelLarge?.copyWith(
                        color: isDisabled 
                          ? AppColors.neutral['400']! 
                          : textColor,
                        fontWeight: FontWeight.w600,
                        fontSize: 15.2, // 0.95rem exact de la PWA
                      ),
                    ),
                  ],
                ),
          ),
        ),
      ),
    );
  }
}