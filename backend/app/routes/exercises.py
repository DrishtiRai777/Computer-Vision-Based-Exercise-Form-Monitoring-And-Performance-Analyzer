from fastapi import APIRouter

router = APIRouter()

EXERCISES = [
    {"exercise_id": 1, "exercise_name": "Squat"},
    {"exercise_id": 2, "exercise_name": "Pushup"},
    {"exercise_id": 3, "exercise_name": "Plank"},
    {"exercise_id": 4, "exercise_name": "Lunges"},
    {"exercise_id": 5, "exercise_name": "Jumping Jacks"},
]


@router.get("/exercises")
async def get_exercises():
    return EXERCISES