import { supabase, handleSupabaseError } from '../lib/supabase';
import { Venda, ItemVenda, Produto, VendaRapida } from '../types';
import { insumosService } from './insumosService';
import { isSupabaseReady } from '../lib/supabase';

export const vendasService = {
  async getAll(): Promise<Venda[]> {
    if (!isSupabaseReady()) {
      console.warn('Supabase not configured. Using mock data.');
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('vendas')
        .select(`
          *,
          venda_itens (
            id,
            produto_id,
            quantidade,
            preco_unitario,
            subtotal,
            produtos (
              id,
              nome,
              descricao,
              preco_venda,
              custo_producao
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(venda => ({
        ...venda,
        itens: (venda.venda_itens || []).map((item: any) => ({
          id: item.id,
          produto_id: item.produto_id,
          quantidade: item.quantidade,
          preco_unitario: item.preco_unitario,
          subtotal: item.subtotal,
          produto: item.produtos ? {
            id: item.produtos.id,
            nome: item.produtos.nome,
            descricao: item.produtos.descricao,
            preco_venda: item.produtos.preco_venda,
            custo_producao: item.produtos.custo_producao
          } : undefined
        }))
      }));
    } catch (error) {
      handleSupabaseError(error);
      return [];
    }
  },

  async create(venda: Omit<Venda, 'id' | 'created_at' | 'updated_at'>): Promise<Venda> {
    if (!isSupabaseReady()) {
      throw new Error('Supabase não está configurado. Configure suas credenciais do Supabase.');
    }

    try {
      const { count } = await supabase
        .from('vendas')
        .select('*', { count: 'exact', head: true });

      const proximoNumero = (count || 0) + 1;
      const numeroVenda = String(proximoNumero).padStart(3, '0');

      let lucroBruto = 0;
      if (venda.tipo_venda !== 'rapida' && venda.itens && venda.itens.length > 0) {
        for (const item of venda.itens) {
          if (item.produto && item.produto.custo_producao) {
            const lucroItem = (item.preco_unitario - item.produto.custo_producao) * item.quantidade;
            lucroBruto += lucroItem;
          }
        }
      }

      const novaVenda = {
        numero_venda: numeroVenda,
        cliente_nome: venda.cliente_nome || null,
        cliente_whatsapp: venda.cliente_whatsapp || null,
        cliente_endereco: venda.cliente_endereco || null,
        origem_venda: venda.origem_venda || 'Presencial',
        forma_pagamento: venda.forma_pagamento || 'PIX',
        status_pagamento: venda.status_pagamento || 'Pendente',
        revendedor_id: venda.revendedor_id || null,
        tipo_cliente: venda.revendedor_id ? 'Revendedor' : 'Cliente Final',
        subtotal: venda.subtotal || 0,
        frete: venda.frete || 0,
        desconto: venda.desconto || 0,
        total: venda.total || 0,
        tipo: venda.tipo_venda || 'normal',
        lucro_bruto: lucroBruto,
        produto_digitado: venda.produto_digitado || null,
        status: venda.status || 'pendente',
        data_venda: venda.data_venda ? new Date(venda.data_venda).toISOString() : new Date().toISOString(),
        observacoes: null
      };

      const { data, error } = await supabase
        .from('vendas')
        .insert(novaVenda)
        .select()
        .maybeSingle();

      if (error) {
        console.error('Erro ao criar venda:', error);
        throw error;
      }

      if (!data) {
        throw new Error('Erro ao criar venda - nenhum dado retornado');
      }

      if (venda.tipo_venda !== 'rapida' && venda.itens && venda.itens.length > 0) {
        await this.salvarItensVenda(data.id, venda.itens);
      }

      return data;
    } catch (error) {
      console.error('Erro completo ao criar venda:', error);
      handleSupabaseError(error);
      throw error;
    }
  },

  async createVendaRapida(vendaRapida: VendaRapida & { revendedor_id?: string; origem_venda?: string }): Promise<Venda> {
    if (!isSupabaseReady()) {
      throw new Error('Supabase não está configurado. Configure suas credenciais do Supabase.');
    }

    try {
      const { count } = await supabase
        .from('vendas')
        .select('*', { count: 'exact', head: true });

      const proximoNumero = (count || 0) + 1;
      const numeroVenda = String(proximoNumero).padStart(3, '0');

      const novaVenda = {
        numero_venda: numeroVenda,
        cliente_nome: vendaRapida.cliente_nome || 'Cliente Anônimo',
        cliente_whatsapp: null,
        cliente_endereco: vendaRapida.cliente_endereco || null,
        produto_digitado: vendaRapida.produto_digitado,
        revendedor_id: vendaRapida.revendedor_id || null,
        origem_venda: vendaRapida.origem_venda || 'Presencial',
        forma_pagamento: 'PIX',
        status_pagamento: 'Pago',
        tipo_cliente: vendaRapida.revendedor_id ? 'Revendedor' : 'Cliente Final',
        subtotal: vendaRapida.valor_total,
        frete: 0,
        desconto: 0,
        total: vendaRapida.valor_total,
        tipo: 'rapida',
        lucro_bruto: 0,
        status: 'concluido',
        data_venda: new Date().toISOString(),
        observacoes: null
      };

      const { data, error } = await supabase
        .from('vendas')
        .insert(novaVenda)
        .select()
        .maybeSingle();

      if (error) {
        console.error('Erro Supabase:', error);
        throw error;
      }

      if (!data) {
        throw new Error('Erro ao criar venda rápida - nenhum dado retornado');
      }

      return data;
    } catch (error) {
      console.error('Erro ao criar venda rápida:', error);
      handleSupabaseError(error);
      throw error;
    }
  },

  async update(id: string, venda: Partial<Venda>): Promise<Venda> {
    if (!isSupabaseReady()) {
      throw new Error('Supabase não está configurado. Configure suas credenciais do Supabase.');
    }

    try {
      const updateData = {
        ...venda,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('vendas')
        .update(updateData)
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Erro ao atualizar venda - nenhum dado retornado');
      return data;
    } catch (error) {
      handleSupabaseError(error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    if (!isSupabaseReady()) {
      throw new Error('Supabase não está configurado. Configure suas credenciais do Supabase.');
    }

    try {
      // Remove itens primeiro
      await supabase
        .from('venda_itens')
        .delete()
        .eq('venda_id', id);

      // Remove a venda
      const { error } = await supabase
        .from('vendas')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      handleSupabaseError(error);
    }
  },

  async getById(id: string): Promise<Venda | null> {
    if (!isSupabaseReady()) {
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('vendas')
        .select(`
          *,
          venda_itens (
            id,
            produto_id,
            quantidade,
            preco_unitario,
            subtotal,
            produtos (
              id,
              nome,
              descricao,
              preco_venda,
              custo_producao
            )
          )
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;

      if (!data) return null;

      return {
        ...data,
        itens: (data.venda_itens || []).map((item: any) => ({
          id: item.id,
          produto_id: item.produto_id,
          quantidade: item.quantidade,
          preco_unitario: item.preco_unitario,
          subtotal: item.subtotal,
          produto: item.produtos ? {
            id: item.produtos.id,
            nome: item.produtos.nome,
            descricao: item.produtos.descricao,
            preco_venda: item.produtos.preco_venda,
            custo_producao: item.produtos.custo_producao
          } : undefined
        }))
      };
    } catch (error) {
      handleSupabaseError(error);
      return null;
    }
  },

  async salvarItensVenda(vendaId: string, itens: ItemVenda[]): Promise<void> {
    const itensData = itens.map(item => ({
      venda_id: vendaId,
      produto_id: item.produto_id,
      quantidade: item.quantidade,
      preco_unitario: item.preco_unitario,
      subtotal: item.subtotal
    }));

    const { error } = await supabase
      .from('venda_itens')
      .insert(itensData);
    
    if (error) throw error;
  },

  // Removido: atualizarEstoque - agora o estoque é controlado na produção
};