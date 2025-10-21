import React, { useState, useEffect } from 'react';
import { Scale, DollarSign } from 'lucide-react';
import Button from '../common/Button';
import Modal from '../common/Modal';

interface BalancoModalProps {
  isOpen: boolean;
  onClose: () => void;
  valorSistema: number;
  onAjustar: (valorReal: number, motivo: string) => void;
}

const BalancoModal: React.FC<BalancoModalProps> = ({
  isOpen,
  onClose,
  valorSistema,
  onAjustar
}) => {
  const [valorReal, setValorReal] = useState(0);
  const [motivo, setMotivo] = useState('');
  const [loading, setLoading] = useState(false);

  const diferenca = valorReal - valorSistema;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!motivo.trim()) {
      alert('Por favor, informe o motivo do ajuste');
      return;
    }

    setLoading(true);
    try {
      await onAjustar(valorReal, motivo);
      onClose();
    } catch (error) {
      console.error('Erro ao ajustar balanço:', error);
      alert('Erro ao ajustar balanço. Tente novamente.');
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Balanço de Caixa"
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center mb-4">
            <Scale className="w-6 h-6 text-blue-500 mr-2" />
            <h3 className="text-lg font-bold text-gray-800">Comparação de Valores</h3>
          </div>

          <div className="space-y-3">
            <div className="bg-white rounded-lg p-4 border border-blue-100">
              <div className="text-sm text-gray-600 mb-1">Valor no Sistema</div>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(valorSistema)}
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-green-100">
              <div className="text-sm text-gray-600 mb-1">Valor Real em Caixa</div>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={valorReal}
                onChange={(e) => setValorReal(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-2xl font-bold text-center"
                placeholder="0,00"
              />
            </div>

            {valorReal > 0 && (
              <div className={`bg-white rounded-lg p-4 border ${
                diferenca === 0
                  ? 'border-green-200'
                  : diferenca > 0
                  ? 'border-yellow-200'
                  : 'border-red-200'
              }`}>
                <div className="text-sm text-gray-600 mb-1">Diferença</div>
                <div className={`text-2xl font-bold ${
                  diferenca === 0
                    ? 'text-green-600'
                    : diferenca > 0
                    ? 'text-yellow-600'
                    : 'text-red-600'
                }`}>
                  {diferenca > 0 ? '+' : ''}{formatCurrency(diferenca)}
                </div>
                {diferenca === 0 && (
                  <div className="text-sm text-green-600 mt-2">
                    Valores estão corretos!
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {diferenca !== 0 && valorReal > 0 && (
          <div>
            <label htmlFor="motivo" className="block text-sm font-medium text-gray-700 mb-2">
              Motivo da Diferença *
            </label>
            <textarea
              id="motivo"
              required
              rows={3}
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Ex: Venda não registrada, troco incorreto, etc."
            />
          </div>
        )}

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="w-5 h-5 text-yellow-600 mt-0.5 mr-3">⚠️</div>
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">Importante:</p>
              <ul className="space-y-1 text-xs">
                <li>• O ajuste criará um registro de gasto/receita para corrigir o valor</li>
                <li>• Esta ação será registrada para auditoria</li>
                <li>• Use apenas quando houver diferença real no caixa</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={loading || valorReal <= 0 || diferenca === 0}
          >
            {loading ? 'Ajustando...' : 'Ajustar Balanço'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default BalancoModal;
