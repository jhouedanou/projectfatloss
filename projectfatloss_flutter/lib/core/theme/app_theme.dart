import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../constants/app_colors.dart';
import '../constants/app_typography.dart';
import '../constants/app_dimensions.dart';

/// Thème principal de l'application reproduisant pixel-perfect la PWA Project Fat Loss
class AppTheme {
  // Couleurs de thème pour mode clair
  static final ColorScheme _lightColorScheme = ColorScheme.light(
    primary: AppColors.vermilion,
    onPrimary: Colors.white,
    primaryContainer: AppColors.primary['100']!,
    onPrimaryContainer: AppColors.primary['900']!,
    
    secondary: AppColors.secondary['500']!,
    onSecondary: Colors.white,
    secondaryContainer: AppColors.secondary['100']!,
    onSecondaryContainer: AppColors.secondary['900']!,
    
    tertiary: AppColors.blueIndigo,
    onTertiary: Colors.white,
    
    error: AppColors.error['500']!,
    onError: Colors.white,
    errorContainer: AppColors.error['100']!,
    onErrorContainer: AppColors.error['700']!,
    
    background: AppColors.backgroundLight,
    onBackground: AppColors.textPrimaryLight,
    
    surface: AppColors.paperLight,
    onSurface: AppColors.textPrimaryLight,
    surfaceVariant: AppColors.neutral['100']!,
    onSurfaceVariant: AppColors.textSecondaryLight,
    
    outline: AppColors.dividerLight,
    outlineVariant: AppColors.neutral['200']!,
    
    shadow: Colors.black,
    scrim: Colors.black54,
    
    inverseSurface: AppColors.paperDark,
    onInverseSurface: AppColors.textPrimaryDark,
    inversePrimary: AppColors.primary['200']!,
  );

  // Couleurs de thème pour mode sombre
  static final ColorScheme _darkColorScheme = ColorScheme.dark(
    primary: AppColors.vermilion,
    onPrimary: Colors.white,
    primaryContainer: AppColors.primary['800']!,
    onPrimaryContainer: AppColors.primary['200']!,
    
    secondary: AppColors.secondary['500']!,
    onSecondary: Colors.white,
    secondaryContainer: AppColors.secondary['800']!,
    onSecondaryContainer: AppColors.secondary['200']!,
    
    tertiary: AppColors.blueIndigoLight,
    onTertiary: Colors.black,
    
    error: AppColors.error['400']!,
    onError: Colors.black,
    errorContainer: AppColors.error['800']!,
    onErrorContainer: AppColors.error['200']!,
    
    background: AppColors.backgroundDark,
    onBackground: AppColors.textPrimaryDark,
    
    surface: AppColors.paperDark,
    onSurface: AppColors.textPrimaryDark,
    surfaceVariant: AppColors.secondaryBackgroundDark,
    onSurfaceVariant: AppColors.textSecondaryDark,
    
    outline: AppColors.dividerDark,
    outlineVariant: AppColors.neutral['700']!,
    
    shadow: Colors.black,
    scrim: Colors.black87,
    
    inverseSurface: AppColors.paperLight,
    onInverseSurface: AppColors.textPrimaryLight,
    inversePrimary: AppColors.primary['600']!,
  );

