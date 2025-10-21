import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

interface InsumoReceita {
  nome: string;
  quantidade: number;
  unidade: string;
}

interface ReceitaData {
  nome: string;
  rendimento: number;
  insumos: InsumoReceita[];
  sub_receita?: {
    nome: string;
    porcoes: number;
  };
}

const receitasData: ReceitaData[] = [
  {
    nome: 'Torta de Limão',
    rendimento: 9,
    insumos: [
      { nome: 'Limão', quantidade: 300, unidade: 'g' },
      { nome: 'Creme de Leite', quantidade: 200, unidade: 'g' },
      { nome: 'Leite Condensado', quantidade: 525, unidade: 'g' },
      { nome: 'Chantilly', quantidade: 350, unidade: 'ml' },
      { nome: 'Leite em Pó', quantidade: 100, unidade: 'g' },
      { nome: 'Bolacha Maisena', quantidade: 117, unidade: 'g' },
      { nome: 'Manteiga/Margarina', quantidade: 20, unidade: 'g' }
    ]
  },
  {
    nome: 'Banoffee',
    rendimento: 6,
    insumos: [
      { nome: 'Doce de Leite Frimesa', quantidade: 400, unidade: 'g' },
      { nome: 'Creme de Leite', quantidade: 200, unidade: 'g' },
      { nome: 'Bolacha Maisena', quantidade: 117, unidade: 'g' },
      { nome: 'Manteiga/Margarina', quantidade: 15, unidade: 'g' },
      { nome: 'Banana', quantidade: 450, unidade: 'g' },
      { nome: 'Chantilly', quantidade: 350, unidade: 'ml' },
      { nome: 'Leite em Pó', quantidade: 100, unidade: 'g' },
      { nome: 'Leite Condensado', quantidade: 130, unidade: 'g' }
    ]
  },
  {
    nome: 'Base de Brownie',
    rendimento: 30,
    insumos: [
      { nome: 'Ovo', quantidade: 4, unidade: 'un' },
      { nome: 'Açúcar', quantidade: 360, unidade: 'g' },
      { nome: 'Óleo', quantidade: 100, unidade: 'ml' },
      { nome: 'Chocolate em Pó', quantidade: 135, unidade: 'g' },
      { nome: 'Farinha de Trigo', quantidade: 120, unidade: 'g' },
      { nome: 'Manteiga/Margarina', quantidade: 15, unidade: 'g' }
    ]
  },
  {
    nome: 'Copo da Felicidade',
    rendimento: 7,
    insumos: [
      { nome: 'Morango (Caixinha)', quantidade: 1, unidade: 'un' },
      { nome: 'Granule', quantidade: 60, unidade: 'g' },
      { nome: 'Leite Condensado', quantidade: 790, unidade: 'g' },
      { nome: 'Creme de Leite', quantidade: 800, unidade: 'g' },
      { nome: 'Chocolate em Pó', quantidade: 100, unidade: 'g' },
      { nome: 'Manteiga/Margarina', quantidade: 30, unidade: 'g' },
      { nome: 'Leite em Pó', quantidade: 100, unidade: 'g' }
    ],
    sub_receita: {
      nome: 'Base de Brownie',
      porcoes: 5
    }
  },
  {
    nome: 'Torta Holandesa',
    rendimento: 8,
    insumos: [
      { nome: 'Barra de Chocolate', quantidade: 200, unidade: 'g' },
      { nome: 'Creme de Leite', quantidade: 400, unidade: 'g' },
      { nome: 'Leite Condensado', quantidade: 395, unidade: 'g' },
      { nome: 'Essência de Baunilha', quantidade: 15, unidade: 'ml' },
      { nome: 'Chantilly', quantidade: 350, unidade: 'ml' },
      { nome: 'Bolacha Maisena', quantidade: 117, unidade: 'g' },
      { nome: 'Manteiga/Margarina', quantidade: 20, unidade: 'g' },
      { nome: 'Bolacha Calipso', quantidade: 135, unidade: 'g' }
    ]
  }
];

