import 'package:dio/dio.dart';
import '../core/api_client.dart';

class SubscriptionsService {
  final Dio _dio = ApiClient.create();

  Future<List<int>> getSubscribedIds() async {
    final response = await _dio.get('/subscriptions/');
    return List<int>.from(response.data['subscribed_system_ids']);
  }

  Future<void> subscribe(int systemId) async {
    await _dio.post('/subscriptions/$systemId');
  }

  Future<void> unsubscribe(int systemId) async {
    await _dio.delete('/subscriptions/$systemId');
  }
}