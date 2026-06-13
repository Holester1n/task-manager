from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from database import get_db
from models import User, Role
from schemas import UserCreate, UserResponse, Token, RoleCreate, RoleResponse, RoleSystemAccessUpdate
from auth import hash_password, verify_password, create_access_token, decode_token

router = APIRouter(tags=["users"])
security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    token = credentials.credentials
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Недействительный токен")
    user = db.query(User).filter(User.id == int(payload["sub"])).first()
    if not user:
        raise HTTPException(status_code=401, detail="Пользователь не найден")
    return user

def is_admin(user: User) -> bool:
    return user.role is not None and user.role.name == "admin"

def require_admin(current_user: User = Depends(get_current_user)):
    if not is_admin(current_user):
        raise HTTPException(status_code=403, detail="Недостаточно прав")
    return current_user

@router.get("/users/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/users/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email уже занят")
    new_user = User(
        name=user.name,
        email=user.email,
        password_hash=hash_password(user.password)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/users/login", response_model=Token)
def login(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user or not verify_password(user.password, db_user.password_hash):
        raise HTTPException(status_code=401, detail="Неверный email или пароль")
    token = create_access_token({"sub": str(db_user.id)})
    return {"access_token": token, "token_type": "bearer"}

@router.get("/users/", response_model=list[UserResponse])
def get_users(current_user: User = Depends(require_admin), db: Session = Depends(get_db)):
    return db.query(User).all()

@router.patch("/users/{user_id}/role")
def assign_role(user_id: int, role_id: int, current_user: User = Depends(require_admin), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Роль не найдена")
    user.role_id = role.id
    db.commit()
    return {"message": "Роль назначена"}

@router.post("/users/telegram/connect")
def connect_telegram(chat_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == current_user.id).first()
    db_user.telegram_chat_id = chat_id
    db.commit()
    return {"message": "Telegram подключён"}

# --- Роли ---

@router.get("/roles/", response_model=list[RoleResponse])
def get_roles(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Role).all()

@router.post("/roles/", response_model=RoleResponse)
def create_role(role: RoleCreate, current_user: User = Depends(require_admin), db: Session = Depends(get_db)):
    existing = db.query(Role).filter(Role.name == role.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Роль уже существует")
    new_role = Role(name=role.name)
    db.add(new_role)
    db.commit()
    db.refresh(new_role)
    return new_role

@router.delete("/roles/{role_id}")
def delete_role(role_id: int, current_user: User = Depends(require_admin), db: Session = Depends(get_db)):
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Роль не найдена")
    if role.name == "admin":
        raise HTTPException(status_code=400, detail="Нельзя удалить роль admin")
    db.delete(role)
    db.commit()
    return {"message": "Роль удалена"}

@router.put("/roles/{role_id}/systems")
def set_role_systems(role_id: int, data: RoleSystemAccessUpdate, current_user: User = Depends(require_admin), db: Session = Depends(get_db)):
    from models import System, RoleSystemAccess
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Роль не найдена")
    if role.name == "admin":
        raise HTTPException(status_code=400, detail="Админ имеет доступ ко всем системам")
    db.query(RoleSystemAccess).filter(RoleSystemAccess.role_id == role_id).delete()
    for system_id in data.system_ids:
        db.add(RoleSystemAccess(role_id=role_id, system_id=system_id))
    db.commit()
    return {"message": "Доступ обновлён"}