const rateLimit = require('express-rate-limit');

const customHandler = (req, res, next, options) => {
  res.status(options.statusCode).json({
    success: false,
    error: 'Rate limit exceeded',
    message: options.message
  });
};

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: 'Too many authentication attempts, please try again later.',
  handler: customHandler
});

const chatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30,
  message: 'Too many chat messages sent, please slow down.',
  handler: customHandler
});

const predictLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20,
  message: 'Too many prediction requests, please slow down.',
  handler: customHandler
});

const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100,
  message: 'Too many requests, please slow down.',
  handler: customHandler
});

module.exports = {
  authLimiter,
  chatLimiter,
  predictLimiter,
  generalLimiter
};
