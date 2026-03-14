import React from 'react';

/**
 * Button Component - Modern, accessible, reusable
 * Variants: solid, outline, ghost, gradient
 * Sizes: sm, md, lg
 * Colors: primary (default), secondary, success, danger, warning
 */
export default function Button({
  children,
  variant = 'solid',
  size = 'md',
  color = 'primary',
  disabled = false,
  isLoading = false,
  icon: Icon = null,
  fullWidth = false,
  className = '',
  ...props
}) {
  const baseClasses = `
    inline-flex items-center justify-center gap-2
    font-medium rounded-md
    transition-all duration-200 ease-in-out
    disabled:opacity-50 disabled:cursor-not-allowed
    focus:outline-none focus:ring-2 focus:ring-offset-2
  `;

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm h-8',
    md: 'px-4 py-2.5 text-sm h-10',
    lg: 'px-6 py-3 text-base h-12',
  };

  const colorVariants = {
    primary: {
      solid: 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500',
      outline: 'border-2 border-blue-500 text-blue-500 hover:bg-blue-50 focus:ring-blue-500',
      ghost: 'text-blue-500 hover:bg-blue-50 focus:ring-blue-500',
      gradient: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-lg focus:ring-blue-500',
    },
    secondary: {
      solid: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
      outline: 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
      ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
      gradient: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    },
    success: {
      solid: 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-500',
      outline: 'border-2 border-green-500 text-green-500 hover:bg-green-50 focus:ring-green-500',
      ghost: 'text-green-500 hover:bg-green-50 focus:ring-green-500',
      gradient: 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-lg focus:ring-green-500',
    },
    danger: {
      solid: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
      outline: 'border-2 border-red-500 text-red-500 hover:bg-red-50 focus:ring-red-500',
      ghost: 'text-red-500 hover:bg-red-50 focus:ring-red-500',
      gradient: 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-lg focus:ring-red-500',
    },
    warning: {
      solid: 'bg-amber-500 text-white hover:bg-amber-600 focus:ring-amber-500',
      outline: 'border-2 border-amber-500 text-amber-500 hover:bg-amber-50 focus:ring-amber-500',
      ghost: 'text-amber-500 hover:bg-amber-50 focus:ring-amber-500',
      gradient: 'bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:shadow-lg focus:ring-amber-500',
    },
  };

  const variantClasses = colorVariants[color]?.[variant] || colorVariants.primary.solid;
  const sizeClass = sizeClasses[size];

  return (
    <button
      className={`
        ${baseClasses}
        ${sizeClass}
        ${variantClasses}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          {children}
        </>
      ) : (
        <>
          {Icon && <Icon size={size === 'sm' ? 16 : size === 'md' ? 18 : 20} />}
          {children}
        </>
      )}
    </button>
  );
}

/**
 * Usage Examples:
 * 
 * <Button>Primary Button</Button>
 * <Button variant="outline">Outline Button</Button>
 * <Button size="lg" color="success">Large Success Button</Button>
 * <Button color="danger" icon={Trash2} size="sm">Delete</Button>
 * <Button fullWidth variant="gradient">Full Width Gradient</Button>
 * <Button isLoading>Loading...</Button>
 */
