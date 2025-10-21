import { supabase, handleSupabaseError, isSupabaseReady } from '../lib/supabase';

export interface Configuracao {
  id: string;
  nome_confeitaria: string;
  contato_whatsapp?: string;
  chave_pix?: string;
  margem_lucro_padrao: number;
  custo_embalagem_padrao: number;
  logo_url?: string;
  logo_file_path?: string;
  created_at?: string;
  updated_at?: string;
}

export const configuracoesService = {
  async get(): Promise<Configuracao | null> {
    if (!isSupabaseReady()) {
      console.warn('Supabase not configured. Using mock data.');
      return {
        id: 'mock',
        nome_confeitaria: 'Doce Sabor',
        margem_lucro_padrao: 35,
        custo_embalagem_padrao: 0
      };
    }

    try {
      const { data, error } = await supabase
        .from('configuracoes')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data || null;
    } catch (error) {
      handleSupabaseError(error);
      return null;
    }
  },

  async createOrUpdate(config: Omit<Configuracao, 'id' | 'created_at' | 'updated_at'>): Promise<Configuracao> {
    if (!isSupabaseReady()) {
      throw new Error('Supabase não está configurado. Configure suas credenciais do Supabase.');
    }

    try {
      // Primeiro tenta buscar configuração existente
      const existing = await this.get();
      
      if (existing && existing.id !== 'mock') {
        // Atualiza configuração existente
        const { data, error } = await supabase
          .from('configuracoes')
          .update({
            ...config,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id)
          .select()
          .maybeSingle();

        if (error) throw error;
        if (!data) throw new Error('Erro ao atualizar configuração');
        return data;
      } else {
        // Cria nova configuração
        const { data, error } = await supabase
          .from('configuracoes')
          .insert(config)
          .select()
          .maybeSingle();

        if (error) throw error;
        if (!data) throw new Error('Erro ao criar configuração');
        return data;
      }
    } catch (error) {
      handleSupabaseError(error);
      throw error;
    }
  }
};