const Tesseract = require('tesseract.js');
const sharp = require('sharp');
const axios = require('axios');

class PrescriptionScanner {
  constructor() {
    this.drugDatabase = new Map();
    this.interactionDatabase = new Map();
    this.allergyDatabase = new Map();
    this.initializeDrugDatabase();
    this.initializeInteractionDatabase();
  }

  description = "Prescription Image Scanner + Drug Safety Checker - OCR and medication interaction analysis";

  async initializeDrugDatabase() {
    // Comprehensive drug database with safety information
    this.drugDatabase.set('acetaminophen', {
      genericName: 'acetaminophen',
      brandNames: ['Tylenol', 'Panadol', 'Excedrin'],
      class: 'analgesic',
      uses: ['pain', 'fever'],
      dosage: {
        adult: '325-1000mg every 4-6 hours',
        child: '10-15mg/kg every 4-6 hours',
        maxDaily: '4000mg'
      },
      sideEffects: ['liver toxicity', 'rash', 'nausea'],
      contraindications: ['liver disease', 'alcoholism'],
      precautions: ['avoid alcohol', 'monitor liver function'],
      halfLife: '2-3 hours',
      proteinBinding: '25%',
      metabolism: 'liver',
      excretion: 'kidney'
    });

    this.drugDatabase.set('ibuprofen', {
      genericName: 'ibuprofen',
      brandNames: ['Advil', 'Motrin', 'Aleve'],
      class: 'NSAID',
      uses: ['pain', 'inflammation', 'fever'],
      dosage: {
        adult: '200-400mg every 4-6 hours',
        child: '5-10mg/kg every 6-8 hours',
        maxDaily: '1200mg OTC, 3200mg prescription'
      },
      sideEffects: ['stomach bleeding', 'kidney damage', 'heart risk'],
      contraindications: ['peptic ulcer', 'kidney disease', 'heart disease'],
      precautions: ['take with food', 'avoid alcohol', 'monitor blood pressure'],
      halfLife: '2 hours',
      proteinBinding: '99%',
      metabolism: 'liver',
      excretion: 'kidney'
    });

    this.drugDatabase.set('lisinopril', {
      genericName: 'lisinopril',
      brandNames: ['Zestril', 'Prinivil'],
      class: 'ACE inhibitor',
      uses: ['hypertension', 'heart failure'],
      dosage: {
        adult: '10-40mg once daily',
        maxDaily: '80mg'
      },
      sideEffects: ['cough', 'dizziness', 'hyperkalemia'],
      contraindications: ['pregnancy', 'angioedema'],
      precautions: ['monitor potassium', 'avoid potassium supplements'],
      halfLife: '12 hours',
      proteinBinding: '25%',
      metabolism: 'none (excreted unchanged)',
      excretion: 'kidney'
    });

    this.drugDatabase.set('metformin', {
      genericName: 'metformin',
      brandNames: ['Glucophage', 'Fortamet'],
      class: 'biguanide',
      uses: ['type 2 diabetes'],
      dosage: {
        adult: '500mg twice daily, max 2550mg/day',
        child: 'dose based on weight'
      },
      sideEffects: ['gastrointestinal upset', 'lactic acidosis (rare)'],
      contraindications: ['kidney disease', 'liver disease', 'heart failure'],
      precautions: ['monitor kidney function', 'avoid alcohol'],
      halfLife: '6.2 hours',
      proteinBinding: 'minimal',
      metabolism: 'minimal',
      excretion: 'kidney'
    });

    this.drugDatabase.set('atorvastatin', {
      genericName: 'atorvastatin',
      brandNames: ['Lipitor'],
      class: 'statin',
      uses: ['high cholesterol', 'cardiovascular prevention'],
      dosage: {
        adult: '10-80mg once daily',
        maxDaily: '80mg'
      },
      sideEffects: ['muscle pain', 'liver enzyme elevation'],
      contraindications: ['active liver disease', 'pregnancy'],
      precautions: ['monitor liver enzymes', 'avoid grapefruit'],
      halfLife: '14 hours',
      proteinBinding: '98%',
      metabolism: 'liver (CYP3A4)',
      excretion: 'bile'
    });

    // Add more commonly prescribed medications
    const commonDrugs = [
      'amoxicillin', 'azithromycin', 'prednisone', 'hydrochlorothiazide',
      'albuterol', 'omeprazole', 'sertraline', 'gabapentin',
      'levothyroxine', 'warfarin', 'furosemide', 'metoprolol'
    ];

    commonDrugs.forEach(drug => {
      this.drugDatabase.set(drug, {
        genericName: drug,
        brandNames: [],
        class: 'various',
        uses: ['various'],
        dosage: { adult: 'standard dose' },
        sideEffects: ['common side effects'],
        contraindications: ['standard contraindications'],
        precautions: ['standard precautions']
      });
    });
  }

