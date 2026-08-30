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
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-4 text-text-muted">
            <Icon className="w-5 h-5" />
          </div>
        )}

        <input
          id={id}
          type={inputType}
          placeholder=" "
          className={`peer w-full bg-white/70 border border-gray-200 rounded-xl px-4 py-3.5 ${
            Icon ? 'pl-12' : ''
          } ${
            isPassword ? 'pr-14' : ''
          } text-text-primary placeholder-transparent focus:outline-none focus:border-accent-gold focus:ring-2 focus:ring-accent-gold/20 focus:bg-white transition-all text-sm ${
            error ? 'border-accent-red focus:border-accent-red focus:ring-accent-red/20' : ''
          } ${className}`}
          {...props}
        />

        <label
          htmlFor={id}
          className={`absolute pointer-events-none transition-all duration-200 ${
            Icon ? 'left-12' : 'left-4'
          } top-3.5 text-text-muted text-sm peer-focus:-top-2.5 peer-focus:left-4 peer-focus:text-xs peer-focus:text-accent-gold peer-focus:bg-white peer-focus:px-1.5 peer-focus:rounded peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:left-4 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1.5 peer-[:not(:placeholder-shown)]:rounded`}
        >
          {label}
        </label>

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 z-10 text-text-muted hover:text-accent-gold p-1"
            title={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>

      {error && <p className="text-xs text-accent-red mt-1 ml-1">{error}</p>}
    </div>
  );
};

export default FloatingInput;
