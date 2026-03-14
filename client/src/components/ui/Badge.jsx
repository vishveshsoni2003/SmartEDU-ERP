import React from 'react';

/**
 * Badge Component - Small labels/tags for categorization
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
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const variantClasses = {
    primary: 'bg-blue-100 text-blue-700',
    secondary: 'bg-gray-100 text-gray-700',
    success: 'bg-green-100 text-green-700',
    danger: 'bg-red-100 text-red-700',
    warning: 'bg-amber-100 text-amber-700',
    info: 'bg-cyan-100 text-cyan-700',
    outline: 'border-2 border-blue-500 text-blue-500 bg-transparent',
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1
        font-medium rounded-full
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
      {...props}
    >
      {Icon && <Icon size={size === 'sm' ? 12 : size === 'md' ? 14 : 16} />}
      {children}
    </span>
  );
}

/**
 * Usage Examples:
 * 
 * <Badge>Active</Badge>
 * <Badge variant="success" size="sm">Approved</Badge>
 * <Badge variant="danger">Pending</Badge>
 * <Badge variant="outline" icon={CheckCircle}>Verified</Badge>
 */
