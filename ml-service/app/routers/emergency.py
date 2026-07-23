from fastapi import APIRouter
from pydantic import BaseModel
from app.models.emergency_classifier import emergency_classifier

router = APIRouter()

class TextRequest(BaseModel):
    text: str

@router.post("/detect-emergency")
def detect_emergency(req: TextRequest):
    return emergency_classifier.check_emergency(req.text)
