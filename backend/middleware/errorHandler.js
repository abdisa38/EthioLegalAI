const errorHandler = (err, req, res, next) => {
  const status = err.statusCode || 500;
  const message = err.message || "Unexpected server error";

  console.error("API error:", {
    path: req.originalUrl,
    method: req.method,
    status,
    message,
  });

  res.status(status).json({
    error: {
      message,
    },
  });
};

module.exports = errorHandler;
