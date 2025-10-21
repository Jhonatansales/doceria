import React, { useState, useEffect } from 'react';
import { Settings, Save, Upload, X } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { isSupabaseReady } from '../lib/supabase';
import { configuracoesService, Configuracao } from '../services/configuracoesService';

const Configuracoes: React.FC = () => {
  const [formData, setFormData] = useState({
    nome_confeitaria: 'Delicias da Dri',
    contato_whatsapp: '',
    chave_pix: '',
    margem_lucro_padrao: 35,
    custo_embalagem_padrao: 0,
    logo_url: ''
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');

  useEffect(() => {
    loadConfiguracoes();
  }, []);

  const loadConfiguracoes = async () => {
    setLoading(true);
    try {
      const config = await configuracoesService.get();
      if (config) {
        setFormData({
          nome_confeitaria: config.nome_confeitaria,
          contato_whatsapp: config.contato_whatsapp || '',
          chave_pix: config.chave_pix || '',
          margem_lucro_padrao: config.margem_lucro_padrao,
          custo_embalagem_padrao: config.custo_embalagem_padrao,
          logo_url: config.logo_url || ''
        });
        if (config.logo_url) {
          setLogoPreview(config.logo_url);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('margem') || name.includes('custo') 
        ? parseFloat(value) || 0 
        : value
    }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('A imagem deve ter no máximo 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione um arquivo de imagem');
        return;
      }

      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview('');
    setFormData(prev => ({ ...prev, logo_url: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      let logoUrl = formData.logo_url;

      if (logoFile && logoPreview) {
        logoUrl = logoPreview;
      }

      await configuracoesService.createOrUpdate({
        ...formData,
        logo_url: logoUrl || ''
      });
      alert('Configurações salvas com sucesso!');
      setLogoFile(null);
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      alert('Erro ao salvar configurações. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  // Show configuration message if Supabase is not ready
  if (!isSupabaseReady()) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Configuração Necessária</h2>
        <p className="text-gray-600 mb-4">
          Para usar o sistema, você precisa configurar sua conexão com o Supabase.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left max-w-md mx-auto">
          <h3 className="font-semibold text-blue-800 mb-2">Como configurar:</h3>
          <ol className="text-sm text-blue-700 space-y-1">
            <li>1. Clique no ícone de configurações no topo do preview</li>
            <li>2. Clique no botão "Supabase"</li>
            <li>3. Configure sua URL e chave do Supabase</li>
            <li>4. As tabelas serão criadas automaticamente</li>
          </ol>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <Card 
      title="Configurações do Sistema" 
      icon={<Settings className="w-5 h-5 text-orange-500" />}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-6 border border-orange-200 mb-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Logo da Empresa</h3>
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload do Logo
              </label>
              <div className="border-2 border-dashed border-orange-300 rounded-lg p-6 text-center hover:border-orange-500 transition-colors cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                  id="logo-upload"
                />
                <label htmlFor="logo-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 mx-auto mb-3 text-orange-400" />
                  <p className="text-sm text-gray-600">Clique para selecionar uma imagem</p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG até 5MB</p>
                </label>
              </div>
            </div>

            {logoPreview && (
              <div className="flex-shrink-0">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pré-visualização
                </label>
                <div className="relative bg-white rounded-lg border-2 border-orange-200 p-4">
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="w-32 h-32 object-contain"
                  />
                  <button
                    type="button"
                    onClick={removeLogo}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-3">
            O logo será exibido em todas as vendas e orçamentos ao lado do nome da empresa
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="nome_confeitaria" className="block text-sm font-medium text-gray-700 mb-1">
              Nome da Confeitaria *
            </label>
            <input
              type="text"
              id="nome_confeitaria"
              name="nome_confeitaria"
              required
              value={formData.nome_confeitaria}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Nome da sua confeitaria"
            />
          </div>

          <div>
            <label htmlFor="contato_whatsapp" className="block text-sm font-medium text-gray-700 mb-1">
              WhatsApp para Contato
            </label>
            <input
              type="text"
              id="contato_whatsapp"
              name="contato_whatsapp"
              value={formData.contato_whatsapp}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="(11) 99999-9999"
            />
          </div>
        </div>

        <div>
          <label htmlFor="chave_pix" className="block text-sm font-medium text-gray-700 mb-1">
            Chave PIX
          </label>
          <input
            type="text"
            id="chave_pix"
            name="chave_pix"
            value={formData.chave_pix}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="Sua chave PIX (CPF, e-mail, telefone ou chave aleatória)"
          />
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-800">Meta de Lucro</h3>
            <div className="flex space-x-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => setFormData(prev => ({ ...prev, margem_lucro_padrao: 35 }))}>
                Editar
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="margem_lucro_padrao" className="block text-sm font-medium text-gray-700 mb-1">
                Margem de Lucro Padrão (%)
              </label>
              <input
                type="number"
                id="margem_lucro_padrao"
                name="margem_lucro_padrao"
                step="0.1"
                min="0"
                value={formData.margem_lucro_padrao}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                placeholder="35"
              />
              <p className="text-xs text-gray-500 mt-1">
                Margem aplicada automaticamente nos novos produtos
              </p>
            </div>

            <div>
              <label htmlFor="custo_embalagem_padrao" className="block text-sm font-medium text-gray-700 mb-1">
                Custo de Embalagem Padrão (R$)
              </label>
              <input
                type="number"
                id="custo_embalagem_padrao"
                name="custo_embalagem_padrao"
                step="0.01"
                min="0"
                value={formData.custo_embalagem_padrao}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                placeholder="0,00"
              />
              <p className="text-xs text-gray-500 mt-1">
                Custo adicional aplicado automaticamente nos novos produtos
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            <Save className="w-4 h-4" />
            <span>{saving ? 'Salvando...' : 'Salvar Configurações'}</span>
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default Configuracoes;