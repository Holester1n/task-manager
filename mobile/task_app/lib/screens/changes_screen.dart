import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/changes_provider.dart';
import '../providers/systems_provider.dart';
import '../models/system.dart';
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

class ChangesScreen extends ConsumerStatefulWidget {
  const ChangesScreen({super.key});

  @override
  ConsumerState<ChangesScreen> createState() => _ChangesScreenState();
}

class _ChangesScreenState extends ConsumerState<ChangesScreen> {
  String? _selectedStatus;
  System? _selectedSystem;

  void _applyFilters() {
    ref.read(changesProvider.notifier).load(
      systemId: _selectedSystem?.id,
      status: _selectedStatus,
    );
  }

  void _resetFilters() {
    setState(() {
      _selectedStatus = null;
      _selectedSystem = null;
    });
    ref.read(changesProvider.notifier).load();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(changesProvider);
    final systemsState = ref.watch(systemsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Изменения'),
        actions: [
          if (_selectedStatus != null || _selectedSystem != null)
            IconButton(
              icon: const Icon(Icons.filter_alt_off),
              onPressed: _resetFilters,
              tooltip: 'Сбросить фильтры',
            ),
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _applyFilters,
          ),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(12, 12, 12, 0),
            child: ButtonTheme(
              alignedDropdown: true,
              child: Row(
                children: [
                  Expanded(
                    child: DropdownButtonFormField<String?>(
                      initialValue: _selectedStatus,
                      isExpanded: true,
                      decoration: const InputDecoration(
                        labelText: 'Статус',
                        border: OutlineInputBorder(),
                        contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      ),
                      items: [
                        const DropdownMenuItem(value: null, child: Text('Все')),
                        ..._statusLabels.entries.map((e) => DropdownMenuItem(
                          value: e.key,
                          child: Text(e.value),
                        )),
                      ],
                      onChanged: (v) {
                        setState(() => _selectedStatus = v);
                        _applyFilters();
                      },
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: systemsState.when(
                      loading: () => const SizedBox(),
                      error: (_, __) => const SizedBox(),
                      data: (systems) => ButtonTheme(
                        alignedDropdown: true,
                        child: DropdownButtonFormField<System?>(
                          initialValue: _selectedSystem,
                          isExpanded: true,
                          decoration: const InputDecoration(
                            labelText: 'Система',
                            border: OutlineInputBorder(),
                            contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                          ),
                          items: [
                            const DropdownMenuItem(value: null, child: Text('Все')),
                            ...systems.map((s) => DropdownMenuItem(
                              value: s,
                              child: Text(s.name, overflow: TextOverflow.ellipsis),
                            )),
                          ],
                          onChanged: (s) {
                            setState(() => _selectedSystem = s);
                            _applyFilters();
                          },
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 8),
          Expanded(
            child: state.isLoading
                ? const Center(child: CircularProgressIndicator())
                : state.error != null
                    ? Center(child: Text('Ошибка: ${state.error}'))
                    : state.changes.isEmpty
                        ? const Center(child: Text('Нет изменений'))
                        : RefreshIndicator(
                            onRefresh: () async => _applyFilters(),
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
          ),
        ],
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