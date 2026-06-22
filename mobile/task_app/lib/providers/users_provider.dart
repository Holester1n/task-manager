import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/user.dart';
import '../services/users_service.dart';

class UsersNotifier extends StateNotifier<AsyncValue<List<User>>> {
  final UsersService _service = UsersService();

  UsersNotifier() : super(const AsyncValue.loading()) {
    load();
  }

  Future<void> load() async {
    state = const AsyncValue.loading();
    try {
      final users = await _service.getUsers();
      state = AsyncValue.data(users);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }
}

final usersProvider = StateNotifierProvider<UsersNotifier, AsyncValue<List<User>>>(
  (ref) => UsersNotifier(),
);