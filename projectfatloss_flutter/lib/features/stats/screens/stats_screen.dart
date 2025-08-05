import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:fl_chart/fl_chart.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_dimensions.dart';
import '../../../core/constants/app_typography.dart';
import '../../../core/widgets/app_header.dart';
import '../../../core/widgets/custom_card.dart';
import '../../../shared/services/workout_data_service.dart';

/// Écran de statistiques affichant les données d'entraînement
class StatsScreen extends StatefulWidget {
  final bool isDarkMode;
  final VoidCallback onThemeToggle;

  const StatsScreen({
    Key? key,
    required this.isDarkMode,
    required this.onThemeToggle,
  }) : super(key: key);

  @override
  State<StatsScreen> createState() => _StatsScreenState();
}

class _StatsScreenState extends State<StatsScreen> {
  Map<String, dynamic> _globalStats = {};
  List<Map<String, dynamic>> _weeklyStats = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadStats();
  }

  /// Charge les statistiques depuis la base de données
  Future<void> _loadStats() async {
    try {
      setState(() {
        _isLoading = true;
      });

      final globalStats = await WorkoutDataService.getGlobalStats();
      final weeklyStats = await WorkoutDataService.getWeeklyStats();

      setState(() {
        _globalStats = globalStats;
        _weeklyStats = weeklyStats;
        _isLoading = false;
      });
    } catch (e) {
      print('Erreur lors du chargement des statistiques: $e');
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.background,
      appBar: AppHeader(
        title: 'Statistiques',
        showBackButton: true,
      ),
      body: _isLoading
          ? _buildLoadingState()
          : RefreshIndicator(
              onRefresh: _loadStats,
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(AppDimensions.paddingLarge),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    _buildGlobalStats(),
                    const SizedBox(height: AppDimensions.spacingLarge),
                    _buildWeeklyChart(),
                    const SizedBox(height: AppDimensions.spacingLarge),
                    _buildWorkoutHistory(),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildLoadingState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          CircularProgressIndicator(
            color: AppColors.vermilion,
          ),
          const SizedBox(height: AppDimensions.spacingMedium),
          Text(
            'Chargement des statistiques...',
            style: AppTypography.body1.copyWith(
              color: Theme.of(context).colorScheme.onBackground,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildGlobalStats() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Vue d\'ensemble',
          style: AppTypography.h3.copyWith(
            color: Theme.of(context).colorScheme.onBackground,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: AppDimensions.spacingMedium),
        Row(
          children: [
            Expanded(
              child: _buildStatCard(
                title: 'Sessions',
                value: '${_globalStats['total_sessions'] ?? 0}',
                icon: Icons.fitness_center,
                color: AppColors.vermilion,
              ),
            ),
            const SizedBox(width: AppDimensions.spacingMedium),
            Expanded(
              child: _buildStatCard(
                title: 'Calories',
                value: '${_globalStats['total_calories'] ?? 0}',
                icon: Icons.local_fire_department,
                color: AppColors.secondary['500']!,
              ),
            ),
          ],
        ),
        const SizedBox(height: AppDimensions.spacingMedium),
        Row(
          children: [
            Expanded(
              child: _buildStatCard(
                title: 'Durée (min)',
                value: '${((_globalStats['total_duration'] ?? 0) / 60).round()}',
                icon: Icons.timer,
                color: AppColors.blueIndigo,
              ),
            ),
            const SizedBox(width: AppDimensions.spacingMedium),
            Expanded(
              child: _buildStatCard(
                title: 'Jours complétés',
                value: '${_globalStats['completed_days'] ?? 0}',
                icon: Icons.check_circle,
                color: AppColors.success['500']!,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildStatCard({
    required String title,
    required String value,
    required IconData icon,
    required Color color,
  }) {
    return CustomCard(
      child: Container(
        padding: const EdgeInsets.all(AppDimensions.paddingMedium),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(AppDimensions.borderRadiusMedium),
          gradient: LinearGradient(
            colors: [color.withOpacity(0.1), color.withOpacity(0.05)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
        child: Column(
          children: [
            Icon(
              icon,
              color: color,
              size: 32,
            ),
            const SizedBox(height: AppDimensions.spacingSmall),
            Text(
              value,
              style: AppTypography.h2.copyWith(
                color: color,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: AppDimensions.spacingSmall),
            Text(
              title,
              style: AppTypography.caption.copyWith(
                color: Theme.of(context).colorScheme.onSurfaceVariant,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    ).animate().fadeIn(
      duration: 400.milliseconds,
      curve: Curves.easeOut,
    ).slideY(
      begin: 0.2,
      duration: 400.milliseconds,
      curve: Curves.easeOut,
    );
  }

  Widget _buildWeeklyChart() {
    if (_weeklyStats.isEmpty) {
      return CustomCard(
        child: Container(
          padding: const EdgeInsets.all(AppDimensions.paddingLarge),
          child: Column(
            children: [
              Icon(
                Icons.bar_chart,
                size: 48,
                color: Theme.of(context).colorScheme.onSurfaceVariant,
              ),
              const SizedBox(height: AppDimensions.spacingMedium),
              Text(
                'Aucune donnée disponible',
                style: AppTypography.body1.copyWith(
                  color: Theme.of(context).colorScheme.onSurfaceVariant,
                ),
              ),
            ],
          ),
        ),
      );
    }

    return CustomCard(
      child: Container(
        padding: const EdgeInsets.all(AppDimensions.paddingLarge),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Activité hebdomadaire',
              style: AppTypography.h4.copyWith(
                color: Theme.of(context).colorScheme.onBackground,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: AppDimensions.spacingMedium),
            SizedBox(
              height: 200,
              child: BarChart(
                BarChartData(
                  alignment: BarChartAlignment.spaceAround,
                  maxY: _getMaxCalories(),
                  barTouchData: BarTouchData(enabled: false),
                  titlesData: FlTitlesData(
                    show: true,
                    rightTitles: AxisTitles(
                      sideTitles: SideTitles(showTitles: false),
                    ),
                    topTitles: AxisTitles(
                      sideTitles: SideTitles(showTitles: false),
                    ),
                    bottomTitles: AxisTitles(
                      sideTitles: SideTitles(
                        showTitles: true,
                        getTitlesWidget: (value, meta) {
                          if (value.toInt() >= _weeklyStats.length) {
                            return const Text('');
                          }
                          final week = _weeklyStats[value.toInt()]['week'] as String;
                          return Text(
                            'S${week.split('-').last}',
                            style: AppTypography.caption.copyWith(
                              color: Theme.of(context).colorScheme.onSurfaceVariant,
                            ),
                          );
                        },
                      ),
                    ),
                    leftTitles: AxisTitles(
                      sideTitles: SideTitles(
                        showTitles: true,
                        reservedSize: 40,
                        getTitlesWidget: (value, meta) {
                          return Text(
                            '${value.toInt()}',
                            style: AppTypography.caption.copyWith(
                              color: Theme.of(context).colorScheme.onSurfaceVariant,
                            ),
                          );
                        },
                      ),
                    ),
                  ),
                  borderData: FlBorderData(show: false),
                  barGroups: _buildBarGroups(),
                  gridData: FlGridData(
                    show: true,
                    horizontalInterval: 1,
                    getDrawingHorizontalLine: (value) {
                      return FlLine(
                        color: Theme.of(context).colorScheme.onSurfaceVariant.withOpacity(0.2),
                        strokeWidth: 1,
                      );
                    },
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    ).animate().fadeIn(
      duration: 600.milliseconds,
      delay: 200.milliseconds,
    );
  }

  List<BarChartGroupData> _buildBarGroups() {
    return List.generate(
      _weeklyStats.length,
      (index) {
        final data = _weeklyStats[index];
        final calories = data['calories'] as int? ?? 0;
        
        return BarChartGroupData(
          x: index,
          barRods: [
            BarChartRodData(
              toY: calories.toDouble(),
              color: AppColors.primaryGradient.first,
              width: 20,
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(4),
                topRight: Radius.circular(4),
              ),
            ),
          ],
        );
      },
    );
  }

  double _getMaxCalories() {
    if (_weeklyStats.isEmpty) return 100;
    
    final maxCalories = _weeklyStats
        .map((data) => data['calories'] as int? ?? 0)
        .reduce((a, b) => a > b ? a : b);
    
    return (maxCalories * 1.2).toDouble();
  }

  Widget _buildWorkoutHistory() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Historique récent',
          style: AppTypography.h4.copyWith(
            color: Theme.of(context).colorScheme.onBackground,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: AppDimensions.spacingMedium),
        FutureBuilder<List<Map<String, dynamic>>>(
          future: WorkoutDataService.getWorkoutHistory(limit: 10),
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const Center(child: CircularProgressIndicator());
            }

            if (snapshot.hasError || !snapshot.hasData || snapshot.data!.isEmpty) {
              return CustomCard(
                child: Container(
                  padding: const EdgeInsets.all(AppDimensions.paddingLarge),
                  child: Column(
                    children: [
                      Icon(
                        Icons.history,
                        size: 48,
                        color: Theme.of(context).colorScheme.onSurfaceVariant,
                      ),
                      const SizedBox(height: AppDimensions.spacingMedium),
                      Text(
                        'Aucun historique disponible',
                        style: AppTypography.body1.copyWith(
                          color: Theme.of(context).colorScheme.onSurfaceVariant,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }

            final sessions = snapshot.data!;
            return Column(
              children: sessions.map((session) {
                final startTime = DateTime.parse(session['start_time']);
                final duration = session['duration'] as int;
                final calories = session['calories_burned'] as int;
                
                return CustomCard(
                  child: ListTile(
                    leading: CircleAvatar(
                      backgroundColor: AppColors.vermilion.withOpacity(0.1),
                      child: Icon(
                        Icons.fitness_center,
                        color: AppColors.vermilion,
                      ),
                    ),
                    title: Text(
                      'Session du ${_formatDate(startTime)}',
                      style: AppTypography.body1.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    subtitle: Text(
                      '${(duration / 60).round()} min • $calories calories',
                      style: AppTypography.caption.copyWith(
                        color: Theme.of(context).colorScheme.onSurfaceVariant,
                      ),
                    ),
                    trailing: Icon(
                      Icons.check_circle,
                      color: AppColors.success['500'],
                    ),
                  ),
                );
              }).toList(),
            );
          },
        ),
      ],
    ).animate().fadeIn(
      duration: 800.milliseconds,
      delay: 400.milliseconds,
    );
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }
} 