'use client';

import React from 'react';
import Link from 'next/link';
import { Zap, Radio, ShieldAlert, ArrowRight, UserPlus } from 'lucide-react';

export default function AuthRegisterHubPage() {
  const registerRoles = [
    {
      id: 'user',
      title: 'EV Driver / User',
      subtitle: 'Create a personal account with two-wheeler preset & UPI wallet',
      icon: Zap,
      href: '/auth/register/user',
      borderColor: 'border-cyan-500/30 hover:border-cyan-400',
      badgeBg: 'bg-cyan-500/10 text-cyan-400',
    },
    {
      id: 'operator',
      title: 'Station Operator',
      subtitle: 'Bind your operator ID to a specific charging station to manage local metrology',
      icon: Radio,
      href: '/auth/register/operator',
      borderColor: 'border-amber-500/30 hover:border-amber-400',
      badgeBg: 'bg-amber-500/10 text-amber-400',
    },
    {
      id: 'admin',
      title: 'System Administrator',
      subtitle: 'Provision master fleet executive access using system passcode',
      icon: ShieldAlert,
      href: '/auth/register/admin',
      borderColor: 'border-rose-500/30 hover:border-rose-400',
      badgeBg: 'bg-rose-500/10 text-rose-400',
    },
  ];

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-full max-w-2xl space-y-8 glass-card rounded-3xl p-8 lg:p-10 border border-slate-800 bg-navy-900/90 shadow-2xl relative">
        
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-400 mx-auto shadow-lg shadow-cyan-500/20">
            <UserPlus className="w-8 h-8 stroke-[2.5]" />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Create Smart EV Account</h2>
          <p className="text-xs text-slate-400">Select the account type you want to create</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {registerRoles.map((role) => {
            const Icon = role.icon;
            return (
              <Link
                key={role.id}
                href={role.href}
                className={`glass-card rounded-2xl p-5 border ${role.borderColor} bg-navy-950/80 hover:bg-navy-850/80 flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] shadow-lg group text-left`}
              >
                <div className="space-y-3">
                  <div className={`w-10 h-10 rounded-xl ${role.badgeBg} flex items-center justify-center border border-white/5`}>
                    <Icon className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-white group-hover:text-cyan-300 transition-colors">
                      {role.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      {role.subtitle}
                    </p>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-slate-300 group-hover:text-white">
                  <span>Register</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>

        <div className="text-center pt-2 border-t border-slate-800/80">
          <p className="text-xs text-slate-400">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-cyan-400 font-bold hover:underline">
              Sign In to Your Portal →
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
