import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  icon?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ children, className = '', title, icon }) => {
  return (
    <div className={`bg-white rounded-xl shadow-lg border border-pink-100 hover:shadow-xl transition-all duration-300 ${className}`}>
      {title && (
        <div className="flex items-center space-x-3 p-6 border-b border-pink-50 bg-gradient-to-r from-pink-25 to-rose-25 rounded-t-xl">
          {icon}
          <h3 className="text-xl font-bold text-gray-800 font-serif">{title}</h3>
        </div>
      )}
      <div className={`${title ? 'p-6' : 'p-6'}`}>
        {children}
      </div>
    </div>
  );
};

export default Card;