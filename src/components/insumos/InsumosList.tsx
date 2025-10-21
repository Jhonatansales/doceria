import React, { useState } from 'react';
import { Package, Plus, CreditCard as Edit2, Trash2, AlertTriangle } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import { Insumo } from '../../types';

interface InsumosListProps {
  insumos: Insumo[];
  onEdit: (insumo: Insumo) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

const InsumosList: React.FC<InsumosListProps> = ({ insumos, onEdit, onDelete, onAdd }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredInsumos = insumos.filter(insumo =>
    insumo.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Card 
      title="Lista de Insumos" 
      icon={<Package className="w-5 h-5 text-orange-500" />}
    >
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar insumos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
        <Button onClick={onAdd} className="whitespace-nowrap">
          <Plus className="w-4 h-4" />
          <span>Novo Insumo</span>
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-2 font-semibold text-gray-700">Nome</th>
              <th className="text-left py-3 px-2 font-semibold text-gray-700">Unidade</th>
              <th className="text-right py-3 px-2 font-semibold text-gray-700">Preço Compra</th>
              <th className="text-right py-3 px-2 font-semibold text-gray-700">Qtd. Compra</th>
              <th className="text-right py-3 px-2 font-semibold text-gray-700">Custo/Unidade</th>
              <th className="text-right py-3 px-2 font-semibold text-gray-700">Estoque</th>
              <th className="text-center py-3 px-2 font-semibold text-gray-700">Status</th>
              <th className="text-center py-3 px-2 font-semibold text-gray-700">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredInsumos.length > 0 ? (
              filteredInsumos.map((insumo) => (
                <tr key={insumo.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-2">
                    <div className="font-medium text-gray-800">{insumo.nome}</div>
                  </td>
                  <td className="py-3 px-2 text-gray-600">{insumo.unidade}</td>
                  <td className="py-3 px-2 text-right text-gray-800 font-medium">
                    {formatCurrency(insumo.preco_unitario || 0)}
                  </td>
                  <td className="py-3 px-2 text-right text-gray-600">
                    {(insumo.quantidade_estoque || 0).toFixed(2)}
                  </td>
                  <td className="py-3 px-2 text-right text-gray-800">
                    {insumo.quantidade_estoque > 0
                      ? formatCurrency((insumo.preco_unitario || 0) / (insumo.quantidade_estoque || 1))
                      : formatCurrency(0)
                    }
                  </td>
                  <td className="py-3 px-2 text-right">
                    <span className={`font-medium ${
                      (insumo.quantidade_estoque || 0) <= 0
                        ? 'text-red-600'
                        : 'text-gray-800'
                    }`}>
                      {(insumo.quantidade_estoque || 0).toFixed(2)} {insumo.unidade}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-center">
                    {(insumo.quantidade_estoque || 0) <= 0 ? (
                      <div className="flex items-center justify-center">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        <span className="text-xs text-red-600 ml-1">Baixo</span>
                      </div>
                    ) : (
                      <div className="w-2 h-2 bg-green-500 rounded-full mx-auto"></div>
                    )}
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => onEdit(insumo)}
                        className="text-gray-600 hover:text-blue-600 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(insumo.id)}
                        className="text-gray-600 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="text-center py-8 text-gray-500">
                  {searchTerm ? 'Nenhum insumo encontrado' : 'Nenhum insumo cadastrado ainda'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default InsumosList;