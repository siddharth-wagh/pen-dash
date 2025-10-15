from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime
from bson import ObjectId

# This allows Pydantic models to work with MongoDB's ObjectId
class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v, *args, **kwargs):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, field_schema):
        field_schema.update(type="string")

# --- Base Models & Payloads ---

class ProjectBase(BaseModel):
    title: str = Field(..., min_length=1)
    description: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class ScriptBase(BaseModel):
    title: str = Field(..., min_length=1)
    content: Optional[str] = ""

class ScriptCreate(ScriptBase):
    pass

class Question(BaseModel):
    question: str

# --- Database Models ---
class BaseDBModel(BaseModel):
    id: str = Field(..., alias="_id")
    # This config allows the model to be created from a dict using its alias
    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)
    
class ProjectDB(ProjectBase):
    id: str = Field(..., alias="_id")
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)

class ScriptDB(ScriptBase):
    id: str = Field(..., alias="_id")
    project_id: str
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)

class EntityDB(BaseModel):
    id: str = Field(..., alias="_id")
    project_id: str
    script_id: str
    type: str # character, location, event
    name: str
    description: Optional[str] = None
    attributes: Dict[str, Any] = {}
    created_at: datetime
    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)

# --- Response Models ---
class ProjectResponse(ProjectBase):
    id: str
    created_at: datetime
    updated_at: datetime
    
class ScriptResponse(ScriptBase):
    id: str
    project_id: str
    created_at: datetime
    updated_at: datetime

class EntityResponse(BaseModel):
    id: str
    project_id: str
    script_id: str
    type: str
    name: str
    description: Optional[str] = None
    attributes: Dict[str, Any] = {}
    created_at: datetime

class MessageResponse(BaseModel):
    message: str
    
class QAResponse(BaseModel):
    question: str
    answer: str
    source_chunks: List[str]
