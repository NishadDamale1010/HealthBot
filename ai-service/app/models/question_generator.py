import numpy as np
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
