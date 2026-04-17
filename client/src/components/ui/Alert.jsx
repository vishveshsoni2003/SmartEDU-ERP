import React from 'react';
import { X } from 'lucide-react';

/**
 * Alert Component — Dark mode aware, accessible
 */
export default function Alert({
  children,
  variant = 'info',
  icon: Icon = null,
  onClose = null,
  title,
  className = '',
  ...props
}) {
  const variantClasses = {
    success: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300',
    error:   'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30 text-rose-800 dark:text-rose-300',
    warning: 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30 text-amber-800 dark:text-amber-300',
    info:    'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30 text-blue-800 dark:text-blue-300',
  };

  const iconColorClass = {
    success: 'text-emerald-500 dark:text-emerald-400',
    error:   'text-rose-500 dark:text-rose-400',
    warning: 'text-amber-500 dark:text-amber-400',
    info:    'text-blue-500 dark:text-blue-400',
  };

  return (
    <div
      className={`flex gap-3 p-4 rounded-xl border ${variantClasses[variant]} ${className}`}
      role="alert"
      {...props}
    >
      {Icon && (
        <div className={`flex-shrink-0 mt-0.5 ${iconColorClass[variant]}`}>
          <Icon size={18} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        {title && <p className="font-bold text-sm mb-0.5">{title}</p>}
        <p className="text-sm leading-relaxed">{children}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 p-0.5 rounded-md opacity-60 hover:opacity-100 transition hover:bg-black/10 dark:hover:bg-white/10"
          aria-label="Dismiss"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
