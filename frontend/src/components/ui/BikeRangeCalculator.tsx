'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { 
  Calculator, 
  Zap, 
  Fuel, 
  TrendingUp, 
  Clock, 
  Compass, 
  Bike, 
  Sparkles, 
  ChevronRight,
  ShieldCheck,
  BatteryCharging
} from 'lucide-react';
import { useStore } from '@/lib/storeContext';

interface BikeModelOption {
  id: string;
  name: string;
  brand: string;
  batteryKwh: number;
  kmPerKwh: number;
  image: string;
  connector: string;
}

const BIKE_MODELS: BikeModelOption[] = [
  {
    id: 'ather',
    name: 'Ather 450X Gen 3',
    brand: 'Smart Connected Scooter',
    batteryKwh: 3.7,
    kmPerKwh: 39.5,
    image: '/images/ev_scooter_charging.jpg',
    connector: '3.3 kW AC / IEC 60309',
  },
  {
    id: 'ola',
    name: 'Ola S1 Pro Gen 2',
    brand: 'Performance E-Scooter',
    batteryKwh: 4.0,
    kmPerKwh: 48.7,
    image: '/images/ev_urban_bike.jpg',
    connector: 'Standard 16A Socket (Single-Phase)',
  },
  {
    id: 'tvs',
    name: 'TVS iQube S',
    brand: 'Urban Commuter EV',
    batteryKwh: 3.4,
    kmPerKwh: 29.4,
    image: '/images/ev_scooter_charging.jpg',
    connector: 'Standard 16A Socket / LEV AC',
  },
  {
    id: 'f77',
    name: 'Ultraviolette F77 Mach 2',
    brand: 'High-Performance E-Motorcycle',
    batteryKwh: 10.3,
    kmPerKwh: 29.8,
    image: '/images/ev_bike_superbike.jpg',
    connector: '3.3 kW AC / LEV Fast DC',
  },
];

