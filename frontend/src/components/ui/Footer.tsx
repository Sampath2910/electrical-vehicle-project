import React from 'react';
import Link from 'next/link';
import { Bike, Zap, ShieldCheck, Cpu, Lock, RefreshCw } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-400 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-400 glow-cyan">
              <Bike className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-lg font-extrabold text-white">SMART<span className="text-cyan-400">MOTO</span><span className="text-emerald-400 text-xs ml-0.5">EV</span></span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            IoT-enabled Smart Electric Two-Wheeler Charging & Battery Swapping Platform. 230V single-phase telemetry, 15A/16A smart plugs, LEV DC boost, and instant 60-second battery swaps.
          </p>
        </div>

        <div>
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">Rider Routes</h4>
          <ul className="space-y-2 text-xs font-medium">
            <li><Link href="/chargers" className="hover:text-cyan-400 transition-colors">Find Bike Station & Swap Hub</Link></li>
            <li><Link href="/vehicles" className="hover:text-cyan-400 transition-colors">Bike Garage & Range Modes</Link></li>
            <li><Link href="/dashboard" className="hover:text-cyan-400 transition-colors">Rider Dashboard</Link></li>
            <li><Link href="/charging/start" className="hover:text-cyan-400 transition-colors">Start Bike Charging / Swap</Link></li>
            <li><Link href="/history" className="hover:text-cyan-400 transition-colors">Riding Sessions & Bills</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">Operator & Admin</h4>
          <ul className="space-y-2 text-xs font-medium">
            <li><Link href="/admin" className="hover:text-cyan-400 transition-colors">Operations Suite</Link></li>
            <li><Link href="/admin/chargers" className="hover:text-cyan-400 transition-colors">Charger Fleet Manager</Link></li>
            <li><Link href="/admin/live" className="hover:text-cyan-400 transition-colors">Live Telemetry Dashboard</Link></li>
            <li><Link href="/admin/faults" className="hover:text-cyan-400 transition-colors">Safety Fault Center</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">Safety & Compliance</h4>
          <div className="space-y-2 text-xs font-medium">
            <div className="flex items-center gap-2 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Local Hardware Controller Cutoff</span>
            </div>
            <div className="flex items-center gap-2 text-blue-400">
              <Cpu className="w-4 h-4" />
              <span>ESP32 Autonomous Safety Logic</span>
            </div>
            <div className="flex items-center gap-2 text-amber-400">
              <Lock className="w-4 h-4" />
              <span>Server-Side Payment Webhooks</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
        <p>&copy; 2026 Smart EV Infrastructure Inc. All rights reserved.</p>
        <div className="flex items-center gap-4 mt-2 sm:mt-0">
          <span className="text-cyan-400/80 font-mono text-[11px]">NEXT_PUBLIC_DATA_MODE=mock</span>
          <span className="font-mono text-[11px]">v1.0.0-production</span>
        </div>
      </div>
    </footer>
  );
};
