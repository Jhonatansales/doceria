import React, { useState, useEffect } from 'react';
import ClientesList from '../components/clientes/ClientesList';
import ClienteForm from '../components/clientes/ClienteForm';
import Modal from '../components/common/Modal';
import SuccessModal from '../components/common/SuccessModal';
import ToastContainer from '../components/common/ToastContainer';
import { useToast } from '../hooks/useToast';
import { isSupabaseReady } from '../lib/supabase';
import { Cliente } from '../types';
import { clientesService } from '../services/clientesService';

const Clientes: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [editingCliente, setEditingCliente] = useState<Cliente | undefined>();
  const { toasts, removeToast, success, error: showError } = useToast();

  useEffect(() => {
    loadClientes();
  }, []);

  const loadClientes = async () => {
    try {
      setError(null);
      const data = await clientesService.getAll();
      setClientes(data);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      setError('Erro ao carregar clientes. Verifique sua conexão com o banco de dados.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingCliente(undefined);
    setShowModal(true);
  };

  const handleEdit = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await clientesService.delete(id);
      await loadClientes();
      success('Cliente excluído', 'O cliente foi excluído com sucesso.');
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      showError('Erro ao excluir', 'Não foi possível excluir o cliente. Tente novamente.');
    }
  };

  const handleSubmit = async (clienteData: Omit<Cliente, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const isEditing = !!editingCliente;
      if (editingCliente) {
        await clientesService.update(editingCliente.id, clienteData);
      } else {
        await clientesService.create(clienteData);
      }
      await loadClientes();
      setShowModal(false);
      
      setSuccessMessage(
        isEditing 
          ? 'Cliente atualizado com sucesso!' 
          : 'Cliente cadastrado com sucesso!'
      );
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      showError('Erro ao salvar', 'Não foi possível salvar o cliente. Tente novamente.');
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setEditingCliente(undefined);
  };

  // Show configuration message if Supabase is not ready
  if (!isSupabaseReady()) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-pink-100 p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 font-serif">Configuração Necessária</h2>
        <p className="text-gray-600 mb-4">
          Para usar o sistema, você precisa configurar sua conexão com o Supabase.
        </p>
        <div className="bg-pink-50 border border-pink-200 rounded-lg p-4 text-left max-w-md mx-auto">
          <h3 className="font-semibold text-pink-800 mb-2">Como configurar:</h3>
          <ol className="text-sm text-pink-700 space-y-1">
            <li>1. Clique no ícone de configurações no topo do preview</li>
            <li>2. Clique no botão "Supabase"</li>
            <li>3. Configure sua URL e chave do Supabase</li>
            <li>4. As tabelas serão criadas automaticamente</li>
          </ol>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <h2 className="text-xl font-bold text-red-800 mb-2">Erro de Conexão</h2>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <ClientesList
        clientes={clientes}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <Modal
        isOpen={showModal}
        onClose={handleCancel}
        title={editingCliente ? 'Editar Cliente' : 'Novo Cliente'}
        maxWidth="max-w-2xl"
      >
        <ClienteForm
          cliente={editingCliente}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </Modal>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Operação realizada"
        message={successMessage}
        autoClose={true}
        autoCloseDelay={3000}
      />

      <ToastContainer
        toasts={toasts}
        onRemoveToast={removeToast}
      />
    </div>
  );
};

export default Clientes;