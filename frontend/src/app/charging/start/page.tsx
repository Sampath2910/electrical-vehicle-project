'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  QrCode, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Bike, 
  RefreshCw, 
  MapPin, 
  ArrowRight, 
  BatteryCharging, 
  Cpu, 
  GraduationCap, 
  Sparkles, 
  AlertTriangle, 
  ShieldAlert,
  Smartphone
} from 'lucide-react';
import { useStore } from '@/lib/storeContext';
import { QrScannerModal } from '@/components/ui/QrScannerModal';

function StartChargingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { chargers, vehicles, startChargingSession, playSound } = useStore();

  const preselectedChargerId = searchParams.get('chargerId') || chargers[0]?.id || '';

  const [selectedChargerId, setSelectedChargerId] = useState<string>(preselectedChargerId);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(vehicles[0]?.id || '');
  const [chargeGoal, setChargeGoal] = useState<'80_HEALTH' | '100_FULL' | '15_BOOST'>('80_HEALTH');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [showQrModal, setShowQrModal] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);

  const selectedCharger = chargers.find(c => c.id === selectedChargerId) || chargers[0];
  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId) || vehicles[0];
  const isSwapStation = selectedCharger?.stationType === 'BATTERY_SWAP_STATION';
  const isPriorityBay = selectedCharger?.isPriorityBay || false;

  // Dynamic calculations based on 2-wheeler project scope (1 kW to 3.3 kW)
  const estEnergyKwh = isSwapStation 
    ? (selectedVehicle?.batteryCapacityKwh || 3.4)
    : chargeGoal === '80_HEALTH' 
      ? +((selectedVehicle?.batteryCapacityKwh || 3.7) * 0.6).toFixed(2)
      : chargeGoal === '100_FULL'
        ? +((selectedVehicle?.batteryCapacityKwh || 3.7) * 0.8).toFixed(2)
        : +((selectedVehicle?.batteryCapacityKwh || 3.7) * 0.25).toFixed(2);

  // Billing formula preview: (Energy * ToD Rate) + ₹5 Service Fee + 18% GST
  const energySubtotal = +(estEnergyKwh * (selectedCharger?.pricePerKwh || 10.50)).toFixed(2);
  const serviceFee = 5.00;
  const taxableSubtotal = +(energySubtotal + serviceFee).toFixed(2);
  const gstAmount = +(taxableSubtotal * 0.18).toFixed(2);
  const estCostInr = +(taxableSubtotal + gstAmount).toFixed(2);

  const kmPerKwhFactor = (selectedVehicle?.ridingRangeKm && selectedVehicle?.batteryCapacityKwh) 
    ? (selectedVehicle.ridingRangeKm / selectedVehicle.batteryCapacityKwh) 
    : 38;
  const estRangeAddedKm = Math.round(estEnergyKwh * kmPerKwhFactor);
  // Power strictly limited to 3.3kW for 2-wheelers
  const effectivePowerKw = 3.3;
  const estDurationMins = isSwapStation ? 1 : Math.round((estEnergyKwh / effectivePowerKw) * 60);

  const handleInitiateSession = () => {
    setErrorMessage(null);

    if (selectedCharger.status === 'FAULT' || selectedCharger.status === 'OFFLINE') {
      setErrorMessage(`Cannot start session: Station is currently ${selectedCharger.status}`);
      playSound('alert');
      return;
    }

    // PDF Section 2 Preemption Protocol: Mandatory Digital Consent for Priority/VIP Bays
    if (isPriorityBay) {
      playSound('alert');
      setShowConsentModal(true);
      return;
    }

    setShowQrModal(true);
  };

  const handleAgreeConsent = () => {
    setShowConsentModal(false);
    setShowQrModal(true);
  };

  const handleAuthorizeSuccess = async () => {
    setShowQrModal(false);
    setIsLoading(true);

    try {
      const session = await startChargingSession(
        selectedChargerId, 
        'QR_UPI', 
        selectedVehicleId,
        isPriorityBay
      );
      router.push(`/charging/${session.id}`);
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected authorization error occurred.');
      playSound('alert');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8"
    >
      
      {/* Station Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-semibold border border-cyan-500/30">
          <Zap className="w-4 h-4" />
          <span>Smart EV Station &bull; Single-Phase Contactor & Metrology Authorization</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Authorize Bike Charging / Battery Swap
        </h1>
        <p className="text-xs text-slate-400 max-w-xl mx-auto">
          Select target 2-wheeler bay and authorize via Camera Scan (Dynamic QR / UPI Online Payment).
        </p>
      </div>

      {/* QUICK PRESETS */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-purple-950/40 border border-cyan-500/30 shadow-lg space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>Quick 2-Wheeler & Bay Presets</span>
          </span>
          <span className="text-[10px] text-slate-400">Click any preset to auto-configure:</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button
            type="button"
            onClick={() => {
              const ch = chargers.find(c => c.chargerCode === 'BAY-01-LOCAL') || chargers[0];
              const veh = vehicles.find(v => v.model.includes('Ather')) || vehicles[0];
              setSelectedChargerId(ch.id);
              if (veh) setSelectedVehicleId(veh.id);
              setChargeGoal('80_HEALTH');
              playSound('beep');
            }}
            className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-700 hover:border-cyan-400 text-left transition-all hover:scale-[1.02] group"
          >
            <div className="flex items-center justify-between text-[11px] font-bold text-white mb-0.5">
              <span className="group-hover:text-cyan-400">🛵 Ather 450X (3.7 kWh)</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-mono">BAY #01</span>
            </div>
            <p className="text-[10px] text-slate-400">Local Bay #01 &bull; 80% Health Goal &bull; UPI QR Online</p>
          </button>

          <button
            type="button"
            onClick={() => {
              const ch = chargers.find(c => c.chargerCode === 'BAY-01-LOCAL') || chargers[0];
              const veh = vehicles.find(v => v.model.includes('Ola')) || vehicles[1];
              setSelectedChargerId(ch.id);
              if (veh) setSelectedVehicleId(veh.id);
              setChargeGoal('100_FULL');
              playSound('beep');
            }}
            className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-700 hover:border-emerald-400 text-left transition-all hover:scale-[1.02] group"
          >
            <div className="flex items-center justify-between text-[11px] font-bold text-white mb-0.5">
              <span className="group-hover:text-emerald-400">🛵 Ola S1 Pro (4.0 kWh)</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono">100% FULL</span>
            </div>
            <p className="text-[10px] text-slate-400">Standard ToD Rate (₹10.50/kWh) &bull; Full 195km Range</p>
          </button>

          <button
            type="button"
            onClick={() => {
              const ch = chargers.find(c => c.chargerCode === 'BAY-02-VIP') || chargers[1];
              const veh = vehicles.find(v => v.model.includes('TVS') || v.model.includes('Ather')) || vehicles[0];
              setSelectedChargerId(ch.id);
              if (veh) setSelectedVehicleId(veh.id);
              playSound('beep');
            }}
            className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-700 hover:border-amber-400 text-left transition-all hover:scale-[1.02] group"
          >
            <div className="flex items-center justify-between text-[11px] font-bold text-white mb-0.5">
              <span className="group-hover:text-amber-400">🚑 Priority Bay #02 (VIP)</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono">PREEMPTION</span>
            </div>
            <p className="text-[10px] text-slate-400">Current ToD + ₹8.00 Premium &bull; 120s Eviction Protocol</p>
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* STEP PROGRESSION FLOW */}
      <div className="grid grid-cols-4 gap-2 text-center text-xs">
        <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold">
          1. Select Station
        </div>
        <div className={`p-2 rounded-xl border font-bold ${!isSwapStation ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
          2. Battery Goal
        </div>
        <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold">
          3. UPI QR Pay
        </div>
        <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold">
          4. Latch Relay
        </div>
      </div>

      <div className="glass-card rounded-3xl p-6 lg:p-8 border border-slate-800 bg-slate-900/80 space-y-8 shadow-2xl">
        
        {/* STEP 1: SELECT CHARGER OR BSS HUB */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 text-center text-xs font-bold">1</span>
            <span>Select Target Bike Station (Project Scope: 1 kW to 3.3 kW)</span>
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {chargers.map((c) => {
              const isSwap = c.stationType === 'BATTERY_SWAP_STATION';
              const isSelected = selectedChargerId === c.id;

              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => { setSelectedChargerId(c.id); playSound('beep'); }}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    isSelected 
                      ? (c.isPriorityBay ? 'bg-slate-950 border-amber-400 glow-amber ring-1 ring-amber-500/30' : isSwap ? 'bg-slate-950 border-emerald-400 glow-emerald ring-1 ring-emerald-500/30' : 'bg-slate-950 border-cyan-400 glow-cyan ring-1 ring-cyan-500/30')
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-cyan-400">{c.chargerCode}</span>
                      {c.isPriorityBay && (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          PRIORITY PREEMPTION
                        </span>
                      )}
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.status === 'AVAILABLE' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                      {c.status}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    {isSwap ? <RefreshCw className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> : <Zap className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                    <span>{c.name}</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">{c.location}</p>
                  
                  <div className="mt-2 flex items-center justify-between text-[11px] font-semibold">
                    <span className="text-cyan-300">{c.powerRating} kW &bull; {c.connectorType}</span>
                    <span className="text-emerald-400 font-mono">₹{c.pricePerKwh.toFixed(2)}/kWh</span>
                  </div>

                  {c.isPriorityBay && (
                    <div className="mt-2 text-[10px] text-amber-300 bg-amber-500/10 p-1.5 rounded-lg border border-amber-500/20">
                      ⚡ Surge Rate: Current ToD + ₹8.00/kWh &bull; 120s Eviction Rule Applies
                    </div>
                  )}

                  {isSwap && (
                    <div className="mt-2 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md inline-block">
                      ⚡ {c.availableBatteries} / {c.totalBatterySlots} Packs Ready to Swap
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* STEP 2: SELECT BIKE CHARGING GOAL */}
        {!isSwapStation && (
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 text-center text-xs font-bold">2</span>
              <span>Select Bike Battery Profile (Slow vs. Fast Setpoints)</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setChargeGoal('80_HEALTH')}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  chargeGoal === '80_HEALTH'
                    ? 'border-cyan-400 bg-cyan-500/10 glow-cyan'
                    : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white">80% Health Target</span>
                </div>
                <p className="text-[10px] text-slate-400">Protects cell life and prevents thermal degradation on daily commutes.</p>
              </button>

              <button
                type="button"
                onClick={() => setChargeGoal('100_FULL')}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  chargeGoal === '100_FULL'
                    ? 'border-cyan-400 bg-cyan-500/10 glow-cyan'
                    : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <BatteryCharging className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-white">100% Full Range</span>
                </div>
                <p className="text-[10px] text-slate-400">Maximizes riding distance for highway tours and long inter-city rides.</p>
              </button>

              <button
                type="button"
                onClick={() => setChargeGoal('15_BOOST')}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  chargeGoal === '15_BOOST'
                    ? 'border-cyan-400 bg-cyan-500/10 glow-cyan'
                    : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-white">Fast 2.0 - 3.3 kW Boost</span>
                </div>
                <p className="text-[10px] text-slate-400">High power 14.3A draw on single-phase 230V. Takes 1–2 hours.</p>
              </button>
            </div>
          </div>
        )}

        {/* LIVE SESSION ESTIMATE & TELEMETRY PREVIEW (SECTION 6 BILLING FORMULA) */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-cyan-500/20 shadow-inner space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-200 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Projected Billing (Formula: kWh &times; Rate + ₹5 Fee + 18% GST)</span>
            </span>
            <span className="text-[10px] text-cyan-400 font-mono">
              Vehicle: {selectedVehicle?.model || 'Indian EV 2-Wheeler'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
              <span className="text-[9px] text-slate-400 uppercase font-semibold block">Energy Needed</span>
              <span className="text-sm font-extrabold text-cyan-400 font-mono">{estEnergyKwh} kWh</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
              <span className="text-[9px] text-slate-400 uppercase font-semibold block">Estimated Total</span>
              <span className="text-sm font-extrabold text-emerald-400 font-mono">₹{estCostInr.toFixed(2)}</span>
              <span className="text-[8px] text-slate-500 block">incl. ₹5 fee + 18% GST</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
              <span className="text-[9px] text-slate-400 uppercase font-semibold block">Added Range</span>
              <span className="text-sm font-extrabold text-blue-400 font-mono">+{estRangeAddedKm} km</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
              <span className="text-[9px] text-slate-400 uppercase font-semibold block">Max Current Draw</span>
              <span className="text-sm font-extrabold text-amber-400 font-mono">14.3 A @ 230V</span>
            </div>
          </div>
        </div>

        {/* STEP 3: AUTHORIZATION METHOD (ONLINE UPI / QR CODE) */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 text-center text-xs font-bold">
              {isSwapStation ? '2' : '3'}
            </span>
            <span>Online Authorization & Payment Gateway</span>
          </label>

          <div className="p-4 rounded-2xl border border-cyan-400 bg-cyan-500/10 glow-cyan">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-blue-500/20 text-cyan-400 border border-blue-400">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Scan & Charge (QR / UPI Online Payment)</h4>
                <span className="text-[10px] text-cyan-400 font-semibold">Web Camera & UPI Gateway &bull; Google Pay / PhonePe / Paytm</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Instant mobile payment authorization via camera scan. The cloud verifies payment and latches ESP32 GPIO 26 relay without any RFID card requirement.
            </p>
          </div>
        </div>

        {/* STEP 4: SELECT REGISTERED 2-WHEELER */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
            <Bike className="w-4 h-4 text-cyan-400" />
            <span>Select Indian Electric Two-Wheeler</span>
          </label>
          <select
            value={selectedVehicleId}
            onChange={(e) => setSelectedVehicleId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-cyan-400"
          >
            {vehicles.map(v => (
              <option key={v.id} value={v.id}>
                {v.model} &bull; {v.registration} ({v.batteryCapacityKwh} kWh &bull; {v.connectorType})
              </option>
            ))}
          </select>
        </div>

        {/* EEE HARDWARE PIN STATUS CALLOUT */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>Hardware Action: <strong>GPIO 26 Relay Driver</strong> latches on server authorization. Sampled by <strong>PZEM-004T</strong>.</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400">Safe Isolation (PC817 Optocoupler)</span>
        </div>

        {/* AUTHORIZE & SUBMIT BUTTON */}
        <div className="pt-2">
          <button
            type="button"
            disabled={isLoading || selectedCharger.status !== 'AVAILABLE'}
            onClick={handleInitiateSession}
            className={`w-full py-4 rounded-2xl font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-3 shadow-xl transition-all hover:scale-[1.01] disabled:opacity-50 ${
              isPriorityBay 
                ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 shadow-amber-500/25' 
                : isSwapStation 
                  ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 text-slate-950 shadow-emerald-500/25'
                  : 'bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-400 text-slate-950 shadow-cyan-500/20'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Activating ESP32 Contactor...</span>
              </>
            ) : (
              <>
                <Smartphone className="w-5 h-5" />
                <span>
                  {isPriorityBay 
                    ? 'Review Priority Consent & Launch UPI Pay' 
                    : isSwapStation 
                      ? 'Launch QR Scan & Swap' 
                      : 'Launch Camera Scan & Charge (UPI)'}
                </span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* PDF SECTION 2: DIGITAL CONSENT MODAL FOR PRIORITY / VIP BAYS */}
      <AnimatePresence>
        {showConsentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-950 border-2 border-amber-500 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl shadow-amber-500/20"
            >
              <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
                  <ShieldAlert className="w-7 h-7 animate-pulse" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Section 2 Priority Preemption Rule</span>
                  <h3 className="text-lg font-extrabold text-white">Digital Consent Agreement</h3>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs sm:text-sm leading-relaxed space-y-3">
                <p className="font-bold text-white">
                  &ldquo;Warning: This is a Priority Reserved Bay. You are paying a premium rate. If an emergency vehicle arrives, you must unplug within 120 seconds, or face a ₹500 penalty.&rdquo;
                </p>
                <div className="space-y-1.5 text-xs text-amber-300/90 pt-2 border-t border-amber-500/20">
                  <p>&bull; <strong>Premium Rate:</strong> Current ToD Rate + ₹8.00/kWh Premium applied.</p>
                  <p>&bull; <strong>Eviction Sequence:</strong> ESP32 buzzer beeps rapidly &amp; red &ldquo;VACATE IMMEDIATELY&rdquo; flashes.</p>
                  <p>&bull; <strong>Auto-Cutoff:</strong> If not unplugged after 120s, relay trips and ₹500 fee is added to final invoice.</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConsentModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleAgreeConsent}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold uppercase tracking-wider shadow-lg shadow-amber-500/25 transition-all"
                >
                  Agree &amp; Proceed to UPI
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* QR SCANNER SIMULATOR MODAL */}
      <QrScannerModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        onScanSuccess={handleAuthorizeSuccess}
        chargerName={selectedCharger.name}
        chargerCode={selectedCharger.chargerCode}
      />

    </motion.div>
  );
}

export default function StartChargingPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading charging authorization gateway...</div>}>
      <StartChargingContent />
    </Suspense>
  );
}
