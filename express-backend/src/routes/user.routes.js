/**
 * src/routes/user.routes.js
 * Mounts at /api/users (see app.js)
 *
 * GET    /api/users           → list all
 * GET    /api/users/:id       → get one (includes their items)
 * POST   /api/users           → create
 * PUT    /api/users/:id       → update
 * DELETE /api/users/:id       → delete
 */
const { Router }      = require("express");
const { body, param } = require("express-validator");
const ctrl            = require("../controllers/user.controller");
const validate        = require("../middleware/validate.middleware");

const router = Router();

const idParam   = param("id").isInt({ min: 1 }).withMessage("id must be a positive integer");
const bodyRules = [
  body("email").isEmail().normalizeEmail().withMessage("valid email required"),
  body("name").optional().trim().isString(),
];

router.get(  "/",    ctrl.getAll);
router.get(  "/:id", [idParam], validate, ctrl.getOne);
router.post( "/",    bodyRules, validate, ctrl.create);
router.put(  "/:id", [idParam, ...bodyRules], validate, ctrl.update);
router.delete("/:id",[idParam], validate, ctrl.remove);

module.exports = router;
