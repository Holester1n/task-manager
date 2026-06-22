class Change {
  final int id;
  final String title;
  final String? description;
  final String status;
  final int systemId;
  final int? segmentId;
  final int responsibleId;
  final bool requiresRestart;
  final String? plannedAt;
  final String createdAt;
  final String updatedAt;

  const Change({
    required this.id,
    required this.title,
    this.description,
    required this.status,
    required this.systemId,
    this.segmentId,
    required this.responsibleId,
    required this.requiresRestart,
    this.plannedAt,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Change.fromJson(Map<String, dynamic> json) => Change(
        id: json['id'],
        title: json['title'],
        description: json['description'],
        status: json['status'],
        systemId: json['system_id'],
        segmentId: json['segment_id'],
        responsibleId: json['responsible_id'],
        requiresRestart: json['requires_restart'] ?? false,
        plannedAt: json['planned_at'],
        createdAt: json['created_at'],
        updatedAt: json['updated_at'],
      );
}