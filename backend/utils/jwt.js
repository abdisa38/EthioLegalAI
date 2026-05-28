const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const getJwtOptions = () => ({
  issuer: process.env.JWT_ISSUER || "ethiolegal-ai",
  audience: process.env.JWT_AUDIENCE || "ethiolegal-users",
});

const getAccessTtl = () => process.env.JWT_ACCESS_TTL || "15m";

const generateAccessToken = (user) => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not set");
  }

  const jwtid = crypto.randomUUID();
  return jwt.sign(
    { id: user._id?.toString() || user.id, role: user.role },
    secret,
    {
      expiresIn: getAccessTtl(),
      jwtid,
      subject: user._id?.toString() || user.id,
      ...getJwtOptions(),
    }
  );
};

const verifyAccessToken = (token) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set");
  }
  return jwt.verify(token, secret, getJwtOptions());
};

module.exports = {
  generateAccessToken,
  verifyAccessToken,
};
