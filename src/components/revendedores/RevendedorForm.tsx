import React, { useState, useEffect } from 'react';
import Button from '../common/Button';
import { Revendedor } from '../../types';

interface RevendedorFormProps {
  revendedor?: Revendedor;
  onSubmit: (revendedor: Omit<Revendedor, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
}

const RevendedorForm: React.FC<RevendedorFormProps> = ({ revendedor, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    endereco: '',
    comissao: 0
  });

  useEffect(() => {
    if (revendedor) {
      setFormData({
        nome: revendedor.nome,
        telefone: revendedor.telefone || '',
        endereco: revendedor.endereco || '',
        comissao: revendedor.comissao || 0
      });
    }
  }, [revendedor]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-2">
          Nome do Revendedor *
        </label>
        <input
          type="text"
          id="nome"
          name="nome"
          required
          value={formData.nome}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-pink-50 focus:bg-white transition-colors"
          placeholder="Ex: Maria Silva"
        />
      </div>

      <div>
        <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 mb-2">
          Telefone/WhatsApp *
        </label>
        <input
          type="text"
          id="telefone"
          name="telefone"
          required
          value={formData.telefone}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-pink-50 focus:bg-white transition-colors"
          placeholder="(11) 99999-9999"
        />
      </div>

      <div>
        <label htmlFor="endereco" className="block text-sm font-medium text-gray-700 mb-2">
          Endereço
        </label>
        <input
          type="text"
          id="endereco"
          name="endereco"
          value={formData.endereco}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-pink-50 focus:bg-white transition-colors"
          placeholder="Rua, número, bairro"
        />
      </div>

      <div>
        <label htmlFor="comissao" className="block text-sm font-medium text-gray-700 mb-2">
          Comissão (%) *
        </label>
        <input
          type="number"
          id="comissao"
          name="comissao"
          required
          step="0.01"
          min="0"
          max="100"
          value={formData.comissao}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-pink-50 focus:bg-white transition-colors"
          placeholder="Ex: 10"
        />
      </div>

      <div className="flex justify-end space-x-3 pt-6 border-t border-pink-100">
        <Button variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {revendedor ? 'Atualizar' : 'Cadastrar'}
        </Button>
      </div>
    </form>
  );
};

export default RevendedorForm;