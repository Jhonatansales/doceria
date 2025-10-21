/*
  # Criar tabela de receitas

  1. Nova Tabela
    - `receitas`
      - `id` (uuid, primary key)
      - `nome` (text, nome da receita)
      - `modo_preparo` (text, instruções de preparo)
      - `rendimento` (text, ex: "10 fatias", "20 brigadeiros")
      - `custo_total` (numeric, custo total calculado)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Segurança
    - Habilitar RLS na tabela `receitas`
    - Adicionar política para usuários autenticados lerem seus próprios dados
*/

CREATE TABLE IF NOT EXISTS receitas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  modo_preparo text,
  rendimento text NOT NULL,
  custo_total numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE receitas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own receitas"
  ON receitas
  FOR ALL
  TO authenticated
  USING (auth.uid()::text = auth.uid()::text);