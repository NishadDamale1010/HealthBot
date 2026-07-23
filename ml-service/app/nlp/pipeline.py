from app.nlp.negation import negation_detector
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
