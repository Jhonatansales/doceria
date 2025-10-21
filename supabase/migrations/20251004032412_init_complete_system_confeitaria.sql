/*
  # Inicialização Completa do Sistema de Confeitaria

  Este arquivo cria toda a estrutura do banco de dados para o sistema de gestão de confeitaria.

  ## Tabelas Criadas

  1. **insumos** - Ingredientes e matérias-primas
     - id (uuid, primary key)
     - nome (text, nome do insumo)
     - unidade (text, unidade de medida)
     - quantidade_estoque (numeric, quantidade disponível)
     - preco_unitario (numeric, preço por unidade)
     - created_at, updated_at (timestamps)

  2. **receitas** - Receitas de produtos
     - id (uuid, primary key)
     - nome (text, nome da receita)
     - modo_preparo (text, instruções)
     - rendimento (text, quantidade produzida)
     - ingredientes (jsonb, lista de ingredientes)
     - custo_total (numeric, custo total da receita)
     - custos_adicionais (numeric, custos extras)
     - margem_lucro (numeric, margem de lucro %)
     - preco_venda (numeric, preço para cliente final)
     - preco_revenda (numeric, preço para revendedor)
     - estoque_produto_final (integer, estoque disponível)
     - created_at, updated_at (timestamps)

  3. **produtos** - Produtos cadastrados
     - id (uuid, primary key)
     - nome (text, nome do produto)
     - descricao (text, descrição)
     - preco_venda (numeric, preço de venda)
     - custo_producao (numeric, custo de produção)
     - created_at, updated_at (timestamps)

  4. **revendedores** - Cadastro de revendedores
     - id (uuid, primary key)
     - nome (text, nome do revendedor)
     - telefone (text, contato)
     - endereco (text, endereço)
     - comissao (numeric, percentual de comissão)
     - created_at, updated_at (timestamps)

  5. **clientes** - Cadastro de clientes
     - id (uuid, primary key)
     - codigo_cliente (text, código único)
     - nome (text, nome do cliente)
     - telefone (text, contato)
     - endereco (text, endereço)
     - created_at, updated_at (timestamps)

  6. **vendas** - Registro de vendas
     - id (uuid, primary key)
     - numero_venda (text, número da venda)
     - cliente_nome (text, nome do cliente)
     - cliente_whatsapp (text, WhatsApp)
     - cliente_endereco (text, endereço)
     - revendedor_id (uuid, FK para revendedores)
     - origem_venda (text, origem)
     - forma_pagamento (text, forma de pagamento)
     - status_pagamento (text, status do pagamento)
     - tipo_cliente (text, tipo de cliente)
     - subtotal (numeric, subtotal)
     - frete (numeric, valor do frete)
     - desconto (numeric, desconto aplicado)
     - total (numeric, valor total)
     - tipo (text, tipo de venda)
     - lucro_bruto (numeric, lucro bruto)
     - produto_digitado (text, para vendas rápidas)
     - status (text, status da venda)
     - data_venda (timestamptz, data da venda)
     - observacoes (text, observações)
     - created_at, updated_at (timestamps)

  7. **venda_itens** - Itens das vendas
     - id (uuid, primary key)
     - venda_id (uuid, FK para vendas)
     - produto_id (uuid, FK para produtos)
     - quantidade (numeric, quantidade vendida)
     - preco_unitario (numeric, preço unitário)
     - subtotal (numeric, subtotal do item)
     - created_at (timestamp)

  8. **orcamentos** - Orçamentos criados
     - id (uuid, primary key)
     - numero_orcamento (text, número do orçamento)
     - cliente_id (uuid, FK para clientes)
     - cliente_nome (text, nome do cliente)
     - cliente_whatsapp (text, WhatsApp)
     - cliente_endereco (text, endereço)
     - data_criacao (timestamptz, data de criação)
     - data_validade (timestamptz, validade)
     - subtotal (numeric, subtotal)
     - total (numeric, total)
     - observacoes (text, observações)
     - status (text, status do orçamento)
     - tipo_orcamento (text, tipo)
     - created_at, updated_at (timestamps)

  9. **orcamento_itens** - Itens dos orçamentos
     - id (uuid, primary key)
     - orcamento_id (uuid, FK para orcamentos)
     - produto_id (uuid, FK para produtos)
     - quantidade (numeric, quantidade)
     - preco_unitario (numeric, preço unitário)
     - subtotal (numeric, subtotal)
     - created_at (timestamp)

  10. **gastos** - Registro de gastos
      - id (uuid, primary key)
      - descricao (text, descrição do gasto)
      - valor (numeric, valor)
      - data_vencimento (timestamptz, data de vencimento)
      - categoria (text, categoria)
      - status (text, status do pagamento)
      - created_at, updated_at (timestamps)

  11. **cronograma** - Cronograma de produção
      - id (uuid, primary key)
      - receita_id (uuid, FK para receitas)
      - data_producao (timestamptz, data de produção)
      - quantidade_lotes (integer, quantidade de lotes)
      - horario (text, horário)
      - status (text, status)
      - created_at, updated_at (timestamps)

  12. **configuracoes** - Configurações do sistema
      - id (uuid, primary key)
      - nome_confeitaria (text, nome da confeitaria)
      - contato_whatsapp (text, WhatsApp)
      - chave_pix (text, chave PIX)
      - margem_lucro_padrao (numeric, margem padrão)
      - custo_embalagem_padrao (numeric, custo padrão)
      - logo_url (text, URL do logo)
      - logo_file_path (text, caminho do arquivo)
      - created_at, updated_at (timestamps)

  ## Segurança

  - RLS habilitado em todas as tabelas
  - Políticas criadas para usuários autenticados
  - Acesso restrito por autenticação
*/

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela: insumos
CREATE TABLE IF NOT EXISTS insumos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  unidade text NOT NULL,
  quantidade_estoque numeric DEFAULT 0,
  preco_unitario numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela: receitas
