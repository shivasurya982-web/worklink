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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2.5 sm:p-6 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      {/* Background Overlay click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      <div
        className={`relative w-full ${maxWidth} mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden max-h-[90dvh] flex flex-col z-10`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-100 bg-slate-50 shrink-0 gap-3">
          <h3 className="text-sm sm:text-lg font-sora font-bold text-slate-900 tracking-tight uppercase break-words min-w-0 flex-1">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white text-slate-400 hover:text-slate-900 border border-slate-200 transition-all shadow-xs cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-8 overflow-y-auto flex-1 custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
