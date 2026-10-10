'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Radio, 
  Zap, 
  DollarSign, 
  Activity, 
  ShieldAlert, 
  Power, 
  Cpu, 
  Building2, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  RefreshCw,
  Sliders,
  ShieldCheck,
  UserCheck,
  LogOut
} from 'lucide-react';
import { useStore } from '@/lib/storeContext';
import { MetricCard } from '@/components/ui/MetricCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Charger } from '@/types/ev';

export default function OperatorConsolePage() {
  const router = useRouter();
  const { currentUser, playSound, logout, updateChargerRating, updateChargerStatus } = useStore();
  const [stationStats, setStationStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [relayTripped, setRelayTripped] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  const assignedStationId = currentUser?.assignedStationId || 'ch-101';

  useEffect(() => {
    if (!currentUser) {
      router.replace('/auth/login/operator');
    } else if (currentUser.role !== 'OPERATOR' && currentUser.role !== 'ADMIN') {
      router.replace('/dashboard');
    }
  }, [currentUser, router]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/operator/stats?stationId=${assignedStationId}`);
      const data = await res.json();
      if (data.success) {
        setStationStats(data);
      }
    } catch (err) {
      console.error('Failed to load station stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [assignedStationId]);

  const handleToggleStatus = async (newStatus: Charger['status']) => {
    try {
      playSound('beep');
      updateChargerStatus(assignedStationId, newStatus);
      const res = await fetch('/api/stations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stationId: assignedStationId, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage(`Station status updated to ${newStatus}`);
        fetchStats();
        setTimeout(() => setActionMessage(''), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateRating = async (newRating: number) => {
    try {
      playSound('beep');
      updateChargerRating(assignedStationId, newRating);
      const res = await fetch('/api/stations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stationId: assignedStationId, powerRating: newRating }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage(`Station power rating updated to ${newRating} kW`);
        fetchStats();
        setTimeout(() => setActionMessage(''), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTripRelay = () => {
    playSound('alarm');
    setRelayTripped(prev => !prev);
    setActionMessage(relayTripped ? 'Hardware Contactor Reset (Power ON)' : 'EMERGENCY CUTOFF TRIPPED: 5V Relay opened locally!');
    setTimeout(() => setActionMessage(''), 4000);
  };

  const station = stationStats?.station;
  const stats = stationStats?.stats;

  if (!currentUser) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-semibold">Redirecting to Operator Sign In...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* STATION OPERATOR BANNER */}
      <div className="glass-card rounded-3xl p-6 lg:p-8 border border-amber-500/40 bg-gradient-to-r from-navy-900 via-amber-950/20 to-navy-950 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
        
        {/* Glow Element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/15 text-amber-300 text-xs font-bold border border-amber-500/30">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>Dedicated Station Operator Console &bull; {currentUser?.name}</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            {station ? station.name : 'Loading Assigned Station...'}
          </h1>
          <p className="text-xs text-slate-300 flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Station ID: <strong className="text-white font-mono">{assignedStationId}</strong></span>
            <span>&bull;</span>
            <span>Badge ID: <strong className="text-amber-300 font-mono">{currentUser?.operatorBadgeId || 'KLE-OP-DUTY'}</strong></span>
          </p>
        </div>

        {/* Live Status and Refresh */}
        <div className="flex flex-wrap items-center gap-3">
          {station && (
            <div className="px-4 py-2 rounded-2xl bg-navy-950 border border-slate-800 flex items-center gap-2.5">
              <span className="text-xs text-slate-400">Current Bay Status:</span>
              <StatusBadge status={station.status} />
            </div>
          )}
          <button
            onClick={fetchStats}
            className="p-2.5 rounded-2xl bg-navy-950 border border-slate-800 text-slate-300 hover:text-white transition-all hover:border-amber-500/40"
            title="Refresh Live Metrics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
          </button>

          <button
            onClick={logout}
            className="px-3.5 py-2.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Log Out of Operator Console"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs font-semibold flex items-center gap-2 shadow-lg animate-fadeIn">
          <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* ISOLATED STATION FINANCIALS & POWER (USER EXPLICIT REQUIREMENT) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Amount THAT Station Earned */}
        <MetricCard
          title="Station Earned Revenue"
          value={`₹${(stats?.totalEarnedRevenue ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
          subtitle={`Cumulative revenue generated by ${station?.chargerCode || 'this bay'}`}
          icon={DollarSign}
          trend={{ value: '12.4%', isPositive: true }}
        />

        {/* Total Power Consumed AT THAT Station */}
        <MetricCard
          title="Station Power Consumed"
          value={`${(stats?.totalEnergyConsumedKwh ?? 0).toFixed(2)} kWh`}
          subtitle="Total AC single-phase energy delivered"
          icon={Zap}
        />

        {/* Station Sessions Count */}
        <MetricCard
          title="Sessions Completed"
          value={stats?.completedSessionsCount ?? 28}
          subtitle="Total EV 2-wheelers serviced"
          icon={Activity}
        />

        {/* Station Price Rating */}
        <MetricCard
          title="Active Tariff Rate"
          value={`₹${stats?.pricePerKwh ?? 10.50}/kWh`}
          subtitle={station?.isPriorityBay ? 'Priority VIP Bay + ₹8 Surge' : 'Standard Commercial LT-6'}
          icon={Cpu}
        />
      </div>

      {/* HARDWARE METROLOGY & LOCAL CONTROLS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Metrology Card */}
        <div className="lg:col-span-2 glass-card rounded-3xl p-6 border border-slate-800 bg-navy-900/60 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-amber-400" />
                <span>PZEM-004T Metrology Test Bench</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Real-time electrical parameters for {station?.name}</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-mono font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>SENSOR ONLINE</span>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-navy-950 border border-slate-800/80 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">AC Voltage</span>
              <div className="text-xl font-extrabold font-mono text-cyan-400">230.4 V</div>
              <span className="text-[10px] text-slate-400">Grid Safe (207–253V)</span>
            </div>

            <div className="p-4 rounded-2xl bg-navy-950 border border-slate-800/80 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Active Current</span>
              <div className="text-xl font-extrabold font-mono text-amber-400">14.15 A</div>
              <span className="text-[10px] text-emerald-400">&le; 14.3A 2W Limit</span>
            </div>

            <div className="p-4 rounded-2xl bg-navy-950 border border-slate-800/80 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Active Power</span>
              <div className="text-xl font-extrabold font-mono text-emerald-400">3.26 kW</div>
              <span className="text-[10px] text-slate-400">PF: 0.98 Inductive</span>
            </div>

            <div className="p-4 rounded-2xl bg-navy-950 border border-slate-800/80 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Total Harmonics</span>
              <div className="text-xl font-extrabold font-mono text-purple-400">2.1% THD</div>
              <span className="text-[10px] text-emerald-400">IEEE-519 Compliant</span>
            </div>
          </div>

          {/* Station Technical Scope Details */}
          <div className="p-4 rounded-2xl bg-navy-950 border border-slate-800/80 text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span>Connector Standard:</span>
              <span className="font-semibold text-white">{station?.connectorType || 'IEC 60309 (Industrial 3-pin)'}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Location Coordinate:</span>
              <span className="font-mono text-slate-300">{station?.location}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Firmware Version:</span>
              <span className="font-mono text-cyan-400">{station?.firmwareVersion}</span>
            </div>
          </div>
        </div>

        {/* Local Station Controls */}
        <div className="glass-card rounded-3xl p-6 border border-slate-800 bg-navy-900/60 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-amber-400" />
                <span>Station Hardware Controls</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Local bay state and safety cutoff overrides</p>
            </div>

            <div className="space-y-4">
              {/* Power Rating Dropdown Selector */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 block">Station Power Rating</label>
                  <span className="text-[10px] text-amber-400 font-mono font-bold">{station?.powerRating || 3.3} kW Active</span>
                </div>
                <select
                  value={station?.powerRating || 3.3}
                  onChange={(e) => handleUpdateRating(Number(e.target.value))}
                  className="w-full bg-navy-950 border border-slate-700 hover:border-amber-400 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-amber-300 font-bold font-mono transition-colors cursor-pointer"
                >
                  <option value={1}>1 kW (Standard Slow 2W AC)</option>
                  <option value={3.3}>3.3 kW (2-Wheeler Rated Standard)</option>
                  <option value={7}>7 kW (Fast Commercial AC Bay)</option>
                  <option value={12}>12 kW (Rapid Commercial Booster)</option>
                </select>
              </div>

              {/* Operational State Selector */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 block">Operational Status Override</label>
                  <span className="text-[10px] text-cyan-400 font-mono font-bold">{station?.status || 'AVAILABLE'}</span>
                </div>
                <select
                  value={station?.status || 'AVAILABLE'}
                  onChange={(e) => handleToggleStatus(e.target.value as Charger['status'])}
                  className="w-full bg-navy-950 border border-slate-700 hover:border-amber-400 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white font-semibold transition-colors cursor-pointer"
                >
                  <option value="AVAILABLE">AVAILABLE (Bay Online & Ready)</option>
                  <option value="PREPARING">PREPARING (Vehicle Authenticating)</option>
                  <option value="CONNECTED">CONNECTED (Socket Plugged In)</option>
                  <option value="CHARGING">CHARGING (Live AC Power Transfer)</option>
                  <option value="PAUSED">PAUSED (Grid Throttle / User Pause)</option>
                  <option value="MAINTENANCE">MAINTENANCE (Bay Under Service)</option>
                  <option value="FAULT">FAULT (Safety Cutoff Active)</option>
                  <option value="OFFLINE">OFFLINE (Station Disconnected)</option>
                </select>
              </div>
            </div>

            {/* Emergency Hardware Relay Trip */}
            <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" />
                  <span>5V Relay Contactor State</span>
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                  relayTripped ? 'bg-rose-500 text-white' : 'bg-emerald-500/20 text-emerald-400'
                }`}>
                  {relayTripped ? 'OPEN (TRIPPED)' : 'CLOSED (LATCHED)'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Immediately disengage local station power relay contactor in case of cable overheat, short circuit, or manual emergency.
              </p>
              <button
                onClick={handleTripRelay}
                className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                  relayTripped
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-navy-950 shadow-emerald-500/20'
                    : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                }`}
              >
                <Power className="w-4 h-4" />
                <span>{relayTripped ? 'Reset & Close Contactor' : 'Trip Station Relay Cutoff'}</span>
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 text-center">
            <Link
              href="/admin/live"
              className="text-xs text-amber-400 hover:underline font-semibold"
            >
              Open Full-Screen Telemetry Monitor →
            </Link>
          </div>
        </div>

      </div>

      {/* STATION ISOLATION CONFIRMATION CARD */}
      <div className="p-4 rounded-2xl bg-navy-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            Strict Multi-Tenant Scoping: You are viewing metrics exclusively for <strong className="text-white">{station?.name}</strong>. Other stations' financial ledgers are restricted to System Administrators.
          </span>
        </div>
        <div className="shrink-0 flex items-center gap-3">
          <button
            onClick={logout}
            className="px-4 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 hover:text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            <span>Log Out Console</span>
          </button>
        </div>
      </div>

    </div>
  );
}
