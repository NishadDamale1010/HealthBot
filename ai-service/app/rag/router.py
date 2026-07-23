from fastapi import APIRouter, HTTPException
import os
from app.config import settings
from app.rag.schemas import QueryRequest, QueryResponse, ItemResponse, SourceDoc
from app.rag.retriever import retriever

router = APIRouter(tags=["RAG Knowledge"])

@router.post("/query", response_model=QueryResponse)
def query_knowledge(request: QueryRequest):
    result = retriever.search(request.query, request.top_k)
    sources = [SourceDoc(**src) for src in result["sources"]]
    return QueryResponse(
        query=request.query,
        context=result["context"],
        sources=sources
    )

@router.get("/disease/{name}", response_model=ItemResponse)
def get_disease(name: str):
    file_path = os.path.join(settings.KNOWLEDGE_DIR, "diseases", f"{name}.md")
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Disease not found")
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
    return ItemResponse(name=name, content=content)

@router.get("/medicine/{name}", response_model=ItemResponse)
def get_medicine(name: str):
    file_path = os.path.join(settings.KNOWLEDGE_DIR, "medicines", f"{name}.md")
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Medicine not found")
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
    return ItemResponse(name=name, content=content)
