import React, { useState, useEffect } from 'react';
import RevendedoresList from '../components/revendedores/RevendedoresList';
import RevendedorForm from '../components/revendedores/RevendedorForm';
import Modal from '../components/common/Modal';
import ToastContainer from '../components/common/ToastContainer';
import { useToast } from '../hooks/useToast';
import { isSupabaseReady } from '../lib/supabase';
import { Revendedor } from '../types';
import { revendedoresService } from '../services/revendedoresService';

const Revendedores: React.FC = () => {
  const [revendedores, setRevendedores] = useState<Revendedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingRevendedor, setEditingRevendedor] = useState<Revendedor | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    loadRevendedores();
  }, []);

  const loadRevendedores = async () => {
    try {
      setError(null);
      const data = await revendedoresService.getAll();
      setRevendedores(data);
    } catch (error) {
      console.error('Erro ao carregar revendedores:', error);
      setError('Erro ao carregar revendedores. Verifique sua conexão com o banco de dados.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingRevendedor(undefined);
    setShowModal(true);
  };

  const handleEdit = (revendedor: Revendedor) => {
    setEditingRevendedor(revendedor);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    setDeleting(true);
    try {
      await revendedoresService.delete(deleteId);
      toast.success('Revendedor excluído', 'O revendedor foi removido com sucesso.');
      await loadRevendedores();
      setDeleteId(null);
    } catch (error) {
      console.error('Erro ao excluir revendedor:', error);
      toast.error('Erro ao excluir', 'Não foi possível excluir o revendedor. Tente novamente.');
    } finally {
      setDeleting(false);
    }
  };

  const cancelDelete = () => {
    setDeleteId(null);
  };

  const handleSubmit = async (revendedorData: Omit<Revendedor, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (editingRevendedor) {
        await revendedoresService.update(editingRevendedor.id, revendedorData);
        toast.success('Revendedor atualizado', 'As alterações foram salvas com sucesso.');
      } else {
        await revendedoresService.create(revendedorData);
        toast.success('Revendedor criado', 'O novo revendedor foi adicionado com sucesso.');
      }
      await loadRevendedores();
      setShowModal(false);
    } catch (error) {
      console.error('Erro ao salvar revendedor:', error);
      toast.error('Erro ao salvar', 'Não foi possível salvar o revendedor. Tente novamente.');
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setEditingRevendedor(undefined);
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
      <RevendedoresList
        revendedores={revendedores}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <Modal
        isOpen={showModal}
        onClose={handleCancel}
        title={editingRevendedor ? 'Editar Revendedor' : 'Novo Revendedor'}
        maxWidth="max-w-2xl"
      >
        <RevendedorForm
          revendedor={editingRevendedor}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </Modal>

      {deleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all">
            <div className="p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-red-900">Excluir Revendedor</h3>
                </div>
              </div>

              <div className="mb-8">
                <p className="text-gray-600 leading-relaxed">
                  Tem certeza que deseja excluir este revendedor? Esta ação não pode ser desfeita.
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={cancelDelete}
                  disabled={deleting}
                  className="px-6 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="px-6 py-2.5 text-white bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleting ? 'Excluindo...' : 'Excluir'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastContainer toasts={toast.toasts} onRemoveToast={toast.removeToast} />
    </div>
  );
};

export default Revendedores;