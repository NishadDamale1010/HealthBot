import os
import glob
import chromadb
from app.config import settings
from app.rag.embeddings import embedding_model

def get_chroma_client():
    return chromadb.PersistentClient(path=settings.VECTORSTORE_DIR)

def split_text(text: str, chunk_size: int, overlap: int) -> list[str]:
    words = text.split()
    chunks = []
    if not words:
        return chunks
    
    i = 0
    while i < len(words):
        chunk = " ".join(words[i:i+chunk_size])
        chunks.append(chunk)
        i += chunk_size - overlap
    return chunks

def ingest_documents():
    client = get_chroma_client()
    collection = client.get_or_create_collection(name=settings.COLLECTION_NAME)
    
    existing = collection.count()
    if existing > 0:
        print(f"Collection already has {existing} documents. Skipping ingestion.")
        return

    print("Starting ingestion...")
    documents = []
    metadatas = []
    ids = []
    
    doc_id = 0
    
    for root, _, files in os.walk(settings.KNOWLEDGE_DIR):
        for file in files:
            if file.endswith(".md"):
                file_path = os.path.join(root, file)
                category = os.path.basename(os.path.dirname(file_path))
                name = os.path.splitext(file)[0]
                
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()
                
                chunks = split_text(content, settings.CHUNK_SIZE, settings.CHUNK_OVERLAP)
                for idx, chunk in enumerate(chunks):
                    documents.append(chunk)
                    metadatas.append({
                        "source": file,
                        "category": category,
                        "name": name,
                        "chunk": idx
                    })
                    ids.append(f"doc_{doc_id}")
                    doc_id += 1
    
    batch_size = 100
    for i in range(0, len(documents), batch_size):
        batch_docs = documents[i:i+batch_size]
        batch_meta = metadatas[i:i+batch_size]
        batch_ids = ids[i:i+batch_size]
        
        embeddings = embedding_model.embed_batch(batch_docs)
        
        collection.add(
            documents=batch_docs,
            embeddings=embeddings,
            metadatas=batch_meta,
            ids=batch_ids
        )
    print(f"Ingested {len(documents)} chunks successfully.")

if __name__ == '__main__':
    ingest_documents()

