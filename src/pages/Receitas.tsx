import React, { useState, useEffect } from 'react';
import ReceitasList from '../components/receitas/ReceitasList';
import ReceitaForm from '../components/receitas/ReceitaForm';
import Modal from '../components/common/Modal';
import ToastContainer from '../components/common/ToastContainer';
import { useToast } from '../hooks/useToast';
import { isSupabaseReady } from '../lib/supabase';
import { Receita } from '../types';
import { receitasService } from '../services/receitasService';

const Receitas: React.FC = () => {
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingReceita, setEditingReceita] = useState<Receita | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    loadReceitas();
  }, []);

  const loadReceitas = async () => {
    try {
      setError(null);
      const data = await receitasService.getAll();
      setReceitas(data);
    } catch (error) {
      console.error('Erro ao carregar receitas:', error);
      setError('Erro ao carregar receitas. Verifique sua conexão com o banco de dados.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingReceita(undefined);
    setShowModal(true);
  };

  const handleEdit = (receita: Receita) => {
    setEditingReceita(receita);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    setDeleting(true);
    try {
      await receitasService.delete(deleteId);
      toast.success('Receita excluída', 'A receita foi removida com sucesso.');
      await loadReceitas();
      setDeleteId(null);
    } catch (error) {
      console.error('Erro ao excluir receita:', error);
      toast.error('Erro ao excluir', 'Não foi possível excluir a receita. Tente novamente.');
    } finally {
      setDeleting(false);
    }
  };

  const cancelDelete = () => {
    setDeleteId(null);
  };

  const handleSubmit = async (receitaData: Omit<Receita, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (editingReceita) {
        await receitasService.update(editingReceita.id, receitaData);
        toast.success('Receita atualizada', 'As alterações foram salvas com sucesso.');
      } else {
        await receitasService.create(receitaData);
        toast.success('Receita criada', 'A nova receita foi adicionada com sucesso.');
      }
      await loadReceitas();
      setShowModal(false);
    } catch (error) {
      console.error('Erro ao salvar receita:', error);
      toast.error('Erro ao salvar', 'Não foi possível salvar a receita. Tente novamente.');
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setEditingReceita(undefined);
  };

  // Show configuration message if Supabase is not ready
  if (!isSupabaseReady()) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Configuração Necessária</h2>
        <p className="text-gray-600 mb-4">
          Para usar o sistema, você precisa configurar sua conexão com o Supabase.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left max-w-md mx-auto">
          <h3 className="font-semibold text-blue-800 mb-2">Como configurar:</h3>
          <ol className="text-sm text-blue-700 space-y-1">
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
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
      <ReceitasList
        receitas={receitas}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRefresh={loadReceitas}
      />

      <Modal
        isOpen={showModal}
        onClose={handleCancel}
        title={editingReceita ? 'Editar Receita' : 'Nova Receita'}
        maxWidth="max-w-4xl"
      >
        <ReceitaForm
          receita={editingReceita}
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
                  <h3 className="text-lg font-bold text-red-900">Excluir Receita</h3>
                </div>
              </div>

              <div className="mb-8">
                <p className="text-gray-600 leading-relaxed">
                  Tem certeza que deseja excluir esta receita? Esta ação não pode ser desfeita.
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

export default Receitas;