/*
  # Atualizar tabela de insumos para sistema FIFO

  1. Modificações na tabela insumos
    - Remover colunas antigas de custo
    - Manter apenas estoque_atual e estoque_minimo
    - Criar nova tabela para lotes de insumos

  2. Nova Tabela
    - `insumos_lotes`
      - `id` (uuid, primary key)
      - `insumo_id` (uuid, foreign key)
      - `preco_por_unidade` (numeric, not null)
      - `quantidade_disponivel` (numeric, not null)
      - `data_entrada` (date, not null)
      - `created_at` (timestamp)

  3. Segurança
    - Habilitar RLS na nova tabela
    - Adicionar políticas apropriadas
*/

-- Criar tabela de lotes de insumos
CREATE TABLE IF NOT EXISTS insumos_lotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  insumo_id uuid NOT NULL REFERENCES insumos(id) ON DELETE CASCADE,
  preco_por_unidade numeric NOT NULL,
  quantidade_disponivel numeric NOT NULL DEFAULT 0,
  data_entrada date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE insumos_lotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on insumos_lotes"
  ON insumos_lotes
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Remover colunas antigas da tabela insumos (se existirem)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'insumos' AND column_name = 'custo_total_compra'
  ) THEN
    ALTER TABLE insumos DROP COLUMN custo_total_compra;
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'insumos' AND column_name = 'quantidade_comprada'
  ) THEN
    ALTER TABLE insumos DROP COLUMN quantidade_comprada;
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'insumos' AND column_name = 'custo_por_unidade'
  ) THEN
    ALTER TABLE insumos DROP COLUMN custo_por_unidade;
  END IF;
END $$;