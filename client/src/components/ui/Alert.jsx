import React from 'react';

/**
 * Alert Component - Display success, error, warning, info messages
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
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  const iconColorClass = {
    success: 'text-green-500',
    error: 'text-red-500',
    warning: 'text-amber-500',
    info: 'text-blue-500',
  };

  return (
    <div
      className={`
        flex gap-3 p-4 rounded-lg border
        ${variantClasses[variant]}
        ${className}
      `}
      {...props}
    >
      {Icon && (
        <div className={`flex-shrink-0 mt-0.5 ${iconColorClass[variant]}`}>
          <Icon size={20} />
        </div>
      )}

      <div className="flex-1">
        {title && <p className="font-semibold text-sm mb-1">{title}</p>}
        <p className="text-sm">{children}</p>
      </div>

      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 text-lg opacity-60 hover:opacity-100 transition"
        >
          ×
        </button>
      )}
    </div>
  );
}

/**
 * Usage Examples:
 * 
 * <Alert variant="success" icon={CheckCircle}>
 *   Your changes have been saved successfully.
 * </Alert>
 * 
 * <Alert variant="error" title="Error" onClose={() => {}}>
 *   Something went wrong. Please try again.
 * </Alert>
 * 
 * <Alert variant="warning" icon={AlertTriangle}>
 *   This action cannot be undone.
 * </Alert>
 */
