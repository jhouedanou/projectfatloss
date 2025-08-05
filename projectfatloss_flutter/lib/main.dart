import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'core/theme/app_theme.dart';
import 'features/home/screens/home_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Configuration de l'orientation
  SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);

  runApp(const ProjectFatLossApp());
}

class ProjectFatLossApp extends StatefulWidget {
  const ProjectFatLossApp({Key? key}) : super(key: key);

  @override
  State<ProjectFatLossApp> createState() => _ProjectFatLossAppState();
}

class _ProjectFatLossAppState extends State<ProjectFatLossApp> {
  bool _isDarkMode = false;

  void _toggleTheme() {
    setState(() {
      _isDarkMode = !_isDarkMode;
    });
  }

  @override
  Widget build(BuildContext context) {
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
