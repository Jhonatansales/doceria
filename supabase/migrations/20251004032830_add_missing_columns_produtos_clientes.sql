/*
  # Adicionar Colunas Faltantes

  ## Alterações

  1. **Tabela produtos**
     - Adicionar coluna `ativo` (boolean) - indica se o produto está ativo
     - Adicionar coluna `preco_revenda` (numeric) - preço para revendedores
     - Adicionar coluna `estoque_atual` (integer) - estoque disponível
     - Adicionar coluna `estoque_minimo` (integer) - estoque mínimo

  2. **Tabela clientes**
     - Adicionar coluna `whatsapp` (text) - WhatsApp do cliente
     - Adicionar coluna `endereco_completo` (text) - endereço completo
     - Adicionar coluna `tipo_pessoa` (text) - Física ou Jurídica
     - Adicionar coluna `total_compras` (numeric) - total gasto pelo cliente

  ## Notas
  - Todas as alterações são seguras e não afetam dados existentes
  - Valores padrão são definidos para colunas obrigatórias
*/

-- Adicionar colunas na tabela produtos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'produtos' AND column_name = 'ativo'
  ) THEN
    ALTER TABLE produtos ADD COLUMN ativo boolean DEFAULT true;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'produtos' AND column_name = 'preco_revenda'
  ) THEN
    ALTER TABLE produtos ADD COLUMN preco_revenda numeric DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'produtos' AND column_name = 'estoque_atual'
  ) THEN
    ALTER TABLE produtos ADD COLUMN estoque_atual integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'produtos' AND column_name = 'estoque_minimo'
  ) THEN
    ALTER TABLE produtos ADD COLUMN estoque_minimo integer DEFAULT 0;
  END IF;
END $$;

-- Adicionar colunas na tabela clientes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clientes' AND column_name = 'whatsapp'
  ) THEN
    ALTER TABLE clientes ADD COLUMN whatsapp text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clientes' AND column_name = 'endereco_completo'
  ) THEN
    ALTER TABLE clientes ADD COLUMN endereco_completo text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clientes' AND column_name = 'tipo_pessoa'
  ) THEN
    ALTER TABLE clientes ADD COLUMN tipo_pessoa text DEFAULT 'Física';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clientes' AND column_name = 'total_compras'
  ) THEN
    ALTER TABLE clientes ADD COLUMN total_compras numeric DEFAULT 0;
  END IF;
END $$;

-- Criar índice para busca por WhatsApp
CREATE INDEX IF NOT EXISTS idx_clientes_whatsapp ON clientes(whatsapp);
