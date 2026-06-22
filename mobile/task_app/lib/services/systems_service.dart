import 'package:dio/dio.dart';
import '../core/api_client.dart';
import '../models/system.dart';
import '../models/segment.dart';

class SystemsService {
  final Dio _dio = ApiClient.create();

  Future<List<System>> getSystems() async {
    final response = await _dio.get('/systems/');
    return (response.data as List).map((e) => System.fromJson(e)).toList();
  }

  Future<List<Segment>> getSegments(int systemId) async {
    final response = await _dio.get('/systems/$systemId/segments');
    return (response.data as List).map((e) => Segment.fromJson(e)).toList();
  }
}