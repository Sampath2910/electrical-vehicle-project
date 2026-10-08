'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  BatteryCharging, 
  RotateCcw, 
  ShieldCheck, 
  Gauge, 
  Sparkles, 
  Flame, 
  Compass, 
  RefreshCw,
  Bike
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';

export const EvBikeChargingVisual: React.FC = () => {
  // Animation stages: 0 = Bike Arrives, 1 = Smart Connector Plugged, 2 = Live Telemetry & Charging Active
  const [animStage, setAnimStage] = useState<number>(0);
  const [powerKw, setPowerKw] = useState<number>(0);
  const [energyKwh, setEnergyKwh] = useState<number>(0);
  const [cost, setCost] = useState<number>(0);
  const [soc, setSoc] = useState<number>(58); // State of Charge %
  const [batteryTemp, setBatteryTemp] = useState<number>(31.2);
  const [chargingMode, setChargingMode] = useState<'AC_SMART' | 'DC_BOOST'>('AC_SMART');
  const [activeRidingMode, setActiveRidingMode] = useState<'ECO' | 'RIDE' | 'SPORT' | 'WARP'>('RIDE');

  const startSequence = () => {
    setAnimStage(0);
    setPowerKw(0);
    setEnergyKwh(0);
    setCost(0);
    setSoc(58);
    setBatteryTemp(31.2);

    // Stage 0 -> 1: Bike docks at bay (1.2s)
    setTimeout(() => {
      setAnimStage(1);
    }, 1200);

    // Stage 1 -> 2: Latch contactor, 1Hz live telemetry begins (2.4s)
    setTimeout(() => {
      setAnimStage(2);
    }, 2400);
  };

  useEffect(() => {
    startSequence();
  }, []);

  // Telemetry loop during active charging stage (Stage 2)
  useEffect(() => {
    if (animStage !== 2) return;

    const basePower = chargingMode === 'DC_BOOST' ? 11.8 : 3.3;
    setPowerKw(basePower);

    const interval = setInterval(() => {
      const powerVariation = chargingMode === 'DC_BOOST'
        ? +(11.6 + Math.random() * 0.5).toFixed(1)
        : +(3.25 + Math.random() * 0.1).toFixed(2);

      const energyIncrement = chargingMode === 'DC_BOOST' ? 0.008 : 0.002;
      const costIncrement = chargingMode === 'DC_BOOST' ? 0.12 : 0.025;

      setPowerKw(powerVariation);
      setEnergyKwh(prev => +(prev + energyIncrement).toFixed(3));
      setCost(prev => +(prev + costIncrement).toFixed(2));
      setSoc(prev => Math.min(100, +(prev + 0.1).toFixed(1)));
      setBatteryTemp(prev => Math.min(39.5, +(prev + 0.02).toFixed(1)));
    }, 700);

    return () => clearInterval(interval);
  }, [animStage, chargingMode]);

  // Dynamic range calculation based on SoC and selected bike riding mode
  const getEstimatedRange = () => {
    const batteryCapacity = 10.3; // Ultraviolette F77 Mach 2 (10.3 kWh)
    const currentKwh = (soc / 100) * batteryCapacity;
    switch (activeRidingMode) {
      case 'ECO':
        return Math.round(currentKwh * 29.8); // ~307 km max
      case 'RIDE':
        return Math.round(currentKwh * 25.2); // ~260 km max
      case 'SPORT':
        return Math.round(currentKwh * 18.9); // ~195 km max
      case 'WARP':
        return Math.round(currentKwh * 14.1); // ~145 km max
    }
  };

  return (
    <div className="glass-card rounded-3xl p-6 border border-cyan-500/30 bg-slate-900/90 shadow-2xl relative overflow-hidden space-y-6">
      
      {/* HEADER BAR */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center glow-cyan">
            <Bike className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-white">Smart EV Bike Telemetry Bay</h3>
              <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold">MOTO-01</span>
            </div>
            <p className="text-xs text-slate-400">Electronic City • Single-Phase 230V AC / LEV Fast DC</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {animStage === 0 && <StatusBadge status="AVAILABLE" size="sm" />}
          {animStage === 1 && <StatusBadge status="CONNECTED" size="sm" />}
          {animStage === 2 && <StatusBadge status="CHARGING" size="sm" />}

          <button
            onClick={startSequence}
            title="Replay Bike Dock & Charge Simulation"
            className="p-2 rounded-xl bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-slate-300 transition-all shadow-md"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* STAGE CANVAS VISUAL - FEATURING REAL ELECTRIC SUPERBIKE */}
      <div className="relative h-80 sm:h-96 w-full rounded-2xl studio-canvas bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden shadow-inner p-4">
        
        {/* Studio Lighting Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#06b6d408_1px,transparent_1px),linear-gradient(to_bottom,#06b6d408_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        {/* Ambient Floor Glow */}
        <div className="absolute bottom-4 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent blur-sm" />

        {/* REAL ELECTRIC MOTORCYCLE PHOTOGRAPHY DISPLAY */}
        <motion.div
          initial={{ x: 180, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-20 flex flex-col items-center w-full max-w-lg"
        >
          {/* Active Charging Aura */}
          {animStage === 2 && (
            <motion.div 
              initial={{ opacity: 0.4 }}
              animate={{ opacity: [0.35, 0.85, 0.35] }}
              transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
              className="absolute -inset-4 bg-gradient-to-r from-cyan-500/25 via-blue-500/20 to-emerald-500/25 rounded-3xl blur-2xl pointer-events-none"
            />
          )}

          {/* REAL BIKE IMAGE CONTAINER */}
          <div className="relative w-full h-56 sm:h-64 flex items-center justify-center">
            <Image
              src="/images/ev_bike_superbike.jpg"
              alt="Ultraviolette EV Superbike"
              fill
              className="object-cover rounded-2xl drop-shadow-[0_20px_35px_rgba(0,0,0,0.9)] border border-slate-800/80"
              priority
            />

            {/* Glowing Battery SoC Floating Badge */}
            {animStage === 2 && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-slate-950/90 border border-emerald-500/60 text-emerald-400 text-xs font-mono font-bold flex items-center gap-1.5 shadow-xl backdrop-blur-md"
              >
                <BatteryCharging className="w-4 h-4 text-emerald-400 animate-bounce" />
                <span>{soc.toFixed(1)}% SoC</span>
              </motion.div>
            )}

            {/* Active Telemetry Pill (Left) */}
            {animStage === 2 && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-950/90 border border-cyan-500/60 text-cyan-300 text-[11px] font-mono font-bold flex items-center gap-1.5 shadow-xl backdrop-blur-md"
              >
                <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>{powerKw} kW</span>
              </motion.div>
            )}

            {/* Bottom Specs Bar */}
            <div className="absolute bottom-2 inset-x-3 flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800 text-[11px]">
              <span className="font-extrabold text-white flex items-center gap-1.5">
                <Bike className="w-3.5 h-3.5 text-cyan-400" />
                <span>Ultraviolette F77 Mach 2</span>
              </span>
              <span className="text-cyan-400 font-mono font-bold">10.3 kWh Pack</span>
            </div>
          </div>
        </motion.div>

      </div>

      {/* CHARGING MODE & RIDING RANGE ESTIMATOR */}
      <div className="space-y-4">
        
        {/* Toggle Mode: AC Standard vs DC Boost */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-300">Charging Profile:</span>
            <div className="inline-flex rounded-xl bg-slate-900 p-1 border border-slate-800">
              <button
                type="button"
                onClick={() => setChargingMode('AC_SMART')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  chargingMode === 'AC_SMART'
                    ? 'bg-cyan-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                3.3 kW AC Point
              </button>
              <button
                type="button"
                onClick={() => setChargingMode('DC_BOOST')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  chargingMode === 'DC_BOOST'
                    ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                12 kW LEV Boost DC
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>ESP32 Safe Contactor Cutoff Active</span>
          </div>
        </div>

        {/* Riding Range Estimator by Mode */}
        <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>Real-Time Riding Range Estimator</span>
            </span>
            <div className="text-right">
              <span className="text-lg font-black text-cyan-400 font-mono tracking-tight">{getEstimatedRange()} km</span>
              <span className="text-[10px] text-slate-400 block font-medium">projected on {activeRidingMode} Mode</span>
            </div>
          </div>

          {/* Mode Selector Buttons */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'ECO', label: 'Eco', color: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10' },
              { id: 'RIDE', label: 'Ride / City', color: 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10' },
              { id: 'SPORT', label: 'Sport', color: 'text-amber-400 border-amber-500/40 bg-amber-500/10' },
              { id: 'WARP', label: 'Warp / Hyper', color: 'text-rose-400 border-rose-500/40 bg-rose-500/10' },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setActiveRidingMode(m.id as any)}
                className={`py-2 px-1 rounded-xl text-center border text-[11px] font-bold transition-all ${
                  activeRidingMode === m.id
                    ? `${m.color} shadow-md`
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* 1Hz LIVE TELEMETRY DASHBOARD METRICS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Grid Voltage (1Φ)</span>
          <span className="text-lg font-extrabold text-white font-mono">230.4 V</span>
          <span className="text-[9px] text-emerald-400 block mt-0.5">Norm. (Limit 253V)</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Energy Added</span>
          <span className="text-lg font-extrabold text-cyan-400 font-mono">{energyKwh} kWh</span>
          <span className="text-[9px] text-slate-400 block mt-0.5">₹{cost} Current Cost</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Battery Thermal</span>
          <span className="text-lg font-extrabold text-amber-400 font-mono">{batteryTemp}°C</span>
          <span className="text-[9px] text-emerald-400 block mt-0.5">BMS Thermal Safe</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Power Factor</span>
          <span className="text-lg font-extrabold text-emerald-400 font-mono">0.98</span>
          <span className="text-[9px] text-cyan-400 block mt-0.5">PFC Corrected</span>
        </div>

      </div>

    </div>
  );
};
