'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { User } from '@/types/ev';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchUsers = () => {
    setLoading(true);
    fetch('/api/admin/users', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.users)) {
          setUsers(data.users);
        }
      })
      .catch((err) => {
        console.warn('Live user fetch error:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">User &amp; Role Management</h1>
          <p className="text-slate-600 dark:text-slate-400 text-xs mt-1">
            Real-time registered system administrators, station operators, and EV drivers ({users.length} accounts)
          </p>
        </div>
        <button
          onClick={fetchUsers}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-navy-850 dark:hover:bg-navy-800 text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 transition-colors w-fit cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-600 dark:text-cyan-400' : ''}`} />
          <span>Refresh Database</span>
        </button>
      </div>

      <div className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900/60 overflow-x-auto shadow-xl">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase text-[10px] tracking-wider">
              <th className="py-3 px-3">Name / Username</th>
              <th className="py-3 px-3">Email Address</th>
              <th className="py-3 px-3">Phone Number</th>
              <th className="py-3 px-3">System Role</th>
              <th className="py-3 px-3">Associated Station / Vehicle</th>
              <th className="py-3 px-3">Registered Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-800 dark:text-slate-200">
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-xs text-slate-500 font-mono">
                  {loading ? 'Loading registered users...' : 'No registered accounts found.'}
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-navy-850/50 transition-colors">
                  <td className="py-3.5 px-3 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 flex items-center justify-center text-[10px] font-mono shrink-0">
                      {u.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span>{u.name}</span>
                  </td>
                  <td className="py-3.5 px-3 text-slate-700 dark:text-slate-300 font-mono text-[11px]">{u.email}</td>
                  <td className="py-3.5 px-3 font-mono text-slate-600 dark:text-slate-400">{u.phone || 'N/A'}</td>
                  <td className="py-3.5 px-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      u.role === 'ADMIN' ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30' :
                      u.role === 'OPERATOR' ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30' :
                      'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/30'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-slate-600 dark:text-slate-400 text-[11px]">
                    {u.assignedStationId ? (
                      <span className="text-amber-700 dark:text-amber-300 font-mono">{u.assignedStationId}</span>
                    ) : u.vehicleModel ? (
                      <span className="text-cyan-700 dark:text-cyan-300">{u.vehicleModel}</span>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500">—</span>
                    )}
                  </td>
                  <td className="py-3.5 px-3 text-slate-500" suppressHydrationWarning>
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
