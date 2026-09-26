import React from 'react';
import { Sparkles } from 'lucide-react';

const LoadingSpinner = ({ fullScreen = false, message = 'Loading...' }) => {
  if (fullScreen) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-transparent gap-4">
        <div className="relative">
          <div className="w-14 h-14 rounded-full border-4 border-blue-200 border-t-accent-main animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-accent-main animate-pulse" />
          </div>
        </div>
        <p className="text-sm font-bold text-text-secondary font-outfit">{message}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="relative">
        <div className="w-10 h-10 rounded-full border-3 border-blue-200 border-t-accent-main animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-accent-main animate-pulse" />
        </div>
      </div>
      <p className="text-xs font-bold text-text-muted font-outfit">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
