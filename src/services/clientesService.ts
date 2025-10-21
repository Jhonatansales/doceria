import { supabase, handleSupabaseError, isSupabaseReady } from '../lib/supabase';
import { Cliente } from '../types';

export const clientesService = {
  async getAll(): Promise<Cliente[]> {
    if (!isSupabaseReady()) {
      console.warn('Supabase not configured. Using mock data.');
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('nome');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      handleSupabaseError(error);
      return [];
    }
  },

  async getByTelefone(telefone: string): Promise<Cliente | null> {
    if (!isSupabaseReady()) {
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('telefone', telefone)
        .maybeSingle();

      if (error) throw error;
      return data || null;
    } catch (error) {
      handleSupabaseError(error);
      return null;
    }
  },

  async searchByNameOrPhone(term: string): Promise<Cliente[]> {
    if (!isSupabaseReady()) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .or(`nome.ilike.%${term}%,whatsapp.ilike.%${term}%,telefone.ilike.%${term}%`)
        .limit(5);

      if (error) throw error;
      return data || [];
    } catch (error) {
      handleSupabaseError(error);
      return [];
    }
  },

  async create(cliente: Omit<Cliente, 'id' | 'created_at' | 'updated_at'>): Promise<Cliente> {
    if (!isSupabaseReady()) {
      throw new Error('Supabase não está configurado. Configure suas credenciais do Supabase.');
    }

    try {
      // Gerar código sequencial do cliente
      const { data: lastCliente } = await supabase
        .from('clientes')
        .select('id')
        .order('created_at', { ascending: false })
        .limit(1);
      
      // Contar total de clientes para gerar próximo número
      const { count } = await supabase
        .from('clientes')
        .select('*', { count: 'exact', head: true });
      
      const proximoNumero = (count || 0) + 1;
      const codigoCliente = String(proximoNumero).padStart(3, '0');

      const { data, error } = await supabase
        .from('clientes')
        .insert({
          ...cliente,
          codigo_cliente: codigoCliente
        })
        .select()
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Erro ao criar cliente - nenhum dado retornado');
      return data;
    } catch (error) {
      handleSupabaseError(error);
      throw error;
    }
  },

  async update(id: string, cliente: Partial<Cliente>): Promise<Cliente> {
    if (!isSupabaseReady()) {
      throw new Error('Supabase não está configurado. Configure suas credenciais do Supabase.');
    }

    try {
      const updateData = {
        ...cliente,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('clientes')
        .update(updateData)
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Erro ao atualizar cliente - nenhum dado retornado');
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
        .from('clientes')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      handleSupabaseError(error);
      throw error;
    }
  },

  async getAlertasRetencao(): Promise<{ avisos: any[]; alertas: any[] }> {
    if (!isSupabaseReady()) {
      return { avisos: [], alertas: [] };
    }

    try {
      const hoje = new Date();
      const diasAviso = 30;
      const diasAlerta = 45;

      const dataAviso = new Date(hoje);
      dataAviso.setDate(dataAviso.getDate() - diasAviso);

      const dataAlerta = new Date(hoje);
      dataAlerta.setDate(dataAlerta.getDate() - diasAlerta);

      const { data: clientesComVendas, error } = await supabase
        .from('vendas')
        .select('cliente_nome, data_venda')
        .not('cliente_nome', 'is', null)
        .order('data_venda', { ascending: false });

      if (error) throw error;

      const ultimaCompraPorCliente = new Map();

      (clientesComVendas || []).forEach(venda => {
        if (!ultimaCompraPorCliente.has(venda.cliente_nome)) {
          ultimaCompraPorCliente.set(venda.cliente_nome, new Date(venda.data_venda));
        }
      });

      const avisos: any[] = [];
      const alertas: any[] = [];

      ultimaCompraPorCliente.forEach((ultimaCompra, clienteNome) => {
        const diasSemComprar = Math.floor((hoje.getTime() - ultimaCompra.getTime()) / (1000 * 60 * 60 * 24));

        if (diasSemComprar >= diasAlerta) {
          alertas.push({
            cliente_nome: clienteNome,
            dias_sem_comprar: diasSemComprar,
            ultima_compra: ultimaCompra.toISOString()
          });
        } else if (diasSemComprar >= diasAviso) {
          avisos.push({
            cliente_nome: clienteNome,
            dias_sem_comprar: diasSemComprar,
            ultima_compra: ultimaCompra.toISOString()
          });
        }
      });

      return { avisos, alertas };
    } catch (error) {
      handleSupabaseError(error);
      return { avisos: [], alertas: [] };
    }
  },

};