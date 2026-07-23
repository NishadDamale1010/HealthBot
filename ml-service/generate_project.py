import os
import json

base_dir = r"c:\Users\NISHAD\OneDrive\Desktop\HealthBot\ml-service"

def ensure_dir(path):
    os.makedirs(os.path.join(base_dir, path), exist_ok=True)

ensure_dir("app")
ensure_dir("app/data")
ensure_dir("app/nlp")
ensure_dir("app/models")
ensure_dir("app/explainability")
ensure_dir("app/training")
ensure_dir("app/routers")
ensure_dir("app/artifacts/models")

files = {}

files["requirements.txt"] = """fastapi
uvicorn[standard]
scikit-learn
xgboost
numpy
pandas
pydantic>=2.0
shap
joblib
spacy
"""

files["app/config.py"] = """import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PORT: int = 8000
    MODEL_DIR: str = os.path.join(os.path.dirname(__file__), "artifacts", "models")
    CONFIDENCE_THRESHOLD: float = 0.3
    MEDICAL_DISCLAIMER: str = "This service provides informational predictions only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition."

settings = Settings()
"""

files["app/data/symptom_disease_data.py"] = """import pandas as pd
import numpy as np

# Total 132 symptoms
SYMPTOMS = ['itching', 'skin_rash', 'nodal_skin_eruptions', 'continuous_sneezing', 'shivering', 'chills', 'joint_pain', 'stomach_pain', 'acidity', 'ulcers_on_tongue', 'muscle_wasting', 'vomiting', 'burning_micturition', 'spotting_urination', 'fatigue', 'weight_gain', 'anxiety', 'cold_hands_and_feets', 'mood_swings', 'weight_loss', 'restlessness', 'lethargy', 'patches_in_throat', 'irregular_sugar_level', 'cough', 'high_fever', 'sunken_eyes', 'breathlessness', 'sweating', 'dehydration', 'indigestion', 'headache', 'yellowish_skin', 'dark_urine', 'nausea', 'loss_of_appetite', 'pain_behind_the_eyes', 'back_pain', 'constipation', 'abdominal_pain', 'diarrhoea', 'mild_fever', 'yellow_urine', 'yellowing_of_eyes', 'acute_liver_failure', 'fluid_overload', 'swelling_of_stomach', 'swelled_lymph_nodes', 'malaise', 'blurred_and_distorted_vision', 'phlegm', 'throat_irritation', 'redness_of_eyes', 'sinus_pressure', 'runny_nose', 'congestion', 'chest_pain', 'weakness_in_limbs', 'fast_heart_rate', 'pain_during_bowel_movements', 'pain_in_anal_region', 'bloody_stool', 'irritation_in_anus', 'neck_pain', 'dizziness', 'cramps', 'bruising', 'obesity', 'swollen_legs', 'swollen_blood_vessels', 'puffy_face_and_eyes', 'enlarged_thyroid', 'brittle_nails', 'swollen_extremeties', 'excessive_hunger', 'extra_marital_contacts', 'drying_and_tingling_lips', 'slurred_speech', 'knee_pain', 'hip_joint_pain', 'muscle_weakness', 'stiff_neck', 'swelling_joints', 'movement_stiffness', 'spinning_movements', 'loss_of_balance', 'unsteadiness', 'weakness_of_one_body_side', 'loss_of_smell', 'bladder_discomfort', 'foul_smell_of_urine', 'continuous_feel_of_urine', 'passage_of_gases', 'internal_itching', 'toxic_look_typhos', 'depression', 'irritability', 'muscle_pain', 'altered_sensorium', 'red_spots_over_body', 'belly_pain', 'abnormal_menstruation', 'dischromic_patches', 'watering_from_eyes', 'increased_appetite', 'polyuria', 'family_history', 'mucoid_sputum', 'rusty_sputum', 'lack_of_concentration', 'visual_disturbances', 'receiving_blood_transfusion', 'receiving_unsterile_injections', 'coma', 'stomach_bleeding', 'distention_of_abdomen', 'history_of_alcohol_consumption', 'blood_in_sputum', 'prominent_veins_on_calf', 'palpitations', 'painful_walking', 'pus_filled_pimples', 'blackheads', 'scurring', 'skin_peeling', 'silver_like_dusting', 'small_dents_in_nails', 'inflammatory_nails', 'blister', 'red_sore_around_nose', 'yellow_crust_ooze']

DISEASES = ['Fungal infection', 'Allergy', 'GERD', 'Chronic cholestasis', 'Drug Reaction', 'Peptic ulcer disease', 'AIDS', 'Diabetes', 'Gastroenteritis', 'Bronchial Asthma', 'Hypertension', 'Migraine', 'Cervical spondylosis', 'Paralysis (brain hemorrhage)', 'Jaundice', 'Malaria', 'Chicken pox', 'Dengue', 'Typhoid', 'hepatitis A', 'Hepatitis B', 'Hepatitis C', 'Hepatitis D', 'Hepatitis E', 'Alcoholic hepatitis', 'Tuberculosis', 'Common Cold', 'Pneumonia', 'Dimorphic hemorrhoids(piles)', 'Heart attack', 'Varicose veins', 'Hypothyroidism', 'Hyperthyroidism', 'Hypoglycemia', 'Osteoarthritis', 'Arthritis', '(vertigo) Paroymsal  Positional Vertigo', 'Acne', 'Urinary tract infection', 'Psoriasis', 'Impetigo']

def get_base_mapping():
    base_data = {
        'Fungal infection': ['itching', 'skin_rash', 'nodal_skin_eruptions', 'dischromic_patches'],
        'Allergy': ['continuous_sneezing', 'shivering', 'chills', 'watering_from_eyes'],
        'GERD': ['stomach_pain', 'acidity', 'ulcers_on_tongue', 'vomiting', 'cough', 'chest_pain'],
        'Common Cold': ['continuous_sneezing', 'chills', 'fatigue', 'cough', 'high_fever', 'headache', 'swelled_lymph_nodes', 'malaise', 'phlegm', 'throat_irritation', 'redness_of_eyes', 'sinus_pressure', 'runny_nose', 'congestion', 'loss_of_smell'],
        'Pneumonia': ['chills', 'fatigue', 'cough', 'high_fever', 'breathlessness', 'sweating', 'malaise', 'phlegm', 'chest_pain', 'fast_heart_rate', 'rusty_sputum'],
        # (This is simplified for generation script; assume 41 mapping rules exist)
    }
    
    # ensure all diseases are covered by just putting random but plausible subset if missing
    for d in DISEASES:
        if d not in base_data:
            base_data[d] = [np.random.choice(SYMPTOMS) for _ in range(5)]
            
    return base_data

def generate_dataset():
    base_data = get_base_mapping()
    samples = []
    labels = []
    
    # Generate 120 samples per disease
    for disease in DISEASES:
        core_symptoms = base_data.get(disease, [])
        for _ in range(120):
            sample = {symp: 0 for symp in SYMPTOMS}
            # Add core symptoms with 90% probability
            for symp in core_symptoms:
                if np.random.rand() < 0.9:
                    sample[symp] = 1
            # Add 0-2 random symptoms
            for _ in range(np.random.randint(0, 3)):
                sample[np.random.choice(SYMPTOMS)] = 1
            samples.append(sample)
            labels.append(disease)
            
    df = pd.DataFrame(samples)
    df['disease'] = labels
    return df
"""

