from fastapi import FastAPI

app = FastAPI(title="Change Tracker API")

@app.get("/")
def root():
    return {"message": "Change Tracker API is running"}