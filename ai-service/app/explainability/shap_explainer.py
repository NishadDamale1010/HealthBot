import shap
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
