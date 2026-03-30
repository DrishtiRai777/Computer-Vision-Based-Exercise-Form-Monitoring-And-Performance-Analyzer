from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.database import get_db
from app.models.session import Session
from app.models.exercise import Exercise
from app.models.user import User
from app.dependencies.auth import get_current_user
from app.services.llm_service import generate_overall_feedback

router = APIRouter(prefix="/sessions", tags=["sessions"])
user_maps = {} 

@router.post("/")
async def create_session(
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    data = await request.json()

    feedback_map = data.get("feedback", {})
    exercise_name = data.get("exercise_name")
    user_id = current_user.user_id

    # Initialize 
    if user_id not in user_maps:
        user_maps[user_id] = []

    # Store only non-empty maps
    if feedback_map:
        user_maps[user_id].append(feedback_map)

    # Not final call - just store maps
    if not exercise_name:
        return {"status": "map stored"}

    # final call
    reps = data.get("reps", 0)
    total_time = data.get("total_time", 0)

    print("FINAL CALL TRIGGERED")

    
    maps = user_maps.get(user_id, [])

    def map_to_text(map_obj):
        if not map_obj:
            return ""
        return ", ".join(f"{k} - {v}" for k, v in map_obj.items())

    map1_str = map_to_text(maps[0]) if len(maps) > 0 else ""
    map2_str = map_to_text(maps[1]) if len(maps) > 1 else ""
    map3_str = map_to_text(maps[2]) if len(maps) > 2 else ""

    # Fetch exercise from DB
    result = await db.execute(
        select(Exercise).where(Exercise.exercise_name == exercise_name)
    )
    exercise = result.scalar_one_or_none()

    if not exercise:
        raise HTTPException(status_code=404, detail="Exercise not found")

    exercise_id = getattr(exercise, "exercise_id", None)
    if exercise_id is None:
        raise HTTPException(status_code=400, detail="Invalid exercise_id")

    print("LLM inputs:", map1_str, map2_str, map3_str)
    # Generate feedback using LLM
    try:
        feedback_text = generate_overall_feedback(
            exercise_name=exercise_name,
            exercise_map_start=map1_str,
            exercise_map_mid=map2_str,
            exercise_map_end=map3_str
        )
        print("FEEDBACK RETURNED FROM LLM:", repr(feedback_text))
    except Exception as e:
        print("LLM ERROR:", e)
        raise HTTPException(status_code=500, detail="LLM failed")


    # Save to DB
    try:
        print("=== Preparing to save session ===")
        print("user_id:", user_id, type(user_id))
        print("exercise_id:", exercise_id, type(exercise_id))
        print("session_time:", total_time, type(total_time))
        print("session_feedback:", feedback_text, type(feedback_text))
        print("reps:", reps, type(reps))

        session = Session(
            user_id=user_id,
            exercise_id=exercise_id,
            session_time=total_time,
            session_feedback=feedback_text,
            reps=reps
        )

        db.add(session)
        await db.commit()
        await db.refresh(session)

    except Exception as e:
        import traceback
        traceback.print_exc()
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

    # clear
    user_maps[user_id] = []

    return {
        "message": "Session saved",
        "feedback": feedback_text
    }


# All sessions for a user
@router.get("/user/{user_id}")
async def get_user_sessions(
    user_id: int,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Session).where(Session.user_id == user_id)
    )
    sessions = result.scalars().all()

    if not sessions:
        raise HTTPException(
            status_code=404,
            detail="No sessions found for this user"
        )

    return {
        "status": "success",
        "sessions": [
            {
                "session_id": s.session_id,
                "exercise_id": s.exercise_id,
                "session_time": s.session_time,
                "reps": s.reps,
                "session_feedback": s.session_feedback,
                "created_at": s.created_at
            }
            for s in sessions
        ]
    }