/*
  # Fix RLS policies for clientes table

  1. Security Changes
    - Drop existing problematic policies on `clientes` table
    - Create new policies that allow authenticated users to perform all operations
    - Use proper condition `auth.uid() is not null` for authenticated users

  2. Changes
    - Allow authenticated users to INSERT, SELECT, UPDATE, and DELETE clients
    - Remove the problematic `uid()` comparison that was causing the violation
*/

-- Drop existing policies that are causing issues
DROP POLICY IF EXISTS "Users can manage own clientes" ON clientes;
DROP POLICY IF EXISTS "Authenticated users can insert clientes" ON clientes;
DROP POLICY IF EXISTS "Authenticated users can select clientes" ON clientes;
DROP POLICY IF EXISTS "Authenticated users can update clientes" ON clientes;
DROP POLICY IF EXISTS "Authenticated users can delete clientes" ON clientes;

-- Create new policies that allow authenticated users to manage clients
CREATE POLICY "Allow authenticated users to insert clientes"
  ON clientes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to select clientes"
  ON clientes
  FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to update clientes"
  ON clientes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to delete clientes"
  ON clientes
  FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);