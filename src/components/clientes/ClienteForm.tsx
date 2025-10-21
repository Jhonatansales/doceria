import React, { useState, useEffect } from 'react';
import Button from '../common/Button';
import { Cliente } from '../../types';

interface ClienteFormProps {
  cliente?: Cliente;
  onSubmit: (cliente: Omit<Cliente, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
}

const ClienteForm: React.FC<ClienteFormProps> = ({ cliente, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    nome: '',
    whatsapp: '',
    endereco_completo: '',
    tipo_pessoa: 'Física' as 'Física' | 'Jurídica'
  });

  useEffect(() => {
    if (cliente) {
      setFormData({
        nome: cliente.nome,
        whatsapp: cliente.whatsapp,
        endereco_completo: cliente.endereco_completo || '',
        tipo_pessoa: cliente.tipo_pessoa
      });
    }
  }, [cliente]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTipoPessoaChange = (tipo: 'Física' | 'Jurídica') => {
    setFormData(prev => ({
      ...prev,
      tipo_pessoa: tipo
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-2">
            Nome Completo *
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
          <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-2">
            WhatsApp *
          </label>
          <input
            type="text"
            id="whatsapp"
            name="whatsapp"
            required
            value={formData.whatsapp}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-pink-50 focus:bg-white transition-colors"
            placeholder="(11) 99999-9999"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Tipo de Pessoa *
        </label>
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => handleTipoPessoaChange('Física')}
            className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
              formData.tipo_pessoa === 'Física'
                ? 'border-pink-500 bg-pink-50 text-pink-700'
                : 'border-gray-200 bg-white text-gray-600 hover:border-pink-300'
            }`}
          >
            Pessoa Física
          </button>
          <button
            type="button"
            onClick={() => handleTipoPessoaChange('Jurídica')}
            className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
              formData.tipo_pessoa === 'Jurídica'
                ? 'border-pink-500 bg-pink-50 text-pink-700'
                : 'border-gray-200 bg-white text-gray-600 hover:border-pink-300'
            }`}
          >
            Pessoa Jurídica
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="endereco_completo" className="block text-sm font-medium text-gray-700 mb-2">
          Endereço Completo
        </label>
        <textarea
          id="endereco_completo"
          name="endereco_completo"
          rows={3}
          value={formData.endereco_completo}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-pink-50 focus:bg-white transition-colors"
          placeholder="Rua, número, bairro, cidade, CEP..."
        />
      </div>

      <div className="flex justify-end space-x-3 pt-6 border-t border-pink-100">
        <Button variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {cliente ? 'Atualizar' : 'Cadastrar'}
        </Button>
      </div>
    </form>
  );
};

export default ClienteForm;