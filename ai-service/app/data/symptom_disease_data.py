"""
Comprehensive Symptom-Disease Dataset Generator
Based on medical literature from WHO, CDC, NIH, and Harrison's Principles of Internal Medicine.

132 symptoms × 41 diseases with medically-accurate mappings.
Generates ~120 training samples per disease with realistic variation.
"""
import numpy as np
import pandas as pd

# ─────────────────────────────────────────────
# All 132 symptoms (feature names)
# ─────────────────────────────────────────────
SYMPTOMS = [
    'itching', 'skin_rash', 'nodal_skin_eruptions', 'continuous_sneezing',
    'shivering', 'chills', 'joint_pain', 'stomach_pain', 'acidity',
    'ulcers_on_tongue', 'muscle_wasting', 'vomiting', 'burning_micturition',
    'spotting_urination', 'fatigue', 'weight_gain', 'anxiety',
    'cold_hands_and_feets', 'mood_swings', 'weight_loss', 'restlessness',
    'lethargy', 'patches_in_throat', 'irregular_sugar_level', 'cough',
    'high_fever', 'sunken_eyes', 'breathlessness', 'sweating', 'dehydration',
    'indigestion', 'headache', 'yellowish_skin', 'dark_urine', 'nausea',
    'loss_of_appetite', 'pain_behind_the_eyes', 'back_pain', 'constipation',
    'abdominal_pain', 'diarrhoea', 'mild_fever', 'yellow_urine',
    'yellowing_of_eyes', 'acute_liver_failure', 'fluid_overload',
    'swelling_of_stomach', 'swelled_lymph_nodes', 'malaise',
    'blurred_and_distorted_vision', 'phlegm', 'throat_irritation',
    'redness_of_eyes', 'sinus_pressure', 'runny_nose', 'congestion',
    'chest_pain', 'weakness_in_limbs', 'fast_heart_rate',
    'pain_during_bowel_movements', 'pain_in_anal_region', 'bloody_stool',
    'irritation_in_anus', 'neck_pain', 'dizziness', 'cramps', 'bruising',
    'obesity', 'swollen_legs', 'swollen_blood_vessels', 'puffy_face_and_eyes',
    'enlarged_thyroid', 'brittle_nails', 'swollen_extremeties',
    'excessive_hunger', 'extra_marital_contacts', 'drying_and_tingling_lips',
    'slurred_speech', 'knee_pain', 'hip_joint_pain', 'muscle_weakness',
    'stiff_neck', 'swelling_joints', 'movement_stiffness',
    'spinning_movements', 'loss_of_balance', 'unsteadiness',
    'weakness_of_one_body_side', 'loss_of_smell', 'bladder_discomfort',
    'foul_smell_of_urine', 'continuous_feel_of_urine', 'passage_of_gases',
    'internal_itching', 'toxic_look_typhos', 'depression', 'irritability',
    'muscle_pain', 'altered_sensorium', 'red_spots_over_body', 'belly_pain',
    'abnormal_menstruation', 'dischromic_patches', 'watering_from_eyes',
    'increased_appetite', 'polyuria', 'family_history', 'mucoid_sputum',
    'rusty_sputum', 'lack_of_concentration', 'visual_disturbances',
    'receiving_blood_transfusion', 'receiving_unsterile_injections', 'coma',
    'stomach_bleeding', 'distention_of_abdomen',
    'history_of_alcohol_consumption', 'blood_in_sputum',
    'prominent_veins_on_calf', 'palpitations', 'painful_walking',
    'pus_filled_pimples', 'blackheads', 'scurring', 'skin_peeling',
    'silver_like_dusting', 'small_dents_in_nails', 'inflammatory_nails',
    'blister', 'red_sore_around_nose', 'yellow_crust_ooze'
]

