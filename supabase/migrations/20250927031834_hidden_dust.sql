/*
  # Criar tabela de vendas

  1. Nova Tabela
    - `vendas`
      - `id` (uuid, primary key)
      - `cliente_nome` (text, nome do cliente)
      - `cliente_whatsapp` (text, WhatsApp do cliente)
      - `subtotal` (numeric, subtotal dos produtos)
      - `frete` (numeric, valor do frete)
      - `desconto` (numeric, valor do desconto)
      - `total` (numeric, valor total da venda)
      - `tipo_venda` (text, 'normal' ou 'revenda')
      - `status` (text, status da venda)
      - `data_venda` (date, data da venda)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Segurança
    - Habilitar RLS na tabela `vendas`
    - Adicionar política para usuários autenticados
*/

CREATE TABLE IF NOT EXISTS vendas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_nome text,
  cliente_whatsapp text,
  subtotal numeric DEFAULT 0,
  frete numeric DEFAULT 0,
  desconto numeric DEFAULT 0,
  total numeric NOT NULL,
  tipo_venda text DEFAULT 'normal' CHECK (tipo_venda IN ('normal', 'revenda')),
  status text DEFAULT 'em_aberto' CHECK (status IN ('em_aberto', 'pago', 'enviado', 'concluido')),
  data_venda date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE vendas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own vendas"
  ON vendas
  FOR ALL
  TO authenticated
  USING (auth.uid()::text = auth.uid()::text);