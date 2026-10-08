'use client';

import React from 'react';
import { Bell, CheckCircle2, AlertTriangle, Zap, Wallet } from 'lucide-react';
import { useStore } from '@/lib/storeContext';

export default function NotificationsPage() {
  const { notifications, markNotificationRead } = useStore();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">System Notifications</h1>
        <p className="text-slate-400 text-xs mt-1">Real-time alerts regarding charging sessions, payments, and safety</p>
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <p className="text-xs text-slate-500">No notifications yet.</p>
        ) : (
          notifications.map((n) => (
            <div 
              key={n.id} 
              onClick={() => markNotificationRead(n.id)}
              className={`p-4 rounded-2xl glass-card border transition-all cursor-pointer flex items-start gap-4 ${
                !n.readAt ? 'border-cyan-500/40 bg-navy-900/80 glow-cyan' : 'border-slate-800/80 bg-navy-950/60 opacity-80'
              }`}
            >
              <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-400 shrink-0">
                <Bell className="w-5 h-5" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white">{n.title}</h4>
                  <span className="text-[10px] text-slate-500">{new Date(n.createdAt).toLocaleTimeString()}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{n.message}</p>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
