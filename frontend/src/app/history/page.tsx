'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { History, Search, Filter, Zap, FileText, ArrowRight, QrCode } from 'lucide-react';
import { useStore } from '@/lib/storeContext';
import { StatusBadge } from '@/components/ui/StatusBadge';

export default function HistoryPage() {
  const { historySessions } = useStore();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSessions = historySessions.filter(s => {
    const code = s.sessionCode || '';
    const name = s.chargerName || '';
    const vehicle = s.vehicleModel || '';
    const query = searchQuery.toLowerCase();
    return code.toLowerCase().includes(query) || name.toLowerCase().includes(query) || vehicle.toLowerCase().includes(query);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/30 text-[11px] font-mono font-bold text-cyan-700 dark:text-cyan-400 mb-2">
            Dynamic QR & UPI Gateway Log
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Charging Session History</h1>
          <p className="text-slate-600 dark:text-slate-400 text-xs mt-1">Review past EV 2-wheeler charging transactions, ToD slots, and Section 6 audited digital invoices</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="glass-card rounded-2xl p-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900/80 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by session code, station name, or vehicle model..."
            className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* History Table */}
      <div className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900/60 overflow-x-auto shadow-sm">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase text-[10px] tracking-wider">
              <th className="py-3 px-3">Session Code</th>
              <th className="py-3 px-3">Station Name</th>
              <th className="py-3 px-3">Vehicle</th>
              <th className="py-3 px-3">Date & Time</th>
              <th className="py-3 px-3">Energy (kWh)</th>
              <th className="py-3 px-3">ToD Tariff Slot</th>
              <th className="py-3 px-3">Final (Inc. GST)</th>
              <th className="py-3 px-3">Payment</th>
              <th className="py-3 px-3">Receipt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-800 dark:text-slate-200">
            {filteredSessions.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-xs text-slate-500 font-mono">
                  No charging sessions recorded yet. Start a session from the Dashboard or Scan QR &amp; Charge.
                </td>
              </tr>
            ) : (
              filteredSessions.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-navy-850/50 transition-colors">
                  <td className="py-3.5 px-3 font-mono font-bold text-cyan-700 dark:text-cyan-400">{s.sessionCode}</td>
                  <td className="py-3.5 px-3 font-semibold text-slate-900 dark:text-white">{s.chargerName}</td>
                  <td className="py-3.5 px-3 text-slate-600 dark:text-slate-300">{s.vehicleModel || 'Ather 450X'}</td>
                  <td className="py-3.5 px-3 text-slate-500 dark:text-slate-400" suppressHydrationWarning>{new Date(s.startTime).toLocaleString()}</td>
                  <td className="py-3.5 px-3 font-bold text-cyan-700 dark:text-cyan-300 font-mono">{s.energyKwh.toFixed(3)} kWh</td>
                  <td className="py-3.5 px-3 font-mono text-purple-700 dark:text-purple-300 text-[11px]">{s.todSlotActive || `₹${s.tariffRate}/kWh`}</td>
                  <td className="py-3.5 px-3 font-extrabold text-slate-900 dark:text-white font-mono">₹{s.finalCost?.toFixed(2)}</td>
                  <td className="py-3.5 px-3 text-emerald-600 dark:text-emerald-400 font-semibold inline-flex items-center gap-1 mt-3">
                    <QrCode className="w-3.5 h-3.5" /> Dynamic QR / UPI
                  </td>
                  <td className="py-3.5 px-3">
                    <Link
                      href={`/charging/${s.id}/complete`}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-navy-800 hover:bg-cyan-500 hover:text-white dark:hover:bg-cyan-500 dark:hover:text-navy-950 text-cyan-700 dark:text-cyan-400 text-[11px] font-semibold border border-slate-200 dark:border-transparent transition-all inline-flex items-center gap-1 shadow-sm"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Receipt</span>
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}