'use client';

import React, { useState } from 'react';
import { CreditCard, Edit3, Plus, CheckCircle2, Clock, Landmark, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useStore } from '@/lib/storeContext';

const STATE_DISCOM_BENCHMARKS = [
  {
    state: 'Karnataka (BESCOM)',
    category: 'LT-6 Concessional Tariff',
    rate: '₹4.50 – ₹5.50 / unit',
    notes: 'No demand charge for public EV charging stations. Baseline for project retail markup.',
  },
  {
    state: 'Delhi (DERC)',
    category: 'Low Tension (LT) EV',
    rate: '~₹4.50 / unit',
    notes: 'Subsidized single-phase and three-phase public EV charging supply.',
  },
  {
    state: 'Maharashtra (MSEDCL)',
    category: 'LT Commercial EV',
    rate: '~₹6.08 / unit',
    notes: 'Standard discom base rate before local municipal duties and CPO margin.',
  },
  {
    state: 'Tamil Nadu (TANGEDCO)',
    category: 'Mandatory ToD Tariff',
    rate: '₹6.00 – ₹9.00 / unit',
    notes: 'Time-of-Day stepped tariff based on morning, solar, and evening peak slots.',
  },
];

export default function AdminTariffsPage() {
  const { tariffs, updateTariff } = useStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newPrice, setNewPrice] = useState<number>(10.5);

  const handleSave = (id: string) => {
    updateTariff(id, newPrice);
    setEditingId(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[11px] font-mono font-bold text-cyan-400 mb-2">
          Section 1 & 5 Tariff Specification Engine
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Time-of-Day (ToD) Tariff Management</h1>
        <p className="text-slate-400 text-xs mt-1">
          Configured according to commercial LT-6 public charging guidelines and Priority Preemption surge rates
        </p>
      </div>

      {/* ACTIVE TIME-OF-DAY TIERS FROM PDF PAGE 1 & 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tariffs.map((t) => {
          const isSurge = t.id === 'tar-surge' || t.name.includes('Priority');
          const isOffPeak = t.name.includes('Off-Peak');
          const isPeak = t.name.includes('Peak') && !isOffPeak;

          return (
            <div 
              key={t.id} 
              className={`glass-card rounded-3xl p-6 border flex flex-col justify-between space-y-4 shadow-xl ${
                isSurge 
                  ? 'border-amber-500/40 bg-amber-950/20' 
                  : isPeak 
                  ? 'border-rose-500/30 bg-navy-900/60'
                  : isOffPeak
                  ? 'border-emerald-500/30 bg-navy-900/60'
                  : 'border-cyan-500/30 bg-navy-900/60'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                    isSurge 
                      ? 'bg-amber-500/20 text-amber-300' 
                      : isPeak 
                      ? 'bg-rose-500/20 text-rose-300'
                      : isOffPeak
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-cyan-500/20 text-cyan-300'
                  }`}>
                    {t.id.replace('tar-', 'SLOT ').toUpperCase()}
                  </span>
                  {isSurge && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                </div>

                <h3 className="text-base font-bold text-white leading-tight">{t.name}</h3>
                <p className="text-[11px] text-slate-400 leading-snug">
                  {isOffPeak && 'Cheapest tier to encourage overnight charging when grid demand is lowest (10 PM – 6 AM).'}
                  {t.name.includes('Standard') && 'Standard daytime charging rate covering solar-generation hours and grid load (6 AM – 6 PM).'}
                  {isPeak && 'Heavy surcharge applied during evening domestic peak grid load (6 PM – 10 PM).'}
                  {isSurge && 'Current ToD rate + ₹8.00/kWh premium deterrent for civilian priority bay access.'}
                </p>
              </div>

              {editingId === t.id ? (
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <input
                    type="number"
                    step="0.5"
                    value={newPrice}
                    onChange={(e) => setNewPrice(+e.target.value)}
                    className="w-full bg-navy-950 border border-cyan-400 rounded-xl px-3 py-2 text-xs text-white font-mono font-bold"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSave(t.id)}
                      className="w-full py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-bold text-xs"
                    >
                      Save Rate
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-baseline justify-between pt-3 border-t border-slate-800/80">
                  <span className="text-2xl font-extrabold text-cyan-400 font-mono">
                    ₹{t.pricePerKwh.toFixed(2)} <span className="text-xs text-slate-400 font-normal">/kWh</span>
                  </span>
                  <button
                    onClick={() => { setEditingId(t.id); setNewPrice(t.pricePerKwh); }}
                    className="p-2 rounded-xl bg-navy-800 hover:bg-cyan-500 hover:text-navy-950 text-slate-300 transition-all"
                    title="Edit Rate"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* SECTION 5: DISCOM EV TARIFF RATES BENCHMARK (Page 5) */}
      <div className="glass-card rounded-3xl p-6 lg:p-8 border border-slate-800 bg-navy-900/60 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Landmark className="w-5 h-5 text-emerald-400" />
              <span>Section 5: State Discom EV Tariff Rates (2025/2026 Base Benchmarks)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Official State Electricity Regulatory Commission (SERC) base supply rates before retail CPO markup
            </p>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30">
            LT-6 Regulatory Ground Truth
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STATE_DISCOM_BENCHMARKS.map((b) => (
            <div key={b.state} className="p-4 rounded-2xl bg-navy-950 border border-slate-800/80 space-y-2">
              <span className="text-xs font-bold text-white block">{b.state}</span>
              <span className="text-[10px] font-mono text-cyan-400 block">{b.category}</span>
              <div className="text-lg font-extrabold text-emerald-400 font-mono">{b.rate}</div>
              <p className="text-[11px] text-slate-400 leading-snug">{b.notes}</p>
            </div>
          ))}
        </div>

        {/* Pricing Tiers Summary */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Home Charging (AC)</span>
            <span className="font-extrabold text-white text-sm font-mono">₹5 to ₹10 / kWh</span>
            <p className="text-[11px] text-slate-400 mt-0.5">Cheapest residential baseline.</p>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-cyan-400 block">Public AC Charging (Our Project)</span>
            <span className="font-extrabold text-cyan-400 text-sm font-mono">₹8 to ₹15 / kWh</span>
            <p className="text-[11px] text-slate-400 mt-0.5">Commercial 2W single-phase markup covering grid & infrastructure.</p>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-amber-400 block">Public DC Fast Charging</span>
            <span className="font-extrabold text-amber-400 text-sm font-mono">₹15 to ₹25 / kWh</span>
            <p className="text-[11px] text-slate-400 mt-0.5">High-capital DC fast chargers for 4-wheelers.</p>
          </div>
        </div>

      </div>

    </div>
  );
}
