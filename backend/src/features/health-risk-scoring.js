const tf = require('@tensorflow/tfjs-node');
const _ = require('lodash');

class HealthRiskScoring {
  constructor() {
    this.riskModel = null;
    this.riskFactors = new Map();
    this.populationData = new Map();
    this.initializeModel();
    this.loadRiskFactors();
  }

  description = "Personalized Health Risk Scoring - Individualized risk assessment using AI algorithms";

  async initializeModel() {
    // Create neural network for comprehensive risk assessment
    this.riskModel = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [100], units: 256, activation: 'relu' }),
        tf.layers.batchNormalization(),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({ units: 128, activation: 'relu' }),
        tf.layers.batchNormalization(),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({ units: 64, activation: 'relu' }),
        tf.layers.dense({ units: 32, activation: 'relu' }),
        tf.layers.dense({ units: 15, activation: 'sigmoid' }) // 15 disease categories
      ]
    });

    this.riskModel.compile({
      optimizer: 'adam',
      loss: 'binaryCrossentropy',
      metrics: ['accuracy', 'precision', 'recall']
    });
  }

  loadRiskFactors() {
    // Load comprehensive risk factor database
    this.riskFactors.set('cardiovascular', {
      factors: {
        age: { weight: 0.3, threshold: 45 },
        blood_pressure: { weight: 0.25, threshold: 140/90 },
        cholesterol: { weight: 0.2, threshold: 200 },
        smoking: { weight: 0.15, threshold: 1 },
        family_history: { weight: 0.1, threshold: 1 }
      },
      baseRisk: 0.05
    });

    this.riskFactors.set('diabetes', {
      factors: {
        age: { weight: 0.2, threshold: 40 },
        bmi: { weight: 0.25, threshold: 25 },
        family_history: { weight: 0.2, threshold: 1 },
        physical_activity: { weight: 0.15, threshold: 3 }, // hours per week
        diet_quality: { weight: 0.1, threshold: 5 }, // 1-10 scale
        blood_sugar: { weight: 0.1, threshold: 100 }
      },
      baseRisk: 0.08
    });

    this.riskFactors.set('cancer', {
      factors: {
        age: { weight: 0.25, threshold: 50 },
        family_history: { weight: 0.2, threshold: 1 },
        smoking: { weight: 0.15, threshold: 1 },
        alcohol: { weight: 0.1, threshold: 2 }, // drinks per day
        environmental_exposure: { weight: 0.1, threshold: 1 },
        diet_quality: { weight: 0.1, threshold: 5 },
        physical_activity: { weight: 0.1, threshold: 3 }
      },
      baseRisk: 0.04
    });

    this.riskFactors.set('respiratory', {
      factors: {
        smoking: { weight: 0.3, threshold: 1 },
        air_pollution: { weight: 0.2, threshold: 50 }, // AQI
        occupational_exposure: { weight: 0.15, threshold: 1 },
        family_history: { weight: 0.1, threshold: 1 },
        age: { weight: 0.1, threshold: 40 },
        allergies: { weight: 0.05, threshold: 1 },
        infections: { weight: 0.1, threshold: 3 } // per year
      },
      baseRisk: 0.06
    });

    this.riskFactors.set('mental_health', {
      factors: {
        stress_level: { weight: 0.25, threshold: 7 }, // 1-10 scale
        social_support: { weight: 0.2, threshold: 5 }, // 1-10 scale
        sleep_quality: { weight: 0.15, threshold: 6 }, // hours per night
        physical_activity: { weight: 0.1, threshold: 3 },
        trauma_history: { weight: 0.15, threshold: 1 },
        substance_use: { weight: 0.1, threshold: 1 },
        family_history: { weight: 0.05, threshold: 1 }
      },
      baseRisk: 0.12
    });

    // Load population statistics for normalization
    this.populationData.set('age_distribution', {
      '25-34': 0.2, '35-44': 0.18, '45-54': 0.16, '55-64': 0.14,
      '65-74': 0.12, '75-84': 0.08, '85+': 0.02
    });

    this.populationData.set('gender_distribution', { male: 0.49, female: 0.51 });
    this.populationData.set('smoking_rate', 0.14);
    this.populationData.set('obesity_rate', 0.32);
  }

  async calculateComprehensiveRisk(profile) {
    try {
      const riskVector = this.createRiskVector(profile);
      const prediction = await this.riskModel.predict(riskVector.expandDims(0));
      const probabilities = await prediction.array();
      
      // Calculate individual category risks
      const categoryRisks = this.calculateCategoryRisks(profile);
      
      // Calculate overall health score
      const healthScore = this.calculateOverallHealthScore(profile, categoryRisks);
      
      // Generate risk timeline
      const riskTimeline = this.generateRiskTimeline(profile, categoryRisks);
      
      // Identify modifiable risks
      const modifiableRisks = this.identifyModifiableRisks(categoryRisks);
      
      // Calculate biological age
      const biologicalAge = this.calculateBiologicalAge(profile, categoryRisks);
      
      return {
        overallRisk: Math.round(healthScore.risk * 100),
        healthScore: Math.round(healthScore.score),
        biologicalAge: biologicalAge,
        categoryRisks: categoryRisks,
        riskTimeline: riskTimeline,
        modifiableRisks: modifiableRisks,
        recommendations: this.generateRiskRecommendations(categoryRisks, modifiableRisks),
        percentileRanking: this.calculatePercentileRanking(profile),
        confidence: this.calculateRiskConfidence(probabilities[0])
      };
    } catch (error) {
      console.error('Error calculating comprehensive risk:', error);
      throw new Error('Failed to calculate health risk scores');
    }
  }

  createRiskVector(profile) {
    const vector = new Array(100).fill(0);
    let index = 0;
    
    // Demographics (0-9)
    vector[index++] = profile.age / 100;
    vector[index++] = profile.gender === 'male' ? 1 : 0;
    vector[index++] = profile.gender === 'female' ? 1 : 0;
    vector[index++] = profile.ethnicity === 'caucasian' ? 1 : 0;
    vector[index++] = profile.ethnicity === 'african' ? 1 : 0;
    vector[index++] = profile.ethnicity === 'asian' ? 1 : 0;
    vector[index++] = profile.ethnicity === 'hispanic' ? 1 : 0;
    vector[index++] = profile.ethnicity === 'other' ? 1 : 0;
    vector[index++] = profile.height / 200; // normalized
    vector[index++] = profile.weight / 200; // normalized
    
    // Vital signs (10-19)
    vector[index++] = (profile.bloodPressure?.systolic || 120) / 200;
    vector[index++] = (profile.bloodPressure?.diastolic || 80) / 120;
    vector[index++] = (profile.heartRate || 70) / 120;
    vector[index++] = (profile.temperature || 98.6) / 105;
    vector[index++] = (profile.respiratoryRate || 16) / 30;
    vector[index++] = (profile.oxygenSaturation || 98) / 100;
    vector[index++] = (profile.bloodSugar || 90) / 200;
    vector[index++] = (profile.bmi || 22) / 40;
    vector[index++] = (profile.bodyFat || 20) / 50;
    vector[index++] = (profile.muscleMass || 40) / 100;
    
    // Lifestyle (20-39)
    vector[index++] = profile.smoker ? 1 : 0;
    vector[index++] = profile.alcoholConsumption / 10; // drinks per week
    vector[index++] = profile.exerciseLevel / 7; // days per week
    vector[index++] = profile.dietQuality / 10; // 1-10 scale
    vector[index++] = profile.sleepHours / 12;
    vector[index++] = profile.sleepQuality / 10;
    vector[index++] = profile.stressLevel / 10;
    vector[index++] = profile.socialSupport / 10;
    vector[index++] = profile.workStress / 10;
    vector[index++] = profile.financialStress / 10;
    
    // Medical history (40-69)
    const conditions = ['diabetes', 'hypertension', 'heart_disease', 'stroke', 'cancer', 
                        'asthma', 'copd', 'arthritis', 'depression', 'anxiety',
                        'kidney_disease', 'liver_disease', 'thyroid', 'migraine', 'epilepsy'];
    conditions.forEach(condition => {
      vector[index++] = profile.medicalHistory?.includes(condition) ? 1 : 0;
    });
    
    // Family history (70-84)
    conditions.forEach(condition => {
      vector[index++] = profile.familyHistory?.includes(condition) ? 1 : 0;
    });
    
    // Environmental factors (85-99)
    vector[index++] = profile.airQuality / 500; // AQI normalized
    vector[index++] = profile.waterQuality / 10;
    vector[index++] = profile.noiseLevel / 100;
    vector[index++] = profile.radiationExposure ? 1 : 0;
    vector[index++] = profile.chemicalExposure ? 1 : 0;
    vector[index++] = profile.occupationalHazards ? 1 : 0;
    vector[index++] = profile.urbanLiving ? 1 : 0;
    vector[index++] = profile.accessToHealthcare / 10;
    vector[index++] = profile.educationLevel / 20;
    vector[index++] = profile.incomeLevel / 100000;
    vector[index++] = profile.healthInsurance ? 1 : 0;
    vector[index++] = profile.preventiveCare / 10;
    vector[index++] = profile.screeningCompliance / 10;
    vector[index++] = profile.medicationAdherence / 10;
    vector[index++] = profile.vaccinationStatus / 10;
    
    return tf.tensor1d(vector);
  }

  calculateCategoryRisks(profile) {
    const categories = ['cardiovascular', 'diabetes', 'cancer', 'respiratory', 'mental_health'];
    const risks = {};
    
    categories.forEach(category => {
      risks[category] = this.calculateCategoryRisk(profile, category);
    });
    
    return risks;
  }

  calculateCategoryRisk(profile, category) {
    const categoryData = this.riskFactors.get(category);
    if (!categoryData) return 0;
    
    let riskScore = categoryData.baseRisk;
    const factorContributions = {};
    
    Object.entries(categoryData.factors).forEach(([factor, config]) => {
      const value = this.getFactorValue(profile, factor);
      let contribution = 0;
      
      if (typeof value === 'boolean') {
        contribution = value ? config.weight : 0;
      } else if (typeof value === 'number') {
        if (factor.includes('quality') || factor.includes('support')) {
          // Higher is better for quality/support factors
          contribution = value < config.threshold ? config.weight : 0;
        } else {
          // Lower is better for most health metrics
          contribution = value > config.threshold ? config.weight : 0;
        }
      }
      
      factorContributions[factor] = contribution;
      riskScore += contribution;
    });
    
    // Apply age multiplier
    const ageMultiplier = 1 + (profile.age - 40) * 0.01;
    riskScore *= ageMultiplier;
    
    // Cap at 100%
    riskScore = Math.min(riskScore, 1);
    
    return {
      score: Math.round(riskScore * 100),
      level: this.getRiskLevel(riskScore),
      factors: factorContributions,
      primaryFactors: this.getPrimaryFactors(factorContributions)
    };
  }

  getFactorValue(profile, factor) {
    const factorMap = {
      'age': profile.age,
      'blood_pressure': Math.max(profile.bloodPressure?.systolic || 120, profile.bloodPressure?.diastolic || 80),
      'cholesterol': profile.cholesterol || 180,
      'smoking': profile.smoker,
      'family_history': profile.familyHistory?.length > 0,
      'bmi': profile.bmi || (profile.weight / ((profile.height / 100) ** 2)),
      'physical_activity': profile.exerciseLevel,
      'diet_quality': profile.dietQuality || 5,
      'blood_sugar': profile.bloodSugar || 90,
      'alcohol': profile.alcoholConsumption,
      'air_pollution': profile.airQuality || 50,
      'occupational_exposure': profile.occupationalHazards,
      'allergies': profile.allergies?.length > 0,
      'infections': profile.respiratoryInfections || 2,
      'stress_level': profile.stressLevel || 5,
      'social_support': profile.socialSupport || 5,
      'sleep_quality': profile.sleepHours || 7,
      'trauma_history': profile.traumaHistory,
      'substance_use': profile.substanceUse
    };
    
    return factorMap[factor] || 0;
  }

  getRiskLevel(score) {
    if (score >= 0.8) return 'very_high';
    if (score >= 0.6) return 'high';
    if (score >= 0.4) return 'moderate';
    if (score >= 0.2) return 'low';
    return 'very_low';
  }

  getPrimaryFactors(factorContributions) {
    return Object.entries(factorContributions)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([factor, contribution]) => ({ factor, contribution }));
  }

  calculateOverallHealthScore(profile, categoryRisks) {
    const categoryScores = Object.values(categoryRisks).map(risk => risk.score / 100);
    const avgRisk = categoryScores.reduce((sum, score) => sum + score, 0) / categoryScores.length;
    
    // Calculate health score (inverse of risk)
    const healthScore = Math.max(0, 100 - (avgRisk * 100));
    
    // Apply modifiers
    let modifier = 1;
    if (profile.exerciseLevel >= 5) modifier *= 1.1;
    if (profile.dietQuality >= 7) modifier *= 1.1;
    if (profile.smoker) modifier *= 0.9;
    if (profile.sleepHours >= 7) modifier *= 1.05;
    
    const finalHealthScore = Math.min(100, healthScore * modifier);
    
    return {
      score: Math.round(finalHealthScore),
      risk: avgRisk,
      grade: this.getHealthGrade(finalHealthScore)
    };
  }

  getHealthGrade(score) {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  generateRiskTimeline(profile, categoryRisks) {
    const timeline = [];
    const currentAge = profile.age;
    const maxAge = 100;
    
    for (let age = currentAge + 5; age <= maxAge; age += 5) {
      const ageProfile = { ...profile, age: age };
      const futureRisks = this.calculateCategoryRisks(ageProfile);
      
      timeline.push({
        age: age,
        projectedRisks: futureRisks,
        riskChange: this.calculateRiskChange(categoryRisks, futureRisks),
        criticalPoints: this.identifyCriticalPoints(age, futureRisks)
      });
    }
    
    return timeline;
  }

  calculateRiskChange(currentRisks, futureRisks) {
    const changes = {};
    
    Object.keys(currentRisks).forEach(category => {
      const currentScore = currentRisks[category].score;
      const futureScore = futureRisks[category].score;
      changes[category] = {
        absolute: futureScore - currentScore,
        percentage: ((futureScore - currentScore) / currentScore) * 100
      };
    });
    
    return changes;
  }

  identifyCriticalPoints(age, risks) {
    const criticalPoints = [];
    
    Object.entries(risks).forEach(([category, risk]) => {
      if (risk.score >= 70) {
        criticalPoints.push({
          category: category,
          age: age,
          severity: 'high',
          recommendation: `Intensive monitoring for ${category} risks recommended`
        });
      }
    });
    
    return criticalPoints;
  }

  identifyModifiableRisks(categoryRisks) {
    const modifiable = [];
    
    Object.entries(categoryRisks).forEach(([category, risk]) => {
      const modifiableFactors = risk.primaryFactors.filter(factor => 
        this.isModifiableFactor(factor.factor)
      );
      
      if (modifiableFactors.length > 0) {
        modifiable.push({
          category: category,
          currentScore: risk.score,
          potentialReduction: this.calculatePotentialReduction(modifiableFactors),
          factors: modifiableFactors,
          actions: this.getModificationActions(modifiableFactors)
        });
      }
    });
    
    return modifiable;
  }

  isModifiableFactor(factor) {
    const modifiableFactors = [
      'smoking', 'alcohol', 'physical_activity', 'diet_quality',
      'sleep_quality', 'stress_level', 'weight', 'blood_pressure'
    ];
    return modifiableFactors.includes(factor);
  }

  calculatePotentialReduction(factors) {
    const totalWeight = factors.reduce((sum, factor) => sum + factor.contribution, 0);
    return Math.round(totalWeight * 100); // Convert to percentage
  }

  getModificationActions(factors) {
    const actions = [];
    
    factors.forEach(factor => {
      switch (factor.factor) {
        case 'smoking':
          actions.push('Quit smoking program');
          actions.push('Nicotine replacement therapy');
          break;
        case 'physical_activity':
          actions.push('Increase exercise to 150 minutes/week');
          actions.push('Join fitness program');
          break;
        case 'diet_quality':
          actions.push('Adopt Mediterranean diet');
          actions.push('Consult nutritionist');
          break;
        case 'weight':
          actions.push('Achieve healthy BMI (18.5-24.9)');
          actions.push('Weight management program');
          break;
        case 'stress_level':
          actions.push('Stress management techniques');
          actions.push('Mindfulness and meditation');
          break;
      }
    });
    
    return [...new Set(actions)]; // Remove duplicates
  }

  generateRiskRecommendations(categoryRisks, modifiableRisks) {
    const recommendations = [];
    
    // High-risk category recommendations
    Object.entries(categoryRisks).forEach(([category, risk]) => {
      if (risk.level === 'high' || risk.level === 'very_high') {
        recommendations.push({
          priority: 'high',
          category: category,
          action: `Immediate medical consultation for ${category} risk`,
          reasoning: `Risk score of ${risk.score}% requires professional attention`
        });
      }
    });
    
    // Modifiable risk recommendations
    modifiableRisks.forEach(modifiable => {
      modifiable.actions.forEach(action => {
        recommendations.push({
          priority: 'medium',
          category: modifiable.category,
          action: action,
          reasoning: `Could reduce ${modifiable.category} risk by ${modifiable.potentialReduction}%`,
          potentialImpact: modifiable.potentialReduction
        });
      });
    });
    
    return recommendations;
  }

  calculateBiologicalAge(profile, categoryRisks) {
    const chronologicalAge = profile.age;
    const avgRiskScore = Object.values(categoryRisks).reduce((sum, risk) => sum + risk.score, 0) / Object.keys(categoryRisks).length;
    
    // Calculate biological age based on risk factors
    let ageModifier = 0;
    
    if (avgRiskScore > 70) ageModifier += 10;
    else if (avgRiskScore > 50) ageModifier += 5;
    else if (avgRiskScore < 30) ageModifier -= 3;
    else if (avgRiskScore < 20) ageModifier -= 5;
    
    // Lifestyle modifiers
    if (profile.exerciseLevel >= 5) ageModifier -= 2;
    if (profile.smoker) ageModifier += 5;
    if (profile.dietQuality >= 8) ageModifier -= 2;
    if (profile.sleepHours >= 8) ageModifier -= 1;
    
    const biologicalAge = chronologicalAge + ageModifier;
    
    return {
      biological: Math.round(biologicalAge),
      chronological: chronologicalAge,
      ageGap: Math.round(biologicalAge - chronologicalAge),
      interpretation: this.interpretAgeGap(biologicalAge - chronologicalAge)
    };
  }

  interpretAgeGap(gap) {
    if (gap > 5) return 'Your biological age is significantly higher than your chronological age';
    if (gap > 2) return 'Your biological age is higher than your chronological age';
    if (gap > -2) return 'Your biological age matches your chronological age';
    if (gap > -5) return 'Your biological age is lower than your chronological age';
    return 'Your biological age is significantly lower than your chronological age';
  }

  calculatePercentileRanking(profile) {
    // Simplified percentile calculation based on population data
    const ageGroup = this.getAgeGroup(profile.age);
    const populationPercentile = this.populationData.get('age_distribution').get(ageGroup) || 0.5;
    
    // Adjust based on health factors
    let percentile = populationPercentile * 100;
    
    if (profile.exerciseLevel > 3) percentile += 10;
    if (profile.smoker) percentile -= 15;
    if (profile.bmi > 30) percentile -= 10;
    
    return Math.max(0, Math.min(100, percentile));
  }

  getAgeGroup(age) {
    if (age < 35) return '25-34';
    if (age < 45) return '35-44';
    if (age < 55) return '45-54';
    if (age < 65) return '55-64';
    if (age < 75) return '65-74';
    if (age < 85) return '75-84';
    return '85+';
  }

  calculateRiskConfidence(probabilities) {
    const maxProb = Math.max(...probabilities);
    const entropy = -probabilities.reduce((sum, p) => sum + (p * Math.log(p + 1e-10)), 0);
    const confidence = (1 - entropy / Math.log(probabilities.length)) * maxProb;
    
    return Math.round(confidence * 100);
  }

  initialize(app, io) {
    // API endpoints
    app.post('/api/health-risk/calculate', async (req, res) => {
      try {
        const profile = req.body;
        const result = await this.calculateComprehensiveRisk(profile);
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    app.get('/api/health-risk/factors', (req, res) => {
      const factors = Array.from(this.riskFactors.entries()).map(([key, value]) => ({
        category: key,
        factors: value.factors,
        baseRisk: value.baseRisk
      }));
      res.json(factors);
    });

    app.post('/api/health-risk/biological-age', async (req, res) => {
      try {
        const profile = req.body;
        const categoryRisks = this.calculateCategoryRisks(profile);
        const biologicalAge = this.calculateBiologicalAge(profile, categoryRisks);
        res.json(biologicalAge);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    app.post('/api/health-risk/timeline', async (req, res) => {
      try {
        const profile = req.body;
        const categoryRisks = this.calculateCategoryRisks(profile);
        const timeline = this.generateRiskTimeline(profile, categoryRisks);
        res.json(timeline);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
  }
}

module.exports = new HealthRiskScoring();
