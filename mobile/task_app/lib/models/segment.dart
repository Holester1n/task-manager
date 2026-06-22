class Segment {
  final int id;
  final String name;
  final int systemId;

  const Segment({required this.id, required this.name, required this.systemId});

  factory Segment.fromJson(Map<String, dynamic> json) => Segment(
        id: json['id'],
        name: json['name'],
        systemId: json['system_id'],
      );
}