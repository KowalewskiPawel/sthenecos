/*
  # Initial FitAI Platform Schema

  1. New Tables
    - `users` - User profiles and subscription info
    - `workout_programs` - Available workout programs
    - `workouts` - Individual workouts within programs
    - `exercises` - Exercise database
    - `user_progress` - Track user workout completions
    - `form_analyses` - AI form analysis results
    - `subscriptions` - Subscription management

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  subscription_tier text DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium', 'pro')),
  subscription_status text DEFAULT 'active' CHECK (subscription_status IN ('active', 'canceled', 'expired')),
  fitness_level text DEFAULT 'beginner' CHECK (fitness_level IN ('beginner', 'intermediate', 'advanced')),
  fitness_goals text[] DEFAULT '{}',
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Workout programs
CREATE TABLE IF NOT EXISTS workout_programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  trainer_id uuid REFERENCES users(id),
  category text NOT NULL,
  difficulty_level text NOT NULL CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  duration_weeks integer NOT NULL DEFAULT 4,
  workouts_per_week integer NOT NULL DEFAULT 3,
  equipment_needed text[] DEFAULT '{}',
  price decimal(10,2) DEFAULT 0,
  is_active boolean DEFAULT true,
  thumbnail_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Individual workouts
CREATE TABLE IF NOT EXISTS workouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid NOT NULL REFERENCES workout_programs(id) ON DELETE CASCADE,
  week_number integer NOT NULL,
  day_number integer NOT NULL,
  title text NOT NULL,
  description text,
  estimated_duration integer DEFAULT 30, -- minutes
  created_at timestamptz DEFAULT now(),
  UNIQUE(program_id, week_number, day_number)
);

-- Exercise database
CREATE TABLE IF NOT EXISTS exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  muscle_groups text[] NOT NULL,
  equipment text,
  difficulty_level text CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  form_tips text[],
  video_url text,
  image_url text,
  created_at timestamptz DEFAULT now()
);

-- Workout exercises (junction table)
CREATE TABLE IF NOT EXISTS workout_exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id uuid NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_id uuid NOT NULL REFERENCES exercises(id),
  sets integer NOT NULL DEFAULT 3,
  reps text, -- "10-12" or "30 seconds"
  rest_time integer DEFAULT 60, -- seconds
  order_index integer NOT NULL,
  notes text,
  UNIQUE(workout_id, order_index)
);

-- User progress tracking
CREATE TABLE IF NOT EXISTS user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  workout_id uuid NOT NULL REFERENCES workouts(id),
  program_id uuid NOT NULL REFERENCES workout_programs(id),
  completed_at timestamptz DEFAULT now(),
  exercises_completed integer DEFAULT 0,
  total_exercises integer NOT NULL,
  duration_minutes integer,
  calories_burned integer,
  notes text,
  form_score integer CHECK (form_score >= 0 AND form_score <= 100)
);

-- Form analysis results
CREATE TABLE IF NOT EXISTS form_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  exercise_id uuid REFERENCES exercises(id),
  video_url text,
  analysis_result jsonb NOT NULL DEFAULT '{}',
  overall_score integer CHECK (overall_score >= 0 AND overall_score <= 100),
  created_at timestamptz DEFAULT now()
);

-- Subscription tracking
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_subscription_id text UNIQUE,
  stripe_customer_id text,
  status text NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid')),
  price_id text NOT NULL,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can read and update their own profile
CREATE POLICY "Users can read own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Workout programs are readable by all authenticated users
CREATE POLICY "Workout programs are readable by authenticated users" ON workout_programs
  FOR SELECT TO authenticated USING (true);

-- Workouts are readable by all authenticated users
CREATE POLICY "Workouts are readable by authenticated users" ON workouts
  FOR SELECT TO authenticated USING (true);

-- Exercises are readable by all authenticated users
CREATE POLICY "Exercises are readable by authenticated users" ON exercises
  FOR SELECT TO authenticated USING (true);

-- Workout exercises are readable by all authenticated users
CREATE POLICY "Workout exercises are readable by authenticated users" ON workout_exercises
  FOR SELECT TO authenticated USING (true);

-- Users can manage their own progress
CREATE POLICY "Users can manage own progress" ON user_progress
  FOR ALL USING (auth.uid() = user_id);

-- Users can manage their own form analyses
CREATE POLICY "Users can manage own form analyses" ON form_analyses
  FOR ALL USING (auth.uid() = user_id);

-- Users can read their own subscriptions
CREATE POLICY "Users can read own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Insert some sample data
INSERT INTO exercises (name, description, muscle_groups, equipment, difficulty_level, form_tips) VALUES
('Push-up', 'Classic bodyweight upper body exercise', ARRAY['chest', 'shoulders', 'triceps'], 'none', 'beginner', ARRAY['Keep body straight', 'Lower chest to floor', 'Push up explosively']),
('Squat', 'Fundamental lower body movement', ARRAY['quadriceps', 'glutes', 'hamstrings'], 'none', 'beginner', ARRAY['Feet shoulder-width apart', 'Keep chest up', 'Lower until thighs parallel']),
('Plank', 'Core stability exercise', ARRAY['core', 'shoulders'], 'none', 'beginner', ARRAY['Keep body straight', 'Engage core', 'Don''t let hips sag']),
('Deadlift', 'Compound pulling movement', ARRAY['hamstrings', 'glutes', 'back'], 'barbell', 'intermediate', ARRAY['Keep bar close to body', 'Neutral spine', 'Drive through heels']);

INSERT INTO workout_programs (title, description, category, difficulty_level, duration_weeks, workouts_per_week, equipment_needed, price) VALUES
('Beginner Bodyweight', 'Perfect for fitness beginners using only bodyweight', 'strength', 'beginner', 4, 3, ARRAY['none'], 0),
('Strength Foundations', 'Build a solid strength base with basic equipment', 'strength', 'intermediate', 8, 4, ARRAY['dumbbells', 'bench'], 29.99),
('HIIT Cardio Blast', 'High-intensity cardio workouts for fat loss', 'cardio', 'intermediate', 6, 4, ARRAY['none'], 19.99);