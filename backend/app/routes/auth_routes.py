from fastapi import APIRouter, Depends
from google.oauth2 import id_token
from google.auth.transport import requests
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from dotenv import load_dotenv
import os

from app.database import get_db
from app.models.user import User

router = APIRouter()
load_dotenv()

GOOGLE_CLIENT_ID = os.getenv('CLIENT_ID')


@router.post("/auth/google")
async def google_login(token: str, db: AsyncSession = Depends(get_db)):
    try:
        idinfo = id_token.verify_oauth2_token(
            token,
            requests.Request(),
            GOOGLE_CLIENT_ID
        )

        email = idinfo["email"]

        result = await db.execute(
            select(User).where(User.username == email)
        )

        user = result.scalar_one_or_none()

        if not user:
            user = User(username=email)
            db.add(user)

            await db.commit()

            await db.refresh(user)

        return {"user_id": user.user_id}

    except Exception as e:
        await db.rollback()
        raise e