import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ChefHat, 
  ShoppingBag, 
  ShoppingCart, 
  Users, 
  Calendar,
  TrendingUp,
  Settings,
  Cake,
  UserCheck,
  User,
  FileText
} from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'insumos', label: 'Insumos', icon: Package },
  { id: 'receitas', label: 'Receitas', icon: ChefHat },
  { id: 'produtos', label: 'Produtos', icon: ShoppingBag },
  { id: 'vendas', label: 'Vendas', icon: ShoppingCart },
  { id: 'orcamentos', label: 'Orçamentos', icon: FileText },
  { id: 'clientes', label: 'Clientes', icon: User },
  { id: 'revendedores', label: 'Revendedores', icon: UserCheck },
  { id: 'cronograma', label: 'Cronograma', icon: Calendar },
  { id: 'gastos', label: 'Gastos', icon: TrendingUp },
  { id: 'configuracoes', label: 'Configurações', icon: Settings },
];

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onPageChange }) => {
  return (
    <aside className="w-64 bg-gradient-to-b from-pink-50 to-rose-100 shadow-xl min-h-screen border-r border-pink-200">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg">
            <Cake className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800 font-serif">Delicias da Dri</h2>
            <p className="text-sm text-pink-600 font-medium">Gestão Premium</p>
          </div>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-700 hover:bg-white hover:shadow-md hover:scale-102 hover:text-pink-600'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-pink-500'}`} />
                <span className="font-medium font-sans">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;