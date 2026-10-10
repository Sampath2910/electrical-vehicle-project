'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, Mail, User as UserIcon, Phone, Radio, ArrowRight, AlertCircle, Building2, BadgeCheck } from 'lucide-react';
import { useStore } from '@/lib/storeContext';
import { Charger } from '@/types/ev';

export default function OperatorRegisterPage() {
  const router = useRouter();
  const { setCurrentUser } = useStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [operatorBadgeId, setOperatorBadgeId] = useState('');
  const [assignedStationId, setAssignedStationId] = useState('ch-101');
  const [password, setPassword] = useState('');
  const [stations, setStations] = useState<Charger[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/stations')
      .then(res => res.json())
      .then(data => {
        if (data.stations) {
          setStations(data.stations);
          if (data.stations.length > 0 && !assignedStationId) {
            setAssignedStationId(data.stations[0].id);
          }
        }
      })
      .catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          password,
          role: 'OPERATOR',
          assignedStationId,
          operatorBadgeId: operatorBadgeId || `OP-${Date.now().toString().slice(-4)}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to register operator.');
      }

      setCurrentUser(data.user);
      router.push('/operator');
    } catch (err: any) {
      setError(err.message || 'Operator registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-full max-w-md space-y-6 glass-card rounded-3xl p-8 border border-amber-500/30 bg-navy-900/90 shadow-2xl relative overflow-hidden">
        
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-400 mx-auto shadow-lg shadow-amber-500/20">
            <Radio className="w-8 h-8 animate-pulse stroke-[2.5]" />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Register Station Operator</h2>
          <p className="text-xs text-slate-400">Bind your account to an EV charging bay to manage live telemetry & revenue</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-start gap-2.5 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 block">Operator Full Name</label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="e.g. Suresh Gowda"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-navy-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 block">Operator Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="suresh.op@kletech.ac.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-navy-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 block">Contact Phone</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 11111"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-navy-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 block">Employee Badge ID</label>
              <div className="relative">
                <BadgeCheck className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="KLE-OP-103"
                  value={operatorBadgeId}
                  onChange={(e) => setOperatorBadgeId(e.target.value)}
                  className="w-full bg-navy-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* STATION ASSIGNMENT DROPDOWN */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-amber-300 block flex items-center justify-between">
              <span>Select Assigned EV Station</span>
              <span className="text-[10px] text-slate-400 font-normal">Dedicated Operator Binding</span>
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <select
                required
                value={assignedStationId}
                onChange={(e) => setAssignedStationId(e.target.value)}
                className="w-full bg-navy-950 border border-amber-500/40 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
              >
                {stations.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name} ({st.chargerCode})
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Your operator account will be strictly linked to this station's metrics, revenue, and controls.
            </p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 block">Operator Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-navy-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-400 hover:from-amber-400 hover:to-orange-400 text-navy-950 font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 transition-all hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Binding Station & Registering...' : (
              <>
                <span>Bind Station & Activate Operator</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-slate-400">
            Already registered as an operator?{' '}
            <Link href="/auth/login/operator" className="text-amber-400 font-bold hover:underline">
              Sign In to Station
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
