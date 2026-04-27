/**
 * src/routes/user.routes.js
 * Mounts at /api/users (see app.js)
 *
 * GET    /api/users           → list all
 * GET    /api/users/:id       → get one (includes their reviews)
 * POST   /api/users           → create
 * PUT    /api/users/:id       → update
 * DELETE /api/users/:id       → delete
 */
const { Router }      = require("express");
const { body, param } = require("express-validator");
const ctrl            = require("../controllers/user.controller");
const validate        = require("../middleware/validate.middleware");
const { authLimiter } = require("../middleware/rate-limit.middleware");
const { authenticate } = require("../middleware/auth.middleware");

const router = Router();

const idParam = param("id").isInt({ min: 1 }).withMessage("id must be a positive integer");

const registerRules = [
  body("email").isEmail().normalizeEmail().withMessage("valid email required"),
  body("username").trim().notEmpty().withMessage("username is required"),
  body("password").isLength({ min: 6 }).withMessage("password must be at least 6 characters"),
  body("last_active").optional().isISO8601().withMessage("last_active must be a valid ISO date/time string"),
];

const loginRules = [
  body("email").isEmail().normalizeEmail().withMessage("valid email required"),
  body("password").isString().notEmpty().withMessage("password is required"),
];

router.get(  "/",    ctrl.getAll);
router.post("/", registerRules, validate, ctrl.create);
router.post("/login", authLimiter, loginRules, validate, ctrl.login);
router.get("/me", authenticate, ctrl.getProfile);
router.get(  "/:id", [idParam], validate, ctrl.getOne);
router.put("/:id", [idParam, ...registerRules.slice(0, 3)], validate, ctrl.update);
router.delete("/:id",[idParam], validate, ctrl.remove);

module.exports = router;