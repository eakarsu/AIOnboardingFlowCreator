const { v4: uuidv4 } = require('uuid');

/**
 * Attaches a unique requestId to every request and response.
 * Used by the structured error handler to correlate logs with client errors.
 */
const requestIdMiddleware = (req, res, next) => {
  req.requestId = uuidv4();
  res.setHeader('X-Request-Id', req.requestId);
  next();
};

module.exports = { requestIdMiddleware };
