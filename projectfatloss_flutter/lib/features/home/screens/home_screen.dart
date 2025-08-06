import 'package:flutter/material.dart';
import '../../../core/widgets/app_header.dart';
import '../../../core/widgets/custom_gradient_button.dart';
import '../../../core/widgets/custom_card.dart';
import '../../../core/widgets/animations/fade_animations.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_dimensions.dart';
import '../../workout/screens/workout_screen.dart';
import '../../stats/screens/stats_screen.dart';

/// Écran d'accueil reproduisant la PWA Project Fat Loss
class HomeScreen extends StatefulWidget {
  final bool isDarkMode;
  final VoidCallback onThemeToggle;

  const HomeScreen({
    Key? key,
    required this.isDarkMode,
    required this.onThemeToggle,
  }) : super(key: key);

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  String _currentView = 'workout';
  String _selectedMode = 'normal';
  int _currentDayIndex = 0;
  
  final List<ViewOption> _viewOptions = [
    ViewOption(
      value: 'workout',
      label: 'WORKOUT',
      icon: Icons.fitness_center,
    ),
    ViewOption(
      value: 'calendar',
      label: 'CAL',
      icon: Icons.calendar_month,
    ),
    ViewOption(
      value: 'history',
      label: 'HIST',
      icon: Icons.history,
    ),
  ];

  void _onViewChanged(String view) {
    setState(() {
      _currentView = view;
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    return Scaffold(
      backgroundColor: theme.colorScheme.background,
      
      // Header avec gradient exact de la PWA
      appBar: CustomAppHeader(
        title: 'PROJECT FAT LOSS',
        isDarkMode: widget.isDarkMode,
        onThemeToggle: widget.onThemeToggle,
        currentView: _currentView,
        viewOptions: _viewOptions,
        onViewChanged: _onViewChanged,
      ),
      
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(AppDimensions.paddingLarge),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Animation séquentielle des éléments
              SequentialFadeInAnimation(
                children: [
                  _buildWelcomeCard(context),
                  const SizedBox(height: AppDimensions.spacingLarge),
                  _buildDaySelector(context),
                  const SizedBox(height: AppDimensions.spacingLarge),
                  _buildModeSelector(context),
                  const SizedBox(height: AppDimensions.spacingLarge),
                  _buildQuickStats(context),
                  const SizedBox(height: AppDimensions.spacingLarge),
                  _buildTodayWorkout(context),
                  const SizedBox(height: AppDimensions.spacingLarge),
                  _buildActionButtons(context),
                ],
              ),
            ],
          ),
        ),
      ),
      
