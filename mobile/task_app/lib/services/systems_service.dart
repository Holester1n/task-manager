import 'package:dio/dio.dart';
import '../core/api_client.dart';
import '../models/system.dart';

class SystemsService {
  final Dio _dio = ApiClient.create();

  Future<List<System>> getSystems() async {
  final response = await _dio.get('/systems/');
  return (response.data as List).map((e) => System.fromJson(e)).toList();
}
}