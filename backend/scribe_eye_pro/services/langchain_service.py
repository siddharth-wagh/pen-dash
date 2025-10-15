from typing import List, Dict, Any
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from langchain_core.pydantic_v1 import BaseModel, Field
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chains.retrieval_qa.base import RetrievalQA
from datetime import datetime
from pinecone.exceptions import NotFoundException

from config import settings
from database import entity_collection
from vector_store import vector_store_instance

# --- 1. Entity Extraction ---

# Pydantic model for structured output
class ExtractedEntities(BaseModel):
    characters: List[Dict[str, Any]] = Field(description="List of characters, with name and description")
    locations: List[Dict[str, Any]] = Field(description="List of locations, with name and description")
    events: List[Dict[str, Any]] = Field(description="List of key events, with name and description")

# Setup for entity extraction using Gemini
# **FIX APPLIED HERE**: Switched to a more stable model name
llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=settings.GEMINI_API_KEY,
    temperature=0,
    convert_system_message_to_human=True
)
parser = JsonOutputParser(pydantic_object=ExtractedEntities)
prompt_template = """
You are an expert in literary analysis. Analyze the following script content and extract the key entities.
Format your response as a JSON object with the keys "characters", "locations", and "events".

SCRIPT:
{script_content}

{format_instructions}
"""
prompt = PromptTemplate(
    template=prompt_template,
    input_variables=["script_content"],
    partial_variables={"format_instructions": parser.get_format_instructions()}
)
extraction_chain = prompt | llm | parser


async def extract_and_store_entities(script_content: str, project_id: str, script_id: str):
    """
    Analyzes script content, extracts entities, and stores them in MongoDB.
    """
    if not script_content.strip():
        return
        
    extracted_data = await extraction_chain.ainvoke({"script_content": script_content})
    
    entities_to_insert = []
    
    for entity_type, entity_list in extracted_data.items():
        singular_type = entity_type[:-1]
        for item in entity_list:
            if item.get("name"):
                entity_doc = {
                    "project_id": project_id,
                    "script_id": script_id,
                    "type": singular_type,
                    "name": item.get("name"),
                    "description": item.get("description", ""),
                    "attributes": item.get("attributes", {}),
                    "created_at": datetime.utcnow()
                }
                entities_to_insert.append(entity_doc)
    
    if entities_to_insert:
        await entity_collection.delete_many({"script_id": script_id})
        await entity_collection.insert_many(entities_to_insert)
    print(f"Stored {len(entities_to_insert)} entities for script {script_id}")

# --- 2. Embedding and Vector Storage ---

def process_and_embed_script(script_content: str, project_id: str, script_id: str):
    """
    Splits script into chunks, creates embeddings, and upserts them to Pinecone.
    """
    if not script_content.strip():
        try:
            vector_store_instance.delete(filter={"script_id": script_id})
            print(f"Cleared vectors for empty script {script_id}")
        except NotFoundException:
            print(f"No vectors to clear for empty script {script_id}")
        return

    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len
    )
    chunks = text_splitter.split_text(script_content)
    
    metadata = [{"project_id": project_id, "script_id": script_id} for _ in chunks]
    
    try:
        vector_store_instance.delete(filter={"script_id": script_id})
        print(f"Cleared old vectors for script {script_id}")
    except NotFoundException:
        print(f"No old vectors to clear for script {script_id} (this is normal for a new script).")
    
    vector_store_instance.add_texts(texts=chunks, metadatas=metadata)
    print(f"Upserted {len(chunks)} vectors for script {script_id}")

# --- 3. Question Answering ---

def get_qa_chain():
    """
    Creates and returns a RetrievalQA chain for question-answering.
    """
    # **FIX APPLIED HERE**: Switched to a more stable model name
    qa_llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        google_api_key=settings.GEMINI_API_KEY,
        temperature=0.3,
        convert_system_message_to_human=True
    )
    
    retriever = vector_store_instance.as_retriever(
        search_type="similarity",
        search_kwargs={'k': 4}
    )
    
    qa_chain = RetrievalQA.from_chain_type(
        llm=qa_llm,
        chain_type="stuff",
        retriever=retriever,
        return_source_documents=True,
    )
    return qa_chain

async def answer_question(project_id: str, question: str):
    """
    Answers a question based on the content of a specific project.
    """
    qa_chain = get_qa_chain()
    
    qa_chain.retriever.search_kwargs['filter'] = {'project_id': project_id}
    
    result = await qa_chain.ainvoke({"query": question})
    
    source_chunks = [doc.page_content for doc in result.get("source_documents", [])]
    
    return {
        "question": question,
        "answer": result.get("result", "Could not find an answer."),
        "source_chunks": source_chunks
    }

