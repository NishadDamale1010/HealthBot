from fastapi import FastAPI
from app.routers import predict, nlp, emergency, health, questions
from app.training.train_model import train
from app.models.disease_predictor import predictor
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="HealthBot ML Service",
    description="Machine Learning service for HealthBot symptom analysis and disease prediction",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    # Train models if they don't exist
    try:
        predictor.load_models()
        if not predictor.xgb_model:
            print("Models not found, training...")
            train()
            predictor.load_models()
    except Exception as e:
        print(f"Error during startup: {e}")

app.include_router(predict.router, prefix="/api")
app.include_router(nlp.router, prefix="/api")
app.include_router(emergency.router, prefix="/api")
app.include_router(health.router, prefix="/api")
app.include_router(questions.router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    from app.config import settings
    uvicorn.run(app, host="0.0.0.0", port=settings.PORT)
