/*
  # Create clientes table

  1. New Tables
    - `clientes`
      - `id` (uuid, primary key)
      - `nome` (text, required)
      - `whatsapp` (text, required, unique)
      - `endereco_completo` (text, optional)
      - `tipo_pessoa` (text, required - 'Física' or 'Jurídica')
      - `data_ultima_compra` (date, optional)
      - `total_compras` (numeric, default 0)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `clientes` table
    - Add policy for authenticated users to manage their own data
*/

CREATE TABLE IF NOT EXISTS clientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  whatsapp text NOT NULL UNIQUE,
  endereco_completo text,
  tipo_pessoa text NOT NULL CHECK (tipo_pessoa IN ('Física', 'Jurídica')),
  data_ultima_compra date,
  total_compras numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own clientes"
  ON clientes
  FOR ALL
  TO authenticated
  USING (auth.uid()::text = auth.uid()::text)
  WITH CHECK (auth.uid()::text = auth.uid()::text);