from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.session import Session as SessionModel
from app.models.user import User
from app.services.llm_service import generate_overall_feedback_from_sessions

router = APIRouter()


@router.get("/users/{user_id}/overall-feedback")
async def get_overall_feedback(user_id: int, db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(
            select(SessionModel).where(SessionModel.user_id == user_id)
        )

        sessions = result.scalars().all()

        if not sessions:
            return {"message": "No sessions found"}

        feedback_list = [s.session_feedback for s in sessions]

        overall_feedback = generate_overall_feedback_from_sessions(feedback_list)

        result = await db.execute(
            select(User).where(User.user_id == user_id)
        )

        user = result.scalar_one_or_none()

        if user:
            user.overall_feedback = overall_feedback
            await db.commit()

        return {
            "user_id": user_id,
            "overall_feedback": overall_feedback
        }

    except Exception as e:
        await db.rollback()
        raise e