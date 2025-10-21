export interface Insumo {
  id: string;
  nome: string;
  unidade: string;
  quantidade_estoque: number;
  preco_unitario: number;
  created_at?: string;
  updated_at?: string;
}

export interface IngredienteReceita {
  insumo_id: string;
  quantidade_usada: number;
  unidade_medida: string;
  custo_ingrediente?: number;
  insumo?: Insumo;
}

export interface Receita {
  id: string;
  nome: string;
  modo_preparo?: string;
  rendimento: string;
  ingredientes: IngredienteReceita[];
  custo_total: number;
  custos_adicionais?: number;
  margem_lucro?: number;
  preco_venda?: number;
  preco_revenda?: number;
  estoque_produto_final?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Produto {
  id: string;
  nome: string;
  descricao?: string;
  preco_venda: number;
  preco_revenda?: number;
  custo_producao: number;
  ativo?: boolean;
  estoque_atual?: number;
  estoque_minimo?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Revendedor {
  id: string;
  nome: string;
  telefone?: string;
  endereco?: string;
  comissao: number;
  created_at?: string;
  updated_at?: string;
}

export interface ProducaoReceita {
  id: string;
  receita_id: string;
  quantidade_produzida: number;
  data_producao: string;
  created_at?: string;
}

export interface ItemVenda {
  id?: string;
  produto_id: string;
  quantidade: number;
  preco_unitario: number;
  subtotal: number;
  produto?: Produto;
}

export interface Venda {
  id: string;
  numero_venda: string;
  cliente_nome?: string;
  cliente_whatsapp?: string;
  cliente_endereco?: string;
  itens: ItemVenda[];
  origem_venda: 'WhatsApp' | 'Instagram' | 'iFood' | 'Presencial';
  forma_pagamento: 'PIX' | 'Dinheiro' | 'Cartão' | 'A Prazo';
  status_pagamento: 'Pago' | 'Pendente';
  revendedor_id?: string;
  revendedor?: Revendedor;
  subtotal: number;
  frete: number;
  desconto: number;
  total: number;
  tipo_venda: 'normal' | 'revenda' | 'rapida';
  tipo_cliente: 'Cliente Final' | 'Revendedor';
  lucro_bruto?: number;
  produto_digitado?: string; // Para vendas rápidas
  status: 'em_aberto' | 'pago' | 'enviado' | 'concluido';
  data_venda: string;
  created_at?: string;
  updated_at?: string;
}

export interface VendaRapida {
  cliente_nome?: string;
  cliente_endereco?: string;
  produto_digitado: string;
  valor_total: number;
  revendedor_id?: string;
  origem_venda?: 'WhatsApp' | 'Instagram' | 'iFood' | 'Site';
}

export interface Orcamento {
  id: string;
  numero_orcamento: string;
  cliente_id?: string;
  cliente_nome: string;
  cliente_whatsapp?: string;
  cliente_endereco?: string;
  data_criacao: string;
  data_validade: string;
  itens: ItemOrcamento[];
  subtotal: number;
  total: number;
  observacoes?: string;
  status: 'pendente' | 'aprovado' | 'rejeitado';
  tipo_orcamento?: 'cliente_final' | 'revendedor';
  created_at?: string;
  updated_at?: string;
}

export interface ItemOrcamento {
  id?: string;
  produto_id: string;
  quantidade: number;
  preco_unitario: number;
  subtotal: number;
  produto?: Produto;
}

export interface Gasto {
  id: string;
  descricao: string;
  valor: number;
  data_vencimento: string;
  categoria: string;
  status: 'pago' | 'a_pagar';
  created_at?: string;
  updated_at?: string;
}

export interface Cliente {
  id: string;
  codigo_cliente?: string;
  nome: string;
  telefone?: string;
  whatsapp?: string;
  endereco?: string;
  endereco_completo?: string;
  tipo_pessoa?: 'Física' | 'Jurídica';
  total_compras?: number;
  created_at?: string;
  updated_at?: string;
}

export interface LoteInsumo {
  id: string;
  preco_por_unidade: number;
  quantidade_disponivel: number;
  data_entrada: string;
}

export interface CronogramaItem {
  id: string;
  receita_id: string;
  data_producao: string;
  quantidade_lotes: number;
  horario?: string;
  status: 'pendente' | 'em_producao' | 'concluido';
  receita?: Receita;
  created_at?: string;
}

export interface AlertaCliente {
  cliente: Cliente;
  dias_sem_comprar: number;
  tipo: 'aviso' | 'alerta';
}

export interface DashboardMetrics {
  faturamento_dia: number;
  faturamento_mes: number;
  lucro_bruto: number;
  total_gastos: number;
  lucro_liquido: number;
  pedidos_dia: number;
  ultimas_atividades: Array<{
    cliente_nome: string;
    produto_nome: string;
    data_compra: string;
    valor: number;
  }>;
  alertas_clientes: AlertaCliente[];
  produtos_mais_vendidos: Array<{
    produto_nome: string;
    quantidade_vendida: number;
    receita_total: number;
  }>;
  faturamento_revendedores: number;
  lucro_revendedores: number;
  lucro_bruto_total: number;
  lucro_real: number;
}