/*
  # Fix RLS policies for insumos table

  1. Security Updates
    - Drop existing restrictive policy
    - Add new policy that allows anonymous access for development
    - Enable proper CRUD operations for both authenticated and anonymous users

  Note: In production, you should implement proper authentication and restrict access to authenticated users only.
*/

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can manage own insumos" ON insumos;

-- Create a more permissive policy for development that allows anonymous access
CREATE POLICY "Allow all operations on insumos"
  ON insumos
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Ensure RLS is still enabled
ALTER TABLE insumos ENABLE ROW LEVEL SECURITY;