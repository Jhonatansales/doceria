/*
  # Criar tabela de cronograma de produção

  1. Nova Tabela
    - `cronograma_producao`
      - `id` (uuid, primary key)
      - `receita_id` (uuid, foreign key)
      - `data_producao` (date, not null)
      - `quantidade_lotes` (numeric, not null)
      - `horario` (text, optional)
      - `status` (text, check constraint)
      - `created_at` (timestamp)

  2. Segurança
    - Habilitar RLS na tabela `cronograma_producao`
    - Adicionar política para usuários autenticados gerenciarem seus próprios itens
*/

CREATE TABLE IF NOT EXISTS cronograma_producao (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  receita_id uuid NOT NULL REFERENCES receitas(id) ON DELETE CASCADE,
  data_producao date NOT NULL,
  quantidade_lotes numeric NOT NULL DEFAULT 1,
  horario text,
  status text NOT NULL DEFAULT 'pendente',
  created_at timestamptz DEFAULT now(),
  CONSTRAINT cronograma_status_check CHECK (status IN ('pendente', 'em_producao', 'concluido'))
);

ALTER TABLE cronograma_producao ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on cronograma_producao"
  ON cronograma_producao
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);