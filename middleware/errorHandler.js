// Global error handler — used as last middleware in server.js
const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  console.error(err);

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};

// 404 handler — place before errorHandler in server.js
const notFound = (req, res, next) => {
  const err = new Error(`Route Not Found — ${req.originalUrl}`);
  res.status(404);
  next(err);
};

module.exports = { errorHandler, notFound };
