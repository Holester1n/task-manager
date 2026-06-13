from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from routers.users import get_current_user, is_admin
from models import User, System, Segment, RoleSystemAccess
from schemas import SystemCreate, SystemResponse, SegmentCreate, SegmentResponse

router = APIRouter(prefix="/systems", tags=["systems"])

@router.get("/", response_model=list[SystemResponse])
def get_systems(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if is_admin(current_user):
        return db.query(System).all()
    
    if current_user.role_id is None:
        return []
    
    accessible_ids = db.query(RoleSystemAccess.system_id).filter(
        RoleSystemAccess.role_id == current_user.role_id
    ).all()
    ids = [row[0] for row in accessible_ids]
    return db.query(System).filter(System.id.in_(ids)).all()

@router.post("/", response_model=SystemResponse)
def create_system(system: SystemCreate, db: Session = Depends(get_db)):
    new_system = System(name=system.name, description=system.description)
    db.add(new_system)
    db.commit()
    db.refresh(new_system)
    return new_system

@router.get("/{system_id}", response_model=SystemResponse)
def get_system(system_id: int, db: Session = Depends(get_db)):
    system = db.query(System).filter(System.id == system_id).first()
    if not system:
        raise HTTPException(status_code=404, detail="Система не найдена")
    return system

@router.post("/{system_id}/segments", response_model=SegmentResponse)
def create_segment(system_id: int, segment: SegmentCreate, db: Session = Depends(get_db)):
    system = db.query(System).filter(System.id == system_id).first()
    if not system:
        raise HTTPException(status_code=404, detail="Система не найдена")
    new_segment = Segment(
        name=segment.name,
        system_id=system_id,
        description=segment.description,
    )
    db.add(new_segment)
    db.commit()
    db.refresh(new_segment)
    return new_segment

@router.get("/{system_id}/segments", response_model=list[SegmentResponse])
def get_segments(system_id: int, db: Session = Depends(get_db)):
    return db.query(Segment).filter(Segment.system_id == system_id).all()

@router.patch("/{system_id}", response_model=SystemResponse)
def update_system(system_id: int, system: SystemCreate, db: Session = Depends(get_db)):
    db_system = db.query(System).filter(System.id == system_id).first()
    if not db_system:
        raise HTTPException(status_code=404, detail="Система не найдена")
    db_system.name = system.name
    db_system.description = system.description
    db.commit()
    db.refresh(db_system)
    return db_system

@router.delete("/{system_id}")
def delete_system(system_id: int, db: Session = Depends(get_db)):
    db_system = db.query(System).filter(System.id == system_id).first()
    if not db_system:
        raise HTTPException(status_code=404, detail="Система не найдена")
    
    from models import Change, Subscription
    has_changes = db.query(Change).filter(Change.system_id == system_id).first()
    if has_changes:
        raise HTTPException(status_code=400, detail="Нельзя удалить систему — есть связанные изменения")
    
    has_subs = db.query(Subscription).filter(Subscription.system_id == system_id).first()
    if has_subs:
        raise HTTPException(status_code=400, detail="Нельзя удалить систему — есть подписки")
    
    db.delete(db_system)
    db.commit()
    return {"message": "Система удалена"}

@router.patch("/{system_id}/segments/{segment_id}", response_model=SegmentResponse)
def update_segment(system_id: int, segment_id: int, segment: SegmentCreate, db: Session = Depends(get_db)):
    db_segment = db.query(Segment).filter(Segment.id == segment_id, Segment.system_id == system_id).first()
    if not db_segment:
        raise HTTPException(status_code=404, detail="Сегмент не найден")
    db_segment.name = segment.name
    db_segment.description = segment.description
    db.commit()
    db.refresh(db_segment)
    return db_segment

@router.delete("/{system_id}/segments/{segment_id}")
def delete_segment(system_id: int, segment_id: int, db: Session = Depends(get_db)):
    db_segment = db.query(Segment).filter(Segment.id == segment_id, Segment.system_id == system_id).first()
    if not db_segment:
        raise HTTPException(status_code=404, detail="Сегмент не найден")
    
    from models import Change
    has_changes = db.query(Change).filter(Change.segment_id == segment_id).first()
    if has_changes:
        raise HTTPException(status_code=400, detail="Нельзя удалить сегмент — есть связанные изменения")
    
    db.delete(db_segment)
    db.commit()
    return {"message": "Сегмент удалён"}