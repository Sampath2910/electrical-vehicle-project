'use client';

import React from 'react';
import { BarChart3, TrendingUp, Zap, DollarSign, Activity } from 'lucide-react';
import { MetricCard } from '@/components/ui/MetricCard';

export default function AdminAnalyticsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Platform Performance Analytics</h1>
        <p className="text-slate-400 text-xs mt-1">Energy delivery reports, utilization metrics, and financial summaries</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Monthly Energy" value="1,482 kWh" subtitle="+18.4% vs last month" icon={Zap} variant="cyan" />
        <MetricCard title="Gross Revenue" value="₹22,971.00" subtitle="Settled transactions" icon={DollarSign} variant="emerald" />
        <MetricCard title="Charger Utilization" value="68.2%" subtitle="Peak occupancy rate" icon={Activity} variant="amber" />
        <MetricCard title="Fault Cutoff Rate" value="0.02%" subtitle="Zero hardware failures" icon={TrendingUp} variant="default" />
      </div>

      <div className="glass-card rounded-3xl p-8 border border-slate-800 bg-navy-900/60 text-center space-y-3">
        <BarChart3 className="w-12 h-12 text-cyan-400 mx-auto" />
        <h3 className="text-lg font-bold text-white">Aggregated Usage Reports</h3>
        <p className="text-xs text-slate-400 max-w-lg mx-auto">
          Detailed hourly/daily energy downsampling records stored in PostgreSQL database with Redis live-cache invalidation.
        </p>
      </div>
    </div>
  );
}
