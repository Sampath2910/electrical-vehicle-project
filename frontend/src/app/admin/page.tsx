'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Zap, 
  Activity, 
  ShieldAlert, 
  DollarSign, 
  BarChart3, 
  Users, 
  Sliders, 
  ArrowRight,
  ShieldCheck,
  Radio,
  Clock
} from 'lucide-react';
import { useStore } from '@/lib/storeContext';
import { MetricCard } from '@/components/ui/MetricCard';
import { StatusBadge } from '@/components/ui/StatusBadge';

export default function AdminOperationsDashboard() {
  const { chargers, faults, historySessions, tariffs, currentUser } = useStore();

  const totalChargers = chargers.length;
  const chargingCount = chargers.filter(c => c.status === 'CHARGING').length;
  const availableCount = chargers.filter(c => c.status === 'AVAILABLE').length;
  const faultCount = faults.filter(f => f.status === 'ACTIVE').length;

  const todayEnergy = historySessions.reduce((acc, s) => acc + s.energyKwh, 128.4);
  const todayRevenue = historySessions.reduce((acc, s) => acc + (s.finalCost || s.estimatedCost), 1984.50);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="glass-card rounded-3xl p-6 lg:p-8 border border-slate-800 bg-gradient-to-r from-navy-900 via-navy-850 to-navy-950 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-semibold border border-cyan-500/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Operations & Control Suite &bull; {currentUser.role}</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white mt-1">Smart EV Fleet Control Tower</h1>
          <p className="text-xs text-slate-400">Real-time charger fleet telemetry, fault management, and tariff controls</p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/live"
            className="px-5 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all"
          >
            <Activity className="w-4 h-4" />
            <span>Live Telemetry Stream</span>
          </Link>
        </div>
      </div>

      {/* OPERATOR KPIS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Fleet Chargers"
          value={totalChargers}
          subtitle={`${availableCount} Available \u2022 ${chargingCount} Active`}
          icon={Zap}
          variant="cyan"
        />
        <MetricCard
          title="Active Fault Alerts"
          value={faultCount}
          subtitle="Immediate attention required"
          icon={ShieldAlert}
          variant={faultCount > 0 ? "rose" : "default"}
        />
        <MetricCard
          title="Today's Energy Delivered"
          value={`${todayEnergy.toFixed(1)} kWh`}
          subtitle="Aggregated fleet output"
          icon={Activity}
          variant="emerald"
        />
        <MetricCard
          title="Today's Network Revenue"
          value={`₹${todayRevenue.toFixed(2)}`}
          subtitle="Settled charging revenue"
          icon={DollarSign}
          variant="amber"
        />
      </div>

      {/* FAULT ALERTS BANNER (IF ANY) */}
      {faultCount > 0 && (
        <div className="glass-card rounded-3xl p-6 border border-rose-500/40 bg-rose-500/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-rose-300 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              <span>Active Critical Safety Faults Detected ({faultCount})</span>
            </h3>
            <Link href="/admin/faults" className="text-xs font-bold text-rose-400 hover:underline">
              Open Fault Center &rarr;
            </Link>
          </div>
          <div className="space-y-2">
            {faults.filter(f => f.status === 'ACTIVE').map(f => (
              <div key={f.id} className="p-3 rounded-xl bg-navy-950 border border-slate-800 text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold text-white">{f.chargerName}</span>
                  <span className="text-slate-400 text-[11px] block">{f.message}</span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-400 font-mono font-bold text-[10px]">
                  {f.faultCode}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FLEET CHARGERS OVERVIEW TABLE */}
      <div className="glass-card rounded-3xl p-6 border border-slate-800 bg-navy-900/60 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white">Network Charger Fleet</h3>
            <p className="text-xs text-slate-400">Live operational status and firmware metrics</p>
          </div>
          <Link href="/admin/chargers" className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
            <span>Manage Fleet</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider">
                <th className="py-3 px-3">Charger Code</th>
                <th className="py-3 px-3">Station Name</th>
                <th className="py-3 px-3">Power</th>
                <th className="py-3 px-3">Standard</th>
                <th className="py-3 px-3">Tariff</th>
                <th className="py-3 px-3">Firmware</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {chargers.map((c) => (
                <tr key={c.id} className="hover:bg-navy-850/50 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-cyan-400">{c.chargerCode}</td>
                  <td className="py-3 px-3 font-semibold text-white">{c.name}</td>
                  <td className="py-3 px-3 font-bold">{c.powerRating} kW</td>
                  <td className="py-3 px-3 text-slate-300">{c.connectorType}</td>
                  <td className="py-3 px-3 font-mono text-cyan-300">₹{c.pricePerKwh}/kWh</td>
                  <td className="py-3 px-3 font-mono text-slate-400 text-[11px]">{c.firmwareVersion}</td>
                  <td className="py-3 px-3"><StatusBadge status={c.status} size="sm" /></td>
                  <td className="py-3 px-3">
                    <Link
                      href={`/admin/chargers/${c.id}`}
                      className="px-2.5 py-1 rounded-lg bg-navy-800 hover:bg-cyan-500 hover:text-navy-950 text-cyan-400 text-[11px] font-semibold transition-all"
                    >
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
