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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      {/* Background Overlay click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      <div
        className={`relative w-full ${maxWidth} mx-auto !bg-background-cardSecondary rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.9)] border border-border-primary/40 overflow-hidden max-h-[90vh] flex flex-col z-10`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 sm:px-10 sm:py-8 border-b border-white/5 bg-background-widget/20 shrink-0">
          <h3 className="text-xl sm:text-2xl font-sora font-black text-white tracking-tighter uppercase">{title}</h3>
          <button
            onClick={onClose}
            className="p-3 rounded-2xl bg-background-widget text-text-muted hover:text-accent-bright border border-white/5 transition-all shadow-xl"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-10 overflow-y-auto flex-1 custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
