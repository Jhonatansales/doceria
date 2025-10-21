/*
  # Inicialização Completa do Sistema de Gestão

  ## Novas Tabelas
  
  ### 1. clientes
  - `id` (uuid, chave primária)
  - `nome` (texto, obrigatório)
  - `telefone` (texto)
  - `endereco` (texto)
  - `codigo_cliente` (texto, único)
  - `created_at` (timestamp)
  - `updated_at` (timestamp)

  ### 2. revendedores
  - `id` (uuid, chave primária)
  - `nome` (texto, obrigatório)
  - `telefone` (texto)
  - `endereco` (texto)
  - `comissao` (decimal, padrão 0)
  - `created_at` (timestamp)
  - `updated_at` (timestamp)

  ### 3. insumos
  - `id` (uuid, chave primária)
  - `nome` (texto, obrigatório)
  - `unidade` (texto, obrigatório)
  - `quantidade_estoque` (decimal, padrão 0)
  - `preco_unitario` (decimal, padrão 0)
  - `created_at` (timestamp)
  - `updated_at` (timestamp)

  ### 4. produtos
  - `id` (uuid, chave primária)
  - `nome` (texto, obrigatório)
  - `descricao` (texto)
  - `preco_venda` (decimal, obrigatório)
  - `custo_producao` (decimal, padrão 0)
  - `created_at` (timestamp)
  - `updated_at` (timestamp)

  ### 5. receitas
  - `id` (uuid, chave primária)
  - `produto_id` (uuid, referência a produtos)
  - `insumo_id` (uuid, referência a insumos)
  - `quantidade` (decimal, obrigatório)
  - `created_at` (timestamp)

  ### 6. vendas
  - `id` (uuid, chave primária)
  - `cliente_id` (uuid, referência a clientes)
  - `revendedor_id` (uuid, referência a revendedores, opcional)
  - `data_venda` (timestamp, obrigatório)
  - `total` (decimal, padrão 0)
  - `status` (texto, padrão 'pendente')
  - `tipo` (texto, padrão 'normal')
  - `observacoes` (texto)
  - `created_at` (timestamp)
  - `updated_at` (timestamp)

  ### 7. venda_itens
  - `id` (uuid, chave primária)
  - `venda_id` (uuid, referência a vendas)
  - `produto_id` (uuid, referência a produtos)
  - `quantidade` (decimal, obrigatório)
  - `preco_unitario` (decimal, obrigatório)
  - `subtotal` (decimal, obrigatório)
  - `created_at` (timestamp)

  ### 8. orcamentos
  - `id` (uuid, chave primária)
  - `cliente_id` (uuid, referência a clientes, opcional)
  - `revendedor_id` (uuid, referência a revendedores, opcional)
  - `tipo` (texto, padrão 'cliente')
  - `data_orcamento` (timestamp, obrigatório)
  - `total` (decimal, padrão 0)
  - `status` (texto, padrão 'pendente')
  - `observacoes` (texto)
  - `created_at` (timestamp)
  - `updated_at` (timestamp)

  ### 9. orcamento_itens
  - `id` (uuid, chave primária)
  - `orcamento_id` (uuid, referência a orcamentos)
  - `produto_id` (uuid, referência a produtos)
  - `quantidade` (decimal, obrigatório)
  - `preco_unitario` (decimal, obrigatório)
  - `subtotal` (decimal, obrigatório)
  - `created_at` (timestamp)

  ### 10. gastos
  - `id` (uuid, chave primária)
  - `descricao` (texto, obrigatório)
  - `valor` (decimal, obrigatório)
  - `data_gasto` (timestamp, obrigatório)
  - `categoria` (texto)
  - `created_at` (timestamp)
  - `updated_at` (timestamp)

  ### 11. cronograma
  - `id` (uuid, chave primária)
  - `cliente_id` (uuid, referência a clientes)
  - `data_entrega` (timestamp, obrigatório)
  - `produto` (texto, obrigatório)
  - `quantidade` (decimal, obrigatório)
  - `status` (texto, padrão 'pendente')
  - `observacoes` (texto)
  - `created_at` (timestamp)
  - `updated_at` (timestamp)

  ### 12. configuracoes
  - `id` (uuid, chave primária)
  - `chave` (texto, único, obrigatório)
  - `valor` (texto, obrigatório)
  - `updated_at` (timestamp)

  ## Segurança
  - RLS habilitado em todas as tabelas
  - Políticas públicas para todas as operações (sem autenticação necessária)
*/

