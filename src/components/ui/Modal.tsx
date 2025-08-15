import React from 'react';
import { cn } from '../../lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-lightCard dark:bg-darkCard rounded-xl shadow-modal p-8 min-w-[320px] max-w-lg w-full relative">
        <button
          className="absolute top-4 right-4 text-gray-600 dark:text-gray-400 hover:text-accent text-2xl font-bold focus:outline-none"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        {title && <h2 className="text-xl font-bold mb-4">{title}</h2>}
        <div>{children}</div>
      </div>
    </div>
  );
}; 