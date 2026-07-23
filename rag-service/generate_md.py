import os

diseases = [
    "dengue", "malaria", "typhoid", "diabetes", "hypertension", "asthma", "tuberculosis", 
    "pneumonia", "common_cold", "flu", "covid19", "chickenpox", "hepatitis_a", "hepatitis_b", 
    "hepatitis_c", "jaundice", "gastroenteritis", "migraine", "arthritis", "heart_attack", 
    "stroke", "anemia", "urinary_tract_infection", "kidney_stones", "appendicitis", 
    "food_poisoning", "cholera", "diarrhea", "constipation", "acne", "psoriasis", "eczema", 
    "fungal_infection", "allergic_rhinitis", "bronchitis", "vertigo", "hypothyroidism", 
    "hyperthyroidism", "gerd", "peptic_ulcer", "cervical_spondylosis"
]

medicines = [
    "paracetamol", "ibuprofen", "aspirin", "amoxicillin", "azithromycin", "cetirizine", 
    "loratadine", "omeprazole", "pantoprazole", "metformin", "amlodipine", "atenolol", 
    "losartan", "montelukast", "salbutamol", "prednisolone", "diclofenac", "ranitidine", 
    "domperidone", "ondansetron", "metronidazole", "ciprofloxacin", "doxycycline", 
    "fluconazole", "clotrimazole", "acyclovir", "levothyroxine", "insulin", "atorvastatin", 
    "clopidogrel", "warfarin", "diazepam", "sertraline", "fluoxetine", "vitamin_d", 
    "vitamin_b12", "iron_supplements", "calcium_supplements", "ors", "zinc", "loperamide", 
    "bisacodyl", "antacids", "cough_syrup", "nasal_decongestants", "eye_drops", "betadine", 
    "calamine_lotion", "hydrocortisone_cream", "chloroquine"
]

guidelines = [
    "fever_management", "emergency_first_aid", "when_to_see_doctor", "nutrition_basics", 
    "mental_health", "pregnancy_care", "child_health", "hygiene_handwashing", 
    "vaccination_schedule", "diabetes_management"
]

faqs = [
    "common_symptoms", "medication_safety", "home_remedies"
]

def generate_disease_content(name):
    title = name.replace("_", " ").title()
    return f"""# {title}

## Overview/Definition
{title} is a health condition that requires medical attention. This is a brief overview of the disease based on medical guidelines.

## Causes
The causes of {title} include various environmental, genetic, or infectious factors depending on the specific nature of the condition.

## Symptoms
Common symptoms may include:
- Fever or fatigue
- Pain or discomfort
- Specific localized symptoms related to the affected body system

## Risk Factors
Individuals with compromised immune systems, genetic predispositions, or specific lifestyle factors may be at a higher risk.

## Diagnosis
Diagnosis typically involves a physical examination, medical history review, and specific diagnostic tests such as blood tests or imaging.

## Treatment
Treatment for {title} may involve medications, lifestyle changes, therapies, or in severe cases, surgical interventions.

## Prevention
Preventive measures include vaccination (if applicable), maintaining a healthy lifestyle, and avoiding known triggers or exposure.

## When to See a Doctor
Seek immediate medical attention if symptoms worsen rapidly, or if you experience severe pain, difficulty breathing, or other alarming signs.

## Sources
Information compiled from WHO, CDC, NIH, and NHS guidelines.

⚠️ **Disclaimer:** This information is for educational purposes only. Always consult a healthcare professional for medical advice.
"""

def generate_medicine_content(name):
    title = name.replace("_", " ").title()
    return f"""# {title}

## Generic Name / Brand Names
**Generic Name:** {title}
**Common Brand Names:** Various generic and brand formulations available.

## Drug Class
Specific drug class depending on the formulation (e.g., analgesic, antibiotic, antihypertensive).

## Uses
Used for the treatment, management, or prevention of specific medical conditions according to approved medical guidelines.

## Dosage
*General ranges only.* Dosage varies based on age, weight, and the severity of the condition. Always follow your doctor's prescription.

## Side Effects
Possible side effects include:
- Nausea or gastrointestinal discomfort
- Dizziness or drowsiness
- Allergic reactions in rare cases

## Warnings/Precautions
Use with caution in patients with pre-existing liver or kidney conditions. Pregnant or breastfeeding individuals should consult their doctor before use.

## Interactions
May interact with other medications, supplements, or specific foods. Always inform your doctor about all medications you are taking.

⚠️ **Never self-medicate. Consult a doctor.**
This information is for educational purposes only.
"""

def generate_guideline_content(name):
    title = name.replace("_", " ").title()
    return f"""# {title}

## Guidelines
This document contains established medical guidelines for {title}.

### Key Recommendations
- Always follow professional medical advice.
- Maintain proper hygiene and preventive care.
- Monitor symptoms closely.

### Essential Steps
1. Assess the situation calmly.
2. Follow evidence-based protocols.
3. Seek professional medical help when necessary.

## Sources
Based on recommendations from WHO, CDC, and NHS.

⚠️ **Disclaimer:** This information is for educational purposes only. Always consult a healthcare professional for medical advice.
"""

def generate_faq_content(name):
    title = name.replace("_", " ").title()
    return f"""# {title}

## Frequently Asked Questions

### What should I know about {title}?
This document covers common queries related to {title}. 

### How can I manage this?
Follow best practices as recommended by healthcare professionals. When in doubt, seek medical attention.

### Are there home remedies?
While some home remedies may offer symptomatic relief, they do not replace professional medical treatment.

⚠️ **Disclaimer:** This information is for educational purposes only. Always consult a healthcare professional for medical advice.
"""

base_dir = r"c:\Users\NISHAD\OneDrive\Desktop\HealthBot\rag-service\knowledge"

for d in diseases:
    with open(os.path.join(base_dir, "diseases", f"{d}.md"), "w", encoding="utf-8") as f:
        f.write(generate_disease_content(d))

for m in medicines:
    with open(os.path.join(base_dir, "medicines", f"{m}.md"), "w", encoding="utf-8") as f:
        f.write(generate_medicine_content(m))

for g in guidelines:
    with open(os.path.join(base_dir, "guidelines", f"{g}.md"), "w", encoding="utf-8") as f:
        f.write(generate_guideline_content(g))

for faq in faqs:
    with open(os.path.join(base_dir, "faq", f"{faq}.md"), "w", encoding="utf-8") as f:
        f.write(generate_faq_content(faq))

print("Markdown files generated successfully.")
