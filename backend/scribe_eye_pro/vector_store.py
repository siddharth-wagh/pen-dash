from pinecone import Pinecone, ServerlessSpec
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_pinecone import PineconeVectorStore
from config import settings
import time

pc = Pinecone(api_key=settings.PINECONE_API_KEY)

# Initialize embeddings model using Google Gemini
embeddings = GoogleGenerativeAIEmbeddings(
    model="models/text-embedding-004",
    google_api_key=settings.GEMINI_API_KEY
)

def get_vector_store() -> PineconeVectorStore:
    """Initializes and returns the Pinecone vector store."""
    index_name = settings.PINECONE_INDEX_NAME
    
    # Check if index exists, create if not
    if index_name not in pc.list_indexes().names():
        print(f"Creating index '{index_name}'...")
        # The dimension for Google's text-embedding-004 is 768
        pc.create_index(
            name=index_name,
            dimension=768, 
            metric="cosine",
            spec=ServerlessSpec(cloud="aws", region="us-east-1")
        )
        # Wait for index to be ready
        while not pc.describe_index(index_name).status['ready']:
            time.sleep(1)
        print("Index created successfully.")

    vector_store = PineconeVectorStore.from_existing_index(
        index_name=index_name,
        embedding=embeddings
    )
    return vector_store

# Global vector store instance
vector_store_instance = get_vector_store()