# ─────────────────────────────────────────────
# All 41 diseases
# ─────────────────────────────────────────────
DISEASES = [
    'Fungal infection', 'Allergy', 'GERD', 'Chronic cholestasis',
    'Drug Reaction', 'Peptic ulcer disease', 'AIDS', 'Diabetes',
    'Gastroenteritis', 'Bronchial Asthma', 'Hypertension', 'Migraine',
    'Cervical spondylosis', 'Paralysis (brain hemorrhage)', 'Jaundice',
    'Malaria', 'Chicken pox', 'Dengue', 'Typhoid', 'hepatitis A',
    'Hepatitis B', 'Hepatitis C', 'Hepatitis D', 'Hepatitis E',
    'Alcoholic hepatitis', 'Tuberculosis', 'Common Cold', 'Pneumonia',
    'Dimorphic hemorrhoids(piles)', 'Heart attack', 'Varicose veins',
    'Hypothyroidism', 'Hyperthyroidism', 'Hypoglycemia', 'Osteoarthritis',
    'Arthritis', '(vertigo) Paroymsal  Positional Vertigo', 'Acne',
    'Urinary tract infection', 'Psoriasis', 'Impetigo'
]

# ─────────────────────────────────────────────
# Disease severity mapping (for risk assessment)
# ─────────────────────────────────────────────
DISEASE_SEVERITY = {
    'Fungal infection': 'Low',
    'Allergy': 'Low',
    'GERD': 'Low',
    'Chronic cholestasis': 'Medium',
    'Drug Reaction': 'Medium',
    'Peptic ulcer disease': 'Medium',
    'AIDS': 'High',
    'Diabetes': 'Medium',
    'Gastroenteritis': 'Low',
    'Bronchial Asthma': 'Medium',
    'Hypertension': 'Medium',
    'Migraine': 'Low',
    'Cervical spondylosis': 'Low',
    'Paralysis (brain hemorrhage)': 'Critical',
    'Jaundice': 'Medium',
    'Malaria': 'High',
    'Chicken pox': 'Low',
    'Dengue': 'High',
    'Typhoid': 'High',
    'hepatitis A': 'Medium',
    'Hepatitis B': 'High',
    'Hepatitis C': 'High',
    'Hepatitis D': 'High',
    'Hepatitis E': 'Medium',
    'Alcoholic hepatitis': 'High',
    'Tuberculosis': 'High',
    'Common Cold': 'Low',
    'Pneumonia': 'High',
    'Dimorphic hemorrhoids(piles)': 'Low',
    'Heart attack': 'Critical',
    'Varicose veins': 'Low',
    'Hypothyroidism': 'Medium',
    'Hyperthyroidism': 'Medium',
    'Hypoglycemia': 'Medium',
    'Osteoarthritis': 'Low',
    'Arthritis': 'Medium',
    '(vertigo) Paroymsal  Positional Vertigo': 'Low',
    'Acne': 'Low',
    'Urinary tract infection': 'Low',
    'Psoriasis': 'Low',
    'Impetigo': 'Low',
}

