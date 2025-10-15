from fastapi import APIRouter, HTTPException, status, Body
from typing import List
from datetime import datetime
from bson import ObjectId

from models import ProjectCreate, ProjectResponse, MessageResponse
from database import project_collection, script_collection, entity_collection, project_helper
from vector_store import vector_store_instance

router = APIRouter(prefix="/projects", tags=["Projects"])

@router.get("", response_model=List[ProjectResponse])
async def get_all_projects():
    projects = []
    async for project in project_collection.find():
        projects.append(project_helper(project))
    return projects

@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(project: ProjectCreate = Body(...)):
    project_dict = project.model_dump()
    project_dict["created_at"] = datetime.utcnow()
    project_dict["updated_at"] = datetime.utcnow()
    
    new_project = await project_collection.insert_one(project_dict)
    created_project = await project_collection.find_one({"_id": new_project.inserted_id})
    return project_helper(created_project)

@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project_by_id(project_id: str):
    if not ObjectId.is_valid(project_id):
        raise HTTPException(status_code=400, detail="Invalid project ID")
    project = await project_collection.find_one({"_id": ObjectId(project_id)})
    if project:
        return project_helper(project)
    raise HTTPException(status_code=404, detail=f"Project {project_id} not found")

@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(project_id: str, project_data: ProjectCreate = Body(...)):
    if not ObjectId.is_valid(project_id):
        raise HTTPException(status_code=400, detail="Invalid project ID")
        
    update_data = project_data.model_dump(exclude_unset=True)
    update_data["updated_at"] = datetime.utcnow()
    
    await project_collection.update_one(
        {"_id": ObjectId(project_id)}, {"$set": update_data}
    )
    
    updated_project = await project_collection.find_one({"_id": ObjectId(project_id)})
    if updated_project:
        return project_helper(updated_project)
    raise HTTPException(status_code=404, detail=f"Project {project_id} not found")

@router.delete("/{project_id}", response_model=MessageResponse)
async def delete_project(project_id: str):
    if not ObjectId.is_valid(project_id):
        raise HTTPException(status_code=400, detail="Invalid project ID")
        
    delete_result = await project_collection.delete_one({"_id": ObjectId(project_id)})

    if delete_result.deleted_count == 1:
        # Delete associated data
        await script_collection.delete_many({"project_id": project_id})
        await entity_collection.delete_many({"project_id": project_id})
        vector_store_instance.delete(filter={"project_id": project_id})
        
        return {"message": f"Project {project_id} deleted successfully"}
        
    raise HTTPException(status_code=404, detail=f"Project {project_id} not found")
