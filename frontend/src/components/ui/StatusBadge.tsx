import React from 'react';
import { ChargerStatus, SessionStatus } from '@/types/ev';

export type StatusType = 
  | ChargerStatus 
  | SessionStatus 
  | 'ACTIVE' 
  | 'BLOCKED' 
  | 'PAID' 
  | 'UNPAID' 
  | 'PARTIAL' 
  | 'OVERDUE' 
  | 'SUCCESS' 
  | 'FAILED' 
  | 'RESOLVED';

interface StatusBadgeProps {
  status: StatusType;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
  let dotColor = 'bg-slate-500 dark:bg-slate-400';

  switch (status) {
    case 'AVAILABLE':
    case 'SUCCESS':
    case 'PAID':
    case 'RESOLVED':
    case 'ACTIVE':
      colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30 glow-emerald';
      dotColor = 'bg-emerald-500 dark:bg-emerald-400 animate-pulse';
      break;

    case 'CHARGING':
    case 'STARTED':
      colorClasses = 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-300 dark:border-cyan-500/40 glow-cyan';
      dotColor = 'bg-cyan-500 dark:bg-cyan-400 animate-ping';
      break;

    case 'CONNECTED':
    case 'PREPARING':
    case 'AUTHORIZED':
      colorClasses = 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30';
      dotColor = 'bg-blue-500 dark:bg-blue-400';
      break;

    case 'FAULT':
    case 'FAILED':
    case 'BLOCKED':
    case 'UNPAID':
    case 'OVERDUE':
      colorClasses = 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/30 glow-rose';
      dotColor = 'bg-rose-600 dark:bg-rose-500';
      break;

    case 'OFFLINE':
    case 'PAUSED':
    case 'CANCELLED':
    case 'MAINTENANCE':
    case 'PARTIAL':
      colorClasses = 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30';
      dotColor = 'bg-amber-500 dark:bg-amber-400';
      break;
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[11px] gap-1 font-semibold tracking-wide',
    md: 'px-2.5 py-1 text-xs gap-1.5 font-semibold tracking-wide',
    lg: 'px-3 py-1.5 text-sm gap-2 font-bold tracking-wide',
  }[size];

  return (
    <span className={`inline-flex items-center rounded-full border shadow-xs ${colorClasses} ${sizeClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span>{status.replace(/_/g, ' ')}</span>
    </span>
  );
};
