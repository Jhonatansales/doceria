import React, { useState } from 'react';
import { CreditCard as Edit, Trash2, Package, DollarSign, Play, Plus } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import { Receita } from '../../types';
import { receitasService } from '../../services/receitasService';
import ToastContainer from '../common/ToastContainer';
import { useToast } from '../../hooks/useToast';

interface ReceitasListProps {
  receitas: Receita[];
  onEdit: (receita: Receita) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  onRefresh?: () => void;
}

const ReceitasList: React.FC<ReceitasListProps> = ({ receitas, onEdit, onDelete, onAdd, onRefresh }) => {
  const [showProducaoModal, setShowProducaoModal] = useState(false);
  const [receitaProducao, setReceitaProducao] = useState<Receita | null>(null);
  const [quantidadeLotes, setQuantidadeLotes] = useState('1');
  const [produzindo, setProduzindo] = useState(false);
  const toast = useToast();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleProduzir = (receita: Receita) => {
    setReceitaProducao(receita);
    setQuantidadeLotes('1');
    setShowProducaoModal(true);
  };

  const confirmarProducao = async () => {
    if (!receitaProducao) return;

    const qtd = Number(quantidadeLotes);
    if (isNaN(qtd) || qtd <= 0) {
      toast.error('Quantidade inválida', 'Por favor, informe uma quantidade válida.');
      return;
    }

    setProduzindo(true);
    try {
      await receitasService.produzirReceita(receitaProducao.id, qtd);
      toast.success('Produção registrada', `${qtd} lote(s) de "${receitaProducao.nome}" produzido(s) com sucesso!`);
      if (onRefresh) onRefresh();
      setShowProducaoModal(false);
      setReceitaProducao(null);
    } catch (error) {
      console.error('Erro ao produzir receita:', error);
      toast.error('Erro na produção', error instanceof Error ? error.message : 'Erro ao produzir receita');
    } finally {
      setProduzindo(false);
    }
  };

  const cancelarProducao = () => {
    setShowProducaoModal(false);
    setReceitaProducao(null);
    setQuantidadeLotes('1');
  };

  if (receitas.length === 0) {
    return (
      <Card 
        title="Receitas para Produção" 
        icon={<Package className="w-5 h-5 text-orange-500" />}
      >
        <div className="flex justify-end mb-4">
          <Button onClick={onAdd}>
            <Plus className="w-4 h-4" />
            <span>Nova Receita</span>
          </Button>
        </div>
        <div className="text-center py-8">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Nenhuma receita cadastrada</p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card 
      title="Receitas para Produção" 
      icon={<Package className="w-5 h-5 text-orange-500" />}
    >
      <div className="flex justify-end mb-6">
        <Button onClick={onAdd}>
          <Plus className="w-4 h-4" />
          <span>Nova Receita</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {receitas.map((receita) => (
          <div key={receita.id} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-800 mb-1">{receita.nome}</h3>
                  <p className="text-sm text-gray-600">Rendimento: {receita.rendimento}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleProduzir(receita)}
                    className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                    title="Produzir receita"
                  >
                    <Play className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onEdit(receita)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Editar receita"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(receita.id)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Excluir receita"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-25 to-yellow-25 rounded-lg p-4 border border-orange-100">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-gray-600 mb-1">Custo Total</div>
                    <div className="font-semibold text-gray-800">{formatCurrency(receita.custo_total)}</div>
                  </div>
                  <div>
                    <div className="text-gray-600 mb-1">Margem</div>
                    <div className="font-semibold text-orange-600">{receita.margem_lucro || 0}%</div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Preço de Venda:</span>
                  <span className="font-medium text-green-600">{formatCurrency(receita.preco_venda || 0)}</span>
                </div>
                {(receita.preco_revenda || 0) > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Preço Revenda:</span>
                    <span className="font-medium text-blue-600">{formatCurrency(receita.preco_revenda || 0)}</span>
                  </div>
                )}
              </div>

              <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Estoque Produzido:</span>
                  <span className="text-lg font-bold text-green-600">
                    {receita.estoque_produto_final || 0} lotes
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {receita.created_at ? `Criado em ${new Date(receita.created_at).toLocaleDateString('pt-BR')}` : ''}
                  </span>
                  <div className="flex items-center space-x-1">
                    <DollarSign className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium text-green-600">
                      Lucro: {formatCurrency((receita.preco_venda || 0) - receita.custo_total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>

      {showProducaoModal && receitaProducao && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all">
            <div className="p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <Play className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-green-900">Produzir Receita</h3>
                  <p className="text-sm text-gray-600">{receitaProducao.nome}</p>
                </div>
              </div>

              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantidade de lotes
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantidadeLotes}
                  onChange={(e) => setQuantidadeLotes(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Ex: 1"
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-2">
                  Rendimento por lote: {receitaProducao.rendimento}
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={cancelarProducao}
                  disabled={produzindo}
                  className="px-6 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarProducao}
                  disabled={produzindo}
                  className="px-6 py-2.5 text-white bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {produzindo ? 'Produzindo...' : 'Confirmar Produção'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastContainer toasts={toast.toasts} onRemoveToast={toast.removeToast} />
    </>
  );
};

export default ReceitasList;