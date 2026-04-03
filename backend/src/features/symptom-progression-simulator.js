const tf = require('@tensorflow/tfjs-node');
const natural = require('natural');

class SymptomProgressionSimulator {
  constructor() {
    this.model = null;
    this.symptomDatabase = new Map();
    this.progressionPatterns = new Map();
    this.initializeModel();
    this.loadSymptomData();
  }

  description = "AI Symptom Progression Simulator - Predicts disease progression patterns using machine learning";

  async initializeModel() {
    // Create a neural network for symptom progression prediction
    this.model = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [50], units: 128, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 64, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 32, activation: 'relu' }),
        tf.layers.dense({ units: 10, activation: 'sigmoid' }) // 10 possible disease outcomes
      ]
    });

    this.model.compile({
      optimizer: 'adam',
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    });
  }

  loadSymptomData() {
    // Load comprehensive symptom database
    this.symptomDatabase.set('fever', {
      severity: [1, 2, 3, 4, 5],
      duration: [1, 3, 7, 14, 30],
      associatedConditions: ['flu', 'covid-19', 'malaria', 'dengue', 'sepsis'],
      progressionRate: 0.7
    });

    this.symptomDatabase.set('cough', {
      severity: [1, 2, 3, 4, 5],
      duration: [3, 7, 14, 30, 60],
      associatedConditions: ['common cold', 'flu', 'covid-19', 'pneumonia', 'bronchitis'],
      progressionRate: 0.6
    });

    this.symptomDatabase.set('chest_pain', {
      severity: [2, 4, 6, 8, 10],
      duration: [0.1, 1, 6, 24, 72], // in hours
      associatedConditions: ['heart attack', 'angina', 'pulmonary embolism', 'anxiety', 'GERD'],
      progressionRate: 0.9
    });

    // Load progression patterns
    this.progressionPatterns.set('viral_infection', {
      timeline: ['exposure', 'incubation', 'early_symptoms', 'peak', 'recovery'],
      typicalDuration: 14,
      symptomProgression: {
        'day_1': ['fatigue', 'headache'],
        'day_2': ['fever', 'body_aches'],
        'day_3': ['cough', 'sore_throat'],
        'day_4-7': ['peak_symptoms'],
        'day_8-14': ['gradual_improvement']
      }
    });

    this.progressionPatterns.set('bacterial_infection', {
      timeline: ['exposure', 'incubation', 'onset', 'progression', 'complication', 'recovery'],
      typicalDuration: 21,
      symptomProgression: {
        'day_1': ['localized_symptoms'],
        'day_2-3': ['fever', 'inflammation'],
        'day_4-7': ['worsening_symptoms'],
        'day_8-14': ['antibiotic_response'],
        'day_15-21': ['recovery']
      }
    });
  }

  async simulateProgression(symptoms, patientProfile) {
    try {
      const symptomVector = this.createSymptomVector(symptoms);
      const patientVector = this.createPatientVector(patientProfile);
      
      // Combine symptom and patient data
      const inputVector = tf.concat([symptomVector, patientVector], 0);
      
      // Predict progression
      const prediction = await this.model.predict(inputVector.expandDims(0));
      const probabilities = await prediction.array();
      
      // Generate progression timeline
      const timeline = this.generateProgressionTimeline(symptoms, probabilities[0]);
      
      // Calculate risk scores
      const riskScores = this.calculateRiskScores(symptoms, timeline);
      
      return {
        currentAssessment: this.assessCurrentState(symptoms),
        progressionTimeline: timeline,
        riskScores: riskScores,
        recommendations: this.generateRecommendations(symptoms, timeline, riskScores),
        confidence: this.calculateConfidence(probabilities[0])
      };
    } catch (error) {
      console.error('Error in symptom progression simulation:', error);
      throw new Error('Failed to simulate symptom progression');
    }
  }

  createSymptomVector(symptoms) {
    const vector = new Array(50).fill(0);
    
    symptoms.forEach((symptom, index) => {
      if (index < 50) {
        vector[index] = symptom.severity / 10; // Normalize severity
      }
    });
    
    return tf.tensor1d(vector);
  }

  createPatientVector(profile) {
    const vector = new Array(50).fill(0);
    
    // Age (normalized)
    vector[0] = profile.age / 100;
    
    // Gender
    vector[1] = profile.gender === 'male' ? 1 : 0;
    vector[2] = profile.gender === 'female' ? 1 : 0;
    
    // Pre-existing conditions
    const conditions = ['diabetes', 'hypertension', 'heart_disease', 'asthma', 'obesity'];
    conditions.forEach((condition, index) => {
      vector[3 + index] = profile.preExistingConditions?.includes(condition) ? 1 : 0;
    });
    
    // Lifestyle factors
    vector[8] = profile.smoker ? 1 : 0;
    vector[9] = profile.alcoholConsumption / 10; // Normalized
    vector[10] = profile.exerciseLevel / 5; // Normalized
    
    return tf.tensor1d(vector);
  }

  generateProgressionTimeline(symptoms, probabilities) {
    const timeline = [];
    const maxDays = 30;
    
    // Identify most likely condition
    const maxProbIndex = probabilities.indexOf(Math.max(...probabilities));
    const conditions = ['flu', 'covid-19', 'pneumonia', 'bronchitis', 'heart_attack', 'angina', 'anxiety', 'migraine', 'gastroenteritis', 'allergy'];
    const likelyCondition = conditions[maxProbIndex];
    
    // Get progression pattern for likely condition
    let pattern = this.progressionPatterns.get('viral_infection'); // default
    if (likelyCondition === 'pneumonia' || likelyCondition === 'bronchitis') {
      pattern = this.progressionPatterns.get('bacterial_infection');
    }
    
    // Generate daily progression
    for (let day = 1; day <= maxDays; day++) {
      const dayProgression = this.predictDaySymptoms(day, symptoms, pattern, likelyCondition);
      timeline.push({
        day: day,
        predictedSymptoms: dayProgression.symptoms,
        severity: dayProgression.severity,
        riskLevel: dayProgression.riskLevel,
        recommendations: dayProgression.recommendations
      });
      
      // Stop if recovery is predicted
      if (dayProgression.severity < 2 && day > 7) break;
    }
    
    return timeline;
  }

  predictDaySymptoms(day, currentSymptoms, pattern, condition) {
    const symptoms = { ...currentSymptoms };
    let severity = 0;
    let riskLevel = 'low';
    
    // Apply progression pattern
    Object.keys(pattern.symptomProgression).forEach(key => {
      const dayRange = key.replace('day_', '').split('-');
      const startDay = parseInt(dayRange[0]);
      const endDay = dayRange[1] || startDay;
      
      if (day >= startDay && day <= endDay) {
        const daySymptoms = pattern.symptomProgression[key];
        
        daySymptoms.forEach(symptomName => {
          if (symptomName === 'peak_symptoms') {
            // Intensify existing symptoms
            Object.keys(symptoms).forEach(s => {
              symptoms[s] = Math.min(10, symptoms[s] * 1.2);
            });
          } else if (symptomName === 'gradual_improvement') {
            // Reduce symptom severity
            Object.keys(symptoms).forEach(s => {
              symptoms[s] = Math.max(1, symptoms[s] * 0.8);
            });
          } else if (!symptoms[symptomName]) {
            // Add new symptom
            symptoms[symptomName] = Math.floor(Math.random() * 3) + 2;
          }
        });
      }
    });
    
    // Calculate overall severity
    const symptomValues = Object.values(symptoms);
    severity = symptomValues.reduce((sum, val) => sum + val, 0) / symptomValues.length;
    
    // Determine risk level
    if (severity >= 7) riskLevel = 'critical';
    else if (severity >= 5) riskLevel = 'high';
    else if (severity >= 3) riskLevel = 'moderate';
    
    return {
      symptoms: symptoms,
      severity: Math.round(severity * 10) / 10,
      riskLevel: riskLevel,
      recommendations: this.generateDayRecommendations(severity, riskLevel, day)
    };
  }

  generateDayRecommendations(severity, riskLevel, day) {
    const recommendations = [];
    
    if (riskLevel === 'critical') {
      recommendations.push('Seek immediate medical attention');
      recommendations.push('Call emergency services if symptoms worsen');
    } else if (riskLevel === 'high') {
      recommendations.push('Consult a healthcare provider today');
      recommendations.push('Monitor symptoms closely');
    } else if (riskLevel === 'moderate') {
      recommendations.push('Rest and hydrate');
      recommendations.push('Over-the-counter medication may help');
    } else {
      recommendations.push('Continue monitoring');
      recommendations.push('Maintain healthy habits');
    }
    
    // Day-specific recommendations
    if (day <= 3) {
      recommendations.push('Isolate to prevent potential spread');
    } else if (day >= 7 && severity < 3) {
      recommendations.push('Gradual return to normal activities');
    }
    
    return recommendations;
  }

  calculateRiskScores(symptoms, timeline) {
    const riskScores = {
      overall: 0,
      complications: 0,
      hospitalization: 0,
      chronic: 0
    };
    
    // Calculate based on symptom severity and progression
    const maxSeverity = Math.max(...timeline.map(day => day.severity));
    const avgSeverity = timeline.reduce((sum, day) => sum + day.severity, 0) / timeline.length;
    
    riskScores.overall = Math.round((avgSeverity / 10) * 100);
    riskScores.complications = Math.round((maxSeverity / 10) * 100);
    riskScores.hospitalization = Math.round((maxSeverity >= 7 ? 0.8 : maxSeverity >= 5 ? 0.4 : 0.1) * 100);
    riskScores.chronic = Math.round((timeline.length > 21 ? 0.6 : timeline.length > 14 ? 0.3 : 0.1) * 100);
    
    return riskScores;
  }

  assessCurrentState(symptoms) {
    const totalSymptoms = Object.keys(symptoms).length;
    const avgSeverity = Object.values(symptoms).reduce((sum, val) => sum + val, 0) / totalSymptoms;
    const maxSeverity = Math.max(...Object.values(symptoms));
    
    return {
      symptomCount: totalSymptoms,
      averageSeverity: Math.round(avgSeverity * 10) / 10,
      maxSeverity: maxSeverity,
      urgency: maxSeverity >= 8 ? 'emergency' : maxSeverity >= 6 ? 'urgent' : 'routine',
      primarySymptoms: this.getPrimarySymptoms(symptoms)
    };
  }

  getPrimarySymptoms(symptoms) {
    return Object.entries(symptoms)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([name, severity]) => ({ name, severity }));
  }

  generateRecommendations(symptoms, timeline, riskScores) {
    const recommendations = [];
    
    if (riskScores.overall >= 70) {
      recommendations.push({
        priority: 'high',
        action: 'Seek immediate medical care',
        reasoning: 'High overall risk score indicates serious condition'
      });
    }
    
    if (riskScores.hospitalization >= 50) {
      recommendations.push({
        priority: 'high',
        action: 'Prepare for possible hospitalization',
        reasoning: 'Significant risk of requiring hospital care'
      });
    }
    
    // Symptom-specific recommendations
    Object.entries(symptoms).forEach(([symptom, severity]) => {
      if (symptom === 'fever' && severity >= 7) {
        recommendations.push({
          priority: 'medium',
          action: 'Use fever-reducing medication',
          reasoning: 'High fever requires temperature management'
        });
      }
      
      if (symptom === 'chest_pain' && severity >= 6) {
        recommendations.push({
          priority: 'critical',
          action: 'Call emergency services immediately',
          reasoning: 'Chest pain may indicate cardiac emergency'
        });
      }
    });
    
    return recommendations;
  }

  calculateConfidence(probabilities) {
    const maxProb = Math.max(...probabilities);
    const entropy = -probabilities.reduce((sum, p) => sum + (p * Math.log(p + 1e-10)), 0);
    const confidence = (1 - entropy / Math.log(probabilities.length)) * maxProb;
    
    return Math.round(confidence * 100);
  }

  initialize(app, io) {
    // API endpoints
    app.post('/api/symptom-progression/simulate', async (req, res) => {
      try {
        const { symptoms, patientProfile } = req.body;
        const result = await this.simulateProgression(symptoms, patientProfile);
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    app.get('/api/symptom-progression/symptoms', (req, res) => {
      const symptomList = Array.from(this.symptomDatabase.keys()).map(key => ({
        name: key,
        ...this.symptomDatabase.get(key)
      }));
      res.json(symptomList);
    });

    app.get('/api/symptom-progression/patterns', (req, res) => {
      const patterns = Array.from(this.progressionPatterns.entries()).map(([key, value]) => ({
        condition: key,
        ...value
      }));
      res.json(patterns);
    });

    // Real-time updates
    io.on('symptom_update', (data) => {
      this.simulateProgression(data.symptoms, data.patientProfile)
        .then(result => {
          io.emit('progression_update', result);
        })
        .catch(error => {
          io.emit('error', { message: error.message });
        });
    });
  }
}

module.exports = new SymptomProgressionSimulator();
