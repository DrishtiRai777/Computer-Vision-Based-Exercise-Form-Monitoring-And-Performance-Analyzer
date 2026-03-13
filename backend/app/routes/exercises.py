from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.exercise import Exercise

router = APIRouter(prefix="/exercises", tags=["Exercises"])


# Create exercise
@router.post("/")
async def create_exercise(
    exercise_name: str = Body(...),
    db: AsyncSession = Depends(get_db)
):
    exercise = Exercise(exercise_name=exercise_name)

    db.add(exercise)
    await db.commit()
    await db.refresh(exercise)

    return exercise


# Get all exercises
@router.get("/")
async def get_exercises(db: AsyncSession = Depends(get_db)):

    result = await db.execute(select(Exercise))
    exercises = result.scalars().all()

    return exercises


# Update exercise
@router.put("/{exercise_id}")
async def update_exercise(
    exercise_id: int,
    exercise_name: str = Body(...),
    db: AsyncSession = Depends(get_db)
):

    result = await db.execute(
        select(Exercise).where(Exercise.exercise_id == exercise_id)
    )

    exercise = result.scalar_one_or_none()

    if exercise is None:
        raise HTTPException(status_code=404, detail="Exercise not found")

    exercise.exercise_name = exercise_name

    await db.commit()
    await db.refresh(exercise)

    return exercise