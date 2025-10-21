import React, { useState, useEffect } from 'react';
import GastosList from '../components/gastos/GastosList';
import GastoForm from '../components/gastos/GastoForm';
import BalancoModal from '../components/gastos/BalancoModal';
import Modal from '../components/common/Modal';
import SuccessModal from '../components/common/SuccessModal';
import ToastContainer from '../components/common/ToastContainer';
import { useToast } from '../hooks/useToast';
import { isSupabaseReady, supabase } from '../lib/supabase';
import { Gasto } from '../types';
import { gastosService } from '../services/gastosService';

const Gastos: React.FC = () => {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showBalancoModal, setShowBalancoModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [editingGasto, setEditingGasto] = useState<Gasto | undefined>();
  const [valorEmCaixa, setValorEmCaixa] = useState(0);
  const { toasts, removeToast, success, error: showError } = useToast();

  useEffect(() => {
    loadGastos();
  }, []);

  const loadGastos = async () => {
    try {
      setError(null);
      const data = await gastosService.getAll();
      setGastos(data);
    } catch (error) {
      console.error('Erro ao carregar gastos:', error);
      setError('Erro ao carregar gastos. Verifique sua conexão com o banco de dados.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingGasto(undefined);
    setShowModal(true);
  };

  const handleEdit = (gasto: Gasto) => {
    setEditingGasto(gasto);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await gastosService.delete(id);
      await loadGastos();
      success('Gasto excluído', 'O gasto foi excluído com sucesso.');
    } catch (error) {
      console.error('Erro ao excluir gasto:', error);
      showError('Erro ao excluir', 'Não foi possível excluir o gasto. Tente novamente.');
    }
  };

  const handleSubmit = async (gastoData: Omit<Gasto, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const isEditing = !!editingGasto;
      if (editingGasto) {
        await gastosService.update(editingGasto.id, gastoData);
      } else {
        await gastosService.create(gastoData);
      }
      await loadGastos();
      setShowModal(false);
      
      setSuccessMessage(
        isEditing 
          ? 'Gasto atualizado com sucesso!' 
          : 'Gasto cadastrado com sucesso!'
      );
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Erro ao salvar gasto:', error);
      showError('Erro ao salvar', 'Não foi possível salvar o gasto. Tente novamente.');
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setEditingGasto(undefined);
  };

  const handleBalanco = async () => {
    try {
      const hoje = new Date().toISOString().split('T')[0];
      const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

      const { data: vendas } = await supabase
        .from('vendas')
        .select('total')
        .gte('data_venda', inicioMes)
        .eq('status', 'concluido');

      const { data: gastos } = await supabase
        .from('gastos')
        .select('valor')
        .gte('data_vencimento', inicioMes)
        .eq('status', 'pago');

      const totalVendas = (vendas || []).reduce((sum, v) => sum + v.total, 0);
      const totalGastos = (gastos || []).reduce((sum, g) => sum + g.valor, 0);

      setValorEmCaixa(totalVendas - totalGastos);
      setShowBalancoModal(true);
    } catch (error) {
      console.error('Erro ao calcular balanço:', error);
      showError('Erro ao calcular balanço', 'Não foi possível calcular o valor em caixa.');
    }
  };

  const handleAjustarBalanco = async (valorReal: number, motivo: string) => {
    try {
      const diferenca = valorReal - valorEmCaixa;

      if (diferenca !== 0) {
        const gastoAjuste = {
          descricao: `Ajuste de balanço: ${motivo}`,
          valor: Math.abs(diferenca),
          data_vencimento: new Date().toISOString().split('T')[0],
          categoria: diferenca > 0 ? 'Outros' : 'Ajuste de Caixa',
          status: 'pago' as const
        };

        await gastosService.create(gastoAjuste);
        await loadGastos();

        setSuccessMessage(
          `Balanço ajustado com sucesso! ${diferenca > 0 ? 'Entrada' : 'Saída'} de ${Math.abs(diferenca).toFixed(2)}`
        );
        setShowSuccessModal(true);
      }

      setShowBalancoModal(false);
    } catch (error) {
      console.error('Erro ao ajustar balanço:', error);
      showError('Erro ao ajustar', 'Não foi possível ajustar o balanço. Tente novamente.');
    }
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
      <GastosList
        gastos={gastos}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onBalanco={handleBalanco}
      />

      <Modal
        isOpen={showModal}
        onClose={handleCancel}
        title={editingGasto ? 'Editar Gasto' : 'Novo Gasto'}
        maxWidth="max-w-2xl"
      >
        <GastoForm
          gasto={editingGasto}
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

      <BalancoModal
        isOpen={showBalancoModal}
        onClose={() => setShowBalancoModal(false)}
        valorSistema={valorEmCaixa}
        onAjustar={handleAjustarBalanco}
      />

      <ToastContainer
        toasts={toasts}
        onRemoveToast={removeToast}
      />
    </div>
  );
};

export default Gastos;