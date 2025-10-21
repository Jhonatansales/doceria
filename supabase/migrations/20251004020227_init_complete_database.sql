/*
  # Criar todas as tabelas do sistema
  
  1. Novas Tabelas
    - `insumos` - Ingredientes e matérias-primas
    - `receitas` - Receitas dos produtos
    - `receita_ingredientes` - Ingredientes usados em cada receita
    - `produtos` - Produtos finais
    - `revendedores` - Cadastro de revendedores
    - `clientes` - Cadastro de clientes
    - `vendas` - Registro de vendas
    - `venda_itens` - Itens de cada venda
    - `orcamentos` - Orçamentos criados
    - `orcamento_itens` - Itens de cada orçamento
    - `gastos` - Despesas e custos fixos
    - `cronograma` - Planejamento de produção
    - `configuracoes` - Configurações do sistema
  
  2. Segurança
    - RLS DESABILITADO em todas as tabelas para acesso público
*/

-- Tabela de Insumos
CREATE TABLE IF NOT EXISTS insumos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  unidade_medida_compra text NOT NULL,
  estoque_atual numeric DEFAULT 0,
  estoque_minimo numeric DEFAULT 0,
  custo_por_unidade numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE insumos DISABLE ROW LEVEL SECURITY;

-- Tabela de Receitas
CREATE TABLE IF NOT EXISTS receitas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  modo_preparo text,
  rendimento text NOT NULL,
  custo_total numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE receitas DISABLE ROW LEVEL SECURITY;

-- Tabela de Receita Ingredientes
CREATE TABLE IF NOT EXISTS receita_ingredientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  receita_id uuid NOT NULL REFERENCES receitas(id) ON DELETE CASCADE,
  insumo_id uuid NOT NULL REFERENCES insumos(id) ON DELETE CASCADE,
  quantidade_usada numeric NOT NULL,
  custo_ingrediente numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE receita_ingredientes DISABLE ROW LEVEL SECURITY;

-- Tabela de Produtos
CREATE TABLE IF NOT EXISTS produtos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  descricao text,
  foto_url text,
  receita_id uuid REFERENCES receitas(id) ON DELETE SET NULL,
  custo_producao numeric DEFAULT 0,
  custos_adicionais numeric DEFAULT 0,
  margem_lucro numeric DEFAULT 0,
  preco_venda numeric NOT NULL,
  preco_revenda numeric,
  ativo boolean DEFAULT true,
  estoque_atual numeric DEFAULT 0,
  estoque_minimo numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE produtos DISABLE ROW LEVEL SECURITY;

-- Tabela de Revendedores
CREATE TABLE IF NOT EXISTS revendedores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  contato text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE revendedores DISABLE ROW LEVEL SECURITY;

-- Tabela de Clientes
CREATE TABLE IF NOT EXISTS clientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo_cliente text UNIQUE NOT NULL,
  nome text NOT NULL,
  whatsapp text NOT NULL,
  endereco_completo text,
  tipo_pessoa text DEFAULT 'Física' CHECK (tipo_pessoa IN ('Física', 'Jurídica')),
  data_ultima_compra date,
  total_compras numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE clientes DISABLE ROW LEVEL SECURITY;

-- Tabela de Vendas
CREATE TABLE IF NOT EXISTS vendas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_venda text NOT NULL,
  cliente_nome text,
  cliente_whatsapp text,
  cliente_endereco text,
  origem_venda text DEFAULT 'Presencial' CHECK (origem_venda IN ('WhatsApp', 'Instagram', 'iFood', 'Site', 'Presencial')),
  forma_pagamento text DEFAULT 'PIX' CHECK (forma_pagamento IN ('PIX', 'Dinheiro', 'Cartão', 'A Prazo')),
  status_pagamento text DEFAULT 'Pendente' CHECK (status_pagamento IN ('Pago', 'Pendente')),
  revendedor_id uuid REFERENCES revendedores(id) ON DELETE SET NULL,
  tipo_cliente text DEFAULT 'Cliente Final' CHECK (tipo_cliente IN ('Cliente Final', 'Revendedor')),
  subtotal numeric DEFAULT 0,
  frete numeric DEFAULT 0,
  desconto numeric DEFAULT 0,
  total numeric NOT NULL,
  tipo_venda text DEFAULT 'normal' CHECK (tipo_venda IN ('normal', 'revenda', 'rapida')),
  lucro_bruto numeric DEFAULT 0,
  produto_digitado text,
  status text DEFAULT 'em_aberto' CHECK (status IN ('em_aberto', 'pago', 'enviado', 'concluido')),
  data_venda date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE vendas DISABLE ROW LEVEL SECURITY;

-- Tabela de Venda Itens
CREATE TABLE IF NOT EXISTS venda_itens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venda_id uuid NOT NULL REFERENCES vendas(id) ON DELETE CASCADE,
  produto_id uuid REFERENCES produtos(id) ON DELETE SET NULL,
  quantidade numeric NOT NULL,
  preco_unitario numeric NOT NULL,
  subtotal numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE venda_itens DISABLE ROW LEVEL SECURITY;

-- Tabela de Orçamentos
CREATE TABLE IF NOT EXISTS orcamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_orcamento text NOT NULL,
  cliente_id uuid REFERENCES clientes(id) ON DELETE SET NULL,
  cliente_nome text NOT NULL,
  cliente_whatsapp text,
  cliente_endereco text,
  data_criacao date DEFAULT CURRENT_DATE,
  data_validade date NOT NULL,
  subtotal numeric DEFAULT 0,
  total numeric NOT NULL,
  observacoes text,
  status text DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'rejeitado')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE orcamentos DISABLE ROW LEVEL SECURITY;

-- Tabela de Orcamento Itens
CREATE TABLE IF NOT EXISTS orcamento_itens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  orcamento_id uuid NOT NULL REFERENCES orcamentos(id) ON DELETE CASCADE,
  produto_id uuid REFERENCES produtos(id) ON DELETE SET NULL,
  quantidade numeric NOT NULL,
  preco_unitario numeric NOT NULL,
  subtotal numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE orcamento_itens DISABLE ROW LEVEL SECURITY;

-- Tabela de Gastos
CREATE TABLE IF NOT EXISTS gastos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  descricao text NOT NULL,
  valor numeric NOT NULL,
  data_vencimento date NOT NULL,
  categoria text NOT NULL,
  status text DEFAULT 'a_pagar' CHECK (status IN ('pago', 'a_pagar')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE gastos DISABLE ROW LEVEL SECURITY;

-- Tabela de Cronograma
CREATE TABLE IF NOT EXISTS cronograma (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  receita_id uuid NOT NULL REFERENCES receitas(id) ON DELETE CASCADE,
  data_producao date NOT NULL,
  quantidade_lotes numeric NOT NULL,
  horario text,
  status text DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_producao', 'concluido')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE cronograma DISABLE ROW LEVEL SECURITY;

-- Tabela de Configurações
CREATE TABLE IF NOT EXISTS configuracoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_confeitaria text DEFAULT 'Minha Confeitaria',
  contato_whatsapp text,
  chave_pix text,
  margem_lucro_padrao numeric DEFAULT 35,
  custo_embalagem_padrao numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE configuracoes DISABLE ROW LEVEL SECURITY;

-- Inserir configuração padrão
INSERT INTO configuracoes (nome_confeitaria, margem_lucro_padrao, custo_embalagem_padrao)
VALUES ('Doce Sabor', 35, 0)
ON CONFLICT DO NOTHING;