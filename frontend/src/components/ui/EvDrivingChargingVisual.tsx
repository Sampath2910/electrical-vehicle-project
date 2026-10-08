'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, BatteryCharging, RotateCcw, ShieldCheck, Gauge, Sparkles, AlertCircle, Bike } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';

export const EvDrivingChargingVisual: React.FC = () => {
  // Animation stages: 0 = EV 2-Wheeler Arriving, 1 = Plug Connected, 2 = 2W Smart Charging Active
  const [animStage, setAnimStage] = useState<number>(0);
  const [powerKw, setPowerKw] = useState<number>(0);
  const [energyKwh, setEnergyKwh] = useState<number>(0);
  const [cost, setCost] = useState<number>(0);
  const [soc, setSoc] = useState<number>(42); // State of Charge %
  const [chargingMode, setChargingMode] = useState<'FAST_2W' | 'SLOW_2W'>('FAST_2W');

  const startSequence = () => {
    setAnimStage(0);
    setPowerKw(0);
    setEnergyKwh(0);
    setCost(0);
    setSoc(42);

    // Stage 0 -> 1: Bike docks at bay (1.5s)
    setTimeout(() => {
      setAnimStage(1);
    }, 1500);

    // Stage 1 -> 2: Cable latches, charging begins (3.0s)
    setTimeout(() => {
      setAnimStage(2);
    }, 3000);
  };

  useEffect(() => {
    startSequence();
  }, []);

  // Telemetry loop during active charging stage (Stage 2)
  useEffect(() => {
    if (animStage !== 2) return;

    // Scope restricted to 1kW - 3.3kW 2-Wheeler (PDF Section 4)
    const basePower = chargingMode === 'FAST_2W' ? 3.2 : 1.4;
    setPowerKw(basePower);

    const interval = setInterval(() => {
      const powerVariation = chargingMode === 'FAST_2W' 
        ? +(3.15 + Math.random() * 0.14).toFixed(2) // Max 3.3 kW
        : +(1.35 + Math.random() * 0.15).toFixed(2); // Slow 0.5-1.5 kW

      const energyIncrement = chargingMode === 'FAST_2W' ? 0.008 : 0.003;
      const costIncrement = chargingMode === 'FAST_2W' ? 0.084 : 0.031;

      setPowerKw(powerVariation);
      setEnergyKwh(prev => +(prev + energyIncrement).toFixed(3));
      setCost(prev => +(prev + costIncrement).toFixed(2));
      setSoc(prev => Math.min(100, +(prev + 0.12).toFixed(1)));
    }, 800);

    return () => clearInterval(interval);
  }, [animStage, chargingMode]);

  return (
    <div className="glass-card rounded-3xl p-6 border border-slate-700/60 bg-slate-900/90 shadow-2xl relative overflow-hidden space-y-6">
      
      {/* HEADER BAR */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center glow-cyan">
            <Zap className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-white">Local Bay #01: 3.3kW 2W AC</h3>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold">ACTIVE BENCH</span>
            </div>
            <p className="text-xs text-slate-400">PZEM-004T AC Sensor • Single-Phase 230V &bull; 14.3A Max</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {animStage === 0 && <StatusBadge status="AVAILABLE" size="sm" />}
          {animStage === 1 && <StatusBadge status="CONNECTED" size="sm" />}
          {animStage === 2 && <StatusBadge status="CHARGING" size="sm" />}

          <button
            onClick={startSequence}
            title="Replay Drive & Charge Simulation"
            className="p-2 rounded-xl bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-slate-300 transition-all shadow-md"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* STAGE CANVAS VISUAL - 2-WHEELER CHARGING SETUP */}
      <div className="relative h-72 w-full rounded-2xl studio-canvas bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-slate-800 flex items-center justify-between px-6 overflow-hidden shadow-inner">
        
        {/* Studio Lighting Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        {/* Studio Floor Line */}
        <div className="absolute bottom-5 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />

        {/* 1. CHARGING DOCK PEDESTAL (LEFT) */}
        <div className="relative z-20 flex flex-col items-center">
          <div className="w-20 h-44 rounded-2xl bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 border-2 border-cyan-500/40 shadow-xl flex flex-col items-center justify-between py-3 relative group">
            
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/60 flex items-center justify-center text-cyan-400 font-extrabold text-xs tracking-wider glow-cyan">
              2W
            </div>

            {/* Status Screen */}
            <div className="w-16 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-center font-mono text-[9px]">
              <span className="text-cyan-400 block font-bold">{chargingMode === 'FAST_2W' ? '3.3 kW' : '1.4 kW'}</span>
              <span className="text-slate-400 block text-[8px]">{animStage === 2 ? 'CHARGING' : 'READY'}</span>
            </div>
            
            {/* Status Pulse Ring */}
            <div className={`w-4 h-4 rounded-full border-2 ${animStage === 2 ? 'border-cyan-400 bg-cyan-400 animate-ping' : 'border-emerald-400 bg-emerald-400'}`} />

            <span className="text-[9px] font-mono text-slate-400 font-bold">BAY #01</span>
          </div>
          <span className="text-[10px] text-slate-300 font-medium mt-2">IEC 60309 (3-pin)</span>
        </div>

        {/* DYNAMIC NEON CHARGING CABLE CONNECTIVITY */}
        {animStage >= 1 && (
          <div className="absolute left-24 bottom-24 right-48 h-8 pointer-events-none z-30">
            {/* Cable shadow path */}
            <svg className="w-full h-full overflow-visible">
              <motion.path
                d="M 0 15 Q 100 40 220 15"
                fill="none"
                stroke="#00F0FF"
                strokeWidth="4"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="drop-shadow-[0_0_12px_#00F0FF]"
              />
              {animStage === 2 && (
                <motion.path
                  d="M 0 15 Q 100 40 220 15"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="2"
                  strokeDasharray="10 15"
                  animate={{ strokeDashoffset: [-50, 0] }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                />
              )}
            </svg>
          </div>
        )}

        {/* 2. REAL ELECTRIC 2-WHEELER DISPLAY */}
        <motion.div
          initial={{ x: 260, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-20 flex flex-col items-center"
        >
          {/* Active Charging Aura & Ground LED Reflection */}
          {animStage === 2 && (
            <>
              <motion.div 
                initial={{ opacity: 0.4 }}
                animate={{ opacity: [0.4, 0.9, 0.4] }}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                className="absolute -inset-6 bg-gradient-to-r from-cyan-500/30 via-emerald-500/20 to-blue-500/30 rounded-3xl blur-2xl pointer-events-none"
              />
              <div className="absolute bottom-0 w-80 h-4 bg-cyan-400/30 rounded-full blur-md" />
            </>
          )}

          {/* REAL VEHICLE IMAGE CONTAINER */}
          <div className="relative w-80 sm:w-96 h-44 flex items-center justify-center">
            <Image
              src="/images/ev_scooter_charging.jpg"
              alt="Ather 450X Electric Scooter"
              width={480}
              height={270}
              className="object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.8)] rounded-xl"
              priority
            />

            {/* Glowing Port Cable Latch Point on Scooter */}
            {animStage >= 1 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="absolute top-1/2 left-4 -translate-y-1/2 w-4 h-4 rounded-full bg-cyan-400 border-2 border-white shadow-[0_0_15px_#00F0FF] z-40"
              />
            )}

            {/* Floating Live Battery SoC Badge */}
            {animStage === 2 && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute -top-2 right-4 px-3 py-1 rounded-full bg-slate-900/90 border border-emerald-500/60 text-emerald-400 text-xs font-mono font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-md"
              >
                <BatteryCharging className="w-4 h-4 text-emerald-400 animate-bounce" />
                <span>{soc.toFixed(1)}% SoC</span>
              </motion.div>
            )}
          </div>

          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-bold text-white tracking-wide">Ather 450X (3.7 kWh Pack)</span>
            <span className="text-[10px] text-slate-400 font-mono">Single-Phase AC &bull; ≤14.3A</span>
          </div>
        </motion.div>

      </div>

      {/* MODE CONTROLS & REAL-TIME TELEMETRY METRIC GAUGES (PDF Section 4 Scope) */}
      <div className="space-y-4">
        
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            2-Wheeler Charging kW Classification (PDF Sec 4)
          </span>
          
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setChargingMode('FAST_2W')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                chargingMode === 'FAST_2W' 
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              2.0 - 3.3 kW Fast (14.3A)
            </button>
            <button
              onClick={() => setChargingMode('SLOW_2W')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                chargingMode === 'SLOW_2W' 
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              0.5 - 1.5 kW Standard (6.5A)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Charging Power</span>
            <span className="text-xl font-extrabold text-cyan-400 font-mono mt-0.5 block">{powerKw} kW</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Energy Delivered</span>
            <span className="text-xl font-extrabold text-white font-mono mt-0.5 block">{energyKwh} kWh</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Accrued Cost (ToD)</span>
            <span className="text-xl font-extrabold text-emerald-400 font-mono mt-0.5 block">₹{cost.toFixed(2)}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Est. Full Charge Time</span>
            <span className="text-xl font-extrabold text-blue-400 font-mono mt-0.5 block">
              {animStage === 2 ? (chargingMode === 'FAST_2W' ? '1.2 hrs' : '4.5 hrs') : '--'}
            </span>
          </div>
        </div>

      </div>

    </div>
  );
};
