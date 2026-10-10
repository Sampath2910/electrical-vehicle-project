'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Search, 
  MapPin, 
  Zap, 
  Filter, 
  SlidersHorizontal, 
  Navigation, 
  CheckCircle2, 
  AlertTriangle, 
  WifiOff,
  Map,
  List,
  Bike,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { useStore } from '@/lib/storeContext';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ChargerStatus } from '@/types/ev';

export default function ChargersPage() {
  const { chargers, currentUser } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [stationTypeFilter, setStationTypeFilter] = useState<'ALL' | 'PLUG' | 'SWAP'>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [powerFilter, setPowerFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  const isOperator = currentUser?.role === 'OPERATOR';
  const assignedStationId = currentUser?.assignedStationId;

  const filteredChargers = chargers.filter(charger => {
    const matchesSearch = charger.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          charger.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          charger.chargerCode.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || charger.status === statusFilter;
    
    let matchesType = true;
    if (stationTypeFilter === 'PLUG') matchesType = charger.stationType !== 'BATTERY_SWAP_STATION';
    if (stationTypeFilter === 'SWAP') matchesType = charger.stationType === 'BATTERY_SWAP_STATION';

    let matchesPower = true;
    if (powerFilter === 'AC') matchesPower = charger.powerRating <= 7.4;
    if (powerFilter === 'DC') matchesPower = charger.powerRating > 7.4;

    return matchesSearch && matchesStatus && matchesType && matchesPower;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-semibold text-cyan-400 mb-2">
            <Bike className="w-3.5 h-3.5" />
            <span>2-Wheeler Regional Energy Network</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Find EV Bike Chargers & Swap Stations</h1>
          <p className="text-slate-400 text-xs mt-1">Discover available 15A/16A points, LEV DC fast chargers, and 60-second automated Battery Swapping Hubs (BSS).</p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800 w-fit">
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === 'list' ? 'bg-cyan-500 text-slate-950 shadow-md font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <List className="w-4 h-4" />
            <span>List View</span>
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === 'map' ? 'bg-cyan-500 text-slate-950 shadow-md font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Map className="w-4 h-4" />
            <span>Map View</span>
          </button>
        </div>
      </div>

      {/* Operator Scope Notice Banner */}
      {isOperator && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-lg shrink-0">
              ⚡
            </div>
            <div>
              <div className="text-sm font-bold text-white flex flex-wrap items-center gap-2">
                <span>Station Operator Mode</span>
                <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-xs font-mono font-bold border border-amber-500/30">
                  {chargers.find(c => c.id === assignedStationId || c.chargerCode === assignedStationId)?.name || assignedStationId}
                </span>
                <span className="text-xs text-amber-400 font-medium font-mono">({assignedStationId})</span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                You have full control permissions exclusively over your assigned station. Other stations in the fleet are locked and restricted.
              </p>
            </div>
          </div>
          <Link
            href="/operator"
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md shrink-0 flex items-center gap-1.5"
          >
            <span>Open Station Console</span>
            <span>&rarr;</span>
          </Link>
        </div>
      )}

      {/* Station Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setStationTypeFilter('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            stationTypeFilter === 'ALL'
              ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
              : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>All Two-Wheeler Stations ({chargers.length})</span>
        </button>

        <button
          onClick={() => setStationTypeFilter('PLUG')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            stationTypeFilter === 'PLUG'
              ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
              : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
          }`}
        >
          <Bike className="w-4 h-4" />
          <span>Plug Chargers (15A / 16A / LEV DC)</span>
        </button>

        <button
          onClick={() => setStationTypeFilter('SWAP')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            stationTypeFilter === 'SWAP'
              ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
              : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
          }`}
        >
          <RefreshCw className="w-4 h-4" />
          <span>Battery Swapping Hubs (BSS)</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-card rounded-2xl p-4 border border-slate-800 bg-slate-900/80 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          
          {/* Search Bar */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by station code, bike park, or area..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          {/* Status Filter Dropdown */}
          <div className="md:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="AVAILABLE">AVAILABLE ONLY</option>
              <option value="CHARGING">CHARGING IN PROGRESS</option>
              <option value="CONNECTED">CONNECTED</option>
              <option value="FAULT">FAULT / SAFETY ALERT</option>
              <option value="OFFLINE">OFFLINE</option>
            </select>
          </div>

          {/* Power Rating Filter */}
          <div className="md:col-span-3">
            <select
              value={powerFilter}
              onChange={(e) => setPowerFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Power Rates</option>
              <option value="AC">Slow/Standard (0.5 - 1.5 kW 2W)</option>
              <option value="DC">Fast Charging (2.0 - 3.3 kW 2W)</option>
            </select>
          </div>

        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'list' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChargers.length === 0 ? (
            <div className="col-span-full glass-card rounded-3xl p-12 text-center border border-slate-800 space-y-3">
              <Zap className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">No 2-Wheeler Stations Found</h3>
              <p className="text-xs text-slate-400">Try adjusting your filters or search keywords.</p>
            </div>
          ) : (
            filteredChargers.map((charger) => {
              const isSwap = charger.stationType === 'BATTERY_SWAP_STATION';
              const isOwnStation = isOperator && (charger.id === assignedStationId || charger.chargerCode === assignedStationId);
              const isOtherStationRestricted = isOperator && !isOwnStation;

              let cardStyles = 'border-slate-800 bg-slate-900/70';
              if (isOwnStation) {
                cardStyles = 'border-amber-500/60 bg-gradient-to-b from-navy-900/95 to-amber-950/20 shadow-xl shadow-amber-500/10 ring-1 ring-amber-500/40';
              } else if (isOtherStationRestricted) {
                cardStyles = 'border-slate-800/80 bg-slate-950/40 opacity-75';
              } else if (isSwap) {
                cardStyles = 'border-emerald-500/40 bg-slate-900/80 shadow-emerald-500/5';
              }

              return (
                <div 
                  key={charger.id} 
                  className={`glass-card rounded-2xl p-6 border flex flex-col justify-between transition-all ${cardStyles}`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-mono font-bold ${
                          isOwnStation ? 'text-amber-400' : isOtherStationRestricted ? 'text-slate-500' : 'text-cyan-400'
                        }`}>
                          {charger.chargerCode}
                        </span>
                        {isOwnStation && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[9px] font-mono font-bold border border-amber-500/30">
                            ★ YOUR STATION
                          </span>
                        )}
                        {isOtherStationRestricted && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[9px] font-mono font-semibold">
                            🔒 RESTRICTED
                          </span>
                        )}
                        {isSwap && !isOtherStationRestricted && !isOwnStation && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[9px] font-mono font-bold">
                            BSS SWAP HUB
                          </span>
                        )}
                      </div>
                      <StatusBadge status={charger.status} size="sm" />
                    </div>

                    <h3 className="text-base font-extrabold text-white mb-1">{charger.name}</h3>
                    <p className="text-xs text-slate-400 flex items-start gap-1.5 mb-4">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{charger.location}</span>
                    </p>

                    {isSwap && (
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center justify-between mb-4">
                        <span className="flex items-center gap-1.5">
                          <RefreshCw className="w-4 h-4 animate-spin-slow" />
                          <span>Packs Ready to Swap</span>
                        </span>
                        <span className="font-mono font-bold text-sm text-emerald-300">{charger.availableBatteries} / {charger.totalBatterySlots}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-800 my-4 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 block font-semibold">Power</span>
                        <span className="font-bold text-white font-mono">{charger.powerRating} kW</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block font-semibold">Connector</span>
                        <span className="font-bold text-cyan-300 truncate block">{charger.connectorType}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block font-semibold">Rate</span>
                        <span className="font-bold text-emerald-400 font-mono">₹{charger.pricePerKwh.toFixed(2)}/kWh</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="text-[10px] text-slate-500">
                      Voltage: <span className="font-mono text-slate-400">{charger.voltageV}V (1Φ)</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {isOwnStation ? (
                        <Link
                          href="/operator"
                          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
                        >
                          <span>Manage Console &rarr;</span>
                        </Link>
                      ) : isOtherStationRestricted ? (
                        <div
                          title="Access restricted: You do not operate this station"
                          className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 text-xs font-semibold flex items-center gap-1.5 cursor-not-allowed select-none"
                        >
                          <span>🔒 Restricted (Other Station)</span>
                        </div>
                      ) : (
                        <>
                          <Link
                            href={`/chargers/${charger.id}`}
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                          >
                            Details
                          </Link>

                          {charger.status === 'AVAILABLE' && (
                            <Link
                              href={`/charging/start?chargerId=${charger.id}`}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md ${
                                isSwap 
                                  ? 'bg-emerald-400 hover:bg-emerald-300 text-slate-950' 
                                  : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
                              }`}
                            >
                              {isSwap ? 'Swap Pack' : 'Charge Bike'}
                            </Link>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* SIMULATED MAP VIEW FOR 2-WHEELER HUBS */
        <div className="glass-card rounded-3xl p-6 border border-slate-800 bg-slate-900/60 h-[500px] relative overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 bg-[radial-gradient(#06b6d415_1px,transparent_1px)] [background-size:20px_20px] opacity-40" />
          
          <div className="relative text-center space-y-3 z-10 max-w-md p-6 rounded-2xl bg-slate-950/90 border border-slate-800 shadow-2xl">
            <Bike className="w-10 h-10 text-cyan-400 mx-auto animate-bounce" />
            <h3 className="text-base font-bold text-white">2-Wheeler Regional Station Map</h3>
            <p className="text-xs text-slate-400">Displaying {filteredChargers.length} active bike plug points and battery swap kiosks with real-time availability.</p>
            <div className="flex flex-wrap gap-2 justify-center pt-2">
              {filteredChargers.map(c => {
                const isOwn = isOperator && (c.id === assignedStationId || c.chargerCode === assignedStationId);
                const isOther = isOperator && !isOwn;

                if (isOther) {
                  return (
                    <span
                      key={c.id}
                      title="Restricted: You do not operate this station"
                      className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-600 cursor-not-allowed flex items-center gap-1"
                    >
                      🔒 {c.chargerCode} (Restricted)
                    </span>
                  );
                }

                if (isOwn) {
                  return (
                    <Link
                      key={c.id}
                      href="/operator"
                      className="px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 hover:border-amber-400 text-[11px] font-mono text-amber-300 font-bold flex items-center gap-1"
                    >
                      ★ {c.chargerCode} (Manage Console)
                    </Link>
                  );
                }

                return (
                  <Link
                    key={c.id}
                    href={`/chargers/${c.id}`}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-400 text-[11px] font-mono text-cyan-300"
                  >
                    📍 {c.chargerCode} ({c.stationType === 'BATTERY_SWAP_STATION' ? 'BSS Swap' : 'Plug'})
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
