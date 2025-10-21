/*
  # Create get_produtos_mais_vendidos function

  1. New Functions
    - `get_produtos_mais_vendidos(data_inicio date)`
      - Returns the top 5 most sold products from a given start date
      - Calculates total quantity sold and revenue per product
      - Only includes completed sales (status = 'concluido')

  2. Security
    - Grant EXECUTE permission to authenticated users
    - Grant EXECUTE permission to anon role for public access
*/

CREATE OR REPLACE FUNCTION public.get_produtos_mais_vendidos(data_inicio date)
RETURNS TABLE (
  produto_nome text,
  quantidade_vendida bigint,
  receita_total numeric
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.nome AS produto_nome,
    SUM(vi.quantidade)::bigint AS quantidade_vendida,
    SUM(vi.subtotal)::numeric AS receita_total
  FROM
    vendas v
  JOIN
    venda_itens vi ON v.id = vi.venda_id
  JOIN
    produtos p ON vi.produto_id = p.id
  WHERE
    v.data_venda >= data_inicio AND v.status = 'concluido'
  GROUP BY
    p.nome
  ORDER BY
    quantidade_vendida DESC
  LIMIT 5;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_produtos_mais_vendidos(date) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_produtos_mais_vendidos(date) TO anon;