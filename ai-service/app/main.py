from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.routers import predict, nlp, emergency, health, questions
from app.rag.router import router as rag_router
from app.rag.ingest import ingest_documents
from app.training.train_model import train
from app.models.disease_predictor import predictor

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Train ML models if they don't exist
    try:
        predictor.load_models()
        if not predictor.xgb_model:
            print("Models not found, training...")
            train()
            predictor.load_models()
    except Exception as e:
        print(f"ML startup error: {e}")
    
    # Ingest RAG documents if vector store is empty
    try:
        ingest_documents()
    except Exception as e:
        print(f"RAG ingestion error: {e}")
    
    yield

app = FastAPI(
    title="HealthBot AI Service",
    description="Combined ML prediction and RAG knowledge retrieval service for HealthBot",
    version="2.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ML routes (under /api prefix to match existing backend expectations)
app.include_router(predict.router, prefix="/api")
app.include_router(nlp.router, prefix="/api")
app.include_router(emergency.router, prefix="/api")
app.include_router(health.router, prefix="/api")
app.include_router(questions.router, prefix="/api")

# RAG routes (at root level to match existing backend expectations)
app.include_router(rag_router)

@app.get("/healthz")
def health_check():
    return {"status": "ok", "service": "healthbot-ai", "version": "2.0.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=settings.HOST, port=settings.PORT)
