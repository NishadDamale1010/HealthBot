const AuditLog = require('../models/auditLog');

const createAuditMiddleware = (actionName) => {
  return async (req, res, next) => {
    try {
      const log = new AuditLog({
        action: actionName,
        userId: req.user ? req.user._id : null,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        metadata: {
          method: req.method,
          url: req.originalUrl,
          body: req.method !== 'GET' ? req.body : undefined,
          query: Object.keys(req.query).length ? req.query : undefined
        }
      });
      // Don't await saving, let it happen in background
      log.save().catch(err => console.error('Audit log save error:', err));
    } catch (err) {
      console.error('Audit middleware error:', err);
    }
    next();
  };
};

module.exports = {
  createAuditMiddleware
};
