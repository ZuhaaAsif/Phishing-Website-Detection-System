const { sendError } = require("../utils/response");

/**
 * Global error-handling middleware.
 * Must be registered LAST in Express (after all routes).
 */
const errorHandler = (err, req, res, next) => {
  console.error("Unhandled error:", err);

  // Prisma-specific errors
  if (err.code === "P2002") {
    return sendError(res, "A record with that value already exists.", 409);
  }
  if (err.code === "P2025") {
    return sendError(res, "Record not found.", 404);
  }

  // Generic fallback
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal server error.";
  return sendError(res, message, status);
};

/**
 * 404 handler — catch requests that matched no route.
 */
const notFound = (req, res) => {
  return sendError(res, `Route ${req.method} ${req.originalUrl} not found.`, 404);
};

module.exports = { errorHandler, notFound };
