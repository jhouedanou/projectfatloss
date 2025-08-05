import 'package:audioplayers/audioplayers.dart';
import 'package:flutter/services.dart';
import '../services/preferences_service.dart';

/// Service de gestion audio pour reproduire les sons de la PWA
class AudioService {
  static final AudioPlayer _audioPlayer = AudioPlayer();
  static bool _initialized = false;

  /// Initialise le service audio
  static Future<void> init() async {
    if (_initialized) return;

    // Configuration du player
    await _audioPlayer.setReleaseMode(ReleaseMode.loop);
    
    _initialized = true;
  }

  /// Joue un son de démarrage d'entraînement
  static Future<void> playWorkoutStartSound() async {
    if (!PreferencesService.soundEnabled) return;

    try {
      await _audioPlayer.play(AssetSource('sounds/workout_start.mp3'));
    } catch (e) {
      // Fallback vers un son système si le fichier n'existe pas
      HapticFeedback.mediumImpact();
    }
  }

  /// Joue un son de fin d'entraînement
  static Future<void> playWorkoutCompleteSound() async {
    if (!PreferencesService.soundEnabled) return;

    try {
      await _audioPlayer.play(AssetSource('sounds/workout_complete.mp3'));
    } catch (e) {
      // Fallback vers un son système
      HapticFeedback.heavyImpact();
    }
  }

  /// Joue un son de transition
  static Future<void> playTransitionSound() async {
    if (!PreferencesService.soundEnabled) return;

    try {
      await _audioPlayer.play(AssetSource('sounds/transition.mp3'));
    } catch (e) {
      // Fallback vers un son système
      HapticFeedback.lightImpact();
    }
  }

  /// Joue un son de notification
  static Future<void> playNotificationSound() async {
    if (!PreferencesService.soundEnabled) return;

    try {
      await _audioPlayer.play(AssetSource('sounds/notification.mp3'));
    } catch (e) {
      // Fallback vers un son système
      HapticFeedback.selectionClick();
    }
  }

  /// Joue un son de succès
  static Future<void> playSuccessSound() async {
    if (!PreferencesService.soundEnabled) return;

    try {
      await _audioPlayer.play(AssetSource('sounds/success.mp3'));
    } catch (e) {
      // Fallback vers un son système
      HapticFeedback.lightImpact();
    }
  }

  /// Joue un son d'erreur
  static Future<void> playErrorSound() async {
    if (!PreferencesService.soundEnabled) return;

    try {
      await _audioPlayer.play(AssetSource('sounds/error.mp3'));
    } catch (e) {
      // Fallback vers un son système
      HapticFeedback.heavyImpact();
    }
  }

  /// Joue un son de clic
  static Future<void> playClickSound() async {
    if (!PreferencesService.soundEnabled) return;

    try {
      await _audioPlayer.play(AssetSource('sounds/click.mp3'));
    } catch (e) {
      // Fallback vers un son système
      HapticFeedback.selectionClick();
    }
  }

  /// Arrête tous les sons
  static Future<void> stopAllSounds() async {
    await _audioPlayer.stop();
  }

  /// Libère les ressources
  static Future<void> dispose() async {
    await _audioPlayer.dispose();
  }
} 