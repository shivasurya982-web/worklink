import React from 'react';
import { Sparkles } from 'lucide-react';

const LoadingSpinner = ({ fullScreen = false, message = 'Loading...' }) => {
  if (fullScreen) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background-primary gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-accent-gold/20 border-t-accent-gold animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-accent-gold animate-pulse" />
          </div>
        </div>
        <p className="text-sm font-semibold text-text-secondary font-outfit">{message}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="relative">
        <div className="w-10 h-10 rounded-full border-3 border-accent-gold/20 border-t-accent-gold animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-accent-gold animate-pulse" />
        </div>
      </div>
      <p className="text-xs font-semibold text-text-muted font-outfit">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
