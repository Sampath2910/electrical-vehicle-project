'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { 
  Bike, 
  Plus, 
  ShieldCheck, 
  Zap, 
  Battery, 
  Gauge, 
  Sparkles, 
  Check, 
  RefreshCw,
  Compass
} from 'lucide-react';
import { useStore } from '@/lib/storeContext';

interface EVBikePreset {
  model: string;
  brand: string;
  batteryCapacityKwh: number;
  connectorType: 'IEC 60309 (Industrial 3-pin)' | 'Standard 16A Socket' | 'LEV AC (IS 17017)' | 'BSS Swappable Dock';
  rangeKm: number;
  maxPowerKw: number;
  image: string;
  vehicleType: 'MOTORCYCLE' | 'SCOOTER' | 'DELIVERY_BIKE';
  isBatterySwappable: boolean;
}

// PDF Page 3 Presets: Ather 450X (3.7 kWh), Ola S1 Pro (4 kWh), TVS iQube (3.4 kWh), Ultraviolette F77 (10.3 kWh)
const PRESET_BIKES: EVBikePreset[] = [
  {
    model: 'Ather 450X Gen 3',
    brand: 'Ather Energy',
    batteryCapacityKwh: 3.7,
    connectorType: 'IEC 60309 (Industrial 3-pin)',
    rangeKm: 146,
    maxPowerKw: 3.3,
    image: '/images/ev_scooter_charging.jpg',
    vehicleType: 'SCOOTER',
    isBatterySwappable: false,
  },
  {
    model: 'Ola S1 Pro Gen 2',
    brand: 'Ola Electric',
    batteryCapacityKwh: 4.0,
    connectorType: 'Standard 16A Socket',
    rangeKm: 195,
    maxPowerKw: 3.3,
    image: '/images/ev_urban_bike.jpg',
    vehicleType: 'SCOOTER',
    isBatterySwappable: false,
  },
  {
    model: 'TVS iQube S',
    brand: 'TVS Motor Company',
    batteryCapacityKwh: 3.4,
    connectorType: 'Standard 16A Socket',
    rangeKm: 100,
    maxPowerKw: 1.5,
    image: '/images/ev_scooter_charging.jpg',
    vehicleType: 'SCOOTER',
    isBatterySwappable: false,
  },
  {
    model: 'Ultraviolette F77 Mach 2',
    brand: 'Ultraviolette Automotive',
    batteryCapacityKwh: 10.3,
    connectorType: 'LEV AC (IS 17017)',
    rangeKm: 307,
    maxPowerKw: 3.3,
    image: '/images/ev_bike_superbike.jpg',
    vehicleType: 'MOTORCYCLE',
    isBatterySwappable: false,
  },
];

