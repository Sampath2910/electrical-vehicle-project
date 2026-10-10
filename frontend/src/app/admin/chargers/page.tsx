'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Zap, MapPin, Sliders, Settings, RefreshCw } from 'lucide-react';
import { useStore } from '@/lib/storeContext';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ChargerStatus } from '@/types/ev';

export default function AdminChargersPage() {
  const router = useRouter();
  const { chargers, updateChargerStatus, updateChargerRating, currentUser } = useStore();

  useEffect(() => {
    if (!currentUser) {
      router.replace('/auth/login/admin');
    } else if (currentUser.role === 'OPERATOR') {
      router.replace('/operator');
    } else if (currentUser.role === 'USER') {
      router.replace('/dashboard');
    }
  }, [currentUser, router]);

  if (!currentUser || currentUser.role !== 'ADMIN') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-semibold">Verifying Fleet Administrator Permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Fleet Charger Manager</h1>
          <p className="text-slate-400 text-xs mt-1">Configure status, power ratings, and hardware overrides</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {chargers.map((c) => (
          <div key={c.id} className="glass-card rounded-3xl p-6 border border-slate-800 bg-navy-900/60 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-cyan-400">{c.chargerCode}</span>
                <StatusBadge status={c.status} size="sm" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">{c.name}</h3>
              <p className="text-xs text-slate-400 truncate">{c.location}</p>

              <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-800 my-3 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Rating</span>
                  <select
                    value={c.powerRating}
                    onChange={(e) => updateChargerRating(c.id, Number(e.target.value))}
                    className="w-full bg-navy-950 border border-slate-700 hover:border-cyan-400 focus:border-cyan-400 rounded-xl px-2.5 py-1.5 text-xs text-white font-bold font-mono transition-colors cursor-pointer"
                  >
                    <option value={1}>1 kW</option>
                    <option value={3.3}>3.3 kW</option>
                    <option value={7}>7 kW</option>
                    <option value={12}>12 kW</option>
                  </select>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Tariff</span>
                  <div className="py-1.5 font-bold text-cyan-400 font-mono text-xs">
                    ₹{c.pricePerKwh}/kWh
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Status Override selector */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="text-[10px] uppercase font-bold text-slate-400 block">Override Operational Status</label>
              <select
                value={c.status}
                onChange={(e) => updateChargerStatus(c.id, e.target.value as ChargerStatus)}
                className="w-full bg-navy-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-semibold"
              >
                <option value="AVAILABLE">AVAILABLE</option>
                <option value="PREPARING">PREPARING</option>
                <option value="CONNECTED">CONNECTED</option>
                <option value="CHARGING">CHARGING</option>
                <option value="PAUSED">PAUSED</option>
                <option value="MAINTENANCE">MAINTENANCE</option>
                <option value="FAULT">FAULT</option>
                <option value="OFFLINE">OFFLINE</option>
              </select>

              <Link
                href={`/admin/chargers/${c.id}`}
                className="block text-center w-full py-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-200 text-xs font-bold transition-all"
              >
                Full Hardware Settings &rarr;
              </Link>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
