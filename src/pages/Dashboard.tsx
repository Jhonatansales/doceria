import React, { useState, useEffect } from 'react';
import DashboardCards from '../components/dashboard/DashboardCards';
import ProductChart from '../components/dashboard/ProductChart';
import { DashboardMetrics, Venda } from '../types';
import { dashboardService } from '../services/dashboardService';
import { vendasService } from '../services/vendasService';

const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    faturamento_dia: 0,
    faturamento_mes: 0,
    lucro_bruto: 0,
    total_gastos: 0,
    lucro_liquido: 0,
    pedidos_dia: 0,
    produtos_mais_vendidos: [],
    ultimas_atividades: [],
    alertas_clientes: []
  });
  
  const [contasReceber, setContasReceber] = useState<Venda[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
    loadContasReceber();

    const interval = setInterval(() => {
      loadMetrics();
      loadContasReceber();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const loadMetrics = async () => {
    try {
      const data = await dashboardService.getMetrics();
      setMetrics(data);
    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadContasReceber = async () => {
    try {
      const vendas = await vendasService.getAll();
      const vendasAPrazo = vendas.filter(v => 
        v.forma_pagamento === 'A Prazo' && v.status_pagamento === 'Pendente'
      );
      setContasReceber(vendasAPrazo);
    } catch (error) {
      console.error('Erro ao carregar contas a receber:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardCards metrics={metrics} contasReceber={contasReceber} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ProductChart metrics={metrics} />
        
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg border border-pink-100 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 font-serif">Meta de Lucro</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Meta Mensal:</span>
                <span className="font-semibold">R$ 10.000,00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Alcançado:</span>
                <span className="font-semibold text-green-600">
                  R$ {metrics.lucro_liquido.toFixed(2)}
                </span>
              </div>
              <div className="w-full bg-pink-100 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-pink-400 to-rose-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((metrics.lucro_liquido / 10000) * 100, 100)}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600">
                {((metrics.lucro_liquido / 10000) * 100).toFixed(1)}% da meta alcançada
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-pink-500 to-rose-600 rounded-xl shadow-xl p-6 text-white">
            <h3 className="text-lg font-bold mb-2 font-serif">Resumo Rápido</h3>
            <div className="space-y-2 text-sm">
              <p>• {metrics.pedidos_dia} pedidos hoje</p>
              <p>• {metrics.produtos_mais_vendidos.length} produtos em destaque</p>
              <p>• {contasReceber.length} vendas a prazo pendentes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;