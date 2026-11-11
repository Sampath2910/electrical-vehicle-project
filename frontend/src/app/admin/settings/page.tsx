'use client';

import React, { useState } from 'react';
import { Settings, ShieldCheck, Database, Cpu, Lock, Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useStore } from '@/lib/storeContext';

export default function AdminSettingsPage() {
  const { playSound, logout } = useStore();
  const [resetting, setResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);

  const handleFactoryReset = async () => {
    const confirmed = window.confirm(
      'DANGER: Are you sure you want to perform a Factory Clean Data Purge?\n\n' +
      'This will:\n' +
      '• Wipe all active and completed charging sessions\n' +
      '• Reset all station revenue and energy meters to 0.00\n' +
      '• Purge all temporary test accounts\n' +
      '• Reset wallet ledgers and garages to zero-state\n\n' +
      'This action is irreversible.'
    );

    if (!confirmed) return;

    setResetting(true);
    try {
      playSound('alert');
      const res = await fetch('/api/admin/reset', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset data.');

      // Clear local storage keys
      if (typeof window !== 'undefined') {
        localStorage.removeItem('smart_ev_user');
        localStorage.removeItem('smart_ev_tariffs');
        localStorage.removeItem('jwt_token');
      }

      playSound('success');
      setResetSuccess(data.message || 'Factory reset completed successfully.');
      setTimeout(() => {
        logout();
      }, 2500);
    } catch (err: any) {
      alert(err.message || 'Error executing factory reset');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Admin System Settings</h1>
        <p className="text-slate-600 dark:text-slate-400 text-xs mt-1">Platform parameters, Redis cache policies, and Day-Zero data management</p>
      </div>

      <div className="glass-card rounded-3xl p-6 lg:p-8 border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900/80 space-y-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">System Infrastructure Configurations</h3>

        <div className="space-y-3 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-900 dark:text-white block">PostgreSQL Primary Database</span>
              <span className="text-slate-600 dark:text-slate-400 text-[11px]">HikariCP Pool: 10 connections active</span>
            </div>
            <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">CONNECTED</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-900 dark:text-white block">Redis Telemetry Cache</span>
              <span className="text-slate-600 dark:text-slate-400 text-[11px]">TTL: 60s for active session states</span>
            </div>
            <span className="text-cyan-600 dark:text-cyan-400 font-mono font-bold">CACHE_ACTIVE</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-900 dark:text-white block">MQTT Broker (Paho Client)</span>
              <span className="text-slate-600 dark:text-slate-400 text-[11px]">TLS 1.3 encrypted device channel</span>
            </div>
            <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">ONLINE</span>
          </div>
        </div>
      </div>

      {/* FACTORY DATA PURGE DANGER ZONE */}
      <div className="p-6 lg:p-8 rounded-3xl border border-rose-300 dark:border-rose-500/40 bg-rose-50/50 dark:bg-rose-950/20 space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-2xl bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-rose-900 dark:text-rose-300">Factory Clean Data Purge (Day-Zero Reset)</h3>
            <p className="text-xs text-rose-700 dark:text-rose-400 mt-1">
              Completely wipes all charging sessions, resets all charger accumulated revenues and energy counters to zero, removes any transient accounts, and resets browser session state.
            </p>
          </div>
        </div>

        {resetSuccess && (
          <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{resetSuccess} Redirecting to login...</span>
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <button
            onClick={handleFactoryReset}
            disabled={resetting}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            <span>{resetting ? 'Purging Platform Data...' : 'Execute Factory Data Reset'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
