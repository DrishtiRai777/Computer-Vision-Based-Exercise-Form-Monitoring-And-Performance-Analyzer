from fastapi import FastAPI
from app.routes import users, exercises, sessions


# Create a FastAPI instance
app = FastAPI()

# Define a path operation decorator and function
@app.get("/")
def read_root():
    return {"Hello": "World"}

app.include_router(users.router)
app.include_router(exercises.router)
app.include_router(sessions.router)