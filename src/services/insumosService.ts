import { supabase, handleSupabaseError, isSupabaseReady } from '../lib/supabase';
import { Insumo } from '../types';

export const insumosService = {
  async getAll(): Promise<Insumo[]> {
    if (!isSupabaseReady()) {
      console.warn('Supabase not configured. Using mock data.');
      return [];
    }

    try {
      const { data: insumos, error } = await supabase
        .from('insumos')
        .select('*')
        .order('nome');

      if (error) throw error;

      return (insumos || []).map(insumo => ({
        id: insumo.id,
        nome: insumo.nome,
        unidade: insumo.unidade_compra,
        unidade_compra: insumo.unidade_compra,
        quantidade_estoque: Number(insumo.estoque_atual || 0),
        preco_unitario: Number(insumo.preco_compra || 0),
        preco_compra: Number(insumo.preco_compra || 0),
        quantidade_compra: Number(insumo.quantidade_compra || 1),
        estoque_atual: Number(insumo.estoque_atual || 0),
        created_at: insumo.created_at,
        updated_at: insumo.updated_at
      }));
    } catch (error) {
      handleSupabaseError(error);
      return [];
    }
  },

  async create(insumoData: Omit<Insumo, 'id' | 'created_at' | 'updated_at' | 'custo_por_unidade'> & {
    custo_total_compra: number;
    quantidade_comprada: number;
  }): Promise<Insumo> {
    if (!isSupabaseReady()) {
      throw new Error('Supabase não está configurado. Configure suas credenciais do Supabase.');
    }

    try {
      // Criar o insumo
      const { data, error } = await supabase
        .from('insumos')
        .insert({
          nome: insumoData.nome,
          unidade: insumoData.unidade,
          quantidade_estoque: insumoData.quantidade_estoque || 0,
          preco_unitario: insumoData.preco_unitario || 0
        })
        .select()
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Erro ao criar insumo - nenhum dado retornado');
      
      // Criar lote de compra
      if (insumoData.custo_total_compra > 0 && insumoData.quantidade_comprada > 0) {
        await supabase
          .from('insumos_lotes')
          .insert({
            insumo_id: data.id,
            preco_por_unidade: insumoData.custo_total_compra / insumoData.quantidade_comprada,
            quantidade_disponivel: insumoData.quantidade_comprada,
            data_entrada: new Date().toISOString().split('T')[0]
          });
      }
      
      return data;
    } catch (error) {
      handleSupabaseError(error);
      throw error;
    }
  },

  async update(id: string, insumoData: Partial<Insumo> & {
    custo_total_compra?: number;
    quantidade_comprada?: number;
    unidade_medida_compra?: string;
  }): Promise<Insumo> {
    if (!isSupabaseReady()) {
      throw new Error('Supabase não está configurado. Configure suas credenciais do Supabase.');
    }

    try {
      const updateData: any = {
        updated_at: new Date().toISOString()
      };

      if (insumoData.nome) updateData.nome = insumoData.nome;
      if (insumoData.unidade_medida_compra) updateData.unidade_compra = insumoData.unidade_medida_compra;
      if (insumoData.estoque_atual !== undefined) updateData.quantidade_estoque = insumoData.estoque_atual;
      if (insumoData.quantidade_estoque !== undefined) updateData.quantidade_estoque = insumoData.quantidade_estoque;
      if (insumoData.custo_total_compra !== undefined) updateData.preco_unitario = insumoData.custo_total_compra;
      if (insumoData.preco_unitario !== undefined) updateData.preco_unitario = insumoData.preco_unitario;

      const { data, error } = await supabase
        .from('insumos')
        .update(updateData)
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Erro ao atualizar insumo - nenhum dado retornado');

      if (insumoData.custo_total_compra && insumoData.quantidade_comprada &&
          insumoData.custo_total_compra > 0 && insumoData.quantidade_comprada > 0) {
        await supabase
          .from('insumos_lotes')
          .insert({
            insumo_id: id,
            preco_por_unidade: insumoData.custo_total_compra / insumoData.quantidade_comprada,
            quantidade_disponivel: insumoData.quantidade_comprada,
            data_entrada: new Date().toISOString().split('T')[0]
          });
      }

      return {
        id: data.id,
        nome: data.nome,
        unidade: data.unidade_compra,
        quantidade_estoque: Number(data.quantidade_compra || data.quantidade_estoque || 0),
        preco_unitario: Number(data.preco_compra || data.preco_unitario || 0),
        created_at: data.created_at,
        updated_at: data.updated_at
      };
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
        .from('insumos')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      handleSupabaseError(error);
    }
  },

  async updateEstoque(id: string, novaQuantidade: number): Promise<void> {
    if (!isSupabaseReady()) {
      throw new Error('Supabase não está configurado. Configure suas credenciais do Supabase.');
    }

    try {
      const { error } = await supabase
        .from('insumos')
        .update({ 
          estoque_atual: novaQuantidade,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      handleSupabaseError(error);
    }
  }
};