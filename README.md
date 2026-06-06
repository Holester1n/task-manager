# Change Tracker — Трекер изменений в информационных системах

Инструмент для отслеживания изменений в IT-инфраструктуре. Позволяет фиксировать что, где и когда менялось, кто ответственный и в каком статусе находится изменение.

## Стек

**Бэкенд:** Python + FastAPI + SQLAlchemy + PostgreSQL  
**Фронтенд:** React + TypeScript (Vite) + TailwindCSS — PWA  
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
    ├── migrations/    # Миграции базы данных (Alembic)
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

Создайте файл `backend/.env`:
```
DATABASE_URL=postgresql://postgres:ПАРОЛЬ@localhost:5432/ИМЯ_БД
SECRET_KEY=придумай_длинную_случайную_строку
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

Запуск бэкенда:
```bash
uvicorn main:app --reload
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

После регистрации первого пользователя назначьте его администратором вручную:
```bash
psql -U postgres -d ИМЯ_БД
UPDATE users SET role = 'admin' WHERE email = 'ваш@email.com';
\q
```

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
| PATCH | `/changes/{id}` | Обновить статус |
| DELETE | `/changes/{id}` | Удалить изменение |
| GET | `/subscriptions/` | Мои подписки |
| POST | `/subscriptions/{system_id}` | Подписаться на систему |
| DELETE | `/subscriptions/{system_id}` | Отписаться |