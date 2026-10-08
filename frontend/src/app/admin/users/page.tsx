'use client';

import React from 'react';
import { Users, ShieldCheck, UserCheck } from 'lucide-react';
import { mockUsers } from '@/lib/mockData';
import { StatusBadge } from '@/components/ui/StatusBadge';

export default function AdminUsersPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">User & Role Management</h1>
        <p className="text-slate-400 text-xs mt-1">Manage system administrators, station operators, and EV drivers</p>
      </div>

      <div className="glass-card rounded-3xl p-6 border border-slate-800 bg-navy-900/60 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider">
              <th className="py-3 px-3">Name</th>
              <th className="py-3 px-3">Email</th>
              <th className="py-3 px-3">Phone</th>
              <th className="py-3 px-3">Role</th>
              <th className="py-3 px-3">Joined Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-200">
            {mockUsers.map((u) => (
              <tr key={u.id} className="hover:bg-navy-850/50 transition-colors">
                <td className="py-3.5 px-3 font-bold text-white">{u.name}</td>
                <td className="py-3.5 px-3 text-slate-300">{u.email}</td>
                <td className="py-3.5 px-3 font-mono text-slate-400">{u.phone}</td>
                <td className="py-3.5 px-3">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    u.role === 'ADMIN' ? 'bg-rose-500/20 text-rose-400' :
                    u.role === 'OPERATOR' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="py-3.5 px-3 text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