export const BikeRangeCalculator: React.FC = () => {
  const { playSound } = useStore();
  const [selectedBikeId, setSelectedBikeId] = useState<string>('ather');
  const [startSoc, setStartSoc] = useState<number>(20);
  const [targetSoc, setTargetSoc] = useState<number>(85);
  const [chargerSpeed, setChargerSpeed] = useState<'3.3_FAST' | '1.4_SLOW'>('3.3_FAST');

  const bike = BIKE_MODELS.find(b => b.id === selectedBikeId) || BIKE_MODELS[0];

  // Computations
  const deltaPercent = Math.max(0, targetSoc - startSoc);
  const deltaKwh = +((deltaPercent / 100) * bike.batteryKwh).toFixed(2);
  
  // Power kW considering charger rating
  const activePowerKw = chargerSpeed === '3.3_FAST' ? 3.3 : 1.4;
  const chargingHours = activePowerKw > 0 ? (deltaKwh / activePowerKw) : 0;
  const chargingMinutes = Math.max(1, Math.round(chargingHours * 60));

  // Cost calculation (@ ₹10.50 per unit kWh ToD Standard Slot)
  const tariffPerKwh = 10.50;
  const electricityCost = +(deltaKwh * tariffPerKwh).toFixed(2);

  // Added riding distance
  const addedKm = Math.round(deltaKwh * bike.kmPerKwh);

  // Petrol comparison: Petrol two-wheeler average @ 45 km/L, Petrol price @ ₹105/L
  // Cost per km of petrol bike = 105 / 45 = ₹2.33 / km
  const petrolEquivalentCost = +(addedKm * 2.33).toFixed(2);
  const riderSavings = Math.max(0, +(petrolEquivalentCost - electricityCost).toFixed(2));

  return (
    <div className="glass-card rounded-3xl p-6 lg:p-8 border border-cyan-500/30 bg-slate-900/90 shadow-2xl space-y-8 relative overflow-hidden">
      
      {/* GLOW ACCENT */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* HEADER ROW */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-semibold text-cyan-400 mb-1.5">
            <Calculator className="w-3.5 h-3.5 text-cyan-400" />
            <span>Interactive Engineering Tool &bull; Rider Cost & Range Engine</span>
          </div>
          <h3 className="text-2xl font-extrabold text-white tracking-tight">
            Smart Bike Range & Electricity Cost Calculator
          </h3>
          <p className="text-xs text-slate-400">
            Calculate charging time, energy units, electricity bills, and fuel cost savings versus petrol two-wheelers.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
          <span className="text-slate-400">ToD Standard Rate:</span>
          <span className="text-emerald-400 font-bold">₹10.50 / kWh</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: CONTROLS & BIKE SELECTION */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* 1. SELECT BIKE MODEL */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Bike className="w-4 h-4 text-cyan-400" />
              <span>Select Electric Two-Wheeler</span>
            </label>

            <div className="grid grid-cols-2 gap-2.5">
              {BIKE_MODELS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => { setSelectedBikeId(m.id); playSound('beep'); }}
                  className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                    selectedBikeId === m.id
                      ? 'border-cyan-400 bg-cyan-500/10 glow-cyan text-white'
                      : 'border-slate-800 bg-slate-950 hover:border-slate-700 text-slate-400'
                  }`}
                >
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-slate-800">
                    <Image src={m.image} alt={m.name} fill className="object-cover" />
                  </div>
                  <div className="truncate">
                    <span className="text-xs font-bold text-white block truncate">{m.name}</span>
                    <span className="text-[10px] text-cyan-300 font-mono block">{m.batteryKwh} kWh Pack</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 2. CHARGER POWER PROFILE (PDF Section 4 Scope) */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>Select 2W Charging Rate (PDF Section 4)</span>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => { setChargerSpeed('3.3_FAST'); playSound('beep'); }}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  chargerSpeed === '3.3_FAST'
                    ? 'border-cyan-400 bg-cyan-500/10 glow-cyan text-white'
                    : 'border-slate-800 bg-slate-950 hover:border-slate-700 text-slate-400'
                }`}
              >
                <span className="text-xs font-bold block text-white">2.0 – 3.3 kW Fast AC</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Max 15A draw (Takes 1–2 hrs)</span>
              </button>

              <button
                type="button"
                onClick={() => { setChargerSpeed('1.4_SLOW'); playSound('beep'); }}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  chargerSpeed === '1.4_SLOW'
                    ? 'border-cyan-400 bg-cyan-500/10 glow-cyan text-white'
                    : 'border-slate-800 bg-slate-950 hover:border-slate-700 text-slate-400'
                }`}
              >
                <span className="text-xs font-bold block text-cyan-400">0.5 – 1.5 kW Slow / Standard</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">5A–10A draw (Takes 4–6 hrs)</span>
              </button>
            </div>
          </div>

          {/* 3. BATTERY SOC SLIDERS */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            
            {/* Start SoC */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Starting Battery SoC:</span>
                <span className="font-bold font-mono text-cyan-400">{startSoc}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="90"
                value={startSoc}
                onChange={(e) => {
                  const val = +e.target.value;
                  setStartSoc(val);
                  if (val >= targetSoc) setTargetSoc(Math.min(100, val + 10));
                }}
                className="w-full accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Target SoC */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Target Battery SoC:</span>
                <span className="font-bold font-mono text-emerald-400">{targetSoc}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={targetSoc}
                onChange={(e) => {
                  const val = +e.target.value;
                  if (val > startSoc) setTargetSoc(val);
                }}
                className="w-full accent-emerald-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Quick preset buttons */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Quick Presets:</span>
              <button
                type="button"
                onClick={() => { setStartSoc(20); setTargetSoc(80); playSound('beep'); }}
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[10px] text-slate-300 hover:text-white"
              >
                20% &rarr; 80% (Healthy)
              </button>
              <button
                type="button"
                onClick={() => { setStartSoc(10); setTargetSoc(100); playSound('beep'); }}
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[10px] text-slate-300 hover:text-white"
              >
                10% &rarr; 100% (Full)
              </button>
            </div>

          </div>

        </div>

        {/* RIGHT COLUMN: CALCULATION RESULTS CARDS */}
        <div className="lg:col-span-6 space-y-4">
          
          {/* HERO SUMMARY CARD */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/30 border border-cyan-500/40 glow-cyan space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Estimated Charge Time</span>
                <span className="text-3xl font-black text-white font-mono tracking-tight">{chargingMinutes} Minutes</span>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Energy to Add</span>
                <span className="text-2xl font-black text-cyan-400 font-mono tracking-tight">+{deltaKwh} kWh</span>
              </div>
            </div>

            {/* PROGRESS VISUAL */}
            <div className="space-y-1.5">
              <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/60">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${deltaPercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>Start: {startSoc}%</span>
                <span className="text-cyan-400 font-bold">Adding +{deltaPercent}%</span>
                <span>Target: {targetSoc}%</span>
              </div>
            </div>

            {/* KEY METRICS GRID */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                  <Compass className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Added Distance</span>
                </div>
                <span className="text-xl font-extrabold text-white font-mono">+{addedKm} km</span>
                <span className="text-[10px] text-slate-500 block">Clean Riding Range</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                  <Zap className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Electricity Bill</span>
                </div>
                <span className="text-xl font-extrabold text-emerald-400 font-mono">₹{electricityCost}</span>
                <span className="text-[10px] text-slate-500 block">Total Charging Cost</span>
              </div>

            </div>

          </div>

          {/* PETROL SAVINGS HIGHLIGHT CARD */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-emerald-500/30 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-300 block">Money Saved vs Petrol Two-Wheeler</span>
                <p className="text-[11px] text-slate-400">
                  Petrol bike cost: ₹{petrolEquivalentCost} &bull; EV cost: ₹{electricityCost}
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-2xl font-black text-emerald-400 font-mono block">₹{riderSavings}</span>
              <span className="text-[9px] text-emerald-300/80 font-bold block">SAVED THIS SESSION</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
