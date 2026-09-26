import React from 'react';

const GlassCard = ({ children, className = '', hover = true, goldBorder = false, ...props }) => {
  return (
    <div
      className={`glass-card rounded-[2rem] p-6 sm:p-8 border border-white/40 shadow-sm relative group overflow-hidden ${
        goldBorder ? 'border-t-2 border-t-accent-main' : ''
      } ${!hover ? 'hover:transform-none hover:shadow-none' : ''} ${className}`}
      {...props}
    >
      {/* Soft Blue Blur Corner */}
      <div className="absolute -top-16 -right-16 w-36 h-36 bg-blue-100/50 rounded-full blur-2xl group-hover:bg-blue-200/60 transition-colors pointer-events-none" />

      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default GlassCard;
