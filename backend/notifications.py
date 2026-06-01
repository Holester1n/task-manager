import os
import requests
from dotenv import load_dotenv

load_dotenv()

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
TELEGRAM_API_URL = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}"

def notify(chat_id: str, message: str):
    try:
        requests.post(f"{TELEGRAM_API_URL}/sendMessage", json={
            "chat_id": chat_id,
            "text": message,
            "parse_mode": "Markdown"
        })
    except Exception as e:
        print(f"Ошибка уведомления: {e}")

def format_change_message(action: str, title: str, status: str, responsible: str, system: str) -> str:
    return (
        f"🔔 *Изменение {action}*\n\n"
        f"📋 *{title}*\n"
        f"🖥 Система: {system}\n"
        f"📊 Статус: {status}\n"
        f"👤 Ответственный: {responsible}\n"
    )