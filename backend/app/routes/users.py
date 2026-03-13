from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.services.auth_service import authenticate_google_user
from app.models.user import User

router = APIRouter(prefix="/users", tags=["users"])


class GoogleAuthRequest(BaseModel):
    token: str


@router.post("/auth/google")
async def google_auth(data: GoogleAuthRequest, db: AsyncSession = Depends(get_db)):
    user = await authenticate_google_user(data.token, db)

    return {
        "user_id": user.user_id,
        "google_id": user.google_id,
        "email": user.email,
        "name": user.name,
        "created_at": user.created_at
    }


# Get all users
@router.get("/")
async def get_all_users(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User))
    users = result.scalars().all()

    return [
        {
            "user_id": user.user_id,
            "google_id": user.google_id,
            "email": user.email,
            "name": user.name,
            "created_at": user.created_at
        }
        for user in users
    ]