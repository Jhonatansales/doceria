import React, { useState, useEffect } from 'react';
import { Calculator, Package } from 'lucide-react';
import Button from '../common/Button';
import { Produto, Receita } from '../../types';
import { receitasService } from '../../services/receitasService';
import { configuracoesService } from '../../services/configuracoesService';

interface ProdutoFormProps {
  produto?: Produto;
  onSubmit: (produto: Omit<Produto, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
}

const ProdutoForm: React.FC<ProdutoFormProps> = ({ produto, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    foto_url: '',
    receita_id: '',
    custo_producao: 0,
    custos_adicionais: 0,
    margem_lucro: 35,
    preco_venda: 0,
    preco_revenda: 0,
    ativo: true,
    estoque_atual: 0,
    estoque_minimo: 0
  });

  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadReceitas();
    loadConfiguracoes();
    
    if (produto) {
      setFormData({
        nome: produto.nome,
        descricao: produto.descricao || '',
        foto_url: produto.foto_url || '',
        receita_id: produto.receita_id,
        custo_producao: produto.custo_producao,
        custos_adicionais: produto.custos_adicionais,
        margem_lucro: produto.margem_lucro,
        preco_venda: produto.preco_venda,
        preco_revenda: produto.preco_revenda || 0,
        ativo: produto.ativo,
        estoque_atual: produto.estoque_atual || 0,
        estoque_minimo: produto.estoque_minimo || 0
      });
    }
  }, [produto]);

  const loadReceitas = async () => {
    try {
      const data = await receitasService.getAll();
      setReceitas(data);
    } catch (error) {
      console.error('Erro ao carregar receitas:', error);
    }
  };

  const loadConfiguracoes = async () => {
    try {
      const config = await configuracoesService.get();
      if (config && !produto) {
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked :
                name.includes('custo') || name.includes('preco') || name.includes('margem') 
                  ? parseFloat(value) || 0 
                  : value
      };

      // Se mudou a receita, atualiza o custo de produção
      if (name === 'receita_id') {
        const receita = receitas.find(r => r.id === value);
        if (receita) {
          newData.custo_producao = receita.custo_total;
        }
      }

      // Recalcula preço de venda quando necessário
      if (name === 'custo_producao' || name === 'custos_adicionais' || name === 'margem_lucro') {
        const custoTotal = (name === 'custo_producao' ? newData.custo_producao : prev.custo_producao) +
                          (name === 'custos_adicionais' ? newData.custos_adicionais : prev.custos_adicionais);
        const margem = name === 'margem_lucro' ? newData.margem_lucro : prev.margem_lucro;
        newData.preco_venda = custoTotal * (1 + margem / 100);

        // Calcula preço de revenda automaticamente se não foi manualmente alterado
        if (!produto || name !== 'preco_revenda') {
          newData.preco_revenda = newData.preco_venda * 0.80; // 20% de desconto para revendedores
        }
      }

      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
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

  const custoTotal = formData.custo_producao + formData.custos_adicionais;
  const lucroUnitario = formData.preco_venda - custoTotal;
  const lucroUnitarioRevenda = formData.preco_revenda - custoTotal;
  const margemRevendedores = custoTotal > 0 ? ((lucroUnitarioRevenda / custoTotal) * 100).toFixed(1) : '0';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
            Nome do Produto *
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
          <label htmlFor="receita_id" className="block text-sm font-medium text-gray-700 mb-1">
            Receita Base *
          </label>
          <select
            id="receita_id"
            name="receita_id"
            required
            value={formData.receita_id}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="">Selecione uma receita</option>
            {receitas.map(receita => (
              <option key={receita.id} value={receita.id}>
                {receita.nome} - {formatCurrency(receita.custo_total)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-1">
          Descrição
        </label>
        <textarea
          id="descricao"
          name="descricao"
          rows={3}
          value={formData.descricao}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          placeholder="Descrição do produto..."
        />
      </div>

      <div>
        <label htmlFor="foto_url" className="block text-sm font-medium text-gray-700 mb-1">
          URL da Foto
        </label>
        <input
          type="url"
          id="foto_url"
          name="foto_url"
          value={formData.foto_url}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          placeholder="https://exemplo.com/foto.jpg"
        />
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <Calculator className="w-5 h-5 text-orange-500 mr-2" />
          <h3 className="text-lg font-medium text-gray-800">Cálculo de Preços</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label htmlFor="custo_producao" className="block text-sm font-medium text-gray-700 mb-1">
              Custo de Produção
            </label>
            <input
              type="number"
              id="custo_producao"
              name="custo_producao"
              step="0.01"
              min="0"
              value={formData.custo_producao}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-100"
              readOnly
            />
          </div>

          <div>
            <label htmlFor="custos_adicionais" className="block text-sm font-medium text-gray-700 mb-1">
              Custos Adicionais
            </label>
            <input
              type="number"
              id="custos_adicionais"
              name="custos_adicionais"
              step="0.01"
              min="0"
              value={formData.custos_adicionais}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="0,00"
            />
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="35"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="preco_venda" className="block text-sm font-medium text-gray-700 mb-1">
              Preço de Venda (Cliente Final) *
            </label>
            <input
              type="number"
              id="preco_venda"
              name="preco_venda"
              step="0.01"
              min="0"
              required
              value={formData.preco_venda}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="0,00"
            />
          </div>

          <div>
            <label htmlFor="preco_revenda" className="block text-sm font-medium text-gray-700 mb-1">
              Preço para Revendedores *
            </label>
            <input
              type="number"
              id="preco_revenda"
              name="preco_revenda"
              step="0.01"
              min="0"
              required
              value={formData.preco_revenda}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="0,00"
            />
          </div>
        </div>

        <div className="mt-4 p-4 bg-white rounded-lg border space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Cliente Final</h4>
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
                <div className="text-sm text-gray-600">Margem</div>
                <div className="text-lg font-semibold text-blue-600">
                  {custoTotal > 0 ? ((lucroUnitario / custoTotal) * 100).toFixed(1) : 0}%
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Revendedores</h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-sm text-gray-600">Preço Revenda</div>
                <div className="text-lg font-semibold text-purple-600">
                  {formatCurrency(formData.preco_revenda)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Lucro da Loja</div>
                <div className="text-lg font-semibold text-green-600">
                  {formatCurrency(lucroUnitarioRevenda)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Margem</div>
                <div className="text-lg font-semibold text-blue-600">
                  {margemRevendedores}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
          <Package className="w-5 h-5 text-blue-500 mr-2" />
          Controle de Estoque
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="estoque_atual" className="block text-sm font-medium text-gray-700 mb-1">
              Estoque Atual
            </label>
            <input
              type="number"
              id="estoque_atual"
              name="estoque_atual"
              step="1"
              min="0"
              value={formData.estoque_atual}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="0"
            />
          </div>

          <div>
            <label htmlFor="estoque_minimo" className="block text-sm font-medium text-gray-700 mb-1">
              Estoque Mínimo
            </label>
            <input
              type="number"
              id="estoque_minimo"
              name="estoque_minimo"
              step="1"
              min="0"
              value={formData.estoque_minimo}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="0"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="ativo"
          name="ativo"
          checked={formData.ativo}
          onChange={handleChange}
          className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
        />
        <label htmlFor="ativo" className="ml-2 block text-sm text-gray-700">
          Produto ativo (disponível para venda)
        </label>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button variant="secondary" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : (produto ? 'Atualizar' : 'Cadastrar')}
        </Button>
      </div>
    </form>
  );
};

export default ProdutoForm;