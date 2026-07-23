from app.config import settings
from app.rag.embeddings import embedding_model
from app.rag.ingest import get_chroma_client

class Retriever:
    def __init__(self):
        self.client = get_chroma_client()
        self.collection = self.client.get_or_create_collection(name=settings.COLLECTION_NAME)
    
    def search(self, query: str, top_k: int = 3):
        query_embedding = embedding_model.embed_text(query)
        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k
        )
        
        sources = []
        context_parts = []
        
        if results and results["documents"] and results["documents"][0]:
            docs = results["documents"][0]
            metadatas = results["metadatas"][0]
            distances = results["distances"][0] if "distances" in results and results["distances"] else [0] * len(docs)
            
            for doc, meta, dist in zip(docs, metadatas, distances):
                sources.append({
                    "content": doc,
                    "metadata": meta,
                    "score": 1.0 / (1.0 + dist)  # Simple distance to score conversion
                })
                context_parts.append(doc)
                
        # Sort by score descending
        sources = sorted(sources, key=lambda x: x["score"], reverse=True)
        
        return {
            "context": "\n\n".join(context_parts),
            "sources": sources
        }

retriever = Retriever()

