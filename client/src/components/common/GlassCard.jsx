import React from 'react';

const GlassCard = ({ children, className = '', hover = true, goldBorder = false, ...props }) => {
  return (
    <div
      className={`glass-card rounded-3xl p-6 sm:p-8 !bg-background-card border border-border-primary/50 shadow-2xl transition-all duration-300 ${
        goldBorder ? 'border-t-4 border-t-accent-main' : ''
      } ${!hover ? 'hover:transform-none hover:shadow-none' : 'hover:border-accent-orange hover:shadow-orange/20'} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassCard;