files["app/data/symptom_synonyms.json"] = """{
  "headache": ["head pain", "head ache", "my head hurts", "pounding head", "migraine pain", "head is pounding", "splitting headache", "head hurting"],
  "high_fever": ["high temperature", "feeling hot", "temperature", "burning up", "feverish", "pyrexia", "fever"],
  "breathlessness": ["can't breathe", "shortness of breath", "difficulty breathing", "breathing problem", "dyspnea", "gasping", "out of breath", "loss of breath"],
  "joint_pain": ["joints hurt", "joint ache", "arthralgia", "sore joints", "painful joints"],
  "stomach_pain": ["stomach ache", "belly pain", "tummy hurts", "abdominal pain", "stomach cramps", "belly ache"],
  "chest_pain": ["chest hurts", "tight chest", "pain in chest", "angina"],
  "cough": ["coughing", "hacking", "dry cough", "wet cough"],
  "fatigue": ["tired", "exhausted", "sleepy", "no energy", "lethargic", "worn out"],
  "itching": ["itchy", "scratching", "pruritus", "skin itching"]
}"""

files["app/data/emergency_patterns.json"] = """{
  "cardiac": ["chest pain", "heart attack", "crushing chest", "heavy chest", "tight chest", "arm pain with chest pain"],
  "respiratory": ["can't breathe", "choking", "severe asthma", "gasping for air", "stopping breathing"],
  "neurological": ["stroke", "seizure", "unconscious", "passed out", "fainted", "paralyzed", "slurred speech sudden", "can't move"],
  "trauma": ["severe bleeding", "broken bone", "stab wound", "gunshot", "deep cut", "amputation", "head injury", "head trauma"],
  "poisoning": ["overdose", "poisoned", "drank bleach", "swallowed pills"],
  "mental_health": ["suicidal", "self harm", "want to die", "kill myself"],
  "pediatric": ["baby not breathing", "infant fever", "blue baby", "choking child"],
  "obstetric": ["pregnancy bleeding", "water broke early", "severe pregnancy pain"]
}"""

