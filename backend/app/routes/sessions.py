from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session as DbSession
from app.database import get_db
from app.models.session import Session as SessionModel
from sqlalchemy.future import select
from app.services.llm_service import generate_overall_feedback  # your LLM function
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/sessions", tags=["sessions"])

#input (request type) 
@router.post("/")
async def create_single_summary_session(request: Request, db: DbSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Receive a list of session inputs, generate combined feedback using LLM,
    and store a single session in the database summarizing all.
    input: 
    [
        {"user_id": 1, "exercise_id": 1, "session_time": 5, "reps": 10, "feedback": ["go lower"]},
        {"user_id": 1, "exercise_id": 1, "session_time": 10, "reps": 10, "feedback": ["Engage core"]},
        {"user_id": 1, "exercise_id": 1, "session_time": 10, "reps": 10, "feedback": ["Keep back straight"]}
    ]
    """
    try:
        payload = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    if not isinstance(payload, list) or len(payload) == 0:
        raise HTTPException(status_code=400, detail="Payload must be a non-empty list of sessions")

    # Validate required fields in each item
    for item in payload:
        if not all([item.get("user_id"), item.get("exercise_id"), item.get("session_time"), item.get("reps")]):
            raise HTTPException(status_code=400, detail="Missing required session fields")
        if not isinstance(item.get("feedback", []), list):
            raise HTTPException(status_code=400, detail="Feedback must be a list of strings")

    # Prep feedback for LLM
    class FeedbackItem:
        def __init__(self, message):
            self.message = message

    feedback_objects = []
    for item in payload:
        for msg in item.get("feedback", []):
            feedback_objects.append(FeedbackItem(msg))


    # Generate combined feedback from LLM
    combined_feedback = generate_overall_feedback(feedback_objects)

    # Store in db
    last_item = payload[-1]  # take reps from last session
    session_obj = SessionModel(
        user_id=payload[0]["user_id"],           #  user_id from 1st item
        exercise_id=payload[0]["exercise_id"],   #  exercise_id from 1st item
        session_time=sum(item["session_time"] for item in payload),  # sum of all times
        reps=last_item["reps"],                  # reps from last item
        session_feedback=combined_feedback       # combined feedback
    )
    db.add(session_obj)
    await db.commit()
    print(session_obj.session_id)
    await db.refresh(session_obj)
    db.add(session_obj)

    return {
        "status": "success",
        "session_id": session_obj.session_id,     
        "combined_feedback": combined_feedback
    }


#Fetch all sessions for a given userId
@router.get("/user/{user_id}")
async def get_user_sessions(user_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(SessionModel).where(SessionModel.user_id == user_id))
    sessions = result.scalars().all()

    if not sessions:
        raise HTTPException(status_code=404, detail="No sessions found for this user")

    return {
        "status": "success",
        "sessions": [
            {
                "session_id": s.session_id,
                "exercise_id": s.exercise_id,
                "session_time": s.session_time,
                "reps": s.reps,
                "session_feedback": s.session_feedback
            } for s in sessions
        ]
    }