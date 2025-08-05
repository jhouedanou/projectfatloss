import 'package:shared_preferences/shared_preferences.dart';

/// Service de gestion des préférences utilisateur
class PreferencesService {
  static const String _themeKey = 'theme';
  static const String _currentWorkoutDayKey = 'currentWorkoutDay';
  static const String _showLanguageSelectorKey = 'showLanguageSelector';
  static const String _notificationsEnabledKey = 'notificationsEnabled';
  static const String _soundEnabledKey = 'soundEnabled';
  static const String _hapticEnabledKey = 'hapticEnabled';
  static const String _autoModeKey = 'autoMode';
  static const String _stepModeKey = 'stepMode';

  static late SharedPreferences _prefs;

  /// Initialise le service
  static Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
  }

  /// Thème de l'application
  static bool get isDarkMode => _prefs.getBool(_themeKey) ?? false;
  static Future<void> setDarkMode(bool value) async {
    await _prefs.setBool(_themeKey, value);
  }

  /// Jour d'entraînement actuel
  static int get currentWorkoutDay => _prefs.getInt(_currentWorkoutDayKey) ?? 0;
  static Future<void> setCurrentWorkoutDay(int day) async {
    await _prefs.setInt(_currentWorkoutDayKey, day);
  }

  /// Sélecteur de langue
  static bool get showLanguageSelector => _prefs.getBool(_showLanguageSelectorKey) ?? false;
  static Future<void> setShowLanguageSelector(bool value) async {
    await _prefs.setBool(_showLanguageSelectorKey, value);
  }

  /// Notifications
  static bool get notificationsEnabled => _prefs.getBool(_notificationsEnabledKey) ?? true;
  static Future<void> setNotificationsEnabled(bool value) async {
    await _prefs.setBool(_notificationsEnabledKey, value);
  }

  /// Sons
  static bool get soundEnabled => _prefs.getBool(_soundEnabledKey) ?? true;
  static Future<void> setSoundEnabled(bool value) async {
    await _prefs.setBool(_soundEnabledKey, value);
  }

  /// Haptic feedback
  static bool get hapticEnabled => _prefs.getBool(_hapticEnabledKey) ?? true;
  static Future<void> setHapticEnabled(bool value) async {
    await _prefs.setBool(_hapticEnabledKey, value);
  }

  /// Mode automatique
  static bool get autoMode => _prefs.getBool(_autoModeKey) ?? false;
  static Future<void> setAutoMode(bool value) async {
    await _prefs.setBool(_autoModeKey, value);
  }

  /// Mode étape par étape
  static bool get stepMode => _prefs.getBool(_stepModeKey) ?? false;
  static Future<void> setStepMode(bool value) async {
    await _prefs.setBool(_stepModeKey, value);
  }

  /// Efface toutes les préférences
  static Future<void> clearAll() async {
    await _prefs.clear();
  }
} 