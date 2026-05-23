const jwt = require("jsonwebtoken");
const User = require("../models/User");

const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: { message: "Unauthorized" } });
    }

    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      return res.status(500).json({ error: { message: "JWT_SECRET is not set" } });
    }

    const decoded = jwt.verify(token, secret);
    const user = await User.findById(decoded.id).select("name email role languagePreference");

    if (!user) {
      return res.status(401).json({ error: { message: "Unauthorized" } });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ error: { message: "Unauthorized" } });
  }
};

module.exports = { requireAuth };
