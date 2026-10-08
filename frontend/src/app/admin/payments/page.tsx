'use client';

import React from 'react';
import { DollarSign, ShieldCheck } from 'lucide-react';
import { useStore } from '@/lib/storeContext';
import { StatusBadge } from '@/components/ui/StatusBadge';

export default function AdminPaymentsPage() {
  const { walletTransactions } = useStore();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Global Payments Ledger</h1>
        <p className="text-slate-400 text-xs mt-1">Audit log of all settled Dynamic QR and Online UPI payments</p>
      </div>

      <div className="glass-card rounded-3xl p-6 border border-slate-800 bg-navy-900/60 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider">
              <th className="py-3 px-3">Transaction Ref</th>
              <th className="py-3 px-3">Type</th>
              <th className="py-3 px-3">Description</th>
              <th className="py-3 px-3">Timestamp</th>
              <th className="py-3 px-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-200">
            {walletTransactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-navy-850/50 transition-colors">
                <td className="py-3.5 px-3 font-mono font-bold text-cyan-400">{tx.reference}</td>
                <td className="py-3.5 px-3 font-bold text-white">{tx.type}</td>
                <td className="py-3.5 px-3 text-slate-300">{tx.description}</td>
                <td className="py-3.5 px-3 text-slate-400">{new Date(tx.createdAt).toLocaleString()}</td>
                <td className="py-3.5 px-3 text-right font-extrabold text-white">₹{tx.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
