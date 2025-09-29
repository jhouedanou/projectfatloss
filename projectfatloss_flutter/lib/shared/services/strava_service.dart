import 'dart:convert';
import 'package:http/http.dart' as http;
import 'preferences_service.dart';

/// Service d'intégration Strava
/// Reproduit le StravaService.js de la PWA
class StravaService {
  // Configuration OAuth Strava (identique à la PWA)
  static const String _clientId = '159311';
  static const String _clientSecret =
      'VOTRE_CLIENT_SECRET'; // À configurer
  static const String _redirectUri =
      'https://votreapp.com/strava-callback'; // À configurer

  static const String _authUrl = 'https://www.strava.com/oauth/authorize';
  static const String _tokenUrl = 'https://www.strava.com/oauth/token';
  static const String _apiUrl = 'https://www.strava.com/api/v3';

  /// Génère l'URL d'autorisation OAuth
  static String getAuthorizationUrl() {
    final params = {
      'client_id': _clientId,
      'redirect_uri': _redirectUri,
      'response_type': 'code',
      'scope': 'activity:write,activity:read_all',
      'approval_prompt': 'auto',
    };

    final queryString = params.entries
        .map((e) => '${e.key}=${Uri.encodeComponent(e.value)}')
        .join('&');

    return '$_authUrl?$queryString';
  }

