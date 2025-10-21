import React, { useState } from 'react';
import { User, Plus, CreditCard as Edit2, Trash2, Phone, MapPin, Calendar } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import ConfirmationModal from '../common/ConfirmationModal';
import { Cliente } from '../../types';

interface ClientesListProps {
  clientes: Cliente[];
  onEdit: (cliente: Cliente) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

const ClientesList: React.FC<ClientesListProps> = ({ clientes, onEdit, onDelete, onAdd }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [clienteToDelete, setClienteToDelete] = useState<Cliente | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filteredClientes = clientes.filter(cliente =>
    cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.whatsapp.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Nunca';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getDiasSemComprar = (dataUltimaCompra?: string) => {
    if (!dataUltimaCompra) return null;
    const hoje = new Date();
    const ultimaCompra = new Date(dataUltimaCompra);
    return Math.floor((hoje.getTime() - ultimaCompra.getTime()) / (1000 * 60 * 60 * 24));
  };

  const handleDeleteClick = (cliente: Cliente) => {
    setClienteToDelete(cliente);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!clienteToDelete) return;
    
    setDeleting(true);
    try {
      await onDelete(clienteToDelete.id);
      setShowDeleteModal(false);
      setClienteToDelete(null);
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setClienteToDelete(null);
  };
  return (
    <Card 
      title="Gestão de Clientes" 
      icon={<User className="w-5 h-5 text-pink-500" />}
    >
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar clientes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-pink-50 focus:bg-white transition-colors"
          />
        </div>
        <Button onClick={onAdd} className="whitespace-nowrap">
          <Plus className="w-4 h-4" />
          <span>Novo Cliente</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClientes.length > 0 ? (
          filteredClientes.map((cliente) => {
            const diasSemComprar = getDiasSemComprar(cliente.data_ultima_compra);
            const isAlerta = diasSemComprar && diasSemComprar >= 30;
            const isAviso = diasSemComprar && diasSemComprar >= 15 && diasSemComprar < 30;

            return (
              <div 
                key={cliente.id} 
                className={`bg-gradient-to-br from-pink-25 to-rose-25 border rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-6 ${
                  isAlerta ? 'border-red-300 bg-red-50' : 
                  isAviso ? 'border-yellow-300 bg-yellow-50' : 
                  'border-pink-100'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800 mb-2 font-serif">{cliente.nome}</h3>
                    <div className="text-sm font-medium text-pink-600 mb-2">
                      Cliente: {cliente.codigo_cliente}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-pink-600">
                        <Phone className="w-4 h-4 mr-2" />
                        <a 
                          href={`https://wa.me/55${cliente.whatsapp.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          {cliente.whatsapp}
                        </a>
                      </div>
                      {cliente.endereco_completo && (
                        <div className="flex items-start text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="line-clamp-2">{cliente.endereco_completo}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onEdit(cliente)}
                      className="text-gray-600 hover:text-pink-600 transition-colors p-2 hover:bg-pink-50 rounded-lg"
                      title="Editar cliente"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(cliente)}
                      className="text-gray-600 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-lg"
                      title="Excluir cliente"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="bg-white rounded-lg p-3 border border-pink-100">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-gray-500 mb-1">Tipo</div>
                        <div className="font-medium">{cliente.tipo_pessoa}</div>
                      </div>
                      <div>
                        <div className="text-gray-500 mb-1">Total Gasto</div>
                        <div className="font-medium text-green-600">
                          {formatCurrency(cliente.total_compras || 0)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-3 border border-pink-100">
                    <div className="flex items-center text-sm mb-1">
                      <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-gray-500">Última Compra</span>
                    </div>
                    <div className="font-medium">
                      {formatDate(cliente.data_ultima_compra)}
                    </div>
                    {diasSemComprar && (
                      <div className={`text-sm mt-1 ${
                        isAlerta ? 'text-red-600 font-medium' : 
                        isAviso ? 'text-yellow-600 font-medium' : 
                        'text-gray-500'
                      }`}>
                        {diasSemComprar} dias atrás
                        {isAlerta && ' - Oferecer desconto!'}
                        {isAviso && ' - Atenção!'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full text-center py-12">
            <User className="w-16 h-16 text-pink-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              {searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ? 'Tente ajustar sua busca' : 'Comece adicionando seu primeiro cliente'}
            </p>
            {!searchTerm && (
              <Button onClick={onAdd}>
                <Plus className="w-4 h-4" />
                <span>Adicionar Cliente</span>
              </Button>
            )}
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Excluir Cliente"
        message={`Tem certeza que deseja excluir o cliente "${clienteToDelete?.nome}"? Esta ação não pode ser desfeita e todos os dados relacionados serão perdidos.`}
        confirmText="Excluir Cliente"
        cancelText="Cancelar"
        type="danger"
        loading={deleting}
      />
    </Card>
  );
};

export default ClientesList;