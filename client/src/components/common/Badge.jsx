import React from 'react';

const Badge = ({ children, variant = 'default', size = 'sm', className = '' }) => {
  const variants = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    gold: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    orange: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    blue: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    danger: 'bg-red-50 text-red-700 border-red-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    verified: 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-xs',
  };

  const sizes = {
    xs: 'px-2 py-0.5 text-[9px] font-bold tracking-wider',
    sm: 'px-2.5 py-1 text-[10px] font-bold tracking-wider',
    md: 'px-3 py-1 text-xs font-bold tracking-tight',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border uppercase ${variants[variant] || variants.default} ${sizes[size]} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
