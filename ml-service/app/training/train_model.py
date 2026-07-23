import os
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
