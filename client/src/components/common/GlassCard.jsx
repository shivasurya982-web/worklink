import React from 'react';

const GlassCard = ({ children, className = '', hover = true, goldBorder = false, orangeBorder = false, ...props }) => {
  return (
    <div
      className={`bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs relative overflow-hidden transition-all ${
        goldBorder || orangeBorder ? 'border-t-2 border-t-indigo-600' : ''
      } ${hover ? 'hover:shadow-md hover:border-slate-300' : ''} ${className}`}
      {...props}
    >
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default GlassCard;
