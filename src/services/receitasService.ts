import { supabase, handleSupabaseError, isSupabaseReady } from '../lib/supabase';
import { Receita, IngredienteReceita } from '../types';

export const receitasService = {
  async getAll(): Promise<Receita[]> {
    if (!isSupabaseReady()) {
      console.warn('Supabase not configured. Using mock data.');
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('receitas')
        .select(`
          *,
          receita_ingredientes (
            insumo_id,
            quantidade_usada,
            custo_ingrediente,
            insumos (*)
          )
        `)
        .order('nome');
      
      if (error) throw error;
      
      return (data || []).map(receita => ({
        ...receita,
        ingredientes: receita.receita_ingredientes.map((ri: any) => ({
          insumo_id: ri.insumo_id,
          quantidade_usada: ri.quantidade_usada,
          unidade_medida: ri.unidade_medida || 'un',
          custo_ingrediente: ri.custo_ingrediente,
          insumo: ri.insumos
        }))
      }));
    } catch (error) {
      handleSupabaseError(error);
      return [];
    }
  },

  async create(receita: Omit<Receita, 'id' | 'created_at' | 'updated_at'>): Promise<Receita> {
    if (!isSupabaseReady()) {
      throw new Error('Supabase não está configurado. Configure suas credenciais do Supabase.');
    }

    try {
      const { data, error } = await supabase
        .from('receitas')
        .insert({
          nome: receita.nome,
          modo_preparo: receita.modo_preparo,
          rendimento: receita.rendimento,
          custo_total: receita.custo_total || 0,
          custos_adicionais: receita.custos_adicionais || 0,
          margem_lucro: receita.margem_lucro || 35,
          preco_venda: receita.preco_venda || 0,
          preco_revenda: receita.preco_revenda || 0,
          estoque_produto_final: receita.estoque_produto_final || 0
        })
        .select()
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Erro ao criar receita - nenhum dado retornado');

      // Salva os ingredientes
      if (receita.ingredientes && receita.ingredientes.length > 0) {
        await this.salvarIngredientes(data.id, receita.ingredientes);
      }

      return data;
    } catch (error) {
      handleSupabaseError(error);
      throw error;
    }
  },

  async produzirReceita(receitaId: string, quantidadeLotes: number): Promise<void> {
    if (!isSupabaseReady()) {
      throw new Error('Supabase não está configurado. Configure suas credenciais do Supabase.');
    }

    try {
      const { data: receita, error: receitaError } = await supabase
        .from('receitas')
        .select(`
          *,
          receita_ingredientes (
            insumo_id,
            quantidade_usada,
            custo_ingrediente,
            insumos (
              id,
              nome,
              estoque_atual,
              unidade_compra
            )
          )
        `)
        .eq('id', receitaId)
        .maybeSingle();

      if (receitaError) throw receitaError;
      if (!receita) throw new Error('Receita não encontrada');

      const ingredientes = receita.receita_ingredientes.map((ri: any) => ({
        insumo_id: ri.insumo_id,
        quantidade_usada: ri.quantidade_usada,
        unidade_medida: ri.unidade_medida || 'un',
        custo_ingrediente: ri.custo_ingrediente,
        insumo: ri.insumos
      }));

      const estoqueInsuficiente: string[] = [];

      for (const ingrediente of ingredientes) {
        const quantidadeNecessaria = ingrediente.quantidade_usada * quantidadeLotes;

        if (ingrediente.insumo && ingrediente.insumo.estoque_atual < quantidadeNecessaria) {
          estoqueInsuficiente.push(
            `${ingrediente.insumo.nome} (disponível: ${ingrediente.insumo.estoque_atual} ${ingrediente.insumo.unidade_compra}, necessário: ${quantidadeNecessaria} ${ingrediente.insumo.unidade_compra})`
          );
        }
      }

      if (estoqueInsuficiente.length > 0) {
        throw new Error(`Estoque insuficiente para:\n${estoqueInsuficiente.join('\n')}`);
      }

      for (const ingrediente of ingredientes) {
        if (ingrediente.insumo) {
          const quantidadeNecessaria = ingrediente.quantidade_usada * quantidadeLotes;
          const novoEstoque = Number(ingrediente.insumo.estoque_atual) - quantidadeNecessaria;

          const { error: updateError } = await supabase
            .from('insumos')
            .update({
              estoque_atual: novoEstoque,
              updated_at: new Date().toISOString()
            })
            .eq('id', ingrediente.insumo.id);

          if (updateError) throw updateError;
        }
      }

      const novoEstoqueProduzido = (receita.estoque_produto_final || 0) + quantidadeLotes;
      const { error: updateReceitaError } = await supabase
        .from('receitas')
        .update({
          estoque_produto_final: novoEstoqueProduzido,
          updated_at: new Date().toISOString()
        })
        .eq('id', receitaId);

      if (updateReceitaError) throw updateReceitaError;

      const { data: produtos } = await supabase
        .from('produtos')
        .select('*')
        .eq('receita_id', receitaId);

      if (produtos && produtos.length > 0) {
        for (const produto of produtos) {
          const novoEstoqueProduto = (produto.estoque_atual || 0) + quantidadeLotes;
          const { error: updateProdutoError } = await supabase
            .from('produtos')
            .update({
              estoque_atual: novoEstoqueProduto,
              updated_at: new Date().toISOString()
            })
            .eq('id', produto.id);

          if (updateProdutoError) throw updateProdutoError;
        }
      }

      const { error: producaoError } = await supabase
        .from('producao_receitas')
        .insert({
          receita_id: receitaId,
          quantidade_produzida: quantidadeLotes,
          data_producao: new Date().toISOString().split('T')[0]
        });

      if (producaoError) throw producaoError;

    } catch (error) {
      handleSupabaseError(error);
      throw error;
    }
  },

  async update(id: string, receita: Partial<Receita>): Promise<Receita> {
    if (!isSupabaseReady()) {
      throw new Error('Supabase não está configurado. Configure suas credenciais do Supabase.');
    }

    try {
      const updateData = {
        ...receita,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('receitas')
        .update(updateData)
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Erro ao atualizar receita - nenhum dado retornado');

      // Atualiza ingredientes se fornecidos
      if (receita.ingredientes) {
        await this.atualizarIngredientes(id, receita.ingredientes);
      }

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
      // Remove ingredientes primeiro (CASCADE deve fazer isso automaticamente)
      const { error } = await supabase
        .from('receitas')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      handleSupabaseError(error);
      throw error;
    }
  },

  async salvarIngredientes(receitaId: string, ingredientes: IngredienteReceita[]): Promise<void> {
    const ingredientesData = ingredientes.map(ing => ({
      receita_id: receitaId,
      insumo_id: ing.insumo_id,
      quantidade_usada: ing.quantidade_usada,
      unidade_medida: ing.unidade_medida || 'un',
      custo_ingrediente: ing.custo_ingrediente || 0
    }));

    const { error } = await supabase
      .from('receita_ingredientes')
      .insert(ingredientesData);

    if (error) throw error;
  },

  async atualizarIngredientes(receitaId: string, ingredientes: IngredienteReceita[]): Promise<void> {
    // Remove ingredientes existentes
    await supabase
      .from('receita_ingredientes')
      .delete()
      .eq('receita_id', receitaId);

    // Adiciona novos ingredientes
    if (ingredientes.length > 0) {
      await this.salvarIngredientes(receitaId, ingredientes);
    }
  }
};