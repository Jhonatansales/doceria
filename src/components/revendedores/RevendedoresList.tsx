import React, { useState, useEffect } from 'react';
import { UserCheck, Plus, CreditCard as Edit2, Trash2, Phone, ShoppingBag } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import { Revendedor } from '../../types';

interface RevendedoresListProps {
  revendedores: Revendedor[];
  onEdit: (revendedor: Revendedor) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

const RevendedoresList: React.FC<RevendedoresListProps> = ({ revendedores, onEdit, onDelete, onAdd }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [vendasPorRevendedor, setVendasPorRevendedor] = useState<Record<string, any[]>>({});
  const [expandedRevendedor, setExpandedRevendedor] = useState<string | null>(null);

  useEffect(() => {
    loadVendasRevendedores();
  }, [revendedores]);

  const loadVendasRevendedores = async () => {
    const { revendedoresService } = await import('../../services/revendedoresService');
    const vendasMap: Record<string, any[]> = {};

    for (const rev of revendedores) {
      const vendas = await revendedoresService.getVendasRevendedor(rev.id);
      vendasMap[rev.id] = vendas;
    }

    setVendasPorRevendedor(vendasMap);
  };

  const filteredRevendedores = revendedores.filter(revendedor =>
    revendedor.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    revendedor.contato.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const toggleHistorico = (revendedorId: string) => {
    setExpandedRevendedor(expandedRevendedor === revendedorId ? null : revendedorId);
  };

  return (
    <Card 
      title="Gestão de Revendedores" 
      icon={<UserCheck className="w-5 h-5 text-pink-500" />}
    >
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar revendedores..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-pink-50 focus:bg-white transition-colors"
          />
        </div>
        <Button onClick={onAdd} className="whitespace-nowrap">
          <Plus className="w-4 h-4" />
          <span>Novo Revendedor</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRevendedores.length > 0 ? (
          filteredRevendedores.map((revendedor) => (
            <div key={revendedor.id} className="bg-gradient-to-br from-pink-25 to-rose-25 border border-pink-100 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 mb-2 font-serif">{revendedor.nome}</h3>
                  <div className="flex items-center text-sm text-pink-600">
                    <Phone className="w-4 h-4 mr-2" />
                    <span>{revendedor.contato}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => onEdit(revendedor)}
                    className="text-gray-600 hover:text-pink-600 transition-colors p-2 hover:bg-pink-50 rounded-lg"
                    title="Editar revendedor"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(revendedor.id)}
                    className="text-gray-600 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-lg"
                    title="Excluir revendedor"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-white rounded-lg p-4 border border-pink-100">
                  <div className="text-xs text-gray-500 mb-1">Cadastrado em:</div>
                  <div className="text-sm text-gray-700">
                    {revendedor.created_at ? new Date(revendedor.created_at).toLocaleDateString('pt-BR') : 'N/A'}
                  </div>
                </div>

                <button
                  onClick={() => toggleHistorico(revendedor.id)}
                  className="w-full bg-pink-50 hover:bg-pink-100 text-pink-700 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Ver Histórico ({vendasPorRevendedor[revendedor.id]?.length || 0})</span>
                </button>

                {expandedRevendedor === revendedor.id && (
                  <div className="bg-white rounded-lg p-4 border border-pink-100 max-h-64 overflow-y-auto">
                    <h4 className="font-semibold text-gray-800 mb-3">Histórico de Vendas</h4>
                    {vendasPorRevendedor[revendedor.id]?.length > 0 ? (
                      <div className="space-y-2">
                        {vendasPorRevendedor[revendedor.id].map((venda: any) => (
                          <div key={venda.id} className="border-b border-pink-100 pb-2 last:border-0">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="text-sm font-medium text-gray-800">
                                  {venda.tipo_venda === 'rapida' ? 'Venda Rápida' : 'Venda Normal'}
                                </div>
                                <div className="text-xs text-gray-600">
                                  {venda.produto_digitado || venda.venda_itens?.map((i: any) => i.produtos?.nome).join(', ') || 'Sem produtos'}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {new Date(venda.data_venda).toLocaleDateString('pt-BR')}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-semibold text-green-600">
                                  {formatCurrency(venda.total)}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {venda.status_pagamento}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-2">Nenhuma venda registrada</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <UserCheck className="w-16 h-16 text-pink-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              {searchTerm ? 'Nenhum revendedor encontrado' : 'Nenhum revendedor cadastrado'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ? 'Tente ajustar sua busca' : 'Comece adicionando seu primeiro revendedor'}
            </p>
            {!searchTerm && (
              <Button onClick={onAdd}>
                <Plus className="w-4 h-4" />
                <span>Adicionar Revendedor</span>
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default RevendedoresList;