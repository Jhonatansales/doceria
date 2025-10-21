import { supabase, handleSupabaseError, isSupabaseReady } from '../lib/supabase';
import { Revendedor } from '../types';

export const revendedoresService = {
  async getAll(): Promise<Revendedor[]> {
    if (!isSupabaseReady()) {
      console.warn('Supabase not configured. Using mock data.');
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('revendedores')
        .select('*')
        .order('nome');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      handleSupabaseError(error);
      return [];
    }
  },

  async create(revendedor: Omit<Revendedor, 'id' | 'created_at' | 'updated_at'>): Promise<Revendedor> {
    if (!isSupabaseReady()) {
      throw new Error('Supabase não está configurado. Configure suas credenciais do Supabase.');
    }

    try {
      const { data, error } = await supabase
        .from('revendedores')
        .insert(revendedor)
        .select()
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Erro ao criar revendedor - nenhum dado retornado');
      return data;
    } catch (error) {
      handleSupabaseError(error);
      throw error;
    }
  },

  async update(id: string, revendedor: Partial<Revendedor>): Promise<Revendedor> {
    if (!isSupabaseReady()) {
      throw new Error('Supabase não está configurado. Configure suas credenciais do Supabase.');
    }

    try {
      const updateData = {
        ...revendedor,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('revendedores')
        .update(updateData)
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Erro ao atualizar revendedor - nenhum dado retornado');
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
        .from('revendedores')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      handleSupabaseError(error);
      throw error;
    }
  },

  async getVendasRevendedor(revendedorId: string) {
    if (!isSupabaseReady()) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('vendas')
        .select(`
          *,
          venda_itens (
            *,
            produtos (nome)
          )
        `)
        .eq('revendedor_id', revendedorId)
        .order('data_venda', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      handleSupabaseError(error);
      return [];
    }
  }
};