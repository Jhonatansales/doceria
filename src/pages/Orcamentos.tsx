import React, { useState, useEffect } from 'react';
import OrcamentosList from '../components/orcamentos/OrcamentosList';
import OrcamentoForm from '../components/orcamentos/OrcamentoForm';
import OrcamentoRevendedorForm from '../components/orcamentos/OrcamentoRevendedorForm';
import OrcamentoView from '../components/orcamentos/OrcamentoView';
import Modal from '../components/common/Modal';
import SuccessModal from '../components/common/SuccessModal';
import ToastContainer from '../components/common/ToastContainer';
import { useToast } from '../hooks/useToast';
import { isSupabaseReady } from '../lib/supabase';
import { Orcamento } from '../types';
import { orcamentosService } from '../services/orcamentosService';

const Orcamentos: React.FC = () => {
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showRevendedorModal, setShowRevendedorModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [editingOrcamento, setEditingOrcamento] = useState<Orcamento | undefined>();
  const [viewingOrcamento, setViewingOrcamento] = useState<Orcamento | undefined>();
  const { toasts, removeToast, success, error: showError } = useToast();

  useEffect(() => {
    loadOrcamentos();
  }, []);

  const loadOrcamentos = async () => {
    try {
      setError(null);
      const data = await orcamentosService.getAll();
      setOrcamentos(data);
    } catch (error) {
      console.error('Erro ao carregar orçamentos:', error);
      setError('Erro ao carregar orçamentos. Verifique sua conexão com o banco de dados.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingOrcamento(undefined);
    setShowModal(true);
  };

  const handleAddRevendedor = () => {
    setEditingOrcamento(undefined);
    setShowRevendedorModal(true);
  };

  const handleEdit = (orcamento: Orcamento) => {
    setEditingOrcamento(orcamento);
    if (orcamento.tipo_orcamento === 'revendedor') {
      setShowRevendedorModal(true);
    } else {
      setShowModal(true);
    }
  };

  const handleView = (orcamento: Orcamento) => {
    setViewingOrcamento(orcamento);
    setShowViewModal(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await orcamentosService.delete(id);
      await loadOrcamentos();
      success('Orçamento excluído', 'O orçamento foi excluído com sucesso.');
    } catch (error) {
      console.error('Erro ao excluir orçamento:', error);
      showError('Erro ao excluir', 'Não foi possível excluir o orçamento. Tente novamente.');
    }
  };

  const handleSubmit = async (orcamentoData: Omit<Orcamento, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const isEditing = !!editingOrcamento;
      if (editingOrcamento) {
        await orcamentosService.update(editingOrcamento.id, orcamentoData);
      } else {
        await orcamentosService.create(orcamentoData);
      }
      await loadOrcamentos();
      setShowModal(false);
      setShowRevendedorModal(false);

      setSuccessMessage(
        isEditing
          ? 'Orçamento atualizado com sucesso!'
          : 'Orçamento criado com sucesso!'
      );
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Erro ao salvar orçamento:', error);
      showError('Erro ao salvar', 'Não foi possível salvar o orçamento. Tente novamente.');
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setShowRevendedorModal(false);
    setEditingOrcamento(undefined);
  };

  const handleCloseView = () => {
    setShowViewModal(false);
    setViewingOrcamento(undefined);
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
      <OrcamentosList
        orcamentos={orcamentos}
        onAdd={handleAdd}
        onAddRevendedor={handleAddRevendedor}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
      />

      <Modal
        isOpen={showModal}
        onClose={handleCancel}
        title={editingOrcamento ? 'Editar Orçamento' : 'Novo Orçamento - Cliente Final'}
        maxWidth="max-w-4xl"
      >
        <OrcamentoForm
          orcamento={editingOrcamento}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </Modal>

      <Modal
        isOpen={showRevendedorModal}
        onClose={handleCancel}
        title={editingOrcamento ? 'Editar Orçamento' : 'Novo Orçamento - Revendedor'}
        maxWidth="max-w-4xl"
      >
        <OrcamentoRevendedorForm
          orcamento={editingOrcamento}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </Modal>

      <Modal
        isOpen={showViewModal}
        onClose={handleCloseView}
        title="Visualizar Orçamento"
        maxWidth="max-w-4xl"
      >
        {viewingOrcamento && (
          <OrcamentoView
            orcamento={viewingOrcamento}
            onClose={handleCloseView}
            onRefresh={loadOrcamentos}
          />
        )}
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

export default Orcamentos;