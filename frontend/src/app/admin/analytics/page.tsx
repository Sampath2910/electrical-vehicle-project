'use client';

import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Zap, IndianRupee, Activity, RefreshCw } from 'lucide-react';
import { MetricCard } from '@/components/ui/MetricCard';

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/stats', { cache: 'no-store' });
      const data = await res.json();
      if (res.ok && data.success) {
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const totalEnergy = stats?.totalFleetEnergyKwh ?? 0;
  const totalRevenue = stats?.totalFleetRevenue ?? 0;
  const totalStations = stats?.totalStations ?? 0;
  const chargingStations = stats?.chargingStations ?? 0;
  const faultStations = stats?.faultStations ?? 0;
  const utilizationPct = totalStations > 0 ? ((chargingStations / totalStations) * 100).toFixed(1) : '0.0';
  const faultRatePct = totalStations > 0 ? ((faultStations / totalStations) * 100).toFixed(1) : '0.0';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Platform Performance Analytics</h1>
          <p className="text-slate-600 dark:text-slate-400 text-xs mt-1">
            Live energy delivery reports, station utilization metrics, and financial summaries from fleet database
          </p>
        </div>
        <button
          onClick={fetchAnalytics}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-navy-850 dark:hover:bg-navy-800 text-xs text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors w-fit cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-600 dark:text-cyan-400' : ''}`} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Fleet Energy"
          value={`${totalEnergy.toFixed(2)} kWh`}
          subtitle="Persisted metered delivery"
          icon={Zap}
          variant="cyan"
        />
        <MetricCard
          title="Gross Fleet Revenue"
          value={`₹${totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
          subtitle="Settled UPI transactions"
          icon={IndianRupee}
          variant="emerald"
        />
        <MetricCard
          title="Active Bay Utilization"
          value={`${utilizationPct}%`}
          subtitle={`${chargingStations} of ${totalStations} bays charging`}
          icon={Activity}
          variant="amber"
        />
        <MetricCard
          title="Fault / Offline Rate"
          value={`${faultRatePct}%`}
          subtitle={`${faultStations} station(s) offline or faulted`}
          icon={TrendingUp}
          variant="default"
        />
      </div>

      <div className="glass-card rounded-3xl p-8 border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900/60 text-center space-y-3 shadow-sm">
        <BarChart3 className="w-12 h-12 text-cyan-600 dark:text-cyan-400 mx-auto" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Real-Time Fleet Aggregation</h3>
        <p className="text-xs text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
          All analytics counters reflect live persisted station revenue, metered kWh consumption, and operational statuses from the authoritative fleet database.
        </p>
      </div>
    </div>
  );
}
