from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func

from app.database import Base


class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)

    username = Column(String, unique=True, nullable=False)

    overall_feedback = Column(Text, nullable=True)

    password_hash = Column(String, nullable=False)