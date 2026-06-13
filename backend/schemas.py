from pydantic import BaseModel, EmailStr
from datetime import datetime
from enum import Enum
from typing import Optional

class ChangeStatus(str, Enum):
    created = "created"
    planned = "planned"
    applied = "applied"
    tested = "tested"
    rolled_back = "rolled_back"

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserRole(str, Enum):
    admin = "admin"
    user = "user"

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    telegram_chat_id: Optional[str] = None
    role: UserRole
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class SystemCreate(BaseModel):
    name: str
    description: Optional[str] = None

class SystemResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]

    class Config:
        from_attributes = True

class SegmentCreate(BaseModel):
    name: str
    system_id: int
    description: Optional[str] = None

class SegmentResponse(BaseModel):
    id: int
    name: str
    system_id: int
    description: Optional[str] = None

    class Config:
        from_attributes = True

class ChangeCreate(BaseModel):
    title: str
    description: Optional[str] = None
    system_id: int
    segment_id: Optional[int] = None
    responsible_id: int
    planned_at: Optional[datetime] = None
    requires_restart: bool = False

class ChangeUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[ChangeStatus] = None
    segment_id: Optional[int] = None
    responsible_id: Optional[int] = None
    planned_at: Optional[datetime] = None
    requires_restart: Optional[bool] = None

class ChangeResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    status: ChangeStatus
    system_id: int
    segment_id: Optional[int]
    responsible_id: int
    planned_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    requires_restart: bool

    class Config:
        from_attributes = True