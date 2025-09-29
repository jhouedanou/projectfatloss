import 'package:flutter/material.dart';
import 'package:table_calendar/table_calendar.dart';
import '../../../core/constants/app_colors.dart';
import '../../../shared/services/storage_service.dart';

/// Écran calendrier des entraînements
/// Reproduit le WorkoutCalendar.jsx de la PWA
class CalendarScreen extends Scaffold {
  CalendarScreen({super.key})
      : super(
          appBar: AppBar(
            title: const Text('Calendrier'),
            centerTitle: true,
          ),
          body: const CalendarScreenBody(),
        );
}

class CalendarScreenBody extends StatefulWidget {
  const CalendarScreenBody({super.key});

  @override
  State<CalendarScreenBody> createState() => _CalendarScreenBodyState();
}

class _CalendarScreenBodyState extends State<CalendarScreenBody> {
  CalendarFormat _calendarFormat = CalendarFormat.month;
  DateTime _focusedDay = DateTime.now();
  DateTime? _selectedDay;
  Map<DateTime, List<Map<String, dynamic>>> _workoutEvents = {};
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _selectedDay = _focusedDay;
    _loadWorkoutEvents();
  }

  /// Charge les événements d'entraînement
  Future<void> _loadWorkoutEvents() async {
    setState(() => _isLoading = true);

    try {
      final workouts = await StorageService.getAllWorkouts();

      final Map<DateTime, List<Map<String, dynamic>>> events = {};

      for (final workout in workouts) {
        final date = DateTime.parse(workout['date'] as String);
        final normalizedDate = DateTime(date.year, date.month, date.day);

        if (events[normalizedDate] == null) {
          events[normalizedDate] = [];
        }
        events[normalizedDate]!.add(workout);
      }

      setState(() {
        _workoutEvents = events;
        _isLoading = false;
      });
    } catch (e) {
      print('❌ Erreur chargement événements: $e');
      setState(() => _isLoading = false);
    }
  }

  /// Récupère les événements pour un jour donné
  List<Map<String, dynamic>> _getEventsForDay(DateTime day) {
    final normalizedDay = DateTime(day.year, day.month, day.day);
    return _workoutEvents[normalizedDay] ?? [];
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Center(
        child: CircularProgressIndicator(),
      );
    }

    return Column(
      children: [
        // Calendrier
        Card(
          margin: const EdgeInsets.all(16),
          child: TableCalendar(
            firstDay: DateTime.utc(2020, 1, 1),
            lastDay: DateTime.utc(2030, 12, 31),
            focusedDay: _focusedDay,
            calendarFormat: _calendarFormat,
            selectedDayPredicate: (day) => isSameDay(_selectedDay, day),
            eventLoader: _getEventsForDay,
            startingDayOfWeek: StartingDayOfWeek.monday,
            calendarStyle: CalendarStyle(
              todayDecoration: BoxDecoration(
                color: AppColors.secondary['500']!,
                shape: BoxShape.circle,
              ),
              selectedDecoration: BoxDecoration(
                color: AppColors.vermilion,
                shape: BoxShape.circle,
              ),
              markerDecoration: BoxDecoration(
                color: AppColors.success['500']!,
                shape: BoxShape.circle,
              ),
              markersMaxCount: 1,
              outsideDaysVisible: false,
            ),
            headerStyle: HeaderStyle(
              formatButtonVisible: true,
              titleCentered: true,
              formatButtonShowsNext: false,
              formatButtonDecoration: BoxDecoration(
                border: Border.all(color: AppColors.vermilion),
                borderRadius: BorderRadius.circular(12),
              ),
              formatButtonTextStyle: TextStyle(
                color: AppColors.vermilion,
                fontWeight: FontWeight.bold,
              ),
            ),
            onDaySelected: (selectedDay, focusedDay) {
              if (!isSameDay(_selectedDay, selectedDay)) {
                setState(() {
                  _selectedDay = selectedDay;
                  _focusedDay = focusedDay;
                });
              }
            },
            onFormatChanged: (format) {
              if (_calendarFormat != format) {
                setState(() {
                  _calendarFormat = format;
                });
              }
            },
            onPageChanged: (focusedDay) {
              _focusedDay = focusedDay;
            },
          ),
        ),

        // Légende
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _buildLegendItem(
                color: AppColors.success['500']!,
                label: 'Entraînement effectué',
              ),
              const SizedBox(width: 20),
              _buildLegendItem(
                color: AppColors.secondary['500']!,
                label: 'Aujourd\'hui',
              ),
            ],
          ),
        ),

        const SizedBox(height: 20),

        // Liste des entraînements du jour sélectionné
        Expanded(
          child: _buildWorkoutsList(),
        ),
      ],
    );
  }

  Widget _buildLegendItem({required Color color, required String label}) {
    return Row(
      children: [
        Container(
          width: 16,
          height: 16,
          decoration: BoxDecoration(
            color: color,
            shape: BoxShape.circle,
          ),
        ),
        const SizedBox(width: 8),
        Text(
          label,
          style: const TextStyle(fontSize: 12),
        ),
      ],
    );
  }

  Widget _buildWorkoutsList() {
    final events = _getEventsForDay(_selectedDay!);

    if (events.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.fitness_center_outlined,
              size: 64,
              color: Colors.grey[400],
            ),
            const SizedBox(height: 16),
            Text(
              'Aucun entraînement ce jour',
              style: TextStyle(
                fontSize: 16,
                color: Colors.grey[600],
              ),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      itemCount: events.length,
      itemBuilder: (context, index) {
        final workout = events[index];
        return _buildWorkoutCard(workout);
      },
    );
  }

  Widget _buildWorkoutCard(Map<String, dynamic> workout) {
    final dayTitle = workout['dayTitle'] as String? ?? 'Entraînement';
    final duration = workout['duration'] as int? ?? 0;
    final calories = (workout['totalCalories'] as num?)?.toDouble() ?? 0.0;
    final weight = (workout['totalWeight'] as num?)?.toDouble() ?? 0.0;
    final completed = (workout['completed'] as int?) == 1;

    final durationMinutes = duration ~/ 60;
    final durationSeconds = duration % 60;
    final durationText = '$durationMinutes min $durationSeconds s';

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    dayTitle,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                if (completed)
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 6,
                    ),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: AppColors.successGradient,
                      ),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: const Text(
                      '✓ Complété',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                _buildStatItem(
                  icon: Icons.timer_outlined,
                  label: 'Durée',
                  value: durationText,
                ),
                const SizedBox(width: 20),
                _buildStatItem(
                  icon: Icons.local_fire_department_outlined,
                  label: 'Calories',
                  value: '${calories.toInt()} kcal',
                ),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                _buildStatItem(
                  icon: Icons.fitness_center,
                  label: 'Poids total',
                  value: '${weight.toInt()} kg',
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatItem({
    required IconData icon,
    required String label,
    required String value,
  }) {
    return Row(
      children: [
        Icon(
          icon,
          size: 16,
          color: AppColors.vermilion,
        ),
        const SizedBox(width: 4),
        Text(
          '$label: ',
          style: TextStyle(
            fontSize: 12,
            color: Colors.grey[600],
          ),
        ),
        Text(
          value,
          style: const TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }
}