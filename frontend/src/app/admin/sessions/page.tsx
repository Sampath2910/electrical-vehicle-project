'use client';

import React from 'react';
import { useStore } from '@/lib/storeContext';
import { StatusBadge } from '@/components/ui/StatusBadge';

export default function AdminSessionsPage() {
  const { historySessions } = useStore();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Global Charging Sessions</h1>
        <p className="text-slate-400 text-xs mt-1">Audit log of all charging sessions across network chargers</p>
      </div>

      <div className="glass-card rounded-3xl p-6 border border-slate-800 bg-navy-900/60 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider">
              <th className="py-3 px-3">Session Code</th>
              <th className="py-3 px-3">Station</th>
              <th className="py-3 px-3">Driver ID</th>
              <th className="py-3 px-3">Energy (kWh)</th>
              <th className="py-3 px-3">Duration</th>
              <th className="py-3 px-3">Tariff</th>
              <th className="py-3 px-3">Cost</th>
              <th className="py-3 px-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-200">
            {historySessions.map((s) => (
              <tr key={s.id} className="hover:bg-navy-850/50 transition-colors">
                <td className="py-3.5 px-3 font-mono font-bold text-cyan-400">{s.sessionCode}</td>
                <td className="py-3.5 px-3 font-semibold text-white">{s.chargerName}</td>
                <td className="py-3.5 px-3 text-slate-400 font-mono text-[11px]">{s.userId}</td>
                <td className="py-3.5 px-3 font-bold text-cyan-300">{s.energyKwh} kWh</td>
                <td className="py-3.5 px-3">{Math.floor(s.durationSeconds / 60)} mins</td>
                <td className="py-3.5 px-3 font-mono text-slate-400">₹{s.tariffRate}/kWh</td>
                <td className="py-3.5 px-3 font-extrabold text-white">₹{s.finalCost?.toFixed(2)}</td>
                <td className="py-3.5 px-3"><StatusBadge status={s.status} size="sm" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
