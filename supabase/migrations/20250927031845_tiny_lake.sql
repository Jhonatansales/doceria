/*
  # Criar tabela de gastos

  1. Nova Tabela
    - `gastos`
      - `id` (uuid, primary key)
      - `descricao` (text, descrição do gasto)
      - `valor` (numeric, valor do gasto)
      - `data_vencimento` (date, data de vencimento)
      - `categoria` (text, categoria do gasto)
      - `status` (text, 'pago' ou 'a_pagar')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Segurança
    - Habilitar RLS na tabela `gastos`
    - Adicionar política para usuários autenticados
*/

CREATE TABLE IF NOT EXISTS gastos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  descricao text NOT NULL,
  valor numeric NOT NULL,
  data_vencimento date NOT NULL,
  categoria text NOT NULL,
  status text DEFAULT 'a_pagar' CHECK (status IN ('pago', 'a_pagar')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE gastos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own gastos"
  ON gastos
  FOR ALL
  TO authenticated
  USING (auth.uid()::text = auth.uid()::text);