async function getOrCreateInsumo(nomeInsumo: string, unidade: string): Promise<string> {
  const { data: existingInsumo } = await supabase
    .from('insumos')
    .select('id')
    .ilike('nome', nomeInsumo)
    .maybeSingle();

  if (existingInsumo) {
    return existingInsumo.id;
  }

  const { data: newInsumo, error } = await supabase
    .from('insumos')
    .insert({
      nome: nomeInsumo,
      unidade_compra: unidade,
      quantidade_estoque: 0,
      preco_unitario: 0
    })
    .select()
    .single();

  if (error) throw error;
  return newInsumo.id;
}

async function createOrUpdateReceita(receitaData: ReceitaData): Promise<void> {
  console.log(`Processando receita: ${receitaData.nome}`);

  const { data: existingReceita } = await supabase
    .from('receitas')
    .select('id')
    .eq('nome', receitaData.nome)
    .maybeSingle();

  const ingredientes = [];
  let custoTotal = 0;

  for (const insumo of receitaData.insumos) {
    const insumoId = await getOrCreateInsumo(insumo.nome, insumo.unidade);

    const { data: insumoData } = await supabase
      .from('insumos')
      .select('preco_unitario')
      .eq('id', insumoId)
      .single();

    const custoIngrediente = insumo.quantidade * (insumoData?.preco_unitario || 0);
    custoTotal += custoIngrediente;

    ingredientes.push({
      insumo_id: insumoId,
      quantidade_usada: insumo.quantidade,
      custo_ingrediente: custoIngrediente
    });
  }

  if (receitaData.sub_receita) {
    const { data: subReceita } = await supabase
      .from('receitas')
      .select('id, custo_total, rendimento')
      .eq('nome', receitaData.sub_receita.nome)
      .maybeSingle();

    if (subReceita) {
      const custoSubReceita = (subReceita.custo_total / subReceita.rendimento) * receitaData.sub_receita.porcoes;
      custoTotal += custoSubReceita;
    }
  }

  const margemLucro = 35;
  const precoVenda = custoTotal * (1 + margemLucro / 100);
  const precoRevenda = precoVenda * 0.8;

  if (existingReceita) {
    await supabase
      .from('receitas')
      .update({
        rendimento: receitaData.rendimento,
        custo_total: custoTotal,
        margem_lucro: margemLucro,
        preco_venda: precoVenda,
        preco_revenda: precoRevenda,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingReceita.id);

    await supabase
      .from('receita_ingredientes')
      .delete()
      .eq('receita_id', existingReceita.id);

    const ingredientesComReceitaId = ingredientes.map(ing => ({
      ...ing,
      receita_id: existingReceita.id
    }));

    await supabase
      .from('receita_ingredientes')
      .insert(ingredientesComReceitaId);

    console.log(`✓ Receita atualizada: ${receitaData.nome}`);
  } else {
    const { data: newReceita, error: receitaError } = await supabase
      .from('receitas')
      .insert({
        nome: receitaData.nome,
        modo_preparo: '',
        rendimento: receitaData.rendimento,
        custo_total: custoTotal,
        custos_adicionais: 0,
        margem_lucro: margemLucro,
        preco_venda: precoVenda,
        preco_revenda: precoRevenda,
        estoque_produto_final: 0
      })
      .select()
      .single();

    if (receitaError) throw receitaError;

    const ingredientesComReceitaId = ingredientes.map(ing => ({
      ...ing,
      receita_id: newReceita.id
    }));

    await supabase
      .from('receita_ingredientes')
      .insert(ingredientesComReceitaId);

    console.log(`✓ Receita criada: ${receitaData.nome}`);
  }
}

async function populateReceitas() {
  console.log('Iniciando população de receitas...\n');

  try {
    for (const receita of receitasData) {
      await createOrUpdateReceita(receita);
    }

    console.log('\n✓ Todas as receitas foram processadas com sucesso!');
  } catch (error) {
    console.error('Erro ao popular receitas:', error);
    throw error;
  }
}

populateReceitas();