      // Floating Action Button avec style personnalisé
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _startWorkout(context),
        backgroundColor: AppColors.vermilion,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.play_arrow),
        label: Text(_getModeButtonText()),
      ),
    );
  }

  Widget _buildWelcomeCard(BuildContext context) {
    final theme = Theme.of(context);
    
    return CustomCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                Icons.waving_hand,
                color: AppColors.secondary['500'],
                size: AppDimensions.iconLarge,
              ),
              const SizedBox(width: AppDimensions.spacingMedium),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Bienvenue !',
                      style: theme.textTheme.headlineSmall?.copyWith(
                        color: theme.colorScheme.onSurface,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: AppDimensions.spacingSmall),
                    Text(
                      'Prêt à brûler des calories aujourd\'hui ?',
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: theme.colorScheme.onSurfaceVariant,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildQuickStats(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: StatsCard(
            title: 'Calories brûlées',
            value: '245',
            subtitle: 'Aujourd\'hui',
            icon: Icons.local_fire_department,
            iconColor: AppColors.secondary['500'],
            valueColor: AppColors.darkGreen,
          ),
        ),
        const SizedBox(width: AppDimensions.spacingMedium),
        Expanded(
          child: StatsCard(
            title: 'Séances',
            value: '12',
            subtitle: 'Cette semaine',
            icon: Icons.fitness_center,
            iconColor: AppColors.blueIndigo,
            valueColor: AppColors.vermilion,
          ),
        ),
      ],
    );
  }

  Widget _buildTodayWorkout(BuildContext context) {
    final theme = Theme.of(context);
    
    return CustomCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                Icons.today,
                color: theme.colorScheme.primary,
                size: AppDimensions.iconMedium,
              ),
              const SizedBox(width: AppDimensions.spacingMedium),
              Text(
                'Entraînement du jour',
                style: theme.textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const SizedBox(height: AppDimensions.spacingLarge),
          
          // Liste des exercices d'aujourd'hui
          _buildExercisePreview('Pompes', '3 × 15 reps', Icons.fitness_center),
          const SizedBox(height: AppDimensions.spacingMedium),
          _buildExercisePreview('Squats', '3 × 20 reps', Icons.accessibility_new),
          const SizedBox(height: AppDimensions.spacingMedium),
          _buildExercisePreview('Planche', '3 × 30s', Icons.timer),
          
          const SizedBox(height: AppDimensions.spacingLarge),
          
          CustomGradientButton(
            text: 'Voir le programme complet',
            onPressed: () => _viewFullProgram(context),
            isFullWidth: true,
            icon: Icons.list,
          ),
        ],
      ),
    );
  }

  Widget _buildExercisePreview(String name, String details, IconData icon) {
    final theme = Theme.of(context);
    
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(AppDimensions.paddingSmall),
          decoration: BoxDecoration(
            color: theme.colorScheme.primary.withOpacity(0.1),
            borderRadius: BorderRadius.circular(AppDimensions.borderRadiusSmall),
          ),
          child: Icon(
            icon,
            color: theme.colorScheme.primary,
            size: AppDimensions.iconSmall,
          ),
        ),
        const SizedBox(width: AppDimensions.spacingMedium),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                name,
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
              Text(
                details,
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: AppColors.blueIndigo,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildActionButtons(BuildContext context) {
    return Column(
      children: [
        Row(
          children: [
            Expanded(
              child: CustomOutlineButton(
                text: 'Historique',
                icon: Icons.history,
                onPressed: () => _viewHistory(context),
              ),
            ),
            const SizedBox(width: AppDimensions.spacingMedium),
            Expanded(
              child: CustomOutlineButton(
                text: 'Paramètres',
                icon: Icons.settings,
                onPressed: () => _openSettings(context),
              ),
            ),
          ],
        ),
        const SizedBox(height: AppDimensions.spacingMedium),
        Row(
          children: [
            Expanded(
              child: CustomOutlineButton(
                text: 'Statistiques',
                icon: Icons.analytics,
                onPressed: () => _viewStats(context),
              ),
            ),
            const SizedBox(width: AppDimensions.spacingMedium),
            Expanded(
              child: CustomOutlineButton(
                text: 'Profil',
                icon: Icons.person,
                onPressed: () => _openProfile(context),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildDaySelector(BuildContext context) {
    final theme = Theme.of(context);
    
    return CustomCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                Icons.calendar_today,
                color: theme.colorScheme.primary,
                size: AppDimensions.iconMedium,
              ),
              const SizedBox(width: AppDimensions.spacingMedium),
              Text(
                'Jour d\'entraînement',
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const SizedBox(height: AppDimensions.spacingMedium),
          Container(
            padding: const EdgeInsets.all(AppDimensions.paddingMedium),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  AppColors.vermilion.withValues(alpha: 0.08),
                  AppColors.vermilion.withValues(alpha: 0.04),
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(AppDimensions.borderRadiusLarge),
              border: Border.all(
                color: AppColors.vermilion.withValues(alpha: 0.15),
              ),
            ),
            child: Wrap(
              spacing: AppDimensions.spacingSmall,
              runSpacing: AppDimensions.spacingSmall,
              children: List.generate(14, (index) {
                return _buildDayButton(context, index);
              }),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDayButton(BuildContext context, int index) {
    final theme = Theme.of(context);
    final isSelected = index == _currentDayIndex;
    final isCompleted = index < _currentDayIndex;

    return GestureDetector(
      onTap: () {
        setState(() {
          _currentDayIndex = index;
        });
      },
      child: Container(
        width: 50,
        height: 48,
        decoration: BoxDecoration(
          color: isSelected
              ? AppColors.vermilion.withValues(alpha: 0.15)
              : isCompleted
                  ? Colors.green.withValues(alpha: 0.1)
                  : Colors.transparent,
          borderRadius: BorderRadius.circular(AppDimensions.borderRadiusMedium),
          border: Border.all(
            color: isSelected
                ? AppColors.vermilion
                : isCompleted
                    ? Colors.green
                    : theme.colorScheme.outline.withValues(alpha: 0.3),
            width: isSelected ? 2 : 1,
          ),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: AppColors.vermilion.withValues(alpha: 0.2),
                    blurRadius: 8,
                    offset: const Offset(0, 4),
                  ),
                ]
              : null,
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              isCompleted
                  ? Icons.check_circle
                  : Icons.fitness_center,
              size: 14,
              color: isSelected
                  ? AppColors.vermilion
                  : isCompleted
                      ? Colors.green
                      : theme.colorScheme.onSurfaceVariant,
            ),
            const SizedBox(height: 2),
            Text(
              'J${index + 1}',
              style: theme.textTheme.bodySmall?.copyWith(
                fontSize: 10,
                fontWeight: FontWeight.w700,
                color: isSelected
                    ? AppColors.vermilion
                    : isCompleted
                        ? Colors.green
                        : theme.colorScheme.onSurfaceVariant,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildModeSelector(BuildContext context) {
    final theme = Theme.of(context);
    
    return CustomCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                Icons.speed,
                color: theme.colorScheme.primary,
                size: AppDimensions.iconMedium,
              ),
              const SizedBox(width: AppDimensions.spacingMedium),
              Text(
                'Mode d\'entraînement',
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const SizedBox(height: AppDimensions.spacingMedium),
          Row(
            children: [
              Expanded(
                child: _buildModeToggle(
                  context,
                  'normal',
                  'Mode Normal',
                  '🏋️',
                  'Timer 15s',
                ),
              ),
              const SizedBox(width: AppDimensions.spacingSmall),
              Expanded(
                child: _buildModeToggle(
                  context,
                  'auto',
                  'Mode Auto',
                  '⚡',
                  'Timer 20s',
                ),
              ),
              const SizedBox(width: AppDimensions.spacingSmall),
              Expanded(
                child: _buildModeToggle(
                  context,
                  'fatburner',
                  'Fat Burner',
                  '🔥',
                  'Timer 10s',
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildModeToggle(
    BuildContext context,
    String value,
    String label,
    String icon,
    String description,
  ) {
    final theme = Theme.of(context);
    final isActive = _selectedMode == value;

    return GestureDetector(
      onTap: () {
        setState(() {
          _selectedMode = value;
        });
      },
      child: Container(
        padding: const EdgeInsets.all(AppDimensions.paddingSmall),
        decoration: BoxDecoration(
          color: isActive
              ? AppColors.vermilion.withValues(alpha: 0.15)
              : theme.colorScheme.surfaceContainerHighest,
          borderRadius: BorderRadius.circular(AppDimensions.borderRadiusSmall),
          border: Border.all(
            color: isActive
                ? AppColors.vermilion
                : theme.colorScheme.outline.withValues(alpha: 0.3),
          ),
        ),
        child: Column(
          children: [
            Text(icon, style: const TextStyle(fontSize: 16)),
            const SizedBox(height: 4),
            Text(
              label,
              style: theme.textTheme.bodySmall?.copyWith(
                fontSize: 10,
                color: isActive
                    ? AppColors.vermilion
                    : theme.colorScheme.onSurfaceVariant,
                fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
              ),
              textAlign: TextAlign.center,
            ),
            Text(
              description,
              style: theme.textTheme.bodySmall?.copyWith(
                fontSize: 8,
                color: theme.colorScheme.onSurfaceVariant.withValues(alpha: 0.7),
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  String _getModeButtonText() {
    switch (_selectedMode) {
      case 'auto':
        return '⚡ Commencer Auto';
      case 'fatburner':
        return '🔥 Fat Burner';
      default:
        return 'Commencer';
    }
  }

  void _startWorkout(BuildContext context) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => WorkoutScreen(
          dayId: 'day${_currentDayIndex + 1}',
          isDarkMode: widget.isDarkMode,
          onThemeToggle: widget.onThemeToggle,
          initialMode: _selectedMode,
        ),
      ),
    );
  }

  void _viewFullProgram(BuildContext context) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Affichage du programme complet...'),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  void _viewHistory(BuildContext context) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Affichage de l\'historique...'),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  void _openSettings(BuildContext context) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Ouverture des paramètres...'),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  void _viewStats(BuildContext context) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => StatsScreen(
          isDarkMode: widget.isDarkMode,
          onThemeToggle: widget.onThemeToggle,
        ),
      ),
    );
  }

  void _openProfile(BuildContext context) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Ouverture du profil...'),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }
}