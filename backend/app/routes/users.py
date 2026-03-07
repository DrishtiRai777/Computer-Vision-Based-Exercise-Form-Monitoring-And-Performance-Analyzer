from fastapi import APIRouter, HTTPException
from pydantic import BaseModel 
from app.dummydb.data import users


router = APIRouter()

class User(BaseModel):
    username: str
    pswd: str

# Get all users
@router.get("/users")
def get_users():
    return users

# Create a user
@router.post("/users")
def create_user(user: User):
    new_user = user.model_dump()
    new_user["userid"] = len(users) + 1  # id
    users.append(new_user)
    return new_user

# Delete user
@router.delete("/users/{user_id}")
def delete_user(user_id: int):
    for i, u in enumerate(users):
        if u["userid"] == user_id:
            users.pop(i)
            return {"message": "User deleted"}
    raise HTTPException(status_code=404, detail="User not found")


# Update user info
@router.put("/users/{user_id}")
def update_user(user_id: int, updated_user: User):
    for i, u in enumerate(users):
        if u["userid"] == user_id:
            users[i].update(updated_user.model_dump())
            return users[i]
    
    raise HTTPException(status_code=404, detail="User not found")


# Get user by id
@router.get("/users/{user_id}")
def get_user(user_id: int):
    for u in users:
        if u["userid"] == user_id:
            return u
    raise HTTPException(status_code=404, detail="User not found")