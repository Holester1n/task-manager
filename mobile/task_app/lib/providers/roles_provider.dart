import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/user.dart';
import '../services/roles_service.dart';

class RolesNotifier extends StateNotifier<AsyncValue<List<Role>>> {
  final RolesService _service = RolesService();

  RolesNotifier() : super(const AsyncValue.loading()) {
    load();
  }

  Future<void> load() async {
    state = const AsyncValue.loading();
    try {
      final roles = await _service.getRoles();
      state = AsyncValue.data(roles);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }
}

final rolesProvider = StateNotifierProvider<RolesNotifier, AsyncValue<List<Role>>>(
  (ref) => RolesNotifier(),
);