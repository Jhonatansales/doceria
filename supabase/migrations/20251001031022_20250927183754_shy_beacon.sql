/*
  # Atualizar campo de estoque nas receitas

  1. Modificações na tabela receitas
    - Renomear estoque_produzido para estoque_produto_final
    - Manter compatibilidade com dados existentes
*/

-- Renomear coluna se ela existir
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'receitas' AND column_name = 'estoque_produzido'
  ) THEN
    ALTER TABLE receitas RENAME COLUMN estoque_produzido TO estoque_produto_final;
  END IF;
  
  -- Adicionar coluna se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'receitas' AND column_name = 'estoque_produto_final'
  ) THEN
    ALTER TABLE receitas ADD COLUMN estoque_produto_final numeric DEFAULT 0;
  END IF;
END $$;