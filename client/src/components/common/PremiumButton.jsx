import React from 'react';

const PremiumButton = ({
  children,
  variant = 'gold', // 'gold' | 'ai' | 'outline' | 'danger' | 'ghost'
  size = 'md',      // 'xs' | 'sm' | 'md' | 'lg'
  icon: Icon,
  loading = false,
  fullWidth = false,
  className = '',
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center font-outfit font-semibold rounded-full transition-all duration-200 ' +
    'active:scale-95 disabled:opacity-50 disabled:pointer-events-none disabled:transform-none ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ' +
    'touch-manipulation select-none';

  const variants = {
    gold:    'bg-gradient-to-r from-accent-gold to-accent-goldLight text-text-primary shadow-md shadow-accent-gold/25 hover:shadow-accent-gold/40 hover:-translate-y-0.5 focus-visible:ring-accent-gold',
    ai:      'bg-gradient-to-r from-accent-blue to-blue-600 text-white shadow-md shadow-accent-blue/25 hover:shadow-accent-blue/40 hover:-translate-y-0.5 focus-visible:ring-accent-blue',
    outline: 'bg-white/80 border border-accent-gold/40 text-text-primary hover:border-accent-gold hover:bg-white hover:-translate-y-0.5 shadow-sm focus-visible:ring-accent-gold',
    danger:  'bg-gradient-to-r from-accent-red to-red-600 text-white shadow-md shadow-accent-red/25 hover:shadow-accent-red/40 hover:-translate-y-0.5 focus-visible:ring-accent-red',
    ghost:   'bg-transparent text-text-secondary hover:text-text-primary hover:bg-black/5 focus-visible:ring-gray-400',
  };

  // Touch-friendly minimum heights
  const sizes = {
    xs: 'px-3 py-1.5 text-[11px] gap-1 min-h-[36px]',
    sm: 'px-4 py-2 text-xs gap-1.5 min-h-[40px]',
    md: 'px-5 py-2.5 text-sm gap-2 min-h-[44px]',
    lg: 'px-7 py-3.5 text-base gap-2.5 min-h-[52px]',
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
        <span className="inline-block animate-spin rounded-full h-3.5 w-3.5 border-2 border-current border-t-transparent" />
      ) : Icon ? (
        <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
      ) : null}
      {children}
    </button>
  );
};

export default PremiumButton;
