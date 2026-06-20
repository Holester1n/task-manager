import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'providers/auth_provider.dart';
import 'screens/login_screen.dart';

final _router = GoRouter(
  redirect: (context, state) {
    return null;
  },
  routes: [
    GoRoute(path: '/', builder: (_, __) => const LoginScreen()),
  ],
);

void main() {
  runApp(const ProviderScope(child: MyApp()));
}

class MyApp extends ConsumerWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authProvider);

    return MaterialApp.router(
      title: 'Task Manager',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF1976D2)),
        useMaterial3: true,
      ),
      routerConfig: _router,
      builder: (context, child) {
        if (auth.user != null) {
          return Scaffold(
            body: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text('Привет, ${auth.user!.name}!',
                      style: const TextStyle(fontSize: 24)),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () => ref.read(authProvider.notifier).logout(),
                    child: const Text('Выйти'),
                  ),
                ],
              ),
            ),
          );
        }
        return child!;
      },
    );
  }
}