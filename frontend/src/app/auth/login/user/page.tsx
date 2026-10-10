'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Zap, Lock, Mail, ArrowRight, ShieldCheck, UserCheck, AlertCircle } from 'lucide-react';
import { useStore } from '@/lib/storeContext';

export default function UserLoginPage() {
  const router = useRouter();
  const { setCurrentUser } = useStore();
  const [email, setEmail] = useState('alex.rivera@example.com');
  const [password, setPassword] = useState('password123');
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
        body: JSON.stringify({ email, password, expectedRole: 'USER' }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to authenticate driver.');
      }

      setCurrentUser(data.user);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-full max-w-md space-y-7 glass-card rounded-3xl p-8 border border-cyan-500/30 bg-navy-900/90 shadow-2xl relative overflow-hidden">
        
        {/* Glow Accent */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-400 mx-auto shadow-lg shadow-cyan-500/20">
            <Zap className="w-8 h-8 stroke-[2.5]" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 text-[11px] font-bold border border-cyan-500/30">
            <UserCheck className="w-3.5 h-3.5" />
            <span>EV Driver Portal</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Driver Sign In</h2>
          <p className="text-xs text-slate-400">Access two-wheeler charging bays, live telemetry & UPI payments</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-start gap-2.5 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">Driver Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="driver@example.com"
                className="w-full bg-navy-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-navy-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 hover:from-blue-500 hover:to-cyan-300 text-navy-950 font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : (
              <>
                <span>Sign In as EV Driver</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Fill */}
        <div className="pt-2 border-t border-slate-800/80">
          <p className="text-[11px] text-slate-400 mb-2">Quick Demo Driver Account:</p>
          <button
            type="button"
            onClick={() => {
              setEmail('alex.rivera@example.com');
              setPassword('password123');
            }}
            className="w-full py-2 px-3 rounded-lg bg-navy-950 border border-slate-800 text-[11px] text-slate-300 hover:text-cyan-400 flex items-center justify-between text-left transition-colors"
          >
            <span>Alex Rivera (Ather 450X)</span>
            <span className="font-mono text-[10px] text-cyan-400">Fill Credentials</span>
          </button>
        </div>

        {/* Navigation Footers */}
        <div className="text-center space-y-3 pt-2">
          <p className="text-xs text-slate-400">
            New EV Driver?{' '}
            <Link href="/auth/register/user" className="text-cyan-400 font-bold hover:underline">
              Create Driver Account
            </Link>
          </p>

          <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500">
            <Link href="/auth/login/operator" className="hover:text-amber-400 transition-colors">
              Station Operator Login →
            </Link>
            <span>•</span>
            <Link href="/auth/login/admin" className="hover:text-rose-400 transition-colors">
              Admin Login →
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
