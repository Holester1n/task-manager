from fastapi import FastAPI
from database import engine
from models import Base

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Change Tracker API")

@app.get("/")
def root():
    return {"message": "Change Tracker API is running"}