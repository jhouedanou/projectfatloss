import 'package:flutter/services.dart';
import '../services/preferences_service.dart';

/// Service de haptic feedback utilisant les services Flutter intégrés
class HapticService {
  static bool _isEnabled = true;

  /// Initialise le service
  static Future<void> init() async {
    _isEnabled = PreferencesService.hapticEnabled;
  }

  /// Active/désactive le haptic feedback
  static void setEnabled(bool enabled) {
    _isEnabled = enabled;
  }

  /// Vérifie si le haptic feedback est activé
  static bool get isEnabled => _isEnabled;

  /// Feedback léger (sélection)
  static void lightImpact() {
    if (!_isEnabled) return;
    HapticFeedback.selectionClick();
  }

  /// Feedback moyen (action)
  static void mediumImpact() {
    if (!_isEnabled) return;
    HapticFeedback.lightImpact();
  }

  /// Feedback fort (succès/erreur)
  static void heavyImpact() {
    if (!_isEnabled) return;
    HapticFeedback.heavyImpact();
  }

  /// Feedback de vibration (notification)
  static void vibrate() {
    if (!_isEnabled) return;
    HapticFeedback.vibrate();
  }

  /// Feedback pour les boutons
  static void buttonPress() {
    if (!_isEnabled) return;
    HapticFeedback.selectionClick();
  }

  /// Feedback pour les succès
  static void success() {
    if (!_isEnabled) return;
    HapticFeedback.lightImpact();
  }

  /// Feedback pour les erreurs
  static void error() {
    if (!_isEnabled) return;
    HapticFeedback.heavyImpact();
  }

  /// Feedback pour les avertissements
  static void warning() {
    if (!_isEnabled) return;
    HapticFeedback.mediumImpact();
  }

  /// Feedback pour les transitions
  static void transition() {
    if (!_isEnabled) return;
    HapticFeedback.selectionClick();
  }

  /// Feedback pour les exercices
  static void exerciseComplete() {
    if (!_isEnabled) return;
    HapticFeedback.lightImpact();
  }

  /// Feedback pour les entraînements
  static void workoutComplete() {
    if (!_isEnabled) return;
    HapticFeedback.heavyImpact();
  }

  /// Feedback pour les notifications
  static void notification() {
    if (!_isEnabled) return;
    HapticFeedback.selectionClick();
  }
} 