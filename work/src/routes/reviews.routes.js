/**
 * src/routes/reviews.routes.js
 * Mounts at /api/reviews (see app.js)
 *
 * GET    /api/reviews                 → list all
 * GET    /api/reviews/:id             → get one
 * GET    /api/reviews/domain/:domain  → get all reviews for a website domain
 * POST   /api/reviews                 → create
 * PUT    /api/reviews/:id             → update
 * DELETE /api/reviews/:id             → delete
 */
const { Router }   = require("express");
const { body, param } = require("express-validator");
const ctrl         = require("../controllers/reviews.controller");
const validate     = require("../middleware/validate.middleware");
const { authenticate } = require("../middleware/auth.middleware");
const { reviewLimiter } = require("../middleware/rate-limit.middleware");

const router = Router();

// Reusable validators
const idParam = param("id").isInt({ min: 1 }).withMessage("id must be a positive integer");
const bodyRules = [
  body("review").optional().isString().withMessage("review must be a string"),
  body("website_id").isInt({ min: 1 }).withMessage("website_id must be a positive integer"),
  body("rate").isInt({ min: 1, max: 5 }).withMessage("rate must be between 1 and 5"),
];

router.get("/", ctrl.getAll);
router.get("/domain/:domain", [param("domain").trim().notEmpty().withMessage("domain is required")], validate, ctrl.getByWebsiteDomain);
router.get("/:id", [idParam], validate, ctrl.getOne);
router.post("/", reviewLimiter, authenticate, bodyRules, validate, ctrl.create);
router.put("/:id", authenticate, [idParam, ...bodyRules], validate, ctrl.update);
router.delete("/:id", authenticate, [idParam], validate, ctrl.remove);

module.exports = router;
