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

@router.post("/")
async def create_session(
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    data_list = await request.json()
    print("Received Payload")
    print(data_list)

    if not isinstance(data_list, list):
        raise HTTPException(status_code=400, detail="Expected list")

    user_id = current_user.user_id

    feedback_maps = []
    final_snapshot = None

    # Separate maps + final snapshot
    for snap in data_list:
        if "feedback" in snap and snap["feedback"]:
            feedback_maps.append(snap["feedback"])

        if "exercise" in snap:
            final_snapshot = snap

    # Not final snapshot - store
    if not final_snapshot:
        return {"status": "maps stored"}

    print("FINAL SNAPSHOT DETECTED")

    exercise_name = final_snapshot.get("exercise")
    reps = final_snapshot.get("reps", 0)
    total_time = final_snapshot.get("total_time", 0)

    # Convert maps to strings
    def map_to_text(m):
        return ", ".join(f"{k} - {v}" for k, v in m.items())

    map1 = map_to_text(feedback_maps[0]) if len(feedback_maps) > 0 else ""
    map2 = map_to_text(feedback_maps[1]) if len(feedback_maps) > 1 else ""
    map3 = map_to_text(feedback_maps[2]) if len(feedback_maps) > 2 else ""


    # Fetch exercise
    result = await db.execute(
        select(Exercise).where(Exercise.exercise_name == exercise_name)
    )
    exercise = result.scalar_one_or_none()

    if not exercise:
        raise HTTPException(status_code=404, detail="Exercise not found")

    exercise_id = exercise.exercise_id

    # LLM
    try:
        feedback_text = generate_overall_feedback(
            exercise_name=exercise_name,
            exercise_map_start=map1,
            exercise_map_mid=map2,
            exercise_map_end=map3
        )
        print("LLM OUTPUT:", feedback_text)
    except Exception as e:
        print("LLM ERROR:", e)
        raise HTTPException(status_code=500, detail="LLM failed")

    # Save to DB
    try:
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

        print("SESSION SAVED")

    except Exception as e:
        import traceback
        traceback.print_exc()
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

    return {
        "message": "Session saved",
        "exercise": exercise_name,
        "feedback": feedback_text,
        "total_time": total_time,
        "reps": reps
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