  initializeInteractionDatabase() {
    // Drug-drug interactions
    this.interactionDatabase.set('acetaminophen-ibuprofen', {
      severity: 'moderate',
      description: 'Increased risk of kidney damage',
      recommendation: 'Monitor kidney function, stay hydrated',
      mechanism: 'Both can affect kidney function'
    });

    this.interactionDatabase.set('lisinopril-potassium', {
      severity: 'high',
      description: 'Dangerous hyperkalemia risk',
      recommendation: 'Avoid potassium supplements',
      mechanism: 'ACE inhibitors reduce potassium excretion'
    });

    this.interactionDatabase.set('atorvastatin-grapefruit', {
      severity: 'moderate',
      description: 'Increased statin levels and side effects',
      recommendation: 'Avoid grapefruit juice',
      mechanism: 'Grapefruit inhibits CYP3A4 metabolism'
    });

    this.interactionDatabase.set('warfarin-ibuprofen', {
      severity: 'high',
      description: 'Increased bleeding risk',
      recommendation: 'Use alternative pain reliever',
      mechanism: 'NSAIDs affect platelet function and stomach lining'
    });

    // Drug-food interactions
    this.interactionDatabase.set('metformin-alcohol', {
      severity: 'high',
      description: 'Increased lactic acidosis risk',
      recommendation: 'Avoid excessive alcohol',
      mechanism: 'Alcohol affects liver metabolism'
    });

    this.interactionDatabase.set('tetracycline-dairy', {
      severity: 'moderate',
      description: 'Reduced antibiotic absorption',
      recommendation: 'Take 1 hour before or 2 hours after dairy',
      mechanism: 'Calcium binds to tetracycline'
    });

    // Drug-disease interactions
    this.interactionDatabase.set('nsaids-kidney_disease', {
      severity: 'high',
      description: 'Worsening kidney function',
      recommendation: 'Avoid NSAIDs, use alternative pain relief',
      mechanism: 'NSAIDs reduce blood flow to kidneys'
    });

    this.interactionDatabase.set('beta_blockers-asthma', {
      severity: 'moderate',
      description: 'Bronchoconstriction risk',
      recommendation: 'Use cardioselective beta blockers',
      mechanism: 'Beta blockade affects bronchial smooth muscle'
    });
  }

  async scanPrescription(imageBuffer) {
    try {
      // Step 1: Image preprocessing
      const processedImage = await this.preprocessImage(imageBuffer);
      
      // Step 2: OCR text extraction
      const ocrResult = await this.extractText(processedImage);
      
      // Step 3: Parse prescription text
      const parsedPrescription = this.parsePrescriptionText(ocrResult.text);
      
      // Step 4: Identify medications
      const medications = await this.identifyMedications(parsedPrescription);
      
      // Step 5: Check for safety issues
      const safetyAnalysis = await this.analyzeSafety(medications);
      
      // Step 6: Generate recommendations
      const recommendations = this.generateRecommendations(medications, safetyAnalysis);
      
      return {
        originalText: ocrResult.text,
        confidence: ocrResult.confidence,
        parsedPrescription: parsedPrescription,
        medications: medications,
        safetyAnalysis: safetyAnalysis,
        recommendations: recommendations,
        warnings: safetyAnalysis.warnings,
        interactions: safetyAnalysis.interactions,
        dosageVerification: this.verifyDosages(medications)
      };
    } catch (error) {
      console.error('Error scanning prescription:', error);
      throw new Error('Failed to scan prescription');
    }
  }

  async preprocessImage(imageBuffer) {
    try {
      // Use sharp for image preprocessing
      const processedImage = await sharp(imageBuffer)
        .resize(null, 2000, { 
          withoutEnlargement: true,
          fit: 'inside'
        })
        .sharpen()
        .normalize()
        .threshold(128)
        .png()
        .toBuffer();
      
      return processedImage;
    } catch (error) {
      console.error('Error preprocessing image:', error);
      return imageBuffer; // Return original if preprocessing fails
    }
  }

