from fastapi import APIRouter, HTTPException, status, Body, BackgroundTasks
from typing import List
from datetime import datetime
from bson import ObjectId

from models import ScriptCreate, ScriptResponse, MessageResponse
from database import script_collection, project_collection, entity_collection, script_helper
from services.langchain_service import process_and_embed_script, extract_and_store_entities
from vector_store import vector_store_instance

router = APIRouter(tags=["Scripts"])

@router.post("/projects/{project_id}/scripts", response_model=ScriptResponse, status_code=status.HTTP_201_CREATED)
async def create_script(project_id: str, background_tasks: BackgroundTasks, script: ScriptCreate = Body(...)):
    if not ObjectId.is_valid(project_id):
        raise HTTPException(status_code=400, detail="Invalid project ID")
    project = await project_collection.find_one({"_id": ObjectId(project_id)})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    script_dict = script.model_dump()
    script_dict["project_id"] = project_id
    script_dict["created_at"] = datetime.utcnow()
    script_dict["updated_at"] = datetime.utcnow()

    new_script = await script_collection.insert_one(script_dict)
    created_script = await script_collection.find_one({"_id": new_script.inserted_id})
    
    # Run heavy AI processing in the background
    script_id = str(created_script["_id"])
    background_tasks.add_task(process_and_embed_script, script.content, project_id, script_id)
    background_tasks.add_task(extract_and_store_entities, script.content, project_id, script_id)

    return script_helper(created_script)

@router.get("/projects/{project_id}/scripts", response_model=List[ScriptResponse])
async def get_scripts_for_project(project_id: str):
    if not ObjectId.is_valid(project_id):
        raise HTTPException(status_code=400, detail="Invalid project ID")
    
    scripts = []
    async for script in script_collection.find({"project_id": project_id}):
        scripts.append(script_helper(script))
    return scripts

@router.put("/scripts/{script_id}", response_model=ScriptResponse)
async def update_script(script_id: str, background_tasks: BackgroundTasks, script_data: ScriptCreate = Body(...)):
    if not ObjectId.is_valid(script_id):
        raise HTTPException(status_code=400, detail="Invalid script ID")
        
    update_data = script_data.model_dump(exclude_unset=True)
    update_data["updated_at"] = datetime.utcnow()
    
    await script_collection.update_one({"_id": ObjectId(script_id)}, {"$set": update_data})
    
    updated_script = await script_collection.find_one({"_id": ObjectId(script_id)})
    if updated_script:
        # Re-run AI processing on updated content
        project_id = updated_script["project_id"]
        content = updated_script.get("content", "")
        background_tasks.add_task(process_and_embed_script, content, project_id, script_id)
        background_tasks.add_task(extract_and_store_entities, content, project_id, script_id)
        
        return script_helper(updated_script)
        
    raise HTTPException(status_code=404, detail=f"Script {script_id} not found")
    
@router.delete("/scripts/{script_id}", response_model=MessageResponse)
async def delete_script(script_id: str):
    if not ObjectId.is_valid(script_id):
        raise HTTPException(status_code=400, detail="Invalid script ID")

    delete_result = await script_collection.delete_one({"_id": ObjectId(script_id)})
    
    if delete_result.deleted_count == 1:
        # Also delete associated entities and vectors
        await entity_collection.delete_many({"script_id": script_id})
        vector_store_instance.delete(filter={"script_id": script_id})
        
        return {"message": f"Script {script_id} deleted successfully"}
        
    raise HTTPException(status_code=404, detail=f"Script {script_id} not found")
