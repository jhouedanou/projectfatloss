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

  // Constantes pour les IDs de notification
  static const int _workoutProgressId = 100;
  static const int _dailyReminderId = 200;
  static const int _pauseNotificationId = 300;

  /// Initialise le service de notifications
  static Future<void> init() async {
    if (_initialized) return;

    // Configuration pour Android
    const androidSettings = AndroidInitializationSettings(
      '@mipmap/ic_launcher',
    );

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

    // Créer les channels Android avec les bonnes priorités
    await _createNotificationChannels();

    _initialized = true;
  }

  /// Crée les channels Android avec les configurations appropriées
  static Future<void> _createNotificationChannels() async {
    final androidPlugin = _notifications.resolvePlatformSpecificImplementation<
        AndroidFlutterLocalNotificationsPlugin>();

    if (androidPlugin == null) return;

    // Channel pour la progression d'entraînement (haute priorité)
    const workoutProgressChannel = AndroidNotificationChannel(
      'workout_progress_channel',
      'Progression d\'entraînement',
      description: 'Notifications persistantes durant l\'entraînement',
      importance: Importance.high,
      playSound: false,
      enableVibration: false,
      showBadge: false,
    );

    // Channel pour les rappels quotidiens (priorité par défaut)
    const dailyReminderChannel = AndroidNotificationChannel(
      'daily_reminder_channel',
      'Rappels quotidiens',
      description: 'Rappels pour les entraînements quotidiens',
      importance: Importance.defaultImportance,
      playSound: true,
      enableVibration: true,
      showBadge: true,
    );

    // Channel pour les notifications de pause (haute priorité)
    const pauseChannel = AndroidNotificationChannel(
      'pause_notification_channel',
      'Pause d\'entraînement',
      description: 'Notifications pendant les pauses',
      importance: Importance.high,
      playSound: false,
      enableVibration: false,
      showBadge: false,
    );

    await androidPlugin.createNotificationChannel(workoutProgressChannel);
    await androidPlugin.createNotificationChannel(dailyReminderChannel);
    await androidPlugin.createNotificationChannel(pauseChannel);
  }

  /// Demande les permissions de notification
  static Future<bool> requestPermissions() async {
    final status = await Permission.notification.request();
    return status.isGranted;
  }

  /// Vérifie si les notifications sont activées
  static Future<bool> areNotificationsEnabled() async {
    return await _notifications
            .resolvePlatformSpecificImplementation<
              AndroidFlutterLocalNotificationsPlugin
            >()
            ?.areNotificationsEnabled() ??
        false;
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

    await _notifications.show(0, title, body, details);
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

    await _notifications.show(1, title, body, details);
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

    await _notifications.show(2, title, body, details);
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
      androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
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

  /// Affiche une notification persistante de progression d'entraînement
  static Future<void> showWorkoutProgressNotification({
    required String exerciseName,
    required int currentSet,
    required int totalSets,
    required String timer,
    bool isPaused = false,
  }) async {
    if (!PreferencesService.notificationsEnabled) return;

    final androidDetails = AndroidNotificationDetails(
      'workout_progress_channel',
      'Progression d\'entraînement',
      channelDescription: 'Notifications persistantes durant l\'entraînement',
      importance: Importance.high,
      priority: Priority.high,
      ongoing: true,
      autoCancel: false,
      showWhen: false,
      usesChronometer: false,
      playSound: false,
      enableVibration: false,
      showProgress: true,
      maxProgress: totalSets,
      progress: currentSet,
      actions: <AndroidNotificationAction>[
        AndroidNotificationAction(
          'next_action',
          'Next',
          showsUserInterface: true,
          cancelNotification: false,
        ),
        AndroidNotificationAction(
          isPaused ? 'resume_action' : 'pause_action',
          isPaused ? 'Resume' : 'Pause',
          showsUserInterface: true,
          cancelNotification: false,
        ),
        AndroidNotificationAction(
          'stop_action',
          'Stop',
          showsUserInterface: true,
          cancelNotification: true,
        ),
      ],
    );

    const iosDetails = DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: false,
      presentSound: false,
    );

    final details = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );

    final title = isPaused ? 'Entraînement en pause' : 'Entraînement en cours';
    final body = '$exerciseName\nSérie $currentSet/$totalSets • $timer';

    await _notifications.show(_workoutProgressId, title, body, details);
  }

  /// Met à jour la notification de progression d'entraînement en temps réel
  static Future<void> updateWorkoutProgressNotification({
    required String exerciseName,
    required int currentSet,
    required int totalSets,
    required String timer,
    bool isPaused = false,
  }) async {
    // Utilise la même méthode que showWorkoutProgressNotification
    // car show() met à jour automatiquement si l'ID existe
    await showWorkoutProgressNotification(
      exerciseName: exerciseName,
      currentSet: currentSet,
      totalSets: totalSets,
      timer: timer,
      isPaused: isPaused,
    );
  }

  /// Supprime la notification de progression d'entraînement
  static Future<void> clearWorkoutNotification() async {
    await _notifications.cancel(_workoutProgressId);
  }

  /// Programme un rappel quotidien à une heure spécifique
  static Future<void> scheduleDailyReminder({
    required int hour, // 6-23
    required String title,
    required String body,
  }) async {
    if (!PreferencesService.notificationsEnabled) return;
    if (hour < 6 || hour > 23) {
      throw ArgumentError('Hour must be between 6 and 23');
    }

    // Annuler le rappel existant
    await _notifications.cancel(_dailyReminderId);

    final now = DateTime.now();
    var scheduledDate = DateTime(now.year, now.month, now.day, hour, 0);

    // Si l'heure est déjà passée aujourd'hui, programmer pour demain
    if (scheduledDate.isBefore(now)) {
      scheduledDate = scheduledDate.add(const Duration(days: 1));
    }

    const androidDetails = AndroidNotificationDetails(
      'daily_reminder_channel',
      'Rappels quotidiens',
      channelDescription: 'Rappels pour les entraînements quotidiens',
      importance: Importance.defaultImportance,
      priority: Priority.defaultPriority,
      showWhen: true,
      enableVibration: true,
      playSound: true,
      actions: <AndroidNotificationAction>[
        AndroidNotificationAction(
          'start_workout_action',
          'Démarrer',
          showsUserInterface: true,
        ),
        AndroidNotificationAction(
          'dismiss_action',
          'Plus tard',
          showsUserInterface: false,
          cancelNotification: true,
        ),
      ],
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
      _dailyReminderId,
      title,
      body,
      tz.TZDateTime.from(scheduledDate, tz.local),
      details,
      androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
      matchDateTimeComponents: DateTimeComponents.time, // Répéter quotidiennement
    );

    // Sauvegarder l'heure du rappel dans les préférences
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt('daily_reminder_hour', hour);
    await prefs.setBool('daily_reminder_enabled', true);
  }

  /// Annule le rappel quotidien programmé
  static Future<void> cancelDailyReminder() async {
    await _notifications.cancel(_dailyReminderId);

    // Mettre à jour les préférences
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('daily_reminder_enabled', false);
  }

  /// Affiche une notification de pause avec timer
  static Future<void> showPauseNotification({
    required String exerciseName,
    required int pauseDuration, // en secondes
    required int currentSet,
    required int totalSets,
  }) async {
    if (!PreferencesService.notificationsEnabled) return;

    final minutes = pauseDuration ~/ 60;
    final seconds = pauseDuration % 60;
    final timerText = minutes > 0
        ? '${minutes}m ${seconds}s'
        : '${seconds}s';

    const androidDetails = AndroidNotificationDetails(
      'pause_notification_channel',
      'Pause d\'entraînement',
      channelDescription: 'Notifications pendant les pauses',
      importance: Importance.high,
      priority: Priority.high,
      ongoing: true,
      autoCancel: false,
      showWhen: false,
      usesChronometer: true,
      chronometerCountDown: true,
      playSound: false,
      enableVibration: false,
      actions: <AndroidNotificationAction>[
        AndroidNotificationAction(
          'skip_pause_action',
          'Passer',
          showsUserInterface: true,
          cancelNotification: true,
        ),
        AndroidNotificationAction(
          'add_30s_action',
          '+30s',
          showsUserInterface: true,
          cancelNotification: false,
        ),
      ],
    );

    const iosDetails = DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: false,
      presentSound: false,
    );

    const details = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );

    final title = 'Pause en cours';
    final body = '$exerciseName\nSérie $currentSet/$totalSets terminée • $timerText';

    await _notifications.show(_pauseNotificationId, title, body, details);
  }

  /// Supprime la notification de pause
  static Future<void> clearPauseNotification() async {
    await _notifications.cancel(_pauseNotificationId);
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
      case _workoutProgressId:
        // Gérer les actions de la notification de progression
        _handleWorkoutProgressAction(response.actionId);
        break;
      case _dailyReminderId:
        // Gérer les actions du rappel quotidien
        _handleDailyReminderAction(response.actionId);
        break;
      case _pauseNotificationId:
        // Gérer les actions de la notification de pause
        _handlePauseAction(response.actionId);
        break;
    }
  }

  /// Gère les actions de la notification de progression
  static void _handleWorkoutProgressAction(String? actionId) {
    if (actionId == null) return;

    switch (actionId) {
      case 'next_action':
        // Passer à l'exercice suivant
        break;
      case 'pause_action':
        // Mettre en pause l'entraînement
        break;
      case 'resume_action':
        // Reprendre l'entraînement
        break;
      case 'stop_action':
        // Arrêter l'entraînement
        clearWorkoutNotification();
        break;
    }
  }

  /// Gère les actions du rappel quotidien
  static void _handleDailyReminderAction(String? actionId) {
    if (actionId == null) return;

    switch (actionId) {
      case 'start_workout_action':
        // Démarrer l'entraînement
        break;
      case 'dismiss_action':
        // Fermer la notification
        break;
    }
  }

  /// Gère les actions de la notification de pause
  static void _handlePauseAction(String? actionId) {
    if (actionId == null) return;

    switch (actionId) {
      case 'skip_pause_action':
        // Passer la pause
        clearPauseNotification();
        break;
      case 'add_30s_action':
        // Ajouter 30 secondes à la pause
        break;
    }
  }
}
