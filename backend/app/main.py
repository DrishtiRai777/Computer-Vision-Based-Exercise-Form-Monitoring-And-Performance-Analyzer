from contextlib import asynccontextmanager
from app.routes import auth_routes
from fastapi import FastAPI
from app.routes import users, exercises, sessions
from app.database import engine, Base

# Startup event
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    try:
        # Create all tables with async engine
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        print("[OK] Database tables created successfully")
    except Exception as e:
        print(f"[WARNING] Database startup failed: {e}")
        print("  App will continue but database operations may fail")
    
    yield
    
    # Shutdown
    await engine.dispose()

# Create a FastAPI instance with lifespan
app = FastAPI(lifespan=lifespan)

# Define a path operation decorator and function
@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.on_event("startup")
def startup():
    try:
        Base.metadata.create_all(bind=engine)
        print("✓ Database connected successfully")
    except Exception as e:
        print(f"⚠ Database connection failed: {e}")
        print("  App will continue but database operations may fail") 

app.include_router(users.router)
app.include_router(auth_routes.router)
app.include_router(exercises.router)
app.include_router(sessions.router)