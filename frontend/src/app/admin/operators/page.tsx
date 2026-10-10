'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Radio, Building2, ShieldCheck, ArrowRight, UserPlus, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Charger, User } from '@/types/ev';

export default function AdminOperatorsPage() {
  const [stations, setStations] = useState<Charger[]>([]);
  const [operators, setOperators] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [reassignStationId, setReassignStationId] = useState('');
  const [reassignOperatorId, setReassignOperatorId] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      if (data.success) {
        setStations(data.stations);
        setOperators(data.operators);
        if (data.stations.length > 0) setReassignStationId(data.stations[0].id);
        if (data.operators.length > 0) setReassignOperatorId(data.operators[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleReassign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/stations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stationId: reassignStationId,
          operatorId: reassignOperatorId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMessage('Operator successfully assigned to station.');
        loadData();
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Dedicated Station Operators</h1>
          <p className="text-slate-400 text-xs mt-1">Audit and assign designated operators to individual EV charging bays</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="p-2.5 rounded-2xl bg-navy-950 border border-slate-800 text-slate-300 hover:text-white"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
          </button>
          <Link
            href="/auth/register/operator"
            className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-navy-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-amber-500/20"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register New Operator</span>
          </Link>
        </div>
      </div>

      {successMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 shadow-lg">
          <CheckCircle2 className="w-4 h-4" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* OPERATORS TABLE */}
      <div className="glass-card rounded-3xl p-6 border border-slate-800 bg-navy-900/60 overflow-x-auto shadow-xl">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Radio className="w-4 h-4 text-amber-400" />
          <span>Registered Station Operators</span>
        </h2>

        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider">
              <th className="py-3 px-3">Operator Name</th>
              <th className="py-3 px-3">Email Address</th>
              <th className="py-3 px-3">Badge ID</th>
              <th className="py-3 px-3">Assigned Station</th>
              <th className="py-3 px-3">Contact Phone</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-200">
            {operators.map((op) => (
              <tr key={op.id} className="hover:bg-navy-850/50 transition-colors">
                <td className="py-3.5 px-3 font-bold text-white flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[11px]">
                    {op.name.charAt(0)}
                  </div>
                  <span>{op.name}</span>
                </td>
                <td className="py-3.5 px-3 text-slate-300">{op.email}</td>
                <td className="py-3.5 px-3 font-mono text-amber-400 font-bold">{op.operatorBadgeId || 'KLE-OP'}</td>
                <td className="py-3.5 px-3">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                    {op.assignedStationId ? `Station ID: ${op.assignedStationId}` : 'Unassigned'}
                  </span>
                </td>
                <td className="py-3.5 px-3 font-mono text-slate-400">{op.phone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* QUICK ASSIGNMENT FORM */}
      <div className="glass-card rounded-3xl p-6 border border-slate-800 bg-navy-900/60 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Building2 className="w-4 h-4 text-cyan-400" />
          <span>Reassign Operator to Station</span>
        </h2>
        <p className="text-xs text-slate-400">
          Assign or transfer operational custody of any station to a specific operator account.
        </p>

        <form onSubmit={handleReassign} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-slate-300 font-semibold block">Select Station</label>
            <select
              value={reassignStationId}
              onChange={(e) => setReassignStationId(e.target.value)}
              className="w-full bg-navy-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              {stations.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name} ({st.id})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-300 font-semibold block">Select Operator</label>
            <select
              value={reassignOperatorId}
              onChange={(e) => setReassignOperatorId(e.target.value)}
              className="w-full bg-navy-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              {operators.map((op) => (
                <option key={op.id} value={op.id}>
                  {op.name} ({op.operatorBadgeId || op.email})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-navy-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
            >
              Confirm Assignment
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}
