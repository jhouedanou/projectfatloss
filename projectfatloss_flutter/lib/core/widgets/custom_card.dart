import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../constants/app_dimensions.dart';
import '../constants/animation_constants.dart';
import '../theme/app_theme.dart';

/// Card personnalisée reproduisant exactement les cards de la PWA
class CustomCard extends StatefulWidget {
  final Widget child;
  final EdgeInsetsGeometry? padding;
  final EdgeInsetsGeometry? margin;
  final Color? backgroundColor;
  final double? elevation;
  final BorderRadius? borderRadius;
  final Border? border;
  final VoidCallback? onTap;
  final bool enableHoverEffect;
  final bool enableShadowAnimation;
  final double? width;
  final double? height;

  const CustomCard({
    Key? key,
    required this.child,
    this.padding,
    this.margin,
    this.backgroundColor,
    this.elevation,
    this.borderRadius,
    this.border,
    this.onTap,
    this.enableHoverEffect = true,
    this.enableShadowAnimation = true,
    this.width,
    this.height,
  }) : super(key: key);

  @override
  State<CustomCard> createState() => _CustomCardState();
}

class _CustomCardState extends State<CustomCard>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _elevationAnimation;
  late Animation<Offset> _offsetAnimation;
  bool _isHovered = false;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: AnimationConstants.normal),
      vsync: this,
    );

    _elevationAnimation = Tween<double>(
      begin: AppDimensions.shadowBlurRadius,
      end: AppDimensions.shadowBlurRadiusXL,
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
    if (!widget.enableHoverEffect) return;
    
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
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    
    return MouseRegion(
      onEnter: (_) => _onHoverChange(true),
      onExit: (_) => _onHoverChange(false),
      child: GestureDetector(
        onTap: widget.onTap,
        child: AnimatedBuilder(
          animation: _animationController,
          builder: (context, child) {
            return Transform.translate(
              offset: widget.enableHoverEffect ? _offsetAnimation.value : Offset.zero,
              child: Container(
                width: widget.width,
                height: widget.height,
                margin: widget.margin ?? const EdgeInsets.all(AppDimensions.marginMedium),
                decoration: BoxDecoration(
                  color: widget.backgroundColor ?? theme.colorScheme.surface,
                  borderRadius: widget.borderRadius ?? 
                    BorderRadius.circular(AppDimensions.cardBorderRadius),
                  border: widget.border ?? Border.all(
                    color: isDark 
                      ? AppColors.neutral['800']! 
                      : AppColors.neutral['200']!,
                    width: 1,
                  ),
                  boxShadow: widget.enableShadowAnimation
                    ? [
                        BoxShadow(
                          color: isDark 
                            ? AppColors.cardShadowDark 
                            : AppColors.cardShadowLight,
                          blurRadius: _elevationAnimation.value,
                          offset: Offset(0, _elevationAnimation.value / 3),
                        ),
                      ]
                    : AppTheme.getCardShadow(isDark),
                ),
                child: ClipRRect(
                  borderRadius: widget.borderRadius ?? 
                    BorderRadius.circular(AppDimensions.cardBorderRadius),
                  child: Padding(
                    padding: widget.padding ?? 
                      const EdgeInsets.all(AppDimensions.cardPadding),
                    child: widget.child,
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

/// Card spécialisée pour les exercices
class ExerciseCard extends StatelessWidget {
  final String title;
  final String? series;
  final String? equipment;
  final String? description;
  final VoidCallback? onTap;
  final Widget? trailing;
  final bool isActive;

  const ExerciseCard({
    Key? key,
    required this.title,
    this.series,
    this.equipment,
    this.description,
    this.onTap,
    this.trailing,
    this.isActive = false,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    return CustomCard(
      onTap: onTap,
      padding: const EdgeInsets.all(AppDimensions.exoCardPadding),
      margin: const EdgeInsets.only(bottom: AppDimensions.exoCardMarginBottom),
      borderRadius: BorderRadius.circular(AppDimensions.exoCardBorderRadius),
      backgroundColor: isActive 
        ? theme.colorScheme.primary.withOpacity(0.1)
        : null,
      border: isActive 
        ? Border.all(color: theme.colorScheme.primary, width: 2)
        : null,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header avec titre et trailing
          Row(
            children: [
              Expanded(
                child: Text(
                  title,
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                    fontSize: 17.6, // 1.1rem exact de la PWA
                    color: theme.colorScheme.onSurface,
                  ),
                ),
              ),
              if (trailing != null) trailing!,
            ],
          ),
          
          if (series != null) ...[
            const SizedBox(height: AppDimensions.exoCardGap),
            Row(
              children: [
                Text(
                  'Séries: ',
                  style: theme.textTheme.bodyMedium?.copyWith(
                    fontSize: 15.2, // 0.95rem exact de la PWA
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                ),
                Text(
                  series!,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    fontSize: 15.2, // 0.95rem exact de la PWA
                    color: AppColors.blueIndigo,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ],
          
          if (equipment != null) ...[
            const SizedBox(height: AppDimensions.spacingSmall),
            Text(
              equipment!,
              style: theme.textTheme.bodyMedium?.copyWith(
                fontSize: 15.2, // 0.95rem exact de la PWA
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ),
          ],
          
          if (description != null) ...[
            const SizedBox(height: AppDimensions.exoCardGap),
            Text(
              description!,
              style: theme.textTheme.bodyMedium?.copyWith(
                fontSize: 15.52, // 0.97rem exact de la PWA
                color: theme.colorScheme.onSurface,
              ),
            ),
          ],
        ],
      ),
    );
  }
}

/// Card pour les statistiques avec animations
class StatsCard extends StatefulWidget {
  final String title;
  final String value;
  final String? subtitle;
  final IconData? icon;
  final Color? iconColor;
  final Color? valueColor;
  final VoidCallback? onTap;

  const StatsCard({
    Key? key,
    required this.title,
    required this.value,
    this.subtitle,
    this.icon,
    this.iconColor,
    this.valueColor,
    this.onTap,
  }) : super(key: key);

  @override
  State<StatsCard> createState() => _StatsCardState();
}

class _StatsCardState extends State<StatsCard>
    with SingleTickerProviderStateMixin {
  late AnimationController _pulseController;
  late Animation<double> _pulseAnimation;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      duration: const Duration(milliseconds: AnimationConstants.pulse),
      vsync: this,
    );

    _pulseAnimation = Tween<double>(
      begin: 1.0,
      end: 1.05,
    ).animate(CurvedAnimation(
      parent: _pulseController,
      curve: Curves.easeInOut,
    ));

    // Animation automatique pour les stats importantes
    if (widget.valueColor != null) {
      _pulseController.repeat(reverse: true);
    }
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    return AnimatedBuilder(
      animation: _pulseAnimation,
      builder: (context, child) {
        return Transform.scale(
          scale: _pulseAnimation.value,
          child: CustomCard(
            onTap: widget.onTap,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    if (widget.icon != null) ...[
                      Icon(
                        widget.icon,
                        color: widget.iconColor ?? theme.colorScheme.primary,
                        size: AppDimensions.iconMedium,
                      ),
                      const SizedBox(width: AppDimensions.spacingMedium),
                    ],
                    Expanded(
                      child: Text(
                        widget.title,
                        style: theme.textTheme.titleMedium,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: AppDimensions.spacingMedium),
                Text(
                  widget.value,
                  style: theme.textTheme.headlineMedium?.copyWith(
                    color: widget.valueColor ?? theme.colorScheme.primary,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                if (widget.subtitle != null) ...[
                  const SizedBox(height: AppDimensions.spacingSmall),
                  Text(
                    widget.subtitle!,
                    style: theme.textTheme.bodySmall,
                  ),
                ],
              ],
            ),
          ),
        );
      },
    );
  }
}

/// Card pour les paramètres
class SettingsCard extends StatelessWidget {
  final String title;
  final String? subtitle;
  final Widget? leading;
  final Widget? trailing;
  final VoidCallback? onTap;
  final bool showDivider;

  const SettingsCard({
    Key? key,
    required this.title,
    this.subtitle,
    this.leading,
    this.trailing,
    this.onTap,
    this.showDivider = true,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    return CustomCard(
      onTap: onTap,
      padding: EdgeInsets.zero,
      enableHoverEffect: onTap != null,
      child: Column(
        children: [
          ListTile(
            leading: leading,
            title: Text(
              title,
              style: theme.textTheme.titleMedium,
            ),
            subtitle: subtitle != null
              ? Text(
                  subtitle!,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                )
              : null,
            trailing: trailing,
            onTap: onTap,
            contentPadding: const EdgeInsets.symmetric(
              horizontal: AppDimensions.paddingLarge,
              vertical: AppDimensions.paddingSmall,
            ),
          ),
          if (showDivider)
            Divider(
              height: 1,
              thickness: 1,
              color: theme.colorScheme.outline.withOpacity(0.3),
            ),
        ],
      ),
    );
  }
}