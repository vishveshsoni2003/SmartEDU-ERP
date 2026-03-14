import React from 'react';

/**
 * Stat Card Component - Display key metrics/KPIs
 * Modern, clean design with icon and trend indicator
 */
export default function StatCard({
  title,
  value,
  icon: Icon = null,
  trend = null,
  trendDirection = 'up', // 'up' or 'down'
  trendColor = 'green',
  description,
  onClick = null,
  className = '',
}) {
  const isTrendPositive = trendDirection === 'up';
  const trendColorClass = isTrendPositive ? 'text-green-600' : 'text-red-600';
  const trendBgClass = isTrendPositive ? 'bg-green-50' : 'bg-red-50';

  // Dynamic icon background colors
  const getIconBgColor = () => {
    if (!Icon) return 'bg-slate-100 text-slate-600';
    const colors = [
      'bg-blue-100 text-blue-600',
      'bg-purple-100 text-purple-600',
      'bg-green-100 text-green-600',
      'bg-orange-100 text-orange-600',
      'bg-pink-100 text-pink-600',
      'bg-indigo-100 text-indigo-600',
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return (
    <div
      className={`
        bg-white rounded-xl border border-slate-200
        p-6 transition-all duration-300 shadow-sm
        ${onClick ? 'hover:shadow-lg hover:border-slate-300 cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {/* Header with Icon and Title */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">{title}</p>
        </div>

        {Icon && (
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getIconBgColor()}`}>
            <Icon size={24} />
          </div>
        )}
      </div>

      {/* Value */}
      <h3 className="text-4xl font-bold text-slate-900 mb-3">{value}</h3>

      {/* Description + Trend */}
      <div className="flex items-center justify-between gap-2">
        {description && (
          <p className="text-xs text-slate-500 font-medium">{description}</p>
        )}

        {trend && (
          <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full ${trendBgClass} flex-shrink-0`}>
            <svg
              className={`w-4 h-4 ${trendColorClass}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isTrendPositive ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M7 16V4m0 0L3 8m4-4l4 4"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M17 8v12m0 0l4-4m-4 4l-4-4"
                />
              )}
            </svg>
            <span className={`text-xs font-bold ${trendColorClass}`}>
              {trend}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
