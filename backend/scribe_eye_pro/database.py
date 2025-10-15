import motor.motor_asyncio
from models import ProjectDB, ScriptDB, EntityDB
from config import settings

client = motor.motor_asyncio.AsyncIOMotorClient(settings.MONGO_DETAILS)
db = client.scribes_eye

# Collections
project_collection = db.get_collection("projects")
script_collection = db.get_collection("scripts")
entity_collection = db.get_collection("entities")

# Helper function to convert MongoDB docs to Pydantic models
def project_helper(project) -> ProjectDB:
    return ProjectDB(
        id=str(project["_id"]),
        title=project["title"],
        description=project.get("description"),
        created_at=project["created_at"],
        updated_at=project["updated_at"],
    )

def script_helper(script) -> ScriptDB:
    return ScriptDB(
        id=str(script["_id"]),
        project_id=script["project_id"],
        title=script["title"],
        content=script.get("content", ""),
        created_at=script["created_at"],
        updated_at=script["updated_at"],
    )

def entity_helper(entity) -> EntityDB:
    return EntityDB(
        id=str(entity["_id"]),
        project_id=entity["project_id"],
        script_id=entity["script_id"],
        type=entity["type"],
        name=entity["name"],
        description=entity.get("description"),
        attributes=entity.get("attributes", {}),
        created_at=entity["created_at"],
    )
