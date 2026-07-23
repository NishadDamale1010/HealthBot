import joblib
import os
import numpy as np
from app.config import settings
from app.data.symptom_disease_data import SYMPTOMS, DISEASES

class DiseasePredictor:
    def __init__(self):
        self.xgb_model = None
        self.rf_model = None
        # Lazy loading: models are loaded in main.py background thread
        
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
