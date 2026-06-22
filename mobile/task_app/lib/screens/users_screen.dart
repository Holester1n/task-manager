import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/users_provider.dart';
import '../providers/roles_provider.dart';
import '../models/user.dart';
import '../core/api_client.dart';

class UsersScreen extends ConsumerWidget {
  const UsersScreen({super.key});

  void _showRolePicker(BuildContext context, WidgetRef ref, User user) {
    showModalBottomSheet(
      context: context,
      builder: (_) => Consumer(
        builder: (context, ref, _) {
          final rolesState = ref.watch(rolesProvider);

          return rolesState.when(
            loading: () => const SizedBox(
              height: 100,
              child: Center(child: CircularProgressIndicator()),
            ),
            error: (e, _) => SizedBox(
              height: 100,
              child: Center(child: Text('Ошибка: $e')),
            ),
            data: (roles) => Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: Text(
                    'Роль для ${user.name}',
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
                  ),
                ),
                ...roles.map((role) => ListTile(
                  title: Text(role.name == 'admin' ? '👑 ${role.name}' : role.name),
                  leading: Icon(
                    user.role?.id == role.id
                        ? Icons.radio_button_checked
                        : Icons.radio_button_unchecked,
                    color: user.role?.id == role.id ? Colors.blue : null,
                  ),
                  onTap: () async {
                    Navigator.pop(context);
                    try {
                      final dio = ApiClient.create();
                      await dio.patch('/users/${user.id}/role?role_id=${role.id}');
                      await ref.read(usersProvider.notifier).load();
                    } catch (e) {
                      if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('Ошибка: $e')),
                        );
                      }
                    }
                  },
                )),
                const SizedBox(height: 8),
              ],
            ),
          );
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(usersProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Пользователи'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => ref.read(usersProvider.notifier).load(),
          ),
        ],
      ),
      body: state.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Ошибка: $e')),
        data: (users) => ListView.builder(
          padding: const EdgeInsets.all(12),
          itemCount: users.length,
          itemBuilder: (context, i) {
            final user = users[i];
            final isAdmin = user.role?.name == 'admin';
            return Card(
              margin: const EdgeInsets.only(bottom: 8),
              child: ListTile(
                title: Text(user.name),
                subtitle: Text(user.email),
                leading: CircleAvatar(
                  child: Text(user.name[0].toUpperCase()),
                ),
                trailing: GestureDetector(
                  onTap: () => _showRolePicker(context, ref, user),
                  child: Chip(
                    label: Text(
                      isAdmin ? '👑 admin' : user.role?.name ?? 'нет роли',
                      style: const TextStyle(fontSize: 12),
                    ),
                    backgroundColor: isAdmin
                        ? Colors.amber.withOpacity(0.2)
                        : Colors.grey.withOpacity(0.2),
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}