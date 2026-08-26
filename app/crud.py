from fastapi import APIRouter, status, HTTPException
from typing import List
from database import database
from models import users
import schemas
import auth

router = APIRouter(prefix="/api/users", tags=["users"])

@router.post("/", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(user: schemas.UserCreate):
    query = users.select().where(users.c.email == user.email)
    if await database.fetch_one(query):
        raise HTTPException(status_code=400, detail="Email already registered")
        
    hashed_pwd = auth.hash_password(user.password)
    insert_query = users.insert().values(
        username=user.username,
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,
        password=hashed_pwd,
        is_admin=user.is_admin if user.is_admin is not None else False,
        is_verified=user.is_verified if user.is_verified is not None else False,
        profile_picture=user.profile_picture
    )
    new_id = await database.execute(insert_query)
    
    # Retrieve the new user row from DB to return complete schema validation model
    check_query = users.select().where(users.c.id == new_id)
    return await database.fetch_one(check_query)

@router.get("/{user_id}", response_model=schemas.UserResponse)
async def read_user(user_id: int):
    query = users.select().where(users.c.id == user_id)
    db_user = await database.fetch_one(query)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@router.get("/", response_model=List[schemas.UserResponse])
async def read_all_users(skip: int = 0, limit: int = 100):
    query = users.select().offset(skip).limit(limit)
    return await database.fetch_all(query)

@router.put("/{user_id}", response_model=schemas.UserResponse)
async def update_user(user_id: int, user_update: schemas.UserUpdate):
    # Verify profile existence first
    check_query = users.select().where(users.c.id == user_id)
    db_user = await database.fetch_one(check_query)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if db_user["username"] == "admin":
        raise HTTPException(
            status_code=403,
            detail="The default administrator account is protected and cannot be modified via administrative panels."
        )
        
    update_data = user_update.dict(exclude_unset=True)
    if "password" in update_data and update_data["password"]:
        update_data["password"] = auth.hash_password(update_data["password"])
        
    if update_data:
        update_query = users.update().where(users.c.id == user_id).values(**update_data)
        await database.execute(update_query)
    return await database.fetch_one(check_query)

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(user_id: int):
    check_query = users.select().where(users.c.id == user_id)
    db_user = await database.fetch_one(check_query)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if db_user["username"] == "admin":
        raise HTTPException(
            status_code=403,
            detail="The default administrator account is protected and cannot be deleted."
        )
        
    username = db_user["username"]
    delete_query = users.delete().where(users.c.id == user_id)
    await database.execute(delete_query)
    
    # Cascade delete scans from history
    try:
        import os
        import json
        HISTORY_FILE = "analyses_history.json"
        if os.path.exists(HISTORY_FILE):
            with open(HISTORY_FILE, "r") as f:
                history = json.load(f)
            new_history = [item for item in history if item.get("username") != username]
            if len(history) != len(new_history):
                with open(HISTORY_FILE, "w") as f:
                    json.dump(new_history, f, indent=2)
    except Exception as e:
        print(f"Error cascading delete for analyses history: {e}")
        
    return None

