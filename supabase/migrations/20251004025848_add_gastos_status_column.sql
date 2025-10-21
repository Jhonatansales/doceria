/*
  # Adicionar coluna status na tabela gastos

  1. Alterações
    - Adicionar coluna `status` (texto) com valor padrão 'a_pagar'
    - Renomear coluna `data_gasto` para `data_vencimento`

  2. Observações
    - Status pode ser 'pago' ou 'a_pagar'
    - Usa IF NOT EXISTS para evitar erros em execuções repetidas
*/

DO $$ 
BEGIN
  -- Adicionar coluna status se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'gastos' AND column_name = 'status'
  ) THEN
    ALTER TABLE gastos ADD COLUMN status text DEFAULT 'a_pagar';
  END IF;

  -- Renomear data_gasto para data_vencimento se necessário
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'gastos' AND column_name = 'data_gasto'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'gastos' AND column_name = 'data_vencimento'
  ) THEN
    ALTER TABLE gastos RENAME COLUMN data_gasto TO data_vencimento;
  END IF;
END $$;