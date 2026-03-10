from pydantic import BaseModel
from typing import List

class FeedbackItem(BaseModel):
    timestamp: int
    message: str


class SessionCreate(BaseModel):
    user_id: int
    exercise_id: int
    session_time: int
    feedback: List[FeedbackItem]