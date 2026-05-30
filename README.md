# Change Tracker — Трекер изменений в информационных системах

Инструмент для отслеживания изменений в IT-инфраструктуре. Позволяет фиксировать что, где и когда менялось, кто ответственный и в каком статусе находится изменение.

## Стек

**Бэкенд:** Python + FastAPI + SQLAlchemy + PostgreSQL  
**Фронтенд:** React + TypeScript (Vite) — PWA  
**Уведомления:** Telegram Bot  
**Документация API:** OpenAPI / Swagger (автогенерация)

## Функциональность

- Регистрация и авторизация пользователей (JWT)
- Управление информационными системами и сегментами/серверами
- Создание изменений с привязкой к системе, сегменту и ответственному
- Статусы изменений: `Создано → Запланировано → Применено → Протестировано → Откатили`
- Telegram уведомления при создании и обновлении изменений
- REST API с автодокументацией

## Структура проекта

```
change-tracker/
├── frontend/          # React + TypeScript (Vite)
│   └── src/
│       ├── api/       # Функции для запросов к API
│       ├── components/
│       ├── hooks/     # Кастомные React хуки
│       ├── pages/     # Страницы приложения
│       └── types/     # TypeScript типы
└── backend/           # Python + FastAPI
    ├── routers/       # Эндпоинты API
    ├── models.py      # Модели БД (SQLAlchemy)
    ├── schemas.py     # Схемы запросов/ответов (Pydantic)
    ├── database.py    # Подключение к БД
    ├── auth.py        # JWT авторизация
    ├── notifications.py # Telegram уведомления
    └── bot.py         # Telegram бот
```

## Установка и запуск

### Требования
- Python 3.11+
- Node.js 18+
- PostgreSQL 14+

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

Создай файл `backend/.env`:
```
DATABASE_URL=postgresql://postgres:ПАРОЛЬ@localhost:5432/ИМЯ_БД
SECRET_KEY=придумай_длинную_случайную_строку
TELEGRAM_BOT_TOKEN=токен_от_botfather
```

Создай базу данных в PostgreSQL:
```bash
psql -U postgres
CREATE DATABASE changetracker;
\q
```

Запуск бэкенда:
```bash
uvicorn main:app --reload
```

Swagger документация: `http://localhost:8000/docs`

Запуск Telegram бота (в отдельном терминале):
```bash
python bot.py
```

### Фронтенд

```bash
cd frontend
npm install
npm run dev
```

Открой `http://localhost:5173`

## Подключение Telegram уведомлений

1. Найди бота в Telegram и напиши `/start`
2. Бот пришлёт твой `chat_id`
3. Отправь запрос на привязку:
```bash
curl -X POST "http://localhost:8000/users/telegram/connect?chat_id=ТУТ_ТВОЙ_ID" \
  -H "Authorization: Bearer ТУТ_ТВОЙ_JWT_ТОКЕН"
```

После этого при каждом изменении статуса будет приходить уведомление в Telegram.

## API

Полная документация доступна по адресу `http://localhost:8000/docs`

Основные эндпоинты:

| Метод | Путь | Описание |
|-------|------|----------|
| POST | `/users/register` | Регистрация |
| POST | `/users/login` | Вход |
| GET | `/users/me` | Текущий пользователь |
| GET | `/systems/` | Список систем |
| POST | `/systems/` | Создать систему |
| POST | `/systems/{id}/segments` | Создать сегмент |
| GET | `/changes/` | Список изменений |
| POST | `/changes/` | Создать изменение |
| PATCH | `/changes/{id}` | Обновить статус |
| DELETE | `/changes/{id}` | Удалить изменение |
