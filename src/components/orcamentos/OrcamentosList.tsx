import React, { useState } from 'react';
import { FileText, Plus, Eye, CreditCard as Edit2, Trash2, Calendar, User } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import ConfirmationModal from '../common/ConfirmationModal';
import { Orcamento } from '../../types';

interface OrcamentosListProps {
  orcamentos: Orcamento[];
  onAdd: () => void;
  onAddRevendedor: () => void;
  onEdit: (orcamento: Orcamento) => void;
  onView: (orcamento: Orcamento) => void;
  onDelete: (id: string) => void;
}

const OrcamentosList: React.FC<OrcamentosListProps> = ({
  orcamentos,
  onAdd,
  onAddRevendedor,
  onEdit,
  onView,
  onDelete
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [orcamentoToDelete, setOrcamentoToDelete] = useState<Orcamento | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filteredOrcamentos = orcamentos.filter(orcamento =>
    orcamento.cliente_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    orcamento.numero_orcamento.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    switch (status) {
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'aprovado':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejeitado':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pendente':
        return 'Pendente';
      case 'aprovado':
        return 'Aprovado';
      case 'rejeitado':
        return 'Rejeitado';
      default:
        return status;
    }
  };

  const handleDeleteClick = (orcamento: Orcamento) => {
    setOrcamentoToDelete(orcamento);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!orcamentoToDelete) return;
    
    setDeleting(true);
    try {
      await onDelete(orcamentoToDelete.id);
      setShowDeleteModal(false);
      setOrcamentoToDelete(null);
    } catch (error) {
      console.error('Erro ao excluir orçamento:', error);
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setOrcamentoToDelete(null);
  };

  return (
    <>
      <Card 
        title="Gestão de Orçamentos" 
        icon={<FileText className="w-5 h-5 text-blue-500" />}
      >
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar orçamentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-blue-50 focus:bg-white transition-colors"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={onAdd} className="whitespace-nowrap">
              <Plus className="w-4 h-4" />
              <span>Cliente Final</span>
            </Button>
            <Button onClick={onAddRevendedor} variant="secondary" className="whitespace-nowrap">
              <Plus className="w-4 h-4" />
              <span>Revendedor</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrcamentos.length > 0 ? (
            filteredOrcamentos.map((orcamento) => (
              <div 
                key={orcamento.id} 
                className="bg-gradient-to-br from-blue-25 to-indigo-25 border border-blue-100 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <FileText className="w-4 h-4 text-blue-500 mr-2" />
                      <span className="text-sm font-bold text-blue-600">
                        {orcamento.numero_orcamento}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-1 font-serif">
                      {orcamento.cliente_nome}
                    </h3>
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(orcamento.status)}`}>
                      {getStatusLabel(orcamento.status)}
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => onView(orcamento)}
                      className="text-gray-600 hover:text-blue-600 transition-colors p-2 hover:bg-blue-50 rounded-lg"
                      title="Visualizar orçamento"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {orcamento.status === 'pendente' && (
                      <button
                        onClick={() => onEdit(orcamento)}
                        className="text-gray-600 hover:text-green-600 transition-colors p-2 hover:bg-green-50 rounded-lg"
                        title="Editar orçamento"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteClick(orcamento)}
                      className="text-gray-600 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-lg"
                      title="Excluir orçamento"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="bg-white rounded-lg p-3 border border-blue-100">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-gray-500 mb-1">Valor Total</div>
                        <div className="font-bold text-blue-600 text-lg">
                          {formatCurrency(orcamento.total)}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500 mb-1">Itens</div>
                        <div className="font-medium text-gray-800">
                          {orcamento.itens.length} produto(s)
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-3 border border-blue-100">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                        <div>
                          <div className="text-gray-500">Criado em</div>
                          <div className="font-medium">
                            {formatDate(orcamento.data_criacao)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-red-500" />
                        <div>
                          <div className="text-gray-500">Válido até</div>
                          <div className="font-medium text-red-600">
                            {formatDate(orcamento.data_validade)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {orcamento.observacoes && (
                    <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-100">
                      <div className="text-xs text-yellow-700">
                        <strong>Observações:</strong> {orcamento.observacoes}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <FileText className="w-16 h-16 text-blue-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                {searchTerm ? 'Nenhum orçamento encontrado' : 'Nenhum orçamento criado'}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm ? 'Tente ajustar sua busca' : 'Comece criando seu primeiro orçamento'}
              </p>
              {!searchTerm && (
                <Button onClick={onAdd}>
                  <Plus className="w-4 h-4" />
                  <span>Gerar Orçamento</span>
                </Button>
              )}
            </div>
          )}
        </div>
      </Card>

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Excluir Orçamento"
        message={`Tem certeza que deseja excluir o orçamento ${orcamentoToDelete?.numero_orcamento}? Esta ação não pode ser desfeita.`}
        confirmText="Excluir Orçamento"
        cancelText="Cancelar"
        type="danger"
        loading={deleting}
      />
    </>
  );
};

export default OrcamentosList;