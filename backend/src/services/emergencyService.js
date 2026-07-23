const { EMERGENCY_PATTERNS, NEGATION_PREFIXES, checkEmergency } = require('../utils/emergencyKeywords');

const evaluateEmergency = (text) => {
  // Simple check for now, can be expanded to full NLP
  const result = checkEmergency(text);
  
  let instructions = [];
  let emergencyNumbers = ['112 (General)', '108 (Medical Emergency)', '102 (Ambulance)'];
  
  if (result.category === 'cardiac') {
    instructions = ['Call emergency services immediately.', 'Have the person sit down and rest.', 'If prescribed, help them take nitroglycerin.', 'Loosen tight clothing.'];
  } else if (result.category === 'respiratory') {
    instructions = ['Call emergency services immediately.', 'Help the person use their asthma inhaler if they have one.', 'Keep them sitting upright.'];
  } else if (result.category === 'mental_health') {
    emergencyNumbers.push('1800-599-0019 (Mental Health Helpline)');
    instructions = ['Please reach out to a professional or someone you trust.', 'Help is available 24/7.'];
  } else if (result.isEmergency) {
    instructions = ['Seek immediate medical attention.', 'Do not drive yourself to the hospital.'];
  }

  return {
    isEmergency: result.isEmergency,
    severityScore: result.severity,
    category: result.category,
    instructions,
    emergencyNumbers
  };
};

module.exports = {
  evaluateEmergency
};
