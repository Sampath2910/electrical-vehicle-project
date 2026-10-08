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
    default: 'from-navy-850 to-navy-900 border-navy-700 text-slate-100',
    cyan: 'from-navy-850 to-cyan-950/30 border-cyan-500/30 text-cyan-400',
    emerald: 'from-navy-850 to-emerald-950/30 border-emerald-500/30 text-emerald-400',
    amber: 'from-navy-850 to-amber-950/30 border-amber-500/30 text-amber-400',
    rose: 'from-navy-850 to-rose-950/30 border-rose-500/30 text-rose-400',
  }[variant];

  return (
    <div className={`p-5 rounded-2xl bg-gradient-to-br ${variantStyles} border glass-card transition-all hover:border-slate-700`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</span>
        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-cyan-400">
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-3 flex items-baseline justify-between">
        <span className="text-2xl lg:text-3xl font-bold tracking-tight text-white">{value}</span>
        {trend && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${trend.isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
            {trend.isPositive ? '+' : ''}{trend.value}
          </span>
        )}
      </div>
      {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
    </div>
  );
};
