/*
  # Corrigir Políticas RLS para Acesso Anônimo

  ## Problema
  As políticas RLS estão configuradas para `TO authenticated` mas o sistema
  não usa autenticação, resultando em erros ao salvar dados.

  ## Solução
  Alterar todas as políticas para permitir acesso público (anônimo).
  
  ## Segurança
  - Em produção, você deve implementar autenticação adequada
  - Por enquanto, permitimos acesso público para desenvolvimento

  ## Alterações
  - Remove políticas antigas que exigem autenticação
  - Cria novas políticas permitindo acesso público a todas as operações
*/

-- Remover políticas antigas
DROP POLICY IF EXISTS "Usuários autenticados podem visualizar insumos" ON insumos;
DROP POLICY IF EXISTS "Usuários autenticados podem inserir insumos" ON insumos;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar insumos" ON insumos;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar insumos" ON insumos;

DROP POLICY IF EXISTS "Usuários autenticados podem visualizar receitas" ON receitas;
DROP POLICY IF EXISTS "Usuários autenticados podem inserir receitas" ON receitas;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar receitas" ON receitas;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar receitas" ON receitas;

DROP POLICY IF EXISTS "Usuários autenticados podem visualizar produtos" ON produtos;
DROP POLICY IF EXISTS "Usuários autenticados podem inserir produtos" ON produtos;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar produtos" ON produtos;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar produtos" ON produtos;

DROP POLICY IF EXISTS "Usuários autenticados podem visualizar revendedores" ON revendedores;
DROP POLICY IF EXISTS "Usuários autenticados podem inserir revendedores" ON revendedores;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar revendedores" ON revendedores;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar revendedores" ON revendedores;

DROP POLICY IF EXISTS "Usuários autenticados podem visualizar clientes" ON clientes;
DROP POLICY IF EXISTS "Usuários autenticados podem inserir clientes" ON clientes;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar clientes" ON clientes;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar clientes" ON clientes;

DROP POLICY IF EXISTS "Usuários autenticados podem visualizar vendas" ON vendas;
DROP POLICY IF EXISTS "Usuários autenticados podem inserir vendas" ON vendas;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar vendas" ON vendas;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar vendas" ON vendas;

DROP POLICY IF EXISTS "Usuários autenticados podem visualizar venda_itens" ON venda_itens;
DROP POLICY IF EXISTS "Usuários autenticados podem inserir venda_itens" ON venda_itens;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar venda_itens" ON venda_itens;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar venda_itens" ON venda_itens;

DROP POLICY IF EXISTS "Usuários autenticados podem visualizar orcamentos" ON orcamentos;
DROP POLICY IF EXISTS "Usuários autenticados podem inserir orcamentos" ON orcamentos;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar orcamentos" ON orcamentos;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar orcamentos" ON orcamentos;

DROP POLICY IF EXISTS "Usuários autenticados podem visualizar orcamento_itens" ON orcamento_itens;
DROP POLICY IF EXISTS "Usuários autenticados podem inserir orcamento_itens" ON orcamento_itens;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar orcamento_itens" ON orcamento_itens;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar orcamento_itens" ON orcamento_itens;

DROP POLICY IF EXISTS "Usuários autenticados podem visualizar gastos" ON gastos;
DROP POLICY IF EXISTS "Usuários autenticados podem inserir gastos" ON gastos;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar gastos" ON gastos;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar gastos" ON gastos;

DROP POLICY IF EXISTS "Usuários autenticados podem visualizar cronograma" ON cronograma;
DROP POLICY IF EXISTS "Usuários autenticados podem inserir cronograma" ON cronograma;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar cronograma" ON cronograma;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar cronograma" ON cronograma;

DROP POLICY IF EXISTS "Usuários autenticados podem visualizar configuracoes" ON configuracoes;
DROP POLICY IF EXISTS "Usuários autenticados podem inserir configuracoes" ON configuracoes;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar configuracoes" ON configuracoes;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar configuracoes" ON configuracoes;

-- Criar novas políticas permitindo acesso público
-- Insumos
CREATE POLICY "Acesso público para visualizar insumos" ON insumos FOR SELECT USING (true);
CREATE POLICY "Acesso público para inserir insumos" ON insumos FOR INSERT WITH CHECK (true);
CREATE POLICY "Acesso público para atualizar insumos" ON insumos FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Acesso público para deletar insumos" ON insumos FOR DELETE USING (true);

