/**
 * src/services/quiz.service.js
 * Business-logic layer for the "Spot the Phish" quiz.
 * Controllers call these functions; they never touch req / res directly.
 */
const prisma = require("./db.service");

// ─── Constants ────────────────────────────────────────────────────────────────
const TOTAL_CHALLENGES = 3;
const FLAGS_PER_CHALLENGE = 3;
const TOTAL_FLAGS = TOTAL_CHALLENGES * FLAGS_PER_CHALLENGE;

// ─── Challenges ──────────────────────────────────────────────────────────────

/**
 * Return all challenges ordered by challenge_order.
 * Red-flag bounding boxes are included so the frontend can render hotspots.
 * Explanations are OMITTED here — only revealed after a correct click.
 */
const getAllChallenges = async () =>
  prisma.quiz_challenges.findMany({
    orderBy: { challenge_order: "asc" },
    select: {
      challenge_id: true,
      challenge_order: true,
      title: true,
      description: true,
      fake_url: true,
      screenshot_url: true,
      difficulty: true,
      // Include bounding boxes but strip explanations from the list view
      red_flags: {
        select: {
          flag_id: true,
          label: true,
          element_type: true,
          x_percent: true,
          y_percent: true,
          width_percent: true,
          height_percent: true,
        },
      },
    },
  });

/**
 * Return a single challenge with full red-flag detail (including explanations).
 * Used internally and by the "See Solution" endpoint.
 */
const getChallengeById = async (challenge_id) =>
  prisma.quiz_challenges.findUnique({
    where: { challenge_id },
    include: { red_flags: true },
  });

// ─── Sessions ─────────────────────────────────────────────────────────────────

/** Start a new quiz session (optionally linked to an authenticated user). */
const createSession = async (user_id = null) =>
  prisma.quiz_sessions.create({
    data: { user_id },
    include: { attempts: true },
  });

/** Fetch a session with all its attempts and per-attempt flag clicks. */
const getSessionById = async (session_id) =>
  prisma.quiz_sessions.findUnique({
    where: { session_id },
    include: {
      attempts: {
        include: {
          challenge: {
            select: { challenge_id: true, challenge_order: true, title: true },
          },
          flag_clicks: true,
        },
        orderBy: { started_at: "asc" },
      },
    },
  });

// ─── Attempts ─────────────────────────────────────────────────────────────────

/**
 * Begin an attempt for a specific challenge within a session.
 * Enforces:
 *   - Session must exist and belong to the caller (no cross-session abuse)
 *   - Challenge must exist
 *   - No duplicate in-progress attempt for this challenge in this session
 *   - Challenges must be taken in order (can't skip ahead)
 */
const createAttempt = async (session_id, challenge_id) => {
  const [session, challenge] = await Promise.all([
    prisma.quiz_sessions.findUnique({ where: { session_id } }),
    prisma.quiz_challenges.findUnique({ where: { challenge_id } }),
  ]);

  if (!session) {
    const err = new Error("Session not found");
    err.statusCode = 404;
    throw err;
  }
  if (session.completed_at) {
    const err = new Error("This session is already completed");
    err.statusCode = 409;
    throw err;
  }
  if (!challenge) {
    const err = new Error("Challenge not found");
    err.statusCode = 404;
    throw err;
  }

  // Prevent duplicate attempt for same challenge in same session
  const existing = await prisma.quiz_attempts.findFirst({
    where: { session_id, challenge_id },
  });
  if (existing) {
    const err = new Error("Attempt for this challenge already exists in this session");
    err.statusCode = 409;
    throw err;
  }

  // Enforce sequential order
  const completedAttempts = await prisma.quiz_attempts.count({
    where: { session_id, completed: true },
  });
  if (challenge.challenge_order !== completedAttempts + 1) {
    const err = new Error(
      `You must complete challenge ${completedAttempts + 1} before starting challenge ${challenge.challenge_order}`
    );
    err.statusCode = 422;
    throw err;
  }

  return prisma.quiz_attempts.create({
    data: { session_id, challenge_id },
    include: {
      challenge: {
        select: {
          challenge_id: true,
          challenge_order: true,
          title: true,
          description: true,
          fake_url: true,
          screenshot_url: true,
          difficulty: true,
          // Return flag bounding boxes (no explanations yet)
          red_flags: {
            select: {
              flag_id: true,
              label: true,
              element_type: true,
              x_percent: true,
              y_percent: true,
              width_percent: true,
              height_percent: true,
            },
          },
        },
      },
    },
  });
};

/** Fetch a single attempt with all its clicks. */
const getAttemptById = async (attempt_id) =>
  prisma.quiz_attempts.findUnique({
    where: { attempt_id },
    include: {
      flag_clicks: { include: { flag: true } },
      challenge: { include: { red_flags: true } },
    },
  });

// ─── Flag clicks ──────────────────────────────────────────────────────────────

/**
 * Record a user's click during an attempt.
 *
 * @param {number} attempt_id
 * @param {number|null} flag_id  – null when the clicked area was wrong
 * @returns {{ click, attempt, alreadyFound, allFlagsFound, explanation|null }}
 */
