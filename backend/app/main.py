from fastapi import FastAPI
from app.routes import users, exercises, sessions
from fastapi.middleware.cors import CORSMiddleware

# Create a FastAPI instance
app = FastAPI()

origins = [
    "http://localhost:3000",  
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],
)

# Define a path operation decorator and function
@app.get("/")
def read_root():
    return {"Hello": "World"}

app.include_router(users.router)
app.include_router(exercises.router)
app.include_router(sessions.router)
