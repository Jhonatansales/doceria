import { supabase, handleSupabaseError, isSupabaseReady } from '../lib/supabase';
import { Gasto } from '../types';

export const gastosService = {
  async getAll(): Promise<Gasto[]> {
    if (!isSupabaseReady()) {
      console.warn('Supabase not configured. Using mock data.');
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('gastos')
        .select('*')
        .order('data_vencimento', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      handleSupabaseError(error);
      return [];
    }
  },

  async create(gasto: Omit<Gasto, 'id' | 'created_at' | 'updated_at'>): Promise<Gasto> {
    if (!isSupabaseReady()) {
      throw new Error('Supabase não está configurado. Configure suas credenciais do Supabase.');
    }

    try {
      const { data, error } = await supabase
        .from('gastos')
        .insert(gasto)
        .select()
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Erro ao criar gasto - nenhum dado retornado');
      return data;
    } catch (error) {
      handleSupabaseError(error);
      throw error;
    }
  },

  async update(id: string, gasto: Partial<Gasto>): Promise<Gasto> {
    if (!isSupabaseReady()) {
      throw new Error('Supabase não está configurado. Configure suas credenciais do Supabase.');
    }

    try {
      const updateData = {
        ...gasto,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('gastos')
        .update(updateData)
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Erro ao atualizar gasto - nenhum dado retornado');
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
        .from('gastos')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      handleSupabaseError(error);
      throw error;
    }
  }
};