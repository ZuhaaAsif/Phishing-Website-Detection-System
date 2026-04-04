/**
 * src/routes/item.routes.js
 * Mounts at /api/items (see app.js)
 *
 * GET    /api/items           → list all
 * GET    /api/items/:id       → get one
 * POST   /api/items           → create
 * PUT    /api/items/:id       → full update
 * DELETE /api/items/:id       → delete
 */
const { Router }   = require("express");
const { body, param } = require("express-validator");
const ctrl         = require("../controllers/item.controller");
const validate     = require("../middleware/validate.middleware");

const router = Router();

// Reusable validators
const idParam    = param("id").isInt({ min: 1 }).withMessage("id must be a positive integer");
const bodyRules  = [
  body("title").trim().notEmpty().withMessage("title is required"),
  body("description").optional().isString(),
  body("published").optional().isBoolean(),
  body("authorId").optional().isInt({ min: 1 }),
];

router.get(  "/",    ctrl.getAll);
router.get(  "/:id", [idParam], validate, ctrl.getOne);
router.post( "/",    bodyRules,  validate, ctrl.create);
router.put(  "/:id", [idParam, ...bodyRules], validate, ctrl.update);
router.delete("/:id",[idParam], validate, ctrl.remove);

module.exports = router;
