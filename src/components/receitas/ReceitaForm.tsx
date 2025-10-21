import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Search, Calculator, Play } from 'lucide-react';
import Button from '../common/Button';
import { Receita, IngredienteReceita, Insumo } from '../../types';
import { insumosService } from '../../services/insumosService';
import { configuracoesService } from '../../services/configuracoesService';

interface ReceitaFormProps {
  receita?: Receita;
  onSubmit: (receita: Omit<Receita, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
}

const ReceitaForm: React.FC<ReceitaFormProps> = ({ receita, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    nome: '',
    modo_preparo: '',
    rendimento: '',
    custos_adicionais: 0,
    margem_lucro: 35,
    preco_venda: 0,
    preco_revenda: 0
  });

  const [ingredientes, setIngredientes] = useState<IngredienteReceita[]>([]);
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [loading, setLoading] = useState(false);

  // Calculate derived values after state is defined
  const custoIngredientes = ingredientes.reduce((total, ing) => total + (ing.custo_ingrediente || 0), 0);
  const custoTotal = custoIngredientes + formData.custos_adicionais;
  const lucroUnitario = formData.preco_venda - custoTotal;

  useEffect(() => {
    loadInsumos();
    loadConfiguracoes();
    
    if (receita) {
      setFormData({
        nome: receita.nome,
        modo_preparo: receita.modo_preparo || '',
        rendimento: receita.rendimento,
        custos_adicionais: receita.custos_adicionais || 0,
        margem_lucro: receita.margem_lucro || 35,
        preco_venda: receita.preco_venda || 0,
        preco_revenda: receita.preco_revenda || 0
      });
      setIngredientes(receita.ingredientes || []);
    }
  }, [receita]);

  const loadInsumos = async () => {
    try {
      const data = await insumosService.getAll();
      setInsumos(data);
    } catch (error) {
      console.error('Erro ao carregar insumos:', error);
    }
  };

