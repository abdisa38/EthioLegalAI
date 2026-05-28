const rateLimit = require("express-rate-limit");
const { logSecurityEvent } = require("../utils/securityLogger");

const buildLimiter = (options) =>
  rateLimit({
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next, info) => {
      logSecurityEvent("rate_limit", {
        path: req.originalUrl,
        ip: req.ip,
        limit: info?.limit,
      });
      res.status(429).json({ error: { message: "Too many requests. Please slow down." } });
    },
    ...options,
  });

const apiLimiter = buildLimiter({
  windowMs: 15 * 60 * 1000,
  max: 200,
});

const authLimiter = buildLimiter({
  windowMs: 10 * 60 * 1000,
  max: 20,
});

const aiLimiter = buildLimiter({
  windowMs: 60 * 1000,
  max: 30,
});

const uploadLimiter = buildLimiter({
  windowMs: 10 * 60 * 1000,
  max: 30,
});

module.exports = {
  apiLimiter,
  authLimiter,
  aiLimiter,
  uploadLimiter,
};
