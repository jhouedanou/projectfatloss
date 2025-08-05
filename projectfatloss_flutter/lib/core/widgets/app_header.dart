import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../constants/app_colors.dart';
import '../constants/app_dimensions.dart';
import '../constants/app_typography.dart';
import '../constants/animation_constants.dart';
import '../theme/app_theme.dart';

/// Header personnalisé reproduisant exactement le header de la PWA
class AppHeader extends StatelessWidget implements PreferredSizeWidget {
  final String title;
  final List<Widget>? actions;
  final Widget? leading;
  final bool showBackButton;
  final VoidCallback? onBackPressed;
  final bool centerTitle;
  final double? elevation;
  final Color? backgroundColor;
  final bool useGradient;

  const AppHeader({
    Key? key,
    required this.title,
    this.actions,
    this.leading,
    this.showBackButton = false,
    this.onBackPressed,
    this.centerTitle = false,
    this.elevation,
    this.backgroundColor,
    this.useGradient = true,
  }) : super(key: key);

  @override
  Size get preferredSize => const Size.fromHeight(AppDimensions.headerHeight);

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        gradient: useGradient ? AppTheme.headerGradient : null,
        color: !useGradient ? (backgroundColor ?? AppColors.vermilion) : null,
        boxShadow: [
          BoxShadow(
            color: AppColors.primaryWithOpacity(0.3),
            blurRadius: AppDimensions.shadowBlurRadiusXL,
            offset: const Offset(0, AppDimensions.shadowOffset),
          ),
        ],
      ),
      child: ClipRRect(
        child: BackdropFilter(
          filter: ImageFilter.blur(
            sigmaX: AnimationConstants.backdropBlurMedium,
            sigmaY: AnimationConstants.backdropBlurMedium,
          ),
          child: AppBar(
            backgroundColor: Colors.transparent,
            foregroundColor: Colors.white,
            elevation: 0,
            centerTitle: centerTitle,
            systemOverlayStyle: const SystemUiOverlayStyle(
              statusBarColor: Colors.transparent,
              statusBarIconBrightness: Brightness.light,
              statusBarBrightness: Brightness.dark,
            ),
            leading: _buildLeading(context),
            title: Text(
              title,
              style: AppTypography.headerTitle.copyWith(
                color: Colors.white,
                textBaseline: TextBaseline.alphabetic,
                letterSpacing: 1.0,
              ),
            ),
            actions: actions ?? [],
            titleSpacing: AppDimensions.headerTitleSpacing,
          ),
        ),
      ),
    );
  }

  Widget? _buildLeading(BuildContext context) {
    if (leading != null) return leading;
    if (!showBackButton) return null;

    return IconButton(
      onPressed: onBackPressed ?? () => Navigator.of(context).pop(),
      icon: const Icon(Icons.arrow_back),
      iconSize: AppDimensions.headerIconSize,
      splashRadius: AppDimensions.iconMedium,
    );
  }
}

/// Bouton d'action pour le header avec animations
class HeaderActionButton extends StatefulWidget {
  final IconData icon;
  final VoidCallback? onPressed;
  final String? tooltip;
  final bool isActive;
  final Color? activeColor;
  final double? size;

  const HeaderActionButton({
    Key? key,
    required this.icon,
    this.onPressed,
    this.tooltip,
    this.isActive = false,
    this.activeColor,
    this.size,
  }) : super(key: key);

  @override
  State<HeaderActionButton> createState() => _HeaderActionButtonState();
}

class _HeaderActionButtonState extends State<HeaderActionButton>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _scaleAnimation;
  bool _isPressed = false;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: AnimationConstants.fast),
      vsync: this,
    );

    _scaleAnimation = Tween<double>(
      begin: 1.0,
      end: AppDimensions.scaleActive,
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
    setState(() => _isPressed = true);
    _animationController.forward();
  }

  void _onTapUp(TapUpDetails details) {
    setState(() => _isPressed = false);
    _animationController.reverse();
  }

  void _onTapCancel() {
    setState(() => _isPressed = false);
    _animationController.reverse();
  }

  @override
  Widget build(BuildContext context) {
    final button = AnimatedBuilder(
      animation: _scaleAnimation,
      builder: (context, child) {
        return Transform.scale(
          scale: _scaleAnimation.value,
          child: Container(
            width: AppDimensions.toggleButtonSize,
            height: AppDimensions.toggleButtonSize,
            decoration: BoxDecoration(
              color: widget.isActive
                ? AppColors.whiteWithOpacity(0.25)
                : AppColors.whiteWithOpacity(0.1),
              borderRadius: BorderRadius.circular(AppDimensions.toggleButtonBorderRadius),
              border: Border.all(
                color: widget.isActive
                  ? AppColors.whiteWithOpacity(0.4)
                  : AppColors.whiteWithOpacity(0.2),
                width: 1,
              ),
            ),
            child: Material(
              color: Colors.transparent,
              child: InkWell(
                borderRadius: BorderRadius.circular(AppDimensions.toggleButtonBorderRadius),
                onTap: widget.onPressed,
                child: Center(
                  child: Icon(
                    widget.icon,
                    size: widget.size ?? AppDimensions.toggleButtonIconSize,
                    color: widget.isActive && widget.activeColor != null
                      ? widget.activeColor
                      : Colors.white,
                  ),
                ),
              ),
            ),
          ),
        );
      },
    );

    return GestureDetector(
      onTapDown: _onTapDown,
      onTapUp: _onTapUp,
      onTapCancel: _onTapCancel,
      child: widget.tooltip != null
        ? Tooltip(
            message: widget.tooltip!,
            child: button,
          )
        : button,
    );
  }
}

