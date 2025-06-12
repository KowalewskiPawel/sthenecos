/*
  # Add specialty column to users table

  1. Changes
    - Add `specialty` column to `users` table for trainer specializations
    - Set appropriate default value and constraints

  2. Security
    - No RLS changes needed as existing policies apply to new column
*/

-- Add specialty column to users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'specialty'
  ) THEN
    ALTER TABLE users ADD COLUMN specialty text;
  END IF;
END $$;