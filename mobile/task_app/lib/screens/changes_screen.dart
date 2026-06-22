import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/changes_provider.dart';
import 'new_change_screen.dart';
import 'change_detail_screen.dart';


const _statusLabels = {
  'created': 'Создано',
  'planned': 'Запланировано',
  'applied': 'Применено',
  'tested': 'Протестировано',
  'rolled_back': 'Откатили',
};

const _statusColors = {
  'created': Colors.blue,
  'planned': Colors.orange,
  'applied': Colors.green,
  'tested': Colors.teal,
  'rolled_back': Colors.red,
};

class ChangesScreen extends ConsumerWidget {
  const ChangesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(changesProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Изменения'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => ref.read(changesProvider.notifier).load(),
          ),
        ],
      ),
      body: state.isLoading
          ? const Center(child: CircularProgressIndicator())
          : state.error != null
              ? Center(child: Text('Ошибка: ${state.error}'))
              : state.changes.isEmpty
                  ? const Center(child: Text('Нет изменений'))
                  : RefreshIndicator(
                      onRefresh: () => ref.read(changesProvider.notifier).load(),
                      child: ListView.builder(
                        padding: const EdgeInsets.all(12),
                        itemCount: state.changes.length,
                        itemBuilder: (context, i) {
                          final change = state.changes[i];
                          final color = _statusColors[change.status] ?? Colors.grey;
                          final label = _statusLabels[change.status] ?? change.status;

                          return Card(
                            margin: const EdgeInsets.only(bottom: 8),
                            child: ListTile(
                              title: Text(change.title),
                              subtitle: Text(change.description ?? ''),
                              trailing: Chip(
                                label: Text(
                                  label,
                                  style: const TextStyle(fontSize: 12, color: Colors.white),
                                ),
                                backgroundColor: color,
                                padding: EdgeInsets.zero,
                              ),
                              leading: change.requiresRestart
                                  ? const Icon(Icons.warning_amber, color: Colors.orange)
                                  : const Icon(Icons.check_circle_outline, color: Colors.grey),
                              onTap: () => Navigator.of(context).push(
                                MaterialPageRoute(builder: (_) => ChangeDetailScreen(change: change)),
                              ),
                            ),
                          );
                        },
                      ),
                    ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => Navigator.of(context).push(
          MaterialPageRoute(builder: (_) => const NewChangeScreen()),
        ),
        child: const Icon(Icons.add),
      ),
    );
  }
}