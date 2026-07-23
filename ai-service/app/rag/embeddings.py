from sentence_transformers import SentenceTransformer
from app.config import settings

class EmbeddingModel:
    def __init__(self):
        self._model = None
        
    @property
    def model(self):
        # Lazy load the model on first use so it doesn't block startup
        if self._model is None:
            print("Downloading/loading embedding model (this may take a moment)...")
            self._model = SentenceTransformer(settings.EMBEDDING_MODEL)
            print("Embedding model loaded successfully.")
        return self._model
    
    def embed_text(self, text: str):
        return self.model.encode(text).tolist()
    
    def embed_batch(self, texts: list[str]):
        return self.model.encode(texts).tolist()

embedding_model = EmbeddingModel()
