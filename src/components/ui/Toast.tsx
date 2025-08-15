import React from 'react';
import { cn } from '../../lib/utils';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

interface ToastProps {
  title?: string;
  description?: string;
  message?: string;
  type?: 'success' | 'error' | 'info';
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({ 
  title, 
  description, 
  message, 
  type = 'info', 
  onClose 
}) => {
  const base = 'fixed bottom-8 right-8 z-50 p-4 rounded-lg shadow-lg border transition-all duration-300 max-w-sm';
  const variants = {
    success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200',
    error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',
  };

  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <XCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
  };

  return (
    <div className={cn(base, variants[type])}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {icons[type]}
        </div>
        <div className="flex-1 min-w-0">
          {title && (
            <p className="text-sm font-semibold mb-1">{title}</p>
          )}
          {description && (
            <p className="text-sm opacity-90">{description}</p>
          )}
          {message && !title && !description && (
            <p className="text-sm">{message}</p>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 ml-2 text-current opacity-70 hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};