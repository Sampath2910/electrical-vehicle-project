'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Zap, 
  ShieldCheck, 
  QrCode, 
  CreditCard, 
  Activity, 
  Receipt, 
  Wallet, 
  Bike, 
  Bell, 
  BarChart3, 
  Cpu, 
  ArrowRight,
  Clock,
  AlertTriangle,
  Radio
} from 'lucide-react';

export default function FeaturesPage() {
  const featureGroups = [
    {
      title: 'RIDER & TWO-WHEELER FEATURES',
      features: [
        { name: 'Scan & Charge (Dynamic QR / UPI)', desc: 'Instant smartphone scanning with server-side UPI verification (Google Pay, PhonePe, Paytm).', icon: QrCode },
        { name: 'Time-of-Day (ToD) Tariffs', desc: 'Commercial LT-6 pricing tiers: Off-Peak (₹8.00), Standard (₹10.50), and Peak (₹14.00/kWh).', icon: Clock },
        { name: 'Priority Preemption Bay #02', desc: 'VIP / Emergency bay access with mandatory digital consent pop-up and 120s eviction countdown sequence.', icon: AlertTriangle },
        { name: '1Hz Power Quality Telemetry', desc: 'PZEM-004T metrology streaming 230V AC, current (≤14.3A), Power Factor (0.98), and THD (2.1%).', icon: Activity },
        { name: 'Indian 2W Battery Intelligence', desc: 'Calibrated profiles for Ather 450X (3.7 kWh), Ola S1 Pro (4.0 kWh), TVS iQube (3.4 kWh), and F77.', icon: Bike },
        { name: 'Section 6 Audited Invoices', desc: 'Exact billing formula: (Energy × ToD Rate) + Service Fee + 18% GST with full metrology audit trail.', icon: Receipt },
      ],
    },
    {
      title: 'OPERATOR & POWER QUALITY SAFETY SUITE',
      features: [
        { name: '2W Power Ceiling (Max 3.3 kW)', desc: 'Enforces single-phase 14.3A ceiling for Indian electric two-wheelers on IEC 60309 & 16A sockets.', icon: Zap },
        { name: 'Autonomous ESP32 Safety Cutoff', desc: 'Instant local relay cutoff for overvoltage (>253V AC) or overcurrent surges without cloud dependency.', icon: ShieldCheck },
        { name: 'THD & Sag/Swell Monitoring', desc: 'Continuous compliance checks against IEEE-519 standards (<5% THD, nominal 230V ±6%).', icon: Activity },
        { name: 'Emergency Dispatch Override', desc: 'Admin and bench override buttons to simulate ambulance arrival and initiate immediate preemption.', icon: AlertTriangle },
      ],
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-semibold border border-cyan-500/30">
          <span>Enterprise Smart EV Charging Infrastructure</span>
        </div>
        <h1 className="text-4xl font-extrabold text-white tracking-tight">Smart EV Platform Capabilities</h1>
        <p className="text-slate-400 text-base">
          Aligned with the project specification PDF: Time-of-Day tariffs, Priority Preemption Protocol, PZEM-004T AC metrology, and Dynamic QR/UPI online payment.
        </p>
      </div>

      {featureGroups.map((group, idx) => (
        <div key={idx} className="space-y-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400 border-b border-slate-800 pb-2">
            {group.title}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {group.features.map((f, i) => (
              <div key={i} className="glass-card glass-card-hover rounded-2xl p-6 border border-slate-800 bg-navy-900/60">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{f.name}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="text-center pt-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-bold text-sm shadow-lg shadow-cyan-500/25 transition-all"
        >
          <span>Launch Rider Dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
