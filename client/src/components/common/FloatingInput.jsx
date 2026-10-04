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
          <div className="absolute left-4 text-slate-400 group-focus-within:text-orange-600 transition-colors z-10">
            <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        )}

        <input
          id={id}
          type={inputType}
          placeholder=" "
          className={`peer w-full bg-white border border-slate-200 rounded-xl px-4 py-3 sm:py-3.5 ${
            Icon ? 'pl-11 sm:pl-12' : ''
          } ${
            isPassword ? 'pr-11 sm:pr-12' : ''
          } text-slate-900 placeholder-transparent focus:outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-500/20 transition-all text-xs sm:text-sm shadow-xs ${
            error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
          } ${className}`}
          {...props}
        />

        <label
          htmlFor={id}
          className={`absolute pointer-events-none transition-all duration-200 ${
            Icon ? 'left-11 sm:left-12' : 'left-4'
          } top-3 sm:top-3.5 text-slate-400 text-[10px] sm:text-xs peer-focus:-top-2.5 peer-focus:left-3 peer-focus:text-[9px] sm:peer-focus:text-[10px] peer-focus:font-bold peer-focus:text-orange-600 peer-focus:bg-white peer-focus:px-1.5 peer-focus:py-0.5 peer-focus:rounded-md peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:text-[9px] sm:peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:font-bold peer-[:not(:placeholder-shown)]:text-orange-600 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1.5 peer-[:not(:placeholder-shown)]:py-0.5 peer-[:not(:placeholder-shown)]:rounded-md truncate max-w-[80%]`}
        >
          {label}
        </label>

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 z-10 text-slate-400 hover:text-orange-600 p-1 transition-colors"
            title={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>
        )}
      </div>

      {error && <p className="text-[10px] sm:text-[11px] text-red-600 mt-1.5 ml-2 font-bold uppercase tracking-wider">{error}</p>}
    </div>
  );
};

export default FloatingInput;
