import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calculator, User, Calendar, TrendingUp } from 'lucide-react';
import Button from '../common/Button';
import { Orcamento, ItemOrcamento, Produto, Revendedor } from '../../types';
import { produtosService } from '../../services/produtosService';
import { revendedoresService } from '../../services/revendedoresService';

interface OrcamentoRevendedorFormProps {
  orcamento?: Orcamento;
  onSubmit: (orcamento: Omit<Orcamento, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
}

const OrcamentoRevendedorForm: React.FC<OrcamentoRevendedorFormProps> = ({ orcamento, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    revendedor_id: '',
    revendedor_nome: '',
    revendedor_whatsapp: '',
    revendedor_endereco: '',
    data_validade: '',
    observacoes: ''
  });

  const [itens, setItens] = useState<ItemOrcamento[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [revendedores, setRevendedores] = useState<Revendedor[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProdutos();
    loadRevendedores();

    const dataValidade = new Date();
    dataValidade.setDate(dataValidade.getDate() + 30);
    setFormData(prev => ({
      ...prev,
      data_validade: dataValidade.toISOString().split('T')[0]
    }));

    if (orcamento) {
      setFormData({
        revendedor_id: orcamento.cliente_id || '',
        revendedor_nome: orcamento.cliente_nome,
        revendedor_whatsapp: orcamento.cliente_whatsapp || '',
        revendedor_endereco: orcamento.cliente_endereco || '',
        data_validade: orcamento.data_validade,
        observacoes: orcamento.observacoes || ''
      });
      setItens(orcamento.itens || []);
    }
  }, [orcamento]);

  const loadProdutos = async () => {
    try {
      const data = await produtosService.getAll();
      setProdutos(data.filter(p => p.ativo && p.preco_revenda && p.preco_revenda > 0));
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    }
  };

