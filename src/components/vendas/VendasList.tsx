import React, { useState } from 'react';
import { ShoppingCart, Plus, CreditCard as Edit2, Trash2, Eye, Printer, RefreshCw, Zap } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import Modal from '../common/Modal';
import ConfirmationModal from '../common/ConfirmationModal';
import { Venda } from '../../types';
import { supabase } from '../../lib/supabase';
import { vendasService } from '../../services/vendasService';

interface VendasListProps {
  vendas: Venda[];
  onEdit: (venda: Venda) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  onAddVendaRapida: () => void;
  onRefresh?: () => void;
}

const VendasList: React.FC<VendasListProps> = ({ vendas, onEdit, onDelete, onAdd, onAddVendaRapida, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showPDV, setShowPDV] = useState(false);
  const [selectedVenda, setSelectedVenda] = useState<Venda | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [vendaToDelete, setVendaToDelete] = useState<Venda | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const filteredVendas = vendas.filter(venda =>
    venda.cliente_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    venda.id.toLowerCase().includes(searchTerm.toLowerCase())
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
      case 'em_aberto':
        return 'bg-yellow-100 text-yellow-800';
      case 'pago':
        return 'bg-blue-100 text-blue-800';
      case 'enviado':
        return 'bg-purple-100 text-purple-800';
      case 'concluido':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'em_aberto':
        return 'Em Aberto';
      case 'pago':
        return 'Pago';
      case 'enviado':
        return 'Enviado';
      case 'concluido':
        return 'Concluído';
      default:
        return status;
    }
  };

  const handlePrintPDV = (venda: Venda) => {
    setSelectedVenda(venda);
    setShowPDV(true);
  };

  const handleStatusChange = (venda: Venda) => {
    setSelectedVenda(venda);
    setShowStatusModal(true);
  };

  const handleDeleteClick = (venda: Venda) => {
    setVendaToDelete(venda);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!vendaToDelete) return;
    
    setDeleting(true);
    try {
      await onDelete(vendaToDelete.id);
      setShowDeleteModal(false);
      setVendaToDelete(null);
    } catch (error) {
      console.error('Erro ao excluir venda:', error);
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setVendaToDelete(null);
  };
  const updateStatus = async (newStatus: string) => {
    if (!selectedVenda) return;
    
    setUpdatingStatus(true);
    try {
      await vendasService.update(selectedVenda.id, { status: newStatus as any });
      setShowStatusModal(false);
      setSelectedVenda(null);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status. Tente novamente.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const printPDV = () => {
    if (!selectedVenda) return;
    
    // Buscar endereço do cliente antes de imprimir
    const buscarEnderecoEImprimir = async () => {
      let enderecoCliente = '';
      
      if (!selectedVenda.cliente_whatsapp) return '';
      
      try {
        const { data } = await supabase
          .from('clientes')
          .select('endereco_completo')
          .eq('whatsapp', selectedVenda.cliente_whatsapp)
          .single();
        
        enderecoCliente = data?.endereco_completo || '';
      } catch (error) {
        console.error('Erro ao buscar endereço:', error);
      }
      
      // Agora imprimir com o endereço
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;
      
      // Conteúdo específico para venda rápida
      const itensContent = selectedVenda.tipo_venda === 'rapida' 
        ? `<div class="item">
             <span>${selectedVenda.produto_digitado || 'Produto'}</span>
             <span>R$ ${selectedVenda.total.toFixed(2)}</span>
           </div>`
        : selectedVenda.itens.map(item => `
            <div class="item">
              <span>${item.produto?.nome || 'Produto'} (${item.quantidade}x)</span>
              <span>R$ ${item.subtotal.toFixed(2)}</span>
            </div>
          `).join('');

      const printContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>PDV - Venda ${selectedVenda.numero_venda}</title>
            <style>
              body { font-family: 'Courier New', monospace; font-size: 12px; margin: 20px; }
              .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px; }
              .section { margin-bottom: 15px; }
              .item { display: flex; justify-content: space-between; margin-bottom: 5px; }
              .total { border-top: 2px solid #000; padding-top: 10px; font-weight: bold; }
              .footer { text-align: center; margin-top: 20px; border-top: 1px solid #000; padding-top: 10px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h2>DELICIAS DA DRI</h2>
              <p>Comprovante de Venda</p>
              <p><strong>Venda Nº: ${selectedVenda.numero_venda}</strong></p>
              <p><strong>Tipo: ${selectedVenda.tipo_venda === 'rapida' ? 'Venda Rápida' : selectedVenda.tipo_cliente}</strong></p>
            </div>
            
            <div class="section">
              <h3>DADOS DO CLIENTE</h3>
              <p><strong>Nome:</strong> ${selectedVenda.cliente_nome || 'Não informado'}</p>
              <p><strong>WhatsApp:</strong> ${selectedVenda.cliente_whatsapp || 'Não informado'}</p>
              ${enderecoCliente ? `<p><strong>Endereço:</strong> ${enderecoCliente}</p>` : ''}
            </div>
            
            <div class="section">
              <h3>ITENS</h3>
              ${itensContent}
            </div>
            
            <div class="section">
              ${selectedVenda.tipo_venda !== 'rapida' ? `
                <div class="item">
                  <span>Subtotal:</span>
                  <span>R$ ${selectedVenda.subtotal.toFixed(2)}</span>
                </div>
                <div class="item">
                  <span>Frete:</span>
                  <span>R$ ${selectedVenda.frete.toFixed(2)}</span>
                </div>
                <div class="item">
                  <span>Desconto:</span>
                  <span>R$ ${selectedVenda.desconto.toFixed(2)}</span>
                </div>
              ` : ''}
              <div class="item total">
                <span>TOTAL:</span>
                <span>R$ ${selectedVenda.total.toFixed(2)}</span>
              </div>
            </div>
            
            <div class="section">
              <p><strong>Forma de Pagamento:</strong> ${selectedVenda.forma_pagamento || 'PIX'}</p>
              <p><strong>Status:</strong> ${getStatusLabel(selectedVenda.status)}</p>
              <p><strong>Data:</strong> ${new Date(selectedVenda.data_venda).toLocaleDateString('pt-BR')}</p>
              <p><strong>Origem:</strong> ${selectedVenda.origem_venda || 'Presencial'}</p>
            </div>
            
            <div class="footer">
              <p>Obrigado pela preferência!</p>
              <p>Data/Hora: ${new Date().toLocaleString('pt-BR')}</p>
            </div>
          </body>
        </html>
      `;
      
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
      printWindow.close();
    };
    
    // Executar busca e impressão
    buscarEnderecoEImprimir();
    setShowPDV(false);
    setSelectedVenda(null);
  };
  return (
    <>
      <Card 
        title="Lista de Vendas" 
        icon={<ShoppingCart className="w-5 h-5 text-orange-500" />}
      >
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar vendas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <div className="flex space-x-2">
            <Button onClick={onAddVendaRapida} variant="secondary" className="whitespace-nowrap">
              <Zap className="w-4 h-4" />
              <span>Venda Rápida</span>
            </Button>
            <Button onClick={onAdd} className="whitespace-nowrap">
              <Plus className="w-4 h-4" />
              <span>Nova Venda</span>
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2 font-semibold text-gray-700">ID / Cliente</th>
                <th className="text-left py-3 px-2 font-semibold text-gray-700">Data</th>
                <th className="text-center py-3 px-2 font-semibold text-gray-700">Tipo</th>
                <th className="text-right py-3 px-2 font-semibold text-gray-700">Total</th>
                <th className="text-center py-3 px-2 font-semibold text-gray-700">Status</th>
                <th className="text-center py-3 px-2 font-semibold text-gray-700">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredVendas.length > 0 ? (
                filteredVendas.map((venda) => (
                  <tr key={venda.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-2">
                      <div className="font-bold text-orange-600 text-sm">
                        Venda {venda.numero_venda}
                      </div>
                      <div className="font-medium text-gray-800">
                        {venda.cliente_nome || 'Cliente não informado'}
                      </div>
                      {venda.cliente_whatsapp && (
                        <div className="text-sm text-gray-600">{venda.cliente_whatsapp}</div>
                      )}
                    </td>
                    <td className="py-3 px-2 text-gray-600">
                      {formatDate(venda.data_venda)}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        venda.tipo_venda === 'rapida' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : venda.tipo_cliente === 'Revendedor'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {venda.tipo_venda === 'rapida' ? 'Rápida' : venda.tipo_cliente}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right font-medium text-gray-800">
                      {formatCurrency(venda.total)}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <button
                        onClick={() => handleStatusChange(venda)}
                        className={`px-2 py-1 rounded-full text-xs font-medium hover:opacity-80 transition-opacity ${getStatusColor(venda.status)}`}
                        title="Clique para alterar status"
                      >
                        {getStatusLabel(venda.status)}
                      </button>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex justify-center space-x-1">
                        <button
                          onClick={() => handlePrintPDV(venda)}
                          className="text-gray-600 hover:text-green-600 transition-colors p-1"
                          title="Imprimir PDV"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleStatusChange(venda)}
                          className="text-gray-600 hover:text-orange-600 transition-colors p-1"
                          title="Alterar status"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEdit(venda)}
                          className="text-gray-600 hover:text-blue-600 transition-colors p-1"
                          title="Editar venda"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(venda)}
                          className="text-gray-600 hover:text-red-600 transition-colors p-1"
                          title="Excluir venda"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    {searchTerm ? 'Nenhuma venda encontrada' : 'Nenhuma venda cadastrada ainda'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal de Alteração de Status */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title="Alterar Status da Venda"
        maxWidth="max-w-md"
      >
        {selectedVenda && (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-800">
                Venda {selectedVenda.numero_venda}
              </p>
              <p className="text-sm text-gray-600">
                {selectedVenda.cliente_nome || 'Cliente não informado'}
              </p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Selecione o novo status:</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'em_aberto', label: 'Em Aberto', color: 'bg-yellow-100 text-yellow-800' },
                  { value: 'pago', label: 'Pago', color: 'bg-blue-100 text-blue-800' },
                  { value: 'enviado', label: 'Enviado', color: 'bg-purple-100 text-purple-800' },
                  { value: 'concluido', label: 'Concluído', color: 'bg-green-100 text-green-800' }
                ].map((status) => (
                  <button
                    key={status.value}
                    onClick={() => updateStatus(status.value)}
                    disabled={updatingStatus || selectedVenda.status === status.value}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedVenda.status === status.value
                        ? 'border-gray-400 opacity-50 cursor-not-allowed'
                        : 'border-gray-200 hover:border-orange-300 hover:shadow-md'
                    } ${status.color}`}
                  >
                    {status.label}
                    {selectedVenda.status === status.value && (
                      <div className="text-xs mt-1">Status atual</div>
                    )}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button 
                variant="secondary" 
                onClick={() => setShowStatusModal(false)}
                disabled={updatingStatus}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de Confirmação de Impressão PDV */}
      <Modal
        isOpen={showPDV}
        onClose={() => setShowPDV(false)}
        title="Imprimir Comprovante PDV"
        maxWidth="max-w-md"
      >
        {selectedVenda && (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-800">
                Venda: {selectedVenda.numero_venda}
              </p>
              <p className="text-sm text-gray-600">
                {selectedVenda.cliente_nome || 'Cliente não informado'}
              </p>
              <p className="text-lg font-bold text-green-600 mt-2">
                {formatCurrency(selectedVenda.total)}
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">O comprovante será impresso com:</p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Dados da empresa</li>
                <li>• Informações do cliente</li>
                <li>• Lista de produtos</li>
                <li>• Valores e totais</li>
                <li>• Status e forma de pagamento</li>
              </ul>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button 
                variant="secondary" 
                onClick={() => setShowPDV(false)}
              >
                Cancelar
              </Button>
              <Button onClick={printPDV}>
                <Printer className="w-4 h-4" />
                <span>Imprimir</span>
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Excluir Venda"
        message={`Tem certeza que deseja excluir a venda ${vendaToDelete?.numero_venda}? Esta ação não pode ser desfeita e todos os dados relacionados serão perdidos.`}
        confirmText="Excluir Venda"
        cancelText="Cancelar"
        type="danger"
        loading={deleting}
      />
    </>
  );
};

export default VendasList;