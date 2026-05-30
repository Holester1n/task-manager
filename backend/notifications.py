import os
from telegram import Bot
from dotenv import load_dotenv

load_dotenv()

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
bot = Bot(token=TELEGRAM_BOT_TOKEN)

async def send_telegram(chat_id: str, message: str):
    try:
        await bot.send_message(chat_id=chat_id, text=message)
    except Exception as e:
        print(f"Ошибка отправки уведомления: {e}")

def format_change_message(action: str, title: str, status: str, responsible: str) -> str:
    return (
        f"🔔 *Изменение {action}*\n\n"
        f"📋 *{title}*\n"
        f"📊 Статус: {status}\n"
        f"👤 Ответственный: {responsible}\n"
    )