import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Package, AlertTriangle, Clock, User, Phone } from 'lucide-react';
import Card from '../common/Card';
import { DashboardMetrics } from '../../types';
import { vendasService } from '../../services/vendasService';

interface DashboardCardsProps {
  metrics: DashboardMetrics;
  contasReceber?: any[];
}

const DashboardCards: React.FC<DashboardCardsProps> = ({ metrics, contasReceber = [] }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const cards = [
    {
      title: 'Faturamento do Dia',
      value: formatCurrency(metrics.faturamento_dia),
      icon: <DollarSign className="w-6 h-6 text-green-500" />,
      trend: '+12%',
      trendUp: true
    },
    {
      title: 'Faturamento do Mês',
      value: formatCurrency(metrics.faturamento_mes),
      icon: <TrendingUp className="w-6 h-6 text-blue-500" />,
      trend: '+8%',
      trendUp: true
    },
    {
      title: 'Lucro Real',
      value: formatCurrency(metrics.lucro_real),
      icon: <DollarSign className="w-6 h-6 text-green-600" />,
      trend: metrics.lucro_real >= 0 ? '+5%' : '-3%',
      trendUp: metrics.lucro_real >= 0
    },
    {
      title: 'Pedidos Hoje',
      value: metrics.pedidos_dia.toString(),
      icon: <ShoppingCart className="w-6 h-6 text-pink-500" />,
      trend: '+2',
      trendUp: true
    }
  ];

  const revendedoresCards = [
    {
      title: 'Faturamento Revendedores',
      value: formatCurrency(metrics.faturamento_revendedores || 0),
      icon: <User className="w-6 h-6 text-purple-500" />,
      description: 'Valor total das vendas para revendedores',
      trend: '+15%',
      trendUp: true
    },
    {
      title: 'Lucro com Revendedores',
      value: formatCurrency(metrics.lucro_revendedores || 0),
      icon: <TrendingUp className="w-6 h-6 text-purple-600" />,
      description: 'Lucro que a loja teve nas vendas para revendedores',
      trend: '+10%',
      trendUp: true
    }
  ];

  return (
    <>
      <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <Card key={index} className="hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold text-gray-800 mt-2">{card.value}</p>
                <div className="flex items-center mt-2">
                  {card.trendUp ? (
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm ${card.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                    {card.trend}
                  </span>
                </div>
              </div>
              <div className="p-3 bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl">
                {card.icon}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Cards de Performance de Revendedores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {revendedoresCards.map((card, index) => (
          <Card key={index} className="hover:shadow-xl transition-all duration-300 border-purple-100">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold text-gray-800 mt-2">{card.value}</p>
                {card.description && (
                  <p className="text-xs text-gray-500 mt-1">{card.description}</p>
                )}
                <div className="flex items-center mt-2">
                  {card.trendUp ? (
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm ${card.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                    {card.trend}
                  </span>
                </div>
              </div>
              <div className="p-3 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl">
                {card.icon}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Card de Destaque - Lucro Real */}
      <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 shadow-2xl">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <DollarSign className="w-8 h-8 text-white" />
            </div>
          </div>
          <h3 className="text-lg font-medium text-green-100 mb-2">💰 Lucro Real do Negócio</h3>
          <p className="text-4xl font-bold mb-2">{formatCurrency(metrics.lucro_real)}</p>
          <p className="text-green-100 text-sm">
            Lucro Bruto: {formatCurrency(metrics.lucro_bruto_total)} - Gastos: {formatCurrency(metrics.total_gastos)}
          </p>
          <div className="mt-4 bg-white bg-opacity-10 rounded-lg p-3">
            <p className="text-xs text-green-100">
              Este é o valor real que sobrou no caixa após pagar todas as despesas registradas no sistema.
            </p>
          </div>
        </div>
      </Card>

      {contasReceber.length > 0 && (
        <Card 
          title="Contas a Receber (Vendas a Prazo)" 
          icon={<Clock className="w-5 h-5 text-pink-500" />}
        >
          <div className="space-y-3">
            {contasReceber.slice(0, 5).map((venda) => (
              <div key={venda.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-pink-25 to-rose-25 rounded-lg border border-pink-100">
                <div className="flex-1">
                  <div className="font-medium text-gray-800">
                    {venda.cliente_nome || 'Cliente não informado'}
                  </div>
                  <div className="text-sm text-gray-600">
                    {new Date(venda.data_venda).toLocaleDateString('pt-BR')}
                  </div>
                </div>
                <div className="text-right mr-4">
                  <div className="font-bold text-pink-600">
                    {formatCurrency(venda.total)}
                  </div>
                </div>
                <button
                  onClick={() => marcarComoPago(venda.id)}
                  className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-sm rounded-lg transition-colors"
                >
                  Marcar como Pago
                </button>
              </div>
            ))}
            {contasReceber.length > 5 && (
              <div className="text-center text-gray-500 text-sm">
                +{contasReceber.length - 5} vendas pendentes
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
      {/* Últimas Atividades dos Clientes */}
      <div className="space-y-6">
      {metrics.ultimas_atividades.length > 0 && (
        <Card 
          title="Últimas Atividades dos Clientes" 
          icon={<User className="w-5 h-5 text-blue-500" />}
        >
          <div className="space-y-3">
            {metrics.ultimas_atividades.map((atividade, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-25 to-indigo-25 rounded-lg border border-blue-100">
                <div className="flex-1">
                  <div className="font-medium text-gray-800">
                    {atividade.cliente_nome}
                  </div>
                  <div className="text-sm text-gray-600">
                    {atividade.produto_nome} • {new Date(atividade.data_compra).toLocaleDateString('pt-BR')}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-blue-600">
                    {formatCurrency(atividade.valor)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Alertas de Retenção de Clientes */}
      {metrics.alertas_clientes.length > 0 && (
        <Card 
          title="Alertas de Retenção de Clientes" 
          icon={<AlertTriangle className="w-5 h-5 text-orange-500" />}
        >
          <div className="space-y-4">
            {/* Avisos (15-29 dias) */}
            {metrics.alertas_clientes.filter(a => a.tipo === 'aviso').length > 0 && (
              <div>
                <h4 className="font-medium text-yellow-800 mb-2 flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Atenção (15+ dias sem comprar)
                </h4>
                <div className="space-y-2">
                  {metrics.alertas_clientes
                    .filter(a => a.tipo === 'aviso')
                    .map((alerta, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="flex-1">
                          <button
                            onClick={() => window.open(`https://wa.me/55${alerta.cliente.whatsapp.replace(/\D/g, '')}`, '_blank')}
                            className="font-medium text-yellow-800 hover:underline flex items-center"
                          >
                            <Phone className="w-3 h-3 mr-1" />
                            {alerta.cliente.nome}
                          </button>
                        </div>
                        <div className="text-sm text-yellow-600">
                          {alerta.dias_sem_comprar} dias
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Alertas (30+ dias) */}
            {metrics.alertas_clientes.filter(a => a.tipo === 'alerta').length > 0 && (
              <div>
                <h4 className="font-medium text-red-800 mb-2 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Alerta (30+ dias sem comprar)
                </h4>
                <div className="space-y-2">
                  {metrics.alertas_clientes
                    .filter(a => a.tipo === 'alerta')
                    .map((alerta, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-red-50 rounded-lg border border-red-200">
                        <div className="flex-1">
                          <button
                            onClick={() => window.open(`https://wa.me/55${alerta.cliente.whatsapp.replace(/\D/g, '')}`, '_blank')}
                            className="font-medium text-red-800 hover:underline flex items-center"
                          >
                            <Phone className="w-3 h-3 mr-1" />
                            {alerta.cliente.nome}
                          </button>
                          <div className="text-xs text-red-600 mt-1">
                            💡 Oferecer desconto!
                          </div>
                        </div>
                        <div className="text-sm text-red-600">
                          {alerta.dias_sem_comprar} dias
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
    </>
  );

  async function marcarComoPago(vendaId: string) {
    try {
      await vendasService.update(vendaId, { status_pagamento: 'Pago' });
      window.location.reload(); // Recarrega para atualizar a lista
    } catch (error) {
      console.error('Erro ao marcar como pago:', error);
      alert('Erro ao marcar como pago. Tente novamente.');
    }
  }
};

export default DashboardCards;