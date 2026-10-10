'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldAlert, Lock, Mail, User as UserIcon, Phone, KeyRound, ArrowRight, AlertCircle } from 'lucide-react';
import { useStore } from '@/lib/storeContext';

export default function AdminRegisterPage() {
  const router = useRouter();
  const { setCurrentUser } = useStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [adminMasterKey, setAdminMasterKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
          role: 'ADMIN',
          adminMasterKey,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to provision admin account.');
      }

      setCurrentUser(data.user);
      router.push('/admin');
    } catch (err: any) {
      setError(err.message || 'Admin provisioning failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-full max-w-md space-y-6 glass-card rounded-3xl p-8 border border-rose-500/30 bg-navy-900/90 shadow-2xl relative overflow-hidden">
        
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-400 flex items-center justify-center text-rose-400 mx-auto shadow-lg shadow-rose-500/20">
            <ShieldAlert className="w-8 h-8 stroke-[2.5]" />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Provision System Administrator</h2>
          <p className="text-xs text-slate-400">High-security portal for master fleet operations access</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-start gap-2.5 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 block">Administrator Name</label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="e.g. Chief Operations Officer"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-navy-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 block">Official Admin Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="admin.hq@smartev.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-navy-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 block">Official Contact Phone</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                required
                placeholder="+91 90000 00000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-navy-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          {/* ADMIN SECURITY KEY */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-rose-300 block flex items-center justify-between">
              <span>Admin Master Passcode</span>
              <span className="text-[10px] text-slate-500 font-normal">Security Authorization</span>
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-rose-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="Enter ADMIN2026"
                value={adminMasterKey}
                onChange={(e) => setAdminMasterKey(e.target.value)}
                className="w-full bg-navy-950 border border-rose-500/40 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-rose-400 font-mono"
              />
            </div>
            <p className="text-[10px] text-slate-400">Default authorization passcode for evaluation: <code className="text-rose-400">ADMIN2026</code></p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 block">Admin Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-navy-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 hover:from-rose-500 hover:to-pink-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-rose-500/25 transition-all hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Validating Authorization...' : (
              <>
                <span>Provision Administrator & Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-slate-400">
            Already have an administrator account?{' '}
            <Link href="/auth/login/admin" className="text-rose-400 font-bold hover:underline">
              Admin Sign In
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
