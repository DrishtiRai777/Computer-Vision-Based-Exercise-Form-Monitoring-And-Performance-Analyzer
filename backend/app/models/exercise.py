from sqlalchemy import Column, Integer, String
from app.database import Base

class Exercise(Base):
    __tablename__ = "exercises"

    exercise_id = Column(Integer, primary_key=True, index=True)
    exercise_name = Column(String)