import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  bio: string;
  date_of_birth: string | null;
  gender: string;
  weight_kg: number | null;
  height_cm: number | null;
  fitness_goal: string;
  activity_level: string;
  subscription_tier: string;
  is_admin: boolean;
  dark_mode: boolean;
  created_at: string;
  updated_at: string;
};

export type Workout = {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  duration_minutes: number;
  calories_burned: number;
  image_url: string;
  video_url: string;
  is_premium: boolean;
  is_published: boolean;
  created_by: string | null;
  view_count: number;
  like_count: number;
  created_at: string;
};

export type Exercise = {
  id: string;
  name: string;
  description: string;
  category: string;
  muscle_group: string;
  equipment: string;
  difficulty: string;
  instructions: string;
  image_url: string;
  video_url: string;
  calories_per_minute: number;
  created_at: string;
};

export type WorkoutLog = {
  id: string;
  user_id: string;
  workout_id: string | null;
  workout_title: string;
  duration_minutes: number;
  calories_burned: number;
  notes: string;
  completed_at: string;
};

export type ProgressLog = {
  id: string;
  user_id: string;
  weight_kg: number | null;
  body_fat_percent: number | null;
  chest_cm: number | null;
  waist_cm: number | null;
  hips_cm: number | null;
  bicep_cm: number | null;
  notes: string;
  logged_at: string;
};

export type NutritionTip = {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  image_url: string;
  is_published: boolean;
  created_at: string;
};

export type WaterIntake = {
  id: string;
  user_id: string;
  amount_ml: number;
  logged_at: string;
};

export type Streak = {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_workout_date: string | null;
};

export type DailyChallenge = {
  id: string;
  title: string;
  description: string;
  challenge_date: string;
  points: number;
  difficulty: string;
  is_active: boolean;
};

export type Badge = {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  criteria: string;
};

export type UserBadge = {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
  badges?: Badge;
};

export type Subscription = {
  id: string;
  user_id: string;
  plan: string;
  status: string;
  started_at: string;
  expires_at: string | null;
};

export type Note = {
  id: string;
  user_id: string;
  workout_id: string | null;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
};

export type NoteAttachment = {
  id: string;
  note_id: string;
  user_id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  storage_path: string;
  created_at: string;
};
