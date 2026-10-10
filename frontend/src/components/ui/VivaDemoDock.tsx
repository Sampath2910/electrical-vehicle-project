'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Zap, 
  RefreshCw, 
  CreditCard, 
  Cpu, 
  ChevronUp, 
  ChevronDown, 
  Sparkles, 
  CheckCircle2,
  X
} from 'lucide-react';
import { useStore } from '@/lib/storeContext';

export const VivaDemoDock: React.FC = () => {
  const router = useRouter();
  const { playSound, chargers, startChargingSession } = useStore();
  const [alertNotice, setAlertNotice] = useState<string | null>(null);

  const firstAvailableCharger = chargers.find(c => c.status === 'AVAILABLE') || chargers[0];

  const handleQuickCharge = async () => {
    playSound('beep');
    try {
      const session = await startChargingSession(firstAvailableCharger.id, 'QR_UPI');
      playSound('success');
      router.push(`/charging/${session.id}`);
    } catch (e: any) {
      setAlertNotice(e.message || 'Error launching quick demo session');
      setTimeout(() => setAlertNotice(null), 3000);
    }
  };

  const handleTripTest = () => {
    playSound('alert');
    setAlertNotice('⚠️ OVERVOLTAGE TEST: Simulated 264.8V AC grid surge! ESP32 GPIO 26 Relay contactor TRIPPED in 8ms.');
    setTimeout(() => setAlertNotice(null), 5000);
  };

  return (
    <>
      {/* FLOATING ACTION DOCK AT BOTTOM */}
      <aside aria-label="Viva Quick Demo Bar" className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-2xl">
        
        {/* FLASH ALERT NOTIFICATION */}
        {alertNotice && (
          <div className="mb-2 p-3 rounded-2xl bg-rose-500/90 border border-rose-400 text-white text-xs font-semibold shadow-2xl flex items-center justify-between backdrop-blur-md animate-bounce">
            <span>{alertNotice}</span>
            <button onClick={() => setAlertNotice(null)} className="p-1 hover:text-slate-200">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="glass-card rounded-2xl border border-cyan-500/40 bg-slate-950/90 shadow-2xl backdrop-blur-2xl p-2.5 transition-all">
          
          <div className="flex items-center justify-between gap-2">
            
            {/* Title / Expand Pill */}
            <div className="flex items-center gap-2 pl-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-400/40 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="hidden sm:block">
                <span className="text-[11px] font-bold text-white block">Simulation Controls</span>
                <span className="text-[9px] text-slate-400 block -mt-0.5">1-Click System Testing</span>
              </div>
            </div>

            {/* Quick Demo Buttons */}
            <div className="flex items-center gap-1.5">
              
              <button
                type="button"
                onClick={handleQuickCharge}
                title="Start Instant Bike Charge Simulation via QR / UPI"
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-extrabold text-[11px] flex items-center gap-1.5 shadow-md transition-all active:scale-95"
              >
                <Zap className="w-3.5 h-3.5 fill-slate-950" />
                <span>UPI Quick Charge</span>
              </button>

              <button
                type="button"
                onClick={handleTripTest}
                title="Test ESP32 253V Overvoltage Trip"
                className="px-2.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold text-[11px] flex items-center gap-1 transition-all active:scale-95"
              >
                <span className="hidden md:inline">253V Trip</span>
              </button>

              <Link
                href="/chargers?filter=SWAP"
                className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 font-semibold text-[11px] flex items-center gap-1 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden md:inline">BSS Hub</span>
              </Link>

            </div>

          </div>

        </div>

      </aside>
    </>
  );
};
