from fastapi import FastAPI
from database import engine
from models import Base
from routers import users, systems, changes

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Change Tracker API")

app.include_router(users.router)
app.include_router(systems.router)
app.include_router(changes.router)

@app.get("/")
def root():
    return {"message": "Change Tracker API is running"}