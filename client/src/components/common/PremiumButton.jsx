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
    'inline-flex items-center justify-center font-outfit font-black rounded-2xl transition-all duration-300 ' +
    'active:scale-95 disabled:opacity-50 disabled:pointer-events-none disabled:transform-none ' +
    'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent-main/30 ' +
    'touch-manipulation select-none tracking-widest uppercase';

  const variants = {
    gold:    'bg-gradient-to-r from-[#F4510B] to-[#FF7A18] text-white shadow-xl shadow-black/20 border-2 border-[#FF7A18]/30 hover:shadow-[#F4510B]/40 hover:-translate-y-1',
    ai:      'bg-[#F97316] text-white shadow-xl shadow-black/20 border-2 border-[#FF7A18]/30 hover:bg-[#FF7A18] hover:-translate-y-1',
    outline: 'bg-[#080808]/80 border-2 border-[#8F3208] text-[#FF9A4D] hover:border-[#FF7A18] hover:bg-[#080808] hover:-translate-y-1',
    danger:  'bg-red-600 text-white shadow-lg border-2 border-red-500/30 hover:bg-red-700 hover:-translate-y-1',
    ghost:   'bg-transparent text-text-secondary hover:text-text-primary hover:bg-white/5',
  };

  const sizes = {
    xs: 'px-3 py-1.5 text-[9px] gap-1.5 min-h-[36px]',
    sm: 'px-4 py-2.5 text-[10px] gap-2 min-h-[42px]',
    md: 'px-6 py-3 text-xs gap-2.5 min-h-[48px]',
    lg: 'px-8 py-4 text-sm gap-3 min-h-[56px] rounded-3xl',
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
        <Icon className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
      ) : null}
      <span className="truncate">{children}</span>
    </button>
  );
};

export default PremiumButton;
