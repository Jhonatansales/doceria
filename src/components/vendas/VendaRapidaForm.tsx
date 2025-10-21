import React, { useState, useEffect } from 'react';
import { Zap, DollarSign, Users } from 'lucide-react';
import Button from '../common/Button';
import { VendaRapida, Revendedor } from '../../types';
import { revendedoresService } from '../../services/revendedoresService';

interface VendaRapidaFormProps {
  onSubmit: (vendaRapida: VendaRapida & { revendedor_id?: string; origem_venda?: string }) => void;
  onCancel: () => void;
}

const VendaRapidaForm: React.FC<VendaRapidaFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    cliente_nome: '',
    cliente_endereco: '',
    produto_digitado: '',
    valor_total: 0,
    revendedor_id: '',
    origem_venda: 'Presencial' as 'WhatsApp' | 'Instagram' | 'iFood' | 'Site' | 'Presencial',
    eh_revenda: false
  });

  const [revendedores, setRevendedores] = useState<Revendedor[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRevendedores();
  }, []);

  const loadRevendedores = async () => {
    try {
      const data = await revendedoresService.getAll();
      setRevendedores(data);
    } catch (error) {
      console.error('Erro ao carregar revendedores:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.valor_total <= 0) {
      alert('O valor total deve ser maior que zero.');
      return;
    }

    if (!formData.produto_digitado.trim()) {
      alert('Digite o nome do produto.');
      return;
    }

    if (formData.eh_revenda && !formData.revendedor_id) {
      alert('Selecione um revendedor.');
      return;
    }

    setLoading(true);
    try {
      const dadosVenda = {
        cliente_nome: formData.cliente_nome,
        cliente_endereco: formData.cliente_endereco,
        produto_digitado: formData.produto_digitado,
        valor_total: formData.valor_total,
        origem_venda: formData.origem_venda,
        revendedor_id: formData.eh_revenda ? formData.revendedor_id : undefined
      };
      await onSubmit(dadosVenda);
    } catch (error) {
      console.error('Erro ao salvar venda rápida:', error);
      alert('Erro ao salvar venda rápida. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
        : name === 'valor_total'
        ? parseFloat(value) || 0
        : value
    }));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
        <div className="flex items-center justify-center mb-3">
          <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Venda Rápida</h3>
        <p className="text-gray-600 text-sm">
          Registre uma venda de forma ágil, sem controle de estoque
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="cliente_nome" className="block text-sm font-medium text-gray-700 mb-2">
            Nome do Cliente
          </label>
          <input
            type="text"
            id="cliente_nome"
            name="cliente_nome"
            value={formData.cliente_nome}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-yellow-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-yellow-50 focus:bg-white transition-colors"
            placeholder="Nome do cliente (opcional)"
          />
        </div>

        <div>
          <label htmlFor="cliente_endereco" className="block text-sm font-medium text-gray-700 mb-2">
            Endereço
          </label>
          <input
            type="text"
            id="cliente_endereco"
            name="cliente_endereco"
            value={formData.cliente_endereco}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-yellow-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-yellow-50 focus:bg-white transition-colors"
            placeholder="Endereço (opcional)"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="origem_venda" className="block text-sm font-medium text-gray-700 mb-2">
            Origem da Venda *
          </label>
          <select
            id="origem_venda"
            name="origem_venda"
            required
            value={formData.origem_venda}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-yellow-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-yellow-50 focus:bg-white transition-colors"
          >
            <option value="WhatsApp">WhatsApp</option>
            <option value="Instagram">Instagram</option>
            <option value="Site">Site</option>
            <option value="iFood">iFood</option>
            <option value="Presencial">Presencial</option>
          </select>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="eh_revenda"
            name="eh_revenda"
            checked={formData.eh_revenda}
            onChange={handleChange}
            className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
          />
          <label htmlFor="eh_revenda" className="ml-2 block text-sm font-medium text-gray-700">
            <Users className="w-4 h-4 inline mr-1" />
            É venda para revendedor?
          </label>
        </div>
      </div>

      {formData.eh_revenda && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
          <label htmlFor="revendedor_id" className="block text-sm font-medium text-gray-700 mb-2">
            Selecione o Revendedor *
          </label>
          <select
            id="revendedor_id"
            name="revendedor_id"
            required={formData.eh_revenda}
            value={formData.revendedor_id}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <option value="">Selecione um revendedor</option>
            {revendedores.map(rev => (
              <option key={rev.id} value={rev.id}>{rev.nome}</option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label htmlFor="produto_digitado" className="block text-sm font-medium text-gray-700 mb-2">
          Produto Vendido *
        </label>
        <input
          type="text"
          id="produto_digitado"
          name="produto_digitado"
          required
          value={formData.produto_digitado}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-yellow-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-yellow-50 focus:bg-white transition-colors"
          placeholder="Ex: Bolo de Pote de Morango, Brigadeiros..."
        />
      </div>

      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
        <div className="flex items-center mb-4">
          <DollarSign className="w-5 h-5 text-green-600 mr-2" />
          <h4 className="text-lg font-bold text-gray-800">Valor da Venda</h4>
        </div>

        <div>
          <label htmlFor="valor_total" className="block text-sm font-medium text-gray-700 mb-2">
            Valor Total (R$) *
          </label>
          <input
            type="number"
            id="valor_total"
            name="valor_total"
            required
            step="0.01"
            min="0.01"
            value={formData.valor_total}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-xl font-bold text-center"
            placeholder="0,00"
          />
        </div>

        {formData.valor_total > 0 && (
          <div className="mt-4 p-4 bg-white rounded-lg border border-green-100">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Valor Total</div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(formData.valor_total)}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-start">
          <div className="w-5 h-5 text-blue-500 mt-0.5 mr-3">ℹ️</div>
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">Sobre a Venda Rápida:</p>
            <ul className="space-y-1 text-xs">
              <li>• Não afeta o controle de estoque</li>
              <li>• Ideal para vendas eventuais ou produtos não cadastrados</li>
              <li>• Será contabilizada no faturamento total</li>
              <li>• Produtos digitados serão contabilizados no dashboard</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <Button variant="secondary" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading || formData.valor_total <= 0}>
          {loading ? 'Registrando...' : 'Registrar Venda'}
        </Button>
      </div>
    </form>
  );
};

export default VendaRapidaForm;
