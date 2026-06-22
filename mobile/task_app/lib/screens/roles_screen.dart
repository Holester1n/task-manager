import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/roles_provider.dart';
import '../providers/systems_provider.dart';
import '../models/user.dart';
import '../core/api_client.dart';

class RolesScreen extends ConsumerStatefulWidget {
  const RolesScreen({super.key});

  @override
  ConsumerState<RolesScreen> createState() => _RolesScreenState();
}

class _RolesScreenState extends ConsumerState<RolesScreen> {
  final _newRoleCtrl = TextEditingController();
  final Map<int, List<int>> _selectedSystems = {};
  bool _systemsLoaded = false;

  Future<void> _loadAllRoleSystems(List<Role> roles) async {
    final dio = ApiClient.create();
    for (final role in roles) {
      if (role.name == 'admin') continue;
      try {
        final response = await dio.get('/roles/${role.id}/systems');
        final ids = List<int>.from(response.data['system_ids']);
        if (mounted) setState(() => _selectedSystems[role.id] = ids);
      } catch (_) {}
    }
  }

  @override
  void dispose() {
    _newRoleCtrl.dispose();
    super.dispose();
  }

  Future<void> _createRole() async {
    if (_newRoleCtrl.text.trim().isEmpty) return;
    try {
      final dio = ApiClient.create();
      await dio.post('/roles/', data: {'name': _newRoleCtrl.text.trim()});
      _newRoleCtrl.clear();
      await ref.read(rolesProvider.notifier).load();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Ошибка: $e')),
        );
      }
    }
  }

  Future<void> _deleteRole(Role role) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Удалить роль?'),
        content: Text('«${role.name}» будет удалена безвозвратно.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Отмена')),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Удалить', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
    if (confirmed != true) return;
    try {
      final dio = ApiClient.create();
      await dio.delete('/roles/${role.id}');
      await ref.read(rolesProvider.notifier).load();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Ошибка: $e')),
        );
      }
    }
  }

  void _toggleSystem(int roleId, int systemId) {
    setState(() {
      final current = _selectedSystems[roleId] ?? [];
      if (current.contains(systemId)) {
        _selectedSystems[roleId] = current.where((id) => id != systemId).toList();
      } else {
        _selectedSystems[roleId] = [...current, systemId];
      }
    });
  }

  Future<void> _saveAccess(int roleId) async {
    try {
      final dio = ApiClient.create();
      await dio.put('/roles/$roleId/systems', data: {
        'system_ids': _selectedSystems[roleId] ?? [],
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Доступ сохранён')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Ошибка: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final rolesState = ref.watch(rolesProvider);
    final systemsState = ref.watch(systemsProvider);

    rolesState.whenData((roles) {
      if (!_systemsLoaded) {
        _systemsLoaded = true;
        _loadAllRoleSystems(roles);
      }
    });

    return Scaffold(
      appBar: AppBar(
        title: const Text('Роли'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => ref.read(rolesProvider.notifier).load(),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Создание роли
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Новая роль',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.w500)),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: _newRoleCtrl,
                            decoration: const InputDecoration(
                              hintText: 'Название роли',
                              border: OutlineInputBorder(),
                              contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        ElevatedButton(
                          onPressed: _createRole,
                          child: const Text('Создать'),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 16),

            // Список ролей
            rolesState.when(
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => Center(child: Text('Ошибка: $e')),
              data: (roles) => Column(
                children: roles.map((role) => Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              role.name == 'admin' ? '👑 ${role.name}' : role.name,
                              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
                            ),
                            if (role.name != 'admin')
                              TextButton(
                                onPressed: () => _deleteRole(role),
                                style: TextButton.styleFrom(foregroundColor: Colors.red),
                                child: const Text('Удалить'),
                              ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        if (role.name == 'admin')
                          const Text(
                            'Админ имеет доступ ко всем системам',
                            style: TextStyle(color: Colors.grey),
                          )
                        else
                          systemsState.when(
                            loading: () => const CircularProgressIndicator(),
                            error: (e, _) => Text('Ошибка: $e'),
                            data: (systems) => Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text('Доступ к системам:',
                                    style: TextStyle(color: Colors.grey, fontSize: 13)),
                                const SizedBox(height: 8),
                                ...systems.map((system) => CheckboxListTile(
                                  title: Text(system.name),
                                  value: (_selectedSystems[role.id] ?? []).contains(system.id),
                                  onChanged: (_) => _toggleSystem(role.id, system.id),
                                  controlAffinity: ListTileControlAffinity.leading,
                                  dense: true,
                                  contentPadding: EdgeInsets.zero,
                                )),
                                const SizedBox(height: 8),
                                ElevatedButton(
                                  onPressed: () => _saveAccess(role.id),
                                  child: const Text('Сохранить доступ'),
                                ),
                              ],
                            ),
                          ),
                      ],
                    ),
                  ),
                )).toList(),
              ),
            ),
          ],
        ),
      ),
    );
  }
}