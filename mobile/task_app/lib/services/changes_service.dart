import 'package:dio/dio.dart';
import '../core/api_client.dart';
import '../models/change.dart';

class ChangesService {
  final Dio _dio = ApiClient.create();

  Future<List<Change>> getChanges({int? systemId, String? status}) async {
    final params = <String, dynamic>{};
    if (systemId != null) params['system_id'] = systemId;
    if (status != null) params['status'] = status;

    final response = await _dio.get('/changes/', queryParameters: params);
    return (response.data as List).map((e) => Change.fromJson(e)).toList();
  }

  Future<void> deleteChange(int id) async {
    await _dio.delete('/changes/$id');
  }
}