  async extractText(imageBuffer) {
    try {
      const worker = await Tesseract.createWorker('eng');
      const { data: { text, confidence } } = await worker.recognize(imageBuffer);
      await worker.terminate();
      
      return {
        text: text.trim(),
        confidence: confidence
      };
    } catch (error) {
      console.error('Error extracting text:', error);
      throw new Error('OCR failed');
    }
  }

  parsePrescriptionText(text) {
    const prescription = {
      patientName: '',
      date: '',
      doctor: '',
      medications: [],
      instructions: '',
      refills: 0,
      pharmacy: ''
    };

    // Extract patient name (usually at top)
    const nameMatch = text.match(/(?:Patient|Name)[:\s]*([A-Za-z\s]+)/i);
    if (nameMatch) prescription.patientName = nameMatch[1].trim();

    // Extract date
    const dateMatch = text.match(/(\d{1,2}\/\d{1,2}\/\d{4}|\d{1,2}-\d{1,2}-\d{4})/);
    if (dateMatch) prescription.date = dateMatch[1];

    // Extract doctor name
    const doctorMatch = text.match(/(?:Dr|Doctor|Physician)[:\s]*([A-Za-z\s]+)/i);
    if (doctorMatch) prescription.doctor = doctorMatch[1].trim();

    // Extract medications using regex patterns
    const medicationPatterns = [
      /([A-Za-z]+)\s+(\d+(?:\.\d+)?)\s*(mg|mcg|g|ml|units?)\s*(?:tablet|capsule|liquid|injection)?\s*(?:take|q\d+|once|twice|daily|bid|tid|qid)?/gi,
      /([A-Za-z]+)\s+(\d+(?:\.\d+)?)(?:mg|mcg|g|ml|units?)/gi,
      /Rx[:\s]*([A-Za-z]+)\s+(\d+(?:\.\d+)?)\s*(mg|mcg|g|ml|units?)/gi
    ];

    medicationPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const medication = {
          name: match[1].toLowerCase().trim(),
          dosage: match[2],
          unit: match[3] || 'mg',
          frequency: this.extractFrequency(text, match.index),
          instructions: this.extractInstructions(text, match.index)
        };
        
        // Avoid duplicates
        if (!prescription.medications.find(m => m.name === medication.name)) {
          prescription.medications.push(medication);
        }
      }
    });

    // Extract refills
    const refillMatch = text.match(/refills?[:\s]*(\d+)/i);
    if (refillMatch) prescription.refills = parseInt(refillMatch[1]);

    // Extract pharmacy
    const pharmacyMatch = text.match(/(?:Pharmacy|Drugstore)[:\s]*([A-Za-z\s]+)/i);
    if (pharmacyMatch) prescription.pharmacy = pharmacyMatch[1].trim();

    return prescription;
  }

  extractFrequency(text, startIndex) {
    const context = text.substring(Math.max(0, startIndex - 50), startIndex + 100);
    const frequencyPatterns = [
      /once\s*daily/i,
      /twice\s*daily|bid/i,
      /three\s*times\s*daily|tid/i,
      /four\s*times\s*daily|qid/i,
      /every\s*(\d+)\s*hours?/i,
      /q(\d+)/i,
      /as\s*needed/i,
      /prn/i
    ];

    for (const pattern of frequencyPatterns) {
      const match = context.match(pattern);
      if (match) {
        if (match[1]) return `every ${match[1]} hours`;
        return match[0];
      }
    }

    return 'as directed';
  }

  extractInstructions(text, startIndex) {
    const context = text.substring(startIndex, startIndex + 200);
    const instructionPatterns = [
      /take\s+with\s+food/i,
      /take\s+on\s+empty\s+stomach/i,
      /avoid\s+alcohol/i,
      /avoid\s+grapefruit/i,
      /do\s+not\s+crush/i,
      /shake\s+well/i,
      /store\s+in\s+refrigerator/i
    ];

    const instructions = [];
    instructionPatterns.forEach(pattern => {
      const match = context.match(pattern);
      if (match) instructions.push(match[0]);
    });

    return instructions.join(', ');
  }

  async identifyMedications(parsedPrescription) {
    const medications = [];

    for (const med of parsedPrescription.medications) {
      // Try to find exact match first
      let drugInfo = this.drugDatabase.get(med.name);
      
      // If not found, try fuzzy matching
      if (!drugInfo) {
        drugInfo = await this.fuzzyMatchDrug(med.name);
      }

      medications.push({
        ...med,
        drugInfo: drugInfo || this.createDefaultDrugInfo(med.name),
        confidence: drugInfo ? 0.9 : 0.5
      });
    }

    return medications;
  }

  async fuzzyMatchDrug(name) {
    const drugNames = Array.from(this.drugDatabase.keys());
    const normalizedInput = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    let bestMatch = null;
    let bestScore = 0;

    for (const drugName of drugNames) {
      const normalizedDrug = drugName.toLowerCase().replace(/[^a-z0-9]/g, '');
      const score = this.calculateSimilarity(normalizedInput, normalizedDrug);
      
      if (score > bestScore && score > 0.7) {
        bestScore = score;
        bestMatch = this.drugDatabase.get(drugName);
      }
    }

    return bestMatch;
  }

  calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  createDefaultDrugInfo(name) {
    return {
      genericName: name,
      brandNames: [],
      class: 'unknown',
      uses: ['unknown'],
      dosage: { adult: 'consult physician' },
      sideEffects: ['unknown'],
      contraindications: ['unknown'],
      precautions: ['consult physician'],
      confidence: 'low'
    };
  }

  async analyzeSafety(medications) {
    const safetyAnalysis = {
      warnings: [],
      interactions: [],
      contraindications: [],
      precautions: [],
      overallRisk: 'low'
    };

    // Check drug-drug interactions
    for (let i = 0; i < medications.length; i++) {
      for (let j = i + 1; j < medications.length; j++) {
        const interaction = this.checkDrugInteraction(
          medications[i].name,
          medications[j].name
        );
        
        if (interaction) {
          safetyAnalysis.interactions.push({
            drug1: medications[i].name,
            drug2: medications[j].name,
            ...interaction
          });
        }
      }
    }

    // Check individual medication safety
    medications.forEach(med => {
      if (med.drugInfo) {
        // Check contraindications
        med.drugInfo.contraindications.forEach(contra => {
          safetyAnalysis.contraindications.push({
            medication: med.name,
            contraindication: contra,
            severity: 'high'
          });
        });

        // Check precautions
        med.drugInfo.precautions.forEach(prec => {
          safetyAnalysis.precautions.push({
            medication: med.name,
            precaution: prec,
            severity: 'moderate'
          });
        });
      }
    });

    // Check dosage safety
    const dosageIssues = this.checkDosageSafety(medications);
    safetyAnalysis.warnings.push(...dosageIssues);

    // Calculate overall risk
    safetyAnalysis.overallRisk = this.calculateOverallRisk(safetyAnalysis);

    return safetyAnalysis;
  }

  checkDrugInteraction(drug1, drug2) {
    const interactionKey1 = `${drug1}-${drug2}`;
    const interactionKey2 = `${drug2}-${drug1}`;
    
    return this.interactionDatabase.get(interactionKey1) || 
           this.interactionDatabase.get(interactionKey2);
  }

  checkDosageSafety(medications) {
    const warnings = [];

    medications.forEach(med => {
      if (med.drugInfo && med.drugInfo.dosage) {
        const dosage = parseFloat(med.dosage);
        const maxDaily = this.extractMaxDaily(med.drugInfo.dosage.maxDaily);
        
        if (maxDaily && dosage > maxDaily) {
          warnings.push({
            medication: med.name,
            type: 'high_dosage',
            message: `Dosage ${med.dosage}${med.unit} exceeds recommended maximum of ${maxDaily}${med.unit}`,
            severity: 'high'
          });
        }
      }
    });

    return warnings;
  }

  extractMaxDaily(maxDailyStr) {
    if (!maxDailyStr) return null;
    
    const match = maxDailyStr.match(/(\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[1]) : null;
  }

  calculateOverallRisk(safetyAnalysis) {
    let riskScore = 0;
    
    // High severity interactions
    const highSeverityInteractions = safetyAnalysis.interactions.filter(i => i.severity === 'high');
    riskScore += highSeverityInteractions.length * 30;
    
    // Moderate severity interactions
    const moderateSeverityInteractions = safetyAnalysis.interactions.filter(i => i.severity === 'moderate');
    riskScore += moderateSeverityInteractions.length * 15;
    
    // Contraindications
    riskScore += safetyAnalysis.contraindications.length * 25;
    
    // Dosage warnings
    riskScore += safetyAnalysis.warnings.filter(w => w.severity === 'high').length * 20;
    
    if (riskScore >= 50) return 'high';
    if (riskScore >= 25) return 'moderate';
    if (riskScore >= 10) return 'low';
    return 'minimal';
  }

  verifyDosages(medications) {
    const verification = {
      correct: [],
      incorrect: [],
      uncertain: []
    };

    medications.forEach(med => {
      if (med.drugInfo && med.drugInfo.dosage) {
        const dosage = parseFloat(med.dosage);
        const recommendedRange = this.extractDosageRange(med.drugInfo.dosage.adult);
        
        if (recommendedRange) {
          if (dosage >= recommendedRange.min && dosage <= recommendedRange.max) {
            verification.correct.push({
              medication: med.name,
              dosage: `${med.dosage}${med.unit}`,
              recommended: `${recommendedRange.min}-${recommendedRange.max}${med.unit}`
            });
          } else {
            verification.incorrect.push({
              medication: med.name,
              dosage: `${med.dosage}${med.unit}`,
              recommended: `${recommendedRange.min}-${recommendedRange.max}${med.unit}`
            });
          }
        } else {
          verification.uncertain.push({
            medication: med.name,
            dosage: `${med.dosage}${med.unit}`,
            reason: 'No dosage range available'
          });
        }
      } else {
        verification.uncertain.push({
          medication: med.name,
          dosage: `${med.dosage}${med.unit}`,
          reason: 'No drug information available'
        });
      }
    });

    return verification;
  }

  extractDosageRange(dosageStr) {
    if (!dosageStr) return null;
    
    // Extract dosage range from string like "325-1000mg every 4-6 hours"
    const rangeMatch = dosageStr.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)/);
    if (rangeMatch) {
      return {
        min: parseFloat(rangeMatch[1]),
        max: parseFloat(rangeMatch[2])
      };
    }
    
    // Extract single dose
    const singleMatch = dosageStr.match(/(\d+(?:\.\d+)?)/);
    if (singleMatch) {
      const dose = parseFloat(singleMatch[1]);
      return { min: dose, max: dose };
    }
    
    return null;
  }

  generateRecommendations(medications, safetyAnalysis) {
    const recommendations = [];

    // Safety-based recommendations
    if (safetyAnalysis.overallRisk === 'high') {
      recommendations.push({
        priority: 'urgent',
        type: 'safety',
        message: 'Consult pharmacist or physician before taking these medications together',
        reason: 'High risk of serious interactions'
      });
    }

    // Interaction-specific recommendations
    safetyAnalysis.interactions.forEach(interaction => {
      recommendations.push({
        priority: interaction.severity === 'high' ? 'urgent' : 'important',
        type: 'interaction',
        message: `${interaction.drug1} and ${interaction.drug2}: ${interaction.recommendation}`,
        reason: interaction.description
      });
    });

    // Dosage recommendations
    safetyAnalysis.warnings.forEach(warning => {
      recommendations.push({
        priority: warning.severity === 'high' ? 'urgent' : 'important',
        type: 'dosage',
        message: warning.message,
        reason: 'Dosage safety concern'
      });
    });

    // General medication advice
    recommendations.push({
      priority: 'standard',
      type: 'general',
      message: 'Take medications exactly as prescribed',
      reason: 'Ensures effectiveness and safety'
    });

    recommendations.push({
      priority: 'standard',
      type: 'general',
      message: 'Keep list of all medications and show to healthcare providers',
      reason: 'Prevents unintended interactions'
    });

    return recommendations;
  }

  initialize(app, io) {
    // API endpoints
    app.post('/api/prescription/scan', async (req, res) => {
      try {
        const { image } = req.body;
        const result = await this.scanPrescription(Buffer.from(image, 'base64'));
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    app.post('/api/prescription/check-interactions', async (req, res) => {
      try {
        const { medications } = req.body;
        const safetyAnalysis = await this.analyzeSafety(medications);
        res.json(safetyAnalysis);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    app.get('/api/prescription/drug-info/:drugName', (req, res) => {
      const drugName = req.params.drugName.toLowerCase();
      const drugInfo = this.drugDatabase.get(drugName);
      
      if (drugInfo) {
        res.json(drugInfo);
      } else {
        res.status(404).json({ error: 'Drug not found' });
      }
    });

    app.get('/api/prescription/drugs', (req, res) => {
      const drugs = Array.from(this.drugDatabase.entries()).map(([key, value]) => ({
        name: key,
        ...value
      }));
      res.json(drugs);
    });

    app.post('/api/prescription/verify-dosage', (req, res) => {
      try {
        const { medications } = req.body;
        const verification = this.verifyDosages(medications);
        res.json(verification);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
  }
}

module.exports = new PrescriptionScanner();
