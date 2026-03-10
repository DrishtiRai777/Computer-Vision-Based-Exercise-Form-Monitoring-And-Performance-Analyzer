import json
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.session import Session as SessionModel
from app.schemas.session_schema import SessionCreate
from app.services.llm_service import generate_overall_feedback

router = APIRouter()


@router.post("/sessions")
async def create_session(data: SessionCreate, db: AsyncSession = Depends(get_db)):
    try:
        session_feedback = generate_overall_feedback(data.feedback)

        session = SessionModel(
            session_time=data.session_time,
            session_feedback=session_feedback,
            user_id=data.user_id,
            exercise_id=data.exercise_id,
        )

        db.add(session)

        await db.commit()

        await db.refresh(session)

        return {
            "session_id": session.session_id,
            "feedback": session_feedback,
        }

    except Exception as e:
        await db.rollback()
        raise e