import os
from dotenv import load_dotenv
from google.oauth2 import id_token
from google.auth.transport import requests
from sqlalchemy import select
from fastapi import HTTPException

from app.models.user import User

load_dotenv()

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")


async def authenticate_google_user(token: str, db):

    try:
        idinfo = id_token.verify_oauth2_token(
            token,
            requests.Request(),
            GOOGLE_CLIENT_ID
        )
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid Google token")

    google_id = idinfo["sub"]
    email = idinfo["email"]
    name = idinfo.get("name")

    result = await db.execute(
        select(User).where(User.google_id == google_id)
    )

    user = result.scalar_one_or_none()

    if not user:
        user = User(
            google_id=google_id,
            email=email,
            name=name
        )

        db.add(user)
        await db.commit()
        await db.refresh(user)

    return user