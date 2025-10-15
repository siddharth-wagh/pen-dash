from fastapi import APIRouter, HTTPException, Query, Body
from typing import List, Optional
from bson import ObjectId

from models import EntityResponse, Question, QAResponse
from database import entity_collection, project_collection, entity_helper
from services.langchain_service import answer_question

router = APIRouter(tags=["AI Features"])

@router.get("/projects/{project_id}/entities", response_model=List[EntityResponse])
async def get_entities_by_project(
    project_id: str, 
    type: Optional[str] = Query(None, enum=["character", "location", "event"])
):
    if not ObjectId.is_valid(project_id):
        raise HTTPException(status_code=400, detail="Invalid project ID")
    
    query = {"project_id": project_id}
    if type:
        query["type"] = type
        
    entities = []
    async for entity in entity_collection.find(query):
        entities.append(entity_helper(entity))
    return entities

@router.post("/projects/{project_id}/question", response_model=QAResponse)
async def ask_project_question(project_id: str, question: Question = Body(...)):
    if not ObjectId.is_valid(project_id):
        raise HTTPException(status_code=400, detail="Invalid project ID")
    project = await project_collection.find_one({"_id": ObjectId(project_id)})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    result = await answer_question(project_id, question.question)
    return result
