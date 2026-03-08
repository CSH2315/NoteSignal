import { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />
      <div className="fixed inset-x-4 top-[50%] -translate-y-[50%] bg-white rounded-2xl z-50 p-6 shadow-xl max-w-sm mx-auto animate-in fade-in zoom-in duration-200">
        <h2 className="text-xl font-bold mb-4 text-gray-900">{title}</h2>
        {children}
      </div>
    </>
  );
}