  const loadConfiguracoes = async () => {
    try {
      const config = await configuracoesService.get();
      if (config && !receita) {
        setFormData(prev => ({
          ...prev,
          margem_lucro: config.margem_lucro_padrao,
          custos_adicionais: config.custo_embalagem_padrao
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: name.includes('custo') || name.includes('preco') || name.includes('margem') 
          ? parseFloat(value) || 0 
          : value
      };

      // Recalcula preço de venda quando necessário
      if (name === 'custos_adicionais' || name === 'margem_lucro') {
        const custoTotal = custoIngredientes + (name === 'custos_adicionais' ? newData.custos_adicionais : prev.custos_adicionais);
        const margem = name === 'margem_lucro' ? newData.margem_lucro : prev.margem_lucro;
        newData.preco_venda = custoTotal * (1 + margem / 100);
        
        // Calcula preço de revenda (15% menor)
        newData.preco_revenda = newData.preco_venda * 0.85;
      }

      return newData;
    });
  };

  // Recalcula preços quando custos dos ingredientes mudam
  useEffect(() => {
    const custoTotal = custoIngredientes + formData.custos_adicionais;
    const novoPrecoVenda = custoTotal * (1 + formData.margem_lucro / 100);
    const novoPrecoRevenda = novoPrecoVenda * 0.85;

    if (Math.abs(novoPrecoVenda - formData.preco_venda) > 0.01) {
      setFormData(prev => ({
      ...prev,
        preco_venda: novoPrecoVenda,
        preco_revenda: novoPrecoRevenda
      }));
    }
  }, [custoIngredientes, formData.custos_adicionais, formData.margem_lucro]);

  const adicionarIngrediente = () => {
    setIngredientes(prev => [...prev, {
      insumo_id: '',
      quantidade_usada: 0,
      unidade_medida: 'un',
      custo_ingrediente: 0
    }]);
  };

  const removerIngrediente = (index: number) => {
    setIngredientes(prev => prev.filter((_, i) => i !== index));
  };

  const calcularCustoIngrediente = (insumo: any, quantidade: number, unidade: string): number => {
    if (!insumo || quantidade <= 0) return 0;

    const precoCompra = insumo.preco_compra || 0;
    const quantidadeCompra = insumo.quantidade_compra || 1;
    const unidadeCompra = insumo.unidade_compra || 'un';

    const custoPorUnidade = precoCompra / quantidadeCompra;

    let fatorConversao = 1;

    if (unidadeCompra === 'kg' && unidade === 'g') {
      fatorConversao = quantidade / 1000;
    } else if (unidadeCompra === 'L' && unidade === 'ml') {
      fatorConversao = quantidade / 1000;
    } else if (unidadeCompra === unidade) {
      fatorConversao = quantidade;
    } else {
      fatorConversao = quantidade;
    }

    return custoPorUnidade * fatorConversao;
  };

  const atualizarIngrediente = (index: number, field: keyof IngredienteReceita, value: any) => {
    setIngredientes(prev => prev.map((ing, i) => {
      if (i === index) {
        const updated = { ...ing, [field]: value };

        if (field === 'insumo_id') {
          const insumo = insumos.find(ins => ins.id === value);
          if (insumo) {
            updated.insumo = insumo;
            updated.unidade_medida = insumo.unidade_compra || 'un';
            updated.custo_ingrediente = calcularCustoIngrediente(
              insumo,
              updated.quantidade_usada,
              updated.unidade_medida
            );
          }
        }

        if (field === 'quantidade_usada' || field === 'unidade_medida') {
          const insumo = updated.insumo || insumos.find(ins => ins.id === updated.insumo_id);
          if (insumo) {
            updated.custo_ingrediente = calcularCustoIngrediente(
              insumo,
              updated.quantidade_usada,
              updated.unidade_medida
            );
          }
        }

        return updated;
      }
      return ing;
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const receitaData = {
        ...formData,
        ingredientes: ingredientes.filter(ing => ing.insumo_id && ing.quantidade_usada > 0),
        custo_total: custoIngredientes
      };

      await onSubmit(receitaData);
    } catch (error) {
      console.error('Erro ao salvar receita:', error);
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
            Nome da Receita *
          </label>
          <input
            type="text"
            id="nome"
            name="nome"
            required
            value={formData.nome}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="Ex: Bolo de Chocolate"
          />
        </div>

        <div>
          <label htmlFor="rendimento" className="block text-sm font-medium text-gray-700 mb-1">
            Rendimento *
          </label>
          <input
            type="text"
            id="rendimento"
            name="rendimento"
            required
            value={formData.rendimento}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="Ex: 10 fatias, 20 brigadeiros"
          />
        </div>
      </div>


      <div>
        <label htmlFor="modo_preparo" className="block text-sm font-medium text-gray-700 mb-1">
          Modo de Preparo
        </label>
        <textarea
          id="modo_preparo"
          name="modo_preparo"
          rows={4}
          value={formData.modo_preparo}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          placeholder="Descreva o modo de preparo da receita..."
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-800">Ingredientes</h3>
          <Button type="button" onClick={adicionarIngrediente} size="sm">
            <Plus className="w-4 h-4" />
            <span>Adicionar</span>
          </Button>
        </div>

        <div className="space-y-3">
          {ingredientes.map((ingrediente, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Ingrediente</label>
                  <select
                    value={ingrediente.insumo_id}
                    onChange={(e) => atualizarIngrediente(index, 'insumo_id', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  >
                    <option value="">Selecione um insumo</option>
                    {insumos.map(insumo => (
                      <option key={insumo.id} value={insumo.id}>
                        {insumo.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-28">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Quantidade</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={ingrediente.quantidade_usada}
                    onChange={(e) => atualizarIngrediente(index, 'quantidade_usada', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="0"
                    required
                  />
                </div>

                <div className="w-24">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Unidade</label>
                  <select
                    value={ingrediente.unidade_medida}
                    onChange={(e) => atualizarIngrediente(index, 'unidade_medida', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                  >
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="L">L</option>
                    <option value="ml">ml</option>
                    <option value="un">un</option>
                    <option value="caixa">caixa</option>
                  </select>
                </div>

                <div className="w-32">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Custo</label>
                  <div className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-green-700">
                    {formatCurrency(ingrediente.custo_ingrediente || 0)}
                  </div>
                </div>

                <div className="flex items-end pb-2">
                  <button
                    type="button"
                    onClick={() => removerIngrediente(index)}
                    className="text-red-500 hover:text-red-700 transition-colors flex-shrink-0 p-2"
                    title="Remover ingrediente"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {ingredientes.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Nenhum ingrediente adicionado ainda</p>
              <p className="text-sm">Clique em "Adicionar" para começar</p>
            </div>
          )}
        </div>

        {ingredientes.length > 0 && (
          <div className="mt-4 p-4 bg-pink-50 rounded-lg border border-pink-100">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium text-gray-800">Custo Total dos Ingredientes:</span>
              <span className="text-2xl font-bold text-pink-600">
                {formatCurrency(custoIngredientes)}
              </span>
            </div>
          </div>
        )}
      </div>

      {receita && (
        <div className="bg-gradient-to-br from-pink-25 to-rose-25 rounded-xl p-6 border border-pink-100">
          <div className="flex items-center mb-4">
            <Calculator className="w-5 h-5 text-pink-500 mr-2" />
            <h3 className="text-lg font-bold text-gray-800 font-serif">Calculadora de Preços</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label htmlFor="custos_adicionais" className="block text-sm font-medium text-gray-700 mb-1">
                Custos Adicionais (R$)
              </label>
              <input
                type="number"
                id="custos_adicionais"
                name="custos_adicionais"
                step="0.01"
                min="0"
                value={formData.custos_adicionais}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white"
                placeholder="0,00"
              />
              <p className="text-xs text-gray-500 mt-1">Embalagem, gás, etc.</p>
            </div>

            <div>
              <label htmlFor="margem_lucro" className="block text-sm font-medium text-gray-700 mb-1">
                Margem de Lucro (%)
              </label>
              <input
                type="number"
                id="margem_lucro"
                name="margem_lucro"
                step="0.1"
                min="0"
                value={formData.margem_lucro}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white"
                placeholder="35"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Custo dos Ingredientes
              </label>
              <input
                type="text"
                value={formatCurrency(custoIngredientes)}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="preco_venda" className="block text-sm font-medium text-gray-700 mb-1">
                Preço de Venda (R$)
              </label>
              <input
                type="number"
                id="preco_venda"
                name="preco_venda"
                step="0.01"
                min="0"
                value={formData.preco_venda}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white"
                placeholder="0,00"
              />
            </div>

            <div>
              <label htmlFor="preco_revenda" className="block text-sm font-medium text-gray-700 mb-1">
                Preço para Revendedores (R$)
              </label>
              <input
                type="number"
                id="preco_revenda"
                name="preco_revenda"
                step="0.01"
                min="0"
                value={formData.preco_revenda}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white"
                placeholder="0,00"
              />
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-pink-100">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-sm text-gray-600">Custo Total</div>
                <div className="text-lg font-semibold text-red-600">
                  {formatCurrency(custoTotal)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Lucro Unitário</div>
                <div className="text-lg font-semibold text-green-600">
                  {formatCurrency(lucroUnitario)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Margem Real</div>
                <div className="text-lg font-semibold text-blue-600">
                  {custoTotal > 0 ? ((lucroUnitario / custoTotal) * 100).toFixed(1) : 0}%
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-4">
        <Button variant="secondary" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : (receita ? 'Atualizar' : 'Cadastrar')}
        </Button>
      </div>
    </form>
  );
};

export default ReceitaForm;