# ─────────────────────────────────────────────
# Medically-accurate symptom-disease mapping
# Each disease maps to its characteristic symptoms
# Sources: Harrison's, Merck Manual, WHO, CDC, NIH
# ─────────────────────────────────────────────
def get_base_mapping():
    """Return medically-accurate symptom lists for each disease."""
    return {
        'Fungal infection': [
            'itching', 'skin_rash', 'nodal_skin_eruptions', 'dischromic_patches'
        ],
        'Allergy': [
            'continuous_sneezing', 'shivering', 'chills', 'watering_from_eyes',
            'skin_rash', 'itching', 'runny_nose', 'congestion',
            'redness_of_eyes', 'breathlessness'
        ],
        'GERD': [
            'stomach_pain', 'acidity', 'ulcers_on_tongue', 'vomiting',
            'cough', 'chest_pain', 'indigestion', 'nausea', 'throat_irritation'
        ],
        'Chronic cholestasis': [
            'itching', 'vomiting', 'yellowish_skin', 'nausea',
            'loss_of_appetite', 'abdominal_pain', 'yellowing_of_eyes',
            'dark_urine', 'fatigue'
        ],
        'Drug Reaction': [
            'itching', 'skin_rash', 'stomach_pain', 'vomiting',
            'fatigue', 'nausea', 'high_fever', 'headache',
            'swelled_lymph_nodes', 'dizziness'
        ],
        'Peptic ulcer disease': [
            'vomiting', 'loss_of_appetite', 'abdominal_pain', 'passage_of_gases',
            'internal_itching', 'indigestion', 'nausea', 'stomach_pain',
            'fatigue', 'weight_loss'
        ],
        'AIDS': [
            'muscle_wasting', 'patches_in_throat', 'high_fever',
            'extra_marital_contacts', 'fatigue', 'weight_loss',
            'diarrhoea', 'swelled_lymph_nodes', 'skin_rash', 'cough',
            'loss_of_appetite', 'malaise'
        ],
        'Diabetes': [
            'fatigue', 'weight_loss', 'restlessness', 'lethargy',
            'irregular_sugar_level', 'blurred_and_distorted_vision',
            'obesity', 'excessive_hunger', 'increased_appetite', 'polyuria',
            'mood_swings', 'visual_disturbances'
        ],
        'Gastroenteritis': [
            'vomiting', 'sunken_eyes', 'dehydration', 'diarrhoea',
            'nausea', 'abdominal_pain', 'stomach_pain', 'mild_fever',
            'fatigue', 'cramps', 'loss_of_appetite'
        ],
        'Bronchial Asthma': [
            'fatigue', 'cough', 'high_fever', 'breathlessness',
            'family_history', 'mucoid_sputum', 'chest_pain',
            'phlegm', 'throat_irritation'
        ],
        'Hypertension': [
            'headache', 'chest_pain', 'dizziness', 'lack_of_concentration',
            'fatigue', 'blurred_and_distorted_vision', 'nausea',
            'anxiety', 'breathlessness', 'palpitations'
        ],
        'Migraine': [
            'acidity', 'indigestion', 'headache', 'blurred_and_distorted_vision',
            'excessive_hunger', 'stiff_neck', 'depression', 'irritability',
            'visual_disturbances', 'nausea', 'vomiting', 'lack_of_concentration'
        ],
        'Cervical spondylosis': [
            'back_pain', 'weakness_in_limbs', 'neck_pain', 'dizziness',
            'loss_of_balance', 'muscle_weakness', 'stiff_neck',
            'headache', 'movement_stiffness'
        ],
        'Paralysis (brain hemorrhage)': [
            'vomiting', 'headache', 'weakness_of_one_body_side',
            'altered_sensorium', 'slurred_speech', 'weakness_in_limbs',
            'loss_of_balance', 'dizziness', 'blurred_and_distorted_vision'
        ],
        'Jaundice': [
            'itching', 'vomiting', 'fatigue', 'weight_loss', 'high_fever',
            'yellowish_skin', 'dark_urine', 'abdominal_pain',
            'yellowing_of_eyes', 'nausea', 'loss_of_appetite'
        ],
        'Malaria': [
            'chills', 'vomiting', 'high_fever', 'sweating', 'headache',
            'nausea', 'diarrhoea', 'muscle_pain', 'fatigue',
            'back_pain', 'shivering', 'joint_pain'
        ],
        'Chicken pox': [
            'itching', 'skin_rash', 'fatigue', 'lethargy', 'high_fever',
            'headache', 'loss_of_appetite', 'mild_fever', 'swelled_lymph_nodes',
            'malaise', 'red_spots_over_body', 'blister'
        ],
        'Dengue': [
            'skin_rash', 'chills', 'joint_pain', 'vomiting', 'fatigue',
            'high_fever', 'headache', 'nausea', 'loss_of_appetite',
            'pain_behind_the_eyes', 'back_pain', 'malaise', 'muscle_pain',
            'red_spots_over_body'
        ],
        'Typhoid': [
            'chills', 'vomiting', 'fatigue', 'high_fever', 'headache',
            'nausea', 'constipation', 'abdominal_pain', 'diarrhoea',
            'toxic_look_typhos', 'belly_pain', 'loss_of_appetite',
            'mild_fever', 'malaise'
        ],
        'hepatitis A': [
            'joint_pain', 'vomiting', 'yellowish_skin', 'dark_urine',
            'nausea', 'loss_of_appetite', 'abdominal_pain', 'diarrhoea',
            'mild_fever', 'yellowing_of_eyes', 'muscle_pain', 'fatigue',
            'malaise'
        ],
        'Hepatitis B': [
            'itching', 'fatigue', 'lethargy', 'yellowish_skin', 'dark_urine',
            'nausea', 'loss_of_appetite', 'abdominal_pain',
            'yellowing_of_eyes', 'malaise', 'joint_pain',
            'receiving_blood_transfusion', 'receiving_unsterile_injections'
        ],
        'Hepatitis C': [
            'fatigue', 'yellowish_skin', 'nausea', 'loss_of_appetite',
            'yellowing_of_eyes', 'dark_urine', 'abdominal_pain',
            'family_history', 'receiving_blood_transfusion',
            'receiving_unsterile_injections', 'joint_pain', 'malaise'
        ],
        'Hepatitis D': [
            'joint_pain', 'vomiting', 'fatigue', 'yellowish_skin',
            'dark_urine', 'nausea', 'loss_of_appetite', 'abdominal_pain',
            'yellowing_of_eyes', 'malaise'
        ],
        'Hepatitis E': [
            'joint_pain', 'vomiting', 'fatigue', 'high_fever',
            'yellowish_skin', 'dark_urine', 'nausea', 'loss_of_appetite',
            'abdominal_pain', 'yellowing_of_eyes', 'acute_liver_failure',
            'coma', 'stomach_bleeding'
        ],
        'Alcoholic hepatitis': [
            'vomiting', 'yellowish_skin', 'abdominal_pain', 'swelling_of_stomach',
            'distention_of_abdomen', 'history_of_alcohol_consumption',
            'fluid_overload', 'fatigue', 'loss_of_appetite', 'nausea',
            'yellowing_of_eyes'
        ],
        'Tuberculosis': [
            'chills', 'vomiting', 'fatigue', 'weight_loss', 'cough',
            'high_fever', 'breathlessness', 'sweating', 'loss_of_appetite',
            'mild_fever', 'yellowing_of_eyes', 'swelled_lymph_nodes',
            'malaise', 'phlegm', 'chest_pain', 'blood_in_sputum',
            'muscle_pain'
        ],
        'Common Cold': [
            'continuous_sneezing', 'chills', 'fatigue', 'cough',
            'high_fever', 'headache', 'swelled_lymph_nodes', 'malaise',
            'phlegm', 'throat_irritation', 'redness_of_eyes', 'sinus_pressure',
            'runny_nose', 'congestion', 'loss_of_smell', 'mild_fever'
        ],
        'Pneumonia': [
            'chills', 'fatigue', 'cough', 'high_fever', 'breathlessness',
            'sweating', 'malaise', 'phlegm', 'chest_pain', 'fast_heart_rate',
            'rusty_sputum', 'nausea', 'loss_of_appetite', 'muscle_pain'
        ],
        'Dimorphic hemorrhoids(piles)': [
            'constipation', 'pain_during_bowel_movements', 'pain_in_anal_region',
            'bloody_stool', 'irritation_in_anus', 'cramps',
            'abdominal_pain'
        ],
        'Heart attack': [
            'vomiting', 'breathlessness', 'sweating', 'chest_pain',
            'fast_heart_rate', 'nausea', 'dizziness', 'anxiety',
            'weakness_in_limbs', 'palpitations', 'fatigue'
        ],
        'Varicose veins': [
            'fatigue', 'cramps', 'bruising', 'obesity', 'swollen_legs',
            'swollen_blood_vessels', 'prominent_veins_on_calf',
            'painful_walking', 'muscle_pain'
        ],
        'Hypothyroidism': [
            'fatigue', 'weight_gain', 'cold_hands_and_feets', 'mood_swings',
            'lethargy', 'dizziness', 'puffy_face_and_eyes', 'enlarged_thyroid',
            'brittle_nails', 'swollen_extremeties', 'depression',
            'irritability', 'abnormal_menstruation', 'constipation',
            'muscle_weakness'
        ],
        'Hyperthyroidism': [
            'fatigue', 'mood_swings', 'weight_loss', 'restlessness',
            'sweating', 'diarrhoea', 'fast_heart_rate', 'excessive_hunger',
            'enlarged_thyroid', 'brittle_nails', 'muscle_weakness',
            'irritability', 'anxiety', 'palpitations', 'abnormal_menstruation'
        ],
        'Hypoglycemia': [
            'vomiting', 'fatigue', 'anxiety', 'sweating', 'headache',
            'nausea', 'blurred_and_distorted_vision', 'excessive_hunger',
            'drying_and_tingling_lips', 'slurred_speech', 'irritability',
            'palpitations', 'dizziness', 'altered_sensorium', 'shivering'
        ],
        'Osteoarthritis': [
            'joint_pain', 'neck_pain', 'knee_pain', 'hip_joint_pain',
            'swelling_joints', 'movement_stiffness', 'painful_walking',
            'muscle_weakness', 'back_pain', 'stiff_neck'
        ],
        'Arthritis': [
            'muscle_weakness', 'stiff_neck', 'swelling_joints',
            'movement_stiffness', 'loss_of_balance', 'unsteadiness',
            'joint_pain', 'knee_pain', 'hip_joint_pain', 'painful_walking',
            'fatigue', 'muscle_pain'
        ],
        '(vertigo) Paroymsal  Positional Vertigo': [
            'vomiting', 'headache', 'nausea', 'spinning_movements',
            'loss_of_balance', 'unsteadiness', 'dizziness',
            'anxiety', 'lack_of_concentration'
        ],
        'Acne': [
            'skin_rash', 'pus_filled_pimples', 'blackheads', 'scurring',
            'itching', 'fatigue', 'anxiety'
        ],
        'Urinary tract infection': [
            'burning_micturition', 'spotting_urination', 'bladder_discomfort',
            'foul_smell_of_urine', 'continuous_feel_of_urine',
            'abdominal_pain', 'back_pain', 'mild_fever', 'high_fever',
            'dark_urine', 'nausea'
        ],
        'Psoriasis': [
            'skin_rash', 'joint_pain', 'skin_peeling', 'silver_like_dusting',
            'small_dents_in_nails', 'inflammatory_nails', 'itching',
            'fatigue'
        ],
        'Impetigo': [
            'skin_rash', 'high_fever', 'blister', 'red_sore_around_nose',
            'yellow_crust_ooze', 'itching', 'swelled_lymph_nodes',
            'fatigue'
        ],
    }


