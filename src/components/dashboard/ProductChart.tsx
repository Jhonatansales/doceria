import React from 'react';
import Card from '../common/Card';
import { BarChart3 } from 'lucide-react';
import { DashboardMetrics } from '../../types';

interface ProductChartProps {
  metrics: DashboardMetrics;
}

const ProductChart: React.FC<ProductChartProps> = ({ metrics }) => {
  const maxValue = Math.max(...metrics.produtos_mais_vendidos.map(p => p.quantidade_vendida), 1);

  return (
    <Card 
      title="Produtos Mais Vendidos" 
      icon={<BarChart3 className="w-5 h-5 text-orange-500" />}
      className="col-span-1 lg:col-span-2"
    >
      <div className="space-y-4">
        {metrics.produtos_mais_vendidos.length > 0 ? (
          metrics.produtos_mais_vendidos.map((produto, index) => (
            <div key={index} className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-sm font-bold text-orange-600">{index + 1}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-800">{produto.produto_nome}</span>
                  <span className="text-sm text-gray-600">{produto.quantidade_vendida} unidades</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-orange-400 to-orange-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(produto.quantidade_vendida / maxValue) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-500">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(produto.receita_total)}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Nenhuma venda registrada ainda</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ProductChart;