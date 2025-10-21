/*
  # Adicionar unidade de medida aos ingredientes das receitas

  1. Alterações
    - Adiciona coluna `unidade_medida` à tabela `receita_ingredientes`
      - Armazena a unidade específica usada na receita (L, ML, kg, g, caixa, etc)
    - Permite cálculo proporcional do custo baseado na quantidade e unidade
  
  2. Notas
    - A unidade de medida permite calcular custos precisos
    - Facilita a conversão entre diferentes unidades de compra e uso
*/

-- Adicionar coluna de unidade de medida
ALTER TABLE receita_ingredientes 
ADD COLUMN IF NOT EXISTS unidade_medida text DEFAULT 'un';