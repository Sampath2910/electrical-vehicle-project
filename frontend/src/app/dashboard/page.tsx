'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Zap, 
  Wallet, 
  CreditCard, 
  Bike, 
  History, 
  Plus, 
  ArrowRight, 
  Activity, 
  CheckCircle2, 
  ShieldCheck,
  Receipt,
  Leaf,
  Compass,
  RefreshCw,
  TrendingUp,
  Clock,
  QrCode,
  AlertTriangle
} from 'lucide-react';
import { useStore } from '@/lib/storeContext';
import { MetricCard } from '@/components/ui/MetricCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ThingSpeakBench } from '@/components/ui/ThingSpeakBench';
import { getCurrentToDSlot } from '@/lib/providers';

export default function DriverDashboardPage() {
  const { currentUser, wallet, activeSession, historySessions, vehicles } = useStore();
  const todInfo = getCurrentToDSlot();

  const totalEnergy = historySessions.reduce((acc, s) => acc + s.energyKwh, 0);
  const totalRidingKm = Math.round(totalEnergy * 28.5);
  const fuelSavingsInr = Math.round(totalRidingKm * 2.45);
  const co2AvoidedKg = +(totalRidingKm * 0.042).toFixed(1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Welcome & Wallet Header */}
      <div className="glass-card rounded-3xl p-6 lg:p-8 border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/20 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-semibold border border-cyan-500/30">
            <Bike className="w-3.5 h-3.5" />
            <span>EV Rider Portal &bull; Role: {currentUser.role}</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white">
            Welcome back, <span className="text-cyan-400">{currentUser.name}</span>
          </h1>
          <p className="text-xs text-slate-400">Manage your electric 2-wheeler charging sessions, Time-of-Day billing, and Dynamic QR / UPI payments.</p>
        </div>

        {/* Quick Action Group */}
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/charging/start"
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all hover:scale-105"
          >
            <Zap className="w-4 h-4 fill-slate-950" />
            <span>Scan QR & Charge</span>
          </Link>

          <Link
            href="/wallet"
            className="px-4 py-3.5 rounded-2xl glass-card border border-slate-700 hover:border-cyan-400 text-white font-semibold text-xs flex items-center gap-2 transition-all hover:bg-slate-800"
          >
            <Plus className="w-4 h-4 text-cyan-400" />
            <span>Top Up UPI Wallet</span>
          </Link>
        </div>
      </div>

      {/* THINGSPEAK IOT CLOUD BENCH */}
      <ThingSpeakBench />

      {/* ACTIVE SESSION CARD (IF RUNNING) */}
      {activeSession && (
        <div className="glass-card rounded-3xl p-6 border border-cyan-500/40 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/20 glow-cyan relative overflow-hidden shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-400">
                <Bike className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-xs font-mono text-cyan-400 font-bold">{activeSession.sessionCode}</span>
                <h3 className="text-lg font-bold text-white">{activeSession.chargerName}</h3>
                <p className="text-xs text-slate-400">{activeSession.chargerLocation}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <StatusBadge status={activeSession.status} size="lg" />
              <Link
                href={`/charging/${activeSession.id}`}
                className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-md"
              >
                Open Live Telemetry &rarr;
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 text-xs">
            <div>
              <span className="text-slate-400 text-[10px] block">Energy Delivered</span>
              <span className="text-lg font-bold text-cyan-400 font-mono">{activeSession.energyKwh} kWh</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">Elapsed Time</span>
              <span className="text-lg font-bold text-white font-mono">{Math.floor(activeSession.durationSeconds / 60)} min</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">Current Accrued Cost</span>
              <span className="text-lg font-bold text-white font-mono">₹{activeSession.estimatedCost.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">Authorization Standard</span>
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                <QrCode className="w-3.5 h-3.5" /> Dynamic QR / Online UPI
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 2-WHEELER GREEN IMPACT SUMMARY BANNER */}
      <div className="p-5 rounded-3xl bg-slate-900/90 border border-emerald-500/30 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left">
        <div className="flex items-center gap-3 p-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xl font-extrabold text-white font-mono">{totalRidingKm} km</span>
            <span className="text-xs text-slate-400 block">Clean Electric Riding Range</span>
          </div>
        </div>

        <div className="flex items-center gap-3 p-2 sm:border-x sm:border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xl font-extrabold text-cyan-400 font-mono">₹{fuelSavingsInr}</span>
            <span className="text-xs text-slate-400 block">Saved vs Petrol 2-Wheeler</span>
          </div>
        </div>

        <div className="flex items-center gap-3 p-2">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
            <Leaf className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xl font-extrabold text-emerald-400 font-mono">{co2AvoidedKg} kg</span>
            <span className="text-xs text-slate-400 block">CO₂ Emissions Avoided</span>
          </div>
        </div>
      </div>

      {/* KPI METRICS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="UPI Wallet Balance"
          value={`₹${wallet.balance.toFixed(2)}`}
          subtitle="Instant online settlement"
          icon={Wallet}
          variant="cyan"
        />
        <MetricCard
          title="Total Bike Energy"
          value={`${totalEnergy.toFixed(1)} kWh`}
          subtitle="PZEM-004T metered consumption"
          icon={Zap}
          variant="emerald"
        />
        <MetricCard
          title="Completed Sessions"
          value={historySessions.length}
          subtitle="All paid & settled via UPI"
          icon={History}
          variant="default"
        />
        <MetricCard
          title="Active ToD Tariff"
          value={todInfo.rate}
          subtitle={`${todInfo.slotName} (${todInfo.code})`}
          icon={Clock}
          variant="amber"
        />
      </div>

      {/* RECENT SESSIONS TABLE */}
      <div className="glass-card rounded-3xl p-6 border border-slate-800 bg-slate-900/60 space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white">Recent Charging Sessions</h3>
            <p className="text-xs text-slate-400">Historical two-wheeler charging transactions & Section 6 tax invoices</p>
          </div>
          <Link href="/history" className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
            <span>View Full History</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider">
                <th className="py-3 px-3">Session Code</th>
                <th className="py-3 px-3">Station Hub</th>
                <th className="py-3 px-3">Energy (kWh)</th>
                <th className="py-3 px-3">Duration</th>
                <th className="py-3 px-3">ToD Cost</th>
                <th className="py-3 px-3">Payment</th>
                <th className="py-3 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {historySessions.map((session) => (
                <tr key={session.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3 font-mono font-semibold text-cyan-400">{session.sessionCode}</td>
                  <td className="py-3 px-3 font-medium">{session.chargerName}</td>
                  <td className="py-3 px-3 font-bold font-mono">{session.energyKwh.toFixed(3)} kWh</td>
                  <td className="py-3 px-3">{Math.floor(session.durationSeconds / 60)} min</td>
                  <td className="py-3 px-3 font-bold text-white font-mono">₹{session.finalCost?.toFixed(2)}</td>
                  <td className="py-3 px-3 text-emerald-400 font-semibold">QR / UPI</td>
                  <td className="py-3 px-3"><StatusBadge status={session.status} size="sm" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CARDS GRID: BIKES & TOD SCHEDULE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Vehicles summary */}
        <div className="glass-card rounded-3xl p-6 border border-slate-800 bg-slate-900/60 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Bike className="w-5 h-5 text-cyan-400" />
              <span>Registered 2-Wheelers ({vehicles.length})</span>
            </h3>
            <Link href="/vehicles" className="text-xs font-bold text-cyan-400 hover:text-cyan-300">
              Manage Garage &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            {vehicles.map((veh) => (
              <div key={veh.id} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">{veh.model}</h4>
                  <p className="text-[10px] text-slate-400">{veh.registration} &bull; {veh.batteryCapacityKwh} kWh</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-[10px] font-mono">
                    {veh.connectorType}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Commercial LT-6 Time-of-Day Schedule */}
        <div className="glass-card rounded-3xl p-6 border border-slate-800 bg-slate-900/60 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-400" />
              <span>ToD Tariff Schedule (LT-6 Commercial)</span>
            </h3>
            <span className="text-xs font-mono text-cyan-400">Section 1 & 2 Spec</span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-emerald-400 font-bold block">S_1: Off-Peak (10 PM – 6 AM)</span>
                <span className="text-[10px] text-slate-400 font-sans">Cheapest overnight grid tier</span>
              </div>
              <span className="text-base font-bold text-emerald-400">₹8.00/kWh</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-cyan-400 font-bold block">S_2: Standard (6 AM – 6 PM)</span>
                <span className="text-[10px] text-slate-400 font-sans">Solar hours & daytime load</span>
              </div>
              <span className="text-base font-bold text-cyan-400">₹10.50/kWh</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-rose-400 font-bold block">S_3: Peak (6 PM – 10 PM)</span>
                <span className="text-[10px] text-slate-400 font-sans">Heavy evening domestic surcharge</span>
              </div>
              <span className="text-base font-bold text-rose-400">₹14.00/kWh</span>
            </div>

            <div className="p-2.5 rounded-2xl bg-amber-950/30 border border-amber-500/30 flex items-center justify-between text-amber-300 text-[11px]">
              <span className="flex items-center gap-1 font-sans">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> KLETECH EV Station 2 Surge:
              </span>
              <span className="font-bold">ToD Rate + ₹8.00/kWh</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
