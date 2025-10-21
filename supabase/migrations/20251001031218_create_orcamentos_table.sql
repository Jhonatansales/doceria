/*
  # Create orcamentos and orcamento_itens tables

  1. New Tables
    - `orcamentos`
      - `id` (uuid, primary key)
      - `numero_orcamento` (text, unique, required)
      - `cliente_id` (uuid, optional reference to clientes)
      - `cliente_nome` (text, required)
      - `cliente_whatsapp` (text, optional)
      - `cliente_endereco` (text, optional)
      - `data_criacao` (date, required)
      - `data_validade` (date, required)
      - `subtotal` (numeric, default 0)
      - `total` (numeric, required)
      - `observacoes` (text, optional)
      - `status` (text, check constraint)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      
    - `orcamento_itens`
      - `id` (uuid, primary key)
      - `orcamento_id` (uuid, foreign key to orcamentos)
      - `produto_id` (uuid, foreign key to produtos)
      - `quantidade` (numeric, required)
      - `preco_unitario` (numeric, required)
      - `subtotal` (numeric, required)
      - `created_at` (timestamp)

  2. Security
    - Disable RLS for public access
*/

CREATE TABLE IF NOT EXISTS orcamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_orcamento text UNIQUE NOT NULL,
  cliente_id uuid REFERENCES clientes(id) ON DELETE SET NULL,
  cliente_nome text NOT NULL,
  cliente_whatsapp text,
  cliente_endereco text,
  data_criacao date NOT NULL DEFAULT CURRENT_DATE,
  data_validade date NOT NULL,
  subtotal numeric DEFAULT 0,
  total numeric NOT NULL,
  observacoes text,
  status text DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'rejeitado')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orcamento_itens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  orcamento_id uuid NOT NULL REFERENCES orcamentos(id) ON DELETE CASCADE,
  produto_id uuid REFERENCES produtos(id) ON DELETE SET NULL,
  quantidade numeric NOT NULL,
  preco_unitario numeric NOT NULL,
  subtotal numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE orcamentos DISABLE ROW LEVEL SECURITY;
ALTER TABLE orcamento_itens DISABLE ROW LEVEL SECURITY;