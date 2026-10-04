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
    'inline-flex items-center justify-center font-sora font-black transition-all duration-200 ' +
    'active:scale-95 disabled:opacity-40 disabled:pointer-events-none ' +
    'focus:outline-none touch-manipulation select-none tracking-[0.12em] uppercase cursor-pointer rounded-full';

  const variants = {
    black:   'bg-gradient-to-b from-[#2C2C2E] to-[#1C1C1E] text-white shadow-md border border-[#3A3A3C] hover:from-[#3A3A3C] hover:to-[#2C2C2E] hover:-translate-y-0.5',
    gold:    'bg-gradient-to-b from-[#2C2C2E] to-[#1C1C1E] text-white shadow-md border border-[#3A3A3C] hover:from-[#3A3A3C] hover:to-[#2C2C2E] hover:-translate-y-0.5',
    orange:  'bg-gradient-to-b from-[#FF8A3D] to-[#F97316] text-white shadow-md border border-[#FF8A3D] hover:from-[#FF9500] hover:to-[#FF7A18] hover:-translate-y-0.5',
    ai:      'bg-gradient-to-b from-[#2C2C2E] to-[#1C1C1E] text-white shadow-md border border-[#3A3A3C] hover:from-[#3A3A3C] hover:to-[#2C2C2E]',
    outline: 'bg-white/70 border border-white/80 text-[#111111] hover:border-[#FF7A18] hover:text-[#FF7A18] hover:bg-white/90 shadow-xs',
    danger:  'bg-red-50 border border-red-200 text-red-600 hover:bg-red-600 hover:text-white',
    ghost:   'bg-transparent text-[#2C2C2E] hover:text-[#111111] hover:bg-white/50',
    glass:   'bg-white/60 backdrop-blur-md border border-white/80 text-[#111111] hover:bg-white/80 hover:border-[#FF7A18]/40 shadow-xs',
  };

  const sizes = {
    xs: 'px-3.5 py-1.5 text-[9px] gap-1.5 min-h-[32px]',
    sm: 'px-5 py-2.5 text-[10px] gap-2 min-h-[40px]',
    md: 'px-7 py-3.5 text-xs gap-2.5 min-h-[48px]',
    lg: 'px-9 py-4 text-xs gap-3 min-h-[56px]',
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
