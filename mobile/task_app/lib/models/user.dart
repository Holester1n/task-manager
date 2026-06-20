class Role {
  final int id;
  final String name;

  const Role({required this.id, required this.name});

  factory Role.fromJson(Map<String, dynamic> json) => Role(
        id: json['id'],
        name: json['name'],
      );
}

class User {
  final int id;
  final String name;
  final String email;
  final String? telegramChatId;
  final Role? role;

  const User({
    required this.id,
    required this.name,
    required this.email,
    this.telegramChatId,
    this.role,
  });

  factory User.fromJson(Map<String, dynamic> json) => User(
        id: json['id'],
        name: json['name'],
        email: json['email'],
        telegramChatId: json['telegram_chat_id'],
        role: json['role'] != null ? Role.fromJson(json['role']) : null,
      );
}