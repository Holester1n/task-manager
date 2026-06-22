import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/system.dart';
import '../services/systems_service.dart';

class SystemsNotifier extends StateNotifier<AsyncValue<List<System>>> {
  final SystemsService _service = SystemsService();

  SystemsNotifier() : super(const AsyncValue.loading()) {
    load();
  }

  Future<void> load() async {
    state = const AsyncValue.loading();
    try {
      final systems = await _service.getSystems();
      state = AsyncValue.data(systems);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }
}

final systemsProvider = StateNotifierProvider<SystemsNotifier, AsyncValue<List<System>>>(
  (ref) => SystemsNotifier(),
);