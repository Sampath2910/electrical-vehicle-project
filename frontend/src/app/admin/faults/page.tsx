'use client';

import React from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle, CheckCircle2, Wrench } from 'lucide-react';
import { useStore } from '@/lib/storeContext';

export default function AdminFaultsPage() {
  const { faults, resolveFault } = useStore();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Hardware Safety Fault Center</h1>
        <p className="text-slate-400 text-xs mt-1">Real-time alerts for local contactor trips, overvoltage surges, and communication timeouts</p>
      </div>

      <div className="space-y-4">
        {faults.map((fault) => (
          <div 
            key={fault.id}
            className={`glass-card rounded-3xl p-6 border transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 ${
              fault.status === 'ACTIVE' 
                ? 'border-rose-500/40 bg-navy-900/80 glow-rose' 
                : 'border-slate-800 bg-navy-950/60 opacity-80'
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 font-mono font-bold text-xs border border-rose-500/30">
                  {fault.faultCode}
                </span>
                <span className="text-xs font-bold text-slate-300">Severity: {fault.severity}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${fault.status === 'ACTIVE' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                  {fault.status}
                </span>
              </div>

              <h3 className="text-lg font-bold text-white">{fault.chargerName}</h3>
              <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">{fault.message}</p>
              <p className="text-[10px] text-slate-500">Occurred At: {new Date(fault.occurredAt).toLocaleString()}</p>
            </div>

            {fault.status === 'ACTIVE' && (
              <button
                onClick={() => resolveFault(fault.id)}
                className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-navy-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
              >
                <Wrench className="w-4 h-4" />
                <span>Clear & Reset Contactor</span>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
