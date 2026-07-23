import os

class Settings:
    # App Settings
    PORT: int = 8001
    HOST: str = "0.0.0.0"
    
    # Paths
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    KNOWLEDGE_DIR: str = os.path.join(BASE_DIR, "knowledge")
    VECTORSTORE_DIR: str = os.path.join(BASE_DIR, "vectorstore")
    
    # Embedding Settings
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"
    CHUNK_SIZE: int = 512
    CHUNK_OVERLAP: int = 50
    
    # Chroma Settings
    COLLECTION_NAME: str = "health_knowledge"
    
settings = Settings()
