from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Change, ChangeStatus, User, System, Subscription
from schemas import ChangeCreate, ChangeUpdate, ChangeResponse
from notifications import format_change_message, notify
from datetime import datetime
import asyncio

router = APIRouter(prefix="/changes", tags=["changes"])

STATUS_LABELS = {
    "created": "Создано",
    "planned": "Запланировано",
    "applied": "Применено",
    "tested": "Протестировано",
    "rolled_back": "Откатили",
}

from notifications import format_change_message, format_change_email, notify, notify_email

def notify_responsible(db: Session, change: Change, action: str):
    system = db.query(System).filter(System.id == change.system_id).first()
    system_name = system.name if system else "Неизвестно"

    subscriptions = db.query(Subscription).filter(
        Subscription.system_id == change.system_id
    ).all()

    notified_ids = set()

    for sub in subscriptions:
        user = db.query(User).filter(User.id == sub.user_id).first()
        if user and user.id not in notified_ids:
            message = format_change_message(
                action=action,
                title=change.title,
                status=STATUS_LABELS.get(change.status.value, change.status.value),
                responsible=user.name,
                system=system_name
            )
            if user.telegram_chat_id:
                notify(user.telegram_chat_id, message)
            subject, body = format_change_email(
                action=action,
                title=change.title,
                status=STATUS_LABELS.get(change.status.value, change.status.value),
                responsible=user.name,
                system=system_name
            )
            notify_email(user.email, subject, body)
            notified_ids.add(user.id)

    responsible = db.query(User).filter(User.id == change.responsible_id).first()
    if responsible and responsible.id not in notified_ids:
        message = format_change_message(
            action=action,
            title=change.title,
            status=STATUS_LABELS.get(change.status.value, change.status.value),
            responsible=responsible.name,
            system=system_name
        )
        if responsible.telegram_chat_id:
            notify(responsible.telegram_chat_id, message)
        subject, body = format_change_email(
            action=action,
            title=change.title,
            status=STATUS_LABELS.get(change.status.value, change.status.value),
            responsible=responsible.name,
            system=system_name
        )
        notify_email(responsible.email, subject, body)


@router.get("/", response_model=list[ChangeResponse])
def get_changes(
    system_id: int = None,
    status: ChangeStatus = None,
    responsible_id: int = None,
    db: Session = Depends(get_db)
):
    query = db.query(Change)
    if system_id:
        query = query.filter(Change.system_id == system_id)
    if status:
        query = query.filter(Change.status == status)
    if responsible_id:
        query = query.filter(Change.responsible_id == responsible_id)
    return query.all()

@router.post("/", response_model=ChangeResponse)
def create_change(change: ChangeCreate, db: Session = Depends(get_db)):
    new_change = Change(**change.model_dump())
    db.add(new_change)
    db.commit()
    db.refresh(new_change)
    notify_responsible(db, new_change, "создано")
    return new_change

@router.get("/{change_id}", response_model=ChangeResponse)
def get_change(change_id: int, db: Session = Depends(get_db)):
    change = db.query(Change).filter(Change.id == change_id).first()
    if not change:
        raise HTTPException(status_code=404, detail="Изменение не найдено")
    return change

@router.patch("/{change_id}", response_model=ChangeResponse)
def update_change(change_id: int, data: ChangeUpdate, db: Session = Depends(get_db)):
    change = db.query(Change).filter(Change.id == change_id).first()
    if not change:
        raise HTTPException(status_code=404, detail="Изменение не найдено")
    
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(change, field, value)
    
    change.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(change)
    notify_responsible(db, change, "обновлено")
    return change

@router.delete("/{change_id}")
def delete_change(change_id: int, db: Session = Depends(get_db)):
    change = db.query(Change).filter(Change.id == change_id).first()
    if not change:
        raise HTTPException(status_code=404, detail="Изменение не найдено")
    db.delete(change)
    db.commit()
    return {"message": "Изменение удалено"}