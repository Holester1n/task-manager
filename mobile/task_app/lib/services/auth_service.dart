import 'package:dio/dio.dart';
import '../core/api_client.dart';
import '../core/secure_storage.dart';
import '../models/user.dart';

class AuthService {
  final Dio _dio = ApiClient.create();

  Future<User> login(String email, String password) async {
    final response = await _dio.post('/users/login', data: {
      'name': '',
      'email': email,
      'password': password,
    });

    final token = response.data['access_token'];
    await SecureStorage.saveToken(token);

    return await getMe();
  }

  Future<User> register(String name, String email, String password) async {
    await _dio.post('/users/register', data: {
      'name': name,
      'email': email,
      'password': password,
    });
    return await login(email, password);
  }

  Future<User> getMe() async {
    final response = await _dio.get('/users/me');
    return User.fromJson(response.data);
  }

  Future<void> logout() async {
    await SecureStorage.deleteToken();
  }
}