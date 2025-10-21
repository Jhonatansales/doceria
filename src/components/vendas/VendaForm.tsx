import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calculator, Search, MapPin, User } from 'lucide-react';
import Button from '../common/Button';
import { Venda, ItemVenda, Produto, Revendedor, Receita, Cliente } from '../../types';
import { produtosService } from '../../services/produtosService';
import { revendedoresService } from '../../services/revendedoresService';
import { clientesService } from '../../services/clientesService';
import { supabase } from '../../lib/supabase';

interface VendaFormProps {
  venda?: Venda;
  onSubmit: (venda: Omit<Venda, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
}

const VendaForm: React.FC<VendaFormProps> = ({ venda, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    cliente_nome: '',
    cliente_whatsapp: '',
    cliente_endereco: '',
    cliente_numero: '',
    cliente_cidade: '',
    cliente_tipo_pessoa: 'Física' as 'Física' | 'Jurídica',
    origem_venda: 'Presencial' as 'WhatsApp' | 'Instagram' | 'iFood' | 'Presencial',
    forma_pagamento: 'PIX' as 'PIX' | 'Dinheiro' | 'Cartão' | 'A Prazo',
    revendedor_id: '',
    eh_revenda: false,
    frete: 0,
    desconto: 0,
    status: 'em_aberto' as 'em_aberto' | 'pago' | 'enviado' | 'concluido',
    data_venda: new Date().toISOString().split('T')[0]
  });

