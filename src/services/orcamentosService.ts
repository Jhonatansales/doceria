import { supabase, handleSupabaseError, isSupabaseReady } from '../lib/supabase';
import { Orcamento, ItemOrcamento } from '../types';

export const orcamentosService = {
  async getAll(): Promise<Orcamento[]> {
    if (!isSupabaseReady()) {
      console.warn('Supabase not configured. Using mock data.');
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('orcamentos')
        .select(`
          *,
          orcamento_itens (
            *,
            produto_id,
            quantidade,
            preco_unitario,
            subtotal,
            produtos (
              *,
              receitas (
                *,
                receita_ingredientes (
                  insumo_id,
                  quantidade_usada,
                  custo_ingrediente,
                  insumos (*)
                )
              )
            )
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map(orcamento => ({
        ...orcamento,
        itens: orcamento.orcamento_itens.map((item: any) => ({
          id: item.id,
          produto_id: item.produto_id,
          quantidade: item.quantidade,
          preco_unitario: item.preco_unitario,
          subtotal: item.subtotal,
          produto: {
            ...item.produtos,
            receita: item.produtos.receitas ? {
              ...item.produtos.receitas,
              ingredientes: item.produtos.receitas.receita_ingredientes?.map((ri: any) => ({
                insumo_id: ri.insumo_id,
                quantidade_usada: ri.quantidade_usada,
                custo_ingrediente: ri.custo_ingrediente,
                insumo: ri.insumos
              })) || []
            } : null
          }
        }))
      }));
    } catch (error) {
      handleSupabaseError(error);
      return [];
    }
  },

  async create(orcamento: Omit<Orcamento, 'id' | 'created_at' | 'updated_at'>): Promise<Orcamento> {
    if (!isSupabaseReady()) {
      throw new Error('Supabase não está configurado. Configure suas credenciais do Supabase.');
    }

    try {
      // Gerar número sequencial do orçamento
      const { count } = await supabase
        .from('orcamentos')
        .select('*', { count: 'exact', head: true });
      
      const proximoNumero = (count || 0) + 1;
      const numeroOrcamento = `ORC-${String(proximoNumero).padStart(3, '0')}`;

      const novoOrcamento = {
        numero_orcamento: numeroOrcamento,
        cliente_id: orcamento.cliente_id,
        cliente_nome: orcamento.cliente_nome,
        cliente_whatsapp: orcamento.cliente_whatsapp,
        cliente_endereco: orcamento.cliente_endereco,
        data_criacao: orcamento.data_criacao,
        data_validade: orcamento.data_validade,
        subtotal: orcamento.subtotal,
        total: orcamento.total,
        observacoes: orcamento.observacoes,
        status: orcamento.status || 'pendente'
      };

      const { data, error } = await supabase
        .from('orcamentos')
        .insert(novoOrcamento)
        .select()
        .single();
      
      if (error) throw error;

      // Salva os itens do orçamento
      await this.salvarItensOrcamento(data.id, orcamento.itens);

      return data;
    } catch (error) {
      handleSupabaseError(error);
      throw error;
    }
  },

  async update(id: string, orcamento: Partial<Orcamento>): Promise<Orcamento> {
    if (!isSupabaseReady()) {
      throw new Error('Supabase não está configurado. Configure suas credenciais do Supabase.');
    }

    try {
      const updateData = {
        ...orcamento,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('orcamentos')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;

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
        .from('orcamento_itens')
        .delete()
        .eq('orcamento_id', id);

      // Remove o orçamento
      const { error } = await supabase
        .from('orcamentos')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      handleSupabaseError(error);
    }
  },

  async getById(id: string): Promise<Orcamento | null> {
    if (!isSupabaseReady()) {
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('orcamentos')
        .select(`
          *,
          orcamento_itens (
            *,
            produto_id,
            quantidade,
            preco_unitario,
            subtotal,
            produtos (
              *,
              receitas (
                *,
                receita_ingredientes (
                  insumo_id,
                  quantidade_usada,
                  custo_ingrediente,
                  insumos (*)
                )
              )
            )
          )
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      if (!data) return null;

      return {
        ...data,
        itens: data.orcamento_itens.map((item: any) => ({
          id: item.id,
          produto_id: item.produto_id,
          quantidade: item.quantidade,
          preco_unitario: item.preco_unitario,
          subtotal: item.subtotal,
          produto: {
            ...item.produtos,
            receita: item.produtos.receitas ? {
              ...item.produtos.receitas,
              ingredientes: item.produtos.receitas.receita_ingredientes?.map((ri: any) => ({
                insumo_id: ri.insumo_id,
                quantidade_usada: ri.quantidade_usada,
                custo_ingrediente: ri.custo_ingrediente,
                insumo: ri.insumos
              })) || []
            } : null
          }
        }))
      };
    } catch (error) {
      handleSupabaseError(error);
      return null;
    }
  },

  async salvarItensOrcamento(orcamentoId: string, itens: ItemOrcamento[]): Promise<void> {
    const itensData = itens.map(item => ({
      orcamento_id: orcamentoId,
      produto_id: item.produto_id?.startsWith('manual_') ? null : item.produto_id,
      produto_nome: item.produto_id?.startsWith('manual_') ? item.produto?.nome : null,
      quantidade: item.quantidade,
      preco_unitario: item.preco_unitario,
      subtotal: item.subtotal
    }));

    const { error } = await supabase
      .from('orcamento_itens')
      .insert(itensData);

    if (error) throw error;
  }
};