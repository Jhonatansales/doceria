import { supabase, handleSupabaseError, isSupabaseReady } from '../lib/supabase';
import { DashboardMetrics } from '../types';
import { clientesService } from './clientesService';

export const dashboardService = {
  async getMetrics(): Promise<DashboardMetrics> {
    if (!isSupabaseReady()) {
      console.warn('Supabase not configured. Using mock data.');
      return {
        faturamento_dia: 0,
        faturamento_mes: 0,
        lucro_bruto: 0,
        total_gastos: 0,
        lucro_liquido: 0,
        pedidos_dia: 0,
        produtos_mais_vendidos: [],
        alertas_clientes: [],
        ultimas_atividades: []
      };
    }

    try {
      const agora = new Date();
      const hoje = agora.toISOString().split('T')[0];
      const anoAtual = agora.getFullYear();
      const mesAtual = agora.getMonth() + 1;
      const primeiroDiaDoMes = `${anoAtual}-${String(mesAtual).padStart(2, '0')}-01`;

      // Buscar TODAS as vendas concluídas
      const { data: todasVendas, error: errorVendas } = await supabase
        .from('vendas')
        .select('total, lucro_bruto, data_venda, tipo_cliente, status, id')
        .eq('status', 'concluido');

      if (errorVendas) throw errorVendas;

      // Filtrar vendas do dia
      const vendasHoje = (todasVendas || []).filter(v => {
        const dataVenda = new Date(v.data_venda).toISOString().split('T')[0];
        return dataVenda === hoje;
      });

      // Filtrar vendas do mês
      const vendasDoMes = (todasVendas || []).filter(v => {
        const dataVenda = new Date(v.data_venda).toISOString().split('T')[0];
        return dataVenda >= primeiroDiaDoMes;
      });

      // Vendas de revendedores do mês
      const vendasRevendedoresDoMes = vendasDoMes.filter(v => v.tipo_cliente === 'Revendedor');

      // Buscar TODOS os gastos pagos
      const { data: todosGastos, error: errorGastos } = await supabase
        .from('gastos')
        .select('valor, data_vencimento, status')
        .eq('status', 'pago');

      if (errorGastos) throw errorGastos;

      // Filtrar gastos do mês
      const gastosDoMes = (todosGastos || []).filter(g => {
        const dataGasto = new Date(g.data_vencimento).toISOString().split('T')[0];
        return dataGasto >= primeiroDiaDoMes;
      });

      // Buscar produtos mais vendidos do mês (incluindo vendas normais e rápidas)
      const { data: vendasComItens } = await supabase
        .from('vendas')
        .select(`
          total,
          data_venda,
          tipo,
          produto_digitado,
          venda_itens (
            quantidade,
            produtos (nome)
          )
        `)
        .eq('status', 'concluido');

      const produtosMap = new Map<string, { produto_nome: string; quantidade_vendida: number; receita_total: number }>();

      (vendasComItens || []).forEach(venda => {
        const dataVenda = new Date(venda.data_venda).toISOString().split('T')[0];
        if (dataVenda >= primeiroDiaDoMes) {
          // Se for venda rápida e tiver produto_digitado, adicionar ao map
          if (venda.tipo === 'rapida' && venda.produto_digitado) {
            const produtoNome = venda.produto_digitado.trim();
            const receita = Number(venda.total) || 0;

            const existing = produtosMap.get(produtoNome);
            if (existing) {
              existing.quantidade_vendida += 1;
              existing.receita_total += receita;
            } else {
              produtosMap.set(produtoNome, {
                produto_nome: produtoNome,
                quantidade_vendida: 1,
                receita_total: receita
              });
            }
          }
          // Se for venda normal com itens, processar normalmente
          else if (venda.venda_itens && venda.venda_itens.length > 0) {
            venda.venda_itens.forEach((item: any) => {
              const produtoNome = item.produtos?.nome || 'Produto Desconhecido';
              const quantidade = Number(item.quantidade) || 0;
              const receita = (Number(venda.total) || 0) / (venda.venda_itens?.length || 1);

              const existing = produtosMap.get(produtoNome);
              if (existing) {
                existing.quantidade_vendida += quantidade;
                existing.receita_total += receita;
              } else {
                produtosMap.set(produtoNome, {
                  produto_nome: produtoNome,
                  quantidade_vendida: quantidade,
                  receita_total: receita
                });
              }
            });
          }
        }
      });

      const todosProdutos = Array.from(produtosMap.values())
        .sort((a, b) => b.quantidade_vendida - a.quantidade_vendida)
        .slice(0, 10);

      // Calcular totais
      const faturamentoDia = vendasHoje.reduce((sum, v) => sum + (Number(v.total) || 0), 0);
      const faturamentoMes = vendasDoMes.reduce((sum, v) => sum + (Number(v.total) || 0), 0);
      const totalGastos = gastosDoMes.reduce((sum, g) => sum + (Number(g.valor) || 0), 0);
      const faturamentoRevendedores = vendasRevendedoresDoMes.reduce((sum, v) => sum + (Number(v.total) || 0), 0);
      const lucroRevendedores = vendasRevendedoresDoMes.reduce((sum, v) => sum + (Number(v.lucro_bruto) || 0), 0);

      // Lucro bruto total (soma de todas as vendas concluídas do mês)
      const lucroBrutoTotal = vendasDoMes.reduce((sum, v) => sum + (Number(v.lucro_bruto) || 0), 0);

      // Lucro real = Faturamento - Gastos (não usar lucro_bruto que pode estar zerado em vendas rápidas)
      const lucroReal = faturamentoMes - totalGastos;

      // Buscar alertas de clientes
      const { avisos, alertas } = await clientesService.getAlertasRetencao();
      const alertasClientes = [...avisos, ...alertas];

      // Buscar últimas atividades
      const ultimasAtividades = await this.getUltimasAtividades();

      return {
        faturamento_dia: faturamentoDia,
        faturamento_mes: faturamentoMes,
        lucro_bruto: lucroBrutoTotal,
        total_gastos: totalGastos,
        lucro_liquido: lucroReal,
        pedidos_dia: vendasHoje.length,
        produtos_mais_vendidos: todosProdutos,
        alertas_clientes: alertasClientes,
        ultimas_atividades: ultimasAtividades,
        faturamento_revendedores: faturamentoRevendedores,
        lucro_revendedores: lucroRevendedores,
        lucro_bruto_total: lucroBrutoTotal,
        lucro_real: lucroReal
      };
    } catch (error) {
      handleSupabaseError(error);
      return {
        faturamento_dia: 0,
        faturamento_mes: 0,
        lucro_bruto: 0,
        total_gastos: 0,
        lucro_liquido: 0,
        pedidos_dia: 0,
        produtos_mais_vendidos: [],
        alertas_clientes: [],
        ultimas_atividades: [],
        faturamento_revendedores: 0,
        lucro_revendedores: 0,
        lucro_bruto_total: 0,
        lucro_real: 0
      };
    }
  },

  async getUltimasAtividades() {
    if (!isSupabaseReady()) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('vendas')
        .select(`
          cliente_nome,
          data_venda,
          total,
          venda_itens (
            produtos (nome)
          )
        `)
        .not('cliente_nome', 'is', null)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      return (data || []).map(venda => ({
        cliente_nome: venda.cliente_nome,
        produto_nome: venda.venda_itens[0]?.produtos?.nome || 'Produto não identificado',
        data_compra: venda.data_venda,
        valor: venda.total
      }));
    } catch (error) {
      handleSupabaseError(error);
      return [];
    }
  },

};