import React from 'react';

const PremiumButton = ({
  children,
  variant = 'gold', // 'gold' | 'black' | 'ai' | 'outline' | 'danger' | 'ghost' | 'glass'
  size = 'md',      // 'xs' | 'sm' | 'md' | 'lg'
  icon: Icon,
  loading = false,
  fullWidth = false,
  className = '',
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center font-sora font-bold transition-all duration-200 ' +
    'active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none ' +
    'focus:outline-none touch-manipulation select-none tracking-wider uppercase cursor-pointer rounded-xl';

  const variants = {
    gold:    'bg-orange-600 text-white shadow-xs border border-orange-600 hover:bg-orange-700 hover:border-orange-700',
    primary: 'bg-orange-600 text-white shadow-xs border border-orange-600 hover:bg-orange-700 hover:border-orange-700',
    black:   'bg-slate-900 text-white shadow-xs border border-slate-900 hover:bg-slate-800',
    ai:      'bg-orange-600 text-white shadow-xs border border-orange-600 hover:bg-orange-700',
    outline: 'bg-white border border-slate-200 text-slate-800 shadow-xs hover:bg-orange-50 hover:border-orange-300 hover:text-orange-600',
    danger:  'bg-red-50 border border-red-200 text-red-600 hover:bg-red-600 hover:text-white',
    ghost:   'bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100',
    glass:   'bg-orange-50 border border-orange-200 text-orange-700 hover:bg-orange-100 shadow-xs',
  };

  const sizes = {
    xs: 'px-3 py-1.5 text-[10px] gap-1.5 min-h-[32px]',
    sm: 'px-4 py-2 text-xs gap-2 min-h-[38px]',
    md: 'px-6 py-2.5 text-xs gap-2.5 min-h-[44px]',
    lg: 'px-8 py-3.5 text-xs gap-3 min-h-[50px]',
  };

  return (
    <button
      className={`${base} ${variants[variant] ?? variants.gold} ${sizes[size] ?? sizes.md} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
      <span className="truncate">{children}</span>
    </button>
  );
};

export default PremiumButton;
