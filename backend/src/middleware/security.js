const helmet = require('helmet');

// Helper to sanitize an object recursively
const sanitize = (obj) => {
  if (typeof obj === 'string') {
    return obj.replace(/<[^>]*>?/gm, ''); // strip HTML tags
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitize);
  }
  if (typeof obj === 'object' && obj !== null) {
    const sanitizedObj = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitizedObj[key] = sanitize(value);
    }
    return sanitizedObj;
  }
  return obj;
};

const sanitizeInput = (req, res, next) => {
  if (req.body) {
    req.body = sanitize(req.body);
  }
  if (req.query) {
    req.query = sanitize(req.query);
  }
  if (req.params) {
    req.params = sanitize(req.params);
  }
  next();
};

const securityHeaders = helmet({
  contentSecurityPolicy: true,
  hsts: true,
  frameguard: { action: 'deny' },
  noSniff: true,
  referrerPolicy: { policy: 'same-origin' }
});

module.exports = {
  securityHeaders,
  sanitizeInput
};
