const sanitizeObject = (value) => {
  if (!value || typeof value !== "object") {
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => sanitizeObject(item));
    return;
  }

  Object.keys(value).forEach((key) => {
    if (key.includes("$") || key.includes(".")) {
      delete value[key];
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
