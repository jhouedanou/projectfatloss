import 'package:flutter_tts/flutter_tts.dart';
import 'preferences_service.dart';

/// Service de synthèse vocale (Text-to-Speech)
/// Reproduit le comportement du SpeechService.js de la PWA
class TtsService {
  static final FlutterTts _tts = FlutterTts();
  static bool _initialized = false;
  static bool _isAndroid = false;

  /// Initialise le service TTS
  static Future<void> init() async {
    if (_initialized) return;

    try {
      // Déterminer la plateforme
      _isAndroid = await _tts.isLanguageAvailable("fr-FR");

      // Configuration par défaut
      await _tts.setLanguage("fr-FR");
      await _tts.setSpeechRate(PreferencesService.speechRate);
      await _tts.setVolume(PreferencesService.speechVolume);
      await _tts.setPitch(PreferencesService.speechPitch);

      // Configuration Android
      if (_isAndroid) {
        await _tts.setVoice({"name": "fr-FR-language", "locale": "fr-FR"});
      }

      _initialized = true;
      print('✅ Service TTS initialisé');
    } catch (e) {
      print('❌ Erreur initialisation TTS: $e');
    }
  }

  /// Annonce le nom d'un exercice
  static Future<void> announceExercise(String exerciseName) async {
    if (!PreferencesService.speechEnabled) return;

    try {
      await _tts.speak("Exercice suivant: $exerciseName");
    } catch (e) {
      print('❌ Erreur annonce exercice: $e');
    }
  }

  /// Annonce une série
  static Future<void> announceSet(int setNumber, int totalSets) async {
    if (!PreferencesService.speechEnabled) return;

    try {
      await _tts.speak("Série $setNumber sur $totalSets");
    } catch (e) {
      print('❌ Erreur annonce série: $e');
    }
  }

  /// Annonce une pause
  static Future<void> announcePause(int seconds) async {
    if (!PreferencesService.speechEnabled) return;

    try {
      await _tts.speak("Pause de $seconds secondes");
    } catch (e) {
      print('❌ Erreur annonce pause: $e');
    }
  }

  /// Annonce le côté pour les exercices unilatéraux
  static Future<void> announceSide(String side) async {
    if (!PreferencesService.speechEnabled) return;

    try {
      final sideText = side == 'left' ? 'gauche' : 'droit';
      await _tts.speak("Côté $sideText");
    } catch (e) {
      print('❌ Erreur annonce côté: $e');
    }
  }

  /// Annonce le compte à rebours
  static Future<void> announceCountdown(int seconds) async {
    if (!PreferencesService.speechEnabled) return;

    try {
      if (seconds <= 3 && seconds > 0) {
        await _tts.speak(seconds.toString());
      } else if (seconds == 0) {
        await _tts.speak("C'est parti!");
      }
    } catch (e) {
      print('❌ Erreur annonce countdown: $e');
    }
  }

  /// Annonce la fin d'un entraînement
  static Future<void> announceWorkoutComplete({
    required int totalCalories,
    required String duration,
  }) async {
    if (!PreferencesService.speechEnabled) return;

    try {
      await _tts.speak(
        "Entraînement terminé! Vous avez brûlé $totalCalories calories en $duration. Excellent travail!",
      );
    } catch (e) {
      print('❌ Erreur annonce fin: $e');
    }
  }

  /// Annonce un message custom
  static Future<void> speak(String message) async {
    if (!PreferencesService.speechEnabled) return;

    try {
      await _tts.speak(message);
    } catch (e) {
      print('❌ Erreur TTS speak: $e');
    }
  }

  /// Arrête la synthèse vocale en cours
  static Future<void> stop() async {
    try {
      await _tts.stop();
    } catch (e) {
      print('❌ Erreur TTS stop: $e');
    }
  }

  /// Met à jour le volume
  static Future<void> setVolume(double volume) async {
    try {
      await _tts.setVolume(volume);
    } catch (e) {
      print('❌ Erreur set volume: $e');
    }
  }

  /// Met à jour la vitesse
  static Future<void> setSpeechRate(double rate) async {
    try {
      await _tts.setSpeechRate(rate);
    } catch (e) {
      print('❌ Erreur set speech rate: $e');
    }
  }

  /// Met à jour la tonalité
  static Future<void> setPitch(double pitch) async {
    try {
      await _tts.setPitch(pitch);
    } catch (e) {
      print('❌ Erreur set pitch: $e');
    }
  }

  /// Récupère la liste des voix disponibles
  static Future<List<dynamic>> getVoices() async {
    try {
      return await _tts.getVoices;
    } catch (e) {
      print('❌ Erreur get voices: $e');
      return [];
    }
  }

  /// Récupère les langues disponibles
  static Future<List<dynamic>> getLanguages() async {
    try {
      return await _tts.getLanguages;
    } catch (e) {
      print('❌ Erreur get languages: $e');
      return [];
    }
  }
}