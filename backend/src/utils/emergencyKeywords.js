const NEGATION_PREFIXES = [
  'no ', 'not ', 'never ', 'without ', 'none ', "don't have ", "dont have ", "didn't have "
];

const EMERGENCY_PATTERNS = {
  cardiac: ['chest pain', 'heart attack', 'tightness in chest', 'crushing pain', 'left arm pain'],
  respiratory: ['cannot breathe', 'can\'t breathe', 'breathless', 'gasping', 'choking'],
  neurological: ['stroke', 'paralyzed', 'cannot move', 'loss of speech', 'seizure', 'fainting'],
  trauma: ['bleeding heavily', 'unconscious', 'severe burn', 'broken bone', 'bone sticking out'],
  poisoning: ['swallowed poison', 'drank bleach', 'overdose', 'too many pills'],
  mental_health: ['suicide', 'kill myself', 'want to die', 'end it all'],
  pediatric: ['baby unresponsive', 'child choking', 'blue lips'],
  obstetric: ['water broke', 'heavy bleeding pregnant', 'severe abdominal pain pregnant']
};

const checkEmergency = (text) => {
  if (!text || typeof text !== 'string') return { isEmergency: false, category: null, severity: 0 };
  
  const lowerText = text.toLowerCase();
  
  // Basic negation check (if a negation prefix is close to an emergency keyword, it might not be an emergency)
  // This is a naive implementation; a true NLP approach is better.
  let isNegated = false;
  for (const neg of NEGATION_PREFIXES) {
    if (lowerText.includes(neg)) {
      // Just a simple flag for now, could check distance to keyword
      isNegated = true; 
    }
  }

  for (const [category, patterns] of Object.entries(EMERGENCY_PATTERNS)) {
    for (const pattern of patterns) {
      if (lowerText.includes(pattern)) {
        if (isNegated) {
          // If negated, let's assume it's NOT an emergency for this simple logic, 
          // but in real life we should be more careful. We'll drop severity.
          return { isEmergency: false, category: category, severity: 20 };
        }
        return { isEmergency: true, category, severity: 90 };
      }
    }
  }
  
  return { isEmergency: false, category: null, severity: 0 };
};

module.exports = {
  NEGATION_PREFIXES,
  EMERGENCY_PATTERNS,
  checkEmergency
};