/// Toggle button spécialisé pour les vues (calendrier/liste)
class ViewToggleButton extends StatefulWidget {
  final IconData icon;
  final String label;
  final bool isActive;
  final VoidCallback? onPressed;
  final bool isDisabled;

  const ViewToggleButton({
    Key? key,
    required this.icon,
    required this.label,
    this.isActive = false,
    this.onPressed,
    this.isDisabled = false,
  }) : super(key: key);

  @override
  State<ViewToggleButton> createState() => _ViewToggleButtonState();
}

class _ViewToggleButtonState extends State<ViewToggleButton>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _scaleAnimation;
  late Animation<Offset> _offsetAnimation;
  bool _isHovered = false;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: AnimationConstants.slow),
      vsync: this,
    );

    _scaleAnimation = Tween<double>(
      begin: 1.0,
      end: 1.05,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    ));

    _offsetAnimation = Tween<Offset>(
      begin: Offset.zero,
      end: const Offset(0, AppDimensions.hoverTranslateY),
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

  void _onHoverChange(bool isHovered) {
    if (widget.isDisabled) return;
    
    setState(() => _isHovered = isHovered);
    if (isHovered) {
      _animationController.forward();
    } else {
      _animationController.reverse();
    }
  }

  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      onEnter: (_) => _onHoverChange(true),
      onExit: (_) => _onHoverChange(false),
      child: AnimatedBuilder(
        animation: _animationController,
        builder: (context, child) {
          return Transform.translate(
            offset: _offsetAnimation.value,
            child: Transform.scale(
              scale: _scaleAnimation.value,
              child: GestureDetector(
                onTap: widget.isDisabled ? null : widget.onPressed,
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: AnimationConstants.slow),
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppDimensions.viewTogglePaddingH,
                    vertical: AppDimensions.viewTogglePaddingV,
                  ),
                  constraints: const BoxConstraints(
                    minWidth: AppDimensions.viewToggleMinWidth,
                  ),
                  decoration: BoxDecoration(
                    color: widget.isActive
                      ? AppColors.whiteWithOpacity(0.25)
                      : (_isHovered ? AppColors.whiteWithOpacity(0.2) : AppColors.whiteWithOpacity(0.1)),
                    borderRadius: BorderRadius.circular(AppDimensions.toggleButtonBorderRadius),
                    border: Border.all(
                      color: widget.isActive
                        ? AppColors.whiteWithOpacity(0.4)
                        : AppColors.whiteWithOpacity(0.2),
                      width: 1,
                    ),
                    boxShadow: widget.isActive
                      ? [
                          BoxShadow(
                            color: AppColors.whiteWithOpacity(0.2),
                            blurRadius: AppDimensions.shadowBlurRadiusLarge,
                            offset: const Offset(0, AppDimensions.shadowOffset),
                          ),
                        ]
                      : null,
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        widget.icon,
                        size: AppDimensions.viewToggleIconSize,
                        color: widget.isDisabled
                          ? Colors.white38
                          : Colors.white,
                      ),
                      const SizedBox(height: AppDimensions.viewToggleGap),
                      Text(
                        widget.label,
                        style: AppTypography.viewToggleText.copyWith(
                          color: widget.isDisabled
                            ? Colors.white38
                            : Colors.white,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}

/// Header avec contrôles personnalisés (thème, vue, etc.)
class CustomAppHeader extends StatelessWidget {
  final String title;
  final bool isDarkMode;
  final VoidCallback? onThemeToggle;
  final String? currentView;
  final List<ViewOption>? viewOptions;
  final Function(String)? onViewChanged;

  const CustomAppHeader({
    Key? key,
    required this.title,
    this.isDarkMode = false,
    this.onThemeToggle,
    this.currentView,
    this.viewOptions,
    this.onViewChanged,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return AppHeader(
      title: title,
      actions: [
        // View toggle buttons
        if (viewOptions != null && viewOptions!.isNotEmpty) ...[
          ...viewOptions!.map((option) => Padding(
            padding: const EdgeInsets.only(right: AppDimensions.spacingSmall),
            child: ViewToggleButton(
              icon: option.icon,
              label: option.label,
              isActive: currentView == option.value,
              isDisabled: option.isDisabled,
              onPressed: () => onViewChanged?.call(option.value),
            ),
          )),
        ],
        
        // Theme toggle
        if (onThemeToggle != null)
          Padding(
            padding: const EdgeInsets.only(right: AppDimensions.paddingLarge),
            child: HeaderActionButton(
              icon: isDarkMode ? Icons.light_mode : Icons.dark_mode,
              onPressed: onThemeToggle,
              tooltip: isDarkMode ? 'Mode clair' : 'Mode sombre',
            ),
          ),
      ],
    );
  }
}

/// Modèle pour les options de vue
class ViewOption {
  final String value;
  final String label;
  final IconData icon;
  final bool isDisabled;

  const ViewOption({
    required this.value,
    required this.label,
    required this.icon,
    this.isDisabled = false,
  });
}