  /// Échange le code d'autorisation contre un access token
  static Future<Map<String, dynamic>?> exchangeCodeForToken(
    String code,
  ) async {
    try {
      final response = await http.post(
        Uri.parse(_tokenUrl),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'client_id': _clientId,
          'client_secret': _clientSecret,
          'code': code,
          'grant_type': 'authorization_code',
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);

        // Sauvegarder les tokens
        await PreferencesService.setStravaAccessToken(data['access_token']);
        await PreferencesService.setStravaRefreshToken(data['refresh_token']);
        await PreferencesService.setStravaTokenExpiry(data['expires_at']);
        await PreferencesService.setStravaConnected(true);

        print('✅ Strava connecté avec succès');
        return data;
      } else {
        print('❌ Erreur échange token: ${response.statusCode}');
        return null;
      }
    } catch (e) {
      print('❌ Erreur échange token: $e');
      return null;
    }
  }

  /// Rafraîchit l'access token
  static Future<bool> refreshAccessToken() async {
    final refreshToken = PreferencesService.stravaRefreshToken;
    if (refreshToken.isEmpty) return false;

    try {
      final response = await http.post(
        Uri.parse(_tokenUrl),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'client_id': _clientId,
          'client_secret': _clientSecret,
          'refresh_token': refreshToken,
          'grant_type': 'refresh_token',
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);

        await PreferencesService.setStravaAccessToken(data['access_token']);
        await PreferencesService.setStravaRefreshToken(data['refresh_token']);
        await PreferencesService.setStravaTokenExpiry(data['expires_at']);

        print('✅ Token Strava rafraîchi');
        return true;
      } else {
        print('❌ Erreur refresh token: ${response.statusCode}');
        return false;
      }
    } catch (e) {
      print('❌ Erreur refresh token: $e');
      return false;
    }
  }

  /// Vérifie si le token est expiré et le rafraîchit si nécessaire
  static Future<bool> ensureValidToken() async {
    final expiryTimestamp = PreferencesService.stravaTokenExpiry;
    final now = DateTime.now().millisecondsSinceEpoch ~/ 1000;

    // Si le token expire dans moins de 5 minutes, le rafraîchir
    if (expiryTimestamp - now < 300) {
      return await refreshAccessToken();
    }

    return true;
  }

  /// Envoie un entraînement vers Strava
  static Future<bool> uploadWorkout({
    required String name,
    required String description,
    required DateTime startDate,
    required int durationSeconds,
    required String activityType,
    double? calories,
  }) async {
    if (!PreferencesService.stravaConnected) {
      print('⚠️ Strava non connecté');
      return false;
    }

    try {
      // Vérifier et rafraîchir le token si nécessaire
      if (!await ensureValidToken()) {
        print('❌ Token invalide');
        return false;
      }

      final accessToken = PreferencesService.stravaAccessToken;

      final body = {
        'name': name,
        'type': activityType, // 'WeightTraining'
        'start_date_local': startDate.toIso8601String(),
        'elapsed_time': durationSeconds,
        'description': description,
        'trainer': 1,
        'commute': 0,
      };

      final response = await http.post(
        Uri.parse('$_apiUrl/activities'),
        headers: {
          'Authorization': 'Bearer $accessToken',
          'Content-Type': 'application/json',
        },
        body: jsonEncode(body),
      );

      if (response.statusCode == 201) {
        final data = jsonDecode(response.body);
        print('✅ Activité Strava créée: ${data['id']}');
        return true;
      } else {
        print('❌ Erreur upload Strava: ${response.statusCode}');
        print('Body: ${response.body}');
        return false;
      }
    } catch (e) {
      print('❌ Erreur upload Strava: $e');
      return false;
    }
  }

  /// Récupère les activités Strava
  static Future<List<Map<String, dynamic>>> getActivities({
    int page = 1,
    int perPage = 30,
  }) async {
    if (!PreferencesService.stravaConnected) {
      return [];
    }

    try {
      if (!await ensureValidToken()) {
        return [];
      }

      final accessToken = PreferencesService.stravaAccessToken;

      final response = await http.get(
        Uri.parse('$_apiUrl/athlete/activities?page=$page&per_page=$perPage'),
        headers: {
          'Authorization': 'Bearer $accessToken',
        },
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.cast<Map<String, dynamic>>();
      } else {
        print('❌ Erreur récupération activités: ${response.statusCode}');
        return [];
      }
    } catch (e) {
      print('❌ Erreur récupération activités: $e');
      return [];
    }
  }

  /// Récupère les infos de l'athlète
  static Future<Map<String, dynamic>?> getAthleteInfo() async {
    if (!PreferencesService.stravaConnected) {
      return null;
    }

    try {
      if (!await ensureValidToken()) {
        return null;
      }

      final accessToken = PreferencesService.stravaAccessToken;

      final response = await http.get(
        Uri.parse('$_apiUrl/athlete'),
        headers: {
          'Authorization': 'Bearer $accessToken',
        },
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        print('❌ Erreur récupération athlete: ${response.statusCode}');
        return null;
      }
    } catch (e) {
      print('❌ Erreur récupération athlete: $e');
      return null;
    }
  }

  /// Déconnecte Strava
  static Future<void> disconnect() async {
    try {
      // Révoquer le token
      final accessToken = PreferencesService.stravaAccessToken;

      if (accessToken.isNotEmpty) {
        await http.post(
          Uri.parse('https://www.strava.com/oauth/deauthorize'),
          headers: {
            'Authorization': 'Bearer $accessToken',
          },
        );
      }

      // Nettoyer les préférences
      await PreferencesService.setStravaConnected(false);
      await PreferencesService.setStravaAccessToken('');
      await PreferencesService.setStravaRefreshToken('');
      await PreferencesService.setStravaTokenExpiry(0);

      print('✅ Strava déconnecté');
    } catch (e) {
      print('❌ Erreur déconnexion Strava: $e');
    }
  }

  /// Synchronise l'historique des entraînements
  static Future<void> syncWorkoutHistory(
    List<Map<String, dynamic>> workouts,
  ) async {
    if (!PreferencesService.stravaConnected) return;

    print('🔄 Synchronisation de ${workouts.length} entraînements...');

    int successCount = 0;
    int failCount = 0;

    for (final workout in workouts) {
      try {
        final success = await uploadWorkout(
          name: workout['dayTitle'] ?? 'Entraînement',
          description:
              'Calories: ${workout['totalCalories']} kcal\nPoids total: ${workout['totalWeight']} kg',
          startDate: DateTime.parse(workout['date']),
          durationSeconds: workout['duration'] ?? 0,
          activityType: 'WeightTraining',
          calories: (workout['totalCalories'] as num?)?.toDouble(),
        );

        if (success) {
          successCount++;
        } else {
          failCount++;
        }

        // Pause entre les uploads pour éviter le rate limiting
        await Future.delayed(const Duration(seconds: 1));
      } catch (e) {
        print('❌ Erreur sync workout: $e');
        failCount++;
      }
    }

    print(
      '✅ Sync terminée: $successCount réussis, $failCount échoués',
    );
  }

  /// Vérifie si Strava est connecté et valide
  static Future<bool> isConnectedAndValid() async {
    if (!PreferencesService.stravaConnected) return false;
    return await ensureValidToken();
  }
}