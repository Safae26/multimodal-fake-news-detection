from pydantic import BaseModel
from typing import Optional

# These schemas are the pydantic models which we are going to use as inputs for our endpoints
# Pydantic: the core engine for data validation, serialization, and documentation

class UserCreate(BaseModel):
    username: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: str
    password: str  
    profile_picture: Optional[str] = None
    is_admin: Optional[bool] = False
    is_verified: Optional[bool] = False

class UserLogin(BaseModel):
    username: str
    password: str  

class UserUpdate(BaseModel):
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None
    profile_picture: Optional[str] = None
    is_admin: Optional[bool] = None
    is_verified: Optional[bool] = None

class UserResponse(BaseModel):
    # Which fields can be sent to the front-end
    id: int
    username: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: str
    is_admin: bool
    is_verified: bool
    profile_picture: Optional[str] = None

    class Config:
        from_attributes = True