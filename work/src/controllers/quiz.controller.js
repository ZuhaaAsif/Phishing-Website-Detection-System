/**
 * src/controllers/quiz.controller.js
 * Handles HTTP concerns (req, res) and delegates to quiz.service.js.
 * Keep controllers thin — no business logic here.
 */
const quizService = require("../services/quiz.service");

// ─── Challenges ──────────────────────────────────────────────────────────────

/** GET /api/quiz/challenges */
const getChallenges = async (_req, res, next) => {
  try {
    const challenges = await quizService.getAllChallenges();
    res.json({ success: true, data: challenges });
  } catch (err) {
    next(err);
  }
};

/** GET /api/quiz/challenges/:id */
const getChallenge = async (req, res, next) => {
  try {
    const challenge = await quizService.getChallengeById(Number(req.params.id));
    if (!challenge) {
      return res.status(404).json({ success: false, message: "Challenge not found" });
    }
    res.json({ success: true, data: challenge });
  } catch (err) {
    next(err);
  }
};

// ─── Sessions ─────────────────────────────────────────────────────────────────

/**
 * POST /api/quiz/sessions
 * Body: { user_id?: number }   — user_id is optional (guest play allowed)
 */
const createSession = async (req, res, next) => {
  try {
    const user_id = req.body.user_id ? Number(req.body.user_id) : null;
    const session = await quizService.createSession(user_id);
    res.status(201).json({ success: true, data: session });
  } catch (err) {
    next(err);
  }
};

/** GET /api/quiz/sessions/:sessionId */
const getSession = async (req, res, next) => {
  try {
    const session = await quizService.getSessionById(Number(req.params.sessionId));
    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }
    res.json({ success: true, data: session });
  } catch (err) {
    next(err);
  }
};

// ─── Attempts ─────────────────────────────────────────────────────────────────

/**
 * POST /api/quiz/sessions/:sessionId/attempts
 * Body: { challenge_id: number }
 */
const createAttempt = async (req, res, next) => {
  try {
    const attempt = await quizService.createAttempt(
      Number(req.params.sessionId),
      Number(req.body.challenge_id)
    );
    res.status(201).json({ success: true, data: attempt });
  } catch (err) {
    next(err);
  }
};

/** GET /api/quiz/attempts/:attemptId */
const getAttempt = async (req, res, next) => {
  try {
    const attempt = await quizService.getAttemptById(Number(req.params.attemptId));
    if (!attempt) {
      return res.status(404).json({ success: false, message: "Attempt not found" });
    }
    res.json({ success: true, data: attempt });
  } catch (err) {
    next(err);
  }
};

// ─── Flag clicks ──────────────────────────────────────────────────────────────

/**
 * POST /api/quiz/attempts/:attemptId/click
 *
 * Body: { flag_id?: number }
 *   - flag_id present   → user clicked a specific hotspot (may be correct or from wrong challenge)
 *   - flag_id absent    → user clicked a blank/wrong area
 *
 * Response includes:
 *   - is_correct: boolean
 *   - explanation: string | null   (only on correct clicks)
 *   - allFlagsFound: boolean       (true when this click finishes the challenge)
 *   - alreadyFound: boolean        (true if this flag was already clicked correctly)
 */
const recordClick = async (req, res, next) => {
  try {
    const flag_id = req.body.flag_id ? Number(req.body.flag_id) : null;
    const result = await quizService.recordClick(
      Number(req.params.attemptId),
      flag_id
    );
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

// ─── Complete attempt ─────────────────────────────────────────────────────────

/**
 * PUT /api/quiz/attempts/:attemptId/complete
 * Body: { used_solution?: boolean }
 *
 * Call this when the user clicks "See Solution".
 * (Auto-completion when all flags are found is handled inside recordClick.)
 * Returns the full challenge with all red flags revealed.
 */
const completeAttempt = async (req, res, next) => {
  try {
    const used_solution = Boolean(req.body.used_solution);
    const result = await quizService.completeAttempt(
      Number(req.params.attemptId),
      used_solution
    );
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

// ─── Certificate ─────────────────────────────────────────────────────────────

/**
 * GET /api/quiz/sessions/:sessionId/certificate
 * Returns certificate data only if the session is complete and all flags found.
 */
const getCertificate = async (req, res, next) => {
  try {
    const cert = await quizService.getCertificate(Number(req.params.sessionId));
    res.json({ success: true, data: cert });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getChallenges,
  getChallenge,
  createSession,
  getSession,
  createAttempt,
  getAttempt,
  recordClick,
  completeAttempt,
  getCertificate,
};