export default function VehiclesPage() {
  const { vehicles, addVehicle } = useStore();
  const [model, setModel] = useState('');
  const [registration, setRegistration] = useState('');
  const [connectorType, setConnectorType] = useState<'IEC 60309 (Industrial 3-pin)' | 'Standard 16A Socket' | 'LEV AC (IS 17017)' | 'BSS Swappable Dock'>('IEC 60309 (Industrial 3-pin)');
  const [batteryCapacity, setBatteryCapacity] = useState<number>(3.7);
  const [vehicleType, setVehicleType] = useState<'MOTORCYCLE' | 'SCOOTER' | 'DELIVERY_BIKE'>('SCOOTER');
  const [isSwappable, setIsSwappable] = useState(false);
  const [selectedPresetImage, setSelectedPresetImage] = useState<string>('/images/ev_scooter_charging.jpg');
  const [showAddModal, setShowAddModal] = useState(false);

  const handleSelectPreset = (preset: EVBikePreset) => {
    setModel(preset.model);
    setConnectorType(preset.connectorType);
    setBatteryCapacity(preset.batteryCapacityKwh);
    setSelectedPresetImage(preset.image);
    setVehicleType(preset.vehicleType);
    setIsSwappable(preset.isBatterySwappable);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!model || !registration) return;
    addVehicle({
      model,
      registration,
      connectorType,
      batteryCapacityKwh: batteryCapacity,
      vehicleType,
      isBatterySwappable: isSwappable,
      imageUrl: selectedPresetImage,
    });
    setModel('');
    setRegistration('');
    setShowAddModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* HEADER ROW */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-semibold text-cyan-400 mb-2">
            <Bike className="w-3.5 h-3.5" />
            <span>2-Wheeler Fleet Profile (PDF Scope: 1 kW to 3.3 kW)</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Indian Electric 2-Wheeler Garage
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Calibrated for Ather 450X, Ola S1 Pro, TVS iQube, and Ultraviolette F77. Restricts charging currents to max 14.3A single-phase 230V per project specifications.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs uppercase tracking-wider flex items-center gap-2.5 transition-all shadow-lg shadow-cyan-500/25 hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Register New EV 2-Wheeler</span>
        </button>
      </div>

      {/* REGISTERED VEHICLES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {vehicles.map((v, index) => {
          const bikeImage = v.imageUrl || (index % 4 === 0 
            ? '/images/ev_scooter_charging.jpg' 
            : index % 4 === 1 
              ? '/images/ev_urban_bike.jpg' 
              : index % 4 === 2
                ? '/images/ev_bike_superbike.jpg'
                : '/images/ev_battery_swap.jpg');

          return (
            <div 
              key={v.id} 
              className="glass-card glass-card-hover rounded-3xl overflow-hidden border border-slate-800 bg-slate-900/80 flex flex-col justify-between group shadow-xl"
            >
              {/* Bike Image Header */}
              <div className="relative h-52 w-full bg-slate-950 flex items-center justify-center overflow-hidden border-b border-slate-800">
                <Image
                  src={bikeImage}
                  alt={v.model}
                  width={420}
                  height={240}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-85" />
                
                <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700 text-cyan-400 font-mono font-bold text-xs backdrop-blur-md">
                  {v.registration}
                </div>

                {v.isBatterySwappable && (
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-emerald-500/90 text-slate-950 font-extrabold text-[10px] flex items-center gap-1 shadow-md">
                    <RefreshCw className="w-3 h-3" />
                    <span>SWAPPABLE PACK</span>
                  </div>
                )}

                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
                  <h3 className="text-lg font-extrabold tracking-tight">{v.model}</h3>
                  <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-[10px] font-mono font-bold uppercase truncate max-w-[150px]">
                    {v.connectorType}
                  </span>
                </div>
              </div>

              {/* Specs & Data */}
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Battery Capacity</span>
                    <span className="text-base font-extrabold text-white font-mono">{v.batteryCapacityKwh} kWh</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Charging Scope</span>
                    <span className="text-base font-extrabold text-cyan-400 font-mono">
                      Max 3.3 kW (14.3A)
                    </span>
                  </div>
                </div>

                {v.ridingModes && (
                  <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-[11px] space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block flex items-center gap-1">
                      <Compass className="w-3 text-cyan-400" />
                      <span>Range Modes</span>
                    </span>
                    <div className="flex items-center justify-between text-xs font-mono font-bold pt-1">
                      <span className="text-emerald-400">Eco: {v.ridingModes.eco}km</span>
                      <span className="text-cyan-400">Ride: {v.ridingModes.ride}km</span>
                      <span className="text-amber-400">Sport: {v.ridingModes.sport}km</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800 text-slate-400">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <ShieldCheck className="w-4 h-4" />
                    <span>230V 1Φ (≤14.3A) Calibrated</span>
                  </span>
                  <span className="font-mono text-[11px]">Plate Verified</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ADD VEHICLE MODAL WITH REAL 2W PRESETS */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xl p-4 overflow-y-auto">
          <div className="glass-card rounded-3xl p-6 sm:p-8 w-full max-w-xl border border-slate-700 bg-slate-900 shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-extrabold text-white">Register Indian Electric 2-Wheeler</h3>
                <p className="text-xs text-slate-400 mt-1">Select Ather 450X, Ola S1 Pro, TVS iQube, or custom specs</p>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* PRESETS CAROUSEL */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">Indian 2-Wheeler Presets (PDF Scope)</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {PRESET_BIKES.map((preset) => (
                  <button
                    key={preset.model}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-2 rounded-2xl border text-left transition-all ${
                      model === preset.model 
                        ? 'border-cyan-400 bg-cyan-500/10 glow-cyan' 
                        : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                    }`}
                  >
                    <div className="relative h-16 w-full rounded-xl overflow-hidden mb-1.5">
                      <Image src={preset.image} alt={preset.model} fill className="object-cover" />
                    </div>
                    <span className="text-[11px] font-bold text-white block truncate">{preset.model}</span>
                    <span className="text-[9px] text-slate-400 block truncate">{preset.batteryCapacityKwh} kWh • {preset.rangeKm}km</span>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleAdd} className="space-y-4 pt-2">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">EV Bike / Scooter Model</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ather 450X Gen 3 / Ola S1 Pro"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-cyan-400 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Registration Plate Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. KA-01-EV-2026"
                  value={registration}
                  onChange={(e) => setRegistration(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white uppercase font-mono tracking-wider focus:border-cyan-400 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Connector Standard</label>
                  <select
                    value={connectorType}
                    onChange={(e: any) => setConnectorType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:border-cyan-400 outline-none"
                  >
                    <option value="IEC 60309 (Industrial 3-pin)">IEC 60309 (Industrial 3-pin)</option>
                    <option value="Standard 16A Socket">Standard 16A Socket</option>
                    <option value="LEV AC (IS 17017)">LEV AC (IS 17017)</option>
                    <option value="BSS Swappable Dock">BSS Swappable Dock</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Battery Capacity (kWh)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={batteryCapacity}
                    onChange={(e) => setBatteryCapacity(+e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white font-mono focus:border-cyan-400 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isSwappable}
                    onChange={(e) => setIsSwappable(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-700 text-cyan-400 focus:ring-0"
                  />
                  <span>Has Removable / Swappable Battery Pack</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 rounded-xl text-slate-400 hover:text-white text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-lg transition-all"
                >
                  Save Electric 2-Wheeler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
