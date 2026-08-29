const { rateLimit } = require('express-rate-limit');

const sharedOptions = {
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'fail',
    message: 'Too many requests, please try again later.'
  }
};

const authLimiter = rateLimit({
  ...sharedOptions,
  windowMs: 15 * 60 * 1000,
  limit: 50
});

const apiLimiter = rateLimit({
  ...sharedOptions,
  windowMs: 15 * 60 * 1000,
  limit: 200
});

module.exports = { authLimiter, apiLimiter };
