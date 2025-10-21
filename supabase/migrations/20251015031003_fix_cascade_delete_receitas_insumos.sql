/*
  # Fix Cascade Delete for Receitas and Insumos

  ## Changes Made
  
  This migration fixes foreign key constraints to properly handle deletion of recipes and ingredients.
  
  ### 1. Tables with Foreign Keys to `receitas`
  - `produtos_finais` - Now cascades on delete
  - `produtos` - Now cascades on delete  
  - `cronograma_producao` - Now cascades on delete
  - `producao_receitas` - Now cascades on delete
  - `receita_componentes` - Now cascades on delete
  - `receita_ingredientes` - Now cascades on delete
  
  ### 2. Tables with Foreign Keys to `insumos`
  - `insumos_lotes` - Now cascades on delete
  - `receita_componentes` - Now cascades on delete
  - `receita_ingredientes` - Now cascades on delete
  
  ### 3. Security
  - All RLS policies remain unchanged
  - Data integrity is maintained through proper cascading deletes
  
  ## Important Notes
  - When a recipe is deleted, all related records in dependent tables are automatically deleted
  - When an ingredient is deleted, all related records in dependent tables are automatically deleted
  - This prevents orphaned records and foreign key constraint violations
*/

-- Drop existing foreign key constraints for receitas and recreate with CASCADE

-- produtos_finais table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'produtos_finais_receita_id_fkey'
    AND table_name = 'produtos_finais'
  ) THEN
    ALTER TABLE produtos_finais DROP CONSTRAINT produtos_finais_receita_id_fkey;
    ALTER TABLE produtos_finais 
      ADD CONSTRAINT produtos_finais_receita_id_fkey 
      FOREIGN KEY (receita_id) REFERENCES receitas(id) ON DELETE CASCADE;
  END IF;
END $$;

-- produtos table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'produtos_receita_id_fkey'
    AND table_name = 'produtos'
  ) THEN
    ALTER TABLE produtos DROP CONSTRAINT produtos_receita_id_fkey;
    ALTER TABLE produtos 
      ADD CONSTRAINT produtos_receita_id_fkey 
      FOREIGN KEY (receita_id) REFERENCES receitas(id) ON DELETE CASCADE;
  END IF;
END $$;

-- cronograma_producao table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'cronograma_producao_receita_id_fkey'
    AND table_name = 'cronograma_producao'
  ) THEN
    ALTER TABLE cronograma_producao DROP CONSTRAINT cronograma_producao_receita_id_fkey;
    ALTER TABLE cronograma_producao 
      ADD CONSTRAINT cronograma_producao_receita_id_fkey 
      FOREIGN KEY (receita_id) REFERENCES receitas(id) ON DELETE CASCADE;
  END IF;
END $$;

-- producao_receitas table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'producao_receitas_receita_id_fkey'
    AND table_name = 'producao_receitas'
  ) THEN
    ALTER TABLE producao_receitas DROP CONSTRAINT producao_receitas_receita_id_fkey;
    ALTER TABLE producao_receitas 
      ADD CONSTRAINT producao_receitas_receita_id_fkey 
      FOREIGN KEY (receita_id) REFERENCES receitas(id) ON DELETE CASCADE;
  END IF;
END $$;

-- receita_componentes table (receita_id)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'receita_componentes_receita_id_fkey'
    AND table_name = 'receita_componentes'
  ) THEN
    ALTER TABLE receita_componentes DROP CONSTRAINT receita_componentes_receita_id_fkey;
    ALTER TABLE receita_componentes 
      ADD CONSTRAINT receita_componentes_receita_id_fkey 
      FOREIGN KEY (receita_id) REFERENCES receitas(id) ON DELETE CASCADE;
  END IF;
END $$;

-- receita_componentes table (receita_referencia_id)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'receita_componentes_receita_referencia_id_fkey'
    AND table_name = 'receita_componentes'
  ) THEN
    ALTER TABLE receita_componentes DROP CONSTRAINT receita_componentes_receita_referencia_id_fkey;
    ALTER TABLE receita_componentes 
      ADD CONSTRAINT receita_componentes_receita_referencia_id_fkey 
      FOREIGN KEY (receita_referencia_id) REFERENCES receitas(id) ON DELETE CASCADE;
  END IF;
END $$;

-- receita_ingredientes table (receita_id)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'receita_ingredientes_receita_id_fkey'
    AND table_name = 'receita_ingredientes'
  ) THEN
    ALTER TABLE receita_ingredientes DROP CONSTRAINT receita_ingredientes_receita_id_fkey;
    ALTER TABLE receita_ingredientes 
      ADD CONSTRAINT receita_ingredientes_receita_id_fkey 
      FOREIGN KEY (receita_id) REFERENCES receitas(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Drop existing foreign key constraints for insumos and recreate with CASCADE

-- insumos_lotes table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'insumos_lotes_insumo_id_fkey'
    AND table_name = 'insumos_lotes'
  ) THEN
    ALTER TABLE insumos_lotes DROP CONSTRAINT insumos_lotes_insumo_id_fkey;
    ALTER TABLE insumos_lotes 
      ADD CONSTRAINT insumos_lotes_insumo_id_fkey 
      FOREIGN KEY (insumo_id) REFERENCES insumos(id) ON DELETE CASCADE;
  END IF;
END $$;

-- receita_componentes table (insumo_id)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'receita_componentes_insumo_id_fkey'
    AND table_name = 'receita_componentes'
  ) THEN
    ALTER TABLE receita_componentes DROP CONSTRAINT receita_componentes_insumo_id_fkey;
    ALTER TABLE receita_componentes 
      ADD CONSTRAINT receita_componentes_insumo_id_fkey 
      FOREIGN KEY (insumo_id) REFERENCES insumos(id) ON DELETE CASCADE;
  END IF;
END $$;

-- receita_ingredientes table (insumo_id)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'receita_ingredientes_insumo_id_fkey'
    AND table_name = 'receita_ingredientes'
  ) THEN
    ALTER TABLE receita_ingredientes DROP CONSTRAINT receita_ingredientes_insumo_id_fkey;
    ALTER TABLE receita_ingredientes 
      ADD CONSTRAINT receita_ingredientes_insumo_id_fkey 
      FOREIGN KEY (insumo_id) REFERENCES insumos(id) ON DELETE CASCADE;
  END IF;
END $$;
