'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldAlert, Lock, Mail, ArrowRight, KeyRound, AlertCircle, BarChart3 } from 'lucide-react';
import { useStore } from '@/lib/storeContext';

export default function AdminLoginPage() {
  const router = useRouter();
  const { setCurrentUser } = useStore();
  const [email, setEmail] = useState('admin@smartev.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, expectedRole: 'ADMIN' }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to authenticate system administrator.');
      }

      setCurrentUser(data.user);
      router.push('/admin');
    } catch (err: any) {
      setError(err.message || 'Admin login error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-full max-w-md space-y-7 glass-card rounded-3xl p-8 border border-rose-500/30 bg-navy-900/90 shadow-2xl relative overflow-hidden">
        
        {/* Glow Accent */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-400 flex items-center justify-center text-rose-400 mx-auto shadow-lg shadow-rose-500/20">
            <ShieldAlert className="w-8 h-8 stroke-[2.5]" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-300 text-[11px] font-bold border border-rose-500/30">
            <KeyRound className="w-3.5 h-3.5" />
            <span>Master Fleet Administration</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Admin Sign In</h2>
          <p className="text-xs text-slate-400">Total fleet revenue auditing, all-station telemetry & emergency preemption</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-start gap-2.5 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">Admin Master Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@smartev.com"
                className="w-full bg-navy-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:border-rose-500 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">Master Admin Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-navy-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:border-rose-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 hover:from-rose-500 hover:to-pink-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-rose-500/25 transition-all hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Authenticating Administrator...' : (
              <>
                <span>Access Master Fleet Tower</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Fill */}
        <div className="pt-2 border-t border-slate-800/80">
          <p className="text-[11px] text-slate-400 mb-2">Master Admin Preset:</p>
          <button
            type="button"
            onClick={() => {
              setEmail('admin@smartev.com');
              setPassword('admin123');
            }}
            className="w-full py-2 px-3 rounded-lg bg-navy-950 border border-slate-800 text-[11px] text-slate-300 hover:text-rose-400 flex items-center justify-between text-left transition-colors"
          >
            <span>Fleet System Admin (Global Access)</span>
            <span className="font-mono text-[10px] text-rose-400">Fill Credentials</span>
          </button>
        </div>

        {/* Navigation Footers */}
        <div className="text-center space-y-3 pt-2">
          <p className="text-xs text-slate-400">
            Provision new Admin?{' '}
            <Link href="/auth/register/admin" className="text-rose-400 font-bold hover:underline">
              Admin Provisioning Portal
            </Link>
          </p>

          <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500">
            <Link href="/auth/login/user" className="hover:text-cyan-400 transition-colors">
              ← Driver Login
            </Link>
            <span>•</span>
            <Link href="/auth/login/operator" className="hover:text-amber-400 transition-colors">
              Operator Login →
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