CREATE TABLE IF NOT EXISTS receitas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  modo_preparo text,
  rendimento text NOT NULL,
  ingredientes jsonb DEFAULT '[]'::jsonb,
  custo_total numeric DEFAULT 0,
  custos_adicionais numeric DEFAULT 0,
  margem_lucro numeric DEFAULT 35,
  preco_venda numeric DEFAULT 0,
  preco_revenda numeric DEFAULT 0,
  estoque_produto_final integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela: produtos
CREATE TABLE IF NOT EXISTS produtos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  descricao text,
  preco_venda numeric NOT NULL,
  custo_producao numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela: revendedores
CREATE TABLE IF NOT EXISTS revendedores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  telefone text,
  endereco text,
  comissao numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela: clientes
CREATE TABLE IF NOT EXISTS clientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo_cliente text,
  nome text NOT NULL,
  telefone text,
  endereco text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela: vendas
CREATE TABLE IF NOT EXISTS vendas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_venda text NOT NULL,
  cliente_nome text,
  cliente_whatsapp text,
  cliente_endereco text,
  revendedor_id uuid REFERENCES revendedores(id) ON DELETE SET NULL,
  origem_venda text DEFAULT 'Presencial',
  forma_pagamento text DEFAULT 'PIX',
  status_pagamento text DEFAULT 'Pendente',
  tipo_cliente text DEFAULT 'Cliente Final',
  subtotal numeric DEFAULT 0,
  frete numeric DEFAULT 0,
  desconto numeric DEFAULT 0,
  total numeric DEFAULT 0,
  tipo text DEFAULT 'normal',
  lucro_bruto numeric DEFAULT 0,
  produto_digitado text,
  status text DEFAULT 'pendente',
  data_venda timestamptz DEFAULT now(),
  observacoes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela: venda_itens
CREATE TABLE IF NOT EXISTS venda_itens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venda_id uuid REFERENCES vendas(id) ON DELETE CASCADE,
  produto_id uuid REFERENCES produtos(id) ON DELETE CASCADE,
  quantidade numeric NOT NULL,
  preco_unitario numeric NOT NULL,
  subtotal numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Tabela: orcamentos
CREATE TABLE IF NOT EXISTS orcamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_orcamento text NOT NULL,
  cliente_id uuid REFERENCES clientes(id) ON DELETE SET NULL,
  cliente_nome text NOT NULL,
  cliente_whatsapp text,
  cliente_endereco text,
  data_criacao timestamptz DEFAULT now(),
  data_validade timestamptz NOT NULL,
  subtotal numeric DEFAULT 0,
  total numeric DEFAULT 0,
  observacoes text,
  status text DEFAULT 'pendente',
  tipo_orcamento text DEFAULT 'cliente_final',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela: orcamento_itens
CREATE TABLE IF NOT EXISTS orcamento_itens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  orcamento_id uuid REFERENCES orcamentos(id) ON DELETE CASCADE,
  produto_id uuid REFERENCES produtos(id) ON DELETE CASCADE,
  quantidade numeric NOT NULL,
  preco_unitario numeric NOT NULL,
  subtotal numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Tabela: gastos
CREATE TABLE IF NOT EXISTS gastos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  descricao text NOT NULL,
  valor numeric NOT NULL,
  data_vencimento timestamptz NOT NULL,
  categoria text NOT NULL,
  status text DEFAULT 'a_pagar',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela: cronograma
