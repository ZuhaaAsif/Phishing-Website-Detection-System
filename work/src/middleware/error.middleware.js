/**
 * src/middleware/error.middleware.js
 * Centralised 404 and error handlers.
 * Add this AFTER all routes in app.js.
 */

/** Catch-all for unmatched routes */
const notFound = (req, res, next) => {
  const err = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  err.statusCode = 404;
  next(err);
};

/**
 * Global error handler.
 * Express recognises a 4-argument middleware as an error handler.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, _req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === "production";

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    // Hide stack traces in production
    ...(isProduction ? {} : { stack: err.stack }),
  });
};

module.exports = { notFound, errorHandler };