-- Receitas
CREATE POLICY "Acesso público para visualizar receitas" ON receitas FOR SELECT USING (true);
CREATE POLICY "Acesso público para inserir receitas" ON receitas FOR INSERT WITH CHECK (true);
CREATE POLICY "Acesso público para atualizar receitas" ON receitas FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Acesso público para deletar receitas" ON receitas FOR DELETE USING (true);

-- Produtos
CREATE POLICY "Acesso público para visualizar produtos" ON produtos FOR SELECT USING (true);
CREATE POLICY "Acesso público para inserir produtos" ON produtos FOR INSERT WITH CHECK (true);
CREATE POLICY "Acesso público para atualizar produtos" ON produtos FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Acesso público para deletar produtos" ON produtos FOR DELETE USING (true);

-- Revendedores
CREATE POLICY "Acesso público para visualizar revendedores" ON revendedores FOR SELECT USING (true);
CREATE POLICY "Acesso público para inserir revendedores" ON revendedores FOR INSERT WITH CHECK (true);
CREATE POLICY "Acesso público para atualizar revendedores" ON revendedores FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Acesso público para deletar revendedores" ON revendedores FOR DELETE USING (true);

-- Clientes
CREATE POLICY "Acesso público para visualizar clientes" ON clientes FOR SELECT USING (true);
CREATE POLICY "Acesso público para inserir clientes" ON clientes FOR INSERT WITH CHECK (true);
CREATE POLICY "Acesso público para atualizar clientes" ON clientes FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Acesso público para deletar clientes" ON clientes FOR DELETE USING (true);

-- Vendas
CREATE POLICY "Acesso público para visualizar vendas" ON vendas FOR SELECT USING (true);
CREATE POLICY "Acesso público para inserir vendas" ON vendas FOR INSERT WITH CHECK (true);
CREATE POLICY "Acesso público para atualizar vendas" ON vendas FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Acesso público para deletar vendas" ON vendas FOR DELETE USING (true);

-- Venda Itens
CREATE POLICY "Acesso público para visualizar venda_itens" ON venda_itens FOR SELECT USING (true);
CREATE POLICY "Acesso público para inserir venda_itens" ON venda_itens FOR INSERT WITH CHECK (true);
CREATE POLICY "Acesso público para atualizar venda_itens" ON venda_itens FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Acesso público para deletar venda_itens" ON venda_itens FOR DELETE USING (true);

-- Orçamentos
CREATE POLICY "Acesso público para visualizar orcamentos" ON orcamentos FOR SELECT USING (true);
CREATE POLICY "Acesso público para inserir orcamentos" ON orcamentos FOR INSERT WITH CHECK (true);
CREATE POLICY "Acesso público para atualizar orcamentos" ON orcamentos FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Acesso público para deletar orcamentos" ON orcamentos FOR DELETE USING (true);

-- Orçamento Itens
CREATE POLICY "Acesso público para visualizar orcamento_itens" ON orcamento_itens FOR SELECT USING (true);
CREATE POLICY "Acesso público para inserir orcamento_itens" ON orcamento_itens FOR INSERT WITH CHECK (true);
CREATE POLICY "Acesso público para atualizar orcamento_itens" ON orcamento_itens FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Acesso público para deletar orcamento_itens" ON orcamento_itens FOR DELETE USING (true);

-- Gastos
CREATE POLICY "Acesso público para visualizar gastos" ON gastos FOR SELECT USING (true);
CREATE POLICY "Acesso público para inserir gastos" ON gastos FOR INSERT WITH CHECK (true);
CREATE POLICY "Acesso público para atualizar gastos" ON gastos FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Acesso público para deletar gastos" ON gastos FOR DELETE USING (true);

-- Cronograma
CREATE POLICY "Acesso público para visualizar cronograma" ON cronograma FOR SELECT USING (true);
CREATE POLICY "Acesso público para inserir cronograma" ON cronograma FOR INSERT WITH CHECK (true);
CREATE POLICY "Acesso público para atualizar cronograma" ON cronograma FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Acesso público para deletar cronograma" ON cronograma FOR DELETE USING (true);

-- Configurações
CREATE POLICY "Acesso público para visualizar configuracoes" ON configuracoes FOR SELECT USING (true);
CREATE POLICY "Acesso público para inserir configuracoes" ON configuracoes FOR INSERT WITH CHECK (true);
CREATE POLICY "Acesso público para atualizar configuracoes" ON configuracoes FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Acesso público para deletar configuracoes" ON configuracoes FOR DELETE USING (true);
