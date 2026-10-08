'use client';

import React from 'react';
import { Zap, Activity, Gauge, ShieldCheck } from 'lucide-react';

interface TelemetryGaugeProps {
  powerW: number;
  voltageV: number;
  currentA: number;
  frequencyHz: number;
  powerFactor: number;
  maxPowerKw?: number;
}

export const TelemetryGauge: React.FC<TelemetryGaugeProps> = ({
  powerW,
  voltageV,
  currentA,
  frequencyHz,
  powerFactor,
  maxPowerKw = 22.0,
}) => {
  const currentKw = +(powerW / 1000).toFixed(2);
  const percentage = Math.min(100, Math.max(0, (currentKw / maxPowerKw) * 100));

  return (
    <div className="glass-card rounded-3xl p-6 lg:p-8 border border-cyan-500/20 relative overflow-hidden bg-gradient-to-br from-navy-900 via-navy-850 to-navy-950">
      {/* Background radial glow */}
      <div className="absolute -right-20 -top-20 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Zap className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-200">Live Power Delivery</h3>
            <p className="text-xs text-slate-400">ESP32 IoT Telemetry Stream (1Hz)</p>
          </div>
        </div>
        <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Contactor Engaged</span>
        </div>
      </div>

      {/* Main Gauge Ring */}
      <div className="flex flex-col items-center justify-center my-4 relative">
        <div className="relative w-56 h-56 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Track Arc */}
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="#1e293b"
              strokeWidth="7"
              fill="transparent"
            />
            {/* Progress Arc */}
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="url(#cyan-gradient)"
              strokeWidth="7"
              strokeDasharray={251.2}
              strokeDashoffset={251.2 - (251.2 * percentage) / 100}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-700 ease-out"
            />
            <defs>
              <linearGradient id="cyan-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0066FF" />
                <stop offset="100%" stopColor="#00F0FF" />
              </linearGradient>
            </defs>
          </svg>

          {/* Center Text */}
          <div className="absolute text-center flex flex-col items-center">
            <span className="text-4xl font-extrabold tracking-tight text-white drop-shadow-md">
              {currentKw}
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400 mt-0.5">
              kW Power
            </span>
            <span className="text-[10px] text-slate-400 mt-1">
              Cap: {maxPowerKw} kW
            </span>
          </div>
        </div>
      </div>

      {/* Grid of Electrical Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80">
        <div className="p-3 rounded-xl bg-navy-950/60 border border-slate-800">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
            <Activity className="w-3.5 h-3.5 text-blue-400" />
            <span>Voltage</span>
          </div>
          <span className="text-lg font-bold text-white">{voltageV} <span className="text-xs font-normal text-slate-400">V</span></span>
        </div>

        <div className="p-3 rounded-xl bg-navy-950/60 border border-slate-800">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
            <Gauge className="w-3.5 h-3.5 text-cyan-400" />
            <span>Current</span>
          </div>
          <span className="text-lg font-bold text-white">{currentA} <span className="text-xs font-normal text-slate-400">A</span></span>
        </div>

        <div className="p-3 rounded-xl bg-navy-950/60 border border-slate-800">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>Frequency</span>
          </div>
          <span className="text-lg font-bold text-white">{frequencyHz} <span className="text-xs font-normal text-slate-400">Hz</span></span>
        </div>

        <div className="p-3 rounded-xl bg-navy-950/60 border border-slate-800">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Power Factor</span>
          </div>
          <span className="text-lg font-bold text-white">{powerFactor}</span>
        </div>
      </div>
    </div>
  );
};
