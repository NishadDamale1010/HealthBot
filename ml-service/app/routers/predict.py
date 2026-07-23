from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
from app.models.disease_predictor import predictor
from app.nlp.pipeline import pipeline
from app.config import settings

router = APIRouter()

class SymptomRequest(BaseModel):
    symptoms: List[str]

class TextRequest(BaseModel):
    text: str

@router.post("/predict")
def predict(req: SymptomRequest):
    preds = predictor.predict(req.symptoms)
    return {"predictions": preds, "disclaimer": settings.MEDICAL_DISCLAIMER}

@router.post("/predict/text")
def predict_text(req: TextRequest):
    nlp_res = pipeline.process(req.text)
    preds = predictor.predict(nlp_res["symptoms"])
    return {
        "nlp_results": nlp_res,
        "predictions": preds,
        "disclaimer": settings.MEDICAL_DISCLAIMER
    }
