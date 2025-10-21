/*
  # Add numero_venda column to vendas table

  1. New Columns
    - `numero_venda` (text, unique, not null) - Sale number for tracking sales

  2. Changes
    - Add numero_venda column to vendas table
    - Generate sale numbers for existing records
    - Add unique constraint to prevent duplicate sale numbers

  3. Security
    - No RLS changes needed as vendas table already has proper policies
*/

-- Add the numero_venda column as nullable first
ALTER TABLE vendas ADD COLUMN IF NOT EXISTS numero_venda text;

-- Update existing records with generated sale numbers
DO $$
DECLARE
    rec RECORD;
    counter INTEGER := 1;
BEGIN
    FOR rec IN SELECT id FROM vendas WHERE numero_venda IS NULL ORDER BY created_at
    LOOP
        UPDATE vendas 
        SET numero_venda = 'V' || LPAD(counter::text, 6, '0')
        WHERE id = rec.id;
        counter := counter + 1;
    END LOOP;
END $$;

-- Now make the column NOT NULL
ALTER TABLE vendas ALTER COLUMN numero_venda SET NOT NULL;

-- Add unique constraint
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'vendas_numero_venda_key' 
        AND table_name = 'vendas'
    ) THEN
        ALTER TABLE vendas ADD CONSTRAINT vendas_numero_venda_key UNIQUE (numero_venda);
    END IF;
END $$;