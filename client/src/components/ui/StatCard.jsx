import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({
  title,
  value,
  icon: Icon = null,
  trend = null,
  trendDirection = 'up',
  description,
  onClick = null,
  className = '',
  delay = 0
}) {
  const isPositive = trendDirection === 'up';

  // Aesthetic color variations
  const themes = [
    { bg: 'bg-blue-500/10 dark:bg-blue-400/10', icon: 'text-blue-600 dark:text-blue-400' },
    { bg: 'bg-emerald-500/10 dark:bg-emerald-400/10', icon: 'text-emerald-600 dark:text-emerald-400' },
    { bg: 'bg-purple-500/10 dark:bg-purple-400/10', icon: 'text-purple-600 dark:text-purple-400' },
    { bg: 'bg-amber-500/10 dark:bg-amber-400/10', icon: 'text-amber-600 dark:text-amber-400' }
  ];
  const theme = Icon ? themes[title.length % themes.length] : themes[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={onClick ? { y: -4, transition: { duration: 0.2 } } : {}}
      onClick={onClick}
      className={`
        relative overflow-hidden bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800/80
        p-6 backdrop-blur-xl transition-all duration-300 shadow-sm shadow-slate-200/50 dark:shadow-none
        ${onClick ? 'cursor-pointer hover:shadow-xl hover:shadow-slate-200/60 hover:dark:shadow-indigo-900/20 hover:border-blue-300 dark:hover:border-slate-700' : ''}
        ${className}
      `}
    >
      <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full opacity-20 pointer-events-none blur-2xl" style={{ backgroundColor: 'var(--tw-colors-blue-500)' }} />

      <div className="flex items-start justify-between mb-4 relative z-10">
        <p className="text-xs font-black text-slate-500 dark:text-slate-400 tracking-widest uppercase">{title}</p>
        {Icon && (
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${theme.bg}`}>
            <Icon size={24} className={theme.icon} />
          </div>
        )}
      </div>

      <h3 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-2 relative z-10 tracking-tight">{value}</h3>

      <div className="flex items-center justify-between gap-3 mt-4 relative z-10">
        {trend && (
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${isPositive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400'}`}>
            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />} {trend}
          </div>
        )}
        {description && <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold">{description}</p>}
      </div>
    </motion.div>
  );
}
