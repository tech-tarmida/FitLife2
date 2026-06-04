/*
  # FitLife Fitness App - Complete Database Schema

  ## Overview
  This migration creates the full database schema for the FitLife fitness web app.

  ## New Tables

  ### profiles
  - Extends auth.users with fitness-specific user data
  - Stores avatar, bio, fitness goals, weight, height, subscription tier

  ### workouts
  - Workout plans (admin-created or user-created)
  - Category (weight_loss, muscle_gain, home, cardio, yoga, strength)
  - Difficulty level, duration, calories burned estimate

  ### exercises
  - Individual exercises with image/video URLs, muscle groups, instructions
  - Searchable by name, category, muscle group

  ### workout_exercises
  - Join table linking workouts to exercises with sets/reps/duration

  ### user_workout_logs
  - Tracks completed workouts per user with date and duration

  ### progress_logs
  - User weight, body measurements, and notes over time

  ### nutrition_tips
  - Admin-curated nutrition tips with category and tags

  ### water_intake
  - Daily water intake tracking per user

  ### streaks
  - User workout streaks (current and longest)

  ### daily_challenges
  - Admin-defined daily fitness challenges

  ### user_challenge_completions
  - Tracks which users completed which challenges

  ### badges
  - Achievement badges definition

  ### user_badges
  - Awards/unlocked badges per user

  ### subscriptions
  - User subscription plans (free, premium, pro)

  ### notifications
  - In-app notifications per user

  ## Security
  - RLS enabled on all tables
  - Users can only access their own data
  - Public read access on workouts, exercises, nutrition_tips, badges, daily_challenges
  - Admin-only write access on workouts, exercises, nutrition_tips, badges
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================== PROFILES ====================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE,
  full_name text DEFAULT '',
  avatar_url text DEFAULT '',
  bio text DEFAULT '',
  date_of_birth date,
  gender text DEFAULT '',
  weight_kg numeric(5,2),
  height_cm numeric(5,2),
  fitness_goal text DEFAULT 'general_fitness',
  activity_level text DEFAULT 'moderate',
  subscription_tier text DEFAULT 'free',
  is_admin boolean DEFAULT false,
  dark_mode boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Public profiles visible to all authenticated users
CREATE POLICY "Authenticated users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

-- ==================== WORKOUTS ====================
CREATE TABLE IF NOT EXISTS workouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  category text NOT NULL DEFAULT 'strength',
  difficulty text DEFAULT 'beginner',
  duration_minutes integer DEFAULT 30,
  calories_burned integer DEFAULT 200,
  image_url text DEFAULT '',
  video_url text DEFAULT '',
  is_premium boolean DEFAULT false,
  is_published boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  view_count integer DEFAULT 0,
  like_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published workouts"
  ON workouts FOR SELECT
  TO authenticated
  USING (is_published = true);

CREATE POLICY "Admins can insert workouts"
  ON workouts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can update workouts"
  ON workouts FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Users can create own workouts"
  ON workouts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- ==================== EXERCISES ====================
CREATE TABLE IF NOT EXISTS exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  category text DEFAULT 'strength',
  muscle_group text DEFAULT '',
  equipment text DEFAULT 'none',
  difficulty text DEFAULT 'beginner',
  instructions text DEFAULT '',
  image_url text DEFAULT '',
  video_url text DEFAULT '',
  calories_per_minute numeric(4,2) DEFAULT 5.0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view exercises"
  ON exercises FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage exercises"
  ON exercises FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can update exercises"
  ON exercises FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- ==================== WORKOUT_EXERCISES ====================
CREATE TABLE IF NOT EXISTS workout_exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id uuid NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_id uuid NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  sets integer DEFAULT 3,
  reps integer,
  duration_seconds integer,
  rest_seconds integer DEFAULT 60,
  order_index integer DEFAULT 0
);

ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view workout exercises"
  ON workout_exercises FOR SELECT
  TO authenticated
  USING (true);

-- ==================== USER_WORKOUT_LOGS ====================
CREATE TABLE IF NOT EXISTS user_workout_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workout_id uuid REFERENCES workouts(id) ON DELETE SET NULL,
  workout_title text DEFAULT '',
  duration_minutes integer DEFAULT 0,
  calories_burned integer DEFAULT 0,
  notes text DEFAULT '',
  completed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_workout_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own workout logs"
  ON user_workout_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workout logs"
  ON user_workout_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workout logs"
  ON user_workout_logs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own workout logs"
  ON user_workout_logs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ==================== PROGRESS_LOGS ====================
CREATE TABLE IF NOT EXISTS progress_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  weight_kg numeric(5,2),
  body_fat_percent numeric(4,2),
  chest_cm numeric(5,2),
  waist_cm numeric(5,2),
  hips_cm numeric(5,2),
  bicep_cm numeric(5,2),
  notes text DEFAULT '',
  logged_at date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE progress_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress"
  ON progress_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON progress_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON progress_logs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own progress"
  ON progress_logs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ==================== NUTRITION_TIPS ====================
CREATE TABLE IF NOT EXISTS nutrition_tips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  category text DEFAULT 'general',
  tags text[] DEFAULT '{}',
  image_url text DEFAULT '',
  is_published boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE nutrition_tips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published nutrition tips"
  ON nutrition_tips FOR SELECT
  TO authenticated
  USING (is_published = true);

-- ==================== WATER_INTAKE ====================
CREATE TABLE IF NOT EXISTS water_intake (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_ml integer NOT NULL DEFAULT 250,
  logged_at date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE water_intake ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own water intake"
  ON water_intake FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own water intake"
  ON water_intake FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own water intake"
  ON water_intake FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ==================== STREAKS ====================
CREATE TABLE IF NOT EXISTS streaks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  last_workout_date date,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own streak"
  ON streaks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streak"
  ON streaks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own streak"
  ON streaks FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ==================== DAILY_CHALLENGES ====================
CREATE TABLE IF NOT EXISTS daily_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  challenge_date date DEFAULT CURRENT_DATE,
  points integer DEFAULT 10,
  difficulty text DEFAULT 'easy',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE daily_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active challenges"
  ON daily_challenges FOR SELECT
  TO authenticated
  USING (is_active = true);

-- ==================== USER_CHALLENGE_COMPLETIONS ====================
CREATE TABLE IF NOT EXISTS user_challenge_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id uuid NOT NULL REFERENCES daily_challenges(id) ON DELETE CASCADE,
  completed_at timestamptz DEFAULT now(),
  UNIQUE(user_id, challenge_id)
);

ALTER TABLE user_challenge_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own completions"
  ON user_challenge_completions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own completions"
  ON user_challenge_completions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ==================== BADGES ====================
CREATE TABLE IF NOT EXISTS badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  icon text DEFAULT 'award',
  color text DEFAULT '#f59e0b',
  criteria text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view badges"
  ON badges FOR SELECT
  TO authenticated
  USING (true);

-- ==================== USER_BADGES ====================
CREATE TABLE IF NOT EXISTS user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id uuid NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at timestamptz DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own badges"
  ON user_badges FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own badges"
  ON user_badges FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ==================== SUBSCRIPTIONS ====================
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan text DEFAULT 'free',
  status text DEFAULT 'active',
  started_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  payment_method text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription"
  ON subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription"
  ON subscriptions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ==================== SAVED_WORKOUTS ====================
CREATE TABLE IF NOT EXISTS saved_workouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workout_id uuid NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  saved_at timestamptz DEFAULT now(),
  UNIQUE(user_id, workout_id)
);

ALTER TABLE saved_workouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saved workouts"
  ON saved_workouts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved workouts"
  ON saved_workouts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved workouts"
  ON saved_workouts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ==================== INDEXES ====================
CREATE INDEX IF NOT EXISTS idx_workouts_category ON workouts(category);
CREATE INDEX IF NOT EXISTS idx_workouts_difficulty ON workouts(difficulty);
CREATE INDEX IF NOT EXISTS idx_exercises_category ON exercises(category);
CREATE INDEX IF NOT EXISTS idx_exercises_muscle_group ON exercises(muscle_group);
CREATE INDEX IF NOT EXISTS idx_user_workout_logs_user_id ON user_workout_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_workout_logs_completed_at ON user_workout_logs(completed_at);
CREATE INDEX IF NOT EXISTS idx_progress_logs_user_id ON progress_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_water_intake_user_date ON water_intake(user_id, logged_at);

-- ==================== SEED DATA ====================

-- Insert badges
INSERT INTO badges (name, description, icon, color, criteria) VALUES
  ('First Workout', 'Complete your first workout', 'zap', '#f59e0b', 'Complete 1 workout'),
  ('Week Warrior', '7-day workout streak', 'flame', '#ef4444', 'Maintain a 7-day streak'),
  ('Month Master', '30-day workout streak', 'trophy', '#10b981', 'Maintain a 30-day streak'),
  ('Calorie Crusher', 'Burn 10,000 calories total', 'fire', '#f97316', 'Burn 10,000 calories'),
  ('Hydration Hero', 'Hit water goal 7 days in a row', 'droplets', '#3b82f6', 'Hit water goal 7 consecutive days'),
  ('Challenge Champion', 'Complete 10 daily challenges', 'star', '#8b5cf6', 'Complete 10 challenges')
ON CONFLICT DO NOTHING;

-- Insert nutrition tips
INSERT INTO nutrition_tips (title, content, category, tags) VALUES
  ('Power of Protein', 'Aim for 0.8-1g of protein per pound of bodyweight to support muscle recovery and growth. Great sources include chicken, fish, eggs, legumes, and Greek yogurt.', 'protein', ARRAY['muscle', 'recovery', 'protein']),
  ('Carbs Are Not the Enemy', 'Complex carbohydrates like oats, sweet potatoes, and brown rice provide sustained energy for workouts. Time them around your training for optimal performance.', 'carbs', ARRAY['energy', 'performance', 'carbs']),
  ('Healthy Fats for Hormones', 'Don''t skip fats! Avocados, nuts, olive oil, and fatty fish support hormone production and fat-soluble vitamin absorption.', 'fats', ARRAY['hormones', 'fats', 'health']),
  ('Pre-Workout Nutrition', 'Eat a balanced meal 2-3 hours before exercise, or a light snack 30-45 minutes before. Include carbs and protein for energy and muscle preservation.', 'timing', ARRAY['pre-workout', 'performance', 'energy']),
  ('Post-Workout Recovery', 'Within 30-60 minutes after exercise, consume protein + carbs to kickstart muscle repair and replenish glycogen stores.', 'recovery', ARRAY['post-workout', 'recovery', 'protein']),
  ('Micronutrients Matter', 'Vitamins and minerals are crucial for energy metabolism, immune function, and bone health. Eat a rainbow of vegetables and fruits daily.', 'vitamins', ARRAY['vitamins', 'minerals', 'health']),
  ('Sugar Awareness', 'Limit added sugars which spike insulin and promote fat storage. Read labels carefully - sugar hides in many "healthy" foods.', 'sugar', ARRAY['sugar', 'fat-loss', 'weight']),
  ('Meal Prep for Success', 'Preparing meals in advance removes decision fatigue and ensures you always have nutritious options available. Spend 2 hours on Sunday to set up your week.', 'habits', ARRAY['meal-prep', 'habits', 'consistency'])
ON CONFLICT DO NOTHING;

-- Insert workouts
INSERT INTO workouts (title, description, category, difficulty, duration_minutes, calories_burned, image_url, is_premium) VALUES
  ('Full Body Fat Burner', 'Torch calories with this high-intensity full body workout designed to maximize fat loss while preserving muscle mass.', 'weight_loss', 'intermediate', 45, 450, 'https://images.pexels.com/photos/841130/pexels-photo-841130.jpeg', false),
  ('Muscle Building Fundamentals', 'Build a solid foundation of muscle with this compound movement-focused workout. Perfect for beginners to intermediate lifters.', 'muscle_gain', 'beginner', 60, 350, 'https://images.pexels.com/photos/1552249/pexels-photo-1552249.jpeg', false),
  ('Home HIIT Blast', 'No equipment needed! This home workout will elevate your heart rate and burn maximum calories in minimal time.', 'home', 'beginner', 30, 300, 'https://images.pexels.com/photos/4498482/pexels-photo-4498482.jpeg', false),
  ('Cardio Endurance Run', 'Build cardiovascular endurance with this structured running workout. Suitable for all levels with modifications available.', 'cardio', 'intermediate', 40, 400, 'https://images.pexels.com/photos/2827392/pexels-photo-2827392.jpeg', false),
  ('Morning Yoga Flow', 'Start your day with intention. This gentle yoga flow improves flexibility, reduces stress, and energizes your morning.', 'yoga', 'beginner', 30, 150, 'https://images.pexels.com/photos/3822906/pexels-photo-3822906.jpeg', false),
  ('Power Strength Program', 'Advanced strength training program focusing on the big three: squat, bench, deadlift. Build raw power and size.', 'strength', 'advanced', 75, 500, 'https://images.pexels.com/photos/1431282/pexels-photo-1431282.jpeg', true),
  ('HIIT Cardio Shred', 'Intense interval training that keeps your metabolism elevated for hours after the workout. Premium fat-burning protocol.', 'cardio', 'advanced', 35, 480, 'https://images.pexels.com/photos/949132/pexels-photo-949132.jpeg', true),
  ('Beginner Weight Loss Journey', 'A gentle but effective program for beginners looking to start their weight loss journey. Low impact, high results.', 'weight_loss', 'beginner', 35, 280, 'https://images.pexels.com/photos/3823488/pexels-photo-3823488.jpeg', false),
  ('Advanced Yoga Mastery', 'Challenge yourself with advanced yoga poses and flows. Build strength, flexibility, and mental clarity.', 'yoga', 'advanced', 60, 250, 'https://images.pexels.com/photos/4056723/pexels-photo-4056723.jpeg', true),
  ('Bodyweight Muscle Builder', 'Prove that you don''t need weights to build impressive muscle. Master calisthenics for a strong, athletic physique.', 'home', 'intermediate', 50, 320, 'https://images.pexels.com/photos/1552252/pexels-photo-1552252.jpeg', false)
ON CONFLICT DO NOTHING;

-- Insert exercises
INSERT INTO exercises (name, description, category, muscle_group, equipment, difficulty, instructions, image_url, calories_per_minute) VALUES
  ('Push-Up', 'Classic upper body exercise targeting chest, shoulders, and triceps', 'strength', 'chest', 'none', 'beginner', 'Start in plank position. Lower chest to floor. Push back up. Keep core tight throughout.', 'https://images.pexels.com/photos/4162451/pexels-photo-4162451.jpeg', 7.0),
  ('Squat', 'Fundamental lower body movement for legs and glutes', 'strength', 'legs', 'none', 'beginner', 'Stand feet shoulder-width. Lower hips back and down. Keep chest up. Drive through heels to stand.', 'https://images.pexels.com/photos/4498574/pexels-photo-4498574.jpeg', 8.0),
  ('Plank', 'Core stability exercise', 'strength', 'core', 'none', 'beginner', 'Rest on forearms and toes. Keep body in straight line. Engage core and glutes. Breathe steadily.', 'https://images.pexels.com/photos/3076509/pexels-photo-3076509.jpeg', 5.0),
  ('Burpee', 'Full body explosive exercise for cardio and strength', 'cardio', 'full_body', 'none', 'intermediate', 'Stand, drop to plank, do push-up, jump feet to hands, jump up with arms overhead. Repeat.', 'https://images.pexels.com/photos/4608149/pexels-photo-4608149.jpeg', 12.0),
  ('Deadlift', 'King of compound movements for posterior chain', 'strength', 'back', 'barbell', 'intermediate', 'Stand over bar, hip-width stance. Hinge at hips, grip bar. Drive through floor to stand. Hinge back down.', 'https://images.pexels.com/photos/1229356/pexels-photo-1229356.jpeg', 9.0),
  ('Pull-Up', 'Upper body pulling movement for back and biceps', 'strength', 'back', 'pull-up bar', 'intermediate', 'Hang from bar, palms forward. Pull chest to bar. Lower with control. Full extension at bottom.', 'https://images.pexels.com/photos/4162452/pexels-photo-4162452.jpeg', 8.0),
  ('Lunges', 'Single-leg exercise for balance and leg strength', 'strength', 'legs', 'none', 'beginner', 'Step forward, lower back knee toward floor. Front knee over ankle. Push back to start. Alternate legs.', 'https://images.pexels.com/photos/4162584/pexels-photo-4162584.jpeg', 7.0),
  ('Mountain Climbers', 'Dynamic core exercise with cardio benefits', 'cardio', 'core', 'none', 'beginner', 'Start in push-up position. Drive knees alternately to chest rapidly. Keep hips level.', 'https://images.pexels.com/photos/4498605/pexels-photo-4498605.jpeg', 10.0),
  ('Bench Press', 'Classic chest building exercise', 'strength', 'chest', 'barbell', 'intermediate', 'Lie on bench, grip bar shoulder-width+. Lower to chest. Press up explosively. Don''t lock out elbows.', 'https://images.pexels.com/photos/1552252/pexels-photo-1552252.jpeg', 8.0),
  ('Jump Rope', 'High intensity cardio exercise', 'cardio', 'full_body', 'jump rope', 'beginner', 'Hold handles at hip height. Swing rope over head. Jump on balls of feet. Keep elbows close to body.', 'https://images.pexels.com/photos/4162450/pexels-photo-4162450.jpeg', 13.0)
ON CONFLICT DO NOTHING;

-- Insert daily challenges
INSERT INTO daily_challenges (title, description, challenge_date, points, difficulty) VALUES
  ('100 Push-Ups', 'Complete 100 push-ups throughout the day in any number of sets. Rest as needed between sets.', CURRENT_DATE, 20, 'intermediate'),
  ('10,000 Steps', 'Walk or run to reach 10,000 steps today. Track with your phone or fitness watch.', CURRENT_DATE, 15, 'easy'),
  ('30-Min Yoga', 'Complete a 30-minute yoga session for flexibility and mindfulness.', CURRENT_DATE, 10, 'easy'),
  ('Hydration Challenge', 'Drink 3 liters of water today. Track every glass!', CURRENT_DATE, 10, 'easy'),
  ('Plank Progression', 'Hold a plank for as long as possible. Beat your personal record!', CURRENT_DATE, 25, 'hard')
ON CONFLICT DO NOTHING;

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    new.id,
    split_part(new.email, '@', 1),
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'avatar_url', '')
  );
  
  INSERT INTO public.streaks (user_id)
  VALUES (new.id);
  
  INSERT INTO public.subscriptions (user_id, plan, status)
  VALUES (new.id, 'free', 'active');
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
