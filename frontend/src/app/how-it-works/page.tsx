'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Search, 
  ShieldCheck, 
  Zap, 
  Activity, 
  Receipt, 
  CreditCard, 
  CheckCircle2, 
  ArrowRight,
  Cpu,
  GraduationCap,
  Terminal,
  Radio,
  Sliders,
  Layers,
  FileCode2,
  Clock,
  AlertTriangle,
  QrCode
} from 'lucide-react';

export default function HowItWorksPage() {
  const steps = [
    {
      num: '01',
      title: 'LOCATE BIKE BAY / BSS',
      desc: 'Use the interactive station finder to locate available 15A/16A single-phase points, IEC 60309 industrial plugs, or Priority Bay #02 with real-time ToD tariff rates.',
      icon: Search,
    },
    {
      num: '02',
      title: 'SCAN DYNAMIC QR & UPI',
      desc: 'Scan the station dynamic QR code with Google Pay, PhonePe, or Paytm UPI. Confirm tariff agreement (including Priority Preemption consent for Bay #02).',
      icon: QrCode,
    },
    {
      num: '03',
      title: 'PZEM-004T AC MONITORING',
      desc: 'ESP32 latches the 5V relay. PZEM-004T samples 230V AC RMS voltage, current (≤14.3A), power factor (0.98), and THD (2.1% < 5% IEEE-519) at 1Hz.',
      icon: Zap,
    },
    {
      num: '04',
      title: 'SECTION 6 AUDITED BILLING',
      desc: 'Upon completion or 120s emergency eviction cutoff, the invoice is computed via (Energy × ToD Rate) + Service Fee + 18% GST and settled digitally via UPI.',
      icon: Receipt,
    },
  ];

  const pinAllocations = [
    { pin: 'GPIO 26', peripheral: '5V Relay Contactor', interface: 'Digital Output', function: 'Trips/Latches AC 230V single-phase line (<10ms cutoff & 120s eviction trip)' },
    { pin: 'GPIO 16 (RX2), 17 (TX2)', peripheral: 'PZEM-004T Multi-Function Sensor', interface: 'UART2 (Modbus-RTU 9600 baud)', function: 'High-precision metrology: V, I (≤14.3A), Active Power, Energy kWh, PF, Frequency' },
    { pin: 'GPIO 27', peripheral: 'Active Buzzer Module', interface: 'Digital Output / PWM', function: 'Audible warning alarms (rapid beeping on 120s emergency priority preemption)' },
    { pin: 'GPIO 21 (SDA), 22 (SCL)', peripheral: '16x2 I2C LCD Display', interface: 'I2C Bus (0x27)', function: 'Local operational display of live V, I, kWh, and active ToD tariff slot' },
    { pin: 'GPIO 4', peripheral: 'Emergency Push Button', interface: 'Hardware Interrupt (PULLUP)', function: 'Physical emergency override trigger for ambulance priority preemption' },
    { pin: 'Wi-Fi 2.4 GHz', peripheral: 'ESP32 Wi-Fi Radio', interface: 'TCP/IP (MQTT / WebSockets)', function: 'Streams 1Hz JSON telemetry & logs Section 6 audit records to database' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* TITLE */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-semibold border border-cyan-500/30">
          <Zap className="w-4 h-4" />
          <span>Smart 2-Wheeler EV Charging Infrastructure</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          How the Smart EV Charging Station Works
        </h1>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          An end-to-end IoT charging ecosystem integrating commercial LT-6 Time-of-Day (ToD) tariffs, Priority Preemption eviction sequence, PZEM-004T power quality monitoring, and <strong>Dynamic QR / UPI online payment</strong>.
        </p>
      </div>

      {/* 4 OPERATIONAL STEPS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((s) => (
          <div key={s.num} className="glass-card rounded-3xl p-6 border border-slate-800 bg-slate-900/60 relative flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl font-black text-cyan-500/30 font-mono">{s.num}</span>
                <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  <s.icon className="w-6 h-6" />
                </div>
              </div>
              <h3 className="text-base font-bold text-white mb-2">{s.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* HARDWARE PINOUT & CIRCUIT DESIGN TABLE */}
      <div className="glass-card rounded-3xl p-6 lg:p-8 border border-slate-800 bg-slate-900/70 space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold mb-1">
              <Cpu className="w-4 h-4" />
              <span>HARDWARE INTERFACING & GPIO PIN MAPPING</span>
            </div>
            <h3 className="text-xl font-extrabold text-white">ESP32 DevKit Single-Phase Metrology Pinout</h3>
          </div>
          <span className="text-xs font-mono text-cyan-400">PZEM-004T UART2 &bull; 230V 1Φ (≤14.3A 2W)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider">
                <th className="py-3 px-3">Pin Number</th>
                <th className="py-3 px-3">Connected Component</th>
                <th className="py-3 px-3">Bus Interface</th>
                <th className="py-3 px-3">Operational Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200 font-mono">
              {pinAllocations.map((p, i) => (
                <tr key={i} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3 text-cyan-400 font-bold">{p.pin}</td>
                  <td className="py-3 px-3 text-white font-sans font-semibold">{p.peripheral}</td>
                  <td className="py-3 px-3 text-slate-400">{p.interface}</td>
                  <td className="py-3 px-3 text-slate-300 font-sans">{p.function}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MATHEMATICAL FORMULAS & BILLING EQUATION (PDF Section 6) */}
      <div className="glass-card rounded-3xl p-6 lg:p-8 border border-slate-800 bg-slate-900/70 space-y-6 shadow-2xl">
        <div className="pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold mb-1">
            <Activity className="w-4 h-4" />
            <span>PDF SPECIFICATIONS & COMPUTATIONAL EQUATIONS</span>
          </div>
          <h3 className="text-xl font-extrabold text-white">Time-of-Day Tariff & Billing Formulation</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
            <span className="text-emerald-400 font-bold text-sm block">1. Time-of-Day Tariff (LT-6)</span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Dynamically maps current hour to commercial public EV pricing tiers:
            </p>
            <div className="space-y-1 font-mono text-[10px] text-cyan-300">
              <div>&bull; Off-Peak (10 PM–6 AM): ₹8.00 / kWh</div>
              <div>&bull; Standard (6 AM–6 PM): ₹10.50 / kWh</div>
              <div>&bull; Peak (6 PM–10 PM): ₹14.00 / kWh</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
            <span className="text-amber-400 font-bold text-sm block">2. Priority Preemption (Bay #02)</span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Rate = Current ToD + ₹8.00/kWh surge. Emergency override triggers buzzer and 120s timer.
            </p>
            <div className="p-2.5 rounded-xl bg-slate-900 font-mono text-[11px] text-amber-300 border border-slate-800">
              Surge Rate = ToD_Rate + ₹8.00<br/>
              Timeout = Relay Cutoff + ₹500 Penalty
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
            <span className="text-cyan-400 font-bold text-sm block">3. Section 6 Final Billing Formula</span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Exact statutory formula applied to all generated invoices:
            </p>
            <div className="p-2.5 rounded-xl bg-slate-900 font-mono text-[11px] text-cyan-300 border border-slate-800">
              Total = (kWh × ToD) + ₹5.00 Fee + 18% GST (+ Penalty)
            </div>
          </div>
        </div>
      </div>

      {/* POWER QUALITY & HARDWARE SAFETY */}
      <div className="glass-card rounded-3xl p-8 border border-emerald-500/30 bg-slate-900/60 shadow-xl">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-emerald-400" />
          <span>Autonomous Power Quality Monitoring & Relay Protection</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-300">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <h4 className="font-bold text-cyan-400 mb-1">1. Overvoltage Cutoff (&gt;253V AC)</h4>
            <p className="text-slate-400 leading-relaxed">
              Indian grid single-phase standard nominal voltage is 230V &plusmn; 10%. If line voltage exceeds 253V, the ESP32 trips the relay in &lt;10ms.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <h4 className="font-bold text-cyan-400 mb-1">2. 2W Current Restriction (≤14.3A)</h4>
            <p className="text-slate-400 leading-relaxed">
              Strictly enforces the 3.3 kW single-phase limit (14.3 Amps at 230V) for electric two-wheelers, preventing thermal overload of standard 16A wiring.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <h4 className="font-bold text-cyan-400 mb-1">3. THD & Power Factor Compliance</h4>
            <p className="text-slate-400 leading-relaxed">
              Monitors Total Harmonic Distortion (THD ~2.1% &lt; 5% IEEE-519 limit) and Power Factor (0.98 near unity) for clean EV charging integration.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center pt-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/25 transition-all"
        >
          <span>Return to Home & Test Bench</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

    </div>
  );
}
