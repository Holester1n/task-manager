from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import System, Segment
from schemas import SystemCreate, SystemResponse, SegmentCreate, SegmentResponse

router = APIRouter(prefix="/systems", tags=["systems"])

@router.get("/", response_model=list[SystemResponse])
def get_systems(db: Session = Depends(get_db)):
    return db.query(System).all()

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
    new_segment = Segment(name=segment.name, system_id=system_id)
    db.add(new_segment)
    db.commit()
    db.refresh(new_segment)
    return new_segment

@router.get("/{system_id}/segments", response_model=list[SegmentResponse])
def get_segments(system_id: int, db: Session = Depends(get_db)):
    return db.query(Segment).filter(Segment.system_id == system_id).all()