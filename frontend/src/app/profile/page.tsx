'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User as UserIcon, Mail, Phone, ShieldCheck, Key } from 'lucide-react';
import { useStore } from '@/lib/storeContext';

export default function ProfilePage() {
  const router = useRouter();
  const { currentUser } = useStore();

  useEffect(() => {
    if (!currentUser) {
      router.replace('/auth/login');
    }
  }, [currentUser, router]);

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Please Sign In</h2>
        <p className="text-xs text-slate-400">You need to be logged in to view your profile.</p>
        <Link href="/auth/login" className="inline-block px-5 py-2.5 rounded-xl bg-cyan-500 text-navy-950 font-bold text-xs">
          Go to Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Driver Profile & Account</h1>
        <p className="text-slate-400 text-xs mt-1">Manage your account credentials and system authorization role</p>
      </div>

      <div className="glass-card rounded-3xl p-6 lg:p-8 border border-slate-800 bg-navy-900/80 space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300 font-extrabold text-2xl">
            {currentUser.name[0]}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{currentUser.name}</h2>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Role: <strong className="text-cyan-300">{currentUser.role}</strong></span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-navy-950 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 block uppercase">Email Address</span>
            <span className="font-bold text-white text-sm">{currentUser.email}</span>
          </div>

          <div className="p-4 rounded-2xl bg-navy-950 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 block uppercase">Phone Number</span>
            <span className="font-bold text-white text-sm">{currentUser.phone}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
