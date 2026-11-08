'use client';

import React, { useState } from 'react';
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft, ShieldCheck, CheckCircle2, RefreshCw } from 'lucide-react';
import { useStore } from '@/lib/storeContext';
import { MetricCard } from '@/components/ui/MetricCard';

export default function WalletPage() {
  const { wallet, walletTransactions, topUpWallet } = useStore();
  const [topUpAmount, setTopUpAmount] = useState<number>(500);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleTopUp = async () => {
    setIsLoading(true);
    setSuccessMessage(null);
    try {
      await new Promise(res => setTimeout(res, 800));
      await topUpWallet(topUpAmount);
      setSuccessMessage(`Successfully added ₹${topUpAmount} to your wallet via UPI!`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Driver Digital Wallet</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Manage funds for Dynamic QR and Online UPI digital charging settlements</p>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* BALANCE CARD & TOP-UP FORM */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Balance Card */}
        <div className="lg:col-span-6 glass-card rounded-3xl p-6 lg:p-8 border border-cyan-200 dark:border-cyan-500/30 bg-white dark:bg-gradient-to-br dark:from-navy-900 dark:via-navy-850 dark:to-navy-950 shadow-xl flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Available Driver Balance</span>
            <div className="p-2.5 rounded-xl bg-cyan-50 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-400 shadow-xs">
              <Wallet className="w-6 h-6" />
            </div>
          </div>

          <div>
            <span className="text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight font-mono">
              ₹{(wallet?.balance ?? 0).toFixed(2)}
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Auto-debit enabled for Dynamic QR & UPI payments</span>
            </p>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 font-mono">
            Wallet ID: {wallet.id} &bull; Currency: {wallet.currency}
          </div>
        </div>

        {/* Top-up Form */}
        <div className="lg:col-span-6 glass-card rounded-3xl p-6 lg:p-8 border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900/60 space-y-4 shadow-xl">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Plus className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            <span>Add Funds via UPI / Card</span>
          </h3>

          <div className="space-y-3">
            <label className="text-xs text-slate-600 dark:text-slate-300 block font-semibold">Select Top-up Amount</label>
            <div className="grid grid-cols-4 gap-2">
              {[100, 500, 1000, 2000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setTopUpAmount(amt)}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all border ${
                    topUpAmount === amt 
                      ? 'bg-cyan-500 text-white dark:text-navy-950 border-cyan-400 shadow-md scale-102' 
                      : 'bg-slate-50 dark:bg-navy-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  ₹{amt}
                </button>
              ))}
            </div>

            <button
              onClick={handleTopUp}
              disabled={isLoading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs uppercase tracking-wider transition-all hover:scale-[1.01] shadow-lg shadow-cyan-500/20 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? 'Processing Payment...' : `Top Up ₹${topUpAmount} Now`}
            </button>
          </div>
        </div>

      </div>

      {/* TRANSACTION HISTORY TABLE */}
      <div className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900/60 space-y-4 shadow-xl">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Wallet Transaction Ledger</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase text-[10px] tracking-wider font-semibold">
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Description</th>
                <th className="py-3 px-3">Reference</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-800 dark:text-slate-200">
              {walletTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/80 dark:hover:bg-navy-850/50 transition-colors">
                  <td className="py-3.5 px-3">
                    {tx.type === 'CREDIT' ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-bold">
                        <ArrowDownLeft className="w-4 h-4" />
                        <span>CREDIT</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-rose-700 dark:text-rose-400 font-bold">
                        <ArrowUpRight className="w-4 h-4" />
                        <span>DEBIT</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-3 font-medium text-slate-900 dark:text-white">{tx.description}</td>
                  <td className="py-3.5 px-3 font-mono text-cyan-700 dark:text-cyan-400 text-[11px]">{tx.reference}</td>
                  <td className="py-3.5 px-3 text-slate-500 dark:text-slate-400" suppressHydrationWarning>{new Date(tx.createdAt).toLocaleString()}</td>
                  <td className={`py-3.5 px-3 text-right font-extrabold ${tx.type === 'CREDIT' ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-100'}`}>
                    {tx.type === 'CREDIT' ? '+' : '-'}₹{tx.amount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
