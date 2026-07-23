const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session' },
  symptoms: [{ type: String }],
  symptomVector: [{ type: Number }],
  topDisease: { type: String, required: true },
  confidence: { type: Number, required: true },
  topFive: [{
    disease: String,
    probability: Number
  }],
  riskLevel: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'] },
  shapValues: { type: Map, of: Number },
  matchedSymptoms: [{ type: String }],
  missingSymptoms: [{ type: String }],
  modelVersion: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Prediction', predictionSchema);
