import { supabase, handleSupabaseError, isSupabaseReady } from '../lib/supabase';
import { CronogramaItem } from '../types';

export const cronogramaService = {
  async getAll(): Promise<CronogramaItem[]> {
    if (!isSupabaseReady()) {
      console.warn('Supabase not configured. Using mock data.');
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('cronograma_producao')
        .select(`
          *,
          receitas (
            id,
            nome,
            rendimento,
            custo_total
          )
        `)
        .order('data_producao', { ascending: true });
      
      if (error) throw error;
      
      return (data || []).map(item => ({
        ...item,
        receita: item.receitas
      }));
    } catch (error) {
      handleSupabaseError(error);
      return [];
    }
  },

  async getByWeek(startDate: string, endDate: string): Promise<CronogramaItem[]> {
    if (!isSupabaseReady()) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('cronograma_producao')
        .select(`
          *,
          receitas (
            id,
            nome,
            rendimento,
            custo_total
          )
        `)
        .gte('data_producao', startDate)
        .lte('data_producao', endDate)
        .order('data_producao', { ascending: true });
      
      if (error) throw error;
      
      return (data || []).map(item => ({
        ...item,
        receita: item.receitas
      }));
    } catch (error) {
      handleSupabaseError(error);
      return [];
    }
  },

  async create(item: Omit<CronogramaItem, 'id' | 'created_at'>): Promise<CronogramaItem> {
    if (!isSupabaseReady()) {
      throw new Error('Supabase não está configurado. Configure suas credenciais do Supabase.');
    }

    try {
      const { data, error } = await supabase
        .from('cronograma_producao')
        .insert(item)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      handleSupabaseError(error);
      throw error;
    }
  },

  async update(id: string, item: Partial<CronogramaItem>): Promise<CronogramaItem> {
    if (!isSupabaseReady()) {
      throw new Error('Supabase não está configurado. Configure suas credenciais do Supabase.');
    }

    try {
      const { data, error } = await supabase
        .from('cronograma_producao')
        .update(item)
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
      const { error } = await supabase
        .from('cronograma_producao')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      handleSupabaseError(error);
      throw error;
    }
  }
};