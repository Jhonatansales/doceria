import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calculator, Search, User, Calendar } from 'lucide-react';
import Button from '../common/Button';
import { Orcamento, ItemOrcamento, Produto, Cliente } from '../../types';
import { produtosService } from '../../services/produtosService';
import { clientesService } from '../../services/clientesService';

interface OrcamentoFormProps {
  orcamento?: Orcamento;
  onSubmit: (orcamento: Omit<Orcamento, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
}

const OrcamentoForm: React.FC<OrcamentoFormProps> = ({ orcamento, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    cliente_nome: '',
    cliente_whatsapp: '',
    cliente_endereco: '',
    data_validade: '',
    observacoes: ''
  });

  const [itens, setItens] = useState<ItemOrcamento[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [clientesSugeridos, setClientesSugeridos] = useState<Cliente[]>([]);
  const [clienteEncontrado, setClienteEncontrado] = useState<Cliente | null>(null);
  const [buscandoCliente, setBuscandoCliente] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProdutos();
    
    // Definir data de validade padrão (30 dias a partir de hoje)
    const dataValidade = new Date();
    dataValidade.setDate(dataValidade.getDate() + 30);
    setFormData(prev => ({
      ...prev,
      data_validade: dataValidade.toISOString().split('T')[0]
    }));
    
    if (orcamento) {
      setFormData({
        cliente_nome: orcamento.cliente_nome,
        cliente_whatsapp: orcamento.cliente_whatsapp || '',
        cliente_endereco: orcamento.cliente_endereco || '',
        data_validade: orcamento.data_validade,
        observacoes: orcamento.observacoes || ''
      });
      setItens(orcamento.itens || []);
    }
  }, [orcamento]);

  const loadProdutos = async () => {
    try {
      const data = await produtosService.getAll();
      setProdutos(data.filter(p => p.ativo && p.preco_venda > 0));
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Busca inteligente de clientes
  const buscarClientes = async (termo: string) => {
    if (termo.length < 2) {
      setClientesSugeridos([]);
      setClienteEncontrado(null);
      return;
    }

    setBuscandoCliente(true);
    try {
      const clientes = await clientesService.searchByNameOrPhone(termo);
      setClientesSugeridos(clientes);
      
      const clienteExato = clientes.find(c => c.whatsapp === termo || c.nome.toLowerCase() === termo.toLowerCase());
      if (clienteExato) {
        setClienteEncontrado(clienteExato);
        setFormData(prev => ({
          ...prev,
          cliente_nome: clienteExato.nome,
          cliente_whatsapp: clienteExato.whatsapp,
          cliente_endereco: clienteExato.endereco_completo || ''
        }));
      }
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
    } finally {
      setBuscandoCliente(false);
    }
  };

  // Debounce para busca de clientes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.cliente_nome) {
        buscarClientes(formData.cliente_nome);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [formData.cliente_nome]);

  const selecionarCliente = (cliente: Cliente) => {
    setFormData(prev => ({
      ...prev,
      cliente_nome: cliente.nome,
      cliente_whatsapp: cliente.whatsapp,
      cliente_endereco: cliente.endereco_completo || ''
    }));
    setClienteEncontrado(cliente);
    setClientesSugeridos([]);
  };

  const adicionarItem = () => {
    setItens(prev => [...prev, {
      produto_id: '',
      quantidade: 1,
      preco_unitario: 0,
      subtotal: 0
    }]);
  };

  const adicionarItemManual = () => {
    const nomeProduto = prompt('Nome do produto:');
    if (!nomeProduto) return;

    const precoStr = prompt('Preço unitário (R$):');
    if (!precoStr) return;
    const preco = parseFloat(precoStr);
    if (isNaN(preco) || preco <= 0) {
      alert('Preço inválido');
      return;
    }

    const quantidadeStr = prompt('Quantidade:');
    if (!quantidadeStr) return;
    const quantidade = parseInt(quantidadeStr);
    if (isNaN(quantidade) || quantidade <= 0) {
      alert('Quantidade inválida');
      return;
    }

    setItens(prev => [...prev, {
      produto_id: `manual_${Date.now()}`,
      quantidade: quantidade,
      preco_unitario: preco,
      subtotal: preco * quantidade,
      produto: {
        nome: nomeProduto
      } as any
    }]);
  };

  const removerItem = (index: number) => {
    setItens(prev => prev.filter((_, i) => i !== index));
  };

  const atualizarItem = (index: number, field: keyof ItemOrcamento, value: any) => {
    setItens(prev => prev.map((item, i) => {
      if (i === index) {
        const updated = { ...item, [field]: value };
        
        if (field === 'produto_id') {
          const produto = produtos.find(p => p.id === value);
          if (produto) {
            updated.preco_unitario = produto.preco_venda;
          }
        }
        
        if (field === 'quantidade' || field === 'preco_unitario' || field === 'produto_id') {
          updated.subtotal = updated.quantidade * updated.preco_unitario;
        }
        
        return updated;
      }
      return item;
    }));
  };

  const subtotal = itens.reduce((total, item) => total + item.subtotal, 0);
  const total = subtotal;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orcamentoData = {
        cliente_id: clienteEncontrado?.id,
        cliente_nome: formData.cliente_nome,
        cliente_whatsapp: formData.cliente_whatsapp,
        cliente_endereco: formData.cliente_endereco,
        data_criacao: new Date().toISOString().split('T')[0],
        data_validade: formData.data_validade,
        itens: itens.filter(item => item.produto_id && item.quantidade > 0),
        subtotal,
        total,
        observacoes: formData.observacoes,
        status: 'pendente' as const,
        numero_orcamento: '' // Será gerado pelo service
      };

      await onSubmit(orcamentoData);
    } catch (error) {
      console.error('Erro ao salvar orçamento:', error);
      alert('Erro ao salvar orçamento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gradient-to-br from-blue-25 to-indigo-25 rounded-xl p-6 border border-blue-100">
        <div className="flex items-center mb-4">
          <User className="w-5 h-5 text-blue-500 mr-2" />
          <h3 className="text-lg font-bold text-gray-800 font-serif">Dados do Cliente</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="cliente_nome" className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Cliente *
            </label>
            <div className="relative">
              <input
                type="text"
                id="cliente_nome"
                name="cliente_nome"
                required
                value={formData.cliente_nome}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                placeholder="Nome do cliente"
              />
              
              {buscandoCliente && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                </div>
              )}
              
              {clientesSugeridos.length > 0 && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-blue-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                  {clientesSugeridos.map(cliente => (
                    <button
                      key={cliente.id}
                      type="button"
                      onClick={() => selecionarCliente(cliente)}
                      className="w-full text-left px-3 py-2 hover:bg-blue-50 border-b border-blue-100 last:border-b-0"
                    >
                      <div className="font-medium text-gray-800">{cliente.nome}</div>
                      <div className="text-sm text-gray-600">{cliente.whatsapp}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="cliente_whatsapp" className="block text-sm font-medium text-gray-700 mb-1">
              WhatsApp
            </label>
            <input
              type="text"
              id="cliente_whatsapp"
              name="cliente_whatsapp"
              value={formData.cliente_whatsapp}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              placeholder="(11) 99999-9999"
            />
          </div>
        </div>

        <div className="mt-4">
          <label htmlFor="cliente_endereco" className="block text-sm font-medium text-gray-700 mb-1">
            Endereço
          </label>
          <input
            type="text"
            id="cliente_endereco"
            name="cliente_endereco"
            value={formData.cliente_endereco}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            placeholder="Endereço completo"
          />
        </div>

        {clienteEncontrado && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center mb-2">
              <User className="w-4 h-4 text-green-600 mr-2" />
              <span className="font-medium text-green-800">Cliente Encontrado</span>
            </div>
            <div className="text-sm text-green-700">
              Total gasto: {formatCurrency(clienteEncontrado.total_compras || 0)}
            </div>
          </div>
        )}
      </div>

      <div className="bg-gradient-to-br from-yellow-25 to-orange-25 rounded-xl p-6 border border-yellow-100">
        <div className="flex items-center mb-4">
          <Calendar className="w-5 h-5 text-yellow-600 mr-2" />
          <h3 className="text-lg font-bold text-gray-800 font-serif">Validade do Orçamento</h3>
        </div>
        
        <div>
          <label htmlFor="data_validade" className="block text-sm font-medium text-gray-700 mb-1">
            Data de Validade *
          </label>
          <input
            type="date"
            id="data_validade"
            name="data_validade"
            required
            value={formData.data_validade}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-yellow-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-800">Itens do Orçamento</h3>
          <div className="flex space-x-2">
            <Button type="button" onClick={adicionarItem} size="sm" variant="secondary">
              <Plus className="w-4 h-4" />
              <span>Produto Cadastrado</span>
            </Button>
            <Button type="button" onClick={adicionarItemManual} size="sm">
              <Plus className="w-4 h-4" />
              <span>Produto Manual</span>
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          {itens.map((item, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                {item.produto_id.startsWith('manual_') ? (
                  <input
                    type="text"
                    value={item.produto?.nome || ''}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-blue-50 text-gray-700"
                  />
                ) : (
                  <select
                    value={item.produto_id}
                    onChange={(e) => atualizarItem(index, 'produto_id', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Selecione um produto</option>
                    {produtos.map(produto => (
                      <option key={produto.id} value={produto.id}>
                        {produto.nome} - {formatCurrency(produto.preco_venda)}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="w-24">
                <input
                  type="number"
                  min="1"
                  value={item.quantidade}
                  onChange={(e) => atualizarItem(index, 'quantidade', parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Qtd"
                  required
                />
              </div>

              <div className="w-32">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={item.preco_unitario}
                  onChange={(e) => atualizarItem(index, 'preco_unitario', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Preço"
                  required
                />
              </div>

              <div className="w-32 text-sm text-gray-600">
                {formatCurrency(item.subtotal)}
              </div>

              <button
                type="button"
                onClick={() => removerItem(index)}
                className="text-red-500 hover:text-red-700 transition-colors p-2 hover:bg-red-50 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {itens.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Calculator className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Nenhum item adicionado ainda</p>
              <p className="text-sm">Clique em "Adicionar Item" para começar</p>
            </div>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="observacoes" className="block text-sm font-medium text-gray-700 mb-1">
          Observações
        </label>
        <textarea
          id="observacoes"
          name="observacoes"
          rows={3}
          value={formData.observacoes}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Observações adicionais (entrega, cores, etc.)"
        />
      </div>

      <div className="bg-gradient-to-br from-green-25 to-emerald-25 rounded-xl p-6 border border-green-100">
        <div className="bg-white rounded-lg p-4 border border-green-100">
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-1">Valor Total do Orçamento</div>
            <div className="text-3xl font-bold text-green-600">
              {formatCurrency(total)}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button variant="secondary" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading || itens.length === 0}>
          {loading ? 'Salvando...' : (orcamento ? 'Atualizar' : 'Gerar Orçamento')}
        </Button>
      </div>
    </form>
  );
};

export default OrcamentoForm;