/*
  # Create receita_ingredientes table

  1. New Tables
    - `receita_ingredientes`
      - `id` (uuid, primary key)
      - `receita_id` (uuid, foreign key to receitas)
      - `insumo_id` (uuid, foreign key to insumos)
      - `quantidade_usada` (numeric, required)
      - `custo_ingrediente` (numeric, default 0)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `receita_ingredientes` table
    - Add policy for authenticated users to manage their own data

  3. Foreign Keys
    - Link receita_id to receitas table
    - Link insumo_id to insumos table
*/

CREATE TABLE IF NOT EXISTS receita_ingredientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  receita_id uuid NOT NULL,
  insumo_id uuid NOT NULL,
  quantidade_usada numeric NOT NULL,
  custo_ingrediente numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Add foreign key constraints
ALTER TABLE receita_ingredientes 
ADD CONSTRAINT receita_ingredientes_receita_id_fkey 
FOREIGN KEY (receita_id) REFERENCES receitas(id) ON DELETE CASCADE;

ALTER TABLE receita_ingredientes 
ADD CONSTRAINT receita_ingredientes_insumo_id_fkey 
FOREIGN KEY (insumo_id) REFERENCES insumos(id) ON DELETE CASCADE;

ALTER TABLE receita_ingredientes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own receita_ingredientes"
  ON receita_ingredientes
  FOR ALL
  TO authenticated
  USING (auth.uid()::text = auth.uid()::text);