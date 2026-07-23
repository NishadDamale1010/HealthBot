const fs = require('fs');
const symptoms_list = ['fever', 'cough', 'headache', 'vomiting', 'dizziness', 'fatigue', 'thirst', 'urination', 'breathing', 'loss of taste', 'chest pain', 'nausea', 'muscle pain', 'chills', 'sore throat', 'runny nose', 'diarrhea', 'sweating', 'weight loss', 'rash', 'joint pain', 'stiffness', 'weakness', 'abdominal pain', 'constipation', 'bloating', 'loss of appetite', 'indigestion', 'heartburn', 'shortness of breath', 'wheezing', 'palpitations', 'swelling', 'numbness', 'tingling', 'confusion', 'memory loss', 'vision changes', 'eye pain', 'red eyes', 'earache', 'hearing loss', 'tinnitus', 'nasal congestion', 'sneezing', 'hoarseness', 'difficulty swallowing', 'mouth sores', 'bleeding gums', 'toothache', 'neck pain', 'back pain', 'pelvic pain', 'painful urination', 'blood in urine', 'frequent urination', 'incontinence', 'vaginal discharge', 'irregular periods', 'erectile dysfunction', 'itching', 'dry skin', 'hives', 'bruising', 'hair loss', 'nail changes', 'cold intolerance', 'heat intolerance', 'tremor', 'seizures', 'fainting', 'snoring', 'sleep apnea', 'insomnia', 'night sweats', 'mood swings', 'anxiety', 'depression', 'irritability', 'hallucinations', 'delusions', 'suicidal thoughts', 'poor concentration', 'hyperactivity', 'impulsivity', 'speech difficulty', 'slurred speech', 'facial drooping', 'arm weakness', 'leg weakness', 'balance problems', 'vertigo', 'loss of smell', 'bleeding', 'easy bleeding', 'delayed wound healing', 'swollen lymph nodes', 'pale skin', 'jaundice', 'dark urine', 'clay colored stools', 'hiccups', 'yawning', 'dry eyes', 'tearing', 'light sensitivity', 'sound sensitivity', 'aura', 'muscle cramps', 'muscle spasms', 'restless legs', 'frequent infections', 'slow growth', 'delayed puberty', 'hot flashes', 'vaginal dryness', 'painful intercourse', 'loss of libido', 'abnormal hair growth', 'weight gain', 'goiter', 'bulging eyes', 'thickened skin', 'clubbing', 'spider angiomas', 'palmar erythema', 'asterixis', 'ascites', 'edema', 'cyanosis', 'stridor', 'hemoptysis', 'hematemesis', 'melena', 'hematochezia'];
const diseases_list = ['Flu', 'Covid-19', 'Diabetes', 'Food Poisoning', 'Migraine', 'Asthma', 'Hypertension', 'Tuberculosis', 'Pneumonia', 'Malaria', 'Dengue', 'Typhoid', 'Cholera', 'Chickenpox', 'Measles', 'Arthritis', 'Osteoporosis', 'Anemia', 'Leukemia', 'Lymphoma', 'Heart Attack', 'Stroke', 'Alzheimers', 'Parkinsons', 'Epilepsy', 'Schizophrenia', 'Bipolar Disorder', 'Depression', 'Anxiety', 'OCD', 'Gastritis', 'Peptic Ulcer', 'Appendicitis', 'Hepatitis', 'Cirrhosis', 'Kidney Stones', 'UTI', 'Endometriosis', 'PCOS', 'Hypothyroidism', 'Hyperthyroidism'];
const diseases = diseases_list.map(d => ({ name: d, symptoms: symptoms_list.slice().sort(() => 0.5 - Math.random()).slice(0, 5) }));
const symptom_map = {};
symptoms_list.forEach(s => symptom_map[s] = [s, s.replace(/ /g, ''), s + 'ing', s + 's']);
const out = `
const diseases = ${JSON.stringify(diseases, null, 2)};
const symptomMap = ${JSON.stringify(symptom_map, null, 2)};
function extractSymptoms(message) {
  const found = [];
  Object.keys(symptomMap).forEach((key) => {
    symptomMap[key].forEach((variant) => {
      if (message.includes(variant) && !found.includes(key)) { found.push(key); }
    });
  });
  return found;
}
function predictDisease(message) {
  const userSymptoms = extractSymptoms(message.toLowerCase());
  if (userSymptoms.length === 0) return { disease: 'Unknown', risk: 'Low', confidence: 0, symptomsDetected: [] };
  let bestMatch = null;
  let maxScore = 0;
  diseases.forEach((disease) => {
    let matchCount = disease.symptoms.filter((s) => userSymptoms.includes(s)).length;
    let score = matchCount / disease.symptoms.length;
    if (score > maxScore) { maxScore = score; bestMatch = disease; }
  });
  let risk = 'Low';
  if (maxScore >= 0.5) risk = 'Medium';
  if (maxScore >= 0.75) risk = 'High';
  return { disease: bestMatch ? bestMatch.name : 'Unknown', risk, confidence: maxScore.toFixed(2), symptomsDetected: userSymptoms };
}
function predictDiseaseEnhanced(symptoms) {
  const scored = diseases.map(disease => {
    const matchCount = disease.symptoms.filter(s => symptoms.includes(s)).length;
    const confidence = (matchCount / disease.symptoms.length) || 0;
    return { disease: disease.name, confidence, riskLevel: confidence > 0.7 ? 'High' : confidence > 0.4 ? 'Medium' : 'Low' };
  });
  scored.sort((a,b) => b.confidence - a.confidence);
  return scored.slice(0, 5);
}
function getSymptomList() { return Object.keys(symptomMap); }
function mapSynonym(text) {
  const lower = text.toLowerCase();
  for (const [symptom, variants] of Object.entries(symptomMap)) {
    if (variants.some(v => lower.includes(v))) return symptom;
  }
  return null;
}
module.exports = { predictDisease, predictDiseaseEnhanced, getSymptomList, mapSynonym, extractSymptoms };
`;
fs.writeFileSync('src/utils/symptoms.js', out);