-- Tabela de Clientes
CREATE TABLE IF NOT EXISTS clientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  telefone text,
  endereco text,
  codigo_cliente text UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura pública de clientes"
  ON clientes FOR SELECT
  USING (true);

CREATE POLICY "Permitir inserção pública de clientes"
  ON clientes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Permitir atualização pública de clientes"
  ON clientes FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Permitir exclusão pública de clientes"
  ON clientes FOR DELETE
  USING (true);

-- Tabela de Revendedores
CREATE TABLE IF NOT EXISTS revendedores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  telefone text,
  endereco text,
  comissao numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE revendedores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura pública de revendedores"
  ON revendedores FOR SELECT
  USING (true);

CREATE POLICY "Permitir inserção pública de revendedores"
  ON revendedores FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Permitir atualização pública de revendedores"
  ON revendedores FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Permitir exclusão pública de revendedores"
  ON revendedores FOR DELETE
  USING (true);

-- Tabela de Insumos
CREATE TABLE IF NOT EXISTS insumos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  unidade text NOT NULL,
  quantidade_estoque numeric DEFAULT 0,
  preco_unitario numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE insumos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura pública de insumos"
  ON insumos FOR SELECT
  USING (true);

CREATE POLICY "Permitir inserção pública de insumos"
  ON insumos FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Permitir atualização pública de insumos"
  ON insumos FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Permitir exclusão pública de insumos"
  ON insumos FOR DELETE
  USING (true);

-- Tabela de Produtos
CREATE TABLE IF NOT EXISTS produtos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  descricao text,
  preco_venda numeric NOT NULL,
  custo_producao numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura pública de produtos"
  ON produtos FOR SELECT
  USING (true);

CREATE POLICY "Permitir inserção pública de produtos"
  ON produtos FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Permitir atualização pública de produtos"
  ON produtos FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Permitir exclusão pública de produtos"
  ON produtos FOR DELETE
  USING (true);

-- Tabela de Receitas
CREATE TABLE IF NOT EXISTS receitas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  produto_id uuid REFERENCES produtos(id) ON DELETE CASCADE,
  insumo_id uuid REFERENCES insumos(id) ON DELETE CASCADE,
  quantidade numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE receitas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura pública de receitas"
  ON receitas FOR SELECT
  USING (true);

CREATE POLICY "Permitir inserção pública de receitas"
  ON receitas FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Permitir atualização pública de receitas"
  ON receitas FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Permitir exclusão pública de receitas"
  ON receitas FOR DELETE
  USING (true);

-- Tabela de Vendas
CREATE TABLE IF NOT EXISTS vendas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid REFERENCES clientes(id) ON DELETE SET NULL,
  revendedor_id uuid REFERENCES revendedores(id) ON DELETE SET NULL,
  data_venda timestamptz NOT NULL,
  total numeric DEFAULT 0,
  status text DEFAULT 'pendente',
  tipo text DEFAULT 'normal',
  observacoes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE vendas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura pública de vendas"
  ON vendas FOR SELECT
  USING (true);

CREATE POLICY "Permitir inserção pública de vendas"
  ON vendas FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Permitir atualização pública de vendas"
  ON vendas FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Permitir exclusão pública de vendas"
  ON vendas FOR DELETE
  USING (true);

-- Tabela de Itens de Venda
CREATE TABLE IF NOT EXISTS venda_itens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venda_id uuid REFERENCES vendas(id) ON DELETE CASCADE,
  produto_id uuid REFERENCES produtos(id) ON DELETE SET NULL,
  quantidade numeric NOT NULL,
  preco_unitario numeric NOT NULL,
  subtotal numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE venda_itens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura pública de venda_itens"
  ON venda_itens FOR SELECT
  USING (true);

CREATE POLICY "Permitir inserção pública de venda_itens"
  ON venda_itens FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Permitir atualização pública de venda_itens"
  ON venda_itens FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Permitir exclusão pública de venda_itens"
  ON venda_itens FOR DELETE
  USING (true);

