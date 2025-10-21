/*
  # Remove RLS policies and make tables publicly accessible

  1. Security Changes
    - Disable RLS on all tables to allow public access
    - Remove existing authentication-based policies
    - Allow anonymous users to perform all operations

  2. Tables affected
    - clientes: Allow public insert, select, update, delete
    - vendas: Allow public insert, select, update, delete  
    - venda_itens: Allow public insert, select, update, delete
    - gastos: Allow public insert, select, update, delete
    - All other tables: Keep existing public policies or make public
*/

-- Disable RLS on clientes table and allow public access
ALTER TABLE clientes DISABLE ROW LEVEL SECURITY;

-- Disable RLS on vendas table and allow public access  
ALTER TABLE vendas DISABLE ROW LEVEL SECURITY;

-- Disable RLS on venda_itens table and allow public access
ALTER TABLE venda_itens DISABLE ROW LEVEL SECURITY;

-- Disable RLS on gastos table and allow public access
ALTER TABLE gastos DISABLE ROW LEVEL SECURITY;

-- Disable RLS on configuracoes table and allow public access
ALTER TABLE configuracoes DISABLE ROW LEVEL SECURITY;