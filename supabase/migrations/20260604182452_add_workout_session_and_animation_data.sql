/*
  # Add Workout Session Tracking and Exercise Animation Data

  1. New Tables
    - `user_workout_sessions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users) — who is doing the workout
      - `workout_id` (uuid, references workouts) — which workout plan
      - `status` (text) — session state: 'in_progress', 'paused', 'completed', 'abandoned'
      - `current_exercise_index` (int) — which exercise the user is on
      - `started_at` (timestamptz) — when the session started
      - `completed_at` (timestamptz) — when the session ended
      - `total_duration_seconds` (int) — actual elapsed time
      - `calories_burned` (int) — estimated calories
      - `paused_at` (timestamptz) — when the session was last paused
      - `total_paused_seconds` (int) — cumulative pause time

    - `session_exercise_logs`
      - `id` (uuid, primary key)
      - `session_id` (uuid, references user_workout_sessions) — parent session
      - `exercise_id` (uuid, references exercises) — which exercise
      - `order_index` (int) — position in the workout
      - `duration_seconds` (int) — how long the exercise took
      - `reps_completed` (int) — reps done
      - `sets_completed` (int) — sets done
      - `skipped` (boolean) — whether user skipped this exercise
      - `completed_at` (timestamptz) — when this exercise was finished

  2. Modified Tables
    - `exercises` — added column `animation_data` (jsonb) for storing SVG animation keyframes
    - `workouts` — added column `duration_tier` (text) for short/medium/long classification

  3. Security
    - Enable RLS on both new tables
    - Users can only access their own session data
    - Users can insert their own sessions
    - Users can update their own in-progress sessions
    - Public read for exercises and workouts (already exists)

  4. Important Notes
    1. animation_data stores CSS animation parameters as JSON — no binary blobs
    2. duration_tier supports 'short' (5-10 min), 'medium' (15-30 min), 'long' (30-60 min)
    3. session_exercise_logs allows granular tracking of each exercise within a session
    4. paused_at and total_paused_seconds support accurate time tracking even with pauses
*/

-- Add animation_data column to exercises
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'exercises' AND column_name = 'animation_data'
  ) THEN
    ALTER TABLE exercises ADD COLUMN animation_data jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Add duration_tier column to workouts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workouts' AND column_name = 'duration_tier'
  ) THEN
    ALTER TABLE workouts ADD COLUMN duration_tier text DEFAULT 'medium';
  END IF;
END $$;

-- Create user_workout_sessions table
CREATE TABLE IF NOT EXISTS user_workout_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workout_id uuid NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'in_progress',
  current_exercise_index int NOT NULL DEFAULT 0,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  total_duration_seconds int NOT NULL DEFAULT 0,
  calories_burned int NOT NULL DEFAULT 0,
  paused_at timestamptz,
  total_paused_seconds int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create session_exercise_logs table
CREATE TABLE IF NOT EXISTS session_exercise_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES user_workout_sessions(id) ON DELETE CASCADE,
  exercise_id uuid NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  order_index int NOT NULL DEFAULT 0,
  duration_seconds int NOT NULL DEFAULT 0,
  reps_completed int NOT NULL DEFAULT 0,
  sets_completed int NOT NULL DEFAULT 0,
  skipped boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_exercise_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_workout_sessions
CREATE POLICY "Users can view own sessions"
  ON user_workout_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
  ON user_workout_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON user_workout_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions"
  ON user_workout_sessions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS policies for session_exercise_logs
CREATE POLICY "Users can view own exercise logs"
  ON session_exercise_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_workout_sessions
      WHERE user_workout_sessions.id = session_exercise_logs.session_id
      AND user_workout_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own exercise logs"
  ON session_exercise_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_workout_sessions
      WHERE user_workout_sessions.id = session_exercise_logs.session_id
      AND user_workout_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own exercise logs"
  ON session_exercise_logs FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_workout_sessions
      WHERE user_workout_sessions.id = session_exercise_logs.session_id
      AND user_workout_sessions.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_workout_sessions
      WHERE user_workout_sessions.id = session_exercise_logs.session_id
      AND user_workout_sessions.user_id = auth.uid()
    )
  );

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_workout_sessions_user_id ON user_workout_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_workout_sessions_workout_id ON user_workout_sessions(workout_id);
CREATE INDEX IF NOT EXISTS idx_session_exercise_logs_session_id ON session_exercise_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_session_exercise_logs_exercise_id ON session_exercise_logs(exercise_id);

-- Update existing workouts with duration tiers based on duration_minutes
UPDATE workouts SET duration_tier = CASE
  WHEN duration_minutes <= 10 THEN 'short'
  WHEN duration_minutes <= 30 THEN 'medium'
  ELSE 'long'
END;
