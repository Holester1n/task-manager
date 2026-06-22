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

  Future<void> createSystem(String name, String? description) async {
    await _dio.post('/systems/', data: {'name': name, 'description': description});
  }

  Future<void> updateSystem(int id, String name, String? description) async {
    await _dio.patch('/systems/$id', data: {'name': name, 'description': description});
  }

  Future<void> deleteSystem(int id) async {
    await _dio.delete('/systems/$id');
  }

  Future<void> createSegment(int systemId, String name, String? description) async {
    await _dio.post('/systems/$systemId/segments', data: {
      'name': name,
      'system_id': systemId,
      'description': description,
    });
  }

  Future<void> updateSegment(int systemId, int segmentId, String name, String? description) async {
    await _dio.patch('/systems/$systemId/segments/$segmentId', data: {
      'name': name,
      'system_id': systemId,
      'description': description,
    });
  }

  Future<void> deleteSegment(int systemId, int segmentId) async {
    await _dio.delete('/systems/$systemId/segments/$segmentId');
  }
}