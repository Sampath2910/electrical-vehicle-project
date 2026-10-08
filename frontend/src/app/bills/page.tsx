'use client';

import React from 'react';
import Link from 'next/link';
import { FileText, Download, CheckCircle2, ArrowRight, Zap, ShieldCheck } from 'lucide-react';
import { useStore } from '@/lib/storeContext';
import { StatusBadge } from '@/components/ui/StatusBadge';

export default function BillsPage() {
  const { bills } = useStore();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[11px] font-mono font-bold text-cyan-400 mb-2">
            Section 6 Metrology & Billing Audit
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Digital Invoices & Bills</h1>
          <p className="text-slate-400 text-xs mt-1">Official tax invoices computed via (Energy × ToD Rate) + Service Fee + 18% GST</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {bills.map((bill) => (
          <div key={bill.id} className="glass-card rounded-3xl p-6 border border-slate-800 bg-navy-900/60 space-y-4 hover:border-cyan-500/40 transition-all">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-mono">Invoice Number</span>
                <span className="text-base font-mono font-extrabold text-cyan-400">{bill.billNumber}</span>
              </div>
              <StatusBadge status={bill.status} size="sm" />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] block">Station</span>
                <span className="font-bold text-white">{bill.chargerName}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">ToD Slot</span>
                <span className="text-purple-300 font-mono font-bold">{bill.todSlotActive || 'S_2: Standard'}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Energy Delivered</span>
                <span className="font-bold text-white">{bill.energyKwh.toFixed(3)} kWh</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Total Amount (Inc. 18% GST)</span>
                <span className="font-extrabold text-cyan-400 text-sm font-mono">₹{bill.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-mono">Snapshot Rate: ₹{bill.tariffRate.toFixed(2)}/kWh</span>
              <Link
                href={`/bills/${bill.id}`}
                className="px-3 py-1.5 rounded-xl bg-navy-800 hover:bg-cyan-500 hover:text-navy-950 text-cyan-400 text-xs font-semibold transition-all flex items-center gap-1"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>View Full Bill</span>
              </Link>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
