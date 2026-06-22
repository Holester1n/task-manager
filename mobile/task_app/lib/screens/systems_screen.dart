import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/systems_provider.dart';

class SystemsScreen extends ConsumerWidget {
  const SystemsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(systemsProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Системы')),
      body: state.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Ошибка: $e')),
        data: (systems) => systems.isEmpty
            ? const Center(child: Text('Нет систем'))
            : ListView.builder(
                padding: const EdgeInsets.all(12),
                itemCount: systems.length,
                itemBuilder: (context, i) {
                  final system = systems[i];
                  return Card(
                    margin: const EdgeInsets.only(bottom: 8),
                    child: ListTile(
                      title: Text(system.name),
                      subtitle: system.description != null
                          ? Text(system.description!)
                          : null,
                      leading: const Icon(Icons.computer),
                    ),
                  );
                },
              ),
      ),
    );
  }
}