import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/system.dart';
import '../models/segment.dart';
import '../models/user.dart';
import '../providers/changes_provider.dart';
import '../providers/systems_provider.dart';
import '../providers/users_provider.dart';
import '../services/systems_service.dart';
import '../core/api_client.dart';

class NewChangeScreen extends ConsumerStatefulWidget {
  const NewChangeScreen({super.key});

  @override
  ConsumerState<NewChangeScreen> createState() => _NewChangeScreenState();
}

class _NewChangeScreenState extends ConsumerState<NewChangeScreen> {
  final _titleCtrl = TextEditingController();
  final _descCtrl = TextEditingController();

  System? _selectedSystem;
  Segment? _selectedSegment;
  User? _selectedResponsible;
  DateTime? _plannedAt;
  bool _requiresRestart = false;
  bool _isLoading = false;
  String? _error;

  List<Segment> _segments = [];
  bool _loadingSegments = false;

  @override
  void dispose() {
    _titleCtrl.dispose();
    _descCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadSegments(int systemId) async {
    setState(() {
      _loadingSegments = true;
      _selectedSegment = null;
      _segments = [];
    });
    try {
      final segments = await SystemsService().getSegments(systemId);
      setState(() {
        _segments = segments;
        _loadingSegments = false;
      });
    } catch (_) {
      setState(() => _loadingSegments = false);
    }
  }

  Future<void> _pickDate() async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: now,
      firstDate: now,
      lastDate: DateTime(now.year + 2),
    );
    if (picked != null) {
      final time = await showTimePicker(
        context: context,
        initialTime: TimeOfDay.now(),
      );
      if (time != null) {
        setState(() {
          _plannedAt = DateTime(
            picked.year, picked.month, picked.day,
            time.hour, time.minute,
          );
        });
      }
    }
  }

  Future<void> _submit() async {
    if (_titleCtrl.text.trim().isEmpty) {
      setState(() => _error = 'Введите название');
      return;
    }
    if (_selectedSystem == null) {
      setState(() => _error = 'Выберите систему');
      return;
    }
    if (_selectedResponsible == null) {
      setState(() => _error = 'Выберите ответственного');
      return;
    }

    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final dio = ApiClient.create();
      await dio.post('/changes/', data: {
        'title': _titleCtrl.text.trim(),
        'description': _descCtrl.text.trim().isEmpty ? null : _descCtrl.text.trim(),
        'system_id': _selectedSystem!.id,
        'segment_id': _selectedSegment?.id,
        'responsible_id': _selectedResponsible!.id,
        'requires_restart': _requiresRestart,
        'planned_at': _plannedAt?.toIso8601String(),
      });

      await ref.read(changesProvider.notifier).load();
      if (mounted) Navigator.of(context).pop();
    } catch (e) {
      setState(() {
        _isLoading = false;
        _error = 'Ошибка: $e';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final systemsState = ref.watch(systemsProvider);
    final usersState = ref.watch(usersProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Новое изменение')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            TextField(
              controller: _titleCtrl,
              decoration: const InputDecoration(
                labelText: 'Название *',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _descCtrl,
              maxLines: 3,
              decoration: const InputDecoration(
                labelText: 'Описание',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16),
            systemsState.when(
              loading: () => const CircularProgressIndicator(),
              error: (e, _) => Text('Ошибка загрузки систем: $e'),
              data: (systems) => DropdownButtonFormField<System>(
                value: _selectedSystem,
                decoration: const InputDecoration(
                  labelText: 'Система *',
                  border: OutlineInputBorder(),
                ),
                items: systems.map((s) => DropdownMenuItem(
                  value: s,
                  child: Text(s.name),
                )).toList(),
                onChanged: (s) {
                  setState(() => _selectedSystem = s);
                  if (s != null) _loadSegments(s.id);
                },
              ),
            ),
            if (_selectedSystem != null) ...[
              const SizedBox(height: 16),
              _loadingSegments
                  ? const CircularProgressIndicator()
                  : DropdownButtonFormField<Segment?>(
                      value: _selectedSegment,
                      decoration: const InputDecoration(
                        labelText: 'Сегмент',
                        border: OutlineInputBorder(),
                      ),
                      items: [
                        const DropdownMenuItem(value: null, child: Text('Не выбран')),
                        ..._segments.map((s) => DropdownMenuItem(
                          value: s,
                          child: Text(s.name),
                        )),
                      ],
                      onChanged: (s) => setState(() => _selectedSegment = s),
                    ),
            ],
            const SizedBox(height: 16),
            usersState.when(
              loading: () => const CircularProgressIndicator(),
              error: (e, _) => Text('Ошибка загрузки пользователей: $e'),
              data: (users) => DropdownButtonFormField<User>(
                value: _selectedResponsible,
                decoration: const InputDecoration(
                  labelText: 'Ответственный *',
                  border: OutlineInputBorder(),
                ),
                items: users.map((u) => DropdownMenuItem(
                  value: u,
                  child: Text(u.name),
                )).toList(),
                onChanged: (u) => setState(() => _selectedResponsible = u),
              ),
            ),
            const SizedBox(height: 16),
            OutlinedButton.icon(
              onPressed: _pickDate,
              icon: const Icon(Icons.calendar_today),
              label: Text(
                _plannedAt != null
                    ? '${_plannedAt!.day}.${_plannedAt!.month}.${_plannedAt!.year} ${_plannedAt!.hour}:${_plannedAt!.minute.toString().padLeft(2, '0')}'
                    : 'Дата планирования',
              ),
            ),
            if (_plannedAt != null)
              TextButton(
                onPressed: () => setState(() => _plannedAt = null),
                child: const Text('Сбросить дату'),
              ),
            SwitchListTile(
              title: const Text('Требует перезагрузки'),
              value: _requiresRestart,
              onChanged: (v) => setState(() => _requiresRestart = v),
            ),
            if (_error != null) ...[
              const SizedBox(height: 8),
              Text(_error!, style: const TextStyle(color: Colors.red)),
            ],
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _isLoading ? null : _submit,
              child: _isLoading
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Text('Создать'),
            ),
          ],
        ),
      ),
    );
  }
}