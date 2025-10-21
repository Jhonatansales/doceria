import React, { useState } from 'react';
import { TrendingUp, Plus, CreditCard as Edit2, Trash2, AlertCircle, CheckCircle, Scale } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import ConfirmationModal from '../common/ConfirmationModal';
import { Gasto } from '../../types';

interface GastosListProps {
  gastos: Gasto[];
  onEdit: (gasto: Gasto) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  onBalanco: () => void;
}

const GastosList: React.FC<GastosListProps> = ({ gastos, onEdit, onDelete, onAdd, onBalanco }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [gastoToDelete, setGastoToDelete] = useState<Gasto | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filteredGastos = gastos.filter(gasto =>
    gasto.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
    gasto.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteClick = (gasto: Gasto) => {
    setGastoToDelete(gasto);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!gastoToDelete) return;
    
    setDeleting(true);
    try {
      await onDelete(gastoToDelete.id);
      setShowDeleteModal(false);
      setGastoToDelete(null);
    } catch (error) {
      console.error('Erro ao excluir gasto:', error);
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setGastoToDelete(null);
  };
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status: string) => {
    return status === 'pago' ? 'text-green-600' : 'text-red-600';
  };

  const getStatusIcon = (status: string) => {
    return status === 'pago' ? (
      <CheckCircle className="w-4 h-4 text-green-500" />
    ) : (
      <AlertCircle className="w-4 h-4 text-red-500" />
    );
  };

  return (
    <Card 
      title="Gestão de Gastos" 
      icon={<TrendingUp className="w-5 h-5 text-orange-500" />}
    >
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar gastos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
        <Button onClick={onBalanco} variant="secondary" className="whitespace-nowrap">
          <Scale className="w-4 h-4" />
          <span>Balanço</span>
        </Button>
        <Button onClick={onAdd} className="whitespace-nowrap">
          <Plus className="w-4 h-4" />
          <span>Novo Gasto</span>
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-2 font-semibold text-gray-700">Descrição</th>
              <th className="text-left py-3 px-2 font-semibold text-gray-700">Categoria</th>
              <th className="text-right py-3 px-2 font-semibold text-gray-700">Valor</th>
              <th className="text-left py-3 px-2 font-semibold text-gray-700">Vencimento</th>
              <th className="text-center py-3 px-2 font-semibold text-gray-700">Status</th>
              <th className="text-center py-3 px-2 font-semibold text-gray-700">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredGastos.length > 0 ? (
              filteredGastos.map((gasto) => (
                <tr key={gasto.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-2">
                    <div className="font-medium text-gray-800">{gasto.descricao}</div>
                  </td>
                  <td className="py-3 px-2 text-gray-600">{gasto.categoria}</td>
                  <td className="py-3 px-2 text-right font-medium text-gray-800">
                    {formatCurrency(gasto.valor)}
                  </td>
                  <td className="py-3 px-2 text-gray-600">
                    {formatDate(gasto.data_vencimento)}
                  </td>
                  <td className="py-3 px-2 text-center">
                    <div className="flex items-center justify-center space-x-1">
                      {getStatusIcon(gasto.status)}
                      <span className={`text-sm font-medium ${getStatusColor(gasto.status)}`}>
                        {gasto.status === 'pago' ? 'Pago' : 'A Pagar'}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => onEdit(gasto)}
                        className="text-gray-600 hover:text-blue-600 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(gasto)}
                        className="text-gray-600 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">
                  {searchTerm ? 'Nenhum gasto encontrado' : 'Nenhum gasto cadastrado ainda'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Excluir Gasto"
        message={`Tem certeza que deseja excluir o gasto "${gastoToDelete?.descricao}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
        loading={deleting}
      />
    </Card>
  );
};

export default GastosList;