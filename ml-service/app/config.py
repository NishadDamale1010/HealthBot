import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PORT: int = 8000
    MODEL_DIR: str = os.path.join(os.path.dirname(__file__), "artifacts", "models")
    CONFIDENCE_THRESHOLD: float = 0.3
    MEDICAL_DISCLAIMER: str = "This service provides informational predictions only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition."

settings = Settings()
