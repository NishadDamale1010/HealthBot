import asyncio
import threading
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import predict, nlp, emergency, health, questions
from app.rag.router import router as rag_router

# Global readiness flag
_ready = False

def _init_models():
    """Heavy initialization in a background thread so the port opens immediately."""
    global _ready
    try:
        from app.training.train_model import train
        from app.models.disease_predictor import predictor
        
        predictor.load_models()
        if not predictor.xgb_model:
            print("Models not found, training...")
            train()
            predictor.load_models()
        print("ML models loaded successfully")
    except Exception as e:
        print(f"ML startup error (non-fatal): {e}")

    try:
        from app.rag.ingest import ingest_documents
        ingest_documents()
        print("RAG knowledge base ingested successfully")
    except Exception as e:
        print(f"RAG ingestion error (non-fatal): {e}")

    _ready = True
    print("AI Service fully ready!")

app = FastAPI(
    title="HealthBot AI Service",
    description="Combined ML prediction and RAG knowledge retrieval service for HealthBot",
    version="2.0.0",
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
    """Health check — returns 200 immediately so Render detects the port."""
    return {"status": "ok", "ready": _ready, "service": "healthbot-ai", "version": "2.0.0"}

@app.on_event("startup")
async def startup_event():
    """Start heavy model loading in background thread so the server binds the port first."""
    thread = threading.Thread(target=_init_models, daemon=True)
    thread.start()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=settings.HOST, port=settings.PORT)
