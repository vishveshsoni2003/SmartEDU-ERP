import React from 'react';

/**
 * Card Component - Clean, minimal container with elevation
 * Used for content grouping, product cards, stat displays
 */
export default function Card({
  children,
  className = '',
  hoverable = false,
  borderless = false,
  shadow = 'sm',
  padding = 'md',
  ...props
}) {
  const shadowClasses = {
    none: 'shadow-none',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
  };

  const paddingClasses = {
    xs: 'p-3',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    none: 'p-0',
  };

  const hoverClasses = hoverable
    ? 'transition-all duration-200 hover:shadow-md hover:scale-105 cursor-pointer'
    : '';

  const borderClass = borderless ? '' : 'border border-gray-200';

  return (
    <div
      className={`
        bg-white rounded-lg
        ${borderClass}
        ${paddingClasses[padding]}
        ${shadowClasses[shadow]}
        ${hoverClasses}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Usage Examples:
 * 
 * <Card>
 *   <h3 className="text-lg font-semibold">Basic Card</h3>
 *   <p className="text-gray-600 mt-2">Card content here</p>
 * </Card>
 * 
 * <Card hoverable shadow="md" padding="lg">
 *   Hoverable card with large padding
 * </Card>
 * 
 * <Card padding="none" borderless>
 *   Custom content without padding
 * </Card>
 */
