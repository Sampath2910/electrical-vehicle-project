'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Zap, 
  Radio, 
  ShieldAlert, 
  ArrowRight, 
  Lock, 
  UserCheck, 
  AlertCircle, 
  CheckCircle2, 
  KeyRound,
  Building2,
  Eye,
  EyeOff
} from 'lucide-react';
import { useStore } from '@/lib/storeContext';
import { UserRole } from '@/types/ev';

export default function AuthLoginPage() {
  const router = useRouter();
  const { setCurrentUser, playSound } = useStore();

  // Default to EV Driver as the primary entry point
  const [activeRole, setActiveRole] = useState<UserRole>('USER');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [infoNotice, setInfoNotice] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRoleChange = (role: UserRole) => {
    setActiveRole(role);
    setError('');
    setInfoNotice('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfoNotice('');

    if (!identifier.trim() && !password.trim()) {
      setError('Please fill in all required fields (Identifier and Password).');
      return;
    }
    if (!identifier.trim()) {
      setError('Please enter your Email, Username, or Mobile Number.');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your account password.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password, expectedRole: activeRole }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to authenticate.');
      }

      playSound('success');
      setCurrentUser(data.user);

      if (data.roleMismatch) {
        setInfoNotice(`Authenticated as ${data.user.role}. Opening your console...`);
      }

      const targetPath = data.redirectTo || (
        data.user.role === 'OPERATOR' ? '/operator' :
        data.user.role === 'ADMIN' ? '/admin' : '/dashboard'
      );

      setTimeout(() => {
        router.push(targetPath);
      }, data.roleMismatch ? 400 : 100);

    } catch (err: any) {
      playSound('alert');
      setError(err.message || 'Login error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const roleMeta = {
    USER: {
      title: 'EV Rider Sign In',
      subtitle: 'Access two-wheeler charging bays, live telemetry & UPI payments',
      icon: Zap,
      badge: 'Rider Portal',
      themeColor: 'cyan',
      borderClass: 'border-cyan-500/40',
      activeTab: 'bg-cyan-500 text-navy-950 font-bold shadow-lg',
      inactiveTab: 'text-slate-400 hover:text-white bg-navy-950/60',
      btnGradient: 'bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-400 hover:from-blue-500 hover:to-cyan-400 text-navy-950',
      iconBg: 'bg-cyan-500/20 border-cyan-400 text-cyan-400 shadow-cyan-500/20',
    },
    OPERATOR: {
      title: 'Station Operator Sign In',
      subtitle: 'Manage assigned charging bay metrology, relay cutoff & isolated revenue',
      icon: Radio,
      badge: 'Operator Console',
      themeColor: 'amber',
      borderClass: 'border-amber-500/40',
      activeTab: 'bg-amber-500 text-navy-950 font-bold shadow-lg',
      inactiveTab: 'text-slate-400 hover:text-white bg-navy-950/60',
      btnGradient: 'bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-400 hover:from-amber-400 hover:to-orange-400 text-navy-950',
      iconBg: 'bg-amber-500/20 border-amber-400 text-amber-400 shadow-amber-500/20',
    },
    ADMIN: {
      title: 'System Administrator Sign In',
      subtitle: 'Total fleet revenue auditing, all stations & emergency preemption',
      icon: ShieldAlert,
      badge: 'Fleet Admin Tower',
      themeColor: 'rose',
      borderClass: 'border-rose-500/40',
      activeTab: 'bg-rose-500 text-white font-bold shadow-lg',
      inactiveTab: 'text-slate-400 hover:text-white bg-navy-950/60',
      btnGradient: 'bg-gradient-to-r from-rose-600 via-pink-600 to-red-500 hover:from-rose-500 hover:to-pink-500 text-white',
      iconBg: 'bg-rose-500/20 border-rose-400 text-rose-400 shadow-rose-500/20',
    },
  }[activeRole];

  const Icon = roleMeta.icon;

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className={`w-full max-w-lg space-y-7 glass-card rounded-3xl p-8 lg:p-10 border ${roleMeta.borderClass} bg-navy-900/90 shadow-2xl relative overflow-hidden transition-all duration-300`}>
        
        {/* Glow Accent */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* ROLE SELECTION TABS */}
        <div className="p-1 rounded-2xl bg-navy-950 border border-slate-800 grid grid-cols-3 gap-1">
          <button
            type="button"
            onClick={() => handleRoleChange('USER')}
            className={`py-2 px-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeRole === 'USER' ? roleMeta.activeTab : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>EV Driver</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleChange('OPERATOR')}
            className={`py-2 px-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeRole === 'OPERATOR' ? roleMeta.activeTab : 'text-slate-400 hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Operator</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleChange('ADMIN')}
            className={`py-2 px-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeRole === 'ADMIN' ? roleMeta.activeTab : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>
        </div>

        {/* HEADER */}
        <div className="text-center space-y-2">
          <div className={`w-14 h-14 rounded-2xl ${roleMeta.iconBg} border flex items-center justify-center mx-auto shadow-lg transition-all`}>
            <Icon className="w-7 h-7 stroke-[2.3]" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/80 text-slate-300 text-[11px] font-bold border border-slate-800">
            <span>{roleMeta.badge}</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">{roleMeta.title}</h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">{roleMeta.subtitle}</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-start gap-2.5 text-rose-300 text-xs animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {infoNotice && (
          <div className="p-3.5 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-start gap-2.5 text-cyan-300 text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-cyan-400" />
            <span>{infoNotice}</span>
          </div>
        )}

        {/* LOGIN FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">
              Email, Username, or Mobile Number
            </label>
            <div className="relative">
              <UserCheck className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. rahul@example.com, rahul, or +91 98765 43210"
                className="w-full bg-navy-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">Account Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-navy-950 border border-slate-800 rounded-xl pl-10 pr-10 py-3 text-xs text-white focus:outline-none focus:border-cyan-400 transition-colors"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 focus:outline-none transition-colors cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 rounded-xl ${roleMeta.btnGradient} font-extrabold text-xs uppercase tracking-wider shadow-lg transition-all hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50`}
          >
            {loading ? 'Authenticating Credentials...' : (
              <>
                <span>Sign In to {roleMeta.badge}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* QUICK CREDENTIAL PRESETS FOR TESTING */}
        <div className="pt-2 border-t border-slate-800/80 space-y-2">
          <p className="text-[11px] text-slate-400">1-Click Test Credentials Preset:</p>
          {activeRole === 'USER' && (
            <button
              type="button"
              onClick={() => {
                setIdentifier('alex.rivera@example.com');
                setPassword('password123');
              }}
              className="w-full py-2 px-3 rounded-xl bg-navy-950 border border-slate-800 text-[10px] text-left hover:border-cyan-400 transition-colors cursor-pointer"
            >
              <span className="font-bold block text-white">Alex Rivera (Ather 450X)</span>
              <span className="text-cyan-400 font-mono">alex.rivera@example.com &bull; password123</span>
            </button>
          )}

          {activeRole === 'OPERATOR' && (
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setIdentifier('operator1@kletech.ac.in');
                  setPassword('operator123');
                }}
                className="py-2 px-2.5 rounded-xl bg-navy-950 border border-slate-800 text-[10px] text-left hover:border-amber-400 transition-colors cursor-pointer"
              >
                <span className="font-bold block text-white">KLETECH Station 1</span>
                <span className="text-amber-400 font-mono">Ramesh Kumar (KLE-OP-101)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIdentifier('operator2@kletech.ac.in');
                  setPassword('operator123');
                }}
                className="py-2 px-2.5 rounded-xl bg-navy-950 border border-slate-800 text-[10px] text-left hover:border-amber-400 transition-colors cursor-pointer"
              >
                <span className="font-bold block text-white">KLETECH Station 2</span>
                <span className="text-amber-400 font-mono">Pooja Patil (KLE-OP-102)</span>
              </button>
            </div>
          )}

          {activeRole === 'ADMIN' && (
            <button
              type="button"
              onClick={() => {
                setIdentifier('admin@smartev.com');
                setPassword('admin123');
              }}
              className="w-full py-2 px-3 rounded-xl bg-navy-950 border border-slate-800 text-[10px] text-left hover:border-rose-400 transition-colors cursor-pointer"
            >
              <span className="font-bold block text-white">Fleet Master Admin</span>
              <span className="text-rose-400 font-mono">admin@smartev.com &bull; admin123</span>
            </button>
          )}
        </div>

        {/* REGISTRATION LINK */}
        <div className="text-center pt-1 border-t border-slate-800/80">
          <p className="text-xs text-slate-400">
            Need a new account?{' '}
            <Link href="/auth/register" className="text-cyan-400 font-bold hover:underline">
              Create an Account →
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