  const loadRevendedores = async () => {
    try {
      const data = await revendedoresService.getAll();
      setRevendedores(data);
    } catch (error) {
      console.error('Erro ao carregar revendedores:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'revendedor_id') {
      const revendedor = revendedores.find(r => r.id === value);
      if (revendedor) {
        setFormData(prev => ({
          ...prev,
          revendedor_id: revendedor.id,
          revendedor_nome: revendedor.nome,
          revendedor_whatsapp: revendedor.contato
        }));
        return;
      }
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const adicionarItem = () => {
    setItens(prev => [...prev, {
      produto_id: '',
      quantidade: 1,
      preco_unitario: 0,
      subtotal: 0
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
            updated.preco_unitario = produto.preco_revenda || 0;
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

  const calcularLucroLoja = () => {
    return itens.reduce((lucro, item) => {
      const produto = produtos.find(p => p.id === item.produto_id);
      if (produto) {
        const custoTotal = produto.custo_producao + produto.custos_adicionais;
        const lucroItem = (item.preco_unitario - custoTotal) * item.quantidade;
        return lucro + lucroItem;
      }
      return lucro;
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orcamentoData = {
        cliente_id: formData.revendedor_id,
        cliente_nome: formData.revendedor_nome,
        cliente_whatsapp: formData.revendedor_whatsapp,
        cliente_endereco: formData.revendedor_endereco,
        data_criacao: new Date().toISOString().split('T')[0],
        data_validade: formData.data_validade,
        itens: itens.filter(item => item.produto_id && item.quantidade > 0),
        subtotal,
        total,
        observacoes: formData.observacoes,
        status: 'pendente' as const,
        tipo_orcamento: 'revendedor' as const,
        numero_orcamento: ''
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

  const lucroLoja = calcularLucroLoja();
  const margemLucro = total > 0 ? ((lucroLoja / total) * 100).toFixed(1) : '0';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gradient-to-br from-purple-25 to-indigo-25 rounded-xl p-6 border border-purple-100">
        <div className="flex items-center mb-4">
          <User className="w-5 h-5 text-purple-500 mr-2" />
          <h3 className="text-lg font-bold text-gray-800 font-serif">Dados do Revendedor</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="revendedor_id" className="block text-sm font-medium text-gray-700 mb-1">
              Revendedor *
            </label>
            <select
              id="revendedor_id"
              name="revendedor_id"
              required
              value={formData.revendedor_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
            >
              <option value="">Selecione um revendedor</option>
              {revendedores.map(revendedor => (
                <option key={revendedor.id} value={revendedor.id}>
                  {revendedor.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="revendedor_whatsapp" className="block text-sm font-medium text-gray-700 mb-1">
              WhatsApp
            </label>
            <input
              type="text"
              id="revendedor_whatsapp"
              name="revendedor_whatsapp"
              value={formData.revendedor_whatsapp}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
              placeholder="(11) 99999-9999"
            />
          </div>
        </div>

        <div className="mt-4">
          <label htmlFor="revendedor_endereco" className="block text-sm font-medium text-gray-700 mb-1">
            Endereço
          </label>
          <input
            type="text"
            id="revendedor_endereco"
            name="revendedor_endereco"
            value={formData.revendedor_endereco}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
            placeholder="Endereço completo"
          />
        </div>
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
          <h3 className="text-lg font-medium text-gray-800">Produtos para Revenda</h3>
          <Button type="button" onClick={adicionarItem} size="sm">
            <Plus className="w-4 h-4" />
            <span>Adicionar Produto</span>
          </Button>
        </div>

        <div className="space-y-3">
          {itens.map((item, index) => {
            const produto = produtos.find(p => p.id === item.produto_id);
            const custoTotal = produto ? produto.custo_producao + produto.custos_adicionais : 0;
            const lucroItem = (item.preco_unitario - custoTotal) * item.quantidade;

            return (
              <div key={index} className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg border border-purple-100">
                <div className="flex-1">
                  <select
                    value={item.produto_id}
                    onChange={(e) => atualizarItem(index, 'produto_id', e.target.value)}
                    className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                    required
                  >
                    <option value="">Selecione um produto</option>
                    {produtos.map(produto => (
                      <option key={produto.id} value={produto.id}>
                        {produto.nome} - {formatCurrency(produto.preco_revenda || 0)}
                      </option>
                    ))}
                  </select>
                  {produto && (
                    <div className="mt-1 text-xs text-gray-600">
                      Lucro da loja: {formatCurrency(lucroItem)}
                    </div>
                  )}
                </div>

                <div className="w-24">
                  <input
                    type="number"
                    min="1"
                    value={item.quantidade}
                    onChange={(e) => atualizarItem(index, 'quantidade', parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Preço"
                    required
                  />
                </div>

                <div className="w-32 text-sm font-semibold text-purple-600">
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
            );
          })}

          {itens.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Calculator className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Nenhum produto adicionado ainda</p>
              <p className="text-sm">Clique em "Adicionar Produto" para começar</p>
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
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="Observações adicionais (entrega, condições, etc.)"
        />
      </div>

      <div className="bg-gradient-to-br from-green-25 to-emerald-25 rounded-xl p-6 border border-green-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border border-green-100">
            <div className="flex items-center mb-2">
              <TrendingUp className="w-5 h-5 text-purple-500 mr-2" />
              <div className="text-sm text-gray-600">Total para Revendedor</div>
            </div>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(total)}
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-green-100">
            <div className="flex items-center mb-2">
              <TrendingUp className="w-5 h-5 text-green-500 mr-2" />
              <div className="text-sm text-gray-600">Lucro da Loja</div>
            </div>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(lucroLoja)}
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-green-100">
            <div className="flex items-center mb-2">
              <Calculator className="w-5 h-5 text-blue-500 mr-2" />
              <div className="text-sm text-gray-600">Margem de Lucro</div>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {margemLucro}%
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

export default OrcamentoRevendedorForm;
