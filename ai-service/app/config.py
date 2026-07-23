import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    
    # ML settings
    MODEL_DIR: str = os.path.join(os.path.dirname(__file__), "artifacts", "models")
    CONFIDENCE_THRESHOLD: float = 0.3
    
    # RAG settings  
    KNOWLEDGE_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "knowledge")
    VECTORSTORE_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "vectorstore")
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"
    CHUNK_SIZE: int = 512
    CHUNK_OVERLAP: int = 50
    COLLECTION_NAME: str = "health_knowledge"
    
    MEDICAL_DISCLAIMER: str = "This service provides informational predictions only and is not a substitute for professional medical advice."
    
    class Config:
        env_file = ".env"

settings = Settings()
