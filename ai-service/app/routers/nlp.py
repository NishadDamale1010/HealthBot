from fastapi import APIRouter
from pydantic import BaseModel
from app.nlp.pipeline import pipeline
from app.nlp.synonym_mapper import synonym_mapper

router = APIRouter()

class TextRequest(BaseModel):
    text: str
    
class PhraseRequest(BaseModel):
    phrase: str

@router.post("/extract-symptoms")
def extract_symptoms(req: TextRequest):
    return pipeline.process(req.text)
    
@router.post("/normalize-symptom")
def normalize(req: PhraseRequest):
    canonical = synonym_mapper.map_to_canonical(req.phrase)
    return {"phrase": req.phrase, "canonical": canonical}