CREATE TABLE IF NOT EXISTS cronograma (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  receita_id uuid REFERENCES receitas(id) ON DELETE CASCADE,
  data_producao timestamptz NOT NULL,
  quantidade_lotes integer NOT NULL,
  horario text,
  status text DEFAULT 'pendente',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela: configuracoes
CREATE TABLE IF NOT EXISTS configuracoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_confeitaria text NOT NULL,
  contato_whatsapp text,
  chave_pix text,
  margem_lucro_padrao numeric DEFAULT 35,
  custo_embalagem_padrao numeric DEFAULT 0,
  logo_url text,
  logo_file_path text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE insumos ENABLE ROW LEVEL SECURITY;
ALTER TABLE receitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE revendedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE venda_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE orcamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE orcamento_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastos ENABLE ROW LEVEL SECURITY;
ALTER TABLE cronograma ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes ENABLE ROW LEVEL SECURITY;

-- Políticas para insumos
CREATE POLICY "Usuários autenticados podem visualizar insumos"
  ON insumos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem inserir insumos"
  ON insumos FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar insumos"
  ON insumos FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem deletar insumos"
  ON insumos FOR DELETE
  TO authenticated
  USING (true);

-- Políticas para receitas
CREATE POLICY "Usuários autenticados podem visualizar receitas"
  ON receitas FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem inserir receitas"
  ON receitas FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar receitas"
  ON receitas FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem deletar receitas"
  ON receitas FOR DELETE
  TO authenticated
  USING (true);

-- Políticas para produtos
CREATE POLICY "Usuários autenticados podem visualizar produtos"
  ON produtos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem inserir produtos"
  ON produtos FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar produtos"
  ON produtos FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem deletar produtos"
  ON produtos FOR DELETE
  TO authenticated
  USING (true);

-- Políticas para revendedores
CREATE POLICY "Usuários autenticados podem visualizar revendedores"
  ON revendedores FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem inserir revendedores"
  ON revendedores FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar revendedores"
  ON revendedores FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem deletar revendedores"
  ON revendedores FOR DELETE
  TO authenticated
  USING (true);

-- Políticas para clientes
CREATE POLICY "Usuários autenticados podem visualizar clientes"
  ON clientes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem inserir clientes"
  ON clientes FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar clientes"
  ON clientes FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem deletar clientes"
  ON clientes FOR DELETE
  TO authenticated
  USING (true);

-- Políticas para vendas
CREATE POLICY "Usuários autenticados podem visualizar vendas"
  ON vendas FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem inserir vendas"
  ON vendas FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar vendas"
  ON vendas FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem deletar vendas"
  ON vendas FOR DELETE
  TO authenticated
  USING (true);

-- Políticas para venda_itens
CREATE POLICY "Usuários autenticados podem visualizar venda_itens"
  ON venda_itens FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem inserir venda_itens"
  ON venda_itens FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar venda_itens"
  ON venda_itens FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem deletar venda_itens"
  ON venda_itens FOR DELETE
  TO authenticated
  USING (true);

-- Políticas para orcamentos
CREATE POLICY "Usuários autenticados podem visualizar orcamentos"
  ON orcamentos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem inserir orcamentos"
  ON orcamentos FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar orcamentos"
  ON orcamentos FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem deletar orcamentos"
  ON orcamentos FOR DELETE
  TO authenticated
  USING (true);

-- Políticas para orcamento_itens
CREATE POLICY "Usuários autenticados podem visualizar orcamento_itens"
  ON orcamento_itens FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem inserir orcamento_itens"
  ON orcamento_itens FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar orcamento_itens"
  ON orcamento_itens FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem deletar orcamento_itens"
  ON orcamento_itens FOR DELETE
  TO authenticated
  USING (true);

-- Políticas para gastos
CREATE POLICY "Usuários autenticados podem visualizar gastos"
  ON gastos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem inserir gastos"
  ON gastos FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar gastos"
  ON gastos FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem deletar gastos"
  ON gastos FOR DELETE
  TO authenticated
  USING (true);

-- Políticas para cronograma
CREATE POLICY "Usuários autenticados podem visualizar cronograma"
  ON cronograma FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem inserir cronograma"
  ON cronograma FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar cronograma"
  ON cronograma FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem deletar cronograma"
  ON cronograma FOR DELETE
  TO authenticated
  USING (true);

-- Políticas para configuracoes
CREATE POLICY "Usuários autenticados podem visualizar configuracoes"
  ON configuracoes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem inserir configuracoes"
  ON configuracoes FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar configuracoes"
  ON configuracoes FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem deletar configuracoes"
  ON configuracoes FOR DELETE
  TO authenticated
  USING (true);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_vendas_data_venda ON vendas(data_venda);
CREATE INDEX IF NOT EXISTS idx_vendas_status ON vendas(status);
CREATE INDEX IF NOT EXISTS idx_vendas_tipo ON vendas(tipo);
CREATE INDEX IF NOT EXISTS idx_vendas_revendedor ON vendas(revendedor_id);
CREATE INDEX IF NOT EXISTS idx_venda_itens_venda ON venda_itens(venda_id);
CREATE INDEX IF NOT EXISTS idx_venda_itens_produto ON venda_itens(produto_id);
CREATE INDEX IF NOT EXISTS idx_gastos_data ON gastos(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_gastos_status ON gastos(status);
CREATE INDEX IF NOT EXISTS idx_cronograma_data ON cronograma(data_producao);
