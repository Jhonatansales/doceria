import React, { useState, useEffect } from 'react';
import Button from '../common/Button';
import { Insumo } from '../../types';

interface InsumoFormProps {
  insumo?: Insumo;
  onSubmit: (insumo: Omit<Insumo, 'id' | 'created_at' | 'updated_at' | 'custo_por_unidade'>) => void;
  onCancel: () => void;
}

const unidadesMedida = [
  'g', 'kg', 'ml', 'l', 'un', 'dz', 'cx', 'pct'
];

const InsumoForm: React.FC<InsumoFormProps> = ({ insumo, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    nome: '',
    unidade_medida_compra: 'g',
    estoque_atual: 0,
    estoque_minimo: 0,
    custo_total_compra: 0,
    quantidade_comprada: 0
  });

  useEffect(() => {
    if (insumo) {
      setFormData({
        nome: insumo.nome,
        unidade_medida_compra: insumo.unidade || insumo.unidade_medida_compra || 'g',
        estoque_atual: insumo.quantidade_estoque || insumo.estoque_atual || 0,
        estoque_minimo: insumo.estoque_minimo || 0,
        custo_total_compra: insumo.preco_unitario || 0,
        quantidade_comprada: insumo.quantidade_estoque || 0
      });
    }
  }, [insumo]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      nome: formData.nome,
      unidade_medida_compra: formData.unidade_medida_compra,
      estoque_atual: formData.estoque_atual,
      estoque_minimo: formData.estoque_minimo,
      custo_total_compra: formData.custo_total_compra,
      quantidade_comprada: formData.quantidade_comprada
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('custo') || name.includes('quantidade') || name.includes('estoque') 
        ? parseFloat(value) || 0 
        : value
    }));
  };

  const custoUnitario = formData.quantidade_comprada > 0 
    ? formData.custo_total_compra / formData.quantidade_comprada 
    : 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
          Nome do Insumo *
        </label>
        <input
          type="text"
          id="nome"
          name="nome"
          required
          value={formData.nome}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          placeholder="Ex: Farinha de Trigo"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="unidade_medida_compra" className="block text-sm font-medium text-gray-700 mb-1">
            Unidade de Medida *
          </label>
          <select
            id="unidade_medida_compra"
            name="unidade_medida_compra"
            required
            value={formData.unidade_medida_compra}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            {unidadesMedida.map(unidade => (
              <option key={unidade} value={unidade}>{unidade}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="custo_total_compra" className="block text-sm font-medium text-gray-700 mb-1">
            Custo Total da Compra *
          </label>
          <input
            type="number"
            id="custo_total_compra"
            name="custo_total_compra"
            required
            step="0.01"
            min="0"
            value={formData.custo_total_compra}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="0,00"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="quantidade_comprada" className="block text-sm font-medium text-gray-700 mb-1">
            Quantidade Comprada *
          </label>
          <input
            type="number"
            id="quantidade_comprada"
            name="quantidade_comprada"
            required
            step="0.01"
            min="0"
            value={formData.quantidade_comprada}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Custo por Unidade
          </label>
          <input
            type="text"
            value={`R$ ${custoUnitario.toFixed(4)}`}
            disabled
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="estoque_atual" className="block text-sm font-medium text-gray-700 mb-1">
            Estoque Atual *
          </label>
          <input
            type="number"
            id="estoque_atual"
            name="estoque_atual"
            required
            step="0.01"
            min="0"
            value={formData.estoque_atual}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="0"
          />
        </div>

        <div>
          <label htmlFor="estoque_minimo" className="block text-sm font-medium text-gray-700 mb-1">
            Estoque Mínimo *
          </label>
          <input
            type="number"
            id="estoque_minimo"
            name="estoque_minimo"
            required
            step="0.01"
            min="0"
            value={formData.estoque_minimo}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="0"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {insumo ? 'Atualizar' : 'Cadastrar'}
        </Button>
      </div>
    </form>
  );
};

export default InsumoForm;