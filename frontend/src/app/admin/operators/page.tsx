'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Radio, 
  Building2, 
  ShieldCheck, 
  ArrowRight, 
  UserPlus, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  X,
  Mail,
  Phone,
  BadgeCheck,
  Lock,
  User as UserIcon,
  Check,
  Edit3
} from 'lucide-react';
import { Charger, User } from '@/types/ev';

export default function AdminOperatorsPage() {
  const [stations, setStations] = useState<any[]>([]);
  const [operators, setOperators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reassignStationId, setReassignStationId] = useState('');
  const [reassignOperatorId, setReassignOperatorId] = useState('');
  const [reassigning, setReassigning] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [modalError, setModalError] = useState('');

  // Register Operator Modal state
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [savingOperator, setSavingOperator] = useState(false);
  const [operatorForm, setOperatorForm] = useState({
    name: '',
    email: '',
    phone: '',
    badgeId: '',
    assignedStationId: '',
    password: 'operator123',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      const res = await fetch('/api/admin/stats', { cache: 'no-store' });
      const data = await res.json();
      const stationList = data?.stations || data?.chargers || [];
      const operatorList = data?.operators || [];
      if (res.ok && (data?.success || stationList.length > 0 || operatorList.length > 0)) {
        setStations(stationList);
        setOperators(operatorList);
        if (stationList.length > 0 && !reassignStationId) {
          setReassignStationId(stationList[0].id);
        }
        if (operatorList.length > 0 && !reassignOperatorId) {
          setReassignOperatorId(operatorList[0].id);
        }
      } else {
        setErrorMessage(data?.error || 'Failed to load operator metrics.');
      }
    } catch (err: any) {
      console.error('Error fetching admin operators:', err);
      setErrorMessage(err.message || 'Network error fetching operator metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openRegisterModal = () => {
    const nextBadgeNum = 101 + operators.length;
    const defaultStation = stations.length > 0 ? (stations[0].code || stations[0].chargerCode || stations[0].id) : 'KLETECH-STATION-1';
    setOperatorForm({
      name: '',
      email: '',
      phone: '',
      badgeId: `KLE-OP-${nextBadgeNum}`,
      assignedStationId: defaultStation,
      password: 'operator123',
    });
    setErrorMessage('');
    setModalError('');
    setIsRegisterModalOpen(true);
  };

  const handleSaveNewOperator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!operatorForm.name.trim() || !operatorForm.email.trim()) {
      setModalError('Please provide both a name and an email address.');
      return;
    }

    try {
      setSavingOperator(true);
      setModalError('');
      setErrorMessage('');

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: operatorForm.name.trim(),
          email: operatorForm.email.trim(),
          phone: operatorForm.phone.trim() || '+91 98765 00000',
          password: operatorForm.password || 'operator123',
          role: 'OPERATOR',
          assignedStationId: operatorForm.assignedStationId,
          operatorBadgeId: operatorForm.badgeId || `KLE-OP-${Math.floor(100 + Math.random() * 900)}`,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save operator.');
      }

      // Explicitly ensure the station is patched with this new operator
      if (operatorForm.assignedStationId && data.user) {
        await fetch('/api/stations', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            stationId: operatorForm.assignedStationId,
            operatorId: data.user.id || data.user.email,
          }),
        });
      }

      setSuccessMessage(`Operator "${operatorForm.name}" successfully saved and assigned to station.`);
      setIsRegisterModalOpen(false);
      await loadData();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: any) {
      console.error('Error saving operator:', err);
      setModalError(err.message || 'Operator registration and save failed.');
    } finally {
      setSavingOperator(false);
    }
  };

  const handleReassign = async (e: React.FormEvent) => {
    e.preventDefault();
    const stationIdToUse = reassignStationId || (stations.length > 0 ? stations[0].id : '');
    const operatorIdToUse = reassignOperatorId || (operators.length > 0 ? operators[0].id : '');

    if (!stationIdToUse || !operatorIdToUse) {
      setErrorMessage('Please select both a valid station and an operator.');
      return;
    }

    try {
      setReassigning(true);
      setErrorMessage('');
      const res = await fetch('/api/stations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stationId: stationIdToUse,
          operatorId: operatorIdToUse,
        }),
      });
      const data = await res.json();
      if (data && data.success) {
        const opName = operators.find(o => o.id === operatorIdToUse)?.name || 'Operator';
        const stName = stations.find(s => s.id === stationIdToUse)?.name || 'Station';
        setSuccessMessage(`Operator "${opName}" successfully assigned and saved to "${stName}".`);
        await loadData();
        setTimeout(() => setSuccessMessage(''), 4000);
      } else {
        setErrorMessage(data?.error || 'Failed to reassign operator.');
        setTimeout(() => setErrorMessage(''), 4000);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Error executing reassignment.');
      setTimeout(() => setErrorMessage(''), 4000);
    } finally {
      setReassigning(false);
    }
  };

  const handleQuickReassign = (operator: any) => {
    setReassignOperatorId(operator.id);
    const currentSt = stations.find(s => s.assignedOperatorId === operator.id) || 
                      stations.find(s => s.id === operator.assignedStationId || s.code === operator.assignedStationId);
    if (currentSt) {
      setReassignStationId(currentSt.id);
    }
    // Smooth scroll down to assignment section
    const el = document.getElementById('reassign-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Dedicated Station Operators</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Audit and assign designated operators to individual EV charging bays</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="p-2.5 rounded-2xl bg-white dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors shadow-sm"
            title="Refresh Operators"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-500' : ''}`} />
          </button>
          
          {/* Register New Operator Button: opens Register & Save Operator modal */}
          <button
            onClick={openRegisterModal}
            className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-navy-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Register New Operator</span>
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 shadow-lg animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Error Notification Alert */}
      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2 shadow-lg animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* OPERATORS TABLE */}
      <div className="rounded-3xl p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900/90 overflow-x-auto shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Radio className="w-4 h-4 text-amber-500" />
            <span>Registered Station Operators ({operators.length})</span>
          </h2>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
            {stations.length} Station Bays Configured
          </span>
        </div>

        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase text-[10px] tracking-wider">
              <th className="py-3 px-3">Operator Name</th>
              <th className="py-3 px-3">Email Address</th>
              <th className="py-3 px-3">Badge ID</th>
              <th className="py-3 px-3">Assigned Station</th>
              <th className="py-3 px-3">Contact Phone</th>
              <th className="py-3 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-200">
            {operators.length > 0 ? (
              operators.map((op) => {
                const assignedStation = stations.find(s => 
                  s.assignedOperatorId === op.id ||
                  s.id === op.assignedStationId || 
                  s.code === op.assignedStationId || 
                  s.chargerCode === op.assignedStationId
                );

                return (
                  <tr key={op.id} className="hover:bg-slate-50 dark:hover:bg-navy-850/50 transition-colors">
                    <td className="py-3.5 px-3 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-[11px] border border-amber-200 dark:border-amber-500/30">
                        {op.name ? op.name.charAt(0) : 'O'}
                      </div>
                      <span>{op.name}</span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-600 dark:text-slate-300">{op.email}</td>
                    <td className="py-3.5 px-3 font-mono text-amber-600 dark:text-amber-400 font-bold">
                      {op.operatorBadgeId || 'KLE-OP'}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-cyan-50 dark:bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/30">
                        {assignedStation
                          ? `${assignedStation.name} (${assignedStation.chargerCode || assignedStation.id.slice(0, 6)})`
                          : (op.assignedStationId ? `Station ID: ${op.assignedStationId}` : 'Unassigned')}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-mono text-slate-500 dark:text-slate-400">{op.phone || '+91 00000 00000'}</td>
                    <td className="py-3.5 px-3 text-right">
                      <button
                        onClick={() => handleQuickReassign(op)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-navy-800 hover:bg-cyan-50 dark:hover:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 font-bold text-[10px] border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                        title="Reassign to Station"
                      >
                        Reassign
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  {loading ? 'Loading operators from database...' : 'No operators registered yet.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* QUICK ASSIGNMENT FORM (SAVE OPERATOR TO STATION) */}
      <div id="reassign-section" className="rounded-3xl p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900/90 shadow-xl space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Building2 className="w-4 h-4 text-cyan-500" />
          <span>Reassign Operator to Station</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Assign or transfer operational custody of any station to a specific operator account.
        </p>

        <form onSubmit={handleReassign} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-slate-700 dark:text-slate-300 font-semibold block">Select Station</label>
            <select
              value={reassignStationId}
              onChange={(e) => setReassignStationId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
            >
              {stations.length > 0 ? (
                stations.map((st) => (
                  <option key={st.id} value={st.code || st.chargerCode || st.id}>
                    {st.name} ({st.chargerCode || st.code || st.id})
                  </option>
                ))
              ) : (
                <option value="">No stations available</option>
              )}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-700 dark:text-slate-300 font-semibold block">Select Operator</label>
            <select
              value={reassignOperatorId}
              onChange={(e) => setReassignOperatorId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
            >
              {operators.length > 0 ? (
                <>
                  <option value="none">-- Unassign / Set as Self-Serve Bay --</option>
                  {operators.map((op) => (
                    <option key={op.id} value={op.id}>
                      {op.name} ({op.operatorBadgeId || op.email})
                    </option>
                  ))}
                </>
              ) : (
                <option value="">No operators registered</option>
              )}
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={reassigning || stations.length === 0 || operators.length === 0}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              {reassigning ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving Assignment...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Confirm Assignment</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ======================================================== */}
      {/* MODAL: REGISTER & SAVE NEW OPERATOR                      */}
      {/* ======================================================== */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-navy-900 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Register New Station Operator
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Create operator credentials and bind directly to an EV charging bay
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsRegisterModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-navy-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Error Alert */}
            {modalError && (
              <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2 shadow-sm">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{modalError}</span>
              </div>
            )}

            {/* Modal Form */}
            <form onSubmit={handleSaveNewOperator} className="space-y-4">
              
              {/* Operator Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  Operator Full Name *
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Deepak Sharma"
                    value={operatorForm.name}
                    onChange={(e) => setOperatorForm({ ...operatorForm, name: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="deepak.op@kletech.ac.in"
                    value={operatorForm.email}
                    onChange={(e) => setOperatorForm({ ...operatorForm, email: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Phone & Badge ID in 2 columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                    Contact Phone
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      placeholder="+91 98765 33333"
                      value={operatorForm.phone}
                      onChange={(e) => setOperatorForm({ ...operatorForm, phone: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                    Employee Badge ID
                  </label>
                  <div className="relative">
                    <BadgeCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="KLE-OP-104"
                      value={operatorForm.badgeId}
                      onChange={(e) => setOperatorForm({ ...operatorForm, badgeId: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Assigned Station */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  Assign to EV Charging Bay *
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <select
                    required
                    value={operatorForm.assignedStationId}
                    onChange={(e) => setOperatorForm({ ...operatorForm, assignedStationId: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    {stations.map((st) => (
                      <option key={st.id} value={st.code || st.chargerCode || st.id}>
                        {st.name} ({st.chargerCode || st.code || st.id})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  Temporary Login Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="operator123"
                    value={operatorForm.password}
                    onChange={(e) => setOperatorForm({ ...operatorForm, password: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <p className="text-[10px] text-slate-400">
                  Default login password for the operator console.
                </p>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingOperator}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-navy-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {savingOperator ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Operator...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      <span>Save Operator</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
