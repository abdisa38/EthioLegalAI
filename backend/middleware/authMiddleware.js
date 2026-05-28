const User = require("../models/User");
const { verifyAccessToken } = require("../utils/jwt");
const { logSecurityEvent } = require("../utils/securityLogger");

const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: { message: "Unauthorized" } });
    }

    const token = authHeader.split(" ")[1];

    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id).select("name email role languagePreference");

    if (!user) {
      return res.status(401).json({ error: { message: "Unauthorized" } });
    }

    req.user = user;
    return next();
  } catch (error) {
    logSecurityEvent("invalid_access_token", { ip: req.ip, path: req.originalUrl });
    return res.status(401).json({ error: { message: "Unauthorized" } });
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ error: { message: "Forbidden" } });
  }
  return next();
};

module.exports = { requireAuth, requireRole };
