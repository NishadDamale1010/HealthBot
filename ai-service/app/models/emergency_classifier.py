import json
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
