import React, { useState } from 'react';
import { ShoppingBag, Plus, CreditCard as Edit2, Trash2, Eye, EyeOff, Package, AlertTriangle } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import { Produto } from '../../types';

interface ProdutosListProps {
  produtos: Produto[];
  onEdit: (produto: Produto) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

const ProdutosList: React.FC<ProdutosListProps> = ({ produtos, onEdit, onDelete, onAdd }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProdutos = produtos.filter(produto =>
    produto.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Card 
      title="Catálogo de Produtos" 
      icon={<ShoppingBag className="w-5 h-5 text-orange-500" />}
    >
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar produtos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
        <Button onClick={onAdd} className="whitespace-nowrap">
          <Plus className="w-4 h-4" />
          <span>Novo Produto</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProdutos.length > 0 ? (
          filteredProdutos.map((produto) => (
            <div key={produto.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              {produto.foto_url && (
                <div className="h-48 bg-gray-200 overflow-hidden">
                  <img
                    src={produto.foto_url}
                    alt={produto.nome}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              )}
              
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{produto.nome}</h3>
                    {produto.descricao && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{produto.descricao}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    {produto.ativo ? (
                      <Eye className="w-4 h-4 text-green-500" title="Produto ativo" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-gray-400" title="Produto inativo" />
                    )}
                    <button
                      onClick={() => onEdit(produto)}
                      className="text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(produto.id)}
                      className="text-gray-600 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Package className="w-4 h-4 text-blue-500 mr-1" />
                      <span className="text-sm text-gray-600">Estoque</span>
                    </div>
                    {(produto.estoque_atual || 0) <= (produto.estoque_minimo || 0) && (
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <div className="text-xs text-gray-500">Atual</div>
                      <div className={`font-semibold ${
                        (produto.estoque_atual || 0) <= (produto.estoque_minimo || 0) 
                          ? 'text-red-600' 
                          : 'text-blue-600'
                      }`}>
                        {produto.estoque_atual || 0}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Mínimo</div>
                      <div className="font-semibold text-gray-600">
                        {produto.estoque_minimo || 0}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-600 mb-1">Custo</div>
                      <div className="text-sm font-semibold text-gray-800">
                        {formatCurrency(produto.custo_producao + produto.custos_adicionais)}
                      </div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3">
                      <div className="text-xs text-gray-600 mb-1">Margem</div>
                      <div className="text-sm font-semibold text-green-600">
                        {produto.margem_lucro.toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  <div className="bg-orange-50 rounded-lg p-3">
                    <div className="text-sm text-gray-600 mb-1">Preço de Venda</div>
                    <div className="text-xl font-bold text-orange-600">
                      {formatCurrency(produto.preco_venda)}
                    </div>
                  </div>

                  {produto.preco_revenda && (
                    <div className="bg-blue-50 rounded-lg p-3">
                      <div className="text-sm text-gray-600 mb-1">Preço Revenda</div>
                      <div className="text-lg font-semibold text-blue-600">
                        {formatCurrency(produto.preco_revenda)}
                      </div>
                    </div>
                  )}

                  {produto.receita && (
                    <div className="text-xs text-gray-500 border-t pt-2">
                      <span className="font-medium">Receita:</span> {produto.receita.nome}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-8 text-gray-500">
            {searchTerm ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado ainda'}
          </div>
        )}
      </div>
    </Card>
  );
};

export default ProdutosList;