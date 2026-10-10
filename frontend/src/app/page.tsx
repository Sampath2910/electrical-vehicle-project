'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Zap, 
  ShieldCheck, 
  QrCode, 
  CreditCard, 
  Activity, 
  MapPin, 
  ArrowRight, 
  Smartphone, 
  BatteryCharging,
  Cpu,
  BarChart3,
  CheckCircle2,
  Sparkles,
  Gauge,
  Clock,
  Bike,
  RefreshCw,
  Flame,
  Layers,
  GraduationCap,
  Terminal,
  BookOpen,
  AlertTriangle
} from 'lucide-react';
import { useStore } from '@/lib/storeContext';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EvBikeChargingVisual } from '@/components/ui/EvBikeChargingVisual';
import { EeeHardwareBench } from '@/components/ui/EeeHardwareBench';
import { BikeRangeCalculator } from '@/components/ui/BikeRangeCalculator';

const REAL_EV_BIKE_SHOWCASE = [
  {
    name: 'Ather 450X Gen 3',
    category: 'Smart Connected E-Scooter',
    image: '/images/ev_scooter_charging.jpg',
    battery: '3.7 kWh Lithium-Ion',
    maxCharge: '3.3 kW IEC 60309 (14.3A)',
    chargeTime: '1.2 Hours (0-80%)',
    range: '146 km TrueRange',
    speed: 'Warp+ 90 km/h Mode',
  },
  {
    name: 'Ola S1 Pro Gen 2',
    category: 'Flagship Performance Scooter',
    image: '/images/ev_urban_bike.jpg',
    battery: '4.0 kWh Advanced Pack',
    maxCharge: 'Standard 16A Socket / LEV AC',
    chargeTime: '1.5 Hours (0-80%)',
    range: '195 km Certified Range',
    speed: '120 km/h Hyper Mode',
  },
  {
    name: 'TVS iQube S',
    category: 'Urban Commuter Smart EV',
    image: '/images/ev_scooter_charging.jpg',
    battery: '3.4 kWh Dual Li-Ion',
    maxCharge: 'Standard 16A Socket (10A draw)',
    chargeTime: '2.5 Hours (0-80%)',
    range: '100 km Eco Mode',
    speed: '78 km/h Top Speed',
  },
  {
    name: 'Ultraviolette F77 Mach 2',
    category: 'High-Performance Electric Motorcycle',
    image: '/images/ev_bike_superbike.jpg',
    battery: '10.3 kWh SRB7 Pack',
    maxCharge: '3.3 kW AC / LEV Fast DC',
    chargeTime: '2.0 Hours (Fast AC)',
    range: '307 km IDC Range',
    speed: '155 km/h Top Speed',
  },
];

