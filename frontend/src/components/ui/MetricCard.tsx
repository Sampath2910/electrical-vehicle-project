import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  variant?: 'default' | 'cyan' | 'emerald' | 'amber' | 'rose';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
}) => {
  const variantStyles = {
    default: 'from-slate-50 to-white dark:from-navy-850 dark:to-navy-900 border-slate-200 dark:border-navy-700 text-slate-800 dark:text-slate-100',
    cyan: 'from-cyan-50/60 to-white dark:from-navy-850 dark:to-cyan-950/30 border-cyan-200 dark:border-cyan-500/30 text-cyan-700 dark:text-cyan-400',
    emerald: 'from-emerald-50/60 to-white dark:from-navy-850 dark:to-emerald-950/30 border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400',
    amber: 'from-amber-50/60 to-white dark:from-navy-850 dark:to-amber-950/30 border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-400',
    rose: 'from-rose-50/60 to-white dark:from-navy-850 dark:to-rose-950/30 border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-400',
  }[variant];

  return (
    <div className={`p-5 rounded-2xl bg-gradient-to-br ${variantStyles} border glass-card transition-all hover:border-cyan-500/40 shadow-sm dark:shadow-none`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{title}</span>
        <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-cyan-600 dark:text-cyan-400 shadow-sm">
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-3 flex items-baseline justify-between">
        <span className="text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-mono">{value}</span>
        {trend && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            trend.isPositive 
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-transparent' 
              : 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-transparent'
          }`}>
            {trend.isPositive ? '+' : ''}{trend.value}
          </span>
        )}
      </div>
      {subtitle && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
    </div>
  );
};
