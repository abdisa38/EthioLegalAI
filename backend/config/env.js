const required = [
  "MONGODB_URI",
  "JWT_SECRET",
  "GEMINI_API_KEY",
];

const productionRequired = [
  "COOKIE_SECRET",
  "JWT_ISSUER",
  "JWT_AUDIENCE",
  "REFRESH_TOKEN_TTL_DAYS",
];

const optional = [
  "JWT_ISSUER",
  "JWT_AUDIENCE",
  "JWT_ACCESS_TTL",
  "REFRESH_TOKEN_TTL_DAYS",
  "COOKIE_SECRET",
  "COOKIE_DOMAIN",
  "COOKIE_SAMESITE",
  "COOKIE_SECURE",
  "CORS_ORIGIN",
];

const validateEnv = () => {
  const requiredKeys = process.env.NODE_ENV === "production"
    ? required.concat(productionRequired)
    : required;
  const missing = requiredKeys.filter((key) => !process.env[key]);
  if (missing.length) {
    const message = `Missing required environment variables: ${missing.join(", ")}`;
    if (process.env.NODE_ENV === "production") {
      throw new Error(message);
    }
    console.warn(message);
  }

  optional.forEach((key) => {
    if (!process.env[key]) {
      return;
    }
  });
};

module.exports = {
  validateEnv,
};
