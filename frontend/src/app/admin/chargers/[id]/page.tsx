'use client';

import React, { use, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Zap, Cpu, Settings, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useStore } from '@/lib/storeContext';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ChargerStatus } from '@/types/ev';

export default function AdminChargerDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { chargers, updateChargerStatus } = useStore();

  const charger = chargers.find(c => c.id === resolvedParams.id || c.chargerCode === resolvedParams.id) || chargers[0];
  const [status, setStatus] = useState<ChargerStatus>(charger.status);
  const [savedMsg, setSavedMsg] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateChargerStatus(charger.id, status);
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <Link href="/admin/chargers" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-cyan-400">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Fleet List</span>
      </Link>

      <div className="glass-card rounded-3xl p-6 lg:p-8 border border-slate-800 bg-navy-900/90 shadow-2xl space-y-6">
        
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <span className="text-xs font-mono font-bold text-cyan-400">{charger.chargerCode}</span>
            <h1 className="text-2xl font-bold text-white">{charger.name}</h1>
          </div>
          <StatusBadge status={charger.status} size="lg" />
        </div>

        {savedMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Charger hardware configuration updated!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="text-slate-300 font-semibold block mb-1">Operational State Override</label>
            <select
              value={status}
              onChange={(e: any) => setStatus(e.target.value)}
              className="w-full bg-navy-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white"
            >
              <option value="AVAILABLE">AVAILABLE</option>
              <option value="PREPARING">PREPARING</option>
              <option value="CONNECTED">CONNECTED</option>
              <option value="CHARGING">CHARGING</option>
              <option value="PAUSED">PAUSED</option>
              <option value="MAINTENANCE">MAINTENANCE</option>
              <option value="FAULT">FAULT</option>
              <option value="OFFLINE">OFFLINE</option>
            </select>
          </div>

          <div className="p-4 rounded-2xl bg-navy-950 border border-slate-800 space-y-2">
            <h4 className="font-bold text-cyan-400">MQTT Hardware Topics</h4>
            <div className="space-y-1 font-mono text-[11px] text-slate-400">
              <p>Telemetry: <span className="text-slate-200">ev/chargers/{charger.chargerCode}/telemetry</span></p>
              <p>Status: <span className="text-slate-200">ev/chargers/{charger.chargerCode}/status</span></p>
              <p>Commands: <span className="text-slate-200">ev/chargers/{charger.chargerCode}/commands</span></p>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-bold text-xs uppercase tracking-wider"
          >
            Apply Configuration Changes
          </button>
        </form>

      </div>

    </div>
  );
}
