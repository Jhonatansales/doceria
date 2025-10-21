import React, { useEffect } from 'react';
import { Check, X, CheckCircle } from 'lucide-react';
import Button from './Button';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  autoClose?: boolean;
  autoCloseDelay?: number;
  actionButton?: {
    text: string;
    onClick: () => void;
  };
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  autoClose = false,
  autoCloseDelay = 3000,
  actionButton
}) => {
  useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, autoCloseDelay, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-100">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-green-900">{title}</h3>
              </div>
            </div>
            {!autoClose && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="mb-8">
            <p className="text-gray-600 leading-relaxed">{message}</p>
          </div>

          <div className="flex justify-end space-x-3">
            {actionButton && (
              <Button 
                variant="primary"
                onClick={actionButton.onClick}
                className="min-w-[100px]"
              >
                {actionButton.text}
              </Button>
            )}
            {!autoClose && (
              <Button 
                variant="secondary"
                onClick={onClose}
                className="min-w-[100px]"
              >
                Fechar
              </Button>
            )}
          </div>

          {autoClose && (
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                Esta mensagem será fechada automaticamente em {autoCloseDelay / 1000} segundos
              </p>
              <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                <div 
                  className="bg-green-500 h-1 rounded-full transition-all duration-300 ease-linear"
                  style={{ 
                    animation: `shrink ${autoCloseDelay}ms linear forwards`
                  }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default SuccessModal;