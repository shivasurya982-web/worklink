import React from 'react';

const Badge = ({ children, variant = 'default', size = 'sm', className = '' }) => {
  const variants = {
    default: 'bg-blue-50/80 text-text-secondary border-blue-100',
    gold: 'bg-blue-100/80 text-accent-main border-blue-200',
    blue: 'bg-blue-100/80 text-accent-main border-blue-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    danger: 'bg-red-50 text-red-700 border-red-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    verified: 'bg-blue-600 text-white border-blue-600 font-bold shadow-sm',
  };

  const sizes = {
    xs: 'px-2.5 py-0.5 text-[9px] font-extrabold tracking-widest',
    sm: 'px-3 py-1 text-[10px] font-bold tracking-wider',
    md: 'px-4 py-1.5 text-xs font-bold tracking-tight',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-xl border uppercase ${variants[variant] || variants.default} ${sizes[size]} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
