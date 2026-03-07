from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.dummydb.data import exercises

router = APIRouter()

class Exercise(BaseModel):
    name: str

# Get all exercises
@router.get("/exercises")
def get_exercises():
    return exercises

# Get exercise by id
@router.get("/exercises/{exercise_id}")
def get_exercise(exercise_id: int):
    for e in exercises:
        if e["exercise_id"] == exercise_id:
            return e
    raise HTTPException(status_code=404, detail="User not found")


# Delete exercise
@router.delete("/exercises/{exercise_id}")
def delete_exercise(exercise_id: int):
    for i, e in enumerate(exercises):
        if e["exercise_id"] == exercise_id:
            exercises.pop(i)
            return {"message": "Exercise deleted"}
    raise HTTPException(status_code=404, detail="Exercise not found")


# Create new exercise
@router.post("/exercises")
def create_exercise(exercise: Exercise):
    new_exer = exercise.model_dump()
    new_exer["exercise_id"] = len(exercises) + 1 
    exercises.append(new_exer)
    return new_exer

# Update exercise
@router.put("/exercises/{exercise_id}")
def update_exercise(exercise_id: int, updated_exercise: Exercise):
    for i, e in enumerate(exercises):
        if e["exercise_id"] == exercise_id:
            exercises[i].update(updated_exercise.model_dump())
            return exercises[i]
        
    raise HTTPException(status_code=404, detail="Exercise not found")