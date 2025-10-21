/*
  # Adicionar colunas faltantes na tabela vendas

  1. Alterações
    - Adicionar coluna `numero_venda` (texto)
    - Adicionar coluna `cliente_nome` (texto)
    - Adicionar coluna `cliente_whatsapp` (texto)
    - Adicionar coluna `cliente_endereco` (texto)
    - Adicionar coluna `origem_venda` (texto)
    - Adicionar coluna `forma_pagamento` (texto)
    - Adicionar coluna `status_pagamento` (texto)
    - Adicionar coluna `tipo_cliente` (texto)
    - Adicionar coluna `subtotal` (decimal)
    - Adicionar coluna `frete` (decimal)
    - Adicionar coluna `desconto` (decimal)
    - Adicionar coluna `lucro_bruto` (decimal)
    - Adicionar coluna `produto_digitado` (texto)

  2. Observações
    - Todas as colunas são opcionais para manter compatibilidade
    - Usa IF NOT EXISTS para evitar erros em execuções repetidas
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'vendas' AND column_name = 'numero_venda'
  ) THEN
    ALTER TABLE vendas ADD COLUMN numero_venda text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'vendas' AND column_name = 'cliente_nome'
  ) THEN
    ALTER TABLE vendas ADD COLUMN cliente_nome text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'vendas' AND column_name = 'cliente_whatsapp'
  ) THEN
    ALTER TABLE vendas ADD COLUMN cliente_whatsapp text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'vendas' AND column_name = 'cliente_endereco'
  ) THEN
    ALTER TABLE vendas ADD COLUMN cliente_endereco text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'vendas' AND column_name = 'origem_venda'
  ) THEN
    ALTER TABLE vendas ADD COLUMN origem_venda text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'vendas' AND column_name = 'forma_pagamento'
  ) THEN
    ALTER TABLE vendas ADD COLUMN forma_pagamento text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'vendas' AND column_name = 'status_pagamento'
  ) THEN
    ALTER TABLE vendas ADD COLUMN status_pagamento text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'vendas' AND column_name = 'tipo_cliente'
  ) THEN
    ALTER TABLE vendas ADD COLUMN tipo_cliente text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'vendas' AND column_name = 'subtotal'
  ) THEN
    ALTER TABLE vendas ADD COLUMN subtotal numeric DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'vendas' AND column_name = 'frete'
  ) THEN
    ALTER TABLE vendas ADD COLUMN frete numeric DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'vendas' AND column_name = 'desconto'
  ) THEN
    ALTER TABLE vendas ADD COLUMN desconto numeric DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'vendas' AND column_name = 'lucro_bruto'
  ) THEN
    ALTER TABLE vendas ADD COLUMN lucro_bruto numeric DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'vendas' AND column_name = 'produto_digitado'
  ) THEN
    ALTER TABLE vendas ADD COLUMN produto_digitado text;
  END IF;
END $$;