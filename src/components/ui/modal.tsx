'use client';

import { X } from 'lucide-react';
import { ReactNode, useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-slate-950/40 animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-white/10 rounded-[40px] p-10 max-w-lg w-full shadow-3xl relative scale-in-center animate-in zoom-in-95 duration-300 overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 relative z-10">
          <h2 className="text-2xl font-black text-white tracking-tight italic">{title || 'Attention'}</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/5 bg-slate-800 rounded-2xl transition-all border border-white/5 active:scale-95 group"
          >
            <X className="w-5 h-5 text-slate-400 group-hover:text-white group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>
        
        {/* Content */}
        <div className="relative z-10 font-medium text-slate-300 leading-relaxed">
          {children}
        </div>

        {/* Ambient Glow */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
      </div>
    </div>
  );
}