-- Tabela de Orçamentos
CREATE TABLE IF NOT EXISTS orcamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid REFERENCES clientes(id) ON DELETE SET NULL,
  revendedor_id uuid REFERENCES revendedores(id) ON DELETE SET NULL,
  tipo text DEFAULT 'cliente',
  data_orcamento timestamptz NOT NULL,
  total numeric DEFAULT 0,
  status text DEFAULT 'pendente',
  observacoes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE orcamentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura pública de orcamentos"
  ON orcamentos FOR SELECT
  USING (true);

CREATE POLICY "Permitir inserção pública de orcamentos"
  ON orcamentos FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Permitir atualização pública de orcamentos"
  ON orcamentos FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Permitir exclusão pública de orcamentos"
  ON orcamentos FOR DELETE
  USING (true);

-- Tabela de Itens de Orçamento
CREATE TABLE IF NOT EXISTS orcamento_itens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  orcamento_id uuid REFERENCES orcamentos(id) ON DELETE CASCADE,
  produto_id uuid REFERENCES produtos(id) ON DELETE SET NULL,
  quantidade numeric NOT NULL,
  preco_unitario numeric NOT NULL,
  subtotal numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE orcamento_itens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura pública de orcamento_itens"
  ON orcamento_itens FOR SELECT
  USING (true);

CREATE POLICY "Permitir inserção pública de orcamento_itens"
  ON orcamento_itens FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Permitir atualização pública de orcamento_itens"
  ON orcamento_itens FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Permitir exclusão pública de orcamento_itens"
  ON orcamento_itens FOR DELETE
  USING (true);

-- Tabela de Gastos
CREATE TABLE IF NOT EXISTS gastos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  descricao text NOT NULL,
  valor numeric NOT NULL,
  data_gasto timestamptz NOT NULL,
  categoria text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE gastos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura pública de gastos"
  ON gastos FOR SELECT
  USING (true);

CREATE POLICY "Permitir inserção pública de gastos"
  ON gastos FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Permitir atualização pública de gastos"
  ON gastos FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Permitir exclusão pública de gastos"
  ON gastos FOR DELETE
  USING (true);

-- Tabela de Cronograma
CREATE TABLE IF NOT EXISTS cronograma (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid REFERENCES clientes(id) ON DELETE SET NULL,
  data_entrega timestamptz NOT NULL,
  produto text NOT NULL,
  quantidade numeric NOT NULL,
  status text DEFAULT 'pendente',
  observacoes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE cronograma ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura pública de cronograma"
  ON cronograma FOR SELECT
  USING (true);

CREATE POLICY "Permitir inserção pública de cronograma"
  ON cronograma FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Permitir atualização pública de cronograma"
  ON cronograma FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Permitir exclusão pública de cronograma"
  ON cronograma FOR DELETE
  USING (true);

-- Tabela de Configurações
CREATE TABLE IF NOT EXISTS configuracoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chave text UNIQUE NOT NULL,
  valor text NOT NULL,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE configuracoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura pública de configuracoes"
  ON configuracoes FOR SELECT
  USING (true);

CREATE POLICY "Permitir inserção pública de configuracoes"
  ON configuracoes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Permitir atualização pública de configuracoes"
  ON configuracoes FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Permitir exclusão pública de configuracoes"
  ON configuracoes FOR DELETE
  USING (true);

-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_vendas_cliente_id ON vendas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_vendas_revendedor_id ON vendas(revendedor_id);
CREATE INDEX IF NOT EXISTS idx_vendas_data ON vendas(data_venda);
CREATE INDEX IF NOT EXISTS idx_venda_itens_venda_id ON venda_itens(venda_id);
CREATE INDEX IF NOT EXISTS idx_venda_itens_produto_id ON venda_itens(produto_id);
CREATE INDEX IF NOT EXISTS idx_orcamentos_cliente_id ON orcamentos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_orcamentos_revendedor_id ON orcamentos(revendedor_id);
CREATE INDEX IF NOT EXISTS idx_orcamento_itens_orcamento_id ON orcamento_itens(orcamento_id);
CREATE INDEX IF NOT EXISTS idx_receitas_produto_id ON receitas(produto_id);
CREATE INDEX IF NOT EXISTS idx_receitas_insumo_id ON receitas(insumo_id);
CREATE INDEX IF NOT EXISTS idx_cronograma_cliente_id ON cronograma(cliente_id);
CREATE INDEX IF NOT EXISTS idx_cronograma_data ON cronograma(data_entrega);