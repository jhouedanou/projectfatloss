/// Constantes d'animation exactes extraites de la PWA Project Fat Loss
/// Reproduction pixel-perfect de tous les timings et courbes
class AnimationConstants {
  // Durées d'animation exactes (en millisecondes)
  static const int fast = 150;           // 0.15s - transition-fast
  static const int normal = 200;         // 0.2s - transition-normal
  static const int slow = 300;           // 0.3s - transition-slow
  static const int pulse = 2000;         // 2s - pulse animation
  static const int bounce = 1000;        // 1s - bounce animation
  static const int fadeIn = 500;         // 0.5s - fade in
  static const int fadeInUp = 600;       // 0.6s - fade in up
  static const int spin = 1000;          // 1s - spin/loader
  static const int speaking = 1500;      // 1.5s - speaking animation
  static const int caloriePulse = 500;   // 0.5s - calorie pulse
  static const int timerPulse = 1000;    // 1s - timer pulse (warning)
  static const int timerCritical = 500;  // 0.5s - timer critical pulse
  static const int fadeInOut = 3000;     // 3s - notification fade
  static const int modalFadeIn = 300;    // 0.3s - modal overlay
  static const int modalScaleIn = 500;   // 0.5s - modal content
  static const int autoModePulse = 2000; // 2s - auto mode pulse
  static const int fatBurnerPulse = 2000; // 2s - fat burner pulse

  // Durées pour les transitions d'état
  static const int hover = 200;          // 0.2s - hover effects
  static const int backgroundTransition = 300; // 0.3s - background/color/border
  static const int transform = 200;      // 0.2s - transform effects
  static const int boxShadow = 200;      // 0.2s - box shadow
  static const int carouselTransition = 300; // 0.3s - carousel
  static const int progressTransition = 400; // 0.4s - progress bars

  // Courbes d'animation exactes (Cubic Bezier)
  static const String easeInOut = 'cubic-bezier(0.4, 0, 0.2, 1)';
  static const String ease = 'cubic-bezier(0.25, 0.1, 0.25, 1)';
  static const String easeIn = 'cubic-bezier(0.4, 0, 1, 1)';
  static const String easeOut = 'cubic-bezier(0, 0, 0.2, 1)';
  static const String linear = 'cubic-bezier(0, 0, 1, 1)';
  
  // Courbes spécifiques de la PWA
  static const String pulseCurve = 'cubic-bezier(0.4, 0, 0.6, 1)'; // Pulse animation
  static const String bounceCurve1 = 'cubic-bezier(0.8, 0, 1, 1)';  // Bounce 0-40%
  static const String bounceCurve2 = 'cubic-bezier(0, 0, 0.2, 1)';  // Bounce 40-100%

  // Délais pour les animations séquentielles
  static const int sequentialDelay1 = 100;  // 0.1s
  static const int sequentialDelay2 = 200;  // 0.2s
  static const int sequentialDelay3 = 300;  // 0.3s
  static const int sequentialDelay4 = 400;  // 0.4s
  static const int sequentialDelay5 = 500;  // 0.5s

  // Délais spéciaux
  static const int notificationInitDelay = 1000; // 1s - notification init
  static const int autoAdvanceDelay = 500;       // 0.5s - auto advance

  // Répétitions d'animation
  static const int infinite = -1;        // Animation infinie
  static const int once = 1;             // Une seule fois
  static const int twice = 2;            // Deux fois

  // Interpolations pour Flutter Curves équivalentes
  // Ces valeurs reproduisent les courbes CSS exactes
  
  // Valeurs pour Cubic(a, b, c, d) équivalent à cubic-bezier(a, b, c, d)
  static const double pulseA = 0.4;
  static const double pulseB = 0.0;
  static const double pulseC = 0.6;
  static const double pulseD = 1.0;

  static const double bounceA1 = 0.8;
  static const double bounceB1 = 0.0;
  static const double bounceC1 = 1.0;
  static const double bounceD1 = 1.0;

  static const double bounceA2 = 0.0;
  static const double bounceB2 = 0.0;
  static const double bounceC2 = 0.2;
  static const double bounceD2 = 1.0;

  // Valeurs d'opacité pour les animations
  static const double opacityStart = 0.0;
  static const double opacityEnd = 1.0;
  static const double opacityPulseMin = 0.5;
  static const double opacityPulseMax = 1.0;
  static const double opacityPulseStart = 0.6;  // Pour speaking animation
  static const double opacityWarning = 0.7;     // Pour notification indicator

  // Valeurs de scale pour les animations
  static const double scaleStart = 0.8;
  static const double scaleEnd = 1.0;
  static const double scalePulseMin = 0.8;
  static const double scalePulseMax = 1.2;
  static const double scaleModalStart = 0.9;
  static const double scaleModalEnd = 1.0;
  static const double scaleFadeInStart = 0.95;

  // Valeurs de translation pour les animations (en pixels)
  static const double translateYBounce = -25.0;   // -25% approximatif
  static const double translateYFadeIn = 20.0;    // 20px
  static const double translateYFadeInUp = 30.0;  // 30px
  static const double translateYHover = -2.0;     // -2px
  static const double translateYHoverLarge = -4.0; // -4px
  static const double translateYActive = 0.0;     // Retour à la position

  // Valeurs de rotation pour les animations (en degrés)
  static const double rotationStart = 0.0;        // 0deg
  static const double rotationEnd = 360.0;        // 360deg

  // Box shadow blur radius pour les animations
  static const double shadowBlurStart = 4.0;
  static const double shadowBlurHover = 12.0;
  static const double shadowBlurLarge = 24.0;
  static const double shadowBlurXL = 20.0;

  // Valeurs spéciales pour les animations complexes
  // Bounce keyframes percentages
  static const double bounce0 = 0.0;     // 0%
  static const double bounce20 = 0.2;    // 20%
  static const double bounce40 = 0.4;    // 40%
  static const double bounce50 = 0.5;    // 50%
  static const double bounce60 = 0.6;    // 60%
  static const double bounce80 = 0.8;    // 80%
  static const double bounce100 = 1.0;   // 100%

  // Fade in up séquentiel - délais cumulés
  static const int fadeInUpDelay1 = 100;  // Premier élément
  static const int fadeInUpDelay2 = 200;  // Deuxième élément
  static const int fadeInUpDelay3 = 300;  // Troisième élément
  static const int fadeInUpDelay4 = 400;  // Quatrième élément
  static const int fadeInUpDelay5 = 500;  // Cinquième élément

  // Strava pulse variations - différentes durées
  static const int stravaPulseShort = 1000;   // 1s
  static const int stravaPulseMedium = 1500;  // 1.5s
  static const int stravaPulseLong = 2000;    // 2s

  // Timer animation thresholds (en secondes)
  static const int timerWarningThreshold = 10;  // 10s - devient orange
  static const int timerCriticalThreshold = 5;  // 5s - devient rouge

  // Auto mode et Fat Burner pulse opacity
  static const double pulseOpacityMin = 0.8;
  static const double pulseOpacityMax = 1.0;

  // Backdrop filter blur values
  static const double backdropBlurSmall = 5.0;   // 5px
  static const double backdropBlurMedium = 10.0; // 10px

  // Z-index équivalents pour les stacks
  static const int zIndexModal = 1000;
  static const int zIndexAutoMode = 1001;
  static const int zIndexFloatingCalories = 100;
  static const int zIndexHeader = 100;
}