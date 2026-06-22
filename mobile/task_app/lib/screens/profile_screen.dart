import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/auth_provider.dart';
import '../providers/systems_provider.dart';
import '../services/subscriptions_service.dart';
import '../core/api_client.dart';
import 'users_screen.dart';
import 'roles_screen.dart';

class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({super.key});

  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen> {
  final _chatIdCtrl = TextEditingController();
  List<int> _subscribedIds = [];
  bool _loadingSubs = true;
  bool _telegramSuccess = false;
  String? _telegramError;

  @override
  void initState() {
    super.initState();
    _loadSubscriptions();
  }

  @override
  void dispose() {
    _chatIdCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadSubscriptions() async {
    setState(() => _loadingSubs = true);
    try {
      final ids = await SubscriptionsService().getSubscribedIds();
      setState(() {
        _subscribedIds = ids;
        _loadingSubs = false;
      });
    } catch (_) {
      setState(() => _loadingSubs = false);
    }
  }

  Future<void> _connectTelegram() async {
    if (_chatIdCtrl.text.trim().isEmpty) {
      setState(() => _telegramError = 'Введи chat_id');
      return;
    }
    try {
      final dio = ApiClient.create();
      await dio.post('/users/telegram/connect?chat_id=${_chatIdCtrl.text.trim()}');
      setState(() {
        _telegramSuccess = true;
        _telegramError = null;
      });
    } catch (_) {
      setState(() => _telegramError = 'Ошибка подключения');
    }
  }

  Future<void> _toggleSubscription(int systemId) async {
    try {
      if (_subscribedIds.contains(systemId)) {
        await SubscriptionsService().unsubscribe(systemId);
        setState(() => _subscribedIds.remove(systemId));
      } else {
        await SubscriptionsService().subscribe(systemId);
        setState(() => _subscribedIds.add(systemId));
      }
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authProvider).user;
    final systemsState = ref.watch(systemsProvider);
    final isAdmin = user?.role?.name == 'admin';

    return Scaffold(
      appBar: AppBar(title: const Text('Профиль')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [

            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _infoRow('Имя', user?.name ?? ''),
                    const SizedBox(height: 8),
                    _infoRow('Email', user?.email ?? ''),
                    const SizedBox(height: 8),
                    _infoRow('Роль', isAdmin ? '👑 Админ' : user?.role?.name ?? 'Пользователь'),
                    const SizedBox(height: 8),
                    _infoRow(
                      'Telegram',
                      user?.telegramChatId != null ? '✅ Подключён' : '❌ Не подключён',
                    ),
                  ],
                ),
              ),
            ),

            if (user?.telegramChatId == null) ...[
              const SizedBox(height: 16),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Подключить Telegram',
                          style: TextStyle(fontSize: 16, fontWeight: FontWeight.w500)),
                      const SizedBox(height: 4),
                      const Text(
                        'Найди бота в Telegram, напиши /start и вставь сюда полученный chat_id',
                        style: TextStyle(fontSize: 13, color: Colors.grey),
                      ),
                      const SizedBox(height: 12),
                      if (_telegramSuccess)
                        const Text('Telegram подключён!',
                            style: TextStyle(color: Colors.green)),
                      if (_telegramError != null)
                        Text(_telegramError!,
                            style: const TextStyle(color: Colors.red)),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          Expanded(
                            child: TextField(
                              controller: _chatIdCtrl,
                              keyboardType: TextInputType.number,
                              decoration: const InputDecoration(
                                hintText: 'Твой chat_id',
                                border: OutlineInputBorder(),
                                contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          ElevatedButton(
                            onPressed: _connectTelegram,
                            child: const Text('Подключить'),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ],

            const SizedBox(height: 16),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Подписки на системы',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.w500)),
                    const SizedBox(height: 4),
                    const Text(
                      'Получай уведомления об изменениях в выбранных системах',
                      style: TextStyle(fontSize: 13, color: Colors.grey),
                    ),
                    const SizedBox(height: 12),
                    _loadingSubs
                        ? const Center(child: CircularProgressIndicator())
                        : systemsState.when(
                            loading: () => const CircularProgressIndicator(),
                            error: (e, _) => Text('Ошибка: $e'),
                            data: (systems) => Column(
                              children: systems.map((system) => Padding(
                                padding: const EdgeInsets.symmetric(vertical: 4),
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(system.name),
                                    TextButton(
                                      onPressed: () => _toggleSubscription(system.id),
                                      style: TextButton.styleFrom(
                                        foregroundColor: _subscribedIds.contains(system.id)
                                            ? Colors.red
                                            : Colors.green,
                                      ),
                                      child: Text(
                                        _subscribedIds.contains(system.id)
                                            ? 'Отписаться'
                                            : 'Подписаться',
                                      ),
                                    ),
                                  ],
                                ),
                              )).toList(),
                            ),
                          ),
                  ],
                ),
              ),
            ),

            if (isAdmin) ...[
              const SizedBox(height: 16),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      const Text('Администрирование',
                          style: TextStyle(fontSize: 16, fontWeight: FontWeight.w500)),
                      const SizedBox(height: 12),
                      OutlinedButton.icon(
                        onPressed: () => Navigator.of(context).push(
                          MaterialPageRoute(builder: (_) => const UsersScreen()),
                        ), 
                        icon: const Icon(Icons.people),
                        label: const Text('Пользователи'),
                      ),
                      const SizedBox(height: 8),
                      OutlinedButton.icon(
                        onPressed: () => Navigator.of(context).push(
                          MaterialPageRoute(builder: (_) => const RolesScreen()),
                        ), 
                        icon: const Icon(Icons.shield),
                        label: const Text('Роли'),
                      ),
                    ],
                  ),
                ),
              ),
            ],
            const SizedBox(height: 16),
            OutlinedButton.icon(
              onPressed: () => ref.read(authProvider.notifier).logout(),
              icon: const Icon(Icons.logout, color: Colors.red),
              label: const Text('Выйти', style: TextStyle(color: Colors.red)),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: Colors.red),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _infoRow(String label, String value) {
    return Row(
      children: [
        Text('$label: ', style: const TextStyle(color: Colors.grey)),
        Text(value),
      ],
    );
  }
}