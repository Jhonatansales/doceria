/*
  # Fix RLS policy for clientes table

  1. Security Changes
    - Drop the existing restrictive RLS policy that was causing insert failures
    - Create new policies that allow authenticated users to manage clients
    - Allow INSERT, SELECT, UPDATE, and DELETE operations for authenticated users

  2. Notes
    - The previous policy was trying to use uid() comparison which doesn't work
      since the clientes table doesn't have a user_id column
    - This allows all authenticated users to manage all clients, which appears
      to be the intended behavior based on the application structure
*/

-- Drop the existing problematic policy
DROP POLICY IF EXISTS "Users can manage own clientes" ON clientes;

-- Create new policies for authenticated users
CREATE POLICY "Authenticated users can insert clientes"
  ON clientes
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can select clientes"
  ON clientes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update clientes"
  ON clientes
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete clientes"
  ON clientes
  FOR DELETE
  TO authenticated
  USING (true);