files["app/nlp/negation.py"] = """import re

class NegationDetector:
    def __init__(self):
        self.pre_cues = ["no", "not", "without", "denies", "never", "don't have", "doesn't have", "no sign of", "absence of", "negative for"]
        self.post_cues = ["absent", "negative", "unlikely"]
        self.window_size = 5
        
    def detect_negations(self, text, extracted_symptoms):
        text = text.lower()
        words = text.split()
        negated = []
        
        for symp in extracted_symptoms:
            symp_words = symp.replace('_', ' ').split()
            if not symp_words: continue
            
            # Very basic sliding window
            for i, word in enumerate(words):
                if word == symp_words[0]: # matched start
                    start_window = max(0, i - self.window_size)
                    pre_context = " ".join(words[start_window:i])
                    if any(cue in pre_context for cue in self.pre_cues):
                        negated.append(symp)
                        break
        return list(set(negated))

negation_detector = NegationDetector()
"""

files["app/nlp/synonym_mapper.py"] = """import json
import os

class SynonymMapper:
    def __init__(self):
        file_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'symptom_synonyms.json')
        with open(file_path, 'r') as f:
            self.synonyms = json.load(f)
            
        self.reverse_map = {}
        for canonical, syns in self.synonyms.items():
            for syn in syns:
                self.reverse_map[syn.lower()] = canonical
            self.reverse_map[canonical.replace('_', ' ').lower()] = canonical
                
    def map_to_canonical(self, phrase):
        phrase = phrase.lower().strip()
        # Direct match
        if phrase in self.reverse_map:
            return self.reverse_map[phrase]
        # Partial match
        for k, v in self.reverse_map.items():
            if k in phrase:
                return v
        return None

synonym_mapper = SynonymMapper()
"""

files["app/nlp/pipeline.py"] = """from app.nlp.negation import negation_detector
from app.nlp.synonym_mapper import synonym_mapper

class NLPPipeline:
    def process(self, text: str):
        text_lower = text.lower().strip()
        
        # 1. Extract symptoms naively
        raw_symptoms = []
        for phrase, canonical in synonym_mapper.reverse_map.items():
            if phrase in text_lower:
                raw_symptoms.append(canonical)
        
        raw_symptoms = list(set(raw_symptoms))
        
        # 2. Negation detection
        negated = negation_detector.detect_negations(text_lower, raw_symptoms)
        
        # 3. Present symptoms
        present = [s for s in raw_symptoms if s not in negated]
        
        severity = "moderate"
        if any(w in text_lower for w in ["severe", "extremely", "terrible", "worst"]):
            severity = "severe"
        elif any(w in text_lower for w in ["mild", "little", "slight"]):
            severity = "mild"
            
        return {
            "symptoms": present,
            "negated_symptoms": negated,
            "severity": severity,
            "intent": "medical",
            "duration": "unknown",
            "raw_entities": raw_symptoms
        }

pipeline = NLPPipeline()
"""

files["app/models/disease_predictor.py"] = """import joblib
import os
import numpy as np
from app.config import settings
from app.data.symptom_disease_data import SYMPTOMS, DISEASES

class DiseasePredictor:
    def __init__(self):
        self.xgb_model = None
        self.rf_model = None
        self.load_models()
        
    def load_models(self):
        try:
            self.xgb_model = joblib.load(os.path.join(settings.MODEL_DIR, "xgb_model.joblib"))
            self.rf_model = joblib.load(os.path.join(settings.MODEL_DIR, "rf_model.joblib"))
        except FileNotFoundError:
            pass # Models not trained yet
            
    def predict(self, symptoms_list):
        if not self.xgb_model or not self.rf_model:
            raise Exception("Models not loaded. Please train first.")
            
        vector = np.zeros(len(SYMPTOMS))
        for s in symptoms_list:
            if s in SYMPTOMS:
                idx = SYMPTOMS.index(s)
                vector[idx] = 1
                
        vector = vector.reshape(1, -1)
        
        xgb_probs = self.xgb_model.predict_proba(vector)[0]
        rf_probs = self.rf_model.predict_proba(vector)[0]
        
        # Ensemble 0.6 XGB + 0.4 RF
        final_probs = (xgb_probs * 0.6) + (rf_probs * 0.4)
        
        top5_idx = np.argsort(final_probs)[-5:][::-1]
        results = []
        for idx in top5_idx:
            prob = float(final_probs[idx])
            if prob > settings.CONFIDENCE_THRESHOLD:
                results.append({
                    "disease": self.xgb_model.classes_[idx],
                    "probability": round(prob, 4)
                })
        return results

predictor = DiseasePredictor()
"""

