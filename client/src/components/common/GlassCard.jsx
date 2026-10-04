import React from 'react';

const GlassCard = ({ children, className = '', hover = true, goldBorder = false, orangeBorder = false, ...props }) => {
  return (
    <div
      className={`glass-card rounded-[2rem] p-6 sm:p-8 border border-white/75 shadow-sm relative group overflow-hidden ${
        goldBorder || orangeBorder ? 'border-t-2 border-t-accent-main' : ''
      } ${!hover ? 'hover:transform-none hover:shadow-none' : ''} ${className}`}
      {...props}
    >
      {/* Refractive Soft Orange Glow Corner */}
      <div className="absolute -top-16 -right-16 w-36 h-36 bg-orange-200/40 rounded-full blur-2xl group-hover:bg-orange-300/50 transition-colors pointer-events-none z-0" />

      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default GlassCard;
