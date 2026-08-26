from sqlalchemy import create_engine, MetaData
from databases import Database

DATABASE_URL = "sqlite:///./multimodal_fake_news_detection_system.db"
database = Database(DATABASE_URL)
metadata = MetaData()
engine = create_engine(DATABASE_URL) # To to establish a connection between the application and the SQL database

