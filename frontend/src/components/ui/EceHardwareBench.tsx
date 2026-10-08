'use client';

import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Zap, 
  ShieldCheck, 
  Terminal, 
  Sliders, 
  AlertTriangle, 
  Radio, 
  Wifi, 
  RefreshCw,
  Layers,
  Activity
} from 'lucide-react';

export const EceHardwareBench: React.FC = () => {
  const [testState, setTestState] = useState<'NORMAL' | 'SURGE_FAULT' | 'PREEMPT_OVERRIDE'>('NORMAL');
  const [relayContactor, setRelayContactor] = useState<boolean>(true);
  const [gridVoltage, setGridVoltage] = useState<number>(230.2);
  const [loadCurrent, setLoadCurrent] = useState<number>(14.1);
  const [thdVal, setThdVal] = useState<number>(2.1);
  const [serialLogs, setSerialLogs] = useState<string[]>([
    '[INIT] ESP32 DevKit V1 Initialized @ 115200 baud',
    '[WIFI] Connected to AP (192.168.1.105)',
    '[MQTT] Broker connected: ev/chargers/bay01/telemetry',
    '[PZEM-004T] AC Energy Meter Active (UART2: TX 17 / RX 16)',
    '[PAYMENT] Online UPI / QR Dynamic Gateway Ready',
    '[RELAY] GPIO 26 Contactor LATCHED (3.3kW 2W AC Bay Active)'
  ]);

  // Simulate hardware behaviors on test state changes
  useEffect(() => {
    if (testState === 'NORMAL') {
      setGridVoltage(230.2);
      setLoadCurrent(14.1);
      setThdVal(2.1);
      setRelayContactor(true);
      setSerialLogs(prev => [
        ...prev.slice(-6),
        `[PZEM-004T] V=230.2V | I=14.1A (max 14.3A) | P=3.18kW | PF=0.98 | THD=2.1% | Contactor: CLOSED`
      ]);
    } else if (testState === 'SURGE_FAULT') {
      setGridVoltage(264.8); // Exceeds 253V threshold!
      setLoadCurrent(0.0);
      setRelayContactor(false); // Trip relay
      setSerialLogs(prev => [
        ...prev.slice(-6),
        `[CRITICAL ALERT] PZEM-004T reading 264.8V > 253.0V safety threshold!`,
        `[LOCAL CUTOFF] ESP32 Core-1 ISR: GPIO 26 driven LOW in 8ms -> RELAY TRIPPED!`,
        `[MQTT] Published fault: OVER_VOLTAGE_FAULT to cloud broker`
      ]);
    } else if (testState === 'PREEMPT_OVERRIDE') {
      setSerialLogs(prev => [
        ...prev.slice(-6),
        `[EMERGENCY OVERRIDE] Physical Preemption trigger received (Ambulance Arrived)!`,
        `[BUZZER] ESP32 GPIO 27 active buzzer beeping rapidly (120s Eviction Countdown)`,
        `[EVICTION] Dashboard flashing "VACATE IMMEDIATELY" | Auto-Relay trip in 120s if not yielded`
      ]);
    }
  }, [testState]);

  // Live telemetry pulse (strictly 2-wheeler profile <= 14.3A, <= 3.3kW)
  useEffect(() => {
    if (testState !== 'NORMAL') return;

    const interval = setInterval(() => {
      const vVar = +(229.8 + Math.random() * 1.0).toFixed(1);
      const iVar = +(13.8 + Math.random() * 0.4).toFixed(1);
      const thd = +(2.0 + Math.random() * 0.3).toFixed(1);
      setGridVoltage(vVar);
      setLoadCurrent(iVar);
      setThdVal(thd);

      const pKw = ((vVar * iVar * 0.98) / 1000).toFixed(2);
      setSerialLogs(prev => [
        ...prev.slice(-6),
        `[ESP32 PZEM 1Hz] V=${vVar}V, I=${iVar}A, P=${pKw}kW, PF=0.98, THD=${thd}%, Contactor=ON`
      ]);
    }, 2000);

    return () => clearInterval(interval);
  }, [testState]);

  const powerWatts = Math.round(gridVoltage * loadCurrent * 0.98);

  return (
    <div className="glass-card rounded-3xl p-6 lg:p-8 border border-cyan-500/30 bg-slate-900/90 shadow-2xl space-y-6">
      
      {/* EEE PROJECT HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-semibold text-cyan-400 mb-1.5">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>Hardware Test Bench & Power Quality Monitoring</span>
          </div>
          <h3 className="text-xl font-extrabold text-white tracking-tight">
            ESP32 Embedded Power Controller & PZEM-004T Metering Bench
          </h3>
          <p className="text-xs text-slate-400">
            Real-time verification of 2-wheeler 3.3kW AC power telemetry (max 14.3A), THD harmonic distortion, autonomous relay cutoff, and priority preemption eviction.
          </p>
        </div>

        {/* Relay State Badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-300">GPIO 26 5V Relay:</span>
          <span className={`px-3 py-1 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 border ${
            relayContactor 
              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' 
              : 'bg-rose-500/10 border-rose-500/40 text-rose-400 animate-pulse'
          }`}>
            <span className={`w-2 h-2 rounded-full ${relayContactor ? 'bg-emerald-400' : 'bg-rose-400'}`} />
            {relayContactor ? 'LATCHED (CLOSED)' : 'TRIPPED (OPEN)'}
          </span>
        </div>
      </div>

      {/* HARDWARE BLOCK DIAGRAM & SENSOR PINS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Microcontroller</span>
          <span className="font-extrabold text-white text-sm block">ESP32-WROOM-32</span>
          <span className="text-[10px] text-cyan-400 font-mono block">240MHz Dual-Core • Wi-Fi/MQTT</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Multi-Function Sensor</span>
          <span className="font-extrabold text-white text-sm block">PZEM-004T Sensor</span>
          <span className="text-[10px] text-emerald-400 font-mono block">UART2 (TX: 17, RX: 16) • 100A CT</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Power Quality Monitoring</span>
          <span className="font-extrabold text-white text-sm block">PF: 0.98 | THD: 2.1%</span>
          <span className="text-[10px] text-blue-400 font-mono block">IEEE 519 Standard (&lt;5% THD)</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Payment & Authorization</span>
          <span className="font-extrabold text-white text-sm block">Dynamic UPI / QR Code</span>
          <span className="text-[10px] text-amber-400 font-mono block">Zero-RFID • Instant Online UPI</span>
        </div>

      </div>

      {/* INTERACTIVE EXAMINER DEMO TEST CONTROLS */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>Examiner Test & Simulation Bench:</span>
          </span>
          <span className="text-[11px] text-slate-400">Click any mode below to verify hardware responses in real-time</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setTestState('NORMAL')}
            className={`p-3 rounded-xl border text-left transition-all ${
              testState === 'NORMAL'
                ? 'border-cyan-400 bg-cyan-500/10 glow-cyan text-white'
                : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
            }`}
          >
            <span className="text-xs font-bold block">1. Normal 2W Charging</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">230V AC &bull; 14.1A (&le;14.3A max) &bull; Relay CLOSED</span>
          </button>

          <button
            type="button"
            onClick={() => setTestState('SURGE_FAULT')}
            className={`p-3 rounded-xl border text-left transition-all ${
              testState === 'SURGE_FAULT'
                ? 'border-rose-400 bg-rose-500/10 glow-rose text-white'
                : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
            }`}
          >
            <span className="text-xs font-bold text-rose-400 block flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>2. Test Overvoltage Cutoff</span>
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Simulate 265V surge (&gt;253V) &rarr; Relay TRIPS in 8ms</span>
          </button>

          <button
            type="button"
            onClick={() => setTestState('PREEMPT_OVERRIDE')}
            className={`p-3 rounded-xl border text-left transition-all ${
              testState === 'PREEMPT_OVERRIDE'
                ? 'border-amber-400 bg-amber-500/10 text-white'
                : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
            }`}
          >
            <span className="text-xs font-bold text-amber-400 block">3. Priority Preemption Override</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Ambulance Arrives &rarr; 120s Eviction or ₹500 Penalty</span>
          </button>
        </div>
      </div>

      {/* HARDWARE MATH & LIVE SERIAL MONITOR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Math & Formulas (EEE Power Systems & Sensor Theory) */}
        <div className="lg:col-span-5 p-4 rounded-2xl bg-slate-950/90 border border-slate-800 flex flex-col justify-between space-y-3">
          <div>
            <span className="text-xs font-bold text-slate-300 block mb-2">Power Systems & Metrology Equations:</span>
            <div className="space-y-2 text-xs font-mono">
              <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800/80">
                <span className="text-slate-400 text-[10px] block">AC Voltage RMS (PZEM-004T):</span>
                <span className="text-emerald-400">V_rms = <strong>{gridVoltage} V</strong> (Nominal 230V &plusmn; 10%)</span>
              </div>

              <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800/80">
                <span className="text-slate-400 text-[10px] block">2-Wheeler Max Current Draw:</span>
                <span className="text-blue-400">I_rms = <strong>{loadCurrent} A</strong> (Limited to 14.3A @ 230V)</span>
              </div>

              <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800/80">
                <span className="text-slate-400 text-[10px] block">Active Power (P = V &times; I &times; cos&phi;):</span>
                <span className="text-cyan-400">P = {gridVoltage}V &times; {loadCurrent}A &times; 0.98 = <strong>{powerWatts} W (3.2 kW)</strong></span>
              </div>

              <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800/80">
                <span className="text-slate-400 text-[10px] block">Power Quality (THD & Power Factor):</span>
                <span className="text-amber-400">PF = 0.98 | THD = {thdVal}% (&lt; 5% IEEE-519 Standard)</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Scope: 1 kW to 3.3 kW 2-Wheeler</span>
            <span className="text-emerald-400 font-semibold">Single Phase 230V</span>
          </div>
        </div>

        {/* Live ESP32 Serial Terminal */}
        <div className="lg:col-span-7 p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between pb-1 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>ESP32 Virtual Serial Monitor (115200 Baud)</span>
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>

          <div className="font-mono text-[11px] space-y-1 bg-black/60 p-3 rounded-xl border border-slate-900 h-44 overflow-y-auto text-slate-300">
            {serialLogs.map((log, i) => (
              <div 
                key={i} 
                className={
                  log.includes('CRITICAL') || log.includes('CUTOFF') 
                    ? 'text-rose-400 font-bold' 
                    : log.includes('EMERGENCY') || log.includes('PREEMPTION') || log.includes('BUZZER')
                      ? 'text-amber-300 font-bold'
                      : log.includes('INIT') || log.includes('WIFI') || log.includes('PZEM')
                        ? 'text-cyan-400'
                        : 'text-slate-300'
                }
              >
                {log}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1">
            <span>MQTT Topic: ev/chargers/bay01/telemetry</span>
            <span>Packet Rate: 1 Hz &bull; Modbus RTU / UART</span>
          </div>
        </div>

      </div>

    </div>
  );
};

// Also export as EeeHardwareBench for semantic clarity
export const EeeHardwareBench = EceHardwareBench;
