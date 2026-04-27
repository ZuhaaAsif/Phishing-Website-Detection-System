-- CreateTable
CREATE TABLE "quiz_challenges" (
    "challenge_id" SERIAL NOT NULL,
    "challenge_order" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "fake_url" VARCHAR(512) NOT NULL,
    "real_url" VARCHAR(512) NOT NULL,
    "screenshot_url" VARCHAR(512),
    "difficulty" VARCHAR(50) NOT NULL DEFAULT 'medium',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quiz_challenges_pkey" PRIMARY KEY ("challenge_id")
);

-- CreateTable
CREATE TABLE "quiz_red_flags" (
    "flag_id" SERIAL NOT NULL,
    "challenge_id" INTEGER NOT NULL,
    "label" VARCHAR(255) NOT NULL,
    "explanation" TEXT NOT NULL,
    "element_type" VARCHAR(100) NOT NULL,
    "x_percent" DOUBLE PRECISION NOT NULL,
    "y_percent" DOUBLE PRECISION NOT NULL,
    "width_percent" DOUBLE PRECISION NOT NULL,
    "height_percent" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "quiz_red_flags_pkey" PRIMARY KEY ("flag_id")
);

-- CreateTable
CREATE TABLE "quiz_sessions" (
    "session_id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "flags_found" INTEGER NOT NULL DEFAULT 0,
    "certificate_earned" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "quiz_sessions_pkey" PRIMARY KEY ("session_id")
);

-- CreateTable
CREATE TABLE "quiz_attempts" (
    "attempt_id" SERIAL NOT NULL,
    "session_id" INTEGER NOT NULL,
    "challenge_id" INTEGER NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "used_solution" BOOLEAN NOT NULL DEFAULT false,
    "flags_found" INTEGER NOT NULL DEFAULT 0,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "quiz_attempts_pkey" PRIMARY KEY ("attempt_id")
);

-- CreateTable
CREATE TABLE "quiz_flag_clicks" (
    "click_id" SERIAL NOT NULL,
    "attempt_id" INTEGER NOT NULL,
    "flag_id" INTEGER,
    "is_correct" BOOLEAN NOT NULL,
    "clicked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quiz_flag_clicks_pkey" PRIMARY KEY ("click_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "quiz_challenges_challenge_order_key" ON "quiz_challenges"("challenge_order");

-- AddForeignKey
ALTER TABLE "quiz_red_flags" ADD CONSTRAINT "quiz_red_flags_challenge_id_fkey" FOREIGN KEY ("challenge_id") REFERENCES "quiz_challenges"("challenge_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_sessions" ADD CONSTRAINT "quiz_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "quiz_sessions"("session_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_challenge_id_fkey" FOREIGN KEY ("challenge_id") REFERENCES "quiz_challenges"("challenge_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_flag_clicks" ADD CONSTRAINT "quiz_flag_clicks_attempt_id_fkey" FOREIGN KEY ("attempt_id") REFERENCES "quiz_attempts"("attempt_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_flag_clicks" ADD CONSTRAINT "quiz_flag_clicks_flag_id_fkey" FOREIGN KEY ("flag_id") REFERENCES "quiz_red_flags"("flag_id") ON DELETE SET NULL ON UPDATE CASCADE;
