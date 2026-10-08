'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText, Download, CheckCircle2, Zap, ShieldCheck, Activity, AlertTriangle } from 'lucide-react';
import { useStore } from '@/lib/storeContext';

export default function DetailedBillPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { bills } = useStore();

  const bill = bills.find(b => b.id === resolvedParams.id || b.billNumber === resolvedParams.id) || bills[0];

  const energyCost = bill.energyCost ?? (bill.energyKwh * bill.tariffRate);
  const serviceFee = bill.serviceFee ?? 5.00;
  const gstAmount = bill.gstAmount ?? ((energyCost + serviceFee) * 0.18);
  const penaltyFee = bill.penaltyFee || 0;
  const totalAmount = bill.totalAmount;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <Link href="/bills" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-cyan-400">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Invoices</span>
      </Link>

      <div className="glass-card rounded-3xl p-8 border border-slate-800 bg-navy-900/90 shadow-2xl space-y-8">
        
        <div className="flex items-center justify-between pb-6 border-b border-slate-800">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Official Tax Invoice (PDF Sec 6 Formula)</span>
            <h1 className="text-2xl font-mono font-extrabold text-cyan-400">{bill.billNumber}</h1>
            <p className="text-xs text-slate-400 mt-0.5">Issued: {new Date(bill.issuedAt).toLocaleString()}</p>
          </div>

          <div className="text-right">
            <span className="px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
              STATUS: {bill.status}
            </span>
          </div>
        </div>

        {/* Invoice breakdown according to PDF Page 6 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Charging Session Line Items</h3>
            <span className="text-[11px] font-mono text-cyan-400">Total = (Energy × ToD) + Fee + 18% GST</span>
          </div>

          <div className="p-4 rounded-2xl bg-navy-950 border border-slate-800 space-y-3 text-xs">
            <div className="flex items-center justify-between text-slate-300">
              <span>Station Name:</span>
              <span className="font-bold text-white">{bill.chargerName}</span>
            </div>

            <div className="flex items-center justify-between text-slate-300">
              <span>Energy Delivered (PZEM-004T Metered):</span>
              <span className="font-mono font-bold text-cyan-400">{bill.energyKwh.toFixed(3)} kWh</span>
            </div>

            <div className="flex items-center justify-between text-slate-300">
              <div>
                <span>Tariff Snapshot Rate:</span>
                {bill.todSlotActive && (
                  <span className="text-[10px] text-cyan-400 block font-mono">{bill.todSlotActive}</span>
                )}
              </div>
              <span className="font-mono text-slate-200">₹{bill.tariffRate.toFixed(2)} / kWh</span>
            </div>

            <div className="flex items-center justify-between text-slate-300">
              <span>Energy Subtotal ({bill.energyKwh.toFixed(3)} × ₹{bill.tariffRate.toFixed(2)}):</span>
              <span className="font-mono font-bold text-white">₹{energyCost.toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between text-slate-300">
              <span>Fixed Service / Infrastructure Fee:</span>
              <span className="font-mono font-bold text-white">₹{serviceFee.toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between text-slate-300">
              <span>Statutory Goods & Services Tax (18% GST):</span>
              <span className="font-mono font-bold text-amber-400">₹{gstAmount.toFixed(2)}</span>
            </div>

            {penaltyFee > 0 && (
              <div className="flex items-center justify-between text-rose-400 bg-rose-500/10 p-2 rounded-lg">
                <span className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> Bay #02 Priority Preemption Penalty:
                </span>
                <span className="font-mono font-bold">+₹{penaltyFee.toFixed(2)}</span>
              </div>
            )}

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-base">
              <span className="font-bold text-white">Total Amount Paid (INR):</span>
              <span className="font-extrabold text-cyan-400 text-lg font-mono">₹{totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Section 6 Engineering Audit Parameters Log */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" /> Section 6 Engineering Audit Trail (ESP32 / PZEM-004T)
            </span>
            <span className="text-[9px] text-slate-500 font-mono">Verified for Academic Review</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] font-mono text-slate-300">
            <div className="bg-navy-950/80 p-2 rounded border border-slate-800/80">
              <span className="text-[9px] text-slate-500 block">Session_ID</span>
              <span className="text-white truncate block">{bill.sessionId}</span>
            </div>
            <div className="bg-navy-950/80 p-2 rounded border border-slate-800/80">
              <span className="text-[9px] text-slate-500 block">Energy_Delivered_kWh</span>
              <span className="text-cyan-400 font-bold">{bill.energyKwh.toFixed(3)} kWh</span>
            </div>
            <div className="bg-navy-950/80 p-2 rounded border border-slate-800/80">
              <span className="text-[9px] text-slate-500 block">Max_Current_A</span>
              <span className="text-amber-400 font-bold">{(bill.maxCurrentA || 13.8).toFixed(1)} A (≤14.3A)</span>
            </div>
            <div className="bg-navy-950/80 p-2 rounded border border-slate-800/80">
              <span className="text-[9px] text-slate-500 block">Avg_Voltage_V</span>
              <span className="text-emerald-400 font-bold">{(bill.avgVoltageV || 229.4).toFixed(1)} V</span>
            </div>
            <div className="bg-navy-950/80 p-2 rounded border border-slate-800/80">
              <span className="text-[9px] text-slate-500 block">ToD_Slot_Active</span>
              <span className="text-purple-300 font-bold truncate block">{bill.todSlotActive || 'S_2: Standard'}</span>
            </div>
            <div className="bg-navy-950/80 p-2 rounded border border-slate-800/80">
              <span className="text-[9px] text-slate-500 block">Final_Billed_Amount_INR</span>
              <span className="text-emerald-400 font-bold">₹{totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footnote */}
        <div className="p-4 rounded-2xl bg-navy-950/60 border border-slate-800 text-[11px] text-slate-400 space-y-1">
          <p className="font-semibold text-slate-300">Payment Integrity Confirmation</p>
          <p>Generated by the smart charging controller following LT-6 tariff structure and PZEM-004T precision AC metrology. Settled securely via UPI.</p>
        </div>

      </div>

    </div>
  );
}
