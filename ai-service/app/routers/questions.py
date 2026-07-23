from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
from app.models.question_generator import question_generator

router = APIRouter()

class QuestionRequest(BaseModel):
    known_symptoms: List[str]

@router.post("/suggest-questions")
def suggest_questions(req: QuestionRequest):
    questions = question_generator.suggest_questions(req.known_symptoms)
    return {"questions": questions}
