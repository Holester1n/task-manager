import 'package:dio/dio.dart';
import '../core/api_client.dart';
import '../models/user.dart';

class UsersService {
  final Dio _dio = ApiClient.create();

  Future<List<User>> getUsers() async {
    final response = await _dio.get('/users/');
    return (response.data as List).map((e) => User.fromJson(e)).toList();
  }
}