def generate_dataset(samples_per_disease: int = 120, seed: int = 42) -> pd.DataFrame:
    """
    Generate a training dataset with realistic variation.
    
    For each disease:
    - Core symptoms appear with 85-95% probability
    - 0-3 random non-core symptoms added (noise)
    - Ensures each sample has at least 2 symptoms
    """
    rng = np.random.RandomState(seed)
    base_data = get_base_mapping()
    
    all_samples = []
    all_labels = []
    
    for disease in DISEASES:
        core_symptoms = base_data.get(disease, [])
        if not core_symptoms:
            continue
            
        for i in range(samples_per_disease):
            sample = {symp: 0 for symp in SYMPTOMS}
            
            # Add core symptoms with 85-95% probability each
            active_count = 0
            for symp in core_symptoms:
                if symp in sample and rng.rand() < 0.90:
                    sample[symp] = 1
                    active_count += 1
            
            # Ensure at least 2 core symptoms are present
            if active_count < 2:
                chosen = rng.choice(core_symptoms, size=min(2, len(core_symptoms)), replace=False)
                for s in chosen:
                    if s in sample:
                        sample[s] = 1
            
            # Add 0-2 random noise symptoms (simulates comorbidity)
            noise_count = rng.randint(0, 3)
            non_core = [s for s in SYMPTOMS if s not in core_symptoms]
            if noise_count > 0 and non_core:
                noise_symptoms = rng.choice(non_core, size=min(noise_count, len(non_core)), replace=False)
                for s in noise_symptoms:
                    sample[s] = 1
            
            all_samples.append(sample)
            all_labels.append(disease)
    
    df = pd.DataFrame(all_samples)
    df['disease'] = all_labels
    return df


