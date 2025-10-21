import React from 'react';
import { Bell, User, Search, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const { signOut, user } = useAuth();
  return (
    <header className="bg-white shadow-lg border-b border-pink-100 px-6 py-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 font-serif">{title}</h1>
          <p className="text-sm text-pink-600 mt-1 font-medium">
            {new Date().toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-pink-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar..."
              className="pl-10 pr-4 py-2 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-pink-50 focus:bg-white transition-colors"
            />
          </div>
          
          <button className="relative p-2 text-gray-600 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-all hover:shadow-md">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-pink-500 rounded-full animate-pulse"></span>
          </button>
          
          <div className="flex items-center space-x-2 p-2 text-gray-600 bg-pink-50 rounded-lg">
            <User className="w-5 h-5" />
            <span className="text-sm font-medium">{user?.email?.split('@')[0] || 'Admin'}</span>
          </div>

          <button
            onClick={() => signOut()}
            className="flex items-center space-x-2 p-2 text-gray-600 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-all hover:shadow-md"
            title="Sair"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;