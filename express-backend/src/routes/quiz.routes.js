/**
 * src/routes/quiz.routes.js
 * Mounts at /api/quiz  (add  app.use("/api/quiz", require("./routes/quiz.routes"))  in app.js)
 *
 * GET    /api/quiz/challenges                          → list all 3 challenges
 * GET    /api/quiz/challenges/:id                      → get one challenge (solution included)
 *
 * POST   /api/quiz/sessions                            → start a new quiz session
 * GET    /api/quiz/sessions/:sessionId                 → get session status + attempts
 * GET    /api/quiz/sessions/:sessionId/certificate     → fetch Safety Certificate
 *
 * POST   /api/quiz/sessions/:sessionId/attempts        → start a challenge attempt
 * GET    /api/quiz/attempts/:attemptId                 → get attempt detail
 * POST   /api/quiz/attempts/:attemptId/click           → record a flag click
 * PUT    /api/quiz/attempts/:attemptId/complete        → mark attempt done / reveal solution
 */
const { Router }      = require("express");
const { body, param } = require("express-validator");
const ctrl            = require("../controllers/quiz.controller");
const validate        = require("../middleware/validate.middleware");

const router = Router();

// ── Reusable param validators ─────────────────────────────────────────────────
const challengeId = param("id")
  .isInt({ min: 1 })
  .withMessage("challenge id must be a positive integer");

const sessionId = param("sessionId")
  .isInt({ min: 1 })
  .withMessage("sessionId must be a positive integer");

const attemptId = param("attemptId")
  .isInt({ min: 1 })
  .withMessage("attemptId must be a positive integer");

// ── Challenges ────────────────────────────────────────────────────────────────
router.get("/challenges",      ctrl.getChallenges);
router.get("/challenges/:id",  [challengeId], validate, ctrl.getChallenge);

// ── Sessions ──────────────────────────────────────────────────────────────────
router.post(
  "/sessions",
  [
    body("user_id")
      .optional()
      .isInt({ min: 1 })
      .withMessage("user_id must be a positive integer if provided"),
  ],
  validate,
  ctrl.createSession
);

router.get("/sessions/:sessionId",             [sessionId], validate, ctrl.getSession);
router.get("/sessions/:sessionId/certificate", [sessionId], validate, ctrl.getCertificate);

// ── Attempts ──────────────────────────────────────────────────────────────────
router.post(
  "/sessions/:sessionId/attempts",
  [
    sessionId,
    body("challenge_id")
      .isInt({ min: 1 })
      .withMessage("challenge_id must be a positive integer"),
  ],
  validate,
  ctrl.createAttempt
);

router.get("/attempts/:attemptId", [attemptId], validate, ctrl.getAttempt);

// ── Clicks ────────────────────────────────────────────────────────────────────
router.post(
  "/attempts/:attemptId/click",
  [
    attemptId,
    body("flag_id")
      .optional({ nullable: true })
      .isInt({ min: 1 })
      .withMessage("flag_id must be a positive integer if provided"),
  ],
  validate,
  ctrl.recordClick
);

// ── Complete / reveal ─────────────────────────────────────────────────────────
router.put(
  "/attempts/:attemptId/complete",
  [
    attemptId,
    body("used_solution")
      .optional()
      .isBoolean()
      .withMessage("used_solution must be a boolean"),
  ],
  validate,
  ctrl.completeAttempt
);

module.exports = router;