# Natural-language question templates for each symptom
SYMPTOM_QUESTIONS = {
    'itching': 'Do you have any itching on your skin?',
    'skin_rash': 'Do you notice any rash or skin eruptions?',
    'nodal_skin_eruptions': 'Do you have any lumpy or nodular skin eruptions?',
    'continuous_sneezing': 'Have you been sneezing frequently or continuously?',
    'shivering': 'Have you been experiencing shivering or trembling?',
    'chills': 'Do you feel chills or cold spells?',
    'joint_pain': 'Do you have pain in your joints?',
    'stomach_pain': 'Do you have stomach pain?',
    'acidity': 'Do you experience acidity or acid reflux?',
    'ulcers_on_tongue': 'Do you have any ulcers or sores on your tongue?',
    'muscle_wasting': 'Have you noticed any muscle wasting or loss of muscle mass?',
    'vomiting': 'Have you been vomiting?',
    'burning_micturition': 'Do you feel a burning sensation while urinating?',
    'spotting_urination': 'Have you noticed spotting or irregular urination?',
    'fatigue': 'Do you feel unusually tired or fatigued?',
    'weight_gain': 'Have you gained weight recently without explanation?',
    'anxiety': 'Do you feel anxious or unusually worried?',
    'cold_hands_and_feets': 'Are your hands and feet unusually cold?',
    'mood_swings': 'Have you been experiencing mood swings?',
    'weight_loss': 'Have you lost weight recently without trying?',
    'restlessness': 'Do you feel restless or unable to sit still?',
    'lethargy': 'Do you feel sluggish or lethargic?',
    'patches_in_throat': 'Do you have patches or white spots in your throat?',
    'irregular_sugar_level': 'Have you had irregular blood sugar levels?',
    'cough': 'Do you have a cough?',
    'high_fever': 'Do you have a high fever (above 101°F/38.3°C)?',
    'sunken_eyes': 'Do your eyes appear sunken?',
    'breathlessness': 'Do you experience shortness of breath or breathlessness?',
    'sweating': 'Have you been sweating excessively?',
    'dehydration': 'Do you feel dehydrated (dry mouth, less urination)?',
    'indigestion': 'Do you have indigestion or difficulty digesting food?',
    'headache': 'Do you have a headache?',
    'yellowish_skin': 'Has your skin turned yellowish?',
    'dark_urine': 'Is your urine darker than usual?',
    'nausea': 'Do you feel nauseous?',
    'loss_of_appetite': 'Have you lost your appetite?',
    'pain_behind_the_eyes': 'Do you feel pain behind your eyes?',
    'back_pain': 'Do you have back pain?',
    'constipation': 'Are you experiencing constipation?',
    'abdominal_pain': 'Do you have abdominal pain?',
    'diarrhoea': 'Do you have diarrhea?',
    'mild_fever': 'Do you have a mild or low-grade fever?',
    'yellow_urine': 'Is your urine yellow or darker than usual?',
    'yellowing_of_eyes': 'Have your eyes turned yellow?',
    'acute_liver_failure': 'Have you been diagnosed with or suspect liver failure?',
    'fluid_overload': 'Do you have signs of fluid overload (swelling, rapid weight gain)?',
    'swelling_of_stomach': 'Is your stomach or abdomen swollen?',
    'swelled_lymph_nodes': 'Are your lymph nodes swollen?',
    'malaise': 'Do you have a general feeling of being unwell (malaise)?',
    'blurred_and_distorted_vision': 'Is your vision blurred or distorted?',
    'phlegm': 'Do you have phlegm or mucus when you cough?',
    'throat_irritation': 'Do you have throat irritation or soreness?',
    'redness_of_eyes': 'Are your eyes red or irritated?',
    'sinus_pressure': 'Do you feel pressure in your sinuses?',
    'runny_nose': 'Do you have a runny nose?',
    'congestion': 'Do you have nasal congestion?',
    'chest_pain': 'Do you have chest pain or tightness?',
    'weakness_in_limbs': 'Do you feel weakness in your arms or legs?',
    'fast_heart_rate': 'Is your heart beating faster than usual?',
    'pain_during_bowel_movements': 'Do you have pain during bowel movements?',
    'pain_in_anal_region': 'Do you have pain in the anal region?',
    'bloody_stool': 'Have you noticed blood in your stool?',
    'irritation_in_anus': 'Do you have irritation or itching in the anal area?',
    'neck_pain': 'Do you have neck pain?',
    'dizziness': 'Do you feel dizzy?',
    'cramps': 'Do you have muscle cramps?',
    'bruising': 'Do you bruise easily?',
    'obesity': 'Are you significantly overweight?',
    'swollen_legs': 'Are your legs swollen?',
    'swollen_blood_vessels': 'Do you have visibly swollen blood vessels?',
    'puffy_face_and_eyes': 'Is your face or area around your eyes puffy?',
    'enlarged_thyroid': 'Do you have a swelling in your neck (enlarged thyroid)?',
    'brittle_nails': 'Are your nails brittle or breaking easily?',
    'swollen_extremeties': 'Are your extremities (hands/feet) swollen?',
    'excessive_hunger': 'Do you feel excessively hungry?',
    'extra_marital_contacts': 'Have you had unprotected sexual contact recently?',
    'drying_and_tingling_lips': 'Are your lips dry or tingling?',
    'slurred_speech': 'Is your speech slurred or difficult?',
    'knee_pain': 'Do you have knee pain?',
    'hip_joint_pain': 'Do you have hip joint pain?',
    'muscle_weakness': 'Do you feel muscle weakness?',
    'stiff_neck': 'Is your neck stiff?',
    'swelling_joints': 'Are your joints swollen?',
    'movement_stiffness': 'Do you feel stiffness when moving?',
    'spinning_movements': 'Do you feel like things are spinning around you?',
    'loss_of_balance': 'Do you have trouble maintaining balance?',
    'unsteadiness': 'Do you feel unsteady on your feet?',
    'weakness_of_one_body_side': 'Do you feel weakness on one side of your body?',
    'loss_of_smell': 'Have you lost your sense of smell?',
    'bladder_discomfort': 'Do you have bladder discomfort?',
    'foul_smell_of_urine': 'Does your urine have a foul smell?',
    'continuous_feel_of_urine': 'Do you constantly feel the urge to urinate?',
    'passage_of_gases': 'Are you passing gas more than usual?',
    'internal_itching': 'Do you have internal itching (deep itch)?',
    'toxic_look_typhos': 'Do you appear very ill or toxic-looking?',
    'depression': 'Do you feel depressed or persistently sad?',
    'irritability': 'Are you feeling unusually irritable?',
    'muscle_pain': 'Do you have muscle pain or body aches?',
    'altered_sensorium': 'Is your consciousness or awareness altered?',
    'red_spots_over_body': 'Do you have red spots on your body?',
    'belly_pain': 'Do you have pain in your belly area?',
    'abnormal_menstruation': 'Is your menstrual cycle irregular or abnormal?',
    'dischromic_patches': 'Do you have discolored patches on your skin?',
    'watering_from_eyes': 'Are your eyes watering excessively?',
    'increased_appetite': 'Has your appetite increased significantly?',
    'polyuria': 'Are you urinating more frequently than usual?',
    'family_history': 'Do you have a family history of this type of condition?',
    'mucoid_sputum': 'Is your sputum/phlegm thick and mucus-like?',
    'rusty_sputum': 'Is your sputum rusty or brownish in color?',
    'lack_of_concentration': 'Are you having difficulty concentrating?',
    'visual_disturbances': 'Do you have visual disturbances (flashes, auras)?',
    'receiving_blood_transfusion': 'Have you received a blood transfusion?',
    'receiving_unsterile_injections': 'Have you received injections with unsterilized needles?',
    'coma': 'Has there been any loss of consciousness or coma?',
    'stomach_bleeding': 'Have you had any stomach bleeding?',
    'distention_of_abdomen': 'Is your abdomen distended or bloated?',
    'history_of_alcohol_consumption': 'Do you have a history of regular alcohol consumption?',
    'blood_in_sputum': 'Have you coughed up blood?',
    'prominent_veins_on_calf': 'Do you have prominent or bulging veins on your calves?',
    'palpitations': 'Do you experience heart palpitations?',
    'painful_walking': 'Is walking painful for you?',
    'pus_filled_pimples': 'Do you have pus-filled pimples?',
    'blackheads': 'Do you have blackheads on your skin?',
    'scurring': 'Do you have scarring on your skin?',
    'skin_peeling': 'Is your skin peeling?',
    'silver_like_dusting': 'Do you have silvery or flaky patches on your skin?',
    'small_dents_in_nails': 'Do you have small dents or pits in your nails?',
    'inflammatory_nails': 'Are your nails inflamed or discolored?',
    'blister': 'Do you have blisters on your skin?',
    'red_sore_around_nose': 'Do you have red sores around your nose or mouth?',
    'yellow_crust_ooze': 'Do your sores ooze and form yellow crusts?',
}
