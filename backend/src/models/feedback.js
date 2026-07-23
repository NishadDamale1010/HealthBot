const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  predictionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Prediction' },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String },
  wasHelpful: { type: Boolean, default: false },
  wasAccurate: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Feedback', feedbackSchema);
