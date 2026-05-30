from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Change, ChangeStatus, User
from schemas import ChangeCreate, ChangeUpdate, ChangeResponse
from notifications import send_telegram, format_change_message
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

def notify_responsible(db: Session, change: Change, action: str):
    user = db.query(User).filter(User.id == change.responsible_id).first()
    if user and user.telegram_chat_id:
        message = format_change_message(
            action=action,
            title=change.title,
            status=STATUS_LABELS.get(change.status.value, change.status.value),
            responsible=user.name
        )
        asyncio.run(send_telegram(user.telegram_chat_id, message))

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