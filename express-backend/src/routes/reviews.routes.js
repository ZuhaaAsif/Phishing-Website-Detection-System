/**
 * src/routes/reviews.routes.js
 * Mounts at /api/reviews (see app.js)
 *
 * GET    /api/reviews           → list all
 * GET    /api/reviews/:id       → get one
 * POST   /api/reviews           → create
 * PUT    /api/reviews/:id       → full update
 * DELETE /api/reviews/:id       → delete
 */
const { Router }   = require("express");
const { body, param } = require("express-validator");
const ctrl         = require("../controllers/reviews.controller");
const validate     = require("../middleware/validate.middleware");

const router = Router();

// Reusable validators
const idParam    = param("id").isInt({ min: 1 }).withMessage("id must be a positive integer");
const bodyRules  = [
  body("review").optional().isString().withMessage("review must be a string"),
  body("website_id").isInt({ min: 1 }).withMessage("website_id must be a positive integer"),
  body("user_id").isInt({ min: 1 }).withMessage("user_id must be a positive integer"),
  body("rate").isInt({ min: 1, max: 5 }).withMessage("rate must be between 1 and 5"),
];

router.get(  "/",    ctrl.getAll);
router.get(  "/:id", [idParam], validate, ctrl.getOne);
router.post( "/",    bodyRules,  validate, ctrl.create);
router.put(  "/:id", [idParam, ...bodyRules], validate, ctrl.update);
router.delete("/:id",[idParam], validate, ctrl.remove);

module.exports = router;
