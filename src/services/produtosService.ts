import { supabase, handleSupabaseError } from '../lib/supabase';
import { Produto } from '../types';
import { isSupabaseReady } from '../lib/supabase';

export const produtosService = {
  async getAll(): Promise<Produto[]> {
    if (!isSupabaseReady()) {
      console.warn('Supabase not configured. Using mock data.');
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('produtos')
        .select(`
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
        `)
        .order('nome');
      
      if (error) throw error;
      
      return (data || []).map(produto => ({
        ...produto,
        estoque_atual: produto.estoque_atual || 0,
        estoque_minimo: produto.estoque_minimo || 0,
        receita: produto.receitas ? {
          ...produto.receitas,
          ingredientes: produto.receitas.receita_ingredientes?.map((ri: any) => ({
            insumo_id: ri.insumo_id,
            quantidade_usada: ri.quantidade_usada,
            custo_ingrediente: ri.custo_ingrediente,
            insumo: ri.insumos
          })) || []
        } : null
      }));
    } catch (error) {
      handleSupabaseError(error);
      return [];
    }
  },

  async create(produto: Omit<Produto, 'id' | 'created_at' | 'updated_at'>): Promise<Produto> {
    if (!isSupabaseReady()) {
      throw new Error('Supabase não está configurado. Configure suas credenciais do Supabase.');
    }

    try {
      const { data, error } = await supabase
        .from('produtos')
        .insert(produto)
        .select()
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Erro ao criar produto - nenhum dado retornado');
      return data;
    } catch (error) {
      handleSupabaseError(error);
      throw error;
    }
  },

  async update(id: string, produto: Partial<Produto>): Promise<Produto> {
    if (!isSupabaseReady()) {
      throw new Error('Supabase não está configurado. Configure suas credenciais do Supabase.');
    }

    try {
      const updateData = {
        ...produto,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('produtos')
        .update(updateData)
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Erro ao atualizar produto - nenhum dado retornado');
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
      const { error } = await supabase
        .from('produtos')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      handleSupabaseError(error);
    }
  }
};