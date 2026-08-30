import React from 'react';

const GlassCard = ({ children, className = '', hover = true, goldBorder = false, ...props }) => {
  return (
    <div
      className={`glass-card rounded-2xl p-6 ${
        goldBorder ? 'border-t-2 border-t-accent-gold/40' : ''
      } ${!hover ? 'hover:transform-none hover:shadow-none' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassCard;
