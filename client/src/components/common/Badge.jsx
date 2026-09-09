import React from 'react';

const Badge = ({ children, variant = 'default', size = 'sm', className = '' }) => {
  const variants = {
    default: 'bg-background-widget text-text-secondary border-border-primary/30',
    gold: 'bg-accent-orange/20 text-accent-bright border-accent-main/30',
    blue: 'bg-background-cardSecondary text-accent-light border-accent-light/20',
    success: 'bg-emerald-900/40 text-emerald-400 border-emerald-500/30',
    danger: 'bg-red-900/40 text-red-400 border-red-500/30',
    warning: 'bg-amber-900/40 text-amber-400 border-amber-500/30',
    verified: 'bg-gradient-to-r from-accent-orange/30 to-accent-main/20 text-accent-light border-accent-bright/30 font-bold',
  };

  const sizes = {
    xs: 'px-2.5 py-0.5 text-[9px] font-extrabold tracking-widest',
    sm: 'px-3 py-1 text-[10px] font-bold tracking-wider',
    md: 'px-4 py-1.5 text-xs font-bold tracking-tight',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-xl border uppercase ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
