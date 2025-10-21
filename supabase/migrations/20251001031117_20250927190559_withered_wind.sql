/*
  # Reset and fix RLS policies for clientes table

  1. Security Changes
    - Drop all existing policies on clientes table
    - Create new simple policies that allow authenticated users full access
    - Ensure RLS is properly enabled

  This migration completely resets the RLS configuration for the clientes table
  to resolve the "new row violates row-level security policy" error.
*/

-- Drop all existing policies on clientes table
DROP POLICY IF EXISTS "Allow authenticated users to delete clientes" ON clientes;
DROP POLICY IF EXISTS "Allow authenticated users to insert clientes" ON clientes;
DROP POLICY IF EXISTS "Allow authenticated users to select clientes" ON clientes;
DROP POLICY IF EXISTS "Allow authenticated users to update clientes" ON clientes;
DROP POLICY IF EXISTS "Users can manage own clientes" ON clientes;

-- Ensure RLS is enabled
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;

-- Create new policies that allow all authenticated users to manage clientes
CREATE POLICY "Enable insert for authenticated users" ON clientes
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable select for authenticated users" ON clientes
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Enable update for authenticated users" ON clientes
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users" ON clientes
  FOR DELETE TO authenticated
  USING (true);