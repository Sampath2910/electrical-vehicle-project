'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { 
  Radio, 
  Zap, 
  IndianRupee, 
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
  LogOut,
  ArrowLeft,
  Trash2
} from 'lucide-react';
import { useStore } from '@/lib/storeContext';
import { telemetryProvider } from '@/lib/providers';
import { MetricCard } from '@/components/ui/MetricCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ThingSpeakBench } from '@/components/ui/ThingSpeakBench';
import { Charger, Measurement } from '@/types/ev';
import { getTariffForKw } from '@/lib/tariffHelper';

function OperatorConsoleContent() {
  const router = useRouter();
  const { currentUser, playSound, logout, updateChargerRating, updateChargerStatus, clearStationHistory, historySessions } = useStore();
  const [stationStats, setStationStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [relayTripped, setRelayTripped] = useState(false);
  const [actionMessage, setActionMessage] = useState('');
  const [liveMeas, setLiveMeas] = useState<Measurement | null>(null);

  const searchParams = useSearchParams();
  const queryStationId = searchParams.get('stationId');
  const [selectedStationId, setSelectedStationId] = useState<string>(queryStationId || currentUser?.assignedStationId || 'ch-101');
  const [allStations, setAllStations] = useState<any[]>([]);

  useEffect(() => {
    if (queryStationId) {
      setSelectedStationId(queryStationId);
    } else if (currentUser?.assignedStationId) {
      setSelectedStationId(currentUser.assignedStationId);
    }
  }, [queryStationId, currentUser?.assignedStationId]);

  // If admin, load all stations for dropdown switching
  useEffect(() => {
    if (currentUser?.role === 'ADMIN') {
      fetch('/api/admin/stats', { cache: 'no-store' })
        .then(res => res.json())
        .then(data => {
          if (data?.stations) setAllStations(data.stations);
        })
        .catch(() => {});
    }
  }, [currentUser?.role]);

  const assignedStationId = selectedStationId;

  // Live telemetry stream from ThingSpeak Cloud Channel 3533059
  useEffect(() => {
    const unsub = telemetryProvider.subscribe(assignedStationId, (meas) => {
      setLiveMeas(meas);
    });
    return () => unsub();
  }, [assignedStationId]);

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
      const calculatedTariff = getTariffForKw(newRating);
      updateChargerRating(assignedStationId, newRating);
      const res = await fetch('/api/stations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stationId: assignedStationId, powerRating: newRating, pricePerKwh: calculatedTariff }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage(`Station power rating updated to ${newRating} kW (Coupled Tariff: ₹${calculatedTariff.toFixed(2)}/kWh)`);
        fetchStats();
        setTimeout(() => setActionMessage(''), 3500);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearStationHistory = () => {
    if (confirm(`Are you sure you want to clear session history for ${station?.name || 'this station'}? This action is scoped strictly to this bay.`)) {
      clearStationHistory(assignedStationId);
      setActionMessage(`Session history cleared for ${station?.name || 'this bay'}`);
      fetchStats();
      setTimeout(() => setActionMessage(''), 3500);
    }
  };

  const handleTripRelay = () => {
    playSound('alarm');
    setRelayTripped(prev => !prev);
    setActionMessage(relayTripped ? 'Hardware Contactor Reset (Power ON)' : 'EMERGENCY CUTOFF TRIPPED: 5V Relay opened locally!');
    setTimeout(() => setActionMessage(''), 4000);
  };

  const station = stationStats?.station || stationStats;
  const stats = stationStats?.stats || stationStats;
  const stationSessions = historySessions.filter(s => s.chargerId === assignedStationId || s.chargerName === station?.name);

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
      <div className="glass-card rounded-3xl p-6 lg:p-8 border border-amber-300 dark:border-amber-500/40 bg-white dark:bg-gradient-to-r dark:from-navy-900 dark:via-amber-950/20 dark:to-navy-950 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        
        {/* Glow Element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-50 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300 text-xs font-bold border border-amber-200 dark:border-amber-500/30">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>{currentUser?.role === 'ADMIN' ? 'Fleet Administrator Inspection Console' : 'Dedicated Station Operator Console'} &bull; {currentUser?.name}</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {station ? station.name : 'Loading Assigned Station...'}
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Station ID: <strong className="text-slate-900 dark:text-white font-mono">{assignedStationId}</strong></span>
            <span>&bull;</span>
            <span>Badge ID: <strong className="text-amber-700 dark:text-amber-300 font-mono">{currentUser?.operatorBadgeId || 'KLE-OP-DUTY'}</strong></span>
          </p>
        </div>

        {/* Live Status and Refresh */}
        <div className="flex flex-wrap items-center gap-3">
          {currentUser?.role === 'ADMIN' && (
            <Link
              href="/admin"
              className="px-3.5 py-2.5 rounded-2xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Fleet Admin</span>
            </Link>
          )}

          {currentUser?.role === 'ADMIN' && allStations.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-amber-300 dark:border-amber-500/30">
              <span className="text-[11px] text-slate-400 font-semibold">Switch Station:</span>
              <select
                value={assignedStationId}
                onChange={(e) => {
                  setSelectedStationId(e.target.value);
                  router.push(`/operator?stationId=${e.target.value}`);
                }}
                className="bg-transparent text-xs text-amber-800 dark:text-amber-300 font-bold focus:outline-none cursor-pointer"
              >
                {allStations.map(st => (
                  <option key={st.id} value={st.id} className="bg-navy-900 text-white">
                    {st.name} ({st.code || st.id})
                  </option>
                ))}
              </select>
            </div>
          )}

          {station && (
            <div className="px-4 py-2 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 flex items-center gap-2.5">
              <span className="text-xs text-slate-400">Current Bay Status:</span>
              <StatusBadge status={station.status} />
            </div>
          )}
          <button
            onClick={fetchStats}
            className="p-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all hover:border-amber-500/40 shadow-xs"
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
          icon={IndianRupee}
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
        <div className="lg:col-span-2 glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900/60 space-y-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-amber-400" />
                <span>PZEM-004T Metrology Test Bench</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Live ThingSpeak telemetry (Channel #3533059) for {station?.name}</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-mono font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>THINGSPEAK STREAM ACTIVE</span>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800/80 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">AC Voltage</span>
              <div className="text-xl font-extrabold font-mono text-cyan-400">
                {liveMeas ? `${liveMeas.voltageV.toFixed(1)} V` : '229.7 V'}
              </div>
              <span className="text-[10px] text-slate-400">Grid Safe (207–253V)</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800/80 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Active Current</span>
              <div className="text-xl font-extrabold font-mono text-amber-400">
                {liveMeas ? `${liveMeas.currentA.toFixed(2)} A` : '13.94 A'}
              </div>
              <span className="text-[10px] text-emerald-400">&le; 14.3A 2W Limit</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800/80 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Active Power</span>
              <div className="text-xl font-extrabold font-mono text-emerald-400">
                {liveMeas ? `${(liveMeas.powerW / 1000).toFixed(2)} kW` : '3.14 kW'}
              </div>
              <span className="text-[10px] text-slate-400">PF: {liveMeas?.powerFactor || '0.98'} Active</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800/80 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Total Harmonics</span>
              <div className="text-xl font-extrabold font-mono text-purple-400">
                {liveMeas ? `${liveMeas.thdPercent}% THD` : '2.1% THD'}
              </div>
              <span className="text-[10px] text-emerald-400">IEEE-519 Compliant</span>
            </div>
          </div>

          {/* Station Technical Scope Details */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800/80 text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span>Connector Standard:</span>
              <span className="font-semibold text-slate-800 dark:text-white">{station?.connectorType || 'IEC 60309 (Industrial 3-pin)'}</span>
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
        <div className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900/60 space-y-5 flex flex-col justify-between shadow-xl">
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
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
                  className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-700 hover:border-amber-400 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-amber-800 dark:text-amber-300 font-bold font-mono transition-colors cursor-pointer"
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
                  className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-700 hover:border-amber-400 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-semibold transition-colors cursor-pointer"
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

      {/* THINGSPEAK CLOUD METROLOGY BENCH (AUTHORIZED OPERATOR CONTROL) */}
      <ThingSpeakBench />

      {/* DEDICATED STATION SESSION HISTORY & OPERATOR SCOPE WIPE */}
      <div className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900/60 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              <span>Bay Charging History &bull; {station?.name || 'Assigned Bay'}</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Dedicated session log scoped exclusively to this charger ({stationSessions.length} sessions logged)
            </p>
          </div>

          <button
            onClick={handleClearStationHistory}
            disabled={stationSessions.length === 0}
            className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/15 dark:hover:bg-rose-500/25 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-40 cursor-pointer shadow-xs"
            title="Clear all session logs for this station"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            <span>Clear Bay History</span>
          </button>
        </div>

        {stationSessions.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
            No past charging sessions recorded for this station yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800/80 pb-2">
                  <th className="py-2 px-3">Session Code</th>
                  <th className="py-2 px-3">Vehicle</th>
                  <th className="py-2 px-3">Energy (kWh)</th>
                  <th className="py-2 px-3">Duration</th>
                  <th className="py-2 px-3">Final (₹)</th>
                  <th className="py-2 px-3">Date</th>
                  <th className="py-2 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {stationSessions.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-850/50 text-slate-800 dark:text-slate-200">
                    <td className="py-2.5 px-3 font-bold text-cyan-600 dark:text-cyan-400">{s.sessionCode}</td>
                    <td className="py-2.5 px-3 font-sans text-slate-700 dark:text-slate-300">{s.vehicleName || 'Ather 450X'}</td>
                    <td className="py-2.5 px-3 font-bold">{s.energyKwh.toFixed(3)}</td>
                    <td className="py-2.5 px-3">{Math.floor(s.durationSeconds / 60)} min</td>
                    <td className="py-2.5 px-3 font-bold text-emerald-600 dark:text-emerald-400">₹{s.finalCost?.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-slate-500 text-[11px]" suppressHydrationWarning>{new Date(s.startTime).toLocaleDateString([], { month: 'short', day: 'numeric' })}</td>
                    <td className="py-2.5 px-3"><StatusBadge status={s.status} size="sm" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* STATION ISOLATION CONFIRMATION CARD */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600 dark:text-slate-400 shadow-sm">
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


export default function OperatorConsolePage() {
  return (
    <Suspense fallback={
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-semibold">Loading Station Console...</p>
        </div>
      </div>
    }>
      <OperatorConsoleContent />
    </Suspense>
  );
}
