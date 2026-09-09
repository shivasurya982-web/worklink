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
          <div className="absolute left-4 sm:left-5 text-text-muted group-focus-within:text-accent-bright transition-colors">
            <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        )}

        <input
          id={id}
          type={inputType}
          placeholder=" "
          className={`peer w-full bg-background-card border border-border-primary/40 rounded-xl sm:rounded-2xl px-4 sm:px-5 py-3.5 sm:py-4 ${
            Icon ? 'pl-12 sm:pl-14' : ''
          } ${
            isPassword ? 'pr-12 sm:pr-14' : ''
          } text-text-primary placeholder-transparent focus:outline-none focus:border-accent-main focus:ring-4 focus:ring-accent-main/10 focus:bg-background-card transition-all text-xs sm:text-sm shadow-2xl ${
            error ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/10' : ''
          } ${className}`}
          {...props}
        />

        <label
          htmlFor={id}
          className={`absolute pointer-events-none transition-all duration-200 ${
            Icon ? 'left-12 sm:left-14' : 'left-4 sm:left-5'
          } top-3.5 sm:top-4 text-text-muted text-[10px] sm:text-xs peer-focus:-top-3 peer-focus:left-4 peer-focus:text-[9px] sm:peer-focus:text-[11px] peer-focus:font-black peer-focus:text-accent-light peer-focus:bg-background-cardSecondary peer-focus:px-2 peer-focus:py-0.5 peer-focus:rounded-lg peer-[:not(:placeholder-shown)]:-top-3 peer-[:not(:placeholder-shown)]:left-4 peer-[:not(:placeholder-shown)]:text-[9px] sm:peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:font-black peer-[:not(:placeholder-shown)]:text-accent-light peer-[:not(:placeholder-shown)]:bg-background-cardSecondary peer-[:not(:placeholder-shown)]:px-2 peer-[:not(:placeholder-shown)]:py-0.5 peer-[:not(:placeholder-shown)]:rounded-lg truncate max-w-[80%]`}
        >
          {label}
        </label>

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 sm:right-5 z-10 text-text-muted hover:text-accent-bright p-1 transition-colors"
            title={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>
        )}
      </div>

      {error && <p className="text-[10px] sm:text-[11px] text-red-400 mt-2 ml-2 font-black uppercase tracking-wider">{error}</p>}
    </div>
  );
};

export default FloatingInput;
