import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/30 backdrop-blur-md animate-fade-in">
      {/* Background Overlay click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      <div
        className={`relative w-full ${maxWidth} mx-auto bg-white/85 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white/60 overflow-hidden max-h-[90vh] flex flex-col z-10`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 sm:px-8 sm:py-6 border-b border-gray-100 bg-blue-50/40 shrink-0">
          <h3 className="text-lg sm:text-xl font-sora font-black text-text-primary tracking-tight uppercase">{title}</h3>
          <button
            onClick={onClose}
            className="p-2.5 rounded-2xl bg-white text-text-muted hover:text-accent-main border border-gray-200 hover:border-accent-main transition-all shadow-sm"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
