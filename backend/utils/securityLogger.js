const logSecurityEvent = (type, details = {}) => {
  const payload = {
    type,
    timestamp: new Date().toISOString(),
    ...details,
  };
  console.warn("[SECURITY]", JSON.stringify(payload));
};

module.exports = {
  logSecurityEvent,
};
