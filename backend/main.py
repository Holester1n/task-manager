from fastapi import FastAPI
from database import engine
from models import Base
from routers import users

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Change Tracker API")

app.include_router(users.router)

@app.get("/")
def root():
    return {"message": "Change Tracker API is running"}