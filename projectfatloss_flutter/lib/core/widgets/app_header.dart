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
            title: _buildTitle(context),
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

  Widget _buildTitle(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        // Logo avec effet de glow
        Container(
          margin: const EdgeInsets.only(right: AppDimensions.spacingMedium),
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: Colors.white.withOpacity(0.3),
                blurRadius: 8,
                spreadRadius: 2,
              ),
            ],
          ),
          child: CircleAvatar(
            radius: 20,
            backgroundColor: Colors.white.withOpacity(0.2),
            child: Icon(
              Icons.fitness_center,
              color: Colors.white,
              size: 24,
            ),
          ),
        ),
        // Titre avec style exact de la PWA
        Text(
          title,
          style: AppTypography.headerTitle.copyWith(
            color: Colors.white,
            textBaseline: TextBaseline.alphabetic,
            letterSpacing: 1.0,
            shadows: [
              Shadow(
                color: Colors.black.withOpacity(0.3),
                offset: const Offset(0, 2),
                blurRadius: 4,
              ),
            ],
          ),
        ),
      ],
    );
  }
}

/// Header personnalisé avec navigation par onglets
class CustomAppHeader extends StatelessWidget implements PreferredSizeWidget {
  final String title;
  final bool isDarkMode;
  final VoidCallback onThemeToggle;
  final String currentView;
  final List<ViewOption> viewOptions;
  final Function(String) onViewChanged;

  const CustomAppHeader({
    Key? key,
    required this.title,
    required this.isDarkMode,
    required this.onThemeToggle,
    required this.currentView,
    required this.viewOptions,
    required this.onViewChanged,
  }) : super(key: key);

  @override
  Size get preferredSize => const Size.fromHeight(AppDimensions.headerHeight);

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        gradient: AppTheme.headerGradient,
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
            systemOverlayStyle: const SystemUiOverlayStyle(
              statusBarColor: Colors.transparent,
              statusBarIconBrightness: Brightness.light,
              statusBarBrightness: Brightness.dark,
            ),
            title: _buildTitle(context),
            actions: _buildActions(context),
            bottom: _buildTabBar(context),
          ),
        ),
      ),
    );
  }

  Widget _buildTitle(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        // Logo avec effet de glow
        Container(
          margin: const EdgeInsets.only(right: AppDimensions.spacingMedium),
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: Colors.white.withOpacity(0.3),
                blurRadius: 8,
                spreadRadius: 2,
              ),
            ],
          ),
          child: CircleAvatar(
            radius: 20,
            backgroundColor: Colors.white.withOpacity(0.2),
            child: Icon(
              Icons.fitness_center,
              color: Colors.white,
              size: 24,
            ),
          ),
        ),
        // Titre avec style exact de la PWA
        Text(
          title,
          style: AppTypography.headerTitle.copyWith(
            color: Colors.white,
            textBaseline: TextBaseline.alphabetic,
            letterSpacing: 1.0,
            shadows: [
              Shadow(
                color: Colors.black.withOpacity(0.3),
                offset: const Offset(0, 2),
                blurRadius: 4,
              ),
            ],
          ),
        ),
      ],
    );
  }

  List<Widget> _buildActions(BuildContext context) {
    return [
      // Bouton notifications
      HeaderActionButton(
        icon: Icons.notifications_outlined,
        onPressed: () {
          // Ouvrir les paramètres de notifications
        },
      ),
      const SizedBox(width: AppDimensions.spacingSmall),
      // Bouton thème
      HeaderActionButton(
        icon: isDarkMode ? Icons.light_mode : Icons.dark_mode,
        onPressed: onThemeToggle,
      ),
      const SizedBox(width: AppDimensions.spacingMedium),
    ];
  }

  PreferredSizeWidget _buildTabBar(BuildContext context) {
    return PreferredSize(
      preferredSize: const Size.fromHeight(50),
      child: Container(
        height: 50,
        padding: const EdgeInsets.symmetric(horizontal: AppDimensions.paddingLarge),
        child: Row(
          children: viewOptions.map((option) {
            final isSelected = currentView == option.value;
            return Expanded(
              child: _buildTabButton(option, isSelected),
            );
          }).toList(),
        ),
      ),
    );
  }

  Widget _buildTabButton(ViewOption option, bool isSelected) {
    return GestureDetector(
      onTap: () => onViewChanged(option.value),
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 4),
        padding: const EdgeInsets.symmetric(
          vertical: AppDimensions.spacingSmall,
          horizontal: AppDimensions.spacingMedium,
        ),
        decoration: BoxDecoration(
          color: isSelected 
              ? Colors.white.withOpacity(0.2) 
              : Colors.transparent,
          borderRadius: BorderRadius.circular(AppDimensions.borderRadiusMedium),
          border: isSelected
              ? Border.all(color: Colors.white.withOpacity(0.3))
              : null,
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              option.icon,
              size: 16,
              color: Colors.white,
            ),
            const SizedBox(width: AppDimensions.spacingSmall),
            Text(
              option.label,
              style: AppTypography.body2.copyWith(
                color: Colors.white,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Bouton d'action pour le header avec animations
class HeaderActionButton extends StatefulWidget {
  final IconData icon;
  final VoidCallback? onPressed;
  final Color? color;
  final double? size;

  const HeaderActionButton({
    Key? key,
    required this.icon,
    this.onPressed,
    this.color,
    this.size,
  }) : super(key: key);

  @override
  State<HeaderActionButton> createState() => _HeaderActionButtonState();
}

class _HeaderActionButtonState extends State<HeaderActionButton>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 200),
      vsync: this,
    );
    _scaleAnimation = Tween<double>(
      begin: 1.0,
      end: 0.95,
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

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _scaleAnimation,
      builder: (context, child) {
        return Transform.scale(
          scale: _scaleAnimation.value,
          child: IconButton(
            onPressed: () {
              _animationController.forward().then((_) {
                _animationController.reverse();
              });
              widget.onPressed?.call();
            },
            icon: Icon(
              widget.icon,
              color: widget.color ?? Colors.white,
              size: widget.size ?? AppDimensions.headerIconSize,
            ),
            splashRadius: AppDimensions.iconMedium,
            style: IconButton.styleFrom(
              backgroundColor: Colors.white.withOpacity(0.1),
              shape: const CircleBorder(),
            ),
          ),
        );
      },
    );
  }
}

/// Option de vue pour la navigation
class ViewOption {
  final String value;
  final String label;
  final IconData icon;

  const ViewOption({
    required this.value,
    required this.label,
    required this.icon,
  });
}