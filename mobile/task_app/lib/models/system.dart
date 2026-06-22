class System {
  final int id;
  final String name;
  final String? description;

  const System({
    required this.id,
    required this.name,
    this.description,
  });

  factory System.fromJson(Map<String, dynamic> json) => System(
        id: json['id'],
        name: json['name'],
        description: json['description'],
      );
}