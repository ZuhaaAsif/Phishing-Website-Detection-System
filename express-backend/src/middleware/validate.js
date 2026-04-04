const { sendError } = require("../utils/response");

/**
 * Lightweight field-presence validator.
 * Usage: validate(["name", "email"])  →  returns Express middleware
 *
 * Replace or extend this with a library like Zod or Joi
 * once your schemas grow more complex.
 */
const validate = (requiredFields) => (req, res, next) => {
  const missing = requiredFields.filter(
    (field) => req.body[field] === undefined || req.body[field] === ""
  );

  if (missing.length > 0) {
    return sendError(
      res,
      `Missing required fields: ${missing.join(", ")}`,
      400,
      missing.map((f) => ({ field: f, message: `${f} is required` }))
    );
  }

  next();
};

module.exports = { validate };