  /// Crée le thème pour le mode spécifié
  static ThemeData createTheme(bool isDark) {
    final colorScheme = isDark ? _darkColorScheme : _lightColorScheme;
    
    return ThemeData(
      useMaterial3: true,
      colorScheme: colorScheme,
      
      // Typography basée sur la PWA
      textTheme: TextTheme(
        displayLarge: AppTypography.h1.copyWith(color: colorScheme.onBackground),
        displayMedium: AppTypography.h2.copyWith(color: colorScheme.onBackground),
        displaySmall: AppTypography.h3.copyWith(color: colorScheme.onBackground),
        headlineLarge: AppTypography.h4.copyWith(color: colorScheme.onBackground),
        headlineMedium: AppTypography.h5.copyWith(color: colorScheme.onBackground),
        headlineSmall: AppTypography.h6.copyWith(color: colorScheme.onBackground),
        titleLarge: AppTypography.h5.copyWith(color: colorScheme.onBackground),
        titleMedium: AppTypography.h6.copyWith(color: colorScheme.onBackground),
        titleSmall: AppTypography.body1.copyWith(
          color: colorScheme.onBackground,
          fontWeight: FontWeight.w600,
        ),
        bodyLarge: AppTypography.body1.copyWith(color: colorScheme.onBackground),
        bodyMedium: AppTypography.body2.copyWith(color: colorScheme.onBackground),
        bodySmall: AppTypography.caption.copyWith(color: colorScheme.onSurfaceVariant),
        labelLarge: AppTypography.button.copyWith(color: colorScheme.onPrimary),
        labelMedium: AppTypography.button.copyWith(
          color: colorScheme.onSurfaceVariant,
          fontSize: 12,
        ),
        labelSmall: AppTypography.overline.copyWith(color: colorScheme.onSurfaceVariant),
      ),
      
      // Configuration générale
      visualDensity: VisualDensity.adaptivePlatformDensity,
      fontFamily: AppTypography.fontFamily,
      
      // AppBar avec gradient exact de la PWA
      appBarTheme: AppBarTheme(
        elevation: 0,
        centerTitle: false,
        backgroundColor: Colors.transparent,
        foregroundColor: Colors.white,
        titleTextStyle: AppTypography.headerTitle.copyWith(
          color: Colors.white,
          textBaseline: TextBaseline.alphabetic,
        ),
        systemOverlayStyle: const SystemUiOverlayStyle(
          statusBarColor: Colors.transparent,
          statusBarIconBrightness: Brightness.light,
        ),
      ),
      
      // Boutons avec styles exacts de la PWA
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          elevation: 0,
          padding: const EdgeInsets.symmetric(
            horizontal: AppDimensions.buttonPaddingHorizontal,
            vertical: AppDimensions.buttonPaddingVertical,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppDimensions.buttonBorderRadius),
          ),
          textStyle: AppTypography.button,
          // Gradient sera appliqué via decoration dans le widget personnalisé
        ),
      ),
      
      // Boutons outlined
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          padding: const EdgeInsets.symmetric(
            horizontal: AppDimensions.buttonPaddingHorizontal,
            vertical: AppDimensions.buttonPaddingVertical,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppDimensions.buttonBorderRadius),
          ),
          side: BorderSide(
            color: colorScheme.primary,
            width: 2,
          ),
          textStyle: AppTypography.button,
        ),
      ),
      
      // Boutons text
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          padding: const EdgeInsets.symmetric(
            horizontal: AppDimensions.buttonPaddingHorizontal,
            vertical: AppDimensions.buttonPaddingVertical,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppDimensions.buttonBorderRadius),
          ),
          textStyle: AppTypography.button,
        ),
      ),
      
      // Cards avec styles exacts de la PWA  
      cardTheme: CardTheme(
        elevation: AppDimensions.elevation2,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppDimensions.cardBorderRadius),
          side: BorderSide(
            color: isDark ? AppColors.neutral['800']! : AppColors.neutral['200']!,
            width: 1,
          ),
        ),
        margin: const EdgeInsets.all(AppDimensions.cardMargin),
        color: colorScheme.surface,
        shadowColor: colorScheme.shadow,
      ),
      
      // Chips avec styles personnalisés
      chipTheme: ChipThemeData(
        backgroundColor: colorScheme.surfaceVariant,
        selectedColor: colorScheme.primary,
        disabledColor: colorScheme.surfaceVariant.withOpacity(0.5),
        labelStyle: AppTypography.body2,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppDimensions.borderRadiusSmall),
        ),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      ),
      
      // Input decoration
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: colorScheme.surfaceVariant,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppDimensions.borderRadiusMedium),
          borderSide: BorderSide.none,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppDimensions.borderRadiusMedium),
          borderSide: BorderSide(color: colorScheme.outline),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppDimensions.borderRadiusMedium),
          borderSide: BorderSide(color: colorScheme.primary, width: 2),
        ),
        contentPadding: const EdgeInsets.symmetric(
          horizontal: AppDimensions.paddingLarge,
          vertical: AppDimensions.paddingMedium,
        ),
      ),
      
      // Floating Action Button
      floatingActionButtonTheme: FloatingActionButtonThemeData(
        backgroundColor: colorScheme.primary,
        foregroundColor: colorScheme.onPrimary,
        elevation: AppDimensions.elevation6,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppDimensions.borderRadiusLarge),
        ),
      ),
      
      // Navigation Bar (Bottom)
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: colorScheme.surface,
        indicatorColor: colorScheme.primary.withOpacity(0.12),
        labelTextStyle: MaterialStateProperty.all(
          AppTypography.caption.copyWith(color: colorScheme.onSurface),
        ),
      ),
      
      // Tab Bar
      tabBarTheme: TabBarTheme(
        indicatorColor: Colors.white,
        indicatorWeight: 2,
        labelStyle: AppTypography.body2.copyWith(
          fontWeight: FontWeight.w600,
          color: Colors.white,
        ),
        unselectedLabelStyle: AppTypography.body2.copyWith(
          color: Colors.white70,
        ),
        overlayColor: MaterialStateProperty.all(Colors.white12),
      ),
      
      // Divider
      dividerTheme: DividerThemeData(
        color: colorScheme.outline,
        thickness: 1,
        space: 1,
      ),
      
      // List Tile
      listTileTheme: ListTileThemeData(
        contentPadding: const EdgeInsets.symmetric(
          horizontal: AppDimensions.paddingLarge,
          vertical: AppDimensions.paddingSmall,
        ),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppDimensions.borderRadiusMedium),
        ),
      ),
      
      // Dialog
      dialogTheme: DialogTheme(
        backgroundColor: colorScheme.surface,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppDimensions.modalBorderRadius),
        ),
        titleTextStyle: AppTypography.h6.copyWith(color: colorScheme.onSurface),
        contentTextStyle: AppTypography.body2.copyWith(color: colorScheme.onSurface),
      ),
      
      // Bottom Sheet
      bottomSheetTheme: BottomSheetThemeData(
        backgroundColor: colorScheme.surface,
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(
            top: Radius.circular(AppDimensions.borderRadiusLarge),
          ),
        ),
      ),
      
      // Switch
      switchTheme: SwitchThemeData(
        thumbColor: MaterialStateProperty.resolveWith((states) {
          if (states.contains(MaterialState.selected)) {
            return colorScheme.primary;
          }
          return colorScheme.outline;
        }),
        trackColor: MaterialStateProperty.resolveWith((states) {
          if (states.contains(MaterialState.selected)) {
            return colorScheme.primary.withOpacity(0.5);
          }
          return colorScheme.surfaceVariant;
        }),
      ),
      
      // Slider
      sliderTheme: SliderThemeData(
        activeTrackColor: colorScheme.primary,
        inactiveTrackColor: colorScheme.primary.withOpacity(0.3),
        thumbColor: colorScheme.primary,
        overlayColor: colorScheme.primary.withOpacity(0.12),
      ),
      
      // Progress Indicator
      progressIndicatorTheme: ProgressIndicatorThemeData(
        color: colorScheme.primary,
        linearTrackColor: colorScheme.primary.withOpacity(0.3),
        circularTrackColor: colorScheme.primary.withOpacity(0.3),
      ),
      
      // Icon Theme
      iconTheme: IconThemeData(
        color: colorScheme.onSurface,
        size: AppDimensions.iconMedium,
      ),
      
      // Primary Icon Theme
      primaryIconTheme: IconThemeData(
        color: colorScheme.primary,
        size: AppDimensions.iconMedium,
      ),
    );
  }

  /// Extensions de couleurs personnalisées pour l'app
  static Map<String, Color> getCustomColors(bool isDark) {
    return {
      'gradient1': AppColors.vermilion,
      'gradient2': AppColors.secondary['500']!,
      'seriesText': AppColors.blueIndigo,
      'darkGreen': AppColors.darkGreen,
      'blueGrey': AppColors.blueGrey,
      'floatingCaloriesDefault': AppColors.floatingCaloriesDefault,
      'floatingCaloriesCompleted': AppColors.floatingCaloriesCompleted,
      'fatBurnerGradient1': AppColors.fatBurnerGradient[0],
      'fatBurnerGradient2': AppColors.fatBurnerGradient[1],
      'headerGradient1': AppColors.headerGradient[0],
      'headerGradient2': AppColors.headerGradient[1],
      'headerGradient3': AppColors.headerGradient[2],
    };
  }

  /// Gradients personnalisés reproduisant ceux de la PWA
  static List<BoxShadow> getCardShadow(bool isDark, {bool isElevated = false}) {
    if (isElevated) {
      return [
        BoxShadow(
          color: isDark ? AppColors.cardShadowDark : AppColors.cardShadowLight,
          blurRadius: AppDimensions.shadowBlurRadiusXL,
          offset: const Offset(0, AppDimensions.shadowOffsetXL),
        ),
      ];
    }
    return [
      BoxShadow(
        color: isDark ? AppColors.cardShadowDark : AppColors.cardShadowLight,
        blurRadius: AppDimensions.shadowBlurRadius,
        offset: const Offset(0, AppDimensions.shadowOffset),
      ),
    ];
  }

  /// Gradient principal de l'app (boutons, header)
  static LinearGradient get primaryGradient => const LinearGradient(
    begin: Alignment(-0.5, -1.0),
    end: Alignment(0.5, 1.0),
    colors: AppColors.primaryGradient,
    stops: [0.3, 0.9],
  );

  /// Gradient pour le header exact de la PWA
  static LinearGradient get headerGradient => const LinearGradient(
    begin: Alignment(-1.0, -1.0),
    end: Alignment(1.0, 1.0),
    colors: AppColors.headerGradient,
    stops: [0.0, 0.5, 1.0],
  );

  /// Gradient pour le mode Fat Burner
  static LinearGradient get fatBurnerGradient => const LinearGradient(
    begin: Alignment(-1.0, -1.0),
    end: Alignment(1.0, 1.0),
    colors: AppColors.fatBurnerGradient,
  );

  /// Gradient pour le mode Auto
  static LinearGradient get autoModeGradient => const LinearGradient(
    begin: Alignment(-0.5, -1.0),
    end: Alignment(0.5, 1.0),
    colors: AppColors.autoModeGradient,
  );
}