const recordClick = async (attempt_id, flag_id) => {
  const attempt = await prisma.quiz_attempts.findUnique({
    where: { attempt_id },
    include: {
      challenge: { include: { red_flags: true } },
      flag_clicks: true,
    },
  });

  if (!attempt) {
    const err = new Error("Attempt not found");
    err.statusCode = 404;
    throw err;
  }
  if (attempt.completed) {
    const err = new Error("This attempt is already completed");
    err.statusCode = 409;
    throw err;
  }

  // Wrong-area click (no matching flag_id)
  if (!flag_id) {
    const click = await prisma.quiz_flag_clicks.create({
      data: { attempt_id, flag_id: null, is_correct: false },
    });
    return { click, is_correct: false, explanation: null, alreadyFound: false, allFlagsFound: false };
  }

  // Verify the flag belongs to this challenge
  const flag = attempt.challenge.red_flags.find((f) => f.flag_id === flag_id);
  if (!flag) {
    const err = new Error("Flag does not belong to this challenge");
    err.statusCode = 422;
    throw err;
  }

  // Check if already found in this attempt
  const alreadyFound = attempt.flag_clicks.some(
    (c) => c.flag_id === flag_id && c.is_correct
  );
  if (alreadyFound) {
    return {
      is_correct: true,
      alreadyFound: true,
      explanation: flag.explanation,
      allFlagsFound: false,
    };
  }

  // Record correct click
  const click = await prisma.quiz_flag_clicks.create({
    data: { attempt_id, flag_id, is_correct: true },
  });

  // Count how many distinct correct flags have been found now
  const foundSoFar = await prisma.quiz_flag_clicks.groupBy({
    by: ["flag_id"],
    where: { attempt_id, is_correct: true, flag_id: { not: null } },
  });
  const flagsFound = foundSoFar.length;
  const allFlagsFound = flagsFound >= FLAGS_PER_CHALLENGE;

  // If all flags found, auto-complete the attempt
  if (allFlagsFound) {
    await _completeAttempt(attempt_id, attempt.session_id, flagsFound, false);
  } else {
    await prisma.quiz_attempts.update({
      where: { attempt_id },
      data: { flags_found: flagsFound },
    });
  }

  return { click, is_correct: true, alreadyFound: false, explanation: flag.explanation, allFlagsFound, flagsFound };
};

// ─── Completing an attempt ────────────────────────────────────────────────────

/**
 * Explicitly complete an attempt — called when the user clicks "See Solution".
 * Also called internally when all flags are found naturally.
 *
 * @param {number} attempt_id
 * @param {boolean} used_solution  – true only when user clicked "See Solution"
 */
const completeAttempt = async (attempt_id, used_solution = false) => {
  const attempt = await prisma.quiz_attempts.findUnique({
    where: { attempt_id },
    include: { flag_clicks: true },
  });

  if (!attempt) {
    const err = new Error("Attempt not found");
    err.statusCode = 404;
    throw err;
  }
  if (attempt.completed) {
    const err = new Error("Attempt is already completed");
    err.statusCode = 409;
    throw err;
  }

  const flagsFound = attempt.flag_clicks.filter((c) => c.is_correct && c.flag_id).length;

  // Fetch the full challenge with all red flags so we can return the solution
  const challenge = await getChallengeById(attempt.challenge_id);

  const result = await _completeAttempt(
    attempt_id,
    attempt.session_id,
    flagsFound,
    used_solution
  );

  return { ...result, challenge };
};

/**
 * Internal helper: marks attempt as done, updates session aggregate,
 * and issues a certificate if all 3 challenges are complete.
 */
const _completeAttempt = async (attempt_id, session_id, flagsFound, used_solution) => {
  const [updatedAttempt] = await prisma.$transaction([
    prisma.quiz_attempts.update({
      where: { attempt_id },
      data: {
        completed: true,
        used_solution,
        flags_found: flagsFound,
        completed_at: new Date(),
      },
    }),
  ]);

  // Re-tally session totals
  const sessionAttempts = await prisma.quiz_attempts.findMany({
    where: { session_id, completed: true },
  });

  const totalFlagsFound = sessionAttempts.reduce((sum, a) => sum + a.flags_found, 0);
  const allChallengesDone = sessionAttempts.length >= TOTAL_CHALLENGES;
  const certificate_earned = allChallengesDone && totalFlagsFound >= TOTAL_FLAGS;

  const sessionUpdate = { flags_found: totalFlagsFound };
  if (allChallengesDone) {
    sessionUpdate.completed_at = new Date();
    sessionUpdate.certificate_earned = certificate_earned;
  }

  const updatedSession = await prisma.quiz_sessions.update({
    where: { session_id },
    data: sessionUpdate,
  });

  return { attempt: updatedAttempt, session: updatedSession, certificate_earned };
};

// ─── Certificate ─────────────────────────────────────────────────────────────

/**
 * Return certificate data for a completed session.
 * Throws 404 if the session is incomplete or certificate was not earned.
 */
const getCertificate = async (session_id) => {
  const session = await prisma.quiz_sessions.findUnique({
    where: { session_id },
    include: {
      users: { select: { username: true, email: true } },
      attempts: { include: { challenge: true } },
    },
  });

  if (!session) {
    const err = new Error("Session not found");
    err.statusCode = 404;
    throw err;
  }
  if (!session.certificate_earned) {
    const err = new Error(
      session.completed_at
        ? "Certificate not earned — not all flags were found"
        : "Quiz session is not yet complete"
    );
    err.statusCode = 403;
    throw err;
  }

  return {
    session_id: session.session_id,
    user: session.users ?? null,
    completed_at: session.completed_at,
    flags_found: session.flags_found,
    total_flags: TOTAL_FLAGS,
    challenges_completed: session.attempts.length,
    certificate_earned: true,
  };
};

module.exports = {
  getAllChallenges,
  getChallengeById,
  createSession,
  getSessionById,
  createAttempt,
  getAttemptById,
  recordClick,
  completeAttempt,
  getCertificate,
  TOTAL_CHALLENGES,
  FLAGS_PER_CHALLENGE,
  TOTAL_FLAGS,
};
