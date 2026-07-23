const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['active', 'completed', 'expired'], default: 'active' },
  symptomsCollected: [{ type: String }],
  questionsAsked: [{ type: String }],
  answersGiven: { type: Map, of: mongoose.Schema.Types.Mixed },
  profileSnapshot: {
    age: Number,
    gender: String,
    conditions: [{ type: String }]
  },
  currentStage: { 
    type: String, 
    enum: ['profile', 'symptom_collection', 'followup', 'prediction', 'done'],
    default: 'symptom_collection'
  },
  confidenceScore: { type: Number },
  startedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 2 * 60 * 60 * 1000) } // 2 hours TTL
});

sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

module.exports = mongoose.model('Session', sessionSchema);
