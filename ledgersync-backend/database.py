from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

# 1. Define the SQLite database file location
DATABASE_URL = "sqlite:///./ledgersync.db"

# 2. Create the engine that connects to the database
# check_same_thread=False is specifically required for FastAPI when using SQLite
engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)

# 3. Create a session factory for our API requests
# autocommit=False and autoflush=False explicitly control our transaction boundaries
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 4. Create the Base class that all our tables will inherit from
class Base(DeclarativeBase):
    pass