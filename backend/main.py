from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from database import engine, SessionLocal
from models import Base, User, UserRole
from routers import users, systems, changes, subscriptions
from auth import hash_password
from contextlib import asynccontextmanager
import os

Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    db = SessionLocal()
    try:
        existing_admin = db.query(User).filter(User.role == UserRole.admin).first()
        if not existing_admin:
            email = os.getenv("ADMIN_EMAIL", "admin@admin.com")
            password = os.getenv("ADMIN_PASSWORD", "admin")
            name = os.getenv("ADMIN_NAME", "Admin")
            admin = User(
                name=name,
                email=email,
                password_hash=hash_password(password),
                role=UserRole.admin
            )
            db.add(admin)
            db.commit()
            print(f"[startup] Дефолтный админ создан: {email}")
        else:
            print("[startup] Админ уже существует, пропускаем")
    finally:
        db.close()

    yield  

app = FastAPI(title="Change Tracker API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(systems.router)
app.include_router(changes.router)
app.include_router(subscriptions.router)

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    schema = get_openapi(title="Change Tracker API", version="0.1.0", routes=app.routes)
    schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
        }
    }
    schema["security"] = [{"BearerAuth": []}]
    app.openapi_schema = schema
    return schema

app.openapi = custom_openapi

@app.get("/")
def root():
    return {"message": "Change Tracker API is running"}