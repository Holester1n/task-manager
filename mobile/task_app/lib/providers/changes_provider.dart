import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/change.dart';
import '../services/changes_service.dart';

class ChangesState {
  final List<Change> changes;
  final bool isLoading;
  final String? error;

  const ChangesState({
    this.changes = const [],
    this.isLoading = false,
    this.error,
  });

  ChangesState copyWith({List<Change>? changes, bool? isLoading, String? error}) =>
      ChangesState(
        changes: changes ?? this.changes,
        isLoading: isLoading ?? this.isLoading,
        error: error,
      );
}

class ChangesNotifier extends StateNotifier<ChangesState> {
  final ChangesService _service = ChangesService();

  ChangesNotifier() : super(const ChangesState()) {
    load();
  }

  Future<void> load({int? systemId, String? status}) async {
    state = state.copyWith(isLoading: true);
    try {
      final changes = await _service.getChanges(systemId: systemId, status: status);
      state = state.copyWith(changes: changes, isLoading: false);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> delete(int id) async {
    await _service.deleteChange(id);
    await load();
  }
}

final changesProvider = StateNotifierProvider<ChangesNotifier, ChangesState>(
  (ref) => ChangesNotifier(),
);