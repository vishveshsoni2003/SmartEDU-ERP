import React from 'react';
import { motion } from 'framer-motion';

export default function Card({
  children,
  className = '',
  hoverable = false,
  borderless = false,
  shadow = 'md',
  padding = 'lg',
  delay = 0,
  ...props
}) {
  const shadowMap = {
    none: 'shadow-none',
    sm: 'shadow-[0_1px_3px_rgba(0,0,0,0.02)]',
    md: 'shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.4)]',
    lg: 'shadow-[0_10px_30px_-5px_rgba(0,0,0,0.08)] dark:shadow-[0_10px_30px_-5px_rgba(0,0,0,0.5)]',
  };

  const padMap = {
    none: 'p-0',
    sm: 'p-4 sm:p-5',
    md: 'p-6 sm:p-8',
    lg: 'p-8 sm:p-10',
  };

  const hoverFx = hoverable
    ? 'hover:scale-[1.01] hover:shadow-xl transition-all duration-300 cursor-pointer border-transparent hover:border-blue-200 dark:hover:border-slate-700'
    : '';

  const borderFx = borderless
    ? 'border-none'
    : 'border border-slate-200/80 dark:border-slate-800/80';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className={`
        bg-white dark:bg-slate-900 rounded-3xl
        ${borderFx}
        ${padMap[padding]}
        ${shadowMap[shadow]}
        ${hoverFx}
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  );
}
