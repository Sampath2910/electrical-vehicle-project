'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { 
  Zap, 
  MapPin, 
  ArrowLeft, 
  ShieldCheck, 
  Clock, 
  Cpu, 
  Activity, 
  QrCode, 
  CreditCard,
  AlertTriangle
} from 'lucide-react';
import { useStore } from '@/lib/storeContext';
import { StatusBadge } from '@/components/ui/StatusBadge';

export default function ChargerDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { chargers } = useStore();

  const charger = chargers.find(c => c.id === resolvedParams.id || c.chargerCode === resolvedParams.id) || chargers[0];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Back button */}
      <Link href="/chargers" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-cyan-400 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Charger Discovery</span>
      </Link>

      {/* Main Charger Card */}
      <div className="glass-card rounded-3xl p-6 lg:p-8 border border-slate-800 bg-navy-900/80 space-y-6">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-navy-950 border border-slate-800 text-cyan-400 font-bold">
                {charger.chargerCode}
              </span>
              <StatusBadge status={charger.status} size="lg" />
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white">{charger.name}</h1>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
              <MapPin className="w-4 h-4 text-slate-500" />
              <span>{charger.location} (Lat: {charger.latitude}, Lng: {charger.longitude})</span>
            </p>
          </div>

          {charger.status === 'AVAILABLE' ? (
            <Link
              href={`/charging/start?chargerId=${charger.id}`}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-navy-950 font-bold text-sm shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all hover:scale-105"
            >
              <Zap className="w-5 h-5 fill-navy-950" />
              <span>Start Charging</span>
            </Link>
          ) : (
            <div className="px-6 py-3 rounded-2xl bg-navy-950 border border-slate-800 text-amber-400 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Charger currently {charger.status}</span>
            </div>
          )}
        </div>

        {/* Technical Specification Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-navy-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Max Power Rating</span>
            <span className="text-xl font-bold text-white">{charger.powerRating} <span className="text-xs text-cyan-400 font-normal">kW</span></span>
          </div>

          <div className="p-4 rounded-2xl bg-navy-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Connector Standard</span>
            <span className="text-xl font-bold text-white">{charger.connectorType}</span>
          </div>

          <div className="p-4 rounded-2xl bg-navy-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Snapshot Tariff</span>
            <span className="text-xl font-bold text-cyan-400">₹{charger.pricePerKwh.toFixed(2)} <span className="text-xs text-slate-400 font-normal">/kWh</span></span>
          </div>

          <div className="p-4 rounded-2xl bg-navy-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Grid Rating</span>
            <span className="text-xl font-bold text-white">{charger.voltageV}V / {charger.maxCurrentA}A</span>
          </div>
        </div>

        {/* System & Hardware Health Info */}
        <div className="p-6 rounded-2xl bg-navy-950/80 border border-slate-800/80 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>IoT Hardware Controller Diagnostics</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-navy-900 border border-slate-800">
              <span className="text-slate-400">Firmware Build:</span>
              <span className="font-mono text-slate-200">{charger.firmwareVersion}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-navy-900 border border-slate-800">
              <span className="text-slate-400">Heartbeat Last Seen:</span>
              <span className="font-mono text-emerald-400">Just Now</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-navy-900 border border-slate-800">
              <span className="text-slate-400">Local Safety Guard:</span>
              <span className="font-mono text-cyan-300">ACTIVE_OK</span>
            </div>
          </div>
        </div>

        {/* Supported Authorization Modes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center gap-3">
            <QrCode className="w-6 h-6 text-cyan-400 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-white">Scan & Charge (QR / UPI)</h4>
              <p className="text-[11px] text-slate-300">Scan QR on unit to initiate instant mobile UPI payment.</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center gap-3">
            <Zap className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-white">Online UPI AutoPay</h4>
              <p className="text-[11px] text-slate-300">Instant UPI mandate & automated contactor trigger with ToD rate calculation.</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
