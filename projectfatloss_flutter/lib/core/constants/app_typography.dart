import 'package:flutter/material.dart';

/// Système typographique exact reproduisant la PWA Project Fat Loss
/// Basé sur Roboto avec fallbacks Inter/Arial
class AppTypography {
  // Police de base - reproduction exacte de la PWA
  static const String fontFamily = 'Roboto';
  static const List<String> fontFallbacks = ['Inter', 'Arial', 'sans-serif'];

  // Tailles de police exactes (converties de rem en pixels, base 16px)
  static const double h1Size = 40.0;    // 2.5rem = 40px
  static const double h2Size = 32.0;    // 2rem = 32px
  static const double h3Size = 28.0;    // 1.75rem = 28px
  static const double h4Size = 24.0;    // 1.5rem = 24px
  static const double h5Size = 20.0;    // 1.25rem = 20px
  static const double h6Size = 16.0;    // 1rem = 16px
  static const double body1Size = 16.0; // 1rem = 16px
  static const double body2Size = 14.0; // 0.875rem = 14px
  static const double buttonSize = 14.0; // 0.875rem = 14px
  static const double captionSize = 12.0; // 0.75rem = 12px
  static const double overlineSize = 10.0; // 0.625rem = 10px

  // Poids de police exacts
  static const FontWeight light = FontWeight.w300;
  static const FontWeight regular = FontWeight.w400;
  static const FontWeight medium = FontWeight.w500;
  static const FontWeight semiBold = FontWeight.w600;
  static const FontWeight bold = FontWeight.w700;

  // Hauteurs de ligne exactes
  static const double h1LineHeight = 1.2;
  static const double h2LineHeight = 1.3;
  static const double h3LineHeight = 1.3;
  static const double h4LineHeight = 1.4;
  static const double h5LineHeight = 1.4;
  static const double h6LineHeight = 1.5;
  static const double body1LineHeight = 1.6;
  static const double body2LineHeight = 1.5;
  static const double buttonLineHeight = 1.75;
  static const double captionLineHeight = 1.66;

  // Espacement des lettres exact
  static const double h1LetterSpacing = -0.01562;
  static const double h2LetterSpacing = -0.00833;
  static const double body1LetterSpacing = 0.00938;
  static const double body2LetterSpacing = 0.01071;
  static const double buttonLetterSpacing = 0.02857;
  static const double captionLetterSpacing = 0.03333;

  /// Styles de texte exacts reproduisant la PWA
  static TextStyle get h1 => const TextStyle(
    fontFamily: fontFamily,
    fontSize: h1Size,
    fontWeight: bold,
    height: h1LineHeight,
    letterSpacing: h1LetterSpacing,
  );

  static TextStyle get h2 => const TextStyle(
    fontFamily: fontFamily,
    fontSize: h2Size,
    fontWeight: semiBold,
    height: h2LineHeight,
    letterSpacing: h2LetterSpacing,
  );

  static TextStyle get h3 => const TextStyle(
    fontFamily: fontFamily,
    fontSize: h3Size,
    fontWeight: semiBold,
    height: h3LineHeight,
  );

  static TextStyle get h4 => const TextStyle(
    fontFamily: fontFamily,
    fontSize: h4Size,
    fontWeight: semiBold,
    height: h4LineHeight,
  );

  static TextStyle get h5 => const TextStyle(
    fontFamily: fontFamily,
    fontSize: h5Size,
    fontWeight: semiBold,
    height: h5LineHeight,
  );

  static TextStyle get h6 => const TextStyle(
    fontFamily: fontFamily,
    fontSize: h6Size,
    fontWeight: semiBold,
    height: h6LineHeight,
  );

  static TextStyle get body1 => const TextStyle(
    fontFamily: fontFamily,
    fontSize: body1Size,
    fontWeight: regular,
    height: body1LineHeight,
    letterSpacing: body1LetterSpacing,
  );

  static TextStyle get body2 => const TextStyle(
    fontFamily: fontFamily,
    fontSize: body2Size,
    fontWeight: regular,
    height: body2LineHeight,
    letterSpacing: body2LetterSpacing,
  );

