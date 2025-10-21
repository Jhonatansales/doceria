import React, { useState } from 'react';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import Insumos from './pages/Insumos';
import Receitas from './pages/Receitas';
import Produtos from './pages/Produtos';
import Vendas from './pages/Vendas';
import Gastos from './pages/Gastos';
import Configuracoes from './pages/Configuracoes';
import Revendedores from './pages/Revendedores';
import Clientes from './pages/Clientes';
import Cronograma from './pages/Cronograma';
import Orcamentos from './pages/Orcamentos';
import ChatAssistant from './components/chat/ChatAssistant';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const getPageTitle = (page: string) => {
    const titles: { [key: string]: string } = {
      dashboard: 'Dashboard',
      insumos: 'Gestão de Insumos',
      receitas: 'Receitas',
      produtos: 'Catálogo de Produtos',
      vendas: 'Vendas',
      clientes: 'Gestão de Clientes',
      revendedores: 'Revendedores',
      cronograma: 'Cronograma de Produção',
      orcamentos: 'Orçamentos',
      gastos: 'Gestão de Gastos',
      configuracoes: 'Configurações'
    };
    return titles[page] || 'Delicias da Dri';
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'insumos':
        return <Insumos />;
      case 'receitas':
        return <Receitas />;
      case 'produtos':
        return <Produtos />;
      case 'vendas':
        return <Vendas />;
      case 'clientes':
        return <Clientes />;
      case 'revendedores':
        return <Revendedores />;
      case 'cronograma':
        return <Cronograma />;
      case 'orcamentos':
        return <Orcamentos />;
      case 'gastos':
        return <Gastos />;
      case 'configuracoes':
        return <Configuracoes />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-25 via-white to-rose-25 flex">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />

      <div className="flex-1 flex flex-col">
        <Header title={getPageTitle(currentPage)} />

        <main className="flex-1 p-6">
          {renderPage()}
        </main>
      </div>

      <ChatAssistant />
    </div>
  );
};

export default App;