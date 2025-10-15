from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Explicitly load the .env file from the current directory
load_dotenv()

class Settings(BaseSettings):
    MONGO_DETAILS: str
    PINECONE_API_KEY: str
    PINECONE_INDEX_NAME: str
    GEMINI_API_KEY: str

    class Config:
        # This tells Pydantic to look for an env file, but load_dotenv() has already done the job
        env_file = ".env"

settings = Settings()

