'use client';

import React from 'react';
import { useStore } from '@/lib/storeContext';

export default function AdminPaymentsPage() {
  const { walletTransactions } = useStore();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Global Payments Ledger</h1>
        <p className="text-slate-600 dark:text-slate-400 text-xs mt-1">Audit log of all settled Dynamic QR, Wallet Top-ups, and Online UPI payments</p>
      </div>

      <div className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900/60 overflow-x-auto shadow-sm">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase text-[10px] tracking-wider">
              <th className="py-3 px-3">Transaction Ref</th>
              <th className="py-3 px-3">Type</th>
              <th className="py-3 px-3">Description</th>
              <th className="py-3 px-3">Timestamp</th>
              <th className="py-3 px-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-800 dark:text-slate-200">
            {walletTransactions.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-xs text-slate-500 font-mono">
                  No payment transactions recorded yet. Wallet credits and charging invoice settlements will appear here automatically.
                </td>
              </tr>
            ) : (
              walletTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-navy-850/50 transition-colors">
                  <td className="py-3.5 px-3 font-mono font-bold text-cyan-700 dark:text-cyan-400">{tx.reference}</td>
                  <td className="py-3.5 px-3 font-bold text-slate-900 dark:text-white">{tx.type}</td>
                  <td className="py-3.5 px-3 text-slate-700 dark:text-slate-300">{tx.description}</td>
                  <td className="py-3.5 px-3 text-slate-500 dark:text-slate-400" suppressHydrationWarning>{new Date(tx.createdAt).toLocaleString()}</td>
                  <td className="py-3.5 px-3 text-right font-extrabold text-slate-900 dark:text-white font-mono">₹{tx.amount.toFixed(2)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
