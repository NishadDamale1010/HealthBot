const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  ip: { type: String },
  userAgent: { type: String },
  metadata: { type: mongoose.Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now }
});

auditLogSchema.index({ action: 1 });
auditLogSchema.index({ userId: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
