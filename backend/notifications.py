import os
import requests
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
TELEGRAM_API_URL = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}"

SMTP_HOST = os.getenv("SMTP_HOST")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
SMTP_FROM = os.getenv("SMTP_FROM", SMTP_USER)

def notify(chat_id: str, message: str):
    try:
        requests.post(f"{TELEGRAM_API_URL}/sendMessage", json={
            "chat_id": chat_id,
            "text": message,
            "parse_mode": "Markdown"
        })
    except Exception as e:
        print(f"Ошибка Telegram уведомления: {e}")

def notify_email(to_email: str, subject: str, message: str):
    if not all([SMTP_HOST, SMTP_USER, SMTP_PASSWORD]):
        print("[email] SMTP не настроен, пропускаем отправку")
        return
    try:
        msg = MIMEMultipart()
        msg["From"] = SMTP_FROM
        msg["To"] = to_email
        msg["Subject"] = subject
        msg.attach(MIMEText(message, "plain", "utf-8"))

        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(SMTP_FROM, to_email, msg.as_string())

        print(f"[email] Отправлено на {to_email}")
    except Exception as e:
        print(f"[email] Ошибка отправки: {e}")

def format_change_message(action: str, title: str, status: str, responsible: str, system: str) -> str:
    return (
        f"🔔 *Изменение {action}*\n\n"
        f"📋 *{title}*\n"
        f"🖥 Система: {system}\n"
        f"📊 Статус: {status}\n"
        f"👤 Ответственный: {responsible}\n"
    )

def format_change_email(action: str, title: str, status: str, responsible: str, system: str) -> tuple[str, str]:
    subject = f"[Change Tracker] Изменение {action}: {title}"
    body = (
        f"Изменение {action}\n\n"
        f"Название: {title}\n"
        f"Система: {system}\n"
        f"Статус: {status}\n"
        f"Ответственный: {responsible}\n"
    )
    return subject, body