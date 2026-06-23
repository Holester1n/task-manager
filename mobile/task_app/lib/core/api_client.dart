import 'package:dio/dio.dart';
import 'secure_storage.dart';

class ApiClient {
  static String baseUrl = const String.fromEnvironment(
    'API_URL',
    defaultValue: 'http://192.168.0.101:8000',
  );

  static Dio create() {
    final dio = Dio(BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
    ));

    dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await SecureStorage.getToken();
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        handler.next(options);
      },
      onError: (error, handler) {
        handler.next(error);
      },
    ));

    return dio;
  }
}