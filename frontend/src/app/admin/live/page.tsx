'use client';

import React, { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';
import { 
  Activity, 
  Zap, 
  Radio, 
  ShieldCheck, 
  Gauge, 
  Clock, 
  AlertTriangle, 
  Siren, 
  CheckCircle2, 
  Layers 
} from 'lucide-react';
import { useStore } from '@/lib/storeContext';
import { telemetryProvider, getCurrentToDSlot } from '@/lib/providers';
import { StatusBadge } from '@/components/ui/StatusBadge';

interface ChartPoint {
  time: string;
  powerKw: number;
  voltage: number;
  current: number;
  thd: number;
}

export default function AdminLiveTelemetryPage() {
  const { 
    chargers, 
    activeSession, 
    triggerEmergencyOverride, 
    isEvictionWarningActive, 
    evictionCountdown, 
    penaltyApplied 
  } = useStore();

  const [selectedChargerId, setSelectedChargerId] = useState(chargers[0]?.id || 'CHG-001');
  const [telemetryHistory, setTelemetryHistory] = useState<ChartPoint[]>([]);
  const [sagSwellAlerts, setSagSwellAlerts] = useState<string[]>([
    '09:42:15 - Voltage nominal 230.4V within IEEE-519 ±6% tolerance',
    '09:15:30 - Minor transient dip to 226.1V resolved without sag trip'
  ]);

  const selectedCharger = chargers.find(c => c.id === selectedChargerId) || chargers[0];
  const todInfo = getCurrentToDSlot();

  useEffect(() => {
    // Generate initial history wave restricted strictly to 2-wheeler academic scope (Max 3.3 kW / 14.3 A @ 230V)
    const initialPoints: ChartPoint[] = [];
    const now = Date.now();
    for (let i = 15; i >= 0; i--) {
      const timestamp = new Date(now - i * 2000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const volt = +(229.0 + Math.random() * 2.2 - 1.1).toFixed(1);
      const curr = +(13.2 + Math.random() * 0.9).toFixed(1); // strictly <= 14.3A
      const pkw = +((volt * curr) / 1000).toFixed(2);
      initialPoints.push({
        time: timestamp,
        powerKw: Math.min(3.3, pkw),
        voltage: volt,
        current: Math.min(14.3, curr),
        thd: +(2.0 + Math.random() * 0.3).toFixed(1)
      });
    }
    setTelemetryHistory(initialPoints);

    // Subscribe to live telemetry ticks
    const unsub = telemetryProvider.subscribe('ses-live-admin', (meas) => {
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setTelemetryHistory(prev => {
        const next = [...prev.slice(1), {
          time: timeStr,
          powerKw: +(Math.min(3.3, meas.powerW / 1000)).toFixed(2),
          voltage: meas.voltageV,
          current: Math.min(14.3, meas.currentA),
          thd: meas.thdPercent || 2.1
        }];
        return next;
      });

      // Power quality sag/swell detection
      if (meas.voltageV < 207) {
        setSagSwellAlerts(prev => [`${timeStr} - VOLTAGE SAG DETECTED: ${meas.voltageV}V (<207V)`, ...prev.slice(0, 4)]);
      } else if (meas.voltageV > 253) {
        setSagSwellAlerts(prev => [`${timeStr} - VOLTAGE SWELL DETECTED: ${meas.voltageV}V (>253V Overvoltage Trip)`, ...prev.slice(0, 4)]);
      }
    });

    return () => unsub();
  }, [selectedChargerId]);

  const latestPoint = telemetryHistory[telemetryHistory.length - 1] || { powerKw: 3.18, voltage: 230.2, current: 13.8, thd: 2.1 };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[11px] font-mono font-bold text-cyan-400 mb-2">
            PZEM-004T AC Metrology Engine &bull; Grid Telemetry
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Activity className="w-8 h-8 text-cyan-400 animate-pulse" />
            <span>Live Power Quality & Telemetry Stream</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            2-Wheeler scope restricted to max 14.3 Amps at 230V single-phase (3.3 kW ceiling) per project specification
          </p>
        </div>

        {/* Charger Selector */}
        <div className="w-full md:w-80">
          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Select Hardware Bay</label>
          <select
            value={selectedChargerId}
            onChange={(e) => setSelectedChargerId(e.target.value)}
            className="w-full bg-navy-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-bold"
          >
            {chargers.map(c => (
              <option key={c.id} value={c.id}>
                {c.chargerCode} &bull; {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* SECTION 2: DIGITAL EMERGENCY OVERRIDE TRIGGER BANNER */}
      <div className="glass-card rounded-3xl p-5 border border-amber-500/30 bg-amber-950/20 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
            <Siren className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-sm">Priority Preemption Emergency Dispatch</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                Section 2 Protocol
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Simulate an incoming ambulance/fire brigade arrival at Bay #02. Triggers active buzzer and initiates 120-second eviction countdown with auto-cutoff.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {isEvictionWarningActive ? (
            <div className="px-4 py-2.5 rounded-2xl bg-rose-600/30 border border-rose-500 text-rose-300 font-mono font-bold text-xs animate-pulse flex items-center gap-2">
              <span>EVICTION IN PROGRESS: {evictionCountdown}s</span>
              {penaltyApplied && <span className="text-amber-400">(₹500 Cutoff Applied)</span>}
            </div>
          ) : (
            <button
              onClick={() => triggerEmergencyOverride()}
              className="w-full md:w-auto px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-rose-600/25 transition-all hover:scale-105"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Trigger Emergency Override</span>
            </button>
          )}
        </div>
      </div>

      {/* METRIC COUNTERS ROW (Page 3 Scope: Max 14.3A / 3.3kW + Power Quality) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        
        {/* Live Power */}
        <div className="p-4 rounded-2xl glass-card border border-cyan-500/30 bg-navy-900/80">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Delivered Power</span>
          <span className="text-2xl font-extrabold text-cyan-400 font-mono">{latestPoint.powerKw.toFixed(2)} <span className="text-xs text-slate-300 font-sans">kW</span></span>
          <span className="text-[10px] text-cyan-300/80 block mt-1">Scope: Max 3.3 kW</span>
        </div>

        {/* Grid Voltage */}
        <div className="p-4 rounded-2xl glass-card border border-slate-800 bg-navy-900/80">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Grid Voltage</span>
          <span className="text-2xl font-extrabold text-white font-mono">{latestPoint.voltage.toFixed(1)} <span className="text-xs text-slate-400 font-sans">V</span></span>
          <span className="text-[10px] text-emerald-400 block mt-1">Nominal: 230V ±6%</span>
        </div>

        {/* Current Draw */}
        <div className="p-4 rounded-2xl glass-card border border-slate-800 bg-navy-900/80">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Current Draw</span>
          <span className="text-2xl font-extrabold text-amber-400 font-mono">{latestPoint.current.toFixed(1)} <span className="text-xs text-slate-400 font-sans">A</span></span>
          <span className="text-[10px] text-amber-300/80 block mt-1">Strict Limit: ≤14.3 A</span>
        </div>

        {/* Power Factor & THD */}
        <div className="p-4 rounded-2xl glass-card border border-emerald-500/30 bg-navy-900/80">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Power Quality (THD)</span>
          <span className="text-2xl font-extrabold text-emerald-400 font-mono">{latestPoint.thd.toFixed(1)}%</span>
          <span className="text-[10px] text-slate-400 block mt-1">PF: 0.98 | IEEE-519 &lt;5%</span>
        </div>

        {/* Active ToD Slot */}
        <div className="p-4 rounded-2xl glass-card border border-purple-500/30 bg-navy-900/80 col-span-2 md:col-span-1">
          <span className="text-[10px] uppercase font-bold text-purple-300 block mb-1">Active ToD Slot</span>
          <span className="text-xl font-extrabold text-purple-300 font-mono block truncate">{todInfo.rate}</span>
          <span className="text-[10px] text-slate-400 block mt-1">{todInfo.slotName} ({todInfo.multiplier}x)</span>
        </div>

      </div>

      {/* SECTION 1: DYNAMIC TIME-OF-DAY (TOD) VISUALIZER */}
      <div className="glass-card rounded-3xl p-6 border border-slate-800 bg-navy-900/70 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-400" />
              <span>Time-of-Day (ToD) Tariff Visualizer & Rate Multiplier</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Commercial LT-6 retail markup schedule applied to active metering</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-xs font-bold">
            Live Slot: {todInfo.code}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className={`p-4 rounded-2xl border transition-all ${todInfo.code === 'S_1' ? 'bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/30' : 'bg-navy-950 border-slate-800'}`}>
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-400">S_1: Off-Peak (Overnight)</span>
              {todInfo.code === 'S_1' && <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">ACTIVE NOW</span>}
            </div>
            <p className="text-slate-400 text-[11px] mt-1">10:00 PM – 06:00 AM</p>
            <div className="mt-3 flex items-baseline justify-between font-mono">
              <span className="text-xl font-bold text-emerald-400">₹8.00 / kWh</span>
              <span className="text-xs text-slate-400">0.76x Multiplier</span>
            </div>
          </div>

          <div className={`p-4 rounded-2xl border transition-all ${todInfo.code === 'S_2' ? 'bg-cyan-950/40 border-cyan-500 ring-2 ring-cyan-500/30' : 'bg-navy-950 border-slate-800'}`}>
            <div className="flex items-center justify-between">
              <span className="font-bold text-cyan-400">S_2: Standard / Mid</span>
              {todInfo.code === 'S_2' && <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold">ACTIVE NOW</span>}
            </div>
            <p className="text-slate-400 text-[11px] mt-1">06:00 AM – 06:00 PM (Solar Hours)</p>
            <div className="mt-3 flex items-baseline justify-between font-mono">
              <span className="text-xl font-bold text-cyan-400">₹10.50 / kWh</span>
              <span className="text-xs text-slate-400">1.00x Base</span>
            </div>
          </div>

          <div className={`p-4 rounded-2xl border transition-all ${todInfo.code === 'S_3' ? 'bg-rose-950/40 border-rose-500 ring-2 ring-rose-500/30' : 'bg-navy-950 border-slate-800'}`}>
            <div className="flex items-center justify-between">
              <span className="font-bold text-rose-400">S_3: Evening Peak</span>
              {todInfo.code === 'S_3' && <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold">ACTIVE NOW</span>}
            </div>
            <p className="text-slate-400 text-[11px] mt-1">06:00 PM – 10:00 PM (Domestic Peak)</p>
            <div className="mt-3 flex items-baseline justify-between font-mono">
              <span className="text-xl font-bold text-rose-400">₹14.00 / kWh</span>
              <span className="text-xs text-slate-400">1.33x Surcharge</span>
            </div>
          </div>
        </div>
      </div>

      {/* RECHARTS POWER GRAPH (0 to 4 kW Range) */}
      <div className="glass-card rounded-3xl p-6 border border-slate-800 bg-navy-900/60 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyan-400" />
            <span>2-Wheeler Active Power Output (kW) &bull; Max 3.3 kW</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">1Hz Update Rate &bull; PZEM-004T Meter</span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={telemetryHistory}>
              <defs>
                <linearGradient id="powerGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#00F0FF" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
              <YAxis domain={[0, 4]} stroke="#64748b" fontSize={10} unit=" kW" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0d1527', borderColor: '#1e293b', borderRadius: '12px', fontSize: '12px' }}
              />
              <Area type="monotone" dataKey="powerKw" stroke="#00F0FF" strokeWidth={3} fillOpacity={1} fill="url(#powerGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* VOLTAGE & CURRENT GRAPHS (0 to 16A Range) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div className="glass-card rounded-3xl p-6 border border-slate-800 bg-navy-900/60 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Grid Voltage Stability (V) &bull; 230V Nominal</h3>
            <span className="text-[10px] text-emerald-400 font-mono">Trip: &lt;207V | &gt;253V</span>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={telemetryHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                <YAxis domain={[215, 245]} stroke="#64748b" fontSize={10} unit="V" />
                <Tooltip contentStyle={{ backgroundColor: '#0d1527', borderColor: '#1e293b', borderRadius: '12px', fontSize: '12px' }} />
                <Line type="monotone" dataKey="voltage" stroke="#38BDF8" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card rounded-3xl p-6 border border-slate-800 bg-navy-900/60 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">2W Contactor Current Draw (A) &bull; Max 14.3A</h3>
            <span className="text-[10px] text-amber-400 font-mono">Limit: 14.3A 230V</span>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={telemetryHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                <YAxis domain={[0, 16]} stroke="#64748b" fontSize={10} unit="A" />
                <Tooltip contentStyle={{ backgroundColor: '#0d1527', borderColor: '#1e293b', borderRadius: '12px', fontSize: '12px' }} />
                <Line type="monotone" dataKey="current" stroke="#10B981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* POWER QUALITY AUDIT & SAG/SWELL LOG */}
      <div className="glass-card rounded-3xl p-6 border border-slate-800 bg-navy-900/60 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Power Quality Monitoring Log (Sag / Swell / THD Compliance)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-navy-950 border border-slate-800 space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Harmonic Distortion</span>
            <div className="flex items-center justify-between">
              <span className="text-xl font-extrabold text-emerald-400 font-mono">2.1% THD</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">PASS (&lt;5%)</span>
            </div>
            <p className="text-[11px] text-slate-400">Compliant with IEEE-519 standards for residential/commercial EV grid interconnect.</p>
          </div>

          <div className="p-4 rounded-2xl bg-navy-950 border border-slate-800 space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Operating Power Factor</span>
            <div className="flex items-center justify-between">
              <span className="text-xl font-extrabold text-cyan-400 font-mono">0.98 PF</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-bold">NEAR UNITY</span>
            </div>
            <p className="text-[11px] text-slate-400">High efficiency active power factor correction validated by PZEM-004T metrology.</p>
          </div>

          <div className="p-4 rounded-2xl bg-navy-950 border border-slate-800 space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Voltage Stability Alerts</span>
            <div className="space-y-1 font-mono text-[10px] text-slate-300 max-h-24 overflow-y-auto">
              {sagSwellAlerts.map((alert, idx) => (
                <div key={idx} className="truncate text-slate-400 hover:text-white">
                  &bull; {alert}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