  const [itens, setItens] = useState<ItemVenda[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [revendedores, setRevendedores] = useState<Revendedor[]>([]);
  const [clientesSugeridos, setClientesSugeridos] = useState<Cliente[]>([]);
  const [clienteEncontrado, setClienteEncontrado] = useState<Cliente | null>(null);
  const [buscandoCliente, setBuscandoCliente] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProdutos();
    loadRevendedores();
    
    if (venda) {
      setFormData({
        cliente_nome: venda.cliente_nome || '',
        cliente_whatsapp: venda.cliente_whatsapp || '',
        cliente_endereco: '',
        cliente_numero: '',
        cliente_cidade: '',
        cliente_tipo_pessoa: 'Física',
        origem_venda: venda.origem_venda,
        forma_pagamento: venda.forma_pagamento,
        revendedor_id: venda.revendedor_id || '',
        eh_revenda: venda.tipo_venda === 'revenda',
        frete: venda.frete,
        desconto: venda.desconto,
        status: venda.status,
        data_venda: venda.data_venda
      });
      setItens(venda.itens || []);
    }
  }, [venda]);

  const loadProdutos = async () => {
    try {
      const data = await produtosService.getAll();
      // Filtrar apenas produtos ativos e com preço definido
      setProdutos(data.filter(p => p.ativo && p.preco_venda > 0));
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    }
  };

  const loadRevendedores = async () => {
    try {
      const data = await revendedoresService.getAll();
      setRevendedores(data);
    } catch (error) {
      console.error('Erro ao carregar revendedores:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked :
              name.includes('frete') || name.includes('desconto') 
                ? parseFloat(value) || 0 
                : value
    }));
  };

  // Atualiza status de pagamento baseado na forma de pagamento
  useEffect(() => {
    if (formData.forma_pagamento === 'A Prazo') {
      setFormData(prev => ({ ...prev, status: 'em_aberto' }));
    }
  }, [formData.forma_pagamento]);

  // Busca inteligente de clientes
  const buscarClientes = async (termo: string) => {
    if (termo.length < 2) {
      setClientesSugeridos([]);
      setClienteEncontrado(null);
      return;
    }

    setBuscandoCliente(true);
    try {
      const clientes = await clientesService.searchByNameOrPhone(termo);
      setClientesSugeridos(clientes);
      
      // Se encontrou um cliente exato pelo WhatsApp, define como cliente encontrado
      const clienteExato = clientes.find(c => c.whatsapp === termo);
      if (clienteExato) {
        setClienteEncontrado(clienteExato);
        // Preenche os dados do cliente encontrado
        setFormData(prev => ({
          ...prev,
          cliente_nome: clienteExato.nome,
          cliente_endereco: clienteExato.endereco_completo?.split(',')[0] || '',
          cliente_numero: clienteExato.endereco_completo?.split(',')[1]?.trim() || '',
          cliente_cidade: clienteExato.endereco_completo?.split(',')[2]?.trim() || '',
          cliente_tipo_pessoa: clienteExato.tipo_pessoa
        }));
      }
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
    } finally {
      setBuscandoCliente(false);
    }
  };

  // Debounce para busca de clientes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.cliente_nome) {
        buscarClientes(formData.cliente_nome);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [formData.cliente_nome]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.cliente_whatsapp) {
        buscarClientes(formData.cliente_whatsapp);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [formData.cliente_whatsapp]);

  const selecionarCliente = (cliente: Cliente) => {
    setFormData(prev => ({
      ...prev,
      cliente_nome: cliente.nome,
      cliente_whatsapp: cliente.whatsapp,
      cliente_endereco: cliente.endereco_completo?.split(',')[0] || '',
      cliente_numero: cliente.endereco_completo?.split(',')[1]?.trim() || '',
      cliente_cidade: cliente.endereco_completo?.split(',')[2]?.trim() || '',
      cliente_tipo_pessoa: cliente.tipo_pessoa
    }));
    setClienteEncontrado(cliente);
    setClientesSugeridos([]);
  };
  const adicionarItem = () => {
    setItens(prev => [...prev, {
      produto_id: '',
      quantidade: 1,
      preco_unitario: 0,
      subtotal: 0
    }]);
  };

  const removerItem = (index: number) => {
    setItens(prev => prev.filter((_, i) => i !== index));
  };

  const atualizarItem = (index: number, field: keyof ItemVenda, value: any) => {
    setItens(prev => prev.map((item, i) => {
      if (i === index) {
        const updated = { ...item, [field]: value };
        
        // Se mudou o produto, atualiza o preço
        if (field === 'produto_id') {
          const produto = produtos.find(p => p.id === value);
          if (produto) {
            updated.preco_unitario = formData.eh_revenda && produto.preco_revenda 
              ? produto.preco_revenda 
              : produto.preco_venda;
          }
        }
        
        // Recalcula subtotal
        if (field === 'quantidade' || field === 'preco_unitario' || field === 'produto_id') {
          updated.subtotal = updated.quantidade * updated.preco_unitario;
        }
        
        return updated;
      }
      return item;
    }));
  };

  const subtotal = itens.reduce((total, item) => total + item.subtotal, 0);
  const total = subtotal + formData.frete - formData.desconto;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Primeiro, verificar/criar cliente se necessário
      let clienteId = null;
      if (formData.cliente_nome && formData.cliente_whatsapp) {
        // Verificar se já existe um cliente com este WhatsApp
        let clienteExistente = clienteEncontrado;
        
        if (!clienteExistente) {
          try {
            // Buscar cliente pelo WhatsApp
            const clientes = await clientesService.searchByNameOrPhone(formData.cliente_whatsapp);
            clienteExistente = clientes.find(c => c.whatsapp === formData.cliente_whatsapp) || null;
          } catch (error) {
            console.error('Erro ao buscar cliente:', error);
          }
        }
        
        if (clienteExistente) {
          // Cliente já existe, atualizar dados se necessário
          clienteId = clienteExistente.id;
          const enderecoCompleto = `${formData.cliente_endereco}, ${formData.cliente_numero}, ${formData.cliente_cidade}`.replace(/^, |, $/g, '');
          
          // Verificar se precisa atualizar algum dado
          const needsUpdate = 
            clienteExistente.nome !== formData.cliente_nome ||
            clienteExistente.endereco_completo !== enderecoCompleto ||
            clienteExistente.tipo_pessoa !== formData.cliente_tipo_pessoa;
            
          if (needsUpdate) {
            await clientesService.update(clienteExistente.id, {
              nome: formData.cliente_nome,
              endereco_completo: enderecoCompleto,
              tipo_pessoa: formData.cliente_tipo_pessoa
            });
          }
        } else {
          // Criar novo cliente
          const novoCliente = await clientesService.create({
            nome: formData.cliente_nome,
            whatsapp: formData.cliente_whatsapp,
            endereco_completo: `${formData.cliente_endereco}, ${formData.cliente_numero}, ${formData.cliente_cidade}`.replace(/^, |, $/g, ''),
            tipo_pessoa: formData.cliente_tipo_pessoa
          });
          clienteId = novoCliente.id;
        }
      }

      const vendaData = {
        cliente_nome: formData.cliente_nome,
        cliente_whatsapp: formData.cliente_whatsapp,
        origem_venda: formData.origem_venda,
        forma_pagamento: formData.forma_pagamento,
        revendedor_id: formData.revendedor_id || null,
        frete: formData.frete,
        desconto: formData.desconto,
        status: formData.status,
        data_venda: formData.data_venda,
        itens: itens.filter(item => item.produto_id && item.quantidade > 0),
        tipo_venda: formData.eh_revenda ? 'revenda' as const : 'normal' as const,
        status_pagamento: formData.forma_pagamento === 'A Prazo' ? 'Pendente' as const : 'Pago' as const,
        subtotal,
        total
      };

      await onSubmit(vendaData);
    } catch (error) {
      console.error('Erro ao salvar venda:', error);
      // Mostrar erro mais específico para o usuário
      if (error instanceof Error) {
        alert(`Erro: ${error.message}`);
      } else {
        alert('Erro desconhecido ao salvar venda. Verifique se você está logado.');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="cliente_nome" className="block text-sm font-medium text-gray-700 mb-1">
            Nome do Cliente
          </label>
          <div className="relative">
          <input
            type="text"
            id="cliente_nome"
            name="cliente_nome"
            value={formData.cliente_nome}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-pink-50 focus:bg-white transition-colors"
            placeholder="Nome do cliente"
          />
          
          {buscandoCliente && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-pink-500"></div>
            </div>
          )}
            
            {/* Sugestões de clientes */}
            {clientesSugeridos.length > 0 && (
              <div className="absolute z-20 w-full mt-1 bg-white border border-pink-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                {clientesSugeridos.map(cliente => (
                  <button
                    key={cliente.id}
                    type="button"
                    onClick={() => selecionarCliente(cliente)}
                    className="w-full text-left px-3 py-2 hover:bg-pink-50 border-b border-pink-100 last:border-b-0"
                  >
                    <div className="font-medium text-gray-800">{cliente.nome}</div>
                    <div className="text-sm text-gray-600">{cliente.whatsapp}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
          </div>
        </div>

        <div>
          <label htmlFor="cliente_whatsapp" className="block text-sm font-medium text-gray-700 mb-1">
            WhatsApp
          </label>
          <input
            type="text"
            id="cliente_whatsapp"
            name="cliente_whatsapp"
            value={formData.cliente_whatsapp}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-pink-50 focus:bg-white transition-colors"
            placeholder="(11) 99999-9999"
          />

        </div>

        {/* Campos de Endereço */}
      <div className="bg-gradient-to-br from-blue-25 to-indigo-25 rounded-xl p-6 border border-blue-100">
        <div className="flex items-center mb-4">
          <MapPin className="w-5 h-5 text-blue-500 mr-2" />
          <h3 className="text-lg font-bold text-gray-800 font-serif">Endereço do Cliente</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="md:col-span-2">
            <label htmlFor="cliente_endereco" className="block text-sm font-medium text-gray-700 mb-1">
              Endereço
            </label>
            <input
              type="text"
              id="cliente_endereco"
              name="cliente_endereco"
              value={formData.cliente_endereco}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              placeholder="Rua, Avenida..."
            />
          </div>
          
          <div>
            <label htmlFor="cliente_numero" className="block text-sm font-medium text-gray-700 mb-1">
              Número
            </label>
            <input
              type="text"
              id="cliente_numero"
              name="cliente_numero"
              value={formData.cliente_numero}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              placeholder="123"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="cliente_cidade" className="block text-sm font-medium text-gray-700 mb-1">
              Cidade
            </label>
            <input
              type="text"
              id="cliente_cidade"
              name="cliente_cidade"
              value={formData.cliente_cidade}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              placeholder="São Paulo"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Pessoa
            </label>
            <div className="flex space-x-2">
              {(['Física', 'Jurídica'] as const).map((tipo) => (
                <button
                  key={tipo}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, cliente_tipo_pessoa: tipo }))}
                  className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all ${
                    formData.cliente_tipo_pessoa === tipo
                      ? 'border-blue-500 bg-blue-100 text-blue-800'
                      : 'border-gray-300 bg-white text-gray-600 hover:border-blue-300'
                  }`}
                >
                  {tipo === 'Física' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Formulário para novo cliente */}
      {/* Informações do cliente encontrado */}
      {clienteEncontrado && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <User className="w-5 h-5 text-green-600 mr-2" />
            <h3 className="font-medium text-green-800">Cliente Encontrado</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-green-700 font-medium">Tipo:</span> {clienteEncontrado.tipo_pessoa}
            </div>
            <div>
              <span className="text-green-700 font-medium">Total gasto:</span> {formatCurrency(clienteEncontrado.total_compras || 0)}
            </div>
            {clienteEncontrado.endereco_completo && (
              <div className="md:col-span-2">
                <span className="text-green-700 font-medium">Endereço:</span> {clienteEncontrado.endereco_completo}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="origem_venda" className="block text-sm font-medium text-gray-700 mb-1">
            Origem da Venda *
          </label>
          <select
            id="origem_venda"
            name="origem_venda"
            required
            value={formData.origem_venda}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-pink-50 focus:bg-white transition-colors"
          >
            <option value="WhatsApp">WhatsApp</option>
            <option value="Instagram">Instagram</option>
            <option value="iFood">iFood</option>
            <option value="Presencial">Presencial</option>
          </select>
        </div>

        <div>
          <label htmlFor="forma_pagamento" className="block text-sm font-medium text-gray-700 mb-1">
            Forma de Pagamento *
          </label>
          <select
            id="forma_pagamento"
            name="forma_pagamento"
            required
            value={formData.forma_pagamento}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-pink-50 focus:bg-white transition-colors"
          >
            <option value="PIX">PIX</option>
            <option value="Dinheiro">Dinheiro</option>
            <option value="Cartão">Cartão de Crédito/Débito</option>
            <option value="A Prazo">A Prazo</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="eh_revenda"
            name="eh_revenda"
            checked={formData.eh_revenda}
            onChange={handleChange}
            className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
          />
          <label htmlFor="eh_revenda" className="ml-2 block text-sm text-gray-700">
            É uma venda para revendedor?
          </label>
        </div>

        {formData.eh_revenda && (
          <div>
            <label htmlFor="revendedor_id" className="block text-sm font-medium text-gray-700 mb-1">
              Revendedor
            </label>
            <select
              id="revendedor_id"
              name="revendedor_id"
              value={formData.revendedor_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-pink-50 focus:bg-white transition-colors"
            >
              <option value="">Selecione um revendedor</option>
              {revendedores.map(revendedor => (
                <option key={revendedor.id} value={revendedor.id}>
                  {revendedor.nome}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Status *
          </label>
          <select
            id="status"
            name="status"
            required
            value={formData.status}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-pink-50 focus:bg-white transition-colors"
          >
            <option value="em_aberto">Em Aberto</option>
            <option value="pago">Pago</option>
            <option value="enviado">Enviado</option>
            <option value="concluido">Concluído</option>
          </select>
        </div>

        <div>
          <label htmlFor="data_venda" className="block text-sm font-medium text-gray-700 mb-1">
            Data da Venda *
          </label>
          <input
            type="date"
            id="data_venda"
            name="data_venda"
            required
            value={formData.data_venda}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-pink-50 focus:bg-white transition-colors"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-800">Itens da Venda</h3>
          <Button type="button" onClick={adicionarItem} size="sm">
            <Plus className="w-4 h-4" />
            <span>Adicionar Item</span>
          </Button>
        </div>

        <div className="space-y-3">
          {itens.map((item, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <select
                  value={item.produto_id}
                  onChange={(e) => atualizarItem(index, 'produto_id', e.target.value)}
                  className="w-full px-3 py-2 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white"
                  required
                >
                  <option value="">Selecione um produto</option>
                  {produtos.map(produto => (
                    <option key={produto.id} value={produto.id}>
                      {produto.nome} - {formatCurrency(
                        formData.eh_revenda && produto.preco_revenda 
                          ? produto.preco_revenda 
                          : produto.preco_venda
                      )}
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-24">
                <input
                  type="number"
                  min="1"
                  value={item.quantidade}
                  onChange={(e) => atualizarItem(index, 'quantidade', parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white"
                  placeholder="Qtd"
                  required
                />
              </div>

              <div className="w-32">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={item.preco_unitario}
                  onChange={(e) => atualizarItem(index, 'preco_unitario', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white"
                  placeholder="Preço"
                  required
                />
              </div>

              <div className="w-32 text-sm text-gray-600">
                {formatCurrency(item.subtotal)}
              </div>

              <button
                type="button"
                onClick={() => removerItem(index)}
                className="text-red-500 hover:text-red-700 transition-colors p-2 hover:bg-red-50 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {itens.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Calculator className="w-12 h-12 mx-auto mb-3 text-pink-300" />
              <p>Nenhum item adicionado ainda</p>
              <p className="text-sm">Clique em "Adicionar Item" para começar</p>
              {produtos.length === 0 && (
                <p className="text-sm text-red-500 mt-2">⚠️ Nenhum produto ativo encontrado</p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="bg-gradient-to-br from-pink-25 to-rose-25 rounded-xl p-6 border border-pink-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="frete" className="block text-sm font-medium text-gray-700 mb-1">
              Frete
            </label>
            <input
              type="number"
              id="frete"
              name="frete"
              step="0.01"
              min="0"
              value={formData.frete}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white"
              placeholder="0,00"
            />
          </div>

          <div>
            <label htmlFor="desconto" className="block text-sm font-medium text-gray-700 mb-1">
              Desconto
            </label>
            <input
              type="number"
              id="desconto"
              name="desconto"
              step="0.01"
              min="0"
              value={formData.desconto}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white"
              placeholder="0,00"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-pink-100">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-sm text-gray-600">Subtotal</div>
              <div className="text-lg font-semibold text-gray-800">
                {formatCurrency(subtotal)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Frete - Desconto</div>
              <div className="text-lg font-semibold text-blue-600">
                {formatCurrency(formData.frete - formData.desconto)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Total</div>
              <div className="text-xl font-bold text-pink-600">
                {formatCurrency(total)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button variant="secondary" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading || itens.length === 0}>
          {loading ? 'Salvando...' : (venda ? 'Atualizar' : 'Cadastrar')}
        </Button>
      </div>
    </form>
  );
};

export default VendaForm;