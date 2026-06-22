import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/change.dart';
import '../providers/changes_provider.dart';
import '../core/api_client.dart';

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

class ChangeDetailScreen extends ConsumerStatefulWidget {
  final Change change;

  const ChangeDetailScreen({super.key, required this.change});

  @override
  ConsumerState<ChangeDetailScreen> createState() => _ChangeDetailScreenState();
}

class _ChangeDetailScreenState extends ConsumerState<ChangeDetailScreen> {
  late TextEditingController _titleCtrl;
  late TextEditingController _descCtrl;
  late String _status;
  bool _isLoading = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _titleCtrl = TextEditingController(text: widget.change.title);
    _descCtrl = TextEditingController(text: widget.change.description ?? '');
    _status = widget.change.status;
  }

  @override
  void dispose() {
    _titleCtrl.dispose();
    _descCtrl.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (_titleCtrl.text.trim().isEmpty) {
      setState(() => _error = 'Название не может быть пустым');
      return;
    }

    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final dio = ApiClient.create();
      await dio.patch('/changes/${widget.change.id}', data: {
        'title': _titleCtrl.text.trim(),
        'description': _descCtrl.text.trim().isEmpty ? null : _descCtrl.text.trim(),
        'status': _status,
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

  Future<void> _delete() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Удалить изменение?'),
        content: Text('«${widget.change.title}» будет удалено безвозвратно.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Отмена'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Удалить', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    setState(() => _isLoading = true);
    try {
      await ref.read(changesProvider.notifier).delete(widget.change.id);
      if (mounted) Navigator.of(context).pop();
    } catch (e) {
      setState(() {
        _isLoading = false;
        _error = 'Ошибка удаления: $e';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Изменение'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            TextField(
              controller: _titleCtrl,
              decoration: const InputDecoration(
                labelText: 'Название',
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
            DropdownButtonFormField<String>(
              initialValue: _status,
              decoration: const InputDecoration(
                labelText: 'Статус',
                border: OutlineInputBorder(),
              ),
              items: _statusLabels.entries.map((e) => DropdownMenuItem(
                value: e.key,
                child: Row(
                  children: [
                    Icon(Icons.circle, size: 12, color: _statusColors[e.key]),
                    const SizedBox(width: 8),
                    Text(e.value),
                  ],
                ),
              )).toList(),
              onChanged: (v) => setState(() => _status = v!),
            ),
            if (_error != null) ...[
              const SizedBox(height: 8),
              Text(_error!, style: const TextStyle(color: Colors.red)),
            ],
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _isLoading ? null : _save,
              child: _isLoading
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Text('Сохранить'),
            ),
            const SizedBox(height: 12),
            OutlinedButton(
              onPressed: _isLoading ? null : _delete,
              style: OutlinedButton.styleFrom(
                foregroundColor: Colors.red,
                side: const BorderSide(color: Colors.red),
              ),
              child: const Text('Удалить'),
            ),
          ],
        ),
      ),
    );
  }
}