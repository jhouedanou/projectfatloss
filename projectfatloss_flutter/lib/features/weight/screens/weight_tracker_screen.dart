import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import '../../../core/constants/app_colors.dart';
import '../../../shared/services/storage_service.dart';

/// Écran de suivi du poids corporel
/// Reproduit le WeightTracker.jsx de la PWA
class WeightTrackerScreen extends Scaffold {
  WeightTrackerScreen({super.key})
      : super(
          appBar: AppBar(
            title: const Text('Suivi du Poids'),
            centerTitle: true,
            actions: const [
              _AddWeightButton(),
            ],
          ),
          body: const WeightTrackerBody(),
          floatingActionButton: const _AddWeightFAB(),
        );
}

class WeightTrackerBody extends StatefulWidget {
  const WeightTrackerBody({super.key});

  @override
  State<WeightTrackerBody> createState() => _WeightTrackerBodyState();
}

class _WeightTrackerBodyState extends State<WeightTrackerBody> {
  List<Map<String, dynamic>> _weightHistory = [];
  bool _isLoading = true;
  double? _minWeight;
  double? _maxWeight;
  double? _currentWeight;
  double? _startWeight;
  double? _weightChange;

  @override
  void initState() {
    super.initState();
    _loadWeightHistory();
  }

  Future<void> _loadWeightHistory() async {
    setState(() => _isLoading = true);

    try {
      final weights = await StorageService.getAllWeights();

      if (weights.isNotEmpty) {
        // Trier par date
        weights.sort((a, b) {
          final dateA = DateTime.parse(a['date'] as String);
          final dateB = DateTime.parse(b['date'] as String);
          return dateA.compareTo(dateB);
        });

        // Calculer les statistiques
        final allWeights =
            weights.map((w) => (w['weight'] as num).toDouble()).toList();

        _minWeight = allWeights.reduce((a, b) => a < b ? a : b);
        _maxWeight = allWeights.reduce((a, b) => a > b ? a : b);
        _startWeight = allWeights.first;
        _currentWeight = allWeights.last;
        _weightChange = _currentWeight! - _startWeight!;
      }

      setState(() {
        _weightHistory = weights;
        _isLoading = false;
      });
    } catch (e) {
      print('❌ Erreur chargement poids: $e');
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_weightHistory.isEmpty) {
      return _buildEmptyState();
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Statistiques
          _buildStatsCard(),

          const SizedBox(height: 20),

          // Graphique
          _buildChart(),

          const SizedBox(height: 20),

          // Historique
          _buildHistoryList(),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.monitor_weight_outlined,
            size: 80,
            color: Colors.grey[400],
          ),
          const SizedBox(height: 20),
          Text(
            'Aucune donnée de poids',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.grey[600],
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Ajoutez votre première mesure',
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey[500],
            ),
          ),
          const SizedBox(height: 30),
          ElevatedButton.icon(
            onPressed: () => _showAddWeightDialog(context),
            icon: const Icon(Icons.add),
            label: const Text('Ajouter une mesure'),
            style: ElevatedButton.styleFrom(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatsCard() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Statistiques',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: _buildStatItem(
                    label: 'Actuel',
                    value: '${_currentWeight!.toStringAsFixed(1)} kg',
                    color: AppColors.vermilion,
                  ),
                ),
                Expanded(
                  child: _buildStatItem(
                    label: 'Départ',
                    value: '${_startWeight!.toStringAsFixed(1)} kg',
                    color: AppColors.blueIndigo,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: _buildStatItem(
                    label: 'Min',
                    value: '${_minWeight!.toStringAsFixed(1)} kg',
                    color: AppColors.success['500']!,
                  ),
                ),
                Expanded(
                  child: _buildStatItem(
                    label: 'Max',
                    value: '${_maxWeight!.toStringAsFixed(1)} kg',
                    color: AppColors.warning['500']!,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: _weightChange! < 0
                      ? AppColors.successGradient
                      : AppColors.primaryGradient,
                ),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    _weightChange! < 0
                        ? Icons.trending_down
                        : Icons.trending_up,
                    color: Colors.white,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    '${_weightChange!.abs().toStringAsFixed(1)} kg ${_weightChange! < 0 ? "perdus" : "gagnés"}',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatItem({
    required String label,
    required String value,
    required Color color,
  }) {
    return Column(
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            color: Colors.grey[600],
          ),
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: color,
          ),
        ),
      ],
    );
  }

  Widget _buildChart() {
    // Préparer les données pour le graphique
    final spots = <FlSpot>[];
    for (int i = 0; i < _weightHistory.length; i++) {
      final weight = (_weightHistory[i]['weight'] as num).toDouble();
      spots.add(FlSpot(i.toDouble(), weight));
    }

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Évolution',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 20),
            SizedBox(
              height: 200,
              child: LineChart(
                LineChartData(
                  gridData: const FlGridData(show: true),
                  titlesData: FlTitlesData(
                    leftTitles: AxisTitles(
                      sideTitles: SideTitles(
                        showTitles: true,
                        reservedSize: 40,
                        getTitlesWidget: (value, meta) {
                          return Text(
                            '${value.toInt()} kg',
                            style: const TextStyle(fontSize: 10),
                          );
                        },
                      ),
                    ),
                    rightTitles: const AxisTitles(
                      sideTitles: SideTitles(showTitles: false),
                    ),
                    topTitles: const AxisTitles(
                      sideTitles: SideTitles(showTitles: false),
                    ),
                    bottomTitles: AxisTitles(
                      sideTitles: SideTitles(
                        showTitles: true,
                        getTitlesWidget: (value, meta) {
                          if (value.toInt() >= _weightHistory.length) {
                            return const SizedBox();
                          }
                          final date = DateTime.parse(
                            _weightHistory[value.toInt()]['date'] as String,
                          );
                          return Padding(
                            padding: const EdgeInsets.only(top: 8),
                            child: Text(
                              '${date.day}/${date.month}',
                              style: const TextStyle(fontSize: 10),
                            ),
                          );
                        },
                      ),
                    ),
                  ),
                  borderData: FlBorderData(show: true),
                  lineBarsData: [
                    LineChartBarData(
                      spots: spots,
                      isCurved: true,
                      gradient: LinearGradient(
                        colors: AppColors.primaryGradient,
                      ),
                      barWidth: 3,
                      dotData: const FlDotData(show: true),
                      belowBarData: BarAreaData(
                        show: true,
                        gradient: LinearGradient(
                          colors: AppColors.primaryGradient
                              .map((color) => color.withOpacity(0.3))
                              .toList(),
                        ),
                      ),
                    ),
                  ],
                  minY: (_minWeight! - 2).roundToDouble(),
                  maxY: (_maxWeight! + 2).roundToDouble(),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHistoryList() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Historique',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _weightHistory.length,
              separatorBuilder: (context, index) => const Divider(),
              itemBuilder: (context, index) {
                final reversedIndex = _weightHistory.length - 1 - index;
                final entry = _weightHistory[reversedIndex];
                return _buildHistoryItem(entry);
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHistoryItem(Map<String, dynamic> entry) {
    final date = DateTime.parse(entry['date'] as String);
    final weight = (entry['weight'] as num).toDouble();
    final notes = entry['notes'] as String?;

    return ListTile(
      contentPadding: EdgeInsets.zero,
      leading: CircleAvatar(
        backgroundColor: AppColors.vermilion.withOpacity(0.1),
        child: Icon(
          Icons.monitor_weight,
          color: AppColors.vermilion,
        ),
      ),
      title: Text(
        '${weight.toStringAsFixed(1)} kg',
        style: const TextStyle(
          fontWeight: FontWeight.bold,
        ),
      ),
      subtitle: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            '${date.day}/${date.month}/${date.year}',
            style: TextStyle(
              fontSize: 12,
              color: Colors.grey[600],
            ),
          ),
          if (notes != null && notes.isNotEmpty)
            Text(
              notes,
              style: const TextStyle(fontSize: 12),
            ),
        ],
      ),
      trailing: IconButton(
        icon: const Icon(Icons.delete_outline),
        onPressed: () => _deleteWeight(entry['id'] as int),
      ),
    );
  }

  Future<void> _deleteWeight(int id) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Supprimer'),
        content: const Text('Voulez-vous supprimer cette mesure ?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Annuler'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Supprimer'),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      await StorageService.deleteWeight(id);
      _loadWeightHistory();
    }
  }

  void _showAddWeightDialog(BuildContext context) {
    final weightController = TextEditingController();
    final notesController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Ajouter une mesure'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: weightController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                labelText: 'Poids (kg)',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: notesController,
              decoration: const InputDecoration(
                labelText: 'Notes (optionnel)',
                border: OutlineInputBorder(),
              ),
              maxLines: 2,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Annuler'),
          ),
          ElevatedButton(
            onPressed: () async {
              final weight = double.tryParse(weightController.text);
              if (weight != null) {
                await StorageService.saveWeight(
                  date: DateTime.now(),
                  weight: weight,
                  notes: notesController.text.isEmpty
                      ? null
                      : notesController.text,
                );
                if (context.mounted) {
                  Navigator.pop(context);
                  _loadWeightHistory();
                }
              }
            },
            child: const Text('Ajouter'),
          ),
        ],
      ),
    );
  }
}

class _AddWeightButton extends StatelessWidget {
  const _AddWeightButton();

  @override
  Widget build(BuildContext context) {
    return IconButton(
      icon: const Icon(Icons.add),
      onPressed: () {
        final state =
            context.findAncestorStateOfType<_WeightTrackerBodyState>();
        state?._showAddWeightDialog(context);
      },
    );
  }
}

class _AddWeightFAB extends StatelessWidget {
  const _AddWeightFAB();

  @override
  Widget build(BuildContext context) {
    return FloatingActionButton(
      onPressed: () {
        final state =
            context.findAncestorStateOfType<_WeightTrackerBodyState>();
        state?._showAddWeightDialog(context);
      },
      child: const Icon(Icons.add),
    );
  }
}