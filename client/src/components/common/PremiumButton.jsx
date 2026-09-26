import React from 'react';

const PremiumButton = ({
  children,
  variant = 'gold', // 'gold' | 'ai' | 'outline' | 'danger' | 'ghost' | 'glass'
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
    'focus:outline-none touch-manipulation select-none tracking-[0.12em] uppercase cursor-pointer';

  const variants = {
    gold:    'bg-[#2563EB] text-white shadow-md border border-[#2563EB] hover:bg-[#1D4ED8] hover:border-[#1D4ED8]',
    ai:      'bg-[#2563EB] text-white shadow-md border border-[#2563EB] hover:bg-[#1D4ED8]',
    outline: 'bg-white/80 border border-gray-300 text-[#111827] hover:border-[#2563EB] hover:text-[#2563EB] hover:bg-blue-50/50',
    danger:  'bg-red-50 border border-red-200 text-red-600 hover:bg-red-600 hover:text-white',
    ghost:   'bg-transparent text-[#4B5563] hover:text-[#111827] hover:bg-white/50',
    glass:   'bg-white/60 backdrop-blur-md border border-white/40 text-[#111827] hover:bg-white/80 hover:border-[#2563EB]/40 shadow-sm',
  };

  const sizes = {
    xs: 'px-3.5 py-1.5 text-[9px] gap-1.5 rounded-xl min-h-[32px]',
    sm: 'px-5 py-2.5 text-[10px] gap-2 rounded-2xl min-h-[40px]',
    md: 'px-7 py-3.5 text-xs gap-2.5 rounded-[1.2rem] min-h-[48px]',
    lg: 'px-9 py-4 text-xs gap-3 rounded-[1.5rem] min-h-[56px]',
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
