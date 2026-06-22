# Change Tracker — Трекер изменений в информационных системах

Инструмент для отслеживания изменений в IT-инфраструктуре. Позволяет фиксировать что, где и когда менялось, кто ответственный и в каком статусе находится изменение.

## Стек

**Бэкенд:** Python + FastAPI + SQLAlchemy + PostgreSQL  
**Фронтенд:** React + TypeScript (Vite) + TailwindCSS — PWA  
**Мобильное приложение:** Flutter (Android)  
**Уведомления:** Telegram Bot  
**Миграции БД:** Alembic  
**Документация API:** OpenAPI / Swagger (автогенерация)

## Функциональность

- Регистрация и авторизация пользователей (JWT)
- Ролевая модель: администратор и пользователь
- Управление информационными системами и сегментами/серверами (создание, редактирование, удаление)
- Признак для сегмента: требуется ли перезагрузка при применении изменения
- Создание изменений с привязкой к системе, сегменту и ответственному
- Статусы изменений: `Создано → Запланировано → Применено → Протестировано → Откатили`
- Фильтрация изменений по статусу и системе
- Подписки на системы — получай уведомления только по нужным
- Telegram уведомления при создании и обновлении изменений
- REST API с автодокументацией
- Мобильное приложение на Flutter с полным доступом к функциональности

## Структура проекта

```
task-manager/
├── frontend/          # React + TypeScript (Vite)
│   └── src/
│       ├── api/       # Функции для запросов к API
│       ├── components/
│       ├── hooks/     # Кастомные React хуки
│       ├── pages/     # Страницы приложения
│       └── types/     # TypeScript типы
├── backend/           # Python + FastAPI
│   ├── routers/       # Эндпоинты API
│   ├── migrations/    # Миграции базы данных (Alembic)
│   ├── models.py      # Модели БД (SQLAlchemy)
│   ├── schemas.py     # Схемы запросов/ответов (Pydantic)
│   ├── database.py    # Подключение к БД
│   ├── auth.py        # JWT авторизация
│   ├── notifications.py # Telegram уведомления
│   └── bot.py         # Telegram бот
├── mobile/
│   └──task_app/      # Flutter приложение
│       ├── lib/
│       ├── core/        # ApiClient, SecureStorage
│       ├── models/      # Dart модели (User, Change, System, Segment)
│       ├── services/    # AuthService, ChangesService, SystemsService, UsersService
│       ├── providers/   # Riverpod провайдеры
│       ├── screens/     # Экраны приложения
│       ├── main.dart
```

## Установка и запуск

### Требования
- Python 3.11+
- Node.js 18+
- PostgreSQL 14+
- Flutter SDK 3.x+
- Android SDK (для мобильного приложения)

### Бэкенд

```bash
cd backend
python -m venv .venv

# Linux/Mac
source .venv/bin/activate
# Windows (Git Bash)
source .venv/Scripts/activate

pip install -r requirements.txt
```

Создайте файл `backend/.env`:
```
DATABASE_URL=postgresql://postgres:ПАРОЛЬ@localhost:5432/ИМЯ_БД
SECRET_KEY=придумайте_длинную_случайную_строку
TELEGRAM_BOT_TOKEN=токен_от_botfather
```

Создайте базу данных в PostgreSQL:
```bash
psql -U postgres
CREATE DATABASE changetracker;
\q
```

Примените миграции:
```bash
alembic upgrade head
```

Запуск бэкенда (обязательно с `--host 0.0.0.0` если нужен доступ с мобильного устройства):
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Swagger документация: `http://localhost:8000/docs`

Запустите Telegram бота (в отдельном терминале):
```bash
python bot.py
```

### Фронтенд

```bash
cd frontend
npm install
npm run dev
```

Откройте `http://localhost:5173`

### Мобильное приложение

#### Требования
- Flutter SDK 3.x ([flutter.dev](https://flutter.dev))
- Android Studio или подключённое Android-устройство с включённым режимом разработчика
- Включённый Developer Mode в Windows (Параметры → Для разработчиков)
- Телефон и компьютер в одной Wi-Fi сети

#### Настройка

1. Узнайте локальный IP компьютера:
```bash
ipconfig  # Windows
```
Ищите IPv4-адрес Wi-Fi адаптера (например `192.168.1.105`).

2. Укажите IP в `mobile/task_app/lib/core/api_client.dart`:
```dart
static const baseUrl = 'http://192.168.x.x:8000';
```

3. Убедитесь что бэкенд запущен с `--host 0.0.0.0`.

#### Запуск

```bash
cd mobile/task_app
flutter pub get
flutter run
```

После первой установки APK используйте горячую перезагрузку:
- `r` — hot reload (патчит код, состояние сохраняется)
- `R` — hot restart (перезапуск без переустановки APK)

#### Функциональность мобильного приложения

- Авторизация по email и паролю, автовход по сохранённому токену
- Список изменений с фильтрацией по статусу и системе
- Создание изменения с выбором системы, сегмента, ответственного и даты
- Редактирование изменения: название, описание, статус
- Удаление изменения с подтверждением
- Список систем с созданием, редактированием и удалением
- Управление сегментами внутри системы
- Выход из аккаунта

## Миграции базы данных

При изменении схемы БД разработчик создаёт миграцию и коммитит её. Коммиты с изменениями БД помечаются тегом `[migration]` в сообщении.

После `git pull` с таким тегом нужно применить миграцию:
```bash
cd backend
source .venv/Scripts/activate  # или source .venv/bin/activate на Linux/Mac
alembic upgrade head
```

## Подключение Telegram уведомлений

1. Зарегистрируйтесь или войдите в приложение
2. Найдите бота в Telegram и выполните `/start`
3. Бот пришлёт ваш `chat_id`
4. Перейдите в **Профиль** на сайте и введите `chat_id` в поле подключения
5. Там же подпишитесь на нужные системы

## Первый администратор

Дефолтный администратор создаётся автоматически при первом запуске бэкенда. Данные берутся из `.env`:

ADMIN_EMAIL=admin@admin.com
ADMIN_PASSWORD=admin
ADMIN_NAME=Admin

Далее управление ролями доступно через интерфейс в разделе Профиль.

## API

Полная документация доступна по адресу `http://localhost:8000/docs`

Основные эндпоинты:

| Метод | Путь | Описание |
|-------|------|----------|
| POST | `/users/register` | Регистрация |
| POST | `/users/login` | Вход |
| GET | `/users/me` | Текущий пользователь |
| GET | `/users/` | Список пользователей (админ) |
| PATCH | `/users/{id}/role` | Сменить роль (админ) |
| GET | `/systems/` | Список систем |
| POST | `/systems/` | Создать систему |
| PATCH | `/systems/{id}` | Редактировать систему |
| DELETE | `/systems/{id}` | Удалить систему |
| POST | `/systems/{id}/segments` | Создать сегмент |
| PATCH | `/systems/{id}/segments/{id}` | Редактировать сегмент |
| DELETE | `/systems/{id}/segments/{id}` | Удалить сегмент |
| GET | `/changes/` | Список изменений |
| POST | `/changes/` | Создать изменение |
| PATCH | `/changes/{id}` | Обновить изменение |
| DELETE | `/changes/{id}` | Удалить изменение |
| GET | `/subscriptions/` | Мои подписки |
| POST | `/subscriptions/{system_id}` | Подписаться на систему |
| DELETE | `/subscriptions/{system_id}` | Отписаться |