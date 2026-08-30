import React from 'react';

const Badge = ({ children, variant = 'default', size = 'sm', className = '' }) => {
  const variants = {
    default: 'bg-gray-100 text-text-secondary border-gray-200',
    gold: 'bg-amber-50 text-amber-700 border-amber-200/60',
    blue: 'bg-blue-50 text-blue-700 border-blue-200/60',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    danger: 'bg-red-50 text-red-700 border-red-200/60',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200/60',
    verified: 'bg-gradient-to-r from-accent-gold/15 to-accent-gold/25 text-amber-800 border-accent-gold/40 font-semibold',
  };

  const sizes = {
    xs: 'px-2 py-0.5 text-[10px]',
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-outfit ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
