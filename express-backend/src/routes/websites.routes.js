/**
 * src/routes/websites.routes.js
 * Mounts at /api/websites (see app.js)
 *
 * GET    /api/websites           → list all
 * GET    /api/websites/:id       → get one
 * POST   /api/websites           → create
 * PUT    /api/websites/:id       → full update
 * DELETE /api/websites/:id       → delete
 */
const { Router }   = require("express");
const { body, param } = require("express-validator");
const ctrl         = require("../controllers/websites.controller");
const validate     = require("../middleware/validate.middleware");

const router = Router();

// Reusable validators
const idParam    = param("id").isInt({ min: 1 }).withMessage("id must be a positive integer");
const bodyRules  = [
  body("website_name").trim().notEmpty().withMessage("website_name is required"),
  body("url").trim().isURL().withMessage("url must be a valid URL"),
  body("domain").trim().notEmpty().withMessage("domain is required"),
  body("riskScore").optional().isFloat({ min: 0, max: 100 }),
  body("security_rate").optional().isInt({ min: 1, max: 5 }),
  body("reputation").optional().isString(),
  body("analysisDetails").optional()
];

router.get(  "/",    ctrl.getAll);
router.get(  "/:id", [idParam], validate, ctrl.getOne);
router.post( "/",    bodyRules,  validate, ctrl.create);
router.put(  "/:id", [idParam, ...bodyRules], validate, ctrl.update);
router.delete("/:id",[idParam], validate, ctrl.remove);

module.exports = router;