from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import logging

from sqlalchemy import delete, select
from datetime import datetime, timedelta
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
            "created_at": user.created_at,
            "overall_feedback": user.overall_feedback
        }
        for user in users
    ]


@router.post("/overall-feedback")
async def overall_feedback(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user.user_id
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")

    try:
        # one_week_ago = datetime.utcnow() - timedelta(weeks=1)

        # # Deleting old sesssions
        # delete_stmt = delete(SessionModel).where(
        #     SessionModel.user_id == user_id,
        #     SessionModel.created_at < one_week_ago
        # )
        # result = await db.execute(delete_stmt)
        # await db.commit()
        # logging.info(f"Deleted {result.rowcount} old sessions")

        
        select_stmt = select(SessionModel.session_feedback).where(SessionModel.user_id == user_id)
        result = await db.execute(select_stmt)
        feedback_rows = result.scalars().all()
        feedback_list = [f for f in feedback_rows if f]
        logging.info(f"Fetched {len(feedback_list)} feedback entries")

        #LLM
        if not feedback_list:
            overall_feedback_result = "No recent sessions to summarize."
        else:
            overall_feedback_result = generate_overall_feedback_from_sessions(feedback_list)

        # Updation in user
        select_user_stmt = select(User).where(User.user_id == user_id)
        result = await db.execute(select_user_stmt)
        user = result.scalars().first()
        if not user:
            logging.info("User not found")
            raise HTTPException(status_code=404, detail="User not found")

        user.overall_feedback = overall_feedback_result
        await db.commit()

        return {"overall_feedback": overall_feedback_result}

    except Exception as e:
        await db.rollback()
        logging.exception("Unexpected error in overall-feedback")
        raise HTTPException(status_code=500, detail=str(e))