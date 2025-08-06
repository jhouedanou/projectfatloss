import 'package:flutter/material.dart';

/// Palette de couleurs exacte extraite de la PWA Project Fat Loss
/// Reproduction pixel-perfect des couleurs CSS
class AppColors {
  // Couleurs principales - Rouge/Orange de l'app
  static const Color vermilion = Color(0xFFF03D32);      // #F03D32 - Couleur principale
  static const Color vermilion2 = Color(0xFFF13D30);     // #F13D30 - Vermilion-2
  static const Color cinnabar = Color(0xFFF34430);       // #F34430 - Cinnabar
  static const Color cinnabar2 = Color(0xFFF6452F);      // #F6452F - Cinnabar-2
  static const Color rosewood = Color(0xFF6A1D1C);       // #6A1D1C - Rosewood
  static const Color seashell = Color(0xFFFDF6F0);       // #FDF6F0 - Seashell

  // Palette étendue pour les différentes nuances
  static const Map<String, Color> primary = {
    '50': Color(0xFFFFF3F0),    // #FFF3F0
    '100': Color(0xFFFFEBE5),   // #FFEBE5
    '200': Color(0xFFFFD1CC),   // #FFD1CC
    '300': Color(0xFFFFB8B3),   // #FFB8B3
    '400': Color(0xFFFF8A7A),   // #FF8A7A
    '500': vermilion,           // #F03D32 - Main
    '600': Color(0xFFE02A1F),   // #E02A1F
    '700': Color(0xFFC41E0B),   // #C41E0B
    '800': Color(0xFFA11708),   // #A11708
    '900': Color(0xFF7A1306),   // #7A1306
  };

  // Couleur secondaire - Orange chaud
  static const Map<String, Color> secondary = {
    '50': Color(0xFFFFF7F0),    // #FFF7F0
    '100': Color(0xFFFFEDE0),   // #FFEDE0
    '200': Color(0xFFFFD6B3),   // #FFD6B3
    '300': Color(0xFFFFBF85),   // #FFBF85
    '400': Color(0xFFFF9147),   // #FF9147
    '500': Color(0xFFFF6B35),   // #FF6B35 - Orange secondaire
    '600': Color(0xFFF55A24),   // #F55A24
    '700': Color(0xFFE04A15),   // #E04A15
    '800': Color(0xFFCC3A0A),   // #CC3A0A
    '900': Color(0xFFB32D00),   // #B32D00
  };

  // Couleurs neutres
  static const Map<String, Color> neutral = {
    '50': Color(0xFFFAFAFA),    // #FAFAFA
    '100': Color(0xFFF5F5F5),   // #F5F5F5
    '200': Color(0xFFEEEEEE),   // #EEEEEE
    '300': Color(0xFFE0E0E0),   // #E0E0E0
    '400': Color(0xFFBDBDBD),   // #BDBDBD
    '500': Color(0xFF9E9E9E),   // #9E9E9E
    '600': Color(0xFF757575),   // #757575
    '700': Color(0xFF616161),   // #616161
    '800': Color(0xFF424242),   // #424242
    '900': Color(0xFF212121),   // #212121
  };

  // Couleurs sémantiques
  static const Map<String, Color> success = {
    '50': Color(0xFFE8F5E8),    // #E8F5E8
    '100': Color(0xFFC8E6C9),   // #C8E6C9
    '500': Color(0xFF4CAF50),   // #4CAF50
    '600': Color(0xFF43A047),   // #43A047
    '700': Color(0xFF388E3C),   // #388E3C
  };

  static const Map<String, Color> warning = {
    '50': Color(0xFFFFF8E1),    // #FFF8E1
    '100': Color(0xFFFFECB3),   // #FFECB3
    '500': Color(0xFFFF9800),   // #FF9800
    '600': Color(0xFFFB8C00),   // #FB8C00
    '700': Color(0xFFF57C00),   // #F57C00
  };

  static const Map<String, Color> error = {
    '50': Color(0xFFFFEBEE),    // #FFEBEE
    '100': Color(0xFFFFCDD2),   // #FFCDD2
    '500': Color(0xFFF44336),   // #F44336
    '600': Color(0xFFE53935),   // #E53935
    '700': Color(0xFFD32F2F),   // #D32F2F
  };

