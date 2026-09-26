import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const FloatingInput = ({
  label,
  id,
  type = 'text',
  error,
  icon: Icon,
  className = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="relative w-full">
      <div className="relative flex items-center group">
        {Icon && (
          <div className="absolute left-4 sm:left-5 text-text-muted group-focus-within:text-accent-main transition-colors z-10">
            <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        )}

        <input
          id={id}
          type={inputType}
          placeholder=" "
          className={`peer w-full bg-white/80 border border-gray-300 rounded-xl sm:rounded-2xl px-4 sm:px-5 py-3.5 sm:py-4 ${
            Icon ? 'pl-12 sm:pl-14' : ''
          } ${
            isPassword ? 'pr-12 sm:pr-14' : ''
          } text-text-primary placeholder-transparent focus:outline-none focus:border-accent-main focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all text-xs sm:text-sm shadow-sm ${
            error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : ''
          } ${className}`}
          {...props}
        />

        <label
          htmlFor={id}
          className={`absolute pointer-events-none transition-all duration-200 ${
            Icon ? 'left-12 sm:left-14' : 'left-4 sm:left-5'
          } top-3.5 sm:top-4 text-text-muted text-[10px] sm:text-xs peer-focus:-top-2.5 peer-focus:left-4 peer-focus:text-[9px] sm:peer-focus:text-[11px] peer-focus:font-black peer-focus:text-accent-main peer-focus:bg-white peer-focus:px-2 peer-focus:py-0.5 peer-focus:rounded-md peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:left-4 peer-[:not(:placeholder-shown)]:text-[9px] sm:peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:font-black peer-[:not(:placeholder-shown)]:text-accent-main peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-2 peer-[:not(:placeholder-shown)]:py-0.5 peer-[:not(:placeholder-shown)]:rounded-md truncate max-w-[80%]`}
        >
          {label}
        </label>

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 sm:right-5 z-10 text-text-muted hover:text-accent-main p-1 transition-colors"
            title={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>
        )}
      </div>

      {error && <p className="text-[10px] sm:text-[11px] text-red-600 mt-1.5 ml-2 font-black uppercase tracking-wider">{error}</p>}
    </div>
  );
};

export default FloatingInput;
