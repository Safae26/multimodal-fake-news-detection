from sqlalchemy import Table, Column, Integer, String, Boolean

# Data about the table itself
from database import metadata

# Users Table
users = Table(
    "users", # table name
    metadata,
    Column("id", Integer, primary_key=True, index=True), # index: to look up for user entries frequently
    Column("username", String(50), unique=True, index=True, nullable=False),
    Column("first_name", String(50), nullable=True),
    Column("last_name", String(50), nullable=True),
    Column("email", String, unique=True, index=True, nullable=False),
    Column("password", String, nullable=False),
    Column("is_admin", Boolean, default=False),
    Column("is_verified", Boolean, default=False),
    Column("profile_picture", String, nullable=True, default=None)
)



