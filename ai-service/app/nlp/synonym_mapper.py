import json
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