  static TextStyle get button => const TextStyle(
    fontFamily: fontFamily,
    fontSize: buttonSize,
    fontWeight: medium,
    height: buttonLineHeight,
    letterSpacing: buttonLetterSpacing,
  );

  static TextStyle get caption => const TextStyle(
    fontFamily: fontFamily,
    fontSize: captionSize,
    fontWeight: regular,
    height: captionLineHeight,
    letterSpacing: captionLetterSpacing,
  );

  static TextStyle get overline => const TextStyle(
    fontFamily: fontFamily,
    fontSize: overlineSize,
    fontWeight: regular,
    letterSpacing: 1.5,
  );

  // Styles spécialisés pour l'application
  static TextStyle get headerTitle => const TextStyle(
    fontFamily: fontFamily,
    fontSize: 19.2, // 1.2rem = 19.2px
    fontWeight: bold,
    letterSpacing: 1.0,
  );

  static TextStyle get exerciseTitle => const TextStyle(
    fontFamily: fontFamily,
    fontSize: 17.6, // 1.1rem = 17.6px
    fontWeight: semiBold,
  );

  static TextStyle get exerciseSeries => const TextStyle(
    fontFamily: fontFamily,
    fontSize: 15.2, // 0.95rem = 15.2px
    fontWeight: regular,
  );

  static TextStyle get exerciseEquipment => const TextStyle(
    fontFamily: fontFamily,
    fontSize: 15.2, // 0.95rem = 15.2px
    fontWeight: regular,
  );

  static TextStyle get exerciseDescription => const TextStyle(
    fontFamily: fontFamily,
    fontSize: 15.52, // 0.97rem = 15.52px
    fontWeight: regular,
  );

  static TextStyle get timerDisplay => const TextStyle(
    fontFamily: 'Courier New', // Police monospace pour le timer
    fontSize: 40.0, // 2.5rem = 40px
    fontWeight: bold,
  );

  static TextStyle get timerLabel => const TextStyle(
    fontFamily: fontFamily,
    fontSize: 14.4, // 0.9rem = 14.4px
    fontWeight: regular,
  );

  static TextStyle get floatingCaloriesValue => const TextStyle(
    fontFamily: fontFamily,
    fontSize: 24.0, // 1.5rem = 24px
    fontWeight: bold,
  );

  static TextStyle get floatingCaloriesLabel => const TextStyle(
    fontFamily: fontFamily,
    fontSize: 11.2, // 0.7rem = 11.2px
    fontWeight: bold,
  );

  static TextStyle get viewToggleText => const TextStyle(
    fontFamily: fontFamily,
    fontSize: 9.6, // 0.6rem = 9.6px
    fontWeight: semiBold,
    letterSpacing: 0.5,
  );

  static TextStyle get calorieTotal => const TextStyle(
    fontFamily: fontFamily,
    fontSize: 19.2, // 1.2rem = 19.2px
    fontWeight: regular,
  );

  static TextStyle get calorieTotalValue => const TextStyle(
    fontFamily: fontFamily,
    fontSize: 22.4, // 1.4rem = 22.4px
    fontWeight: bold,
  );

  static TextStyle get languageButton => const TextStyle(
    fontFamily: fontFamily,
    fontSize: 14.4, // 0.9rem = 14.4px
    fontWeight: regular,
  );

  static TextStyle get navButtonText => const TextStyle(
    fontFamily: fontFamily,
    fontSize: 12.8, // 0.8rem = 12.8px
    fontWeight: regular,
    letterSpacing: 0.5,
  );

  static TextStyle get settingsButton => const TextStyle(
    fontFamily: fontFamily,
    fontSize: 14.4, // 0.9rem = 14.4px
    fontWeight: semiBold,
  );

  static TextStyle get fatBurnerText => const TextStyle(
    fontFamily: fontFamily,
    fontSize: 16.0, // 1rem = 16px
    fontWeight: bold,
  );

  // Méthodes utilitaires pour les variations de couleur
  static TextStyle withColor(TextStyle style, Color color) {
    return style.copyWith(color: color);
  }

  static TextStyle withWeight(TextStyle style, FontWeight weight) {
    return style.copyWith(fontWeight: weight);
  }

  static TextStyle withSize(TextStyle style, double size) {
    return style.copyWith(fontSize: size);
  }
}