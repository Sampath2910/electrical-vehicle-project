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
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Driver Digital Wallet</h1>
          <p className="text-slate-400 text-xs mt-1">Manage funds for Dynamic QR and Online UPI digital charging settlements</p>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* BALANCE CARD & TOP-UP FORM */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Balance Card */}
        <div className="lg:col-span-6 glass-card rounded-3xl p-6 lg:p-8 border border-cyan-500/30 bg-gradient-to-br from-navy-900 via-navy-850 to-navy-950 glow-cyan flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Available Driver Balance</span>
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-400">
              <Wallet className="w-6 h-6" />
            </div>
          </div>

          <div>
            <span className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
              ₹{wallet.balance.toFixed(2)}
            </span>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Auto-debit enabled for Dynamic QR & UPI payments</span>
            </p>
          </div>

          <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500 font-mono">
            Wallet ID: {wallet.id} &bull; Currency: {wallet.currency}
          </div>
        </div>

        {/* Top-up Form */}
        <div className="lg:col-span-6 glass-card rounded-3xl p-6 lg:p-8 border border-slate-800 bg-navy-900/60 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Plus className="w-5 h-5 text-cyan-400" />
            <span>Add Funds via UPI / Card</span>
          </h3>

          <div className="space-y-3">
            <label className="text-xs text-slate-300 block">Select Top-up Amount</label>
            <div className="grid grid-cols-4 gap-2">
              {[100, 500, 1000, 2000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setTopUpAmount(amt)}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all border ${
                    topUpAmount === amt 
                      ? 'bg-cyan-500 text-navy-950 border-cyan-400 shadow-md' 
                      : 'bg-navy-950 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  ₹{amt}
                </button>
              ))}
            </div>

            <button
              onClick={handleTopUp}
              disabled={isLoading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-navy-950 font-bold text-xs uppercase tracking-wider transition-all hover:scale-[1.01] shadow-lg shadow-cyan-500/20 disabled:opacity-50"
            >
              {isLoading ? 'Processing Payment...' : `Top Up ₹${topUpAmount} Now`}
            </button>
          </div>
        </div>

      </div>

      {/* TRANSACTION HISTORY TABLE */}
      <div className="glass-card rounded-3xl p-6 border border-slate-800 bg-navy-900/60 space-y-4">
        <h3 className="text-base font-bold text-white">Wallet Transaction Ledger</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider">
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Description</th>
                <th className="py-3 px-3">Reference</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {walletTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-navy-850/50 transition-colors">
                  <td className="py-3.5 px-3">
                    {tx.type === 'CREDIT' ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                        <ArrowDownLeft className="w-4 h-4" />
                        <span>CREDIT</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-rose-400 font-bold">
                        <ArrowUpRight className="w-4 h-4" />
                        <span>DEBIT</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-3 font-medium text-white">{tx.description}</td>
                  <td className="py-3.5 px-3 font-mono text-cyan-400 text-[11px]">{tx.reference}</td>
                  <td className="py-3.5 px-3 text-slate-400">{new Date(tx.createdAt).toLocaleString()}</td>
                  <td className={`py-3.5 px-3 text-right font-extrabold ${tx.type === 'CREDIT' ? 'text-emerald-400' : 'text-slate-100'}`}>
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
