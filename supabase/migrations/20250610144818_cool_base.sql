/*
  # Add User Roles and AI Workout Generation

  1. Schema Updates
    - Add user_role column to users table
    - Create ai_generated_workouts table
    - Add trainer-specific fields

  2. Security
    - Update RLS policies for role-based access
    - Add policies for AI workout generation
*/

-- Add user role to users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'user_role'
  ) THEN
    ALTER TABLE users ADD COLUMN user_role text DEFAULT 'athlete' CHECK (user_role IN ('athlete', 'trainer'));
  END IF;
END $$;

-- Add trainer-specific fields
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'bio'
  ) THEN
    ALTER TABLE users ADD COLUMN bio text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'experience_years'
  ) THEN
    ALTER TABLE users ADD COLUMN experience_years integer;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'certifications'
  ) THEN
    ALTER TABLE users ADD COLUMN certifications text[];
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'hourly_rate'
  ) THEN
    ALTER TABLE users ADD COLUMN hourly_rate decimal(10,2);
  END IF;
END $$;

-- Create AI generated workouts table
CREATE TABLE IF NOT EXISTS ai_generated_workouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  trainer_id uuid REFERENCES users(id),
  title text NOT NULL,
  description text,
  goals text[] NOT NULL,
  fitness_level text NOT NULL CHECK (fitness_level IN ('beginner', 'intermediate', 'advanced')),
  duration_minutes integer NOT NULL,
  equipment_needed text[] DEFAULT '{}',
  workout_structure jsonb NOT NULL,
  generated_prompt text,
  is_custom boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create trainer-client relationships table
CREATE TABLE IF NOT EXISTS trainer_clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(trainer_id, client_id)
);

-- Enable RLS
ALTER TABLE ai_generated_workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainer_clients ENABLE ROW LEVEL SECURITY;

-- RLS Policies for AI generated workouts
CREATE POLICY "Users can manage own AI workouts" ON ai_generated_workouts
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Trainers can manage client AI workouts" ON ai_generated_workouts
  FOR ALL USING (
    auth.uid() = trainer_id OR 
    (auth.uid() IN (SELECT trainer_id FROM trainer_clients WHERE client_id = ai_generated_workouts.user_id))
  );

-- RLS Policies for trainer-client relationships
CREATE POLICY "Trainers can manage their clients" ON trainer_clients
  FOR ALL USING (auth.uid() = trainer_id);

CREATE POLICY "Clients can view their trainer relationships" ON trainer_clients
  FOR SELECT USING (auth.uid() = client_id);

-- Update existing policies to account for roles
DROP POLICY IF EXISTS "Workout programs are readable by authenticated users" ON workout_programs;
CREATE POLICY "Workout programs are readable by authenticated users" ON workout_programs
  FOR SELECT TO authenticated USING (true);

-- Allow trainers to create and manage workout programs
CREATE POLICY "Trainers can manage workout programs" ON workout_programs
  FOR ALL TO authenticated USING (
    auth.uid() = trainer_id OR 
    auth.uid() IN (SELECT id FROM users WHERE user_role = 'trainer')
  );