import React, { useState, useEffect } from 'react';
import Button from '../common/Button';
import { Gasto } from '../../types';

interface GastoFormProps {
  gasto?: Gasto;
  onSubmit: (gasto: Omit<Gasto, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
}

const categorias = [
  'Ingredientes',
  'Embalagens',
  'Equipamentos',
  'Marketing',
  'Transporte',
  'Aluguel',
  'Energia',
  'Internet',
  'Telefone',
  'Funcionário',
  'Gás',
  'Outros'
];

const GastoForm: React.FC<GastoFormProps> = ({ gasto, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    descricao: '',
    valor: 0,
    data_vencimento: new Date().toISOString().split('T')[0],
    categoria: 'Outros',
    status: 'a_pagar' as 'pago' | 'a_pagar'
  });

  useEffect(() => {
    if (gasto) {
      setFormData({
        descricao: gasto.descricao,
        valor: gasto.valor,
        data_vencimento: gasto.data_vencimento,
        categoria: gasto.categoria,
        status: gasto.status
      });
    }
  }, [gasto]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'valor' ? parseFloat(value) || 0 : value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-1">
          Descrição *
        </label>
        <input
          type="text"
          id="descricao"
          name="descricao"
          required
          value={formData.descricao}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          placeholder="Ex: Compra de farinha de trigo"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 mb-1">
            Categoria *
          </label>
          <select
            id="categoria"
            name="categoria"
            required
            value={formData.categoria}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            {categorias.map(categoria => (
              <option key={categoria} value={categoria}>{categoria}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="valor" className="block text-sm font-medium text-gray-700 mb-1">
            Valor *
          </label>
          <input
            type="number"
            id="valor"
            name="valor"
            required
            step="0.01"
            min="0"
            value={formData.valor}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="0,00"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="data_vencimento" className="block text-sm font-medium text-gray-700 mb-1">
            Data de Vencimento *
          </label>
          <input
            type="date"
            id="data_vencimento"
            name="data_vencimento"
            required
            value={formData.data_vencimento}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Status *
          </label>
          <select
            id="status"
            name="status"
            required
            value={formData.status}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="a_pagar">A Pagar</option>
            <option value="pago">Pago</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {gasto ? 'Atualizar' : 'Cadastrar'}
        </Button>
      </div>
    </form>
  );
};

export default GastoForm;