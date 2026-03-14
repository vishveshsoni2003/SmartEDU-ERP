import React from 'react';

/**
 * Input Component - Form input with modern styling
 * Supports different variants and states
 */
export default function Input({
  label,
  error,
  helperText,
  icon: Icon = null,
  iconPosition = 'left',
  disabled = false,
  size = 'md',
  variant = 'outlined',
  placeholder,
  className = '',
  ...props
}) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-4 py-3 text-lg',
  };

  const variantClasses = {
    outlined: `
      border-2 border-gray-300
      focus:border-blue-500 focus:bg-blue-50
      ${error ? 'border-red-500 focus:border-red-500' : ''}
    `,
    filled: `
      bg-gray-100 border-b-2 border-gray-300
      focus:bg-gray-50 focus:border-blue-500
      ${error ? 'border-red-500' : ''}
    `,
    flushed: `
      border-0 border-b-2 border-gray-300 rounded-none
      focus:border-blue-500 focus:bg-transparent
      ${error ? 'border-red-500' : ''}
    `,
  };

  const baseClasses = `
    w-full outline-none rounded-md
    transition-all duration-200
    disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100
    font-sans
  `;

  const inputClasses = `
    ${baseClasses}
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${className}
  `;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {Icon && iconPosition === 'left' && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Icon size={20} />
          </div>
        )}

        <input
          className={`
            ${inputClasses}
            ${Icon && iconPosition === 'left' ? 'pl-10' : ''}
            ${Icon && iconPosition === 'right' ? 'pr-10' : ''}
          `}
          placeholder={placeholder}
          disabled={disabled}
          {...props}
        />

        {Icon && iconPosition === 'right' && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Icon size={20} />
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-500 mt-1 font-medium">{error}</p>
      )}

      {helperText && !error && (
        <p className="text-sm text-gray-500 mt-1">{helperText}</p>
      )}
    </div>
  );
}

/**
 * Usage Examples:
 * 
 * <Input placeholder="Enter email" type="email" />
 * 
 * <Input 
 *   label="Email Address"
 *   placeholder="you@example.com"
 *   type="email"
 *   helperText="We'll never share your email"
 * />
 * 
 * <Input
 *   label="Password"
 *   type="password"
 *   error="Password must be at least 8 characters"
 *   variant="filled"
 * />
 * 
 * <Input
 *   label="Search"
 *   icon={Search}
 *   placeholder="Search users..."
 *   iconPosition="left"
 * />
 */
