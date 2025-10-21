/*
  # Fix RLS policies for clientes table

  1. Security Changes
    - Temporarily disable RLS to clear all existing policies
    - Re-enable RLS with proper policies for authenticated users
    - Allow INSERT, SELECT, UPDATE, DELETE operations for authenticated users

  This resolves the "new row violates row-level security policy" error
  when creating clients during the sales process.
*/

-- Temporarily disable RLS to clear all policies
ALTER TABLE clientes DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can manage own clientes" ON clientes;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON clientes;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON clientes;
DROP POLICY IF EXISTS "Enable select for authenticated users" ON clientes;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON clientes;
DROP POLICY IF EXISTS "Allow authenticated users to insert clients" ON clientes;
DROP POLICY IF EXISTS "Allow authenticated users to select clients" ON clientes;
DROP POLICY IF EXISTS "Allow authenticated users to update clients" ON clientes;
DROP POLICY IF EXISTS "Allow authenticated users to delete clients" ON clientes;

-- Re-enable RLS
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;

-- Create new policies following the expert's recommendations
CREATE POLICY "Allow authenticated users to insert clients" 
  ON "public"."clientes" 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to select clients" 
  ON "public"."clientes" 
  FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Allow authenticated users to update clients" 
  ON "public"."clientes" 
  FOR UPDATE 
  TO authenticated 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete clients" 
  ON "public"."clientes" 
  FOR DELETE 
  TO authenticated 
  USING (true);