/*
  # Criar tabela de revendedores

  1. Nova Tabela
    - `revendedores`
      - `id` (uuid, primary key)
      - `nome` (text, nome do revendedor)
      - `contato` (text, WhatsApp/telefone)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Segurança
    - Habilitar RLS na tabela `revendedores`
    - Adicionar política para permitir todas as operações
*/

CREATE TABLE IF NOT EXISTS revendedores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  contato text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE revendedores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on revendedores"
  ON revendedores
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);