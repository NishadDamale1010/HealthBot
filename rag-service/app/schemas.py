from pydantic import BaseModel
from typing import List, Optional

class QueryRequest(BaseModel):
    query: str
    top_k: int = 3

class SourceDoc(BaseModel):
    content: str
    metadata: dict
    score: float

class QueryResponse(BaseModel):
    query: str
    context: str
    sources: List[SourceDoc]
    disclaimer: str = "⚠️ **Disclaimer:** This information is for educational purposes only. Always consult a healthcare professional for medical advice."

class ItemResponse(BaseModel):
    name: str
    content: str
    disclaimer: str = "⚠️ **Disclaimer:** This information is for educational purposes only. Always consult a healthcare professional for medical advice."
