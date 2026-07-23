import re

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
