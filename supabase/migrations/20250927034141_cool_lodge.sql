/*
  # Create insumos table

  1. New Tables
    - `insumos`
      - `id` (uuid, primary key)
      - `nome` (text, required)
      - `unidade_medida_compra` (text, required)
      - `custo_total_compra` (numeric, default 0)
      - `quantidade_comprada` (numeric, default 0)
      - `custo_por_unidade` (numeric, default 0)
      - `estoque_atual` (numeric, default 0)
      - `estoque_minimo` (numeric, default 0)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `insumos` table
    - Add policy for authenticated users to manage their own data
*/

CREATE TABLE IF NOT EXISTS insumos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  unidade_medida_compra text NOT NULL,
  custo_total_compra numeric DEFAULT 0,
  quantidade_comprada numeric DEFAULT 0,
  custo_por_unidade numeric DEFAULT 0,
  estoque_atual numeric DEFAULT 0,
  estoque_minimo numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE insumos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own insumos"
  ON insumos
  FOR ALL
  TO authenticated
  USING (auth.uid()::text = auth.uid()::text);