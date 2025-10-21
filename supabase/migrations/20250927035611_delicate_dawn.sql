/*
  # Criar tabela de produção de receitas

  1. Nova Tabela
    - `producao_receitas`
      - `id` (uuid, primary key)
      - `receita_id` (uuid, foreign key para receitas)
      - `quantidade_produzida` (numeric, quantidade de lotes produzidos)
      - `data_producao` (date, data da produção)
      - `created_at` (timestamp)

  2. Segurança
    - Habilitar RLS na tabela `producao_receitas`
    - Adicionar política para permitir todas as operações

  3. Relacionamentos
    - Foreign key para receitas com CASCADE DELETE
*/

CREATE TABLE IF NOT EXISTS producao_receitas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  receita_id uuid NOT NULL REFERENCES receitas(id) ON DELETE CASCADE,
  quantidade_produzida numeric NOT NULL DEFAULT 1,
  data_producao date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE producao_receitas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on producao_receitas"
  ON producao_receitas
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);