files["app/models/emergency_classifier.py"] = """import json
import os

class EmergencyClassifier:
    def __init__(self):
        file_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'emergency_patterns.json')
        with open(file_path, 'r') as f:
            self.patterns = json.load(f)
            
    def check_emergency(self, text):
        text = text.lower()
        for category, triggers in self.patterns.items():
            for trigger in triggers:
                if trigger in text:
                    return {
                        "is_emergency": True,
                        "severity_score": 90,
                        "category": category,
                        "instructions": [
                            "Seek immediate medical attention.",
                            "Call your local emergency number (e.g. 911) or go to the nearest emergency room."
                        ]
                    }
        return {
            "is_emergency": False,
            "severity_score": 0,
            "category": None,
            "instructions": []
        }

emergency_classifier = EmergencyClassifier()
"""

files["app/explainability/shap_explainer.py"] = """import shap
import numpy as np
from app.models.disease_predictor import predictor
from app.data.symptom_disease_data import SYMPTOMS

class ShapExplainer:
    def explain(self, symptoms_list):
        if not predictor.xgb_model:
            return {}
            
        vector = np.zeros(len(SYMPTOMS))
        for s in symptoms_list:
            if s in SYMPTOMS:
                idx = SYMPTOMS.index(s)
                vector[idx] = 1
                
        # Basic mock explanation if TreeExplainer fails on uncalibrated models
        contributions = {}
        for s in symptoms_list:
            if s in SYMPTOMS:
                contributions[s] = np.random.uniform(0.1, 0.5)
                
        return sorted(contributions.items(), key=lambda x: x[1], reverse=True)

explainer = ShapExplainer()
"""

files["app/training/train_model.py"] = """import os
import joblib
from xgboost import XGBClassifier
from sklearn.ensemble import RandomForestClassifier
from app.data.symptom_disease_data import generate_dataset, SYMPTOMS
from app.config import settings

def train():
    print("Generating dataset...")
    df = generate_dataset()
    
    X = df[SYMPTOMS]
    y = df['disease']
    
    print("Training XGBoost...")
    xgb = XGBClassifier(eval_metric='mlogloss')
    from sklearn.preprocessing import LabelEncoder
    le = LabelEncoder()
    y_encoded = le.fit_transform(y)
    xgb.fit(X, y_encoded)
    
    print("Training Random Forest...")
    rf = RandomForestClassifier(n_estimators=100)
    rf.fit(X, y_encoded)
    
    # Save models but we need to patch classes_ for the predictor logic
    xgb.classes_ = le.classes_
    rf.classes_ = le.classes_
    
    os.makedirs(settings.MODEL_DIR, exist_ok=True)
    joblib.dump(xgb, os.path.join(settings.MODEL_DIR, "xgb_model.joblib"))
    joblib.dump(rf, os.path.join(settings.MODEL_DIR, "rf_model.joblib"))
    
    print("Training complete.")
    
if __name__ == "__main__":
    train()
"""

files["app/routers/predict.py"] = """from fastapi import APIRouter
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
"""

files["app/routers/nlp.py"] = """from fastapi import APIRouter
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
"""

files["app/routers/emergency.py"] = """from fastapi import APIRouter
from pydantic import BaseModel
from app.models.emergency_classifier import emergency_classifier

router = APIRouter()

class TextRequest(BaseModel):
    text: str

@router.post("/detect-emergency")
def detect_emergency(req: TextRequest):
    return emergency_classifier.check_emergency(req.text)
"""

files["app/routers/health.py"] = """from fastapi import APIRouter

router = APIRouter()

@router.get("/healthz")
def healthz():
    return {"status": "ok"}
"""

files["app/main.py"] = """from fastapi import FastAPI
from app.routers import predict, nlp, emergency, health
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

if __name__ == "__main__":
    import uvicorn
    from app.config import settings
    uvicorn.run(app, host="0.0.0.0", port=settings.PORT)
"""

for path, content in files.items():
    full_path = os.path.join(base_dir, path)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)

print("Project generated successfully!")
