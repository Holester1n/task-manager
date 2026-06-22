import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/systems_provider.dart';
import '../services/systems_service.dart';
import 'system_detail_screen.dart';

class SystemsScreen extends ConsumerStatefulWidget {
  const SystemsScreen({super.key});

  @override
  ConsumerState<SystemsScreen> createState() => _SystemsScreenState();
}

class _SystemsScreenState extends ConsumerState<SystemsScreen> {
  final _nameCtrl = TextEditingController();
  final _descCtrl = TextEditingController();

  @override
  void dispose() {
    _nameCtrl.dispose();
    _descCtrl.dispose();
    super.dispose();
  }

  void _showCreateDialog() {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Новая система'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: _nameCtrl,
              decoration: const InputDecoration(
                labelText: 'Название *',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _descCtrl,
              decoration: const InputDecoration(
                labelText: 'Описание',
                border: OutlineInputBorder(),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              _nameCtrl.clear();
              _descCtrl.clear();
              Navigator.pop(context);
            },
            child: const Text('Отмена'),
          ),
          TextButton(
            onPressed: () async {
              if (_nameCtrl.text.trim().isEmpty) return;
              Navigator.pop(context);
              try {
                await SystemsService().createSystem(
                  _nameCtrl.text.trim(),
                  _descCtrl.text.trim().isEmpty ? null : _descCtrl.text.trim(),
                );
                _nameCtrl.clear();
                _descCtrl.clear();
                await ref.read(systemsProvider.notifier).load();
              } catch (e) {
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Ошибка: $e')),
                  );
                }
              }
            },
            child: const Text('Создать'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
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
                      subtitle: system.description != null ? Text(system.description!) : null,
                      leading: const Icon(Icons.computer),
                      trailing: const Icon(Icons.chevron_right),
                      onTap: () => Navigator.of(context).push(
                        MaterialPageRoute(builder: (_) => SystemDetailScreen(system: system)),
                      ),
                    ),
                  );
                },
              ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _showCreateDialog,
        child: const Icon(Icons.add),
      ),
    );
  }
}