export default function HomePage() {
  const router = useRouter();
  const { chargers, currentUser } = useStore();

  useEffect(() => {
    if (!currentUser) {
      router.replace('/auth/login');
    } else if (currentUser.role === 'OPERATOR') {
      router.replace('/operator');
    } else if (currentUser.role === 'ADMIN') {
      router.replace('/admin');
    }
  }, [currentUser, router]);

  if (!currentUser) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-9 h-9 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-medium">Redirecting to Smart EV Sign In Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-24 pb-24">

      {/* HERO SECTION WITH REAL EV BIKE VISUAL */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:pt-12 lg:pb-24 px-4 sm:px-6 lg:px-8">
        
        {/* Glow backdrop effects */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-cyan-500/20 via-blue-600/15 to-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-semibold text-emerald-400 glow-emerald">
              <Bike className="w-4 h-4 text-emerald-400" />
              <span>Smart EV 2-Wheeler Charging Station (1 kW - 3.3 kW)</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.2]">
              Smart EV Charging Station:{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-emerald-400 to-amber-300 bg-clip-text text-transparent">
                Time-of-Day Tariff & Priority Preemption
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Commercial-grade smart charging platform for electric 2-wheelers. Conforms to Indian commercial EV tariff LT-6 structure (Off-Peak ₹8.00, Standard ₹10.50, Peak ₹14.00/kWh), 120-second emergency preemption eviction sequence, PZEM-004T precision AC power quality metrology (THD &lt; 5%, sag/swell alert), and seamless <strong>Dynamic QR / Online UPI payment</strong>.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                href="/charging/start"
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 via-cyan-500 to-blue-600 hover:from-emerald-300 hover:to-blue-500 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-cyan-500/25 transition-all hover:scale-[1.02]"
              >
                <Zap className="w-4 h-4 stroke-[2.5]" />
                <span>Launch QR / UPI Charging Demo</span>
              </Link>

              <Link
                href="/chargers"
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl glass-card border border-slate-700 hover:border-cyan-400 text-white font-semibold text-sm flex items-center justify-center gap-2.5 transition-all hover:bg-slate-800/80"
              >
                <MapPin className="w-4 h-4 text-cyan-400" />
                <span>Explore Local Bays & Tariffs</span>
              </Link>
            </div>

            {/* Key EEE Engineering Metrics */}
            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-slate-800/80 max-w-lg mx-auto lg:mx-0">
              <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-center lg:text-left">
                <span className="text-xl font-extrabold text-white block font-mono">14.3 A</span>
                <span className="text-[10px] text-slate-400 font-medium">Max 2W Limit @ 230V</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-center lg:text-left">
                <span className="text-xl font-extrabold text-cyan-400 block font-mono">3.3 kW</span>
                <span className="text-[10px] text-slate-400 font-medium">Academic Project Scope</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-center lg:text-left">
                <span className="text-xl font-extrabold text-emerald-400 block font-mono">120s</span>
                <span className="text-[10px] text-slate-400 font-medium">Preemption Eviction</span>
              </div>
            </div>

          </div>

          {/* ANIMATED EV BIKE DRIVING & CHARGING HERO VISUAL */}
          <div className="lg:col-span-6 relative">
            <EvBikeChargingVisual />
          </div>

        </div>
      </section>

      {/* EEE HARDWARE TEST BENCH & POWER QUALITY MONITORING */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <EeeHardwareBench />
      </section>

      {/* REAL ELECTRIC TWO-WHEELER FLEET SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-semibold text-cyan-400 mb-2">
              <Bike className="w-3.5 h-3.5" />
              <span>Project Target Fleet (2-Wheeler Scope)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Calibrated for Indian Electric 2-Wheelers
            </h2>
            <p className="text-slate-400 text-xs mt-1">
              Supports IEC 60309 (Industrial 3-pin), Standard 16A Socket, and LEV AC (IS 17017) connectors up to 3.3 kW single-phase.
            </p>
          </div>

          <Link 
            href="/vehicles" 
            className="text-xs font-extrabold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 uppercase tracking-wider"
          >
            <span>Open Vehicle Garage</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {REAL_EV_BIKE_SHOWCASE.map((ev) => (
            <div 
              key={ev.name} 
              className="glass-card glass-card-hover rounded-3xl overflow-hidden border border-slate-800 bg-slate-900/80 flex flex-col justify-between group shadow-xl"
            >
              <div className="relative h-48 w-full bg-slate-950 flex items-center justify-center overflow-hidden border-b border-slate-800">
                <Image
                  src={ev.image}
                  alt={ev.name}
                  width={450}
                  height={260}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700 text-slate-300 text-[10px] font-semibold backdrop-blur-md">
                  {ev.category}
                </div>
              </div>

              <div className="p-5 space-y-4">
                <h3 className="text-base font-extrabold text-white tracking-tight">{ev.name}</h3>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-[9px] text-slate-400 uppercase font-bold block">Battery Capacity</span>
                    <span className="text-xs font-extrabold text-white font-mono">{ev.battery}</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-[9px] text-slate-400 uppercase font-bold block">Connector Standard</span>
                    <span className="text-[11px] font-bold text-cyan-400 font-mono truncate block">{ev.maxCharge}</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-[9px] text-slate-400 uppercase font-bold block">Full Charge Time</span>
                    <span className="text-xs font-extrabold text-emerald-400 font-mono">{ev.chargeTime}</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-[9px] text-slate-400 uppercase font-bold block">Estimated Range</span>
                    <span className="text-xs font-extrabold text-blue-400 font-mono">{ev.range}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* INTERACTIVE BIKE RANGE, COST & PETROL SAVINGS CALCULATOR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BikeRangeCalculator />
      </section>

      {/* SECTION 1 & 2 SPECIFICATIONS: TOD TARIFFS & PRIORITY PREEMPTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Card 1: Time-of-Day Tariff Structure (Page 1) */}
          <div className="glass-card rounded-3xl p-8 border border-cyan-500/30 bg-slate-900/80 shadow-2xl flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-bold text-cyan-300">
                <Clock className="w-4 h-4" />
                <span>SECTION 1: TIME-OF-DAY (TOD) TARIFFS</span>
              </div>
              <h3 className="text-2xl font-extrabold text-white tracking-tight">
                Commercial LT-6 Dynamic Pricing
              </h3>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                Base prices structured on commercial public EV tariffs (LT-6 benchmark, markup for retail public charging) to shape EV grid load:
              </p>
              
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-emerald-400 block">Off-Peak (10:00 PM – 06:00 AM)</span>
                    <span className="text-[11px] text-slate-400">Encourage overnight charging when grid demand is lowest</span>
                  </div>
                  <span className="text-base font-mono font-extrabold text-emerald-400">₹8.00/kWh</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-cyan-400 block">Standard (06:00 AM – 06:00 PM)</span>
                    <span className="text-[11px] text-slate-400">Standard daytime rate during solar-generation hours</span>
                  </div>
                  <span className="text-base font-mono font-extrabold text-cyan-400">₹10.50/kWh</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-rose-400 block">Peak Surcharge (06:00 PM – 10:00 PM)</span>
                    <span className="text-[11px] text-slate-400">Heavy surcharge during evening domestic peak demand</span>
                  </div>
                  <span className="text-base font-mono font-extrabold text-rose-400">₹14.00/kWh</span>
                </div>
              </div>
            </div>

            <Link
              href="/charging/start"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition-all"
            >
              <span>Scan QR & Start Charging Session</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Card 2: Priority Preemption Protocol (Page 2) */}
          <div className="glass-card rounded-3xl p-8 border border-amber-500/30 bg-slate-900/80 shadow-2xl flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs font-bold text-amber-400">
                <AlertTriangle className="w-4 h-4" />
                <span>SECTION 2: PRIORITY PREEMPTION PROTOCOL</span>
              </div>
              <h3 className="text-2xl font-extrabold text-white tracking-tight">
                Emergency / VIP Bay #02 Eviction Logic
              </h3>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                Permits public access to an emergency slot with an eviction condition known in engineering as <strong>Priority Preemption</strong>:
              </p>
              
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-amber-400 block">Surge Premium Rate</span>
                    <span className="text-[11px] text-slate-400">Current ToD Rate + ₹8.00/kWh premium deterrent</span>
                  </div>
                  <span className="text-base font-mono font-extrabold text-amber-400">ToD + ₹8.00</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
                  <span className="font-bold text-cyan-300 block">Digital Consent Pop-Up</span>
                  <span className="text-[11px] text-slate-400">Mandatory agreement acknowledging ₹500 penalty before session begins</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
                  <span className="font-bold text-rose-400 block">120-Second Eviction Sequence</span>
                  <span className="text-[11px] text-slate-400">Active buzzer beeps rapidly + flashing UI warning. Power cuts automatically after 120s with ₹500 fee.</span>
                </div>
              </div>
            </div>

            <Link
              href="/charging/start?chargerId=CHG-002"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all"
            >
              <span>Test Priority Bay #02 Consent & Eviction</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </section>

      {/* FEATURED CHARGERS PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Charging Stations & Bays</h2>
            <p className="text-xs text-slate-400 mt-1">Local hardware project bays (Bay #01 & VIP Bay #02) and simulated network fleet</p>
          </div>
          <Link href="/chargers" className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
            <span>View All Stations</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {chargers.slice(0, 3).map((charger) => {
            return (
              <div 
                key={charger.id} 
                className="glass-card glass-card-hover rounded-3xl p-6 border border-slate-800 bg-slate-900/70 flex flex-col justify-between shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono font-bold text-cyan-400">{charger.chargerCode}</span>
                    <StatusBadge status={charger.status} size="sm" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-1">{charger.name}</h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5 mb-5">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{charger.location}</span>
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-xs py-3 border-y border-slate-800 my-4">
                    <div>
                      <span className="text-slate-400 text-[10px] block font-semibold">
                        Power Rating
                      </span>
                      <span className="font-bold text-white font-mono">{charger.powerRating} kW</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block font-semibold font-mono">Connector</span>
                      <span className="font-bold text-cyan-300 truncate block">{charger.connectorType}</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 bg-slate-950/60 p-2 rounded-xl border border-slate-800 mb-2">
                    {charger.id === 'CHG-001' && 'Local Hardware Bench: Max 14.3A single-phase 2W'}
                    {charger.id === 'CHG-002' && 'Priority Reserved VIP / Emergency with 120s eviction'}
                    {charger.id.includes('CHG-003') && 'Simulated Network Fleet Charger'}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm font-extrabold text-emerald-400 font-mono">
                    ₹{charger.pricePerKwh.toFixed(2)}/kWh
                  </span>
                  <Link
                    href={`/chargers/${charger.id}`}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-slate-200 text-xs font-bold transition-all shadow-md"
                  >
                    View Bay Details
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* PLATFORM HARDWARE & PROTOCOL SUMMARY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card rounded-3xl p-6 lg:p-8 border border-slate-800 bg-slate-950/90 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>PLATFORM ARCHITECTURE & STANDARDS COMPLIANCE</span>
            </div>
            <h4 className="text-lg font-extrabold text-white">
              Smart Commercial EV Charging Infrastructure
            </h4>
            <p className="text-xs text-slate-400 max-w-xl">
              Equipped with single-phase 230V AC metrology, IEEE-519 power quality monitoring (&lt;5% THD), automated contactor protection, and dynamic UPI QR billing.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Grid Standard</span>
              <span className="font-bold text-white">230V 1Φ (≤14.3A)</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Metrology Sensor</span>
              <span className="font-bold text-cyan-400 font-mono">PZEM-004T (V3.0)</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 col-span-2 sm:col-span-1">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Payment Standard</span>
              <span className="font-bold text-emerald-400 font-mono">Dynamic Bharat-QR</span>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
