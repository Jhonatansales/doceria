/*
  # Adicionar campos de precificação na tabela receitas

  1. Novos Campos
    - `custos_adicionais` (numeric, custos extras como embalagem)
    - `margem_lucro` (numeric, margem de lucro em percentual)
    - `preco_venda` (numeric, preço final de venda)
    - `preco_revenda` (numeric, preço para revendedores)
    - `estoque_produzido` (numeric, quantidade produzida em estoque)
*/

DO $$
BEGIN
  -- Adicionar campo custos_adicionais se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'receitas' AND column_name = 'custos_adicionais'
  ) THEN
    ALTER TABLE receitas ADD COLUMN custos_adicionais numeric DEFAULT 0;
  END IF;

  -- Adicionar campo margem_lucro se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'receitas' AND column_name = 'margem_lucro'
  ) THEN
    ALTER TABLE receitas ADD COLUMN margem_lucro numeric DEFAULT 35;
  END IF;

  -- Adicionar campo preco_venda se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'receitas' AND column_name = 'preco_venda'
  ) THEN
    ALTER TABLE receitas ADD COLUMN preco_venda numeric DEFAULT 0;
  END IF;

  -- Adicionar campo preco_revenda se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'receitas' AND column_name = 'preco_revenda'
  ) THEN
    ALTER TABLE receitas ADD COLUMN preco_revenda numeric DEFAULT 0;
  END IF;

  -- Adicionar campo estoque_produzido se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'receitas' AND column_name = 'estoque_produzido'
  ) THEN
    ALTER TABLE receitas ADD COLUMN estoque_produzido numeric DEFAULT 0;
  END IF;
END $$;