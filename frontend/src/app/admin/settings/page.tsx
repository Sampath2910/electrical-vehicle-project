'use client';

import React from 'react';
import { Settings, ShieldCheck, Database, Cpu, Lock } from 'lucide-react';

export default function AdminSettingsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Admin System Settings</h1>
        <p className="text-slate-400 text-xs mt-1">Platform parameters, Redis cache policies, and MQTT broker endpoints</p>
      </div>

      <div className="glass-card rounded-3xl p-6 lg:p-8 border border-slate-800 bg-navy-900/80 space-y-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400">System Infrastructure Configurations</h3>

        <div className="space-y-3 text-xs">
          <div className="p-4 rounded-2xl bg-navy-950 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-bold text-white block">PostgreSQL Primary Database</span>
              <span className="text-slate-400 text-[11px]">HikariCP Pool: 10 connections active</span>
            </div>
            <span className="text-emerald-400 font-mono font-bold">CONNECTED</span>
          </div>

          <div className="p-4 rounded-2xl bg-navy-950 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-bold text-white block">Redis Telemetry Cache</span>
              <span className="text-slate-400 text-[11px]">TTL: 60s for active session states</span>
            </div>
            <span className="text-cyan-400 font-mono font-bold">CACHE_ACTIVE</span>
          </div>

          <div className="p-4 rounded-2xl bg-navy-950 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-bold text-white block">MQTT Broker (Paho Client)</span>
              <span className="text-slate-400 text-[11px]">TLS 1.3 encrypted device channel</span>
            </div>
            <span className="text-emerald-400 font-mono font-bold">ONLINE</span>
          </div>
        </div>
      </div>
    </div>
  );
}
