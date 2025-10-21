/*
  # Atualizar tabela de vendas com novos campos

  1. Novos Campos
    - `origem_venda` (text, origem da venda)
    - `forma_pagamento` (text, forma de pagamento)
    - `status_pagamento` (text, status do pagamento)
    - `revendedor_id` (uuid, referência ao revendedor)

  2. Constraints
    - Check constraints para validar valores permitidos
    - Foreign key para revendedores
*/

DO $$
BEGIN
  -- Adicionar campo origem_venda se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vendas' AND column_name = 'origem_venda'
  ) THEN
    ALTER TABLE vendas ADD COLUMN origem_venda text DEFAULT 'Presencial';
  END IF;

  -- Adicionar campo forma_pagamento se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vendas' AND column_name = 'forma_pagamento'
  ) THEN
    ALTER TABLE vendas ADD COLUMN forma_pagamento text DEFAULT 'PIX';
  END IF;

  -- Adicionar campo status_pagamento se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vendas' AND column_name = 'status_pagamento'
  ) THEN
    ALTER TABLE vendas ADD COLUMN status_pagamento text DEFAULT 'Pago';
  END IF;

  -- Adicionar campo revendedor_id se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vendas' AND column_name = 'revendedor_id'
  ) THEN
    ALTER TABLE vendas ADD COLUMN revendedor_id uuid REFERENCES revendedores(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Adicionar constraints se não existirem
DO $$
BEGIN
  -- Constraint para origem_venda
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'vendas' AND constraint_name = 'vendas_origem_venda_check'
  ) THEN
    ALTER TABLE vendas ADD CONSTRAINT vendas_origem_venda_check 
    CHECK (origem_venda = ANY (ARRAY['WhatsApp'::text, 'Instagram'::text, 'iFood'::text, 'Presencial'::text]));
  END IF;

  -- Constraint para forma_pagamento
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'vendas' AND constraint_name = 'vendas_forma_pagamento_check'
  ) THEN
    ALTER TABLE vendas ADD CONSTRAINT vendas_forma_pagamento_check 
    CHECK (forma_pagamento = ANY (ARRAY['PIX'::text, 'Dinheiro'::text, 'Cartão'::text, 'A Prazo'::text]));
  END IF;

  -- Constraint para status_pagamento
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'vendas' AND constraint_name = 'vendas_status_pagamento_check'
  ) THEN
    ALTER TABLE vendas ADD CONSTRAINT vendas_status_pagamento_check 
    CHECK (status_pagamento = ANY (ARRAY['Pago'::text, 'Pendente'::text]));
  END IF;
END $$;