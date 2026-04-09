# Script to create Postgre Tables!
import asyncio
from app.database import engine, Base

# import models so SQLAlchemy knows them
from app.models.user import User
from app.models.exercise import Exercise
from app.models.session import Session


async def init_models():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

