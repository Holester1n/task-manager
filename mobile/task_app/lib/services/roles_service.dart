import 'package:dio/dio.dart';
import '../core/api_client.dart';
import '../models/user.dart';

class RolesService {
  final Dio _dio = ApiClient.create();

  Future<List<Role>> getRoles() async {
    final response = await _dio.get('/roles/');
    return (response.data as List).map((e) => Role.fromJson(e)).toList();
  }
}