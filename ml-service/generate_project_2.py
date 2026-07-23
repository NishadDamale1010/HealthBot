import os

base_dir = r"c:\Users\NISHAD\OneDrive\Desktop\HealthBot\ml-service"

files = {}

files["app/models/question_generator.py"] = """import numpy as np
from app.data.symptom_disease_data import SYMPTOMS

class QuestionGenerator:
    def suggest_questions(self, known_symptoms, num_questions=3):
        # Basic information gain mockup
        # In a real scenario, this would use the probabilities of diseases
        # and calculate entropy for remaining symptoms
        
        remaining = [s for s in SYMPTOMS if s not in known_symptoms]
        # Just return random symptoms to ask about for now as a baseline
        selected = np.random.choice(remaining, min(num_questions, len(remaining)), replace=False)
        
        questions = []
        for s in selected:
            friendly_name = s.replace('_', ' ')
            questions.append(f"Are you experiencing any {friendly_name}?")
            
        return questions

question_generator = QuestionGenerator()
"""

files["app/training/preprocess.py"] = """import pandas as pd

def encode_labels(df, label_col):
    from sklearn.preprocessing import LabelEncoder
    le = LabelEncoder()
    df[label_col + '_encoded'] = le.fit_transform(df[label_col])
    return df, le
"""

files["app/routers/questions.py"] = """from fastapi import APIRouter
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
"""

for path, content in files.items():
    full_path = os.path.join(base_dir, path)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)

print("Additional files generated successfully!")
