import asyncio
import os
import sys
import bcrypt

# Ensure we can import from app directory
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import database
from models import users

async def create_default_admin():
    await database.connect()
    
    # Hash password using bcrypt directly
    password_bytes = b"admin123"
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt).decode("utf-8")
    
    # Check if 'admin' username already exists
    check_query = users.select().where(users.c.username == "admin")
    existing_user = await database.fetch_one(check_query)
    
    if existing_user:
        print("User 'admin' already exists in the database.")
    else:
        # Insert admin user
        insert_query = users.insert().values(
            username="admin",
            first_name="Platform",
            last_name="Administrator",
            email="admin@fakenewshunter.org",
            password=hashed,
            is_admin=True,
            is_verified=True
        )
        await database.execute(insert_query)
        print("\n=======================================================")
        print("SUCCESS: Default Administrator Account Seeded!")
        print("Username: admin")
        print("Password: admin123")
        print("=======================================================\n")
        
    await database.disconnect()

if __name__ == "__main__":
    asyncio.run(create_default_admin())
