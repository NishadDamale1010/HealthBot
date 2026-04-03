const tf = require('@tensorflow/tfjs-node');
const geolib = require('geolib');

class EmergencyDetection {
  constructor() {
    this.emergencyModel = null;
    this.vitalSignsThresholds = new Map();
    this.emergencyProtocols = new Map();
    this.emergencyContacts = new Map();
    this.initializeModel();
    this.loadEmergencyData();
  }

  description = "Real-Time Emergency Detection Mode - Critical symptom monitoring and alert system";

  async initializeModel() {
    // Create neural network for emergency detection
    this.emergencyModel = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [50], units: 128, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 64, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 32, activation: 'relu' }),
        tf.layers.dense({ units: 5, activation: 'sigmoid' }) // 5 emergency categories
      ]
    });

    this.emergencyModel.compile({
      optimizer: 'adam',
      loss: 'binaryCrossentropy',
      metrics: ['accuracy', 'precision', 'recall']
    });
  }

  loadEmergencyData() {
    // Load vital signs thresholds
    this.vitalSignsThresholds.set('heart_rate', {
      critical_low: 40,
      low: 50,
      normal_high: 100,
      high: 120,
      critical_high: 150,
      unit: 'bpm'
    });

    this.vitalSignsThresholds.set('blood_pressure_systolic', {
      critical_low: 70,
      low: 90,
      normal_high: 130,
      high: 140,
      critical_high: 180,
      unit: 'mmHg'
    });

    this.vitalSignsThresholds.set('blood_pressure_diastolic', {
      critical_low: 40,
      low: 60,
      normal_high: 85,
      high: 90,
      critical_high: 120,
      unit: 'mmHg'
    });

    this.vitalSignsThresholds.set('oxygen_saturation', {
      critical_low: 85,
      low: 90,
      normal_high: 100,
      unit: '%'
    });

    this.vitalSignsThresholds.set('respiratory_rate', {
      critical_low: 8,
      low: 12,
      normal_high: 20,
      high: 24,
      critical_high: 30,
      unit: 'breaths/min'
    });

    this.vitalSignsThresholds.set('temperature', {
      critical_low: 35.0,
      low: 36.0,
      normal_high: 37.5,
      high: 38.5,
      critical_high: 40.0,
      unit: '°C'
    });

    // Load emergency protocols
    this.emergencyProtocols.set('cardiac_arrest', {
      symptoms: ['chest_pain', 'shortness_of_breath', 'loss_of_consciousness', 'irregular_heartbeat'],
      vitalSigns: {
        heart_rate: { condition: 'critical_low_or_high', threshold: 0 },
        blood_pressure: { condition: 'critical_low', threshold: 70 }
      },
      priority: 'critical',
      response_time: 'immediate',
      actions: ['call_911', 'start_cpr_if_needed', 'use_aed_if_available', 'monitor_vitals'],
      prehospital_instructions: [
        'Check responsiveness and breathing',
        'Call emergency services immediately',
        'Begin CPR if trained and no pulse',
        'Use AED if available'
      ]
    });

    this.emergencyProtocols.set('stroke', {
      symptoms: ['facial_droop', 'arm_weakness', 'speech_difficulty', 'vision_changes', 'severe_headache'],
      vitalSigns: {
        blood_pressure: { condition: 'critical_high', threshold: 180 }
      },
      priority: 'critical',
      response_time: 'immediate',
      actions: ['call_911', 'note_time_of_onset', 'keep_patient_calm', 'monitor_vitals'],
      prehospital_instructions: [
        'Use FAST to recognize stroke signs',
        'Note exact time symptoms started',
        'Keep patient comfortable and calm',
        'Do not give food or drink'
      ]
    });

    this.emergencyProtocols.set('severe_bleeding', {
      symptoms: ['heavy_bleeding', 'pale_skin', 'rapid_heartbeat', 'dizziness', 'fainting'],
      vitalSigns: {
        heart_rate: { condition: 'high', threshold: 120 },
        blood_pressure: { condition: 'low', threshold: 90 }
      },
      priority: 'critical',
      response_time: 'immediate',
      actions: ['apply_direct_pressure', 'call_911', 'elevate_injured_area', 'monitor_shock'],
      prehospital_instructions: [
        'Apply firm, direct pressure to wound',
        'Elevate injured area above heart',
        'Apply tourniquet only if severe and trained',
        'Keep patient warm and calm'
      ]
    });

    this.emergencyProtocols.set('respiratory_distress', {
      symptoms: ['severe_shortness_of_breath', 'wheezing', 'chest_tightness', 'blue_lips', 'confusion'],
      vitalSigns: {
        oxygen_saturation: { condition: 'critical_low', threshold: 85 },
        respiratory_rate: { condition: 'critical_high', threshold: 30 }
      },
      priority: 'critical',
      response_time: 'immediate',
      actions: ['call_911', 'help_patient_sit_up', 'provide_oxygen_if_available', 'monitor_breathing'],
      prehospital_instructions: [
        'Help patient sit upright',
        'Loosen tight clothing',
        'Use prescribed inhaler if available',
        'Monitor breathing and consciousness'
      ]
    });

    this.emergencyProtocols.set('anaphylaxis', {
      symptoms: ['difficulty_breathing', 'swelling_face_lips', 'hives', 'vomiting', 'dizziness'],
      vitalSigns: {
        blood_pressure: { condition: 'low', threshold: 90 }
      },
      priority: 'critical',
      response_time: 'immediate',
      actions: ['call_911', 'administer_epinephrine_if_available', 'keep_patient_lying_down', 'monitor_vitals'],
      prehospital_instructions: [
        'Administer epinephrine auto-injector if available',
        'Keep patient lying flat with legs elevated',
        'Loosen tight clothing',
        'Monitor breathing and consciousness'
      ]
    });

    this.emergencyProtocols.set('hypoglycemia', {
      symptoms: ['shakiness', 'sweating', 'confusion', 'irritability', 'loss_of_consciousness'],
      vitalSigns: {
        blood_sugar: { condition: 'critical_low', threshold: 50 }
      },
      priority: 'high',
      response_time: 'immediate',
      actions: ['give_fast_acting_sugar', 'monitor_glucose', 'call_911_if_unconscious', 'administer_glucagon'],
      prehospital_instructions: [
        'Give 15g fast-acting carbohydrates',
        'Recheck blood sugar in 15 minutes',
        'Call 911 if patient loses consciousness',
        'Do not give food if unconscious'
      ]
    });
  }

  async detectEmergency(patientData) {
    try {
      // Step 1: Analyze vital signs
      const vitalSignsAnalysis = this.analyzeVitalSigns(patientData.vitalSigns);
      
      // Step 2: Analyze symptoms
      const symptomsAnalysis = this.analyzeSymptoms(patientData.symptoms);
      
      // Step 3: Use ML model for prediction
      const emergencyVector = this.createEmergencyVector(patientData);
      const prediction = await this.emergencyModel.predict(emergencyVector.expandDims(0));
      const emergencyProbabilities = await prediction.array();
      
      // Step 4: Identify emergency type
      const emergencyType = this.identifyEmergencyType(vitalSignsAnalysis, symptomsAnalysis, emergencyProbabilities[0]);
      
      // Step 5: Calculate emergency severity
      const severity = this.calculateEmergencySeverity(emergencyType, vitalSignsAnalysis, symptomsAnalysis);
      
      // Step 6: Generate emergency response plan
      const responsePlan = this.generateEmergencyResponse(emergencyType, severity, patientData);
      
      // Step 7: Find nearest emergency services
      const nearbyServices = await this.findNearbyEmergencyServices(patientData.location);
      
      return {
        isEmergency: emergencyType !== null,
        emergencyType: emergencyType,
        severity: severity,
        vitalSignsAnalysis: vitalSignsAnalysis,
        symptomsAnalysis: symptomsAnalysis,
        responsePlan: responsePlan,
        nearbyServices: nearbyServices,
        confidence: this.calculateEmergencyConfidence(emergencyProbabilities[0]),
        timestamp: new Date().toISOString(),
        requiresImmediateAction: severity.level === 'critical'
      };
    } catch (error) {
      console.error('Error detecting emergency:', error);
      throw new Error('Failed to detect emergency');
    }
  }

  analyzeVitalSigns(vitalSigns) {
    const analysis = {
      overallStatus: 'normal',
      criticalFindings: [],
      abnormalFindings: [],
      trends: [],
      riskScore: 0
    };

    Object.entries(vitalSigns).forEach(([vital, value]) => {
      const thresholds = this.vitalSignsThresholds.get(vital);
      if (!thresholds) return;

      const finding = this.assessVitalSign(vital, value, thresholds);
      
      if (finding.status === 'critical') {
        analysis.criticalFindings.push(finding);
        analysis.riskScore += 30;
      } else if (finding.status === 'abnormal') {
        analysis.abnormalFindings.push(finding);
        analysis.riskScore += 10;
      }
    });

    // Determine overall status
    if (analysis.criticalFindings.length > 0) {
      analysis.overallStatus = 'critical';
    } else if (analysis.abnormalFindings.length > 0) {
      analysis.overallStatus = 'abnormal';
    }

    return analysis;
  }

  assessVitalSign(vital, value, thresholds) {
    let status = 'normal';
    let severity = 'normal';
    let interpretation = '';

    if (value <= thresholds.critical_low) {
      status = 'critical';
      severity = 'critical_low';
      interpretation = `Critically low ${vital}`;
    } else if (value <= thresholds.low) {
      status = 'abnormal';
      severity = 'low';
      interpretation = `Low ${vital}`;
    } else if (vital !== 'oxygen_saturation' && value >= thresholds.critical_high) {
      status = 'critical';
      severity = 'critical_high';
      interpretation = `Critically high ${vital}`;
    } else if (vital !== 'oxygen_saturation' && value >= thresholds.high) {
      status = 'abnormal';
      severity = 'high';
      interpretation = `High ${vital}`;
    } else if (vital === 'oxygen_saturation' && value < thresholds.normal_high) {
      status = 'abnormal';
      severity = 'low';
      interpretation = `Low ${vital}`;
    }

    return {
      vital: vital,
      value: value,
      unit: thresholds.unit,
      status: status,
      severity: severity,
      interpretation: interpretation,
      threshold: thresholds
    };
  }

  analyzeSymptoms(symptoms) {
    const analysis = {
      overallSeverity: 'mild',
      criticalSymptoms: [],
      severeSymptoms: [],
      moderateSymptoms: [],
      mildSymptoms: [],
      symptomScore: 0
    };

    const symptomSeverityMap = {
      'chest_pain': { severity: 'critical', score: 25 },
      'shortness_of_breath': { severity: 'critical', score: 20 },
      'loss_of_consciousness': { severity: 'critical', score: 30 },
      'severe_bleeding': { severity: 'critical', score: 25 },
      'difficulty_breathing': { severity: 'critical', score: 20 },
      'facial_droop': { severity: 'critical', score: 25 },
      'arm_weakness': { severity: 'critical', score: 20 },
      'speech_difficulty': { severity: 'critical', score: 20 },
      
      'severe_headache': { severity: 'severe', score: 15 },
      'vision_changes': { severity: 'severe', score: 15 },
      'confusion': { severity: 'severe', score: 15 },
      'wheezing': { severity: 'severe', score: 12 },
      'swelling_face_lips': { severity: 'severe', score: 15 },
      'hives': { severity: 'severe', score: 10 },
      'vomiting': { severity: 'severe', score: 10 },
      
      'dizziness': { severity: 'moderate', score: 8 },
      'fainting': { severity: 'moderate', score: 12 },
      'pale_skin': { severity: 'moderate', score: 8 },
      'rapid_heartbeat': { severity: 'moderate', score: 10 },
      'chest_tightness': { severity: 'moderate', score: 10 },
      'blue_lips': { severity: 'moderate', score: 12 },
      
      'mild_headache': { severity: 'mild', score: 5 },
      'nausea': { severity: 'mild', score: 5 },
      'fatigue': { severity: 'mild', score: 3 },
      'shakiness': { severity: 'mild', score: 5 },
      'sweating': { severity: 'mild', score: 5 }
    };

    symptoms.forEach(symptom => {
      const symptomInfo = symptomSeverityMap[symptom];
      if (symptomInfo) {
        const symptomObj = {
          name: symptom,
          severity: symptomInfo.severity,
          score: symptomInfo.score
        };

        switch (symptomInfo.severity) {
          case 'critical':
            analysis.criticalSymptoms.push(symptomObj);
            break;
          case 'severe':
            analysis.severeSymptoms.push(symptomObj);
            break;
          case 'moderate':
            analysis.moderateSymptoms.push(symptomObj);
            break;
          case 'mild':
            analysis.mildSymptoms.push(symptomObj);
            break;
        }

        analysis.symptomScore += symptomInfo.score;
      }
    });

    // Determine overall severity
    if (analysis.criticalSymptoms.length > 0) {
      analysis.overallSeverity = 'critical';
    } else if (analysis.severeSymptoms.length > 0) {
      analysis.overallSeverity = 'severe';
    } else if (analysis.moderateSymptoms.length > 0) {
      analysis.overallSeverity = 'moderate';
    }

    return analysis;
  }

  createEmergencyVector(patientData) {
    const vector = new Array(50).fill(0);
    let index = 0;

    // Vital signs (0-9)
    vector[index++] = (patientData.vitalSigns?.heartRate || 70) / 200;
    vector[index++] = (patientData.vitalSigns?.bloodPressure?.systolic || 120) / 200;
    vector[index++] = (patientData.vitalSigns?.bloodPressure?.diastolic || 80) / 120;
    vector[index++] = (patientData.vitalSigns?.oxygenSaturation || 98) / 100;
    vector[index++] = (patientData.vitalSigns?.respiratoryRate || 16) / 40;
    vector[index++] = (patientData.vitalSigns?.temperature || 37) / 42;
    vector[index++] = (patientData.vitalSigns?.bloodSugar || 90) / 400;
    vector[index++] = (patientData.vitalSigns?.consciousness === 'alert' ? 1 : 0);
    vector[index++] = (patientData.vitalSigns?.consciousness === 'confused' ? 1 : 0);
    vector[index++] = (patientData.vitalSigns?.consciousness === 'unconscious' ? 1 : 0);

    // Symptoms (10-29)
    const emergencySymptoms = [
      'chest_pain', 'shortness_of_breath', 'loss_of_consciousness', 'severe_bleeding',
      'difficulty_breathing', 'facial_droop', 'arm_weakness', 'speech_difficulty',
      'severe_headache', 'vision_changes', 'confusion', 'wheezing', 'swelling_face_lips',
      'hives', 'vomiting', 'dizziness', 'fainting', 'pale_skin', 'rapid_heartbeat'
    ];

    emergencySymptoms.forEach((symptom, i) => {
      vector[index + i] = patientData.symptoms?.includes(symptom) ? 1 : 0;
    });
    index += emergencySymptoms.length;

    // Patient context (30-39)
    vector[index++] = (patientData.age || 50) / 100;
    vector[index++] = patientData.gender === 'male' ? 1 : 0;
    vector[index++] = patientData.gender === 'female' ? 1 : 0;
    vector[index++] = patientData.medicalHistory?.includes('heart_disease') ? 1 : 0;
    vector[index++] = patientData.medicalHistory?.includes('diabetes') ? 1 : 0;
    vector[index++] = patientData.medicalHistory?.includes('stroke') ? 1 : 0;
    vector[index++] = patientData.medicalHistory?.includes('asthma') ? 1 : 0;
    vector[index++] = patientData.allergies?.length > 0 ? 1 : 0;
    vector[index++] = patientData.medications?.length > 0 ? 1 : 0;
    vector[index++] = patientData.lastMeal ? 1 : 0;

    // Environmental factors (40-49)
    vector[index++] = patientData.location?.isUrban ? 1 : 0;
    vector[index++] = patientData.location?.distanceToHospital || 0 / 50; // normalized
    vector[index++] = patientData.timeOfDay === 'night' ? 1 : 0;
    vector[index++] = patientData.weather?.isSevere ? 1 : 0;
    vector[index++] = patientData.isAlone ? 1 : 0;
    vector[index++] = patientData.hasCaregiver ? 1 : 0;
    vector[index++] = patientData.languageBarriers ? 1 : 0;
    vector[index++] = patientData.mobilityIssues ? 1 : 0;
    vector[index++] = patientData.visualImpairment ? 1 : 0;
    vector[index++] = patientData.hearingImpairment ? 1 : 0;

    return tf.tensor1d(vector);
  }

  identifyEmergencyType(vitalSignsAnalysis, symptomsAnalysis, probabilities) {
    const emergencyTypes = ['cardiac_arrest', 'stroke', 'severe_bleeding', 'respiratory_distress', 'anaphylaxis'];
    const maxProbIndex = probabilities.indexOf(Math.max(...probabilities));
    const mlPrediction = emergencyTypes[maxProbIndex];

    // Rule-based verification
    for (const [emergencyType, protocol] of this.emergencyProtocols.entries()) {
      if (this.matchesEmergencyProtocol(vitalSignsAnalysis, symptomsAnalysis, protocol)) {
        return emergencyType;
      }
    }

    // Return ML prediction if no rule-based match
    return probabilities[maxProbIndex] > 0.5 ? mlPrediction : null;
  }

  matchesEmergencyProtocol(vitalSignsAnalysis, symptomsAnalysis, protocol) {
    // Check vital signs
    for (const [vital, requirement] of Object.entries(protocol.vitalSigns)) {
      const vitalFinding = vitalSignsAnalysis.criticalFindings.find(f => f.vital === vital) ||
                          vitalSignsAnalysis.abnormalFindings.find(f => f.vital === vital);
      
      if (!vitalFinding) continue;

      switch (requirement.condition) {
        case 'critical_low_or_high':
          if (vitalFinding.severity !== 'critical_low' && vitalFinding.severity !== 'critical_high') {
            return false;
          }
          break;
        case 'critical_low':
          if (vitalFinding.severity !== 'critical_low') return false;
          break;
        case 'critical_high':
          if (vitalFinding.severity !== 'critical_high') return false;
          break;
        case 'low':
          if (vitalFinding.severity !== 'low') return false;
          break;
        case 'high':
          if (vitalFinding.severity !== 'high') return false;
          break;
      }
    }

    // Check symptoms
    const matchingSymptoms = symptomsAnalysis.criticalSymptoms.filter(s => 
      protocol.symptoms.includes(s.name)
    );

    return matchingSymptoms.length >= 2; // Require at least 2 matching symptoms
  }

  calculateEmergencySeverity(emergencyType, vitalSignsAnalysis, symptomsAnalysis) {
    if (!emergencyType) {
      return {
        level: 'none',
        score: 0,
        urgency: 'routine'
      };
    }

    let severityScore = 0;

    // Base severity from emergency type
    const protocol = this.emergencyProtocols.get(emergencyType);
    if (protocol.priority === 'critical') severityScore += 50;
    else if (protocol.priority === 'high') severityScore += 30;

    // Add vital signs contribution
    severityScore += vitalSignsAnalysis.criticalFindings.length * 20;
    severityScore += vitalSignsAnalysis.abnormalFindings.length * 10;

    // Add symptoms contribution
    severityScore += symptomsAnalysis.criticalSymptoms.length * 15;
    severityScore += symptomsAnalysis.severeSymptoms.length * 10;
    severityScore += symptomsAnalysis.moderateSymptoms.length * 5;

    // Determine severity level
    let severityLevel = 'mild';
    let urgency = 'routine';

    if (severityScore >= 70) {
      severityLevel = 'critical';
      urgency = 'immediate';
    } else if (severityScore >= 50) {
      severityLevel = 'severe';
      urgency = 'urgent';
    } else if (severityScore >= 30) {
      severityLevel = 'moderate';
      urgency = 'soon';
    }

    return {
      level: severityLevel,
      score: severityScore,
      urgency: urgency,
      protocol: protocol
    };
  }

  generateEmergencyResponse(emergencyType, severity, patientData) {
    if (!emergencyType) {
      return {
        actions: ['monitor_patient', 'seek_medical_advice'],
        instructions: ['Continue monitoring vital signs', 'Contact healthcare provider for guidance'],
        priority: 'low'
      };
    }

    const protocol = this.emergencyProtocols.get(emergencyType);
    const response = {
      primaryAction: this.getPrimaryAction(emergencyType, severity.level),
      actions: [...protocol.actions],
      prehospitalInstructions: [...protocol.prehospitalInstructions],
      priority: severity.level,
      responseTime: protocol.response_time,
      emergencyContacts: this.getEmergencyContacts(patientData),
      preparationSteps: this.getPreparationSteps(emergencyType, patientData)
    };

    // Add severity-specific actions
    if (severity.level === 'critical') {
      response.actions.unshift('call_911_immediately');
      response.prehospitalInstructions.unshift('Stay with patient and keep calm');
    }

    return response;
  }

  getPrimaryAction(emergencyType, severity) {
    const primaryActions = {
      cardiac_arrest: 'Begin CPR and call emergency services',
      stroke: 'Call 911 and note time of onset',
      severe_bleeding: 'Apply direct pressure and call 911',
      respiratory_distress: 'Call 911 and help patient sit upright',
      anaphylaxis: 'Administer epinephrine and call 911',
      hypoglycemia: 'Give fast-acting sugar and monitor'
    };

    return primaryActions[emergencyType] || 'Call emergency services';
  }

  getEmergencyContacts(patientData) {
    const contacts = [
      { type: 'emergency', number: '911', description: 'Emergency Services' },
      { type: 'poison_control', number: '1-800-222-1222', description: 'Poison Control' }
    ];

    // Add personal emergency contacts
    if (patientData.emergencyContacts) {
      contacts.push(...patientData.emergencyContacts);
    }

    return contacts;
  }

  getPreparationSteps(emergencyType, patientData) {
    const steps = [
      'Ensure clear access to patient',
      'Gather patient medications and medical history',
      'Unlock doors for emergency responders',
      'Have identification ready'
    ];

    // Add condition-specific steps
    if (emergencyType === 'cardiac_arrest') {
      steps.push('Locate AED if available');
      steps.push('Clear area for CPR');
    } else if (emergencyType === 'stroke') {
      steps.push('Note exact time symptoms started');
      steps.push('Prepare list of medications');
    }

    return steps;
  }

  async findNearbyEmergencyServices(location) {
    // This would integrate with Google Maps API or similar
    // For now, return mock data
    const mockServices = [
      {
        type: 'hospital',
        name: 'General Hospital',
        distance: 2.5,
        address: '123 Main St',
        phone: '555-0123',
        emergencyRoom: true,
        estimatedArrival: '8 minutes'
      },
      {
        type: 'urgent_care',
        name: 'Urgent Care Center',
        distance: 1.2,
        address: '456 Oak Ave',
        phone: '555-0456',
        emergencyRoom: false,
        estimatedArrival: '4 minutes'
      }
    ];

    return mockServices.sort((a, b) => a.distance - b.distance);
  }

  calculateEmergencyConfidence(probabilities) {
    const maxProb = Math.max(...probabilities);
    return Math.round(maxProb * 100);
  }

  initialize(app, io) {
    // API endpoints
    app.post('/api/emergency/detect', async (req, res) => {
      try {
        const patientData = req.body;
        const result = await this.detectEmergency(patientData);
        
        // Emit real-time alert if critical emergency
        if (result.severity.level === 'critical') {
          io.emit('emergency_alert', {
            type: result.emergencyType,
            severity: result.severity.level,
            location: patientData.location,
            timestamp: new Date().toISOString()
          });
        }
        
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    app.post('/api/emergency/vital-signs', (req, res) => {
      try {
        const vitalSigns = req.body;
        const analysis = this.analyzeVitalSigns(vitalSigns);
        res.json(analysis);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    app.post('/api/emergency/symptoms', (req, res) => {
      try {
        const symptoms = req.body;
        const analysis = this.analyzeSymptoms(symptoms);
        res.json(analysis);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    app.get('/api/emergency/protocols', (req, res) => {
      const protocols = Array.from(this.emergencyProtocols.entries()).map(([key, value]) => ({
        type: key,
        ...value
      }));
      res.json(protocols);
    });

    app.get('/api/emergency/thresholds', (req, res) => {
      const thresholds = Array.from(this.vitalSignsThresholds.entries()).map(([key, value]) => ({
        vital: key,
        ...value
      }));
      res.json(thresholds);
    });

    app.post('/api/emergency/nearby-services', async (req, res) => {
      try {
        const location = req.body;
        const services = await this.findNearbyEmergencyServices(location);
        res.json(services);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Real-time monitoring
    io.on('vital_signs_update', (data) => {
      this.analyzeVitalSigns(data.vitalSigns)
        .then(analysis => {
          if (analysis.overallStatus === 'critical') {
            io.emit('critical_vitals_alert', {
              userId: data.userId,
              vitalSigns: data.vitalSigns,
              analysis: analysis,
              timestamp: new Date().toISOString()
            });
          }
        })
        .catch(error => {
          io.emit('error', { message: error.message });
        });
    });

    io.on('emergency_trigger', (data) => {
      this.detectEmergency(data.patientData)
        .then(result => {
          io.emit('emergency_response', result);
          
          if (result.severity.level === 'critical') {
            io.emit('emergency_broadcast', {
              emergencyType: result.emergencyType,
              location: data.patientData.location,
              timestamp: new Date().toISOString()
            });
          }
        })
        .catch(error => {
          io.emit('error', { message: error.message });
        });
    });
  }
}

module.exports = new EmergencyDetection();
