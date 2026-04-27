/**
 * src/middleware/validate.middleware.js
 * Runs express-validator results and short-circuits with 422 on failure.
 * Usage: place after your validator chain in a route definition.
 */
const { validationResult } = require("express-validator");

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

module.exports = validate;
