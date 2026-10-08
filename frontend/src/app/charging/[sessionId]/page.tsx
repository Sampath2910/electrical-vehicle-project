'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  Clock, 
  Activity, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  StopCircle, 
  FileText, 
  MapPin, 
  Leaf, 
  Navigation, 
  QrCode, 
  AlertCircle,
  TrendingUp,
  Siren,
  Gauge
} from 'lucide-react';
import { useStore } from '@/lib/storeContext';
import { telemetryProvider, getCurrentToDSlot } from '@/lib/providers';
import { TelemetryGauge } from '@/components/ui/TelemetryGauge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Measurement } from '@/types/ev';

export default function LiveChargingPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { 
    activeSession, 
    historySessions, 
    stopChargingSession, 
    playSound,
    isEvictionWarningActive,
    evictionCountdown,
    penaltyApplied,
    triggerEmergencyOverride,
    yieldEmergencyBay
  } = useStore();

  const currentSession = activeSession?.id === resolvedParams.sessionId 
    ? activeSession 
    : historySessions.find(s => s.id === resolvedParams.sessionId) || activeSession;

  const todInfo = getCurrentToDSlot();

  // Strict 2-wheeler electrical profile (restricted to max 14.3A at 230V, ~3.18 kW)
  const [liveMeasurement, setLiveMeasurement] = useState<Measurement>({
    id: 'meas-initial',
    sessionId: resolvedParams.sessionId,
    chargerId: currentSession?.chargerId || 'ch-101',
    timestamp: new Date().toISOString(),
    voltageV: 230.2,
    currentA: 14.1, // Restricted to <= 14.3A
    powerW: 3180, // <= 3.3 kW
    energyKwh: currentSession?.energyKwh || 2.15,
    frequencyHz: 50.01,
    powerFactor: 0.98,
    thdPercent: 2.1, // Power Quality: Total Harmonic Distortion < 5% IEEE-519
    voltageSagSwellStatus: 'NORMAL',
    todSlotActive: `${todInfo.slotCode}: ${todInfo.slotName}`,
    todRate: currentSession?.tariffRate || todInfo.baseRate,
  });

  const [isStopping, setIsStopping] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(currentSession?.durationSeconds || 1800);

  // Subscribe to 1Hz Telemetry Provider
  useEffect(() => {
    if (!currentSession || currentSession.status !== 'CHARGING') return;

    const unsubscribe = telemetryProvider.subscribe(currentSession.id, (meas) => {
      setLiveMeasurement(meas);
      setElapsedSeconds(prev => prev + 1);
    });

    return () => unsubscribe();
  }, [currentSession]);

  const handleStopNormal = async () => {
    if (!currentSession) return;
    setIsStopping(true);
    playSound('alert');
    try {
      const completedSession = await stopChargingSession(currentSession.id, false);
      router.push(`/charging/${completedSession.id}/complete`);
    } catch (err) {
      console.error(err);
      setIsStopping(false);
    }
  };

  const handleYieldBay = async () => {
    if (!currentSession) return;
    setIsStopping(true);
    try {
      const completedSession = await yieldEmergencyBay();
      router.push(`/charging/${completedSession.id}/complete`);
    } catch (err) {
      console.error(err);
      setIsStopping(false);
    }
  };

  if (!currentSession) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Charging Session Not Found</h2>
        <p className="text-xs text-slate-400">The requested session ID is invalid or has already ended.</p>
        <Link href="/dashboard" className="inline-block px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 text-xs font-bold">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainingSec = sec % 60;
    return `${mins}m ${remainingSec < 10 ? '0' : ''}${remainingSec}s`;
  };

  // Section 6 Official Billing Formula preview:
  // Energy * Rate + ₹5 Fee + 18% GST (+ ₹500 penalty if applicable)
  const energyCost = +(liveMeasurement.energyKwh * currentSession.tariffRate).toFixed(2);
  const serviceFee = 5.00;
  const taxableSubtotal = +(energyCost + serviceFee).toFixed(2);
  const gstTax = +(taxableSubtotal * 0.18).toFixed(2);
  const currentTotalCost = +(taxableSubtotal + gstTax + (penaltyApplied ? 500 : 0)).toFixed(2);

  const co2SavedKg = +(liveMeasurement.energyKwh * 0.85).toFixed(2);
  // EV Bike efficiency: ~38 km per kWh
  const rangeAddedKm = Math.round(liveMeasurement.energyKwh * 38);
  
  // Dynamic SoC for Indian 2-wheeler pack (~3.7 kWh pack size)
  const initialSoc = 22;
  const packCapacityKwh = 3.7;
  const currentSoc = Math.min(100, Math.round(initialSoc + (liveMeasurement.energyKwh / packCapacityKwh) * 100));

  const handleSimulateSurge = () => {
    playSound('alert');
    alert("⚠️ Grid Surge Simulation: Injected 255.4V AC on PZEM-004T Meter (>253V limit). ESP32 ISR drives GPIO 26 LOW in < 10ms!");
    handleStopNormal();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6"
    >
      
      {/* PDF SECTION 2: 120-SECOND EMERGENCY PREEMPTION EVICTION BANNER */}
      <AnimatePresence>
        {isEvictionWarningActive && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-5 sm:p-6 rounded-3xl bg-rose-600 border-2 border-rose-300 text-white shadow-2xl shadow-rose-600/50 space-y-4 animate-pulse"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-white text-rose-600">
                  <Siren className="w-8 h-8 animate-bounce" />
                </div>
                <div>
                  <span className="text-[10px] font-black tracking-widest uppercase bg-white/20 px-2 py-0.5 rounded-md">
                    PRIORITY PREEMPTION ACTIVE
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                    VACATE IMMEDIATELY: EMERGENCY VEHICLE ARRIVED!
                  </h2>
                  <p className="text-xs text-rose-100">
                    An ambulance has arrived at Priority Bay #02. You must unplug within 120 seconds or face an automated <strong>₹500 penalty fee</strong>.
                  </p>
                </div>
              </div>

              {/* Countdown timer pill */}
              <div className="flex items-center gap-4 shrink-0 bg-slate-950/70 p-3.5 rounded-2xl border border-rose-400">
                <div className="text-center">
                  <span className="text-3xl font-black font-mono text-rose-400 block">{evictionCountdown}s</span>
                  <span className="text-[9px] uppercase tracking-wider text-slate-300">Time to Yield</span>
                </div>

                <button
                  type="button"
                  onClick={handleYieldBay}
                  disabled={isStopping}
                  className="px-5 py-3 rounded-xl bg-white hover:bg-slate-100 text-rose-700 font-extrabold text-xs uppercase tracking-wider shadow-lg transition-transform hover:scale-105"
                >
                  Unplug Now &amp; Yield Bay
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Session Header Banner */}
      <div className="glass-card rounded-3xl p-6 border border-cyan-500/30 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 text-cyan-400">
              {currentSession.sessionCode}
            </span>
            <StatusBadge status={currentSession.status} size="lg" />
            {currentSession.isPriorityBay && (
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40">
                VIP / PRIORITY PREEMPTION BAY
              </span>
            )}
          </div>
          <h1 className="text-2xl font-extrabold text-white">{currentSession.chargerName}</h1>
          <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
            <MapPin className="w-3.5 h-3.5 text-slate-500" />
            <span>{currentSession.chargerLocation} &bull; <strong>PZEM-004T Metering</strong></span>
          </p>
        </div>

        {currentSession.status === 'CHARGING' && (
          <div className="flex items-center gap-2.5">
            {/* Quick Trigger Button for Examiners */}
            <button
              onClick={() => {
                if (isEvictionWarningActive) {
                  handleYieldBay();
                } else {
                  triggerEmergencyOverride();
                }
              }}
              className="px-4 py-3 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all"
            >
              <Siren className="w-4 h-4 text-amber-400" />
              <span>Simulate Override</span>
            </button>

            <button
              onClick={handleStopNormal}
              disabled={isStopping}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-rose-500/25 transition-all hover:scale-105 disabled:opacity-50"
            >
              <StopCircle className="w-4 h-4 fill-white text-rose-600" />
              <span>{isStopping ? 'Tripping Contactor...' : 'Stop Charging'}</span>
            </button>
          </div>
        )}
      </div>

      {/* PDF SECTION 3: TIME-OF-DAY (ToD) VISUALIZER */}
      <div className="glass-card rounded-3xl p-5 border border-cyan-500/30 bg-gradient-to-r from-cyan-950/30 via-slate-900 to-blue-950/30 space-y-3 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Time-of-Day (ToD) Tariff Visualizer (Commercial EV LT-6 Structure)
            </span>
          </div>
          <span className="text-[10px] text-cyan-300 font-mono">
            Active Multiplier Rate: <strong>₹{currentSession.tariffRate.toFixed(2)}/kWh</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {/* Off-Peak Slot */}
          <div className={`p-3 rounded-2xl border transition-all ${
            todInfo.slotCode === 'S_1' 
              ? 'bg-cyan-500/20 border-cyan-400 glow-cyan text-white' 
              : 'bg-slate-950/60 border-slate-800 text-slate-400'
          }`}>
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-[11px]">S_1: Normal / Off-Peak</span>
              <span className="font-mono font-extrabold text-cyan-300">₹8.00 / kWh</span>
            </div>
            <span className="text-[10px] text-slate-400 block font-mono">10:00 PM to 06:00 AM</span>
            <p className="text-[9px] text-slate-500 mt-1">Cheapest tier for overnight grid demand valley.</p>
          </div>

          {/* Standard Slot */}
          <div className={`p-3 rounded-2xl border transition-all ${
            todInfo.slotCode === 'S_2' 
              ? 'bg-cyan-500/20 border-cyan-400 glow-cyan text-white' 
              : 'bg-slate-950/60 border-slate-800 text-slate-400'
          }`}>
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-[11px]">S_2: Mid / Standard</span>
              <span className="font-mono font-extrabold text-cyan-300">₹10.50 / kWh</span>
            </div>
            <span className="text-[10px] text-slate-400 block font-mono">06:00 AM to 06:00 PM</span>
            <p className="text-[9px] text-slate-500 mt-1">Daytime solar-generation &amp; standard grid load.</p>
          </div>

          {/* Peak Slot */}
          <div className={`p-3 rounded-2xl border transition-all ${
            todInfo.slotCode === 'S_3' 
              ? 'bg-cyan-500/20 border-cyan-400 glow-cyan text-white' 
              : 'bg-slate-950/60 border-slate-800 text-slate-400'
          }`}>
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-[11px]">S_3: Evening Peak</span>
              <span className="font-mono font-extrabold text-cyan-300">₹14.00 / kWh</span>
            </div>
            <span className="text-[10px] text-slate-400 block font-mono">06:00 PM to 10:00 PM</span>
            <p className="text-[9px] text-slate-500 mt-1">Surcharge during domestic peak load stress.</p>
          </div>
        </div>

        {currentSession.isPriorityBay && (
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-semibold flex items-center justify-between">
            <span>🚨 Priority Bay Surge Premium Active: Base ToD (₹{todInfo.baseRate.toFixed(2)}) + ₹8.00/kWh = <strong>₹{(todInfo.baseRate + 8.00).toFixed(2)}/kWh</strong></span>
            <span className="font-mono text-[10px] bg-amber-500/20 px-2 py-0.5 rounded">Preemption Active</span>
          </div>
        )}
      </div>

      {/* DYNAMIC BIKE BATTERY SOC VISUALIZER */}
      <div className="glass-card rounded-3xl p-6 border border-cyan-500/30 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Zap className="w-4 h-4 animate-bounce" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Indian 2-Wheeler Battery State of Charge (SoC)</span>
              <span className="text-[11px] text-slate-400">
                Calibrated for {currentSession.vehicleName || 'Ather 450X (3.7 kWh) / Ola S1 Pro (4 kWh) / TVS iQube (3.4 kWh)'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-extrabold text-cyan-400 font-mono">{currentSoc}%</span>
            <span className="text-xs text-emerald-400 font-semibold">(+{currentSoc - initialSoc}% added)</span>
          </div>
        </div>

        {/* Animated Progress Bar */}
        <div className="w-full bg-slate-950 h-5 rounded-full p-1 border border-slate-800 relative overflow-hidden">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-blue-600 via-cyan-400 to-emerald-400 transition-all duration-700 relative"
            style={{ width: `${currentSoc}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>Start: {initialSoc}%</span>
          <span className="text-cyan-400 font-semibold">2-Wheeler Draw: {liveMeasurement.currentA.toFixed(1)} A (max 14.3A)</span>
          <span>Target: 100%</span>
        </div>
      </div>

      {/* MAIN 1Hz LIVE TELEMETRY GAUGE (3.3kW MAX SCOPE) */}
      <TelemetryGauge
        powerW={liveMeasurement.powerW}
        voltageV={liveMeasurement.voltageV}
        currentA={liveMeasurement.currentA}
        frequencyHz={liveMeasurement.frequencyHz}
        powerFactor={liveMeasurement.powerFactor}
        maxPowerKw={3.3} // Restricted to 3.3 kW max for 2-wheelers
      />

      {/* PDF SECTION 3: POWER QUALITY METRICS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Power Factor */}
        <div className="glass-card rounded-2xl p-4 border border-slate-800 bg-slate-900/60">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase text-slate-400">Power Factor (cos &phi;)</span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold">PFC Active</span>
          </div>
          <span className="text-2xl font-extrabold text-white font-mono">{liveMeasurement.powerFactor}</span>
          <p className="text-[10px] text-slate-500 mt-1">High power factor ensures near-unity grid efficiency.</p>
        </div>

        {/* THD Harmonic Distortion */}
        <div className="glass-card rounded-2xl p-4 border border-cyan-500/30 bg-slate-900/60">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase text-slate-400">Total Harmonic Distortion (THD)</span>
            <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 text-[10px] font-mono font-bold">&lt; 5% Limit</span>
          </div>
          <span className="text-2xl font-extrabold text-cyan-400 font-mono">{liveMeasurement.thdPercent}%</span>
          <p className="text-[10px] text-slate-500 mt-1">IEEE-519 compliant low current distortion.</p>
        </div>

        {/* Voltage Sag / Swell Alert Log */}
        <div className="glass-card rounded-2xl p-4 border border-slate-800 bg-slate-900/60">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase text-slate-400">Voltage Stability</span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold">Safe Nominal</span>
          </div>
          <span className="text-2xl font-extrabold text-emerald-400 font-mono">
            {liveMeasurement.voltageV} V
          </span>
          <p className="text-[10px] text-slate-500 mt-1">No Sag (&lt;207V) or Swell (&gt;253V) detected.</p>
        </div>

      </div>

      {/* PRIMARY SESSION COUNTERS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* ENERGY CONSUMED */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 bg-slate-900/60">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">Total Energy Delivered</span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-cyan-400">{liveMeasurement.energyKwh}</span>
            <span className="text-xs font-bold text-slate-300">kWh</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Sampled continuously via PZEM-004T</p>
        </div>

        {/* CHARGING DURATION */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 bg-slate-900/60">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">Elapsed Duration</span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white">{formatDuration(elapsedSeconds)}</span>
            <Clock className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Synchronized with GPIO 26 relay latch</p>
        </div>

        {/* ESTIMATED ACCRUED COST (SECTION 6 FORMULA) */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 bg-slate-900/60">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">Accrued Invoice Total</span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-emerald-400">₹{currentTotalCost.toFixed(2)}</span>
            <span className="text-xs font-mono text-slate-400">@ ₹{currentSession.tariffRate}/kWh</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Incl. ₹5 service fee + 18% GST</p>
        </div>

      </div>

      {/* ECO FOOTPRINT & TWO-WHEELER DRIVING RANGE ADDED */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* CO2 Saved */}
        <div className="glass-card rounded-2xl p-5 border border-emerald-500/30 bg-emerald-950/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              <Leaf className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase text-emerald-300 block">Environmental Impact</span>
              <span className="text-xl font-extrabold text-white">{co2SavedKg} kg CO₂</span>
              <span className="text-[10px] text-slate-400 block">Emissions Offset vs Petrol Scooter</span>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold font-mono">
            🌱 +{(co2SavedKg / 20).toFixed(1)} Trees
          </span>
        </div>

        {/* Driving Range Added */}
        <div className="glass-card rounded-2xl p-5 border border-blue-500/30 bg-blue-950/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-500/20 text-cyan-400 border border-blue-500/40">
              <Navigation className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase text-cyan-300 block">Two-Wheeler Range Added</span>
              <span className="text-xl font-extrabold text-white">+{rangeAddedKm} km</span>
              <span className="text-[10px] text-slate-400 block">Electric Bike Commute Distance</span>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold font-mono">
            ⚡ ~38 km/kWh
          </span>
        </div>

      </div>

      {/* EEE HARDWARE SAFETY MONITOR (PZEM-004T + ESP32) */}
      <div className="glass-card rounded-3xl p-6 border border-slate-800 bg-slate-950 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Autonomous Hardware Safety Monitor (ESP32 DevKit V1)</span>
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Continuous firmware protection loop polling at 1000 Hz</p>
          </div>
          
          <button
            onClick={handleSimulateSurge}
            className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[11px] font-bold flex items-center gap-1.5 transition-all"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Simulate Overvoltage Trip (&gt;253V)</span>
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-400 text-[10px] block">Overvoltage Limit</span>
            <span className="font-bold text-emerald-400">&lt; 253V AC (OK)</span>
            <span className="text-[9px] text-slate-500 block">PZEM-004T UART2</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-400 text-[10px] block">2W Current Draw</span>
            <span className="font-bold text-emerald-400">&le; 14.3A (OK)</span>
            <span className="text-[9px] text-slate-500 block">3.3kW Single-Phase</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-400 text-[10px] block">Contactor State</span>
            <span className="font-bold text-cyan-400 font-mono">GPIO 26 = HIGH</span>
            <span className="text-[9px] text-slate-500 block">Relay Latch Active</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-400 text-[10px] block">Payment Gateway</span>
            <span className="font-bold text-cyan-300 font-mono">Dynamic UPI / QR</span>
            <span className="text-[9px] text-slate-500 block">Zero-RFID Online Pay</span>
          </div>
        </div>
      </div>

    </motion.div>
  );
}
