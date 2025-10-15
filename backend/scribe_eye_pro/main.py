from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import projects, scripts, entities, analysis
from database import close_mongo_connection, connect_to_mongo
from config import settings
import logging

# Add this line for a quick settings check on startup
logging.info(f"Attempting to load settings. Gemini Key starts with: {settings.GEMINI_API_KEY[:5]}...")


# Lifespan events to connect and disconnect from the database
async def lifespan(app: FastAPI):
    # Startup
    print("Connecting to databases...")
    await connect_to_mongo()
    print("Database connections established.")
    yield
    # Shutdown
    print("Closing database connections...")
    await close_mongo_connection()
    print("Database connections closed.")


app = FastAPI(
    title="Scribe's Eye PRO API",
    description="Advanced API for creative writing with AI-powered analysis, entity extraction, and Q&A.",
    version="2.0.0",
    lifespan=lifespan
)

# --- Add this CORS Middleware section ---
# This allows your frontend to communicate with your backend.
# origins = ["*"] is a wildcard that allows all origins, which is convenient for development.
# For production, you should restrict this to your actual frontend domain,
# e.g., origins = ["https://your-frontend-domain.com"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Include all the routers
app.include_router(projects.router, prefix="/api")
app.include_router(scripts.router, prefix="/api")
app.include_router(entities.router, prefix="/api")
app.include_router(analysis.router, prefix="/api")

@app.get("/", tags=["Root"])
async def read_root():
    return {"message": "Welcome to the Scribe's Eye PRO API. Visit /docs for documentation."}

