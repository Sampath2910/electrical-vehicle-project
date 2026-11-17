'use client';

import React from 'react';
import { useStore } from '@/lib/storeContext';

export default function SettingsPage() {
  const { dataMode, theme, soundEnabled } = useStore();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Platform System Settings</h1>
        <p className="text-slate-600 dark:text-slate-400 text-xs mt-1">Provider configuration, environment parameters, and hardware telemetry mode</p>
      </div>

      <div className="glass-card rounded-3xl p-6 lg:p-8 border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900/80 space-y-6 shadow-sm">
        <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-700 dark:text-cyan-400">Active Runtime Parameters</h3>

        <div className="space-y-3 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-900 dark:text-white block">Telemetry &amp; Persistence Mode</span>
              <span className="text-slate-600 dark:text-slate-400 text-[11px]">ThingSpeak Cloud Channel #3533059 + Persisted Local Fleet DB</span>
            </div>
            <span className="px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/30 font-mono font-bold">
              {dataMode.toUpperCase()}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-900 dark:text-white block">Offline Hardware Safety Rule</span>
              <span className="text-slate-600 dark:text-slate-400 text-[11px]">Automatically zeroes all real-time electrical meters when packets exceed 90s age</span>
            </div>
            <span className="text-emerald-700 dark:text-emerald-400 font-mono font-bold">ENFORCED</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-900 dark:text-white block">Interface Preferences</span>
              <span className="text-slate-600 dark:text-slate-400 text-[11px]">Theme &amp; audio feedback haptics</span>
            </div>
            <span className="text-cyan-700 dark:text-cyan-400 font-mono font-bold">
              {theme.toUpperCase()} &bull; SOUND {soundEnabled ? 'ON' : 'OFF'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
