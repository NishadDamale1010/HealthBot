const tf = require('@tensorflow/tfjs-node');
const natural = require('natural');
const sentiment = require('sentiment');

class MentalHealthDetector {
  constructor() {
    this.emotionModel = null;
    this.sentimentAnalyzer = new sentiment();
    this.psychologicalPatterns = new Map();
    this.riskIndicators = new Map();
    this.initializeModel();
    this.loadPsychologicalData();
  }

  description = "Mental Health Emotion Detection - Advanced sentiment analysis and psychological profiling";

  async initializeModel() {
    // Create neural network for emotion detection
    this.emotionModel = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [200], units: 256, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({ units: 128, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({ units: 64, activation: 'relu' }),
        tf.layers.dense({ units: 8, activation: 'softmax' }) // 8 emotion categories
      ]
    });

    this.emotionModel.compile({
      optimizer: 'adam',
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });
  }

  loadPsychologicalData() {
    // Load psychological patterns and risk indicators
    this.psychologicalPatterns.set('depression', {
      keywords: ['sad', 'hopeless', 'worthless', 'empty', 'tired', 'sleep', 'appetite', 'concentration'],
      linguisticPatterns: ['first_person_singular', 'negative_sentiment', 'rumination'],
      behavioralIndicators: ['social_withdrawal', 'loss_of_interest', 'fatigue'],
      severityLevels: {
        mild: { threshold: 0.3, symptoms: '2-3' },
        moderate: { threshold: 0.5, symptoms: '4-5' },
        severe: { threshold: 0.7, symptoms: '6+' }
      }
    });

    this.psychologicalPatterns.set('anxiety', {
      keywords: ['worried', 'nervous', 'panic', 'fear', 'anxious', 'stress', 'overwhelm'],
      linguisticPatterns: ['future_oriented', 'uncertainty', 'catastrophizing'],
      behavioralIndicators: ['restlessness', 'avoidance', 'physical_tension'],
      severityLevels: {
        mild: { threshold: 0.3, symptoms: '2-3' },
        moderate: { threshold: 0.5, symptoms: '4-5' },
        severe: { threshold: 0.7, symptoms: '6+' }
      }
    });

    this.psychologicalPatterns.set('stress', {
      keywords: ['overwhelmed', 'pressure', 'busy', 'deadline', 'work', 'responsibility'],
      linguisticPatterns: ['time_pressure', 'obligation', 'performance'],
      behavioralIndicators: ['irritability', 'fatigue', 'concentration_difficulties'],
      severityLevels: {
        mild: { threshold: 0.3, symptoms: '2-3' },
        moderate: { threshold: 0.5, symptoms: '4-5' },
        severe: { threshold: 0.7, symptoms: '6+' }
      }
    });

    this.psychologicalPatterns.set('burnout', {
      keywords: ['exhausted', 'cynical', 'detached', 'ineffective', 'overwhelmed', 'drained'],
      linguisticPatterns: ['emotional_exhaustion', 'depersonalization', 'reduced_accomplishment'],
      behavioralIndicators: ['cynicism', 'detachment', 'reduced_efficacy'],
      severityLevels: {
        mild: { threshold: 0.3, symptoms: '2-3' },
        moderate: { threshold: 0.5, symptoms: '4-5' },
        severe: { threshold: 0.7, symptoms: '6+' }
      }
    });

    // Risk indicators for crisis detection
    this.riskIndicators.set('suicidal_ideation', {
      immediate: ['suicide', 'kill myself', 'end my life', 'better off dead', 'no reason to live'],
      indirect: ['burden', 'goodbye', 'final', 'can\'t go on', 'giving up'],
      behavioral: ['giving_away_possessions', 'withdrawing', 'saying_goodbye'],
      urgency: 'critical'
    });

    this.riskIndicators.set('self_harm', {
      immediate: ['cut', 'hurt myself', 'pain', 'punish', 'hate myself'],
      indirect: ['deserve pain', 'need to feel something', 'release'],
      behavioral: ['covering_up', 'isolating', 'mood_swings'],
      urgency: 'high'
    });

    this.riskIndicators.set('psychosis', {
      immediate: ['voices', 'delusions', 'paranoia', 'unreal', 'hallucinating'],
      indirect: ['confused', 'disoriented', 'reality', 'strange'],
      behavioral: ['speech_disorganization', 'bizarre_behavior'],
      urgency: 'high'
    });
  }

  async analyzeMentalHealth(text, context = {}) {
    try {
      // Step 1: Basic sentiment analysis
      const sentimentResult = this.sentimentAnalyzer.analyze(text);
      
      // Step 2: Emotion detection using ML model
      const emotionVector = this.createEmotionVector(text);
      const emotionPrediction = await this.emotionModel.predict(emotionVector.expandDims(0));
      const emotions = await emotionPrediction.array();
      
      // Step 3: Linguistic pattern analysis
      const linguisticAnalysis = this.analyzeLinguisticPatterns(text);
      
      // Step 4: Psychological condition detection
      const conditionAnalysis = this.detectPsychologicalConditions(text, sentimentResult, linguisticAnalysis);
      
      // Step 5: Risk assessment
      const riskAssessment = this.assessRisk(text, conditionAnalysis);
      
      // Step 6: Emotional state tracking
      const emotionalState = this.trackEmotionalState(emotions[0], sentimentResult);
      
      // Step 7: Generate recommendations
      const recommendations = this.generateMentalHealthRecommendations(
        conditionAnalysis, 
        riskAssessment, 
        emotionalState
      );
      
      return {
        sentiment: sentimentResult,
        emotions: this.formatEmotionResults(emotions[0]),
        linguisticPatterns: linguisticAnalysis,
        psychologicalConditions: conditionAnalysis,
        riskAssessment: riskAssessment,
        emotionalState: emotionalState,
        recommendations: recommendations,
        confidence: this.calculateMentalHealthConfidence(emotions[0], conditionAnalysis),
        urgency: this.determineUrgency(riskAssessment),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error analyzing mental health:', error);
      throw new Error('Failed to analyze mental health');
    }
  }

  createEmotionVector(text) {
    const vector = new Array(200).fill(0);
    const tokens = natural.WordTokenizer.tokenize(text.toLowerCase());
    
    // Word embeddings for emotion-related terms
    const emotionWords = {
      'happy': 0, 'joy': 0, 'excited': 0, 'pleased': 0, 'content': 0,
      'sad': 1, 'depressed': 1, 'miserable': 1, 'down': 1, 'blue': 1,
      'angry': 2, 'furious': 2, 'irritated': 2, 'mad': 2, 'annoyed': 2,
      'fearful': 3, 'scared': 3, 'afraid': 3, 'terrified': 3, 'anxious': 3,
      'surprised': 4, 'shocked': 4, 'amazed': 4, 'astonished': 4,
      'disgusted': 5, 'revolted': 5, 'repulsed': 5, 'sickened': 5,
      'neutral': 6, 'calm': 6, 'peaceful': 6, 'relaxed': 6,
      'confused': 7, 'uncertain': 7, 'puzzled': 7, 'bewildered': 7
    };
    
    // Count emotion words
    tokens.forEach(token => {
      if (emotionWords.hasOwnProperty(token)) {
        vector[emotionWords[token]]++;
      }
    });
    
    // Add linguistic features
    vector[50] = tokens.length; // Text length
    vector[51] = text.match(/[!?]/g)?.length || 0; // Punctuation intensity
    vector[52] = text.match(/[A-Z]/g?.length || 0) / tokens.length; // Capitalization ratio
    vector[53] = (text.match(/\bI\b/g) || []).length; // First person singular
    vector[54] = (text.match(/\bwe\b/g) || []).length; // First person plural
    vector[55] = (text.match(/\byou\b/g) || []).length; // Second person
    vector[56] = text.split('.').length - 1; // Sentence count
    vector[57] = tokens.length / (text.split('.').length || 1); // Average words per sentence
    
    // Sentiment features
    vector[58] = sentimentResult.score || 0;
    vector[59] = sentimentResult.comparative || 0;
    vector[60] = sentimentResult.positive?.length || 0;
    vector[61] = sentimentResult.negative?.length || 0;
    
    return tf.tensor1d(vector);
  }

  analyzeLinguisticPatterns(text) {
    const patterns = {
      firstPersonSingular: this.countFirstPersonSingular(text),
      firstPersonPlural: this.countFirstPersonPlural(text),
      secondPerson: this.countSecondPerson(text),
      thirdPerson: this.countThirdPerson(text),
      presentTense: this.countPresentTense(text),
      pastTense: this.countPastTense(text),
      futureTense: this.countFutureTense(text),
      negations: this.countNegations(text),
      questions: this.countQuestions(text),
      exclamations: this.countExclamations(text),
      uncertainty: this.countUncertainty(text),
      absolutist: this.countAbsolutist(text),
      cognitiveProcesses: this.countCognitiveProcesses(text),
      emotionalProcesses: this.countEmotionalProcesses(text),
      socialProcesses: this.countSocialProcesses(text)
    };
    
    return {
      patterns: patterns,
      interpretation: this.interpretLinguisticPatterns(patterns),
      riskMarkers: this.identifyRiskMarkers(patterns)
    };
  }

  countFirstPersonSingular(text) {
    const firstPersonSingular = ['i', 'me', 'my', 'mine', 'myself'];
    const tokens = text.toLowerCase().split(/\s+/);
    return tokens.filter(token => firstPersonSingular.includes(token)).length;
  }

  countFirstPersonPlural(text) {
    const firstPersonPlural = ['we', 'us', 'our', 'ours', 'ourselves'];
    const tokens = text.toLowerCase().split(/\s+/);
    return tokens.filter(token => firstPersonPlural.includes(token)).length;
  }

  countSecondPerson(text) {
    const secondPerson = ['you', 'your', 'yours', 'yourself'];
    const tokens = text.toLowerCase().split(/\s+/);
    return tokens.filter(token => secondPerson.includes(token)).length;
  }

  countThirdPerson(text) {
    const thirdPerson = ['he', 'she', 'they', 'him', 'her', 'them', 'his', 'hers', 'their', 'theirs'];
    const tokens = text.toLowerCase().split(/\s+/);
    return tokens.filter(token => thirdPerson.includes(token)).length;
  }

  countPresentTense(text) {
    const presentTense = ['is', 'are', 'am', 'have', 'has', 'do', 'does', 'think', 'feel', 'want', 'need'];
    const tokens = text.toLowerCase().split(/\s+/);
    return tokens.filter(token => presentTense.includes(token)).length;
  }

  countPastTense(text) {
    const pastTense = ['was', 'were', 'had', 'did', 'thought', 'felt', 'wanted', 'needed', 'went', 'came'];
    const tokens = text.toLowerCase().split(/\s+/);
    return tokens.filter(token => pastTense.includes(token)).length;
  }

  countFutureTense(text) {
    const futureTense = ['will', 'shall', 'going to', 'plan to', 'expect to', 'hope to'];
    let count = 0;
    futureTense.forEach(pattern => {
      const regex = new RegExp(pattern.replace(/\s+/g, '\\s+'), 'gi');
      count += (text.match(regex) || []).length;
    });
    return count;
  }

  countNegations(text) {
    const negations = ['no', 'not', 'never', 'none', 'nothing', 'nowhere', 'neither', 'nor', 'cannot', "can't", "won't", "don't", "didn't"];
    const tokens = text.toLowerCase().split(/\s+/);
    return tokens.filter(token => negations.includes(token)).length;
  }

  countQuestions(text) {
    return (text.match(/\?/g) || []).length;
  }

  countExclamations(text) {
    return (text.match(/!/g) || []).length;
  }

  countUncertainty(text) {
    const uncertainty = ['maybe', 'perhaps', 'possibly', 'might', 'could', 'would', 'should', 'uncertain', 'unsure'];
    const tokens = text.toLowerCase().split(/\s+/);
    return tokens.filter(token => uncertainty.includes(token)).length;
  }

  countAbsolutist(text) {
    const absolutist = ['always', 'never', 'completely', 'absolutely', 'totally', 'entirely', 'perfectly', 'exactly'];
    const tokens = text.toLowerCase().split(/\s+/);
    return tokens.filter(token => absolutist.includes(token)).length;
  }

  countCognitiveProcesses(text) {
    const cognitive = ['think', 'know', 'understand', 'realize', 'believe', 'suppose', 'figure', 'decide', 'consider'];
    const tokens = text.toLowerCase().split(/\s+/);
    return tokens.filter(token => cognitive.includes(token)).length;
  }

  countEmotionalProcesses(text) {
    const emotional = ['feel', 'happy', 'sad', 'angry', 'afraid', 'love', 'hate', 'emotion', 'mood', 'feeling'];
    const tokens = text.toLowerCase().split(/\s+/);
    return tokens.filter(token => emotional.includes(token)).length;
  }

  countSocialProcesses(text) {
    const social = ['friend', 'family', 'talk', 'share', 'social', 'people', 'relationship', 'together', 'alone'];
    const tokens = text.toLowerCase().split(/\s+/);
    return tokens.filter(token => social.includes(token)).length;
  }

  interpretLinguisticPatterns(patterns) {
    const interpretation = [];
    
    // High first person singular + negative sentiment = potential depression
    if (patterns.firstPersonSingular > patterns.firstPersonPlural * 2 && patterns.negations > 3) {
      interpretation.push({
        pattern: 'high_self_focus_negative',
        description: 'High self-focus with negative language',
        significance: 'May indicate depressive thinking patterns'
      });
    }
    
    // High absolutist language = potential cognitive rigidity
    if (patterns.absolutist > 2) {
      interpretation.push({
        pattern: 'absolutist_thinking',
        description: 'Frequent use of absolutist language',
        significance: 'May indicate cognitive rigidity or all-or-nothing thinking'
      });
    }
    
    // High uncertainty + future tense = anxiety indicators
    if (patterns.uncertainty > 2 && patterns.futureTense > 1) {
      interpretation.push({
        pattern: 'future_uncertainty',
        description: 'High uncertainty about future events',
        significance: 'May indicate anxiety or worry patterns'
      });
    }
    
    // Low social processes + high first person singular = social withdrawal
    if (patterns.socialProcesses === 0 && patterns.firstPersonSingular > 3) {
      interpretation.push({
        pattern: 'social_withdrawal',
        description: 'Low social reference with high self-focus',
        significance: 'May indicate social isolation or withdrawal'
      });
    }
    
    return interpretation;
  }

  identifyRiskMarkers(patterns) {
    const riskMarkers = [];
    
    // High negation + high absolutist = suicide risk marker
    if (patterns.negations > 5 && patterns.absolutist > 3) {
      riskMarkers.push({
        marker: 'suicide_risk_language',
        severity: 'high',
        description: 'High negation and absolutist language patterns'
      });
    }
    
    // High emotional processes + high uncertainty = emotional instability
    if (patterns.emotionalProcesses > 5 && patterns.uncertainty > 3) {
      riskMarkers.push({
        marker: 'emotional_instability',
        severity: 'moderate',
        description: 'High emotional expression with uncertainty'
      });
    }
    
    return riskMarkers;
  }

  detectPsychologicalConditions(text, sentimentResult, linguisticAnalysis) {
    const conditions = [];
    
    this.psychologicalPatterns.forEach((pattern, conditionName) => {
      const score = this.calculateConditionScore(text, pattern, sentimentResult, linguisticAnalysis);
      const severity = this.determineSeverity(score, pattern);
      
      conditions.push({
        condition: conditionName,
        score: score,
        severity: severity.level,
        confidence: severity.confidence,
        symptoms: this.identifySymptoms(text, pattern),
        recommendations: this.getConditionRecommendations(conditionName, severity.level)
      });
    });
    
    return conditions.sort((a, b) => b.score - a.score);
  }

  calculateConditionScore(text, pattern, sentimentResult, linguisticAnalysis) {
    let score = 0;
    const tokens = text.toLowerCase().split(/\s+/);
    
    // Keyword matching
    pattern.keywords.forEach(keyword => {
      const regex = new RegExp(keyword.replace(/\s+/g, '\\s+'), 'gi');
      const matches = text.match(regex);
      if (matches) score += matches.length * 0.2;
    });
    
    // Sentiment contribution
    if (sentimentResult.score < -2) score += 0.3;
    
    // Linguistic pattern contribution
    pattern.linguisticPatterns.forEach(linguisticPattern => {
      switch (linguisticPattern) {
        case 'first_person_singular':
          score += linguisticAnalysis.patterns.firstPersonSingular * 0.1;
          break;
        case 'negative_sentiment':
          score += sentimentResult.negative?.length * 0.1 || 0;
          break;
        case 'rumination':
          score += (linguisticAnalysis.patterns.pastTense + linguisticAnalysis.patterns.firstPersonSingular) * 0.05;
          break;
        case 'future_oriented':
          score += linguisticAnalysis.patterns.futureTense * 0.1;
          break;
        case 'uncertainty':
          score += linguisticAnalysis.patterns.uncertainty * 0.1;
          break;
        case 'catastrophizing':
          score += (linguisticAnalysis.patterns.absolutist + linguisticAnalysis.patterns.negations) * 0.1;
          break;
      }
    });
    
    return Math.min(score, 1); // Cap at 1
  }

  determineSeverity(score, pattern) {
    const levels = Object.keys(pattern.severityLevels);
    
    for (let i = levels.length - 1; i >= 0; i--) {
      const level = levels[i];
      if (score >= pattern.severityLevels[level].threshold) {
        return {
          level: level,
          confidence: Math.min(score * 100, 95),
          threshold: pattern.severityLevels[level].threshold
        };
      }
    }
    
    return {
      level: 'minimal',
      confidence: score * 50,
      threshold: 0
    };
  }

  identifySymptoms(text, pattern) {
    const symptoms = [];
    const tokens = text.toLowerCase().split(/\s+/);
    
    pattern.keywords.forEach(keyword => {
      const regex = new RegExp(keyword.replace(/\s+/g, '\\s+'), 'gi');
      const matches = text.match(regex);
      if (matches) {
        symptoms.push({
          symptom: keyword,
          frequency: matches.length,
          context: this.extractContext(text, keyword)
        });
      }
    });
    
    return symptoms;
  }

  extractContext(text, keyword) {
    const index = text.toLowerCase().indexOf(keyword.toLowerCase());
    if (index === -1) return '';
    
    const start = Math.max(0, index - 50);
    const end = Math.min(text.length, index + keyword.length + 50);
    return text.substring(start, end).trim();
  }

  getConditionRecommendations(conditionName, severity) {
    const recommendations = {
      depression: {
        mild: ['Consider talking to a friend or family member', 'Engage in physical activity', 'Maintain regular sleep schedule'],
        moderate: ['Consult with a mental health professional', 'Consider therapy options', 'Practice mindfulness and relaxation techniques'],
        severe: ['Seek immediate professional help', 'Contact crisis hotline if needed', 'Consider medication evaluation']
      },
      anxiety: {
        mild: ['Practice deep breathing exercises', 'Limit caffeine intake', 'Establish regular exercise routine'],
        moderate: ['Consider cognitive behavioral therapy', 'Practice meditation and mindfulness', 'Consult with healthcare provider'],
        severe: ['Seek professional mental health treatment', 'Consider medication options', 'Develop comprehensive anxiety management plan']
      },
      stress: {
        mild: ['Take regular breaks', 'Practice time management', 'Engage in stress-reducing activities'],
        moderate: ['Consider stress management techniques', 'Evaluate workload and priorities', 'Practice relaxation exercises'],
        severe: ['Seek professional stress management help', 'Consider medical evaluation', 'Implement major lifestyle changes']
      },
      burnout: {
        mild: ['Take regular time off', 'Set boundaries between work and personal life', 'Engage in enjoyable activities'],
        moderate: ['Consider professional counseling', 'Evaluate work-life balance', 'Practice self-care regularly'],
        severe: ['Seek comprehensive professional help', 'Consider extended break from work', 'Reevaluate career and life goals']
      }
    };
    
    return recommendations[conditionName]?.[severity] || ['Seek professional guidance'];
  }

  assessRisk(text, conditionAnalysis) {
    const riskAssessment = {
      overallRisk: 'low',
      immediateRisks: [],
      longTermRisks: [],
      crisisIndicators: [],
      protectiveFactors: []
    };
    
    // Check for immediate crisis indicators
    this.riskIndicators.forEach((indicator, riskType) => {
      const immediateMatches = this.checkImmediateRisk(text, indicator.immediate);
      const indirectMatches = this.checkIndirectRisk(text, indicator.indirect);
      
      if (immediateMatches.length > 0 || indirectMatches.length > 0) {
        riskAssessment.crisisIndicators.push({
          type: riskType,
          urgency: indicator.urgency,
          immediateMatches: immediateMatches,
          indirectMatches: indirectMatches,
          recommendation: this.getCrisisRecommendation(riskType, indicator.urgency)
        });
        
        if (indicator.urgency === 'critical') {
          riskAssessment.overallRisk = 'critical';
        } else if (indicator.urgency === 'high' && riskAssessment.overallRisk !== 'critical') {
          riskAssessment.overallRisk = 'high';
        }
      }
    });
    
    // Assess condition-based risks
    conditionAnalysis.forEach(condition => {
      if (condition.severity === 'severe') {
        riskAssessment.longTermRisks.push({
          condition: condition.condition,
          risk: 'Significant impairment in daily functioning',
          recommendation: 'Immediate professional intervention recommended'
        });
        
        if (riskAssessment.overallRisk === 'low') {
          riskAssessment.overallRisk = 'moderate';
        }
      }
    });
    
    // Identify protective factors
    const protectiveFactors = this.identifyProtectiveFactors(text);
    riskAssessment.protectiveFactors = protectiveFactors;
    
    return riskAssessment;
  }

  checkImmediateRisk(text, patterns) {
    const matches = [];
    patterns.forEach(pattern => {
      const regex = new RegExp(pattern.replace(/\s+/g, '\\s+'), 'gi');
      const found = text.match(regex);
      if (found) {
        matches.push({
          pattern: pattern,
          matches: found,
          context: this.extractContext(text, pattern)
        });
      }
    });
    return matches;
  }

  checkIndirectRisk(text, patterns) {
    const matches = [];
    patterns.forEach(pattern => {
      const regex = new RegExp(pattern.replace(/\s+/g, '\\s+'), 'gi');
      const found = text.match(regex);
      if (found) {
        matches.push({
          pattern: pattern,
          matches: found,
          context: this.extractContext(text, pattern)
        });
      }
    });
    return matches;
  }

  getCrisisRecommendation(riskType, urgency) {
    const recommendations = {
      suicidal_ideation: {
        critical: 'IMMEDIATE: Call emergency services or suicide hotline (988 in US)',
        high: 'URGENT: Contact mental health professional immediately'
      },
      self_harm: {
        high: 'URGENT: Contact mental health professional or crisis line',
        moderate: 'Seek professional help as soon as possible'
      },
      psychosis: {
        high: 'URGENT: Contact mental health emergency services',
        moderate: 'Seek immediate psychiatric evaluation'
      }
    };
    
    return recommendations[riskType]?.[urgency] || 'Seek professional help immediately';
  }

  identifyProtectiveFactors(text) {
    const factors = [];
    const protectivePatterns = [
      { pattern: 'hope', factor: 'expresses hope', weight: 0.3 },
      { pattern: 'future plans', factor: 'future orientation', weight: 0.2 },
      { pattern: 'support', factor: 'social support', weight: 0.3 },
      { pattern: 'help', factor: 'help-seeking', weight: 0.4 },
      { pattern: 'therapy', factor: 'treatment engagement', weight: 0.4 },
      { pattern: 'family', factor: 'family connection', weight: 0.3 },
      { pattern: 'friends', factor: 'friend support', weight: 0.3 }
    ];
    
    protectivePatterns.forEach(({ pattern, factor, weight }) => {
      const regex = new RegExp(pattern.replace(/\s+/g, '\\s+'), 'gi');
      if (text.match(regex)) {
        factors.push({
          factor: factor,
          weight: weight,
          confidence: 0.8
        });
      }
    });
    
    return factors;
  }

  trackEmotionalState(emotions, sentimentResult) {
    const emotionLabels = ['joy', 'sadness', 'anger', 'fear', 'surprise', 'disgust', 'neutral', 'confusion'];
    const dominantEmotion = emotionLabels[emotions.indexOf(Math.max(...emotions))];
    
    return {
      dominantEmotion: dominantEmotion,
      emotionScores: emotionLabels.map((label, index) => ({
        emotion: label,
        score: Math.round(emotions[index] * 100),
        intensity: this.getEmotionIntensity(emotions[index])
      })),
      sentiment: {
        score: sentimentResult.score,
        comparative: sentimentResult.comparative,
        positive: sentimentResult.positive?.length || 0,
        negative: sentimentResult.negative?.length || 0
      },
      emotionalStability: this.calculateEmotionalStability(emotions),
      moodState: this.determineMoodState(dominantEmotion, sentimentResult.score)
    };
  }

  getEmotionIntensity(score) {
    if (score >= 0.8) return 'very_high';
    if (score >= 0.6) return 'high';
    if (score >= 0.4) return 'moderate';
    if (score >= 0.2) return 'low';
    return 'very_low';
  }

  calculateEmotionalStability(emotions) {
    const maxEmotion = Math.max(...emotions);
    const secondMax = emotions.sort((a, b) => b - a)[1];
    const stability = 1 - (maxEmotion - secondMax);
    
    return {
      score: Math.round(stability * 100),
      level: stability >= 0.7 ? 'stable' : stability >= 0.4 ? 'moderate' : 'unstable'
    };
  }

  determineMoodState(dominantEmotion, sentimentScore) {
    if (dominantEmotion === 'joy' && sentimentScore > 2) return 'positive';
    if (dominantEmotion === 'sadness' && sentimentScore < -2) return 'negative';
    if (dominantEmotion === 'anger' && sentimentScore < -1) return 'agitated';
    if (dominantEmotion === 'fear' && sentimentScore < -1) return 'anxious';
    if (dominantEmotion === 'neutral') return 'neutral';
    return 'mixed';
  }

  formatEmotionResults(emotions) {
    const emotionLabels = ['joy', 'sadness', 'anger', 'fear', 'surprise', 'disgust', 'neutral', 'confusion'];
    return emotionLabels.map((label, index) => ({
      emotion: label,
      probability: Math.round(emotions[index] * 1000) / 10,
      confidence: this.getEmotionConfidence(emotions[index])
    })).sort((a, b) => b.probability - a.probability);
  }

  getEmotionConfidence(score) {
    if (score >= 0.8) return 'very_high';
    if (score >= 0.6) return 'high';
    if (score >= 0.4) return 'moderate';
    if (score >= 0.2) return 'low';
    return 'very_low';
  }

  generateMentalHealthRecommendations(conditionAnalysis, riskAssessment, emotionalState) {
    const recommendations = [];
    
    // Crisis recommendations
    if (riskAssessment.overallRisk === 'critical') {
      recommendations.push({
        priority: 'critical',
        type: 'crisis',
        action: 'Seek immediate emergency help',
        details: 'Call emergency services or crisis hotline immediately',
        resources: ['988 (Suicide & Crisis Lifeline)', '911 (Emergency)', 'Local emergency room']
      });
    }
    
    // High-risk recommendations
    if (riskAssessment.overallRisk === 'high') {
      recommendations.push({
        priority: 'urgent',
        type: 'professional_help',
        action: 'Contact mental health professional',
        details: 'Schedule appointment with psychiatrist or therapist',
        timeframe: 'Within 24-48 hours'
      });
    }
    
    // Condition-specific recommendations
    conditionAnalysis.slice(0, 3).forEach(condition => {
      if (condition.severity === 'severe' || condition.severity === 'moderate') {
        recommendations.push({
          priority: condition.severity === 'severe' ? 'high' : 'medium',
          type: 'condition_management',
          action: `Address ${condition.condition} symptoms`,
          details: condition.recommendations.join(', '),
          condition: condition.condition,
          severity: condition.severity
        });
      }
    });
    
    // Emotional state recommendations
    if (emotionalState.emotionalStability.level === 'unstable') {
      recommendations.push({
        priority: 'medium',
        type: 'emotional_regulation',
        action: 'Practice emotional regulation techniques',
        details: 'Deep breathing, mindfulness, or grounding exercises',
        techniques: ['4-7-8 breathing', 'Progressive muscle relaxation', 'Mindful observation']
      });
    }
    
    // General wellness recommendations
    recommendations.push({
      priority: 'standard',
      type: 'wellness',
      action: 'Maintain healthy lifestyle habits',
      details: 'Regular sleep, balanced diet, and physical activity',
      habits: ['7-9 hours sleep', '30 minutes exercise daily', 'Balanced nutrition']
    });
    
    return recommendations;
  }

  calculateMentalHealthConfidence(emotions, conditions) {
    const maxEmotion = Math.max(...emotions);
    const avgConditionScore = conditions.reduce((sum, c) => sum + c.score, 0) / conditions.length;
    
    return Math.round(((maxEmotion + avgConditionScore) / 2) * 100);
  }

  determineUrgency(riskAssessment) {
    if (riskAssessment.overallRisk === 'critical') return 'immediate';
    if (riskAssessment.overallRisk === 'high') return 'urgent';
    if (riskAssessment.overallRisk === 'moderate') return 'soon';
    return 'routine';
  }

  initialize(app, io) {
    // API endpoints
    app.post('/api/mental-health/analyze', async (req, res) => {
      try {
        const { text, context } = req.body;
        const result = await this.analyzeMentalHealth(text, context);
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    app.post('/api/mental-health/crisis-check', async (req, res) => {
      try {
        const { text } = req.body;
        const riskAssessment = this.assessRisk(text, []);
        res.json({
          isCrisis: riskAssessment.overallRisk === 'critical',
          urgency: this.determineUrgency(riskAssessment),
          recommendations: riskAssessment.crisisIndicators
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    app.get('/api/mental-health/conditions', (req, res) => {
      const conditions = Array.from(this.psychologicalPatterns.entries()).map(([key, value]) => ({
        name: key,
        keywords: value.keywords,
        severityLevels: value.severityLevels
      }));
      res.json(conditions);
    });

    app.post('/api/mental-health/emotional-state', async (req, res) => {
      try {
        const { text } = req.body;
        const sentimentResult = this.sentimentAnalyzer.analyze(text);
        const emotionVector = this.createEmotionVector(text);
        const emotionPrediction = await this.emotionModel.predict(emotionVector.expandDims(0));
        const emotions = await emotionPrediction.array();
        
        const emotionalState = this.trackEmotionalState(emotions[0], sentimentResult);
        res.json(emotionalState);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Real-time crisis monitoring
    io.on('mental_health_update', (data) => {
      this.analyzeMentalHealth(data.text, data.context)
        .then(result => {
          if (result.riskAssessment.overallRisk === 'critical') {
            io.emit('crisis_alert', {
              userId: data.userId,
              risk: result.riskAssessment,
              timestamp: new Date().toISOString()
            });
          }
          io.emit('mental_health_analysis', result);
        })
        .catch(error => {
          io.emit('error', { message: error.message });
        });
    });
  }
}

module.exports = new MentalHealthDetector();
