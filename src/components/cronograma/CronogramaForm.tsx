import React, { useState, useEffect } from 'react';
import Button from '../common/Button';
import { CronogramaItem, Receita } from '../../types';
import { receitasService } from '../../services/receitasService';

interface CronogramaFormProps {
  selectedDate: string;
  onSubmit: (item: Omit<CronogramaItem, 'id' | 'created_at'>) => void;
  onCancel: () => void;
}

const CronogramaForm: React.FC<CronogramaFormProps> = ({ selectedDate, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    receita_id: '',
    quantidade_lotes: 1,
    horario: '',
    status: 'pendente' as 'pendente' | 'em_producao' | 'concluido'
  });

  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadReceitas();
  }, []);

  const loadReceitas = async () => {
    try {
      const data = await receitasService.getAll();
      setReceitas(data);
    } catch (error) {
      console.error('Erro ao carregar receitas:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Erro ao salvar item do cronograma:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantidade_lotes' ? parseInt(value) || 1 : value
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center bg-pink-50 rounded-lg p-4 border border-pink-100">
        <h3 className="text-lg font-bold text-gray-800 mb-1">Agendar Produção</h3>
        <p className="text-pink-600 capitalize">{formatDate(selectedDate)}</p>
      </div>

      <div>
        <label htmlFor="receita_id" className="block text-sm font-medium text-gray-700 mb-2">
          Receita *
        </label>
        <select
          id="receita_id"
          name="receita_id"
          required
          value={formData.receita_id}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-pink-50 focus:bg-white transition-colors"
        >
          <option value="">Selecione uma receita</option>
          {receitas.map(receita => (
            <option key={receita.id} value={receita.id}>
              {receita.nome} (Rende: {receita.rendimento})
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="quantidade_lotes" className="block text-sm font-medium text-gray-700 mb-2">
            Quantidade de Lotes *
          </label>
          <input
            type="number"
            id="quantidade_lotes"
            name="quantidade_lotes"
            required
            min="1"
            value={formData.quantidade_lotes}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-pink-50 focus:bg-white transition-colors text-center text-lg font-bold"
          />
        </div>

        <div>
          <label htmlFor="horario" className="block text-sm font-medium text-gray-700 mb-2">
            Horário (opcional)
          </label>
          <input
            type="time"
            id="horario"
            name="horario"
            value={formData.horario}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-pink-50 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {formData.receita_id && (
        <div className="bg-pink-50 rounded-lg p-4 border border-pink-100">
          <h4 className="font-medium text-gray-800 mb-2">Resumo da Produção:</h4>
          {(() => {
            const receita = receitas.find(r => r.id === formData.receita_id);
            if (!receita) return null;
            
            return (
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Receita:</span> {receita.nome}</p>
                <p><span className="font-medium">Lotes:</span> {formData.quantidade_lotes}</p>
                <p><span className="font-medium">Rendimento total:</span> {formData.quantidade_lotes} × {receita.rendimento}</p>
                {formData.horario && (
                  <p><span className="font-medium">Horário:</span> {formData.horario}</p>
                )}
              </div>
            );
          })()}
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-6 border-t border-pink-100">
        <Button variant="secondary" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Agendando...' : 'Agendar Produção'}
        </Button>
      </div>
    </form>
  );
};

export default CronogramaForm;