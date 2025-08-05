import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:timezone/timezone.dart' as tz;
import '../services/preferences_service.dart';

/// Service de gestion des notifications
class NotificationService {
  static final FlutterLocalNotificationsPlugin _notifications = 
      FlutterLocalNotificationsPlugin();
  
  static bool _initialized = false;

  /// Initialise le service de notifications
  static Future<void> init() async {
    if (_initialized) return;

    // Configuration pour Android
    const androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
    
    // Configuration pour iOS
    const iosSettings = DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );

    const initSettings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );

    await _notifications.initialize(
      initSettings,
      onDidReceiveNotificationResponse: _onNotificationTapped,
    );

    _initialized = true;
  }

  /// Demande les permissions de notification
  static Future<bool> requestPermissions() async {
    final status = await Permission.notification.request();
    return status.isGranted;
  }

  /// Vérifie si les notifications sont activées
  static Future<bool> areNotificationsEnabled() async {
    return await _notifications.resolvePlatformSpecificImplementation<
        AndroidFlutterLocalNotificationsPlugin>()?.areNotificationsEnabled() ?? false;
  }

  /// Affiche une notification de démarrage d'entraînement
  static Future<void> showWorkoutStartNotification({
    required String title,
    required String body,
  }) async {
    if (!PreferencesService.notificationsEnabled) return;

    const androidDetails = AndroidNotificationDetails(
      'workout_channel',
      'Entraînements',
      channelDescription: 'Notifications pour les entraînements',
      importance: Importance.high,
      priority: Priority.high,
      showWhen: true,
      enableVibration: true,
      playSound: true,
    );

    const iosDetails = DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
    );

    const details = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );

    await _notifications.show(
      0,
      title,
      body,
      details,
    );
  }

  /// Affiche une notification de fin d'entraînement
  static Future<void> showWorkoutCompleteNotification({
    required String title,
    required String body,
  }) async {
    if (!PreferencesService.notificationsEnabled) return;

    const androidDetails = AndroidNotificationDetails(
      'workout_complete_channel',
      'Fin d\'entraînement',
      channelDescription: 'Notifications de fin d\'entraînement',
      importance: Importance.high,
      priority: Priority.high,
      showWhen: true,
      enableVibration: true,
      playSound: true,
    );

    const iosDetails = DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
    );

    const details = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );

    await _notifications.show(
      1,
      title,
      body,
      details,
    );
  }

  /// Affiche une notification de rappel
  static Future<void> showReminderNotification({
    required String title,
    required String body,
  }) async {
    if (!PreferencesService.notificationsEnabled) return;

    const androidDetails = AndroidNotificationDetails(
      'reminder_channel',
      'Rappels',
      channelDescription: 'Notifications de rappel',
      importance: Importance.defaultImportance,
      priority: Priority.defaultPriority,
      showWhen: true,
      enableVibration: true,
      playSound: true,
    );

    const iosDetails = DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
    );

    const details = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );

    await _notifications.show(
      2,
      title,
      body,
      details,
    );
  }

  /// Programme une notification de rappel
  static Future<void> scheduleReminder({
    required int id,
    required DateTime scheduledDate,
    required String title,
    required String body,
  }) async {
    if (!PreferencesService.notificationsEnabled) return;

    const androidDetails = AndroidNotificationDetails(
      'scheduled_reminder_channel',
      'Rappels programmés',
      channelDescription: 'Notifications de rappel programmées',
      importance: Importance.defaultImportance,
      priority: Priority.defaultPriority,
      showWhen: true,
      enableVibration: true,
      playSound: true,
    );

    const iosDetails = DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
    );

    const details = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );

    await _notifications.zonedSchedule(
      id,
      title,
      body,
      tz.TZDateTime.from(scheduledDate, tz.local),
      details,
      androidAllowWhileIdle: true,
      uiLocalNotificationDateInterpretation:
          UILocalNotificationDateInterpretation.absoluteTime,
    );
  }

  /// Annule une notification programmée
  static Future<void> cancelNotification(int id) async {
    await _notifications.cancel(id);
  }

  /// Annule toutes les notifications
  static Future<void> cancelAllNotifications() async {
    await _notifications.cancelAll();
  }

  /// Callback appelé quand une notification est tapée
  static void _onNotificationTapped(NotificationResponse response) {
    // Gérer la navigation selon le type de notification
    switch (response.id) {
      case 0: // Workout start
        // Naviguer vers l'écran d'entraînement
        break;
      case 1: // Workout complete
        // Naviguer vers l'écran de fin
        break;
      case 2: // Reminder
        // Naviguer vers l'écran principal
        break;
    }
  }
} 