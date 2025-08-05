import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'core/theme/app_theme.dart';
import 'core/constants/app_colors.dart';
import 'core/constants/app_typography.dart';
import 'features/home/screens/home_screen.dart';
import 'shared/services/preferences_service.dart';
import 'shared/services/notification_service.dart';
import 'shared/services/audio_service.dart';
import 'shared/services/database_service.dart';
import 'shared/services/haptic_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Configuration de l'orientation
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);

  // Configuration de la barre de statut
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
      statusBarBrightness: Brightness.dark,
    ),
  );

  // Initialisation des services
  await _initializeServices();

  runApp(const ProjectFatLossApp());
}

/// Initialise tous les services de l'application
Future<void> _initializeServices() async {
  try {
    // Initialiser les préférences
    await PreferencesService.init();
    
    // Initialiser la base de données
    await DatabaseService.init();
    
    // Initialiser les notifications
    await NotificationService.init();
    
    // Initialiser l'audio
    await AudioService.init();
    
    // Initialiser le haptic feedback
    await HapticService.init();
    
    print('✅ Tous les services ont été initialisés avec succès');
  } catch (e) {
    print('❌ Erreur lors de l\'initialisation des services: $e');
  }
}

class ProjectFatLossApp extends StatefulWidget {
  const ProjectFatLossApp({Key? key}) : super(key: key);

  @override
  State<ProjectFatLossApp> createState() => _ProjectFatLossAppState();
}

class _ProjectFatLossAppState extends State<ProjectFatLossApp> {
  bool _isDarkMode = false;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadThemePreference();
  }

  /// Charge la préférence de thème depuis le stockage
  Future<void> _loadThemePreference() async {
    try {
      final isDark = PreferencesService.isDarkMode;
      setState(() {
        _isDarkMode = isDark;
        _isLoading = false;
      });
    } catch (e) {
      print('Erreur lors du chargement du thème: $e');
      setState(() {
        _isLoading = false;
      });
    }
  }

  /// Bascule le thème et sauvegarde la préférence
  Future<void> _toggleTheme() async {
    setState(() {
      _isDarkMode = !_isDarkMode;
    });
    
    try {
      await PreferencesService.setDarkMode(_isDarkMode);
    } catch (e) {
      print('Erreur lors de la sauvegarde du thème: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return MaterialApp(
        home: Scaffold(
          backgroundColor: AppColors.backgroundLight,
          body: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Logo animé
                Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    gradient: AppTheme.headerGradient,
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.primaryWithOpacity(0.3),
                        blurRadius: 20,
                        spreadRadius: 5,
                      ),
                    ],
                  ),
                  child: const Icon(
                    Icons.fitness_center,
                    color: Colors.white,
                    size: 40,
                  ),
                ).animate().scale(
                  duration: 1.seconds,
                  curve: Curves.elasticOut,
                ),
                const SizedBox(height: 24),
                Text(
                  'Project Fat Loss',
                  style: AppTypography.h1.copyWith(
                    color: AppColors.vermilion,
                    fontWeight: FontWeight.bold,
                  ),
                ).animate().fadeIn(
                  duration: 800.milliseconds,
                  delay: 500.milliseconds,
                ),
                const SizedBox(height: 8),
                Text(
                  'Chargement...',
                  style: AppTypography.body1.copyWith(
                    color: AppColors.textSecondaryLight,
                  ),
                ).animate().fadeIn(
                  duration: 600.milliseconds,
                  delay: 800.milliseconds,
                ),
              ],
            ),
          ),
        ),
      );
    }

    return MaterialApp(
      title: 'Project Fat Loss',
      debugShowCheckedModeBanner: false,
      
      // Thème reproduisant pixel-perfect la PWA
      theme: AppTheme.createTheme(false),
      darkTheme: AppTheme.createTheme(true),
      themeMode: _isDarkMode ? ThemeMode.dark : ThemeMode.light,
      
      // Configuration Material 3
      builder: (context, child) {
        return MediaQuery(
          data: MediaQuery.of(context).copyWith(
            textScaleFactor: 1.0, // Forcer la taille de texte pour la fidélité
          ),
          child: child!,
        );
      },
      
      home: HomeScreen(
        isDarkMode: _isDarkMode,
        onThemeToggle: _toggleTheme,
      ),
    );
  }
}
