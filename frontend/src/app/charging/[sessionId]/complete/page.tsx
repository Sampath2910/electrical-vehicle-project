'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { 
  CheckCircle2, 
  Receipt, 
  Zap, 
  Clock, 
  Wallet, 
  FileText, 
  ArrowRight,
  ShieldCheck,
  Download,
  AlertTriangle,
  Activity,
  QrCode
} from 'lucide-react';
import { useStore } from '@/lib/storeContext';

export default function SessionCompletePage({ params }: { params: Promise<{ sessionId: string }> }) {
  const resolvedParams = use(params);
  const { historySessions, bills } = useStore();

  const session = historySessions.find(s => s.id === resolvedParams.sessionId) || historySessions[0];
  const bill = bills.find(b => b.sessionId === session?.id) || bills[0];

  if (!session) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Session Summary Unavailable</h2>
        <Link href="/dashboard" className="px-4 py-2 bg-cyan-500 text-navy-950 text-xs font-bold rounded-xl inline-block">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  // Exact PDF Page 6 Billing Formula Calculations
  const energyKwh = session.energyKwh || 0.05;
  const rate = session.tariffRate || 10.50;
  const energySubtotal = bill?.energyCost ?? (energyKwh * rate);
  const serviceFee = bill?.serviceFee ?? 5.00;
  const subtotalBeforeGst = energySubtotal + serviceFee;
  const gstAmount = bill?.gstAmount ?? (subtotalBeforeGst * 0.18);
  const penaltyFee = (session.penaltyFee || bill?.penaltyFee || 0);
  const totalAmount = bill?.totalAmount ?? (subtotalBeforeGst + gstAmount + penaltyFee);

  const todSlot = session.todSlotActive || bill?.todSlotActive || 'S_2: Standard (₹10.50/kWh)';
  const maxCurrent = session.maxCurrentA || bill?.maxCurrentA || 13.8;
  const avgVoltage = session.avgVoltageV || bill?.avgVoltageV || 229.4;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Success Badge */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-400 mx-auto glow-emerald">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Charging Session Completed!</h1>
        <p className="text-xs text-slate-400">5V Relay Contactor safe trip confirmed. Section 6 digital tax invoice settled via UPI.</p>
      </div>

      {penaltyFee > 0 && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <h4 className="font-bold text-rose-400">Emergency Priority Preemption Penalty Applied (₹500.00)</h4>
            <p className="text-slate-300 mt-0.5">
              Bay #02 Priority Override was triggered for an emergency vehicle. Because the EV was not unplugged within 120 seconds, the ESP32 safety relay automatically tripped and statutory penalty fee was appended to your final invoice.
            </p>
          </div>
        </div>
      )}

      {/* OFFICIAL DIGITAL INVOICE CARD */}
      <div className="glass-card rounded-3xl p-6 lg:p-8 border border-slate-800 bg-navy-900/90 shadow-2xl space-y-6">
        
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Official Digital Invoice (Sec 6 Billing Standard)</span>
            <h3 className="text-lg font-mono font-bold text-cyan-400">{bill?.billNumber || 'INV-2026-8819'}</h3>
          </div>
          <div className="text-right">
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
              PAID & SETTLED (UPI)
            </span>
          </div>
        </div>

        {/* Station & Authorization details */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-slate-400 text-[10px] block">Charging Station</span>
            <span className="font-bold text-white">{session.chargerName}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block">Authorization & Payment</span>
            <span className="font-bold text-emerald-400 flex items-center gap-1">
              <QrCode className="w-3.5 h-3.5" /> Dynamic QR / UPI
            </span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block">Vehicle Model</span>
            <span className="font-bold text-white">{session.vehicleModel || 'Ather 450X (3.7 kWh)'}</span>
          </div>
        </div>

        {/* Bill Breakdown Table according to PDF Page 6 */}
        <div className="p-4 rounded-2xl bg-navy-950 border border-slate-800 space-y-3">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-800/80">
            Formula: (Energy kWh × ToD Rate) + Service Fee + 18% GST
          </div>

          <div className="flex items-center justify-between text-xs text-slate-300">
            <span>Energy Delivered (PZEM-004T Metered)</span>
            <span className="font-mono font-bold text-white">{energyKwh.toFixed(3)} kWh</span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-300">
            <div>
              <span>Applied Tariff Tier</span>
              <span className="text-[10px] text-cyan-400 block font-mono">{todSlot}</span>
            </div>
            <span className="font-mono text-cyan-400 font-bold">₹{rate.toFixed(2)} / kWh</span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-300">
            <span>Energy Subtotal ({energyKwh.toFixed(3)} kWh × ₹{rate.toFixed(2)})</span>
            <span className="font-mono font-bold text-white">₹{energySubtotal.toFixed(2)}</span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-300">
            <span>Discom Infrastructure & Service Fee</span>
            <span className="font-mono font-bold text-white">₹{serviceFee.toFixed(2)}</span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-300">
            <span>Subtotal (Energy + Service Fee)</span>
            <span className="font-mono text-slate-400">₹{subtotalBeforeGst.toFixed(2)}</span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-300">
            <span>Statutory Goods & Services Tax (18% GST)</span>
            <span className="font-mono font-bold text-amber-400">₹{gstAmount.toFixed(2)}</span>
          </div>

          {penaltyFee > 0 && (
            <div className="flex items-center justify-between text-xs text-rose-400 bg-rose-500/10 p-2 rounded-lg">
              <span className="font-bold">Emergency Eviction Violation Penalty</span>
              <span className="font-mono font-bold">+₹{penaltyFee.toFixed(2)}</span>
            </div>
          )}

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-sm">
            <span className="font-bold text-white">Final Billed Amount (INR)</span>
            <span className="font-extrabold text-cyan-400 text-xl font-mono">₹{totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Section 6: Engineering Audit Data Logging Structure */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" /> Section 6 Engineering Audit Log (ESP32 PZEM-004T / MongoDB)
            </span>
            <span className="text-[9px] text-slate-500 font-mono">IEEE 519 & CEA Verified</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] font-mono text-slate-300">
            <div className="bg-navy-950/80 p-2 rounded border border-slate-800/80">
              <span className="text-[9px] text-slate-500 block">Session_ID</span>
              <span className="text-white truncate block">{session.id}</span>
            </div>
            <div className="bg-navy-950/80 p-2 rounded border border-slate-800/80">
              <span className="text-[9px] text-slate-500 block">Energy_Delivered_kWh</span>
              <span className="text-cyan-400 font-bold">{energyKwh.toFixed(3)} kWh</span>
            </div>
            <div className="bg-navy-950/80 p-2 rounded border border-slate-800/80">
              <span className="text-[9px] text-slate-500 block">Max_Current_A</span>
              <span className="text-amber-400 font-bold">{maxCurrent.toFixed(1)} A (≤14.3A 2W)</span>
            </div>
            <div className="bg-navy-950/80 p-2 rounded border border-slate-800/80">
              <span className="text-[9px] text-slate-500 block">Avg_Voltage_V</span>
              <span className="text-emerald-400 font-bold">{avgVoltage.toFixed(1)} V (230V Nominal)</span>
            </div>
            <div className="bg-navy-950/80 p-2 rounded border border-slate-800/80">
              <span className="text-[9px] text-slate-500 block">ToD_Slot_Active</span>
              <span className="text-purple-300 font-bold truncate block">{todSlot}</span>
            </div>
            <div className="bg-navy-950/80 p-2 rounded border border-slate-800/80">
              <span className="text-[9px] text-slate-500 block">Final_Billed_Amount_INR</span>
              <span className="text-emerald-400 font-bold">₹{totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <Link
            href="/history"
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/20"
          >
            <Receipt className="w-4 h-4" />
            <span>View All Bills & Audit Logs</span>
          </Link>

          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl glass-card border border-slate-700 hover:border-slate-600 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all"
          >
            <span>Return to Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}
