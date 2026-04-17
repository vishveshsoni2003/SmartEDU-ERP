import React from 'react';

/**
 * Input Component - Form input with modern styling, full dark mode support
 */
export default function Input({
  label,
  error,
  helperText,
  icon: Icon = null,
  iconPosition = 'left',
  disabled = false,
  size = 'md',
  placeholder,
  className = '',
  ...props
}) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-4 py-3 text-base',
  };

  const baseClasses = `
    w-full outline-none rounded-xl font-medium
    bg-slate-50 dark:bg-slate-800/80
    border border-slate-200 dark:border-slate-700
    text-slate-900 dark:text-white
    placeholder:text-slate-400 dark:placeholder:text-slate-500
    transition-all duration-200
    focus:ring-2 focus:ring-blue-500 focus:border-transparent
    disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-100 dark:disabled:bg-slate-800
    ${error ? 'border-rose-400 dark:border-rose-500 focus:ring-rose-500' : ''}
  `;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
          {label}
          {props.required && <span className="text-rose-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {Icon && iconPosition === 'left' && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none">
            <Icon size={18} />
          </div>
        )}

        <input
          className={`
            ${baseClasses}
            ${sizeClasses[size]}
            ${Icon && iconPosition === 'left' ? 'pl-10' : ''}
            ${Icon && iconPosition === 'right' ? 'pr-10' : ''}
            ${className}
          `}
          placeholder={placeholder}
          disabled={disabled}
          {...props}
        />

        {Icon && iconPosition === 'right' && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none">
            <Icon size={18} />
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-rose-500 dark:text-rose-400 mt-1.5 font-medium">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">{helperText}</p>
      )}
    </div>
  );
}
