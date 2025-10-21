import React, { useState, useEffect } from 'react';
import VendasList from '../components/vendas/VendasList';
import VendaForm from '../components/vendas/VendaForm';
import VendaRapidaForm from '../components/vendas/VendaRapidaForm';
import Modal from '../components/common/Modal';
import SuccessModal from '../components/common/SuccessModal';
import ToastContainer from '../components/common/ToastContainer';
import { useToast } from '../hooks/useToast';
import { isSupabaseReady } from '../lib/supabase';
import { Venda, VendaRapida } from '../types';
import { vendasService } from '../services/vendasService';

const Vendas: React.FC = () => {
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showVendaRapidaModal, setShowVendaRapidaModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [editingVenda, setEditingVenda] = useState<Venda | undefined>();
  const { toasts, removeToast, success, error: showError } = useToast();

  useEffect(() => {
    loadVendas();
  }, []);

  const loadVendas = async () => {
    try {
      setError(null);
      const data = await vendasService.getAll();
      setVendas(data);
    } catch (error) {
      console.error('Erro ao carregar vendas:', error);
      setError('Erro ao carregar vendas. Verifique sua conexão com o banco de dados.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingVenda(undefined);
    setShowModal(true);
  };

  const handleAddVendaRapida = () => {
    setShowVendaRapidaModal(true);
  };

  const handleEdit = (venda: Venda) => {
    setEditingVenda(venda);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await vendasService.delete(id);
      await loadVendas();
      success('Venda excluída', 'A venda foi excluída com sucesso.');
    } catch (error) {
      console.error('Erro ao excluir venda:', error);
      showError('Erro ao excluir', 'Não foi possível excluir a venda. Tente novamente.');
    }
  };

  const handleSubmit = async (vendaData: Omit<Venda, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const isEditing = !!editingVenda;
      if (editingVenda) {
        await vendasService.update(editingVenda.id, vendaData);
      } else {
        await vendasService.create(vendaData);
      }
      await loadVendas();
      setShowModal(false);
      
      setSuccessMessage(
        isEditing 
          ? 'Venda atualizada com sucesso!' 
          : 'Venda cadastrada com sucesso!'
      );
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Erro ao salvar venda:', error);
      showError('Erro ao salvar', 'Não foi possível salvar a venda. Tente novamente.');
    }
  };

  const handleSubmitVendaRapida = async (vendaRapidaData: VendaRapida & { revendedor_id?: string; origem_venda?: string }) => {
    try {
      await vendasService.createVendaRapida(vendaRapidaData);
      await loadVendas();
      setShowVendaRapidaModal(false);

      setSuccessMessage('Venda rápida registrada com sucesso!');
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Erro ao salvar venda rápida:', error);
      showError('Erro ao salvar', 'Não foi possível registrar a venda rápida. Tente novamente.');
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setEditingVenda(undefined);
  };

  const handleCancelVendaRapida = () => {
    setShowVendaRapidaModal(false);
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
      <VendasList
        vendas={vendas}
        onAdd={handleAdd}
        onAddVendaRapida={handleAddVendaRapida}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRefresh={loadVendas}
      />

      <Modal
        isOpen={showModal}
        onClose={handleCancel}
        title={editingVenda ? 'Editar Venda' : 'Nova Venda'}
        maxWidth="max-w-4xl"
      >
        <VendaForm
          venda={editingVenda}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </Modal>

      <Modal
        isOpen={showVendaRapidaModal}
        onClose={handleCancelVendaRapida}
        title="Venda Rápida"
        maxWidth="max-w-2xl"
      >
        <VendaRapidaForm
          onSubmit={handleSubmitVendaRapida}
          onCancel={handleCancelVendaRapida}
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

export default Vendas;