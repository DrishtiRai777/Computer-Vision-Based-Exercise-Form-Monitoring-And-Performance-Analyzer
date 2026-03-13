from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from app.database import Base


class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)

    google_id = Column(String, unique=True, nullable=False)

    email = Column(String, unique=True, nullable=False)

    name = Column(String)

    overall_feedback = Column(Text)

    created_at = Column(DateTime, server_default=func.now())