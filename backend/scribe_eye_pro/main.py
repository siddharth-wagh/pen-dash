from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from motor.motor_asyncio import AsyncIOMotorClient
from fastapi import APIRouter

from config import settings
from database import client as db_client
from vector_store import pc as pinecone_client
from routes import projects, scripts, analysis

# --- Diagnostic Check ---
# This will print the first few characters of your key if the .env file is loaded correctly.
# If it fails before this line, the file is not being read.
print(f"Attempting to load settings. Gemini Key starts with: {settings.GEMINI_API_KEY[:5]}...")
# --- End of Check ---


@asynccontextmanager
async def lifespan(app: FastAPI):
    # On startup
    print("Connecting to databases...")
    app.mongodb_client = db_client
    app.mongodb = app.mongodb_client.get_database("scribes_eye")
    app.pinecone_client = pinecone_client
    print("Database connections established.")
    yield
    # On shutdown
    print("Closing database connections...")
    app.mongodb_client.close()
    print("Connections closed.")

app = FastAPI(
    title="Scribe's Eye PRO API",
    description="Advanced API for creative writing with AI-powered analysis, entity extraction, and Q&A.",
    version="2.0.0",
    lifespan=lifespan
)

# --- Add this CORS Middleware section ---
origins = [
    "http://localhost:8080",
    "http://127.0.0.1:8080",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all the routers with a global prefix
api_router = APIRouter(prefix="/api")
api_router.include_router(projects.router)
api_router.include_router(scripts.router)
api_router.include_router(analysis.router)

app.include_router(api_router)

@app.get("/", tags=["Root"])
async def read_root():
    return {"message": "Welcome to the Scribe's Eye PRO API. Visit /docs for documentation."}

