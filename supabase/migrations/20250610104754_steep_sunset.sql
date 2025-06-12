/*
  # Add INSERT policy for users table

  1. Security Changes
    - Add INSERT policy for `users` table
    - Allow authenticated users to insert their own profile data
    - Policy ensures users can only create profiles with their own auth.uid()

  This migration fixes the "new row violates row-level security policy" error
  that occurs during user sign-up when trying to create a user profile.
*/

CREATE POLICY "Users can insert own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);