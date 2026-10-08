'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Zap, Lock, Mail, ShieldCheck } from 'lucide-react';
import { useStore } from '@/lib/storeContext';

export default function LoginPage() {
  const router = useRouter();
  const { switchRole } = useStore();
  const [email, setEmail] = useState('alex.rivera@example.com');
  const [password, setPassword] = useState('password123');
  const [selectedRole, setSelectedRole] = useState<'USER' | 'OPERATOR' | 'ADMIN'>('USER');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    switchRole(selectedRole);
    if (selectedRole === 'USER') {
      router.push('/dashboard');
    } else {
      router.push('/admin');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-full max-w-md space-y-8 glass-card rounded-3xl p-8 border border-slate-800 bg-navy-900/90 shadow-2xl">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-400 mx-auto">
            <Zap className="w-7 h-7 stroke-[2.5]" />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Sign In to Smart EV</h2>
          <p className="text-xs text-slate-400">Access driver portal, live telemetry, and operator tools</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Role selector buttons */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">Login Persona / System Role</label>
            <div className="grid grid-cols-3 gap-2">
              {(['USER', 'OPERATOR', 'ADMIN'] as const).map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setSelectedRole(r)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                    selectedRole === r 
                      ? 'bg-cyan-500 text-navy-950 border-cyan-400 shadow-md' 
                      : 'bg-navy-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-navy-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
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
                className="w-full bg-navy-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-navy-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.01]"
          >
            Authenticate & Proceed ({selectedRole})
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-slate-400">
            Don't have an account?{' '}
            <Link href="/auth/register" className="text-cyan-400 font-semibold hover:underline">
              Create Account
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
