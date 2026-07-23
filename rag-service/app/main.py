from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os

from app.config import settings
from app.schemas import QueryRequest, QueryResponse, ItemResponse, SourceDoc
from app.ingest import ingest_documents
from app.retriever import retriever

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Run ingestion on startup if vector store is empty
    ingest_documents()
    yield

app = FastAPI(title="HealthBot RAG Knowledge Service", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/healthz")
def health_check():
    return {"status": "ok"}

@app.post("/query", response_model=QueryResponse)
def query_knowledge(request: QueryRequest):
    result = retriever.search(request.query, request.top_k)
    sources = [SourceDoc(**src) for src in result["sources"]]
    return QueryResponse(
        query=request.query,
        context=result["context"],
        sources=sources
    )

@app.get("/disease/{name}", response_model=ItemResponse)
def get_disease(name: str):
    file_path = os.path.join(settings.KNOWLEDGE_DIR, "diseases", f"{name}.md")
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Disease not found")
    
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
        
    return ItemResponse(name=name, content=content)

@app.get("/medicine/{name}", response_model=ItemResponse)
def get_medicine(name: str):
    file_path = os.path.join(settings.KNOWLEDGE_DIR, "medicines", f"{name}.md")
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Medicine not found")
    
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
        
    return ItemResponse(name=name, content=content)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=settings.HOST, port=settings.PORT)
