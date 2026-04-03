const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const dotenv = require('dotenv');
const socketIo = require('socket.io');
const http = require('http');

// Import all feature modules
const symptomProgressionSimulator = require('./features/symptom-progression-simulator');
const healthRiskScoring = require('./features/health-risk-scoring');
const prescriptionScanner = require('./features/prescription-scanner');
const mentalHealthDetector = require('./features/mental-health-detector');
const healthTimeline = require('./features/health-timeline');
const followUpEngine = require('./features/follow-up-engine');
const medicalHelpLocator = require('./features/medical-help-locator');
const labReportAnalyzer = require('./features/lab-report-analyzer');
const emergencyDetection = require('./features/emergency-detection');
const aiHealthCoach = require('./features/ai-health-coach');
const privacyControl = require('./features/privacy-control');
const familyDashboard = require('./features/family-dashboard');
const diseaseVisualization = require('./features/disease-visualization');
const voiceAdaptive = require('./features/voice-adaptive');
const scenarioSimulation = require('./features/scenario-simulation');
const digitalTwin = require('./features/digital-twin');
const treatmentEngine = require('./features/treatment-engine');
const offlineMode = require('./features/offline-mode');
const contextMemory = require('./features/context-memory');
const medicationAdherence = require('./features/medication-adherence');
const diagnosisGraph = require('./features/diagnosis-graph');
const habitGamification = require('./features/habit-gamification');
const nutritionPredictor = require('./features/nutrition-predictor');
const foodScanner = require('./features/food-scanner');
const severityClassification = require('./features/severity-classification');
const seasonalIntelligence = require('./features/seasonal-intelligence');
const secondOpinion = require('./features/second-opinion');
const recoveryPrediction = require('./features/recovery-prediction');
const conversationSummary = require('./features/conversation-summary');
const allergySystem = require('./features/allergy-system');
const wearableSync = require('./features/wearable-sync');
const multiLanguage = require('./features/multi-language');
const preventiveCare = require('./features/preventive-care');
const explainableAI = require('./features/explainable-ai');
const microHabitEngine = require('./features/micro-habit-engine');
const chatMonitoring = require('./features/chat-monitoring');
const drugFeedback = require('./features/drug-feedback');
const healthAuditReports = require('./features/health-audit-reports');
const voiceAnalysis = require('./features/voice-analysis');
const historyCompression = require('./features/history-compression');
const pandemicMode = require('./features/pandemic-mode');
const aiCompanion = require('./features/ai-companion');
const bodyMapping = require('./features/body-mapping');
const habitCorrelation = require('./features/habit-correlation');
const triageSystem = require('./features/triage-system');
const familyRiskSimulation = require('./features/family-risk-simulation');
const multiImageDiagnosis = require('./features/multi-image-diagnosis');
const eli5Mode = require('./features/eli5-mode');
const supplementAdvisor = require('./features/supplement-advisor');
const healthGoalPlanner = require('./features/health-goal-planner');
const silentDetection = require('./features/silent-detection');
const medicationOptimizer = require('./features/medication-optimizer');
const reminderEngine = require('./features/reminder-engine');
const drillDownEngine = require('./features/drill-down-engine');
const environmentalAnalyzer = require('./features/environmental-analyzer');
const confidenceScore = require('./features/confidence-score');
const emergencyContact = require('./features/emergency-contact');
const rehabCoach = require('./features/rehab-coach');
const crossPlatformSync = require('./features/cross-platform-sync');
const selfDebugging = require('./features/self-debugging');
const knowledgeGraph = require('./features/knowledge-graph');
const reportExport = require('./features/report-export');
const adaptiveUI = require('./features/adaptive-ui');
const rareDiseaseFlag = require('./features/rare-disease-flag');
const communityPatternDetection = require('./features/community-pattern-detection');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, '../public')));

// Initialize all feature modules
const features = {
  symptomProgression: symptomProgressionSimulator,
  healthRisk: healthRiskScoring,
  prescription: prescriptionScanner,
  mentalHealth: mentalHealthDetector,
  timeline: healthTimeline,
  followUp: followUpEngine,
  locator: medicalHelpLocator,
  labAnalyzer: labReportAnalyzer,
  emergency: emergencyDetection,
  coach: aiHealthCoach,
  privacy: privacyControl,
  family: familyDashboard,
  visualization: diseaseVisualization,
  voice: voiceAdaptive,
  simulation: scenarioSimulation,
  digitalTwin: digitalTwin,
  treatment: treatmentEngine,
  offline: offlineMode,
  memory: contextMemory,
  adherence: medicationAdherence,
  diagnosis: diagnosisGraph,
  gamification: habitGamification,
  nutrition: nutritionPredictor,
  foodScanner: foodScanner,
  severity: severityClassification,
  seasonal: seasonalIntelligence,
  secondOpinion: secondOpinion,
  recovery: recoveryPrediction,
  summary: conversationSummary,
  allergy: allergySystem,
  wearable: wearableSync,
  language: multiLanguage,
  preventive: preventiveCare,
  explainable: explainableAI,
  microHabit: microHabitEngine,
  monitoring: chatMonitoring,
  feedback: drugFeedback,
  audit: healthAuditReports,
  voiceAnalysis: voiceAnalysis,
  compression: historyCompression,
  pandemic: pandemicMode,
  companion: aiCompanion,
  bodyMap: bodyMapping,
  correlation: habitCorrelation,
  triage: triageSystem,
  familyRisk: familyRiskSimulation,
  multiDiagnosis: multiImageDiagnosis,
  eli5: eli5Mode,
  supplement: supplementAdvisor,
  goals: healthGoalPlanner,
  silent: silentDetection,
  optimizer: medicationOptimizer,
  reminders: reminderEngine,
  drillDown: drillDownEngine,
  environmental: environmentalAnalyzer,
  confidence: confidenceScore,
  emergencyContact: emergencyContact,
  rehab: rehabCoach,
  sync: crossPlatformSync,
  debugging: selfDebugging,
  knowledge: knowledgeGraph,
  export: reportExport,
  adaptiveUI: adaptiveUI,
  rareDisease: rareDiseaseFlag,
  community: communityPatternDetection
};

// Initialize all features
Object.keys(features).forEach(key => {
  if (features[key] && typeof features[key].initialize === 'function') {
    features[key].initialize(app, io);
  }
});

// Health check endpoint
app.get('/healthz', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    features: Object.keys(features).length,
    version: '1.0.0'
  });
});

// API documentation endpoint
app.get('/api/features', (req, res) => {
  const featureList = Object.keys(features).map(key => ({
    name: key,
    description: features[key].description || 'No description available',
    endpoints: features[key].endpoints || []
  }));
  res.json(featureList);
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Handle real-time features
  socket.on('emergency_alert', (data) => {
    if (features.emergency && features.emergency.handleEmergency) {
      features.emergency.handleEmergency(data, socket);
    }
  });
  
  socket.on('symptom_update', (data) => {
    if (features.symptomProgression && features.symptomProgression.updateSymptoms) {
      features.symptomProgression.updateSymptoms(data, socket);
    }
  });
  
  socket.on('voice_analysis', (data) => {
    if (features.voiceAnalysis && features.voiceAnalysis.analyzeVoice) {
      features.voiceAnalysis.analyzeVoice(data, socket);
    }
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🏥 HealthBot AI Server running on port ${PORT}`);
  console.log(`🚀 ${Object.keys(features).length} advanced features loaded`);
  console.log(`📱 Real-time communication enabled`);
  console.log(`🔒 Privacy controls active`);
});

module.exports = { app, server, io, features };
