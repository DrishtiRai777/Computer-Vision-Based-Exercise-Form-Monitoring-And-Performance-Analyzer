from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import logging

from app.database import get_db
from app.services.auth_service import authenticate_google_user
from app.models.user import User
from app.models.session import Session as SessionModel
from app.services.llm_service import generate_overall_feedback_from_sessions
from app.services.auth_utils import create_access_token
from app.dependencies.auth import get_current_user

router = APIRouter(prefix="/users", tags=["users"])

logging.basicConfig(level=logging.INFO)

class GoogleAuthRequest(BaseModel):
    token: str

@router.post("/auth/google")
async def google_auth(data: GoogleAuthRequest, request: Request, db: AsyncSession = Depends(get_db)):
    logging.info(f"Incoming request from origin: {request.headers.get('origin')}")
    logging.info(f"Received token: {data.token}")

    try:
        user = await authenticate_google_user(data.token, db)
    except Exception as e:
        logging.exception("Google auth failed")
        raise HTTPException(status_code=500, detail=str(e))

    access_token = create_access_token({"user_id": user.user_id})
    return {"access_token": access_token, "token_type": "bearer"}

# Get all the users
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

# Generate overall-feedback for user
# Fetch all sessions for the user, generate overall feedback using LLM, and update the existing user row with the new overall feedback.
@router.post("/overall-feedback")
async def update_user_overall_feedback(user_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Fetch all sessions
    result = await db.execute(select(SessionModel).where(SessionModel.user_id == user_id))
    sessions = result.scalars().all()

    if not sessions:
        raise HTTPException(status_code=404, detail="No sessions found for this user")

    feedback_list = [s.session_feedback for s in sessions if s.session_feedback]

    if not feedback_list:
        raise HTTPException(status_code=404, detail="No session feedback available for this user")

    # Feedback using LLM
    overall_feedback_text = generate_overall_feedback_from_sessions(feedback_list)

    # Fetch the user row
    result = await db.execute(select(User).where(User.user_id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Update user row
    user.overall_feedback = overall_feedback_text
    await db.commit()
    await db.refresh(user)

    return {
        "user_id": user.user_id,
        "overall_feedback": user.overall_feedback
    }