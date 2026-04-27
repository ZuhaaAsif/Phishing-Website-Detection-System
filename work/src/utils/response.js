/**
 * Standardised JSON response helpers.
 * All API responses follow the same envelope shape so clients
 * can always expect { success, data|error, message? }.
 */

const sendSuccess = (res, data, statusCode = 200, message = null) => {
  const body = { success: true, data };
  if (message) body.message = message;
  return res.status(statusCode).json(body);
};

const sendError = (res, message, statusCode = 500, errors = null) => {
  const body = { success: false, error: message };
  if (errors) body.errors = errors;
  return res.status(statusCode).json(body);
};

module.exports = { sendSuccess, sendError };
