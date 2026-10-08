'use client';

import React from 'react';
import { Settings, ShieldCheck, Database, Cpu, Wifi } from 'lucide-react';
import { useStore } from '@/lib/storeContext';

export default function SettingsPage() {
  const { dataMode } = useStore();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Platform System Settings</h1>
        <p className="text-slate-400 text-xs mt-1">Provider configuration, environment parameters, and hardware modes</p>
      </div>

      <div className="glass-card rounded-3xl p-6 lg:p-8 border border-slate-800 bg-navy-900/80 space-y-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400">Environment Provider Parameters</h3>

        <div className="space-y-3 text-xs">
          <div className="p-4 rounded-2xl bg-navy-950 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-bold text-white block">DATA_MODE Provider State</span>
              <span className="text-slate-400 text-[11px]">Pluggable Telemetry & Dynamic QR / UPI Payment providers</span>
            </div>
            <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-mono font-bold">
              {dataMode.toUpperCase()}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-navy-950 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-bold text-white block">WebSocket STOMP Broker</span>
              <span className="text-slate-400 text-[11px]">Real-time 1Hz electrical telemetry streaming</span>
            </div>
            <span className="text-emerald-400 font-mono font-bold">ws-ev-connected</span>
          </div>

          <div className="p-4 rounded-2xl bg-navy-950 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-bold text-white block">ESP32 Firmware Guard</span>
              <span className="text-slate-400 text-[11px]">Autonomous overvoltage & overcurrent cutoff</span>
            </div>
            <span className="text-cyan-400 font-mono font-bold">v2.4.1-esp32</span>
          </div>
        </div>
      </div>
    </div>
  );
}
