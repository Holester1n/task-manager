class Segment {
  final int id;
  final String name;
  final int systemId;
  final String? description;

  const Segment({
    required this.id,
    required this.name,
    required this.systemId,
    this.description,
  });

  factory Segment.fromJson(Map<String, dynamic> json) => Segment(
        id: json['id'],
        name: json['name'],
        systemId: json['system_id'],
        description: json['description'],
      );
}