'use client';

import React from 'react';
import { ShieldCheck, Wrench } from 'lucide-react';
import { useStore } from '@/lib/storeContext';

export default function AdminFaultsPage() {
  const { faults, resolveFault } = useStore();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Hardware Safety Fault Center</h1>
        <p className="text-slate-600 dark:text-slate-400 text-xs mt-1">Real-time alerts for local contactor trips, overvoltage surges, and communication timeouts</p>
      </div>

      <div className="space-y-4">
        {faults.length === 0 ? (
          <div className="glass-card rounded-3xl p-10 border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900/60 text-center space-y-2 shadow-sm">
            <ShieldCheck className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Zero Active Hardware Faults</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">All charging bays are within nominal 207V – 253V safety thresholds.</p>
          </div>
        ) : (
          faults.map((fault) => (
            <div 
              key={fault.id}
              className={`glass-card rounded-3xl p-6 border transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 ${
                fault.status === 'ACTIVE' 
                  ? 'border-rose-300 dark:border-rose-500/40 bg-rose-50/40 dark:bg-navy-900/80' 
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-950/60 opacity-80'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 font-mono font-bold text-xs border border-rose-200 dark:border-rose-500/30">
                    {fault.faultCode}
                  </span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Severity: {fault.severity}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${fault.status === 'ACTIVE' ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400' : 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400'}`}>
                    {fault.status}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{fault.chargerName}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">{fault.message}</p>
                <p className="text-[10px] text-slate-500" suppressHydrationWarning>Occurred At: {new Date(fault.occurredAt).toLocaleString()}</p>
              </div>

              {fault.status === 'ACTIVE' && (
                <button
                  onClick={() => resolveFault(fault.id)}
                  className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white dark:text-navy-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                >
                  <Wrench className="w-4 h-4" />
                  <span>Clear &amp; Reset Contactor</span>
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
