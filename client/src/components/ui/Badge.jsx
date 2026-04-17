import React from 'react';

/**
 * Badge Component - Small labels/tags, full dark mode support
 */
export default function Badge({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon = null,
  className = '',
  ...props
}) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3.5 py-1.5 text-sm',
  };

  const variantClasses = {
    primary:   'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
    secondary: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
    success:   'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
    danger:    'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400',
    warning:   'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
    info:      'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-400',
    outline:   'border border-blue-400 text-blue-600 dark:border-blue-500 dark:text-blue-400 bg-transparent',
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1 font-bold rounded-full
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
      {...props}
    >
      {Icon && <Icon size={size === 'sm' ? 11 : size === 'md' ? 12 : 14} />}
      {children}
    </span>
  );
}