  static const Map<String, Color> info = {
    '50': Color(0xFFE3F2FD),    // #E3F2FD
    '100': Color(0xFFBBDEFB),   // #BBDEFB
    '500': Color(0xFF2196F3),   // #2196F3
    '600': Color(0xFF1E88E5),   // #1E88E5
    '700': Color(0xFF1976D2),   // #1976D2
  };

  // Couleurs spéciales pour l'application
  static const Color blueIndigo = Color(0xFF536DFE);     // #536DFE - Pour les séries
  static const Color blueIndigoLight = Color(0xFF82B1FF); // #82B1FF - Version claire
  static const Color darkGreen = Color(0xFF2E7D32);      // #2E7D32 - Pour le succès
  static const Color blueGrey = Color(0xFF455A64);       // #455A64 - Bleu-gris
  static const Color orange = Color(0xFFFF9800);         // #FF9800 - Orange warning

  // Backgrounds pour les modes clair et sombre
  static const Color backgroundLight = Color(0xFFFAFAFA); // #FAFAFA - Mode clair
  static const Color backgroundDark = Color(0xFF0A0A0A);  // #0A0A0A - Mode sombre
  static const Color paperLight = Color(0xFFFFFFFF);     // #FFFFFF - Paper clair
  static const Color paperDark = Color(0xFF1A1A1A);      // #1A1A1A - Paper sombre
  static const Color secondaryBackgroundDark = Color(0xFF2A2A2A); // #2A2A2A

  // Couleurs de texte
  static const Color textPrimaryLight = Color(0xFF212121); // #212121 - Texte principal clair
  static const Color textPrimaryDark = Color(0xFFFFFFFF);  // #FFFFFF - Texte principal sombre
  static const Color textSecondaryLight = Color(0xFF616161); // #616161 - Texte secondaire clair
  static const Color textSecondaryDark = Color(0xFFE0E0E0);  // #E0E0E0 - Texte secondaire sombre

  // Couleurs des dividers
  static const Color dividerLight = Color(0xFFE0E0E0);    // #E0E0E0
  static const Color dividerDark = Color(0xFF424242);     // #424242

  // Gradients reproductants les CSS
  static const List<Color> primaryGradient = [vermilion, Color(0xFFFF6B35)]; // 30% à 90%
  static const List<Color> secondaryGradient = [Color(0xFFFF9147), Color(0xFFE02A1F)]; // 0% à 100%
  static const List<Color> successGradient = [Color(0xFF4CAF50), Color(0xFF43A047)]; // 30% à 90%

  // Header gradient exact de la PWA
  static const List<Color> headerGradient = [
    vermilion,              // #F03D32 à 0%
    Color(0xFFFF6B35),      // #FF6B35 à 50%
    Color(0xFFF7931E),      // #F7931E à 100%
  ];

  // Fat Burner mode colors
  static const List<Color> fatBurnerGradient = [
    Color(0xFFFFA726),      // #FFA726 - Orange-ambre
    Color(0xFFEF5350),      // #EF5350 - Rouge plus clair
  ];

  static const List<Color> autoModeGradient = [
    Color(0xFFFF6B35),      // #FF6B35
    Color(0xFFF7931E),      // #F7931E
  ];

  // Couleurs avec opacité pour les overlays
  static Color primaryWithOpacity(double opacity) => vermilion.withOpacity(opacity);
  static Color secondaryWithOpacity(double opacity) => (secondary['500'] ?? secondary['400']!).withOpacity(opacity);
  static Color blackWithOpacity(double opacity) => Colors.black.withOpacity(opacity);
  static Color whiteWithOpacity(double opacity) => Colors.white.withOpacity(opacity);

  // Couleurs spéciales pour les états
  static const Color floatingCaloriesDefault = blueGrey;  // #455A64
  static Color floatingCaloriesCompleted = darkGreen.withOpacity(0.9); // rgba(46, 125, 50, 0.9)
  static Color cardShadowLight = Colors.black.withOpacity(0.1);
  static Color cardShadowDark = Colors.black.withOpacity(0.2);
}