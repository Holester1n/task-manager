from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum, Boolean
from sqlalchemy.orm import relationship, declarative_base
from datetime import datetime
import enum

Base = declarative_base()

class ChangeStatus(enum.Enum):
    created = "created"
    planned = "planned"
    applied = "applied"
    tested = "tested"
    rolled_back = "rolled_back"

class UserRole(enum.Enum):
    admin = "admin"
    user = "user"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    email = Column(String(200), unique=True, nullable=False)
    password_hash = Column(String(200), nullable=False)
    telegram_chat_id = Column(String(50), nullable=True)
    role = Column(Enum(UserRole), default=UserRole.user, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class System(Base):
    __tablename__ = "systems"
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    segments = relationship("Segment", back_populates="system")

class Change(Base):
    __tablename__ = "changes"
    id = Column(Integer, primary_key=True)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    status = Column(Enum(ChangeStatus), default=ChangeStatus.created)
    system_id = Column(Integer, ForeignKey("systems.id"), nullable=False)
    segment_id = Column(Integer, ForeignKey("segments.id"))
    responsible_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    planned_at = Column(DateTime)
    applied_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    requires_restart = Column(Boolean, default=False)

class Subscription(Base):
    __tablename__ = "subscriptions"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    system_id = Column(Integer, ForeignKey("systems.id"), nullable=False)

class Segment(Base):
    __tablename__ = "segments"
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    system_id = Column(Integer, ForeignKey("systems.id"), nullable=False)
    system = relationship("System", back_populates="segments")