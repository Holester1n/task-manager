import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/system.dart';
import '../models/segment.dart';
import '../providers/systems_provider.dart';
import '../services/systems_service.dart';

class SystemDetailScreen extends ConsumerStatefulWidget {
  final System system;

  const SystemDetailScreen({super.key, required this.system});

  @override
  ConsumerState<SystemDetailScreen> createState() => _SystemDetailScreenState();
}

class _SystemDetailScreenState extends ConsumerState<SystemDetailScreen> {
  late TextEditingController _nameCtrl;
  late TextEditingController _descCtrl;
  bool _isLoading = false;
  String? _error;

  List<Segment> _segments = [];
  bool _loadingSegments = true;

  final _newSegmentNameCtrl = TextEditingController();
  final _newSegmentDescCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    _nameCtrl = TextEditingController(text: widget.system.name);
    _descCtrl = TextEditingController(text: widget.system.description ?? '');
    _loadSegments();
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _descCtrl.dispose();
    _newSegmentNameCtrl.dispose();
    _newSegmentDescCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadSegments() async {
    setState(() => _loadingSegments = true);
    try {
      final segments = await SystemsService().getSegments(widget.system.id);
      setState(() {
        _segments = segments;
        _loadingSegments = false;
      });
    } catch (_) {
      setState(() => _loadingSegments = false);
    }
  }

  Future<void> _saveSystem() async {
    if (_nameCtrl.text.trim().isEmpty) {
      setState(() => _error = 'Введите название');
      return;
    }
    setState(() { _isLoading = true; _error = null; });
    try {
      await SystemsService().updateSystem(
        widget.system.id,
        _nameCtrl.text.trim(),
        _descCtrl.text.trim().isEmpty ? null : _descCtrl.text.trim(),
      );
      await ref.read(systemsProvider.notifier).load();
      if (mounted) Navigator.of(context).pop();
    } catch (e) {
      setState(() { _isLoading = false; _error = 'Ошибка: $e'; });
    }
  }

  Future<void> _deleteSystem() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Удалить систему?'),
        content: Text('«${widget.system.name}» будет удалена безвозвратно.'),
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
    setState(() => _isLoading = true);
    try {
      await SystemsService().deleteSystem(widget.system.id);
      await ref.read(systemsProvider.notifier).load();
      if (mounted) Navigator.of(context).pop();
    } catch (e) {
      setState(() { _isLoading = false; _error = 'Ошибка: $e'; });
    }
  }

  Future<void> _createSegment() async {
    if (_newSegmentNameCtrl.text.trim().isEmpty) return;
    try {
      await SystemsService().createSegment(
        widget.system.id,
        _newSegmentNameCtrl.text.trim(),
        _newSegmentDescCtrl.text.trim().isEmpty ? null : _newSegmentDescCtrl.text.trim(),
      );
      _newSegmentNameCtrl.clear();
      _newSegmentDescCtrl.clear();
      await _loadSegments();
    } catch (e) {
      setState(() => _error = 'Ошибка создания сегмента: $e');
    }
  }

  Future<void> _deleteSegment(Segment segment) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Удалить сегмент?'),
        content: Text('«${segment.name}» будет удалён безвозвратно.'),
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
      await SystemsService().deleteSegment(widget.system.id, segment.id);
      await _loadSegments();
    } catch (e) {
      setState(() => _error = 'Ошибка удаления: $e');
    }
  }

  void _showEditSegmentDialog(Segment segment) {
    final nameCtrl = TextEditingController(text: segment.name);
    final descCtrl = TextEditingController(text: segment.description ?? '');

    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Редактировать сегмент'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: nameCtrl,
              decoration: const InputDecoration(
                labelText: 'Название',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: descCtrl,
              decoration: const InputDecoration(
                labelText: 'Описание',
                border: OutlineInputBorder(),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Отмена')),
          TextButton(
            onPressed: () async {
              if (nameCtrl.text.trim().isEmpty) return;
              Navigator.pop(context);
              try {
                await SystemsService().updateSegment(
                  widget.system.id,
                  segment.id,
                  nameCtrl.text.trim(),
                  descCtrl.text.trim().isEmpty ? null : descCtrl.text.trim(),
                );
                await _loadSegments();
              } catch (e) {
                setState(() => _error = 'Ошибка: $e');
              }
            },
            child: const Text('Сохранить'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Система')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            TextField(
              controller: _nameCtrl,
              decoration: const InputDecoration(
                labelText: 'Название *',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _descCtrl,
              maxLines: 2,
              decoration: const InputDecoration(
                labelText: 'Описание',
                border: OutlineInputBorder(),
              ),
            ),
            if (_error != null) ...[
              const SizedBox(height: 8),
              Text(_error!, style: const TextStyle(color: Colors.red)),
            ],
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _isLoading ? null : _saveSystem,
              child: const Text('Сохранить'),
            ),
            const SizedBox(height: 8),
            OutlinedButton(
              onPressed: _isLoading ? null : _deleteSystem,
              style: OutlinedButton.styleFrom(
                foregroundColor: Colors.red,
                side: const BorderSide(color: Colors.red),
              ),
              child: const Text('Удалить систему'),
            ),

            const Divider(height: 32),
            
            const Text('Сегменты', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w500)),
            const SizedBox(height: 12),

            _loadingSegments
                ? const Center(child: CircularProgressIndicator())
                : _segments.isEmpty
                    ? const Text('Нет сегментов', style: TextStyle(color: Colors.grey))
                    : Column(
                        children: _segments.map((s) => Card(
                          margin: const EdgeInsets.only(bottom: 8),
                          child: ListTile(
                            title: Text(s.name),
                            subtitle: s.description != null ? Text(s.description!) : null,
                            trailing: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                IconButton(
                                  icon: const Icon(Icons.edit_outlined),
                                  onPressed: () => _showEditSegmentDialog(s),
                                ),
                                IconButton(
                                  icon: const Icon(Icons.delete_outline, color: Colors.red),
                                  onPressed: () => _deleteSegment(s),
                                ),
                              ],
                            ),
                          ),
                        )).toList(),
                      ),

            const SizedBox(height: 16),
            const Text('Новый сегмент', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500)),
            const SizedBox(height: 8),
            TextField(
              controller: _newSegmentNameCtrl,
              decoration: const InputDecoration(
                labelText: 'Название *',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _newSegmentDescCtrl,
              decoration: const InputDecoration(
                labelText: 'Описание',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 12),
            ElevatedButton.icon(
              onPressed: _createSegment,
              icon: const Icon(Icons.add),
              label: const Text('Добавить сегмент'),
            ),
          ],
        ),
      ),
    );
  }
}