/*
  # Create venda_itens table

  1. New Tables
    - `venda_itens`
      - `id` (uuid, primary key)
      - `venda_id` (uuid, foreign key to vendas)
      - `produto_id` (uuid, foreign key to produtos)
      - `quantidade` (numeric, required)
      - `preco_unitario` (numeric, required)
      - `subtotal` (numeric, required)
      - `created_at` (timestamp)

  2. Security
    - Disable RLS for public access (consistent with vendas table)

  3. Foreign Keys
    - Link venda_id to vendas table with CASCADE DELETE
    - Link produto_id to produtos table with SET NULL
*/

CREATE TABLE IF NOT EXISTS venda_itens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venda_id uuid NOT NULL REFERENCES vendas(id) ON DELETE CASCADE,
  produto_id uuid REFERENCES produtos(id) ON DELETE SET NULL,
  quantidade numeric NOT NULL,
  preco_unitario numeric NOT NULL,
  subtotal numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE venda_itens DISABLE ROW LEVEL SECURITY;