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
  let colorClasses = 'bg-slate-800 text-slate-300 border-slate-700';
  let dotColor = 'bg-slate-400';

  switch (status) {
    case 'AVAILABLE':
    case 'SUCCESS':
    case 'PAID':
    case 'RESOLVED':
    case 'ACTIVE':
      colorClasses = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 glow-emerald';
      dotColor = 'bg-emerald-400 animate-pulse';
      break;

    case 'CHARGING':
    case 'STARTED':
      colorClasses = 'bg-cyan-500/10 text-cyan-300 border-cyan-500/40 glow-cyan';
      dotColor = 'bg-cyan-400 animate-ping';
      break;

    case 'CONNECTED':
    case 'PREPARING':
    case 'AUTHORIZED':
      colorClasses = 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      dotColor = 'bg-blue-400';
      break;

    case 'FAULT':
    case 'FAILED':
    case 'BLOCKED':
    case 'UNPAID':
    case 'OVERDUE':
      colorClasses = 'bg-rose-500/10 text-rose-400 border-rose-500/30 glow-rose';
      dotColor = 'bg-rose-500';
      break;

    case 'OFFLINE':
    case 'PAUSED':
    case 'CANCELLED':
    case 'MAINTENANCE':
    case 'PARTIAL':
      colorClasses = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      dotColor = 'bg-amber-400';
      break;
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3 py-1.5 text-sm gap-2',
  }[size];

  return (
    <span className={`inline-flex items-center rounded-full font-medium border ${colorClasses} ${sizeClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span>{status.replace(/_/g, ' ')}</span>
    </span>
  );
};
