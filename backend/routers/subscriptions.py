from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Subscription, System
from routers.users import get_current_user

router = APIRouter(prefix="/subscriptions", tags=["subscriptions"])

@router.get("/")
def get_subscriptions(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    subs = db.query(Subscription).filter(Subscription.user_id == current_user.id).all()
    system_ids = [s.system_id for s in subs]
    return {"subscribed_system_ids": system_ids}

@router.post("/{system_id}")
def subscribe(system_id: int, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    system = db.query(System).filter(System.id == system_id).first()
    if not system:
        raise HTTPException(status_code=404, detail="Система не найдена")
    existing = db.query(Subscription).filter(
        Subscription.user_id == current_user.id,
        Subscription.system_id == system_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Уже подписан")
    sub = Subscription(user_id=current_user.id, system_id=system_id)
    db.add(sub)
    db.commit()
    return {"message": "Подписка оформлена"}

@router.delete("/{system_id}")
def unsubscribe(system_id: int, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    sub = db.query(Subscription).filter(
        Subscription.user_id == current_user.id,
        Subscription.system_id == system_id
    ).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Подписка не найдена")
    db.delete(sub)
    db.commit()
    return {"message": "Подписка отменена"}