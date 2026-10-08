'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { QrCode, ShieldCheck, CheckCircle2, ArrowRight, Zap, Smartphone, Wallet, Info } from 'lucide-react';
import { useStore } from '@/lib/storeContext';

export default function UpiPaymentGatewayPage() {
  const { wallet } = useStore();
  const [upiId, setUpiId] = useState('driver@oksbi');
  const [autoPayEnabled, setAutoPayEnabled] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[11px] font-mono font-bold text-cyan-400 mb-2">
            Dynamic QR & UPI Payment Gateway
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Online UPI & QR AutoPay</h1>
          <p className="text-slate-400 text-xs mt-1">
            Physical RFID cards have been completely replaced with instant Dynamic QR Codes and Online UPI AutoPay (Google Pay, PhonePe, Paytm)
          </p>
        </div>

        <Link
          href="/charging/start"
          className="px-5 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/20"
        >
          <QrCode className="w-4 h-4" />
          <span>Launch QR Scanner</span>
        </Link>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>UPI AutoPay mandate configuration updated successfully!</span>
        </div>
      )}

      {/* Info notice about RFID replacement */}
      <div className="glass-card rounded-2xl p-4 border border-cyan-500/30 bg-cyan-950/20 flex items-start gap-3">
        <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300">
          <p className="font-bold text-white">Digital-First Architecture Specification</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Per the academic project guidelines, the EV charging station utilizes <strong>Dynamic QR Code and Online UPI Payment</strong> for frictionless, secure driver authentication and instant Section 6 digital invoice settlements.
          </p>
        </div>
      </div>

      {/* UPI MANDATE CARD */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div className="glass-card rounded-3xl p-6 border border-slate-800 bg-navy-900/60 space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
            <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Linked UPI ID & Mandate</h3>
              <p className="text-[11px] text-slate-400">NPCI UPI 2.0 Recurring Auto-Debit</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Primary UPI Virtual Payment Address (VPA)</label>
              <input
                type="text"
                required
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="username@okhdfcbank / mobile@upi"
                className="w-full bg-navy-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-mono"
              />
            </div>

            <div className="p-3.5 rounded-2xl bg-navy-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">UPI AutoPay on Plug Disconnect</span>
                <span className="text-[10px] text-slate-400">Automatically settle Section 6 final invoice upon contactor trip</span>
              </div>
              <input
                type="checkbox"
                checked={autoPayEnabled}
                onChange={(e) => setAutoPayEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-cyan-500 focus:ring-0 bg-slate-900 border-slate-700"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-bold text-xs"
            >
              Update UPI Mandate
            </button>
          </form>
        </div>

        {/* QR TEST BENCH PREVIEW */}
        <div className="glass-card rounded-3xl p-6 border border-slate-800 bg-navy-900/60 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Station QR Metrology Simulator</span>
            <h3 className="text-base font-bold text-white">Dynamic Bharat QR Specification</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Each charging bay generates a cryptographically signed dynamic QR code containing station ID, active ToD tariff rate, and session token.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white text-navy-950 flex flex-col items-center justify-center space-y-2 max-w-[200px] mx-auto shadow-xl">
            <QrCode className="w-32 h-32" />
            <span className="text-[10px] font-mono font-bold">BHARAT-QR &bull; UPI-2.0</span>
          </div>

          <div className="text-center">
            <span className="text-[11px] text-emerald-400 font-mono font-semibold">
              Supported: Google Pay, PhonePe, Paytm, BHIM UPI
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}
