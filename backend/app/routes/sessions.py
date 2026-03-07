from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.dummydb.data import users, exercises, sessions

router = APIRouter()

class Session(BaseModel):
    sess_time: int
    sess_feedback: str
    sess_reps: int
    user_id: int
    exercise_id: int

# Creating session....
@router.post("/sessions")
def create_session(session: Session):
    # Validate user_id
    if not any(u["userid"] == session.user_id for u in users):
        raise HTTPException(status_code=400, detail="Invalid user_id")
    # Validate exercise_id
    if not any(e["exercise_id"] == session.exercise_id for e in exercises):
        raise HTTPException(status_code=400, detail="Invalid exercise_id")
    
    session_dict = session.model_dump()
    session_dict["sessionId"] = sessions[-1]["sessionId"] + 1 if sessions else 1
    sessions.append(session_dict)
    return session_dict

# Get all sessions
@router.get("/sessions")
def get_sessions():
    return sessions

# Get session by ID
@router.get("/sessions/{session_id}")
def get_session(session_id: int):
    for s in sessions:
        if s["sessionId"] == session_id:
            return s
    raise HTTPException(status_code=404, detail="Session not found")

# Update session
@router.put("/sessions/{session_id}")
def update_session(session_id: int, updated_session: Session):
    for i, s in enumerate(sessions):
        if s["sessionId"] == session_id:
            # Validate user_id and exercise_id on update
            if not any(u["userid"] == updated_session.user_id for u in users):
                raise HTTPException(status_code=400, detail="Invalid user_id")
            if not any(e["exercise_id"] == updated_session.exercise_id for e in exercises):
                raise HTTPException(status_code=400, detail="Invalid exercise_id")

            sessions[i].update(updated_session.model_dump())
            return sessions[i]
    raise HTTPException(status_code=404, detail="Session not found")

# Delete session
@router.delete("/sessions/{session_id}")
def delete_session(session_id: int):
    for i, s in enumerate(sessions):
        if s["sessionId"] == session_id:
            sessions.pop(i)
            return {"message": "Session deleted"}
    raise HTTPException(status_code=404, detail="Session not found")