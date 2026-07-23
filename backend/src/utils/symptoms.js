
const diseases = [
  {
    "name": "Flu",
    "symptoms": [
      "sore throat",
      "dizziness",
      "sweating",
      "dry skin",
      "hair loss"
    ]
  },
  {
    "name": "Covid-19",
    "symptoms": [
      "fever",
      "impulsivity",
      "back pain",
      "yawning",
      "wheezing"
    ]
  },
  {
    "name": "Diabetes",
    "symptoms": [
      "weight loss",
      "hemoptysis",
      "diarrhea",
      "indigestion",
      "tingling"
    ]
  },
  {
    "name": "Food Poisoning",
    "symptoms": [
      "insomnia",
      "stridor",
      "hallucinations",
      "swollen lymph nodes",
      "facial drooping"
    ]
  },
  {
    "name": "Migraine",
    "symptoms": [
      "loss of smell",
      "dizziness",
      "loss of taste",
      "insomnia",
      "delusions"
    ]
  },
  {
    "name": "Asthma",
    "symptoms": [
      "neck pain",
      "chills",
      "hearing loss",
      "eye pain",
      "hallucinations"
    ]
  },
  {
    "name": "Hypertension",
    "symptoms": [
      "slurred speech",
      "blood in urine",
      "wheezing",
      "bloating",
      "memory loss"
    ]
  },
  {
    "name": "Tuberculosis",
    "symptoms": [
      "painful urination",
      "fever",
      "constipation",
      "swollen lymph nodes",
      "thirst"
    ]
  },
  {
    "name": "Pneumonia",
    "symptoms": [
      "headache",
      "difficulty swallowing",
      "loss of taste",
      "spider angiomas",
      "clubbing"
    ]
  },
  {
    "name": "Malaria",
    "symptoms": [
      "stridor",
      "restless legs",
      "clubbing",
      "cyanosis",
      "asterixis"
    ]
  },
  {
    "name": "Dengue",
    "symptoms": [
      "dizziness",
      "weight loss",
      "diarrhea",
      "bloating",
      "tingling"
    ]
  },
  {
    "name": "Typhoid",
    "symptoms": [
      "stridor",
      "vertigo",
      "ascites",
      "asterixis",
      "thickened skin"
    ]
  },
  {
    "name": "Cholera",
    "symptoms": [
      "constipation",
      "indigestion",
      "stiffness",
      "sneezing",
      "loss of appetite"
    ]
  },
  {
    "name": "Chickenpox",
    "symptoms": [
      "tingling",
      "nausea",
      "slow growth",
      "delusions",
      "bleeding gums"
    ]
  },
  {
    "name": "Measles",
    "symptoms": [
      "memory loss",
      "confusion",
      "earache",
      "bleeding",
      "weight gain"
    ]
  },
  {
    "name": "Arthritis",
    "symptoms": [
      "vomiting",
      "dry skin",
      "hearing loss",
      "yawning",
      "jaundice"
    ]
  },
  {
    "name": "Osteoporosis",
    "symptoms": [
      "hives",
      "nail changes",
      "clubbing",
      "sneezing",
      "hair loss"
    ]
  },
  {
    "name": "Anemia",
    "symptoms": [
      "sore throat",
      "fever",
      "fatigue",
      "weight loss",
      "rash"
    ]
  },
  {
    "name": "Leukemia",
    "symptoms": [
      "irritability",
      "balance problems",
      "delayed wound healing",
      "speech difficulty",
      "fainting"
    ]
  },
  {
    "name": "Lymphoma",
    "symptoms": [
      "muscle cramps",
      "sleep apnea",
      "tremor",
      "arm weakness",
      "speech difficulty"
    ]
  },
  {
    "name": "Heart Attack",
    "symptoms": [
      "eye pain",
      "diarrhea",
      "stridor",
      "confusion",
      "insomnia"
    ]
  },
  {
    "name": "Stroke",
    "symptoms": [
      "irritability",
      "aura",
      "hyperactivity",
      "poor concentration",
      "snoring"
    ]
  },
  {
    "name": "Alzheimers",
    "symptoms": [
      "urination",
      "palpitations",
      "heat intolerance",
      "tremor",
      "indigestion"
    ]
  },
  {
    "name": "Parkinsons",
    "symptoms": [
      "weight gain",
      "diarrhea",
      "breathing",
      "cough",
      "vaginal discharge"
    ]
  },
  {
    "name": "Epilepsy",
    "symptoms": [
      "depression",
      "hives",
      "constipation",
      "urination",
      "heartburn"
    ]
  },
  {
    "name": "Schizophrenia",
    "symptoms": [
      "chills",
      "hearing loss",
      "constipation",
      "back pain",
      "wheezing"
    ]
  },
  {
    "name": "Bipolar Disorder",
    "symptoms": [
      "hot flashes",
      "snoring",
      "hiccups",
      "tremor",
      "suicidal thoughts"
    ]
  },
  {
    "name": "Depression",
    "symptoms": [
      "bloating",
      "muscle spasms",
      "sore throat",
      "muscle pain",
      "abdominal pain"
    ]
  },
  {
    "name": "Anxiety",
    "symptoms": [
      "painful urination",
      "headache",
      "hearing loss",
      "balance problems",
      "vaginal dryness"
    ]
  },
  {
    "name": "OCD",
    "symptoms": [
      "tremor",
      "joint pain",
      "abdominal pain",
      "hearing loss",
      "neck pain"
    ]
  },
  {
    "name": "Gastritis",
    "symptoms": [
      "muscle cramps",
      "heartburn",
      "vomiting",
      "fever",
      "rash"
    ]
  },
  {
    "name": "Peptic Ulcer",
    "symptoms": [
      "dry eyes",
      "arm weakness",
      "jaundice",
      "swollen lymph nodes",
      "hallucinations"
    ]
  },
  {
    "name": "Appendicitis",
    "symptoms": [
      "ascites",
      "delusions",
      "arm weakness",
      "suicidal thoughts",
      "clay colored stools"
    ]
  },
  {
    "name": "Hepatitis",
    "symptoms": [
      "weight loss",
      "bleeding gums",
      "rash",
      "thirst",
      "dizziness"
    ]
  },
  {
    "name": "Cirrhosis",
    "symptoms": [
      "swelling",
      "weakness",
      "chest pain",
      "sound sensitivity",
      "numbness"
    ]
  },
  {
    "name": "Kidney Stones",
    "symptoms": [
      "bulging eyes",
      "indigestion",
      "back pain",
      "muscle pain",
      "hair loss"
    ]
  },
  {
    "name": "UTI",
    "symptoms": [
      "cyanosis",
      "blood in urine",
      "hair loss",
      "headache",
      "vertigo"
    ]
  },
  {
    "name": "Endometriosis",
    "symptoms": [
      "loss of libido",
      "sound sensitivity",
      "frequent urination",
      "fatigue",
      "sore throat"
    ]
  },
  {
    "name": "PCOS",
    "symptoms": [
      "difficulty swallowing",
      "melena",
      "jaundice",
      "sleep apnea",
      "dark urine"
    ]
  },
  {
    "name": "Hypothyroidism",
    "symptoms": [
      "hematemesis",
      "loss of smell",
      "loss of libido",
      "sleep apnea",
      "weight gain"
    ]
  },
  {
    "name": "Hyperthyroidism",
    "symptoms": [
      "slurred speech",
      "delayed wound healing",
      "slow growth",
      "fainting",
      "weakness"
    ]
  }
];
const symptomMap = {
  "fever": [
    "fever",
    "fever",
    "fevering",
    "fevers"
  ],
  "cough": [
    "cough",
    "cough",
    "coughing",
    "coughs"
  ],
  "headache": [
    "headache",
    "headache",
    "headacheing",
    "headaches"
  ],
  "vomiting": [
    "vomiting",
    "vomiting",
    "vomitinging",
    "vomitings"
  ],
  "dizziness": [
    "dizziness",
    "dizziness",
    "dizzinessing",
    "dizzinesss"
  ],
  "fatigue": [
    "fatigue",
    "fatigue",
    "fatigueing",
    "fatigues"
  ],
  "thirst": [
    "thirst",
    "thirst",
    "thirsting",
    "thirsts"
  ],
  "urination": [
    "urination",
    "urination",
    "urinationing",
    "urinations"
  ],
  "breathing": [
    "breathing",
    "breathing",
    "breathinging",
    "breathings"
  ],
  "loss of taste": [
    "loss of taste",
    "lossoftaste",
    "loss of tasteing",
    "loss of tastes"
  ],
  "chest pain": [
    "chest pain",
    "chestpain",
    "chest paining",
    "chest pains"
  ],
  "nausea": [
    "nausea",
    "nausea",
    "nauseaing",
    "nauseas"
  ],
  "muscle pain": [
    "muscle pain",
    "musclepain",
    "muscle paining",
    "muscle pains"
  ],
  "chills": [
    "chills",
    "chills",
    "chillsing",
    "chillss"
  ],
  "sore throat": [
    "sore throat",
    "sorethroat",
    "sore throating",
    "sore throats"
  ],
  "runny nose": [
    "runny nose",
    "runnynose",
    "runny noseing",
    "runny noses"
  ],
  "diarrhea": [
    "diarrhea",
    "diarrhea",
    "diarrheaing",
    "diarrheas"
  ],
  "sweating": [
    "sweating",
    "sweating",
    "sweatinging",
    "sweatings"
  ],
  "weight loss": [
    "weight loss",
    "weightloss",
    "weight lossing",
    "weight losss"
  ],
  "rash": [
    "rash",
    "rash",
    "rashing",
    "rashs"
  ],
  "joint pain": [
    "joint pain",
    "jointpain",
    "joint paining",
    "joint pains"
  ],
  "stiffness": [
    "stiffness",
    "stiffness",
    "stiffnessing",
    "stiffnesss"
  ],
  "weakness": [
    "weakness",
    "weakness",
    "weaknessing",
    "weaknesss"
  ],
  "abdominal pain": [
    "abdominal pain",
    "abdominalpain",
    "abdominal paining",
    "abdominal pains"
  ],
  "constipation": [
    "constipation",
    "constipation",
    "constipationing",
    "constipations"
  ],
  "bloating": [
    "bloating",
    "bloating",
    "bloatinging",
    "bloatings"
  ],
  "loss of appetite": [
    "loss of appetite",
    "lossofappetite",
    "loss of appetiteing",
    "loss of appetites"
  ],
  "indigestion": [
    "indigestion",
    "indigestion",
    "indigestioning",
    "indigestions"
  ],
  "heartburn": [
    "heartburn",
    "heartburn",
    "heartburning",
    "heartburns"
  ],
  "shortness of breath": [
    "shortness of breath",
    "shortnessofbreath",
    "shortness of breathing",
    "shortness of breaths"
  ],
  "wheezing": [
    "wheezing",
    "wheezing",
    "wheezinging",
    "wheezings"
  ],
  "palpitations": [
    "palpitations",
    "palpitations",
    "palpitationsing",
    "palpitationss"
  ],
  "swelling": [
    "swelling",
    "swelling",
    "swellinging",
    "swellings"
  ],
  "numbness": [
    "numbness",
    "numbness",
    "numbnessing",
    "numbnesss"
  ],
  "tingling": [
    "tingling",
    "tingling",
    "tinglinging",
    "tinglings"
  ],
  "confusion": [
    "confusion",
    "confusion",
    "confusioning",
    "confusions"
  ],
  "memory loss": [
    "memory loss",
    "memoryloss",
    "memory lossing",
    "memory losss"
  ],
  "vision changes": [
    "vision changes",
    "visionchanges",
    "vision changesing",
    "vision changess"
  ],
  "eye pain": [
    "eye pain",
    "eyepain",
    "eye paining",
    "eye pains"
  ],
  "red eyes": [
    "red eyes",
    "redeyes",
    "red eyesing",
    "red eyess"
  ],
  "earache": [
    "earache",
    "earache",
    "earacheing",
    "earaches"
  ],
  "hearing loss": [
    "hearing loss",
    "hearingloss",
    "hearing lossing",
    "hearing losss"
  ],
  "tinnitus": [
    "tinnitus",
    "tinnitus",
    "tinnitusing",
    "tinnituss"
  ],
  "nasal congestion": [
    "nasal congestion",
    "nasalcongestion",
    "nasal congestioning",
    "nasal congestions"
  ],
  "sneezing": [
    "sneezing",
    "sneezing",
    "sneezinging",
    "sneezings"
  ],
  "hoarseness": [
    "hoarseness",
    "hoarseness",
    "hoarsenessing",
    "hoarsenesss"
  ],
  "difficulty swallowing": [
    "difficulty swallowing",
    "difficultyswallowing",
    "difficulty swallowinging",
    "difficulty swallowings"
  ],
  "mouth sores": [
    "mouth sores",
    "mouthsores",
    "mouth soresing",
    "mouth soress"
  ],
  "bleeding gums": [
    "bleeding gums",
    "bleedinggums",
    "bleeding gumsing",
    "bleeding gumss"
  ],
  "toothache": [
    "toothache",
    "toothache",
    "toothacheing",
    "toothaches"
  ],
  "neck pain": [
    "neck pain",
    "neckpain",
    "neck paining",
    "neck pains"
  ],
  "back pain": [
    "back pain",
    "backpain",
    "back paining",
    "back pains"
  ],
  "pelvic pain": [
    "pelvic pain",
    "pelvicpain",
    "pelvic paining",
    "pelvic pains"
  ],
  "painful urination": [
    "painful urination",
    "painfulurination",
    "painful urinationing",
    "painful urinations"
  ],
  "blood in urine": [
    "blood in urine",
    "bloodinurine",
    "blood in urineing",
    "blood in urines"
  ],
  "frequent urination": [
    "frequent urination",
    "frequenturination",
    "frequent urinationing",
    "frequent urinations"
  ],
  "incontinence": [
    "incontinence",
    "incontinence",
    "incontinenceing",
    "incontinences"
  ],
  "vaginal discharge": [
    "vaginal discharge",
    "vaginaldischarge",
    "vaginal dischargeing",
    "vaginal discharges"
  ],
  "irregular periods": [
    "irregular periods",
    "irregularperiods",
    "irregular periodsing",
    "irregular periodss"
  ],
  "erectile dysfunction": [
    "erectile dysfunction",
    "erectiledysfunction",
    "erectile dysfunctioning",
    "erectile dysfunctions"
  ],
  "itching": [
    "itching",
    "itching",
    "itchinging",
    "itchings"
  ],
  "dry skin": [
    "dry skin",
    "dryskin",
    "dry skining",
    "dry skins"
  ],
  "hives": [
    "hives",
    "hives",
    "hivesing",
    "hivess"
  ],
  "bruising": [
    "bruising",
    "bruising",
    "bruisinging",
    "bruisings"
  ],
  "hair loss": [
    "hair loss",
    "hairloss",
    "hair lossing",
    "hair losss"
  ],
  "nail changes": [
    "nail changes",
    "nailchanges",
    "nail changesing",
    "nail changess"
  ],
  "cold intolerance": [
    "cold intolerance",
    "coldintolerance",
    "cold intoleranceing",
    "cold intolerances"
  ],
  "heat intolerance": [
    "heat intolerance",
    "heatintolerance",
    "heat intoleranceing",
    "heat intolerances"
  ],
  "tremor": [
    "tremor",
    "tremor",
    "tremoring",
    "tremors"
  ],
  "seizures": [
    "seizures",
    "seizures",
    "seizuresing",
    "seizuress"
  ],
  "fainting": [
    "fainting",
    "fainting",
    "faintinging",
    "faintings"
  ],
  "snoring": [
    "snoring",
    "snoring",
    "snoringing",
    "snorings"
  ],
  "sleep apnea": [
    "sleep apnea",
    "sleepapnea",
    "sleep apneaing",
    "sleep apneas"
  ],
  "insomnia": [
    "insomnia",
    "insomnia",
    "insomniaing",
    "insomnias"
  ],
  "night sweats": [
    "night sweats",
    "nightsweats",
    "night sweatsing",
    "night sweatss"
  ],
  "mood swings": [
    "mood swings",
    "moodswings",
    "mood swingsing",
    "mood swingss"
  ],
  "anxiety": [
    "anxiety",
    "anxiety",
    "anxietying",
    "anxietys"
  ],
  "depression": [
    "depression",
    "depression",
    "depressioning",
    "depressions"
  ],
  "irritability": [
    "irritability",
    "irritability",
    "irritabilitying",
    "irritabilitys"
  ],
  "hallucinations": [
    "hallucinations",
    "hallucinations",
    "hallucinationsing",
    "hallucinationss"
  ],
  "delusions": [
    "delusions",
    "delusions",
    "delusionsing",
    "delusionss"
  ],
  "suicidal thoughts": [
    "suicidal thoughts",
    "suicidalthoughts",
    "suicidal thoughtsing",
    "suicidal thoughtss"
  ],
  "poor concentration": [
    "poor concentration",
    "poorconcentration",
    "poor concentrationing",
    "poor concentrations"
  ],
  "hyperactivity": [
    "hyperactivity",
    "hyperactivity",
    "hyperactivitying",
    "hyperactivitys"
  ],
  "impulsivity": [
    "impulsivity",
    "impulsivity",
    "impulsivitying",
    "impulsivitys"
  ],
  "speech difficulty": [
    "speech difficulty",
    "speechdifficulty",
    "speech difficultying",
    "speech difficultys"
  ],
  "slurred speech": [
    "slurred speech",
    "slurredspeech",
    "slurred speeching",
    "slurred speechs"
  ],
  "facial drooping": [
    "facial drooping",
    "facialdrooping",
    "facial droopinging",
    "facial droopings"
  ],
  "arm weakness": [
    "arm weakness",
    "armweakness",
    "arm weaknessing",
    "arm weaknesss"
  ],
  "leg weakness": [
    "leg weakness",
    "legweakness",
    "leg weaknessing",
    "leg weaknesss"
  ],
  "balance problems": [
    "balance problems",
    "balanceproblems",
    "balance problemsing",
    "balance problemss"
  ],
  "vertigo": [
    "vertigo",
    "vertigo",
    "vertigoing",
    "vertigos"
  ],
  "loss of smell": [
    "loss of smell",
    "lossofsmell",
    "loss of smelling",
    "loss of smells"
  ],
  "bleeding": [
    "bleeding",
    "bleeding",
    "bleedinging",
    "bleedings"
  ],
  "easy bleeding": [
    "easy bleeding",
    "easybleeding",
    "easy bleedinging",
    "easy bleedings"
  ],
  "delayed wound healing": [
    "delayed wound healing",
    "delayedwoundhealing",
    "delayed wound healinging",
    "delayed wound healings"
  ],
  "swollen lymph nodes": [
    "swollen lymph nodes",
    "swollenlymphnodes",
    "swollen lymph nodesing",
    "swollen lymph nodess"
  ],
  "pale skin": [
    "pale skin",
    "paleskin",
    "pale skining",
    "pale skins"
  ],
  "jaundice": [
    "jaundice",
    "jaundice",
    "jaundiceing",
    "jaundices"
  ],
  "dark urine": [
    "dark urine",
    "darkurine",
    "dark urineing",
    "dark urines"
  ],
  "clay colored stools": [
    "clay colored stools",
    "claycoloredstools",
    "clay colored stoolsing",
    "clay colored stoolss"
  ],
  "hiccups": [
    "hiccups",
    "hiccups",
    "hiccupsing",
    "hiccupss"
  ],
  "yawning": [
    "yawning",
    "yawning",
    "yawninging",
    "yawnings"
  ],
  "dry eyes": [
    "dry eyes",
    "dryeyes",
    "dry eyesing",
    "dry eyess"
  ],
  "tearing": [
    "tearing",
    "tearing",
    "tearinging",
    "tearings"
  ],
  "light sensitivity": [
    "light sensitivity",
    "lightsensitivity",
    "light sensitivitying",
    "light sensitivitys"
  ],
  "sound sensitivity": [
    "sound sensitivity",
    "soundsensitivity",
    "sound sensitivitying",
    "sound sensitivitys"
  ],
  "aura": [
    "aura",
    "aura",
    "auraing",
    "auras"
  ],
  "muscle cramps": [
    "muscle cramps",
    "musclecramps",
    "muscle crampsing",
    "muscle crampss"
  ],
  "muscle spasms": [
    "muscle spasms",
    "musclespasms",
    "muscle spasmsing",
    "muscle spasmss"
  ],
  "restless legs": [
    "restless legs",
    "restlesslegs",
    "restless legsing",
    "restless legss"
  ],
  "frequent infections": [
    "frequent infections",
    "frequentinfections",
    "frequent infectionsing",
    "frequent infectionss"
  ],
  "slow growth": [
    "slow growth",
    "slowgrowth",
    "slow growthing",
    "slow growths"
  ],
  "delayed puberty": [
    "delayed puberty",
    "delayedpuberty",
    "delayed pubertying",
    "delayed pubertys"
  ],
  "hot flashes": [
    "hot flashes",
    "hotflashes",
    "hot flashesing",
    "hot flashess"
  ],
  "vaginal dryness": [
    "vaginal dryness",
    "vaginaldryness",
    "vaginal drynessing",
    "vaginal drynesss"
  ],
  "painful intercourse": [
    "painful intercourse",
    "painfulintercourse",
    "painful intercourseing",
    "painful intercourses"
  ],
  "loss of libido": [
    "loss of libido",
    "lossoflibido",
    "loss of libidoing",
    "loss of libidos"
  ],
  "abnormal hair growth": [
    "abnormal hair growth",
    "abnormalhairgrowth",
    "abnormal hair growthing",
    "abnormal hair growths"
  ],
  "weight gain": [
    "weight gain",
    "weightgain",
    "weight gaining",
    "weight gains"
  ],
  "goiter": [
    "goiter",
    "goiter",
    "goitering",
    "goiters"
  ],
  "bulging eyes": [
    "bulging eyes",
    "bulgingeyes",
    "bulging eyesing",
    "bulging eyess"
  ],
  "thickened skin": [
    "thickened skin",
    "thickenedskin",
    "thickened skining",
    "thickened skins"
  ],
  "clubbing": [
    "clubbing",
    "clubbing",
    "clubbinging",
    "clubbings"
  ],
  "spider angiomas": [
    "spider angiomas",
    "spiderangiomas",
    "spider angiomasing",
    "spider angiomass"
  ],
  "palmar erythema": [
    "palmar erythema",
    "palmarerythema",
    "palmar erythemaing",
    "palmar erythemas"
  ],
  "asterixis": [
    "asterixis",
    "asterixis",
    "asterixising",
    "asterixiss"
  ],
  "ascites": [
    "ascites",
    "ascites",
    "ascitesing",
    "ascitess"
  ],
  "edema": [
    "edema",
    "edema",
    "edemaing",
    "edemas"
  ],
  "cyanosis": [
    "cyanosis",
    "cyanosis",
    "cyanosising",
    "cyanosiss"
  ],
  "stridor": [
    "stridor",
    "stridor",
    "stridoring",
    "stridors"
  ],
  "hemoptysis": [
    "hemoptysis",
    "hemoptysis",
    "hemoptysising",
    "hemoptysiss"
  ],
  "hematemesis": [
    "hematemesis",
    "hematemesis",
    "hematemesising",
    "hematemesiss"
  ],
  "melena": [
    "melena",
    "melena",
    "melenaing",
    "melenas"
  ],
  "hematochezia": [
    "hematochezia",
    "hematochezia",
    "hematocheziaing",
    "hematochezias"
  ]
};
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
