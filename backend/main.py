from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine
from models import Base
from routers import users, systems, changes

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Change Tracker API")

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

@app.get("/")
def root():
    return {"message": "Change Tracker API is running"}