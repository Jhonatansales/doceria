/*
  # Add codigo_cliente field to clientes table

  1. New Columns
    - `codigo_cliente` (text, unique, not null) - Client code for tracking

  2. Changes
    - Add codigo_cliente column to clientes table
    - Generate client codes for existing records
    - Add unique constraint
*/

-- Add the codigo_cliente column as nullable first
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS codigo_cliente text;

-- Update existing records with generated client codes
DO $$
DECLARE
    rec RECORD;
    counter INTEGER := 1;
BEGIN
    FOR rec IN SELECT id FROM clientes WHERE codigo_cliente IS NULL ORDER BY created_at
    LOOP
        UPDATE clientes 
        SET codigo_cliente = 'C' || LPAD(counter::text, 6, '0')
        WHERE id = rec.id;
        counter := counter + 1;
    END LOOP;
END $$;

-- Now make the column NOT NULL
ALTER TABLE clientes ALTER COLUMN codigo_cliente SET NOT NULL;

-- Add unique constraint
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'clientes_codigo_cliente_key' 
        AND table_name = 'clientes'
    ) THEN
        ALTER TABLE clientes ADD CONSTRAINT clientes_codigo_cliente_key UNIQUE (codigo_cliente);
    END IF;
END $$;