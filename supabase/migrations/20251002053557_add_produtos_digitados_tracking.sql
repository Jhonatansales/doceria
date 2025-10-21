/*
  # Adicionar tracking de produtos digitados em vendas rápidas

  1. Alterações
    - Criar função para contabilizar produtos digitados em vendas rápidas
    - Retorna produtos digitados com quantidade e valor total

  2. Objetivo
    - Permitir que produtos digitados em vendas rápidas sejam contabilizados no dashboard
    - Mostrar produtos mais vendidos incluindo vendas rápidas
*/

CREATE OR REPLACE FUNCTION get_produtos_digitados_vendidos(data_inicio date)
RETURNS TABLE (
  produto_nome text,
  quantidade_vendida bigint,
  receita_total numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    v.produto_digitado as produto_nome,
    COUNT(*)::bigint as quantidade_vendida,
    SUM(v.total)::numeric as receita_total
  FROM vendas v
  WHERE v.tipo_venda = 'rapida'
    AND v.produto_digitado IS NOT NULL
    AND v.produto_digitado != ''
    AND v.data_venda >= data_inicio
    AND v.status = 'concluido'
  GROUP BY v.produto_digitado
  ORDER BY quantidade_vendida DESC;
END;
$$ LANGUAGE plpgsql;