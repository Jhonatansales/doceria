import React from 'react';
import { Calendar, Plus, ChevronLeft, ChevronRight, Clock, Play, Check, Trash2 } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import { CronogramaItem } from '../../types';

interface CronogramaWeekProps {
  itens: CronogramaItem[];
  currentWeek: Date;
  onWeekChange: (date: Date) => void;
  onAddItem: (date: string) => void;
  onStatusChange: (id: string, status: 'pendente' | 'em_producao' | 'concluido') => void;
  onDelete: (id: string) => void;
}

const CronogramaWeek: React.FC<CronogramaWeekProps> = ({
  itens,
  currentWeek,
  onWeekChange,
  onAddItem,
  onStatusChange,
  onDelete
}) => {
  const getWeekDays = (date: Date) => {
    const start = new Date(date);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    start.setDate(diff);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const currentDay = new Date(start);
      currentDay.setDate(start.getDate() + i);
      days.push(currentDay);
    }
    return days;
  };

  const weekDays = getWeekDays(currentWeek);
  const dayNames = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

  const getItemsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return itens.filter(item => item.data_producao === dateString);
  };

  const previousWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() - 7);
    onWeekChange(newDate);
  };

  const nextWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + 7);
    onWeekChange(newDate);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'em_producao':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'concluido':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pendente':
        return <Clock className="w-4 h-4" />;
      case 'em_producao':
        return <Play className="w-4 h-4" />;
      case 'concluido':
        return <Check className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <Card 
      title="Cronograma de Produção" 
      icon={<Calendar className="w-5 h-5 text-pink-500" />}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={previousWeek}
            className="p-2 hover:bg-pink-50 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-pink-600" />
          </button>
          <h3 className="text-lg font-bold text-gray-800">
            {weekDays[0].toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} - {' '}
            {weekDays[6].toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
          </h3>
          <button
            onClick={nextWeek}
            className="p-2 hover:bg-pink-50 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-pink-600" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {weekDays.map((day, index) => {
          const dayItems = getItemsForDate(day);
          const isToday = day.toDateString() === new Date().toDateString();

          return (
            <div
              key={index}
              className={`bg-gradient-to-br from-pink-25 to-rose-25 rounded-xl p-4 border min-h-[300px] ${
                isToday ? 'border-pink-300 bg-pink-50' : 'border-pink-100'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-bold text-gray-800">{dayNames[index]}</h4>
                  <p className="text-sm text-gray-600">
                    {day.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                  </p>
                </div>
                <button
                  onClick={() => onAddItem(day.toISOString().split('T')[0])}
                  className="p-2 hover:bg-pink-100 rounded-lg transition-colors"
                  title="Agendar produção"
                >
                  <Plus className="w-4 h-4 text-pink-600" />
                </button>
              </div>

              <div className="space-y-3">
                {dayItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-lg p-3 border border-pink-100 shadow-sm"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-800 text-sm">
                          {item.receita?.nome}
                        </h5>
                        <p className="text-xs text-gray-600">
                          {item.quantidade_lotes} lote(s)
                        </p>
                        {item.horario && (
                          <p className="text-xs text-pink-600 mt-1">
                            {item.horario}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => onDelete(item.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center space-x-1 ${getStatusColor(item.status)}`}>
                        {getStatusIcon(item.status)}
                        <span className="capitalize">{item.status.replace('_', ' ')}</span>
                      </div>

                      {item.status === 'pendente' && (
                        <button
                          onClick={() => onStatusChange(item.id, 'em_producao')}
                          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Iniciar
                        </button>
                      )}

                      {item.status === 'em_producao' && (
                        <button
                          onClick={() => onStatusChange(item.id, 'concluido')}
                          className="text-xs text-green-600 hover:text-green-700 font-medium"
                        >
                          Concluir
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {dayItems.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-xs">Nenhuma produção agendada</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default CronogramaWeek;