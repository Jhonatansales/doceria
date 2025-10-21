/*
  # Criar tabela de produtos

  1. Nova Tabela
    - `produtos`
      - `id` (uuid, primary key)
      - `nome` (text, nome do produto)
      - `descricao` (text, descrição do produto)
      - `foto_url` (text, URL da foto)
      - `receita_id` (uuid, foreign key para receitas)
      - `custo_producao` (numeric, custo de produção)
      - `custos_adicionais` (numeric, custos extras como embalagem)
      - `margem_lucro` (numeric, margem de lucro em %)
      - `preco_venda` (numeric, preço final de venda)
      - `preco_revenda` (numeric, preço para revendedores)
      - `ativo` (boolean, se o produto está ativo)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Segurança
    - Habilitar RLS na tabela `produtos`
    - Adicionar política para usuários autenticados
*/

CREATE TABLE IF NOT EXISTS produtos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  descricao text,
  foto_url text,
  receita_id uuid REFERENCES receitas(id) ON DELETE SET NULL,
  custo_producao numeric DEFAULT 0,
  custos_adicionais numeric DEFAULT 0,
  margem_lucro numeric DEFAULT 0,
  preco_venda numeric NOT NULL,
  preco_revenda numeric,
  ativo boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own produtos"
  ON produtos
  FOR ALL
  TO authenticated
  USING (auth.uid()::text = auth.uid()::text);