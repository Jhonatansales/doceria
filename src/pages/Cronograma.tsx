import React, { useState, useEffect } from 'react';
import CronogramaWeek from '../components/cronograma/CronogramaWeek';
import CronogramaForm from '../components/cronograma/CronogramaForm';
import Modal from '../components/common/Modal';
import ToastContainer from '../components/common/ToastContainer';
import { useToast } from '../hooks/useToast';
import { isSupabaseReady } from '../lib/supabase';
import { CronogramaItem } from '../types';
import { cronogramaService } from '../services/cronogramaService';

const Cronograma: React.FC = () => {
  const [itens, setItens] = useState<CronogramaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    loadCronograma();
  }, [currentWeek]);

  const loadCronograma = async () => {
    try {
      setError(null);
      const startOfWeek = getStartOfWeek(currentWeek);
      const endOfWeek = getEndOfWeek(currentWeek);
      
      const data = await cronogramaService.getByWeek(
        startOfWeek.toISOString().split('T')[0],
        endOfWeek.toISOString().split('T')[0]
      );
      setItens(data);
    } catch (error) {
      console.error('Erro ao carregar cronograma:', error);
      setError('Erro ao carregar cronograma. Verifique sua conexão com o banco de dados.');
    } finally {
      setLoading(false);
    }
  };

  const getStartOfWeek = (date: Date) => {
    const start = new Date(date);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(start.setDate(diff));
  };

  const getEndOfWeek = (date: Date) => {
    const end = getStartOfWeek(date);
    return new Date(end.setDate(end.getDate() + 6));
  };

  const handleAddItem = (date: string) => {
    setSelectedDate(date);
    setShowModal(true);
  };

  const handleSubmit = async (itemData: Omit<CronogramaItem, 'id' | 'created_at'>) => {
    try {
      await cronogramaService.create({
        ...itemData,
        data_producao: selectedDate
      });
      toast.success('Item agendado', 'O item foi adicionado ao cronograma com sucesso.');
      await loadCronograma();
      setShowModal(false);
    } catch (error) {
      console.error('Erro ao salvar item do cronograma:', error);
      toast.error('Erro ao salvar', 'Não foi possível salvar o item. Tente novamente.');
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setSelectedDate('');
  };

  const handleStatusChange = async (id: string, status: 'pendente' | 'em_producao' | 'concluido') => {
    try {
      await cronogramaService.update(id, { status });
      toast.success('Status atualizado', 'O status do item foi alterado com sucesso.');
      await loadCronograma();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar', 'Não foi possível atualizar o status. Tente novamente.');
    }
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    setDeleting(true);
    try {
      await cronogramaService.delete(deleteId);
      toast.success('Item excluído', 'O item foi removido do cronograma.');
      await loadCronograma();
      setDeleteId(null);
    } catch (error) {
      console.error('Erro ao excluir item:', error);
      toast.error('Erro ao excluir', 'Não foi possível excluir o item. Tente novamente.');
    } finally {
      setDeleting(false);
    }
  };

  const cancelDelete = () => {
    setDeleteId(null);
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
      <CronogramaWeek
        itens={itens}
        currentWeek={currentWeek}
        onWeekChange={setCurrentWeek}
        onAddItem={handleAddItem}
        onStatusChange={handleStatusChange}
        onDelete={handleDelete}
      />

      <Modal
        isOpen={showModal}
        onClose={handleCancel}
        title="Agendar Produção"
        maxWidth="max-w-md"
      >
        <CronogramaForm
          selectedDate={selectedDate}
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
                  <h3 className="text-lg font-bold text-red-900">Excluir Item</h3>
                </div>
              </div>

              <div className="mb-8">
                <p className="text-gray-600 leading-relaxed">
                  Tem certeza que deseja excluir este item do cronograma? Esta ação não pode ser desfeita.
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

export default Cronograma;