const xss = require("xss");

const MAX_SANITIZE_LENGTH = 20000;

const sanitizeString = (value) => {
  if (typeof value !== "string") return value;
  if (value.length > MAX_SANITIZE_LENGTH) return value;
  return xss(value, {
    whiteList: {},
    stripIgnoreTag: true,
    stripIgnoreTagBody: ["script"],
  });
};

const sanitizeObject = (value) => {
  if (!value || typeof value !== "object") {
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      if (typeof item === "string") {
        value[index] = sanitizeString(item);
        return;
      }
      sanitizeObject(item);
    });
    return;
  }

  Object.keys(value).forEach((key) => {
    if (key.includes("$") || key.includes(".")) {
      delete value[key];
      return;
    }
    if (typeof value[key] === "string") {
      value[key] = sanitizeString(value[key]);
      return;
    }
    sanitizeObject(value[key]);
  });
};

const sanitizeRequest = (req, res, next) => {
  sanitizeObject(req.body);
  sanitizeObject(req.query);
  sanitizeObject(req.params);
  next();
};

module.exports = sanitizeRequest;
