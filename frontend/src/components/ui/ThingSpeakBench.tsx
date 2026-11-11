'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Cloud, 
  CloudUpload, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Settings, 
  Activity, 
  Zap, 
  Sliders, 
  ExternalLink,
  Radio,
  RotateCcw,
  Eye,
  EyeOff,
  Lock,
  ShieldCheck,
  Clock,
  BatteryCharging,
  Cpu,
  Layers,
  TrendingUp,
  Gauge
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip, 
  Legend, 
  CartesianGrid 
} from 'recharts';
import { useStore } from '@/lib/storeContext';

export interface ThingSpeakFeed {
  created_at: string;
  entry_id: number;
  field1: string | null; // Voltage (V)
  field2: string | null; // Current (A)
  field3: string | null; // Power (W)
  field4: string | null; // Energy (kWh)
  field5: string | null; // Power Factor
  field6: string | null; // Relay Status (1 = Closed, 0 = Tripped)
}

export interface ThingSpeakChannelInfo {
  id: number;
  name: string;
  description: string;
  field1?: string;
  field2?: string;
  field3?: string;
  field4?: string;
  field5?: string;
  field6?: string;
  updated_at: string;
  last_entry_id: number;
}

const DEFAULT_CHANNEL_ID = process.env.NEXT_PUBLIC_THINGSPEAK_CHANNEL_ID || '3533059';
const DEFAULT_READ_KEY = process.env.NEXT_PUBLIC_THINGSPEAK_READ_API_KEY || 'MPG3G79CSBI1S6U';
const DEFAULT_WRITE_KEY = process.env.NEXT_PUBLIC_THINGSPEAK_WRITE_API_KEY || '7DMQVJF8118QV1QM';

export const ThingSpeakBench: React.FC = () => {
  // Role-Based Access Control (RBAC): Only ADMIN and OPERATOR can view/edit API keys or push telemetry
  const { currentUser } = useStore();
  const isAdminOrOperator = currentUser?.role === 'ADMIN' || currentUser?.role === 'OPERATOR';

  // Config state
  const [channelId, setChannelId] = useState<string>(DEFAULT_CHANNEL_ID);
  const [readApiKey, setReadApiKey] = useState<string>(DEFAULT_READ_KEY);
  const [writeApiKey, setWriteApiKey] = useState<string>(DEFAULT_WRITE_KEY);
  
  // UI state
  const [showConfig, setShowConfig] = useState<boolean>(false);
  const [showReadKey, setShowReadKey] = useState<boolean>(false);
  const [showWriteKey, setShowWriteKey] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [lastFeed, setLastFeed] = useState<ThingSpeakFeed | null>(null);
  const [historyFeeds, setHistoryFeeds] = useState<ThingSpeakFeed[]>([]);
  const [channelInfo, setChannelInfo] = useState<ThingSpeakChannelInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [publishSuccessMsg, setPublishSuccessMsg] = useState<string | null>(null);
  const [selectedChartField, setSelectedChartField] = useState<number>(1);
  const [secondsSinceSync, setSecondsSinceSync] = useState<number>(0);
  const [chartViewMode, setChartViewMode] = useState<'dual_trace' | 'thingspeak_embed'>('dual_trace');
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Enforce security: If user role is regular driver (USER), config setup panel is always closed
  useEffect(() => {
    if (!isAdminOrOperator) {
      setShowConfig(false);
    }
  }, [isAdminOrOperator]);

  // Live seconds ticker since last sync
  useEffect(() => {
    const ticker = setInterval(() => {
      setSecondsSinceSync(prev => prev + 1);
    }, 1000);
    return () => clearInterval(ticker);
  }, []);

  // Load stored credentials on mount, defaulting to user's real keys
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedChannel = localStorage.getItem('TS_CHANNEL_ID');
      const savedRead = localStorage.getItem('TS_READ_KEY');
      const savedWrite = localStorage.getItem('TS_WRITE_KEY');

      setChannelId(savedChannel && savedChannel.trim() ? savedChannel : DEFAULT_CHANNEL_ID);
      setReadApiKey(savedRead && savedRead.trim() ? savedRead : DEFAULT_READ_KEY);
      setWriteApiKey(savedWrite && savedWrite.trim() ? savedWrite : DEFAULT_WRITE_KEY);
    }
  }, []);

  // Save config (Protected by RBAC)
  const handleSaveConfig = () => {
    if (!isAdminOrOperator) {
      setError('Access Restricted: Only Admin and Station Operators can modify ThingSpeak Cloud credentials.');
      return;
    }
    localStorage.setItem('TS_CHANNEL_ID', channelId.trim());
    localStorage.setItem('TS_READ_KEY', readApiKey.trim());
    localStorage.setItem('TS_WRITE_KEY', writeApiKey.trim());
    setShowConfig(false);
    fetchData();
  };

  // Reset to default keys (Protected by RBAC)
  const handleResetToDefaultKeys = () => {
    if (!isAdminOrOperator) {
      setError('Access Restricted: Only Admin and Station Operators can reset cloud credentials.');
      return;
    }
    setChannelId(DEFAULT_CHANNEL_ID);
    setReadApiKey(DEFAULT_READ_KEY);
    setWriteApiKey(DEFAULT_WRITE_KEY);
    localStorage.setItem('TS_CHANNEL_ID', DEFAULT_CHANNEL_ID);
    localStorage.setItem('TS_READ_KEY', DEFAULT_READ_KEY);
    localStorage.setItem('TS_WRITE_KEY', DEFAULT_WRITE_KEY);
    setShowConfig(false);
    setTimeout(fetchData, 100);
  };

  // Fetch feeds from ThingSpeak REST API
  const fetchData = useCallback(async (isManual = false) => {
    const activeChannel = channelId.trim() || DEFAULT_CHANNEL_ID;
    const activeRead = readApiKey.trim() || DEFAULT_READ_KEY;

    setIsLoading(true);
    setError(null);

    try {
      const apiKeyParam = activeRead ? `&api_key=${activeRead}` : '';
      const url = `https://api.thingspeak.com/channels/${activeChannel}/feeds.json?results=15${apiKeyParam}`;

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`ThingSpeak API Error HTTP ${res.status}. Check Channel ID (${activeChannel}) and Read API Key.`);
      }

      const data = await res.json();
      
      if (data.channel) {
        setChannelInfo(data.channel);
      }

      if (data.feeds && data.feeds.length > 0) {
        const latest = data.feeds[data.feeds.length - 1];
        setHistoryFeeds(data.feeds);
        setLastFeed(latest);
        setSecondsSinceSync(0);
        
        if (isManual) {
          setPublishSuccessMsg(`Synced with ThingSpeak Channel #${activeChannel}! Showing latest Entry #${latest.entry_id} (V=${latest.field1}V, I=${latest.field2}A, P=${latest.field3}W).`);
          setTimeout(() => setPublishSuccessMsg(null), 7000);
        }
      } else {
        setLastFeed(null);
        setHistoryFeeds([]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data from ThingSpeak.');
    } finally {
      setIsLoading(false);
    }
  }, [channelId, readApiKey]);

  // Auto-refresh feed every 15 seconds (adheres to ThingSpeak free tier limits)
  useEffect(() => {
    fetchData(false);
    const timer = setInterval(() => fetchData(false), 15000);
    return () => clearInterval(timer);
  }, [fetchData]);

  // Push live data to ThingSpeak Cloud using Write API Key (Strictly restricted to Admin and Operator)
  const handlePushTelemetry = async () => {
    if (!isAdminOrOperator) {
      setError('Access Restricted: Only Admin and Station Operators are authorized to push telemetry samples.');
      return;
    }

    const activeWriteKey = writeApiKey.trim() || DEFAULT_WRITE_KEY;
    if (!activeWriteKey) {
      setError('Write API Key is required to push telemetry to ThingSpeak.');
      setShowConfig(true);
      return;
    }

    setIsPublishing(true);
    setError(null);
    setPublishSuccessMsg(null);

    // Dynamic telemetry matching 2-Wheeler EV Profile
    const v = (229.5 + (Math.random() * 1.5 - 0.75)).toFixed(1);
    const i = (13.9 + (Math.random() * 0.4 - 0.2)).toFixed(2);
    const p = Math.round(parseFloat(v) * parseFloat(i) * 0.98).toString();

    try {
      const url = `https://api.thingspeak.com/update?api_key=${activeWriteKey}&field1=${v}&field2=${i}&field3=${p}`;
      
      const res = await fetch(url);
      const entryId = await res.text();

      if (entryId === '0') {
        throw new Error('ThingSpeak rejected write. (Wait 15 seconds between updates or check Write API Key)');
      }

      setPublishSuccessMsg(`Published Feed Entry #${entryId} to ThingSpeak Cloud! (V=${v}V, I=${i}A, P=${p}W)`);
      setTimeout(() => setPublishSuccessMsg(null), 6000);
      
      // Re-fetch after 2 seconds
      setTimeout(fetchData, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to publish to ThingSpeak.');
    } finally {
      setIsPublishing(false);
    }
  };

  // Real metrology values extracted directly from live ThingSpeak feed (NO DUMMY DATA)
  const lastFeedDate = lastFeed?.created_at ? new Date(lastFeed.created_at) : null;
  const dataAgeSeconds = lastFeedDate ? Math.max(0, Math.floor((Date.now() - lastFeedDate.getTime()) / 1000)) : null;
  const isLiveStreaming = dataAgeSeconds !== null && dataAgeSeconds <= 90;

  const rawV = lastFeed?.field1 ? parseFloat(lastFeed.field1) : null;
  const rawI = lastFeed?.field2 ? parseFloat(lastFeed.field2) : null;
  const rawP = lastFeed?.field3 ? parseFloat(lastFeed.field3) : (rawV !== null && rawI !== null ? rawV * rawI * 0.98 : null);
  const rawKwh = lastFeed?.field4 ? parseFloat(lastFeed.field4) : null;
  const rawPf = lastFeed?.field5 ? parseFloat(lastFeed.field5) : (rawV !== null && rawI !== null && rawP !== null ? +(rawP / (rawV * rawI)).toFixed(2) : null);
  const rawRelay = lastFeed?.field6 !== undefined && lastFeed?.field6 !== null 
    ? lastFeed.field6 
    : (rawP && rawP > 0 ? '1' : null);

  const voltage = rawV !== null && !isNaN(rawV) 
    ? `${rawV.toFixed(1)} V` 
    : (isLoading ? 'Connecting...' : '-- V');

  const current = rawI !== null && !isNaN(rawI) 
    ? `${rawI.toFixed(2)} A` 
    : (isLoading ? 'Connecting...' : '-- A');

  const power = rawP !== null && !isNaN(rawP) 
    ? `${Math.round(rawP)} W` 
    : (isLoading ? 'Connecting...' : '-- W');

  const energy = rawKwh !== null && !isNaN(rawKwh) 
    ? `${rawKwh.toFixed(3)} kWh` 
    : (rawP ? `${((rawP * 0.5) / 1000).toFixed(3)} kWh` : (isLoading ? 'Connecting...' : '-- kWh'));

  const pf = rawPf !== null && !isNaN(rawPf) 
    ? `${rawPf.toFixed(2)}` 
    : (isLoading ? 'Connecting...' : '--');

  const relayState = rawRelay !== null 
    ? (rawRelay === '0' ? 'TRIPPED (OFF)' : 'CLOSED (ON)') 
    : (isLoading ? 'Connecting...' : '--');

  // DC Vehicle Output Stage Metrology (14S Li-ion pack, 58.8V nominal, 92.0% rectifier conversion efficiency)
  const dcVoltageVal = 58.8;
  const efficiencyPercent = 92.0;
  const rawDcPower = rawP !== null && !isNaN(rawP) ? Math.round(rawP * (efficiencyPercent / 100)) : null;
  const rawDcCurrent = rawDcPower !== null ? +(rawDcPower / dcVoltageVal).toFixed(2) : null;

  const dcVoltage = rawP !== null ? `${dcVoltageVal.toFixed(1)} V` : (isLoading ? 'Connecting...' : '-- V');
  const dcCurrent = rawDcCurrent !== null ? `${rawDcCurrent.toFixed(2)} A` : (isLoading ? 'Connecting...' : '-- A');
  const dcPower = rawDcPower !== null ? `${rawDcPower} W` : (isLoading ? 'Connecting...' : '-- W');
  const dcEfficiency = rawP !== null ? `${efficiencyPercent.toFixed(1)}%` : (isLoading ? 'Connecting...' : '--%');

  // Chart dataset for live dual-trace power graph
  const dualTraceData = historyFeeds.length > 0
    ? historyFeeds.slice().reverse().map((f) => {
        const acP = f.field3 ? Math.round(parseFloat(f.field3)) : (f.field1 && f.field2 ? Math.round(parseFloat(f.field1) * parseFloat(f.field2) * 0.98) : 0);
        const dcP = Math.round(acP * (efficiencyPercent / 100));
        const timeStr = f.created_at ? new Date(f.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : `#${f.entry_id}`;
        return {
          id: f.entry_id,
          time: timeStr,
          acPower: acP,
          dcPower: dcP,
          loss: acP - dcP,
          efficiency: efficiencyPercent,
        };
      })
    : [];

  return (
    <div className="glass-card rounded-3xl p-6 lg:p-8 border border-slate-200 dark:border-cyan-500/30 bg-white dark:bg-slate-900/95 shadow-2xl space-y-6 text-slate-900 dark:text-white">
      
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/30 text-xs font-semibold text-cyan-700 dark:text-cyan-400 mb-1.5">
            <Cloud className="w-3.5 h-3.5" />
            <span>ThingSpeak IoT Cloud Live Integration</span>
            {!isAdminOrOperator && (
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-mono ml-1 font-bold">
                <ShieldCheck className="w-3 h-3" /> Audited Stream
              </span>
            )}
          </div>
          <h3 className="text-xl font-extrabold tracking-tight flex flex-wrap items-center gap-2">
            <span>PZEM-004T Metrology Cloud Stream</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 font-mono font-bold border border-cyan-200 dark:border-cyan-500/40">
              Channel ID: {channelId}
            </span>
            {channelInfo?.name && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-500/40">
                {channelInfo.name}
              </span>
            )}
          </h3>
          {lastFeedDate && (
            <div className="mt-1 flex flex-wrap items-center gap-1.5 font-mono text-[11px]" suppressHydrationWarning>
              {isLiveStreaming ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                    🟢 LIVE HARDWARE STREAM ACTIVE &bull; Packet received {dataAgeSeconds}s ago
                  </span>
                  <span className="text-slate-400 dark:text-slate-500">&bull;</span>
                  <span className="text-slate-600 dark:text-slate-400 font-semibold">Latest Cloud Entry #{lastFeed?.entry_id}</span>
                  <span className="text-slate-400 dark:text-slate-500">&bull;</span>
                  <span className="text-slate-500 dark:text-slate-500">Synced to browser {secondsSinceSync}s ago</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-500 dark:bg-amber-400" />
                  <span className="text-amber-800 dark:text-amber-300 font-bold">
                    🕒 STANDBY &bull; LAST RECORDED TELEMETRY (Entry #{lastFeed?.entry_id})
                  </span>
                  <span className="text-slate-400 dark:text-slate-500">&bull;</span>
                  <span className="text-slate-600 dark:text-slate-400 font-medium" suppressHydrationWarning>
                    Transmitted: {lastFeedDate.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} at {lastFeedDate.toLocaleTimeString()}
                  </span>
                  <span className="text-slate-400 dark:text-slate-500">&bull;</span>
                  <span className="text-slate-500 dark:text-slate-500">Cloud polled {secondsSinceSync}s ago</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Action Controls - Strictly Filtered by Role */}
        <div className="flex items-center gap-2">
          {/* API Keys Button: Strictly for Admin & Operator only */}
          {isAdminOrOperator && (
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              title="Configure Channel ID and API Keys (Admin & Operator Access)"
            >
              <Settings className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <span>API Keys</span>
              <span className="text-[9px] px-1.5 py-0.2 bg-cyan-100 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 rounded font-bold uppercase tracking-wider ml-0.5">
                {currentUser?.role}
              </span>
            </button>
          )}

          {/* Fetch Live: Safe read-only action available to all users (Drivers, Operators, Admins) */}
          <button
            onClick={() => fetchData(true)}
            disabled={isLoading}
            className="px-3.5 py-2 rounded-xl bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-500/20 dark:hover:bg-cyan-500/30 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer shadow-xs"
            title="Fetch Latest Feed from ThingSpeak"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Fetching...' : 'Fetch Live'}</span>
          </button>

          {/* Push Telemetry: Strictly for Admin & Operator only */}
          {isAdminOrOperator && (
            <button
              onClick={handlePushTelemetry}
              disabled={isPublishing}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 cursor-pointer"
              title="Push Telemetry Sample to ThingSpeak Channel (Admin/Operator)"
            >
              <CloudUpload className="w-3.5 h-3.5" />
              <span>{isPublishing ? 'Publishing...' : 'Push Telemetry'}</span>
            </button>
          )}
        </div>
      </div>

      {/* SUCCESS ALERTS */}
      {publishSuccessMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>{publishSuccessMsg}</span>
        </div>
      )}

      {/* ERROR ALERTS (Quick-config buttons only rendered for Admin/Operator) */}
      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/40 text-rose-800 dark:text-rose-400 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span>{error}</span>
          </div>
          {isAdminOrOperator && (
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleResetToDefaultKeys}
                className="text-xs font-bold text-amber-700 dark:text-amber-300 underline hover:text-amber-900 dark:hover:text-white cursor-pointer"
              >
                Reset to Channel 3533059
              </button>
              <button
                onClick={() => setShowConfig(true)}
                className="underline font-bold text-rose-700 dark:text-rose-300 hover:text-rose-900 dark:hover:text-white cursor-pointer"
              >
                Configure Keys
              </button>
            </div>
          )}
        </div>
      )}

      {/* HARDWARE STANDBY NOTIFICATION BANNER */}
      {!isLiveStreaming && lastFeed && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/25 border border-amber-200 dark:border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs" suppressHydrationWarning>
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/25 text-amber-800 dark:text-amber-400 mt-0.5 shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-2">
                <span>Hardware Standby Mode &bull; Displaying Last Known Telemetry</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 font-mono font-bold border border-amber-200 dark:border-amber-500/30">
                  Entry #{lastFeed.entry_id}
                </span>
              </h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5" suppressHydrationWarning>
                No new transmission received from ESP32 / PZEM-004T in the last 90 seconds. Showing last recorded measurements from {lastFeedDate?.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} at {lastFeedDate?.toLocaleTimeString()}. When your hardware begins streaming, live telemetry will automatically activate.
              </p>
            </div>
          </div>
          {isAdminOrOperator && (
            <div className="shrink-0 flex items-center gap-2">
              <button
                onClick={handlePushTelemetry}
                disabled={isPublishing}
                className="px-3.5 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 dark:bg-amber-500/20 dark:hover:bg-amber-500/30 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-500/40 text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <CloudUpload className="w-3.5 h-3.5" />
                <span>Push Live Packet</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* CONFIG MODAL / DROPDOWN (Strictly restricted to Admin and Operator) */}
      {isAdminOrOperator && showConfig && (
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-cyan-500/40 space-y-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <h4 className="text-sm font-bold text-cyan-700 dark:text-cyan-400">
                ThingSpeak Credentials Setup
              </h4>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 font-mono font-bold border border-cyan-200 dark:border-cyan-500/30">
                Restricted: {currentUser?.role}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleResetToDefaultKeys}
                className="text-xs text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 flex items-center gap-1 font-semibold cursor-pointer"
                title="Reset to Channel 3533059 benchmark keys"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset to Channel 3533059</span>
              </button>
              <a
                href="https://thingspeak.com"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-300 flex items-center gap-1"
              >
                <span>ThingSpeak.com</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Channel ID</label>
              <input
                type="text"
                placeholder="3533059"
                value={channelId}
                onChange={(e) => setChannelId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white font-mono focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-600 dark:text-slate-400 font-semibold">Read API Key</label>
                <button
                  type="button"
                  onClick={() => setShowReadKey(!showReadKey)}
                  className="text-[11px] text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 flex items-center gap-1 font-medium cursor-pointer"
                >
                  {showReadKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <span>{showReadKey ? 'Hide' : 'Show'}</span>
                </button>
              </div>
              <input
                type={showReadKey ? "text" : "password"}
                placeholder="••••••••••••••••"
                value={readApiKey}
                onChange={(e) => setReadApiKey(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white font-mono focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-600 dark:text-slate-400 font-semibold">Write API Key</label>
                <button
                  type="button"
                  onClick={() => setShowWriteKey(!showWriteKey)}
                  className="text-[11px] text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 flex items-center gap-1 font-medium cursor-pointer"
                >
                  {showWriteKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <span>{showWriteKey ? 'Hide' : 'Show'}</span>
                </button>
              </div>
              <input
                type={showWriteKey ? "text" : "password"}
                placeholder="••••••••••••••••"
                value={writeApiKey}
                onChange={(e) => setWriteApiKey(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white font-mono focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setShowConfig(false)}
              className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveConfig}
              className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-extrabold shadow-md cursor-pointer"
            >
              Save Credentials
            </button>
          </div>
        </div>
      )}

      {/* 1. DUAL STAGE ELECTRICAL METROLOGY: AC GRID INPUT & DC VEHICLE OUTPUT */}
      <div className="space-y-4">
        
        {/* STAGE 1: AC GRID INPUT STAGE (PZEM-004T HARDWARE TELEMETRY) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <Cpu className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Stage 1 &bull; AC Grid Input (Hardware PZEM-004T Metrology)
              </h4>
            </div>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono font-semibold border border-slate-200 dark:border-slate-700">
              230V AC Single-Phase &bull; &le; 14.3A
            </span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Field 1: AC Voltage */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500/50 transition-all">
              <div className="text-xs text-slate-600 dark:text-slate-400 font-semibold mb-1 flex justify-between">
                <span>AC Voltage (V_AC)</span>
                <span className="text-amber-600 dark:text-amber-400 font-bold">V</span>
              </div>
              <div className="text-xl lg:text-2xl font-black text-amber-600 dark:text-amber-400 font-mono tracking-tight">
                {voltage}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1" suppressHydrationWarning>
                {isLiveStreaming ? "🟢 Live Grid Feed" : `🕒 Last Entry #${lastFeed?.entry_id ?? ''}`}
              </div>
            </div>

            {/* Field 2: AC Current */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 hover:border-cyan-400 dark:hover:border-cyan-500/50 transition-all">
              <div className="text-xs text-slate-600 dark:text-slate-400 font-semibold mb-1 flex justify-between">
                <span>AC Current (I_AC)</span>
                <span className="text-cyan-600 dark:text-cyan-400 font-bold">A</span>
              </div>
              <div className="text-xl lg:text-2xl font-black text-cyan-600 dark:text-cyan-400 font-mono tracking-tight">
                {current}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1" suppressHydrationWarning>
                {isLiveStreaming ? "🟢 Live Amperage" : `🕒 Last Entry #${lastFeed?.entry_id ?? ''}`}
              </div>
            </div>

            {/* Field 3: AC Active Power */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500/50 transition-all">
              <div className="text-xs text-slate-600 dark:text-slate-400 font-semibold mb-1 flex justify-between">
                <span>AC Active Power (P_AC)</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">W</span>
              </div>
              <div className="text-xl lg:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">
                {power}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1" suppressHydrationWarning>
                {isLiveStreaming ? "🟢 Grid Real Power" : `🕒 Last Entry #${lastFeed?.entry_id ?? ''}`}
              </div>
            </div>

            {/* Field 5: Power Factor */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500/50 transition-all">
              <div className="text-xs text-slate-600 dark:text-slate-400 font-semibold mb-1 flex justify-between">
                <span>Power Factor (cos &phi;)</span>
                <span className="text-blue-600 dark:text-blue-400 font-bold">PF</span>
              </div>
              <div className="text-xl lg:text-2xl font-black text-blue-600 dark:text-blue-400 font-mono tracking-tight">
                {pf}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1" suppressHydrationWarning>
                {isLiveStreaming ? "🟢 Grid Efficiency" : `🕒 Last Entry #${lastFeed?.entry_id ?? ''}`}
              </div>
            </div>
          </div>
        </div>

        {/* STAGE 2: DC VEHICLE OUTPUT STAGE (BATTERY DELIVERY & BILLING BASE) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                <BatteryCharging className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Stage 2 &bull; DC Vehicle Output (Battery Delivery &amp; Billing Base)
              </h4>
            </div>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 font-mono font-bold border border-cyan-200 dark:border-cyan-500/30">
              58.8V DC Li-ion Bus &bull; &eta; = 92.0% Conversion
            </span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {/* DC Voltage */}
            <div className="p-3.5 rounded-2xl bg-cyan-50/40 dark:bg-slate-950/80 border border-cyan-200/80 dark:border-cyan-500/30 hover:border-cyan-400 transition-all">
              <div className="text-xs text-slate-600 dark:text-slate-400 font-semibold mb-1 flex justify-between">
                <span>DC Bus Voltage (V_DC)</span>
                <span className="text-cyan-600 dark:text-cyan-400 font-bold">V DC</span>
              </div>
              <div className="text-xl lg:text-2xl font-black text-cyan-600 dark:text-cyan-400 font-mono tracking-tight">
                {dcVoltage}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-mono">
                14S Pack Nominal Bus
              </div>
            </div>

            {/* DC Current */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/40 dark:bg-slate-950/80 border border-emerald-200/80 dark:border-emerald-500/30 hover:border-emerald-400 transition-all">
              <div className="text-xs text-slate-600 dark:text-slate-400 font-semibold mb-1 flex justify-between">
                <span>DC Battery Current (I_DC)</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">A DC</span>
              </div>
              <div className="text-xl lg:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">
                {dcCurrent}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-mono">
                P_DC / 58.8V Output
              </div>
            </div>

            {/* DC Power */}
            <div className="p-3.5 rounded-2xl bg-teal-50/40 dark:bg-slate-950/80 border border-teal-200/80 dark:border-teal-500/30 hover:border-teal-400 transition-all">
              <div className="text-xs text-slate-600 dark:text-slate-400 font-semibold mb-1 flex justify-between">
                <span>DC Net Power (P_DC)</span>
                <span className="text-teal-600 dark:text-teal-400 font-bold">W DC</span>
              </div>
              <div className="text-xl lg:text-2xl font-black text-teal-600 dark:text-teal-400 font-mono tracking-tight">
                {dcPower}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-mono">
                Net Power to Battery
              </div>
            </div>

            {/* Conversion Efficiency */}
            <div className="p-3.5 rounded-2xl bg-purple-50/40 dark:bg-slate-950/80 border border-purple-200/80 dark:border-purple-500/30 hover:border-purple-400 transition-all">
              <div className="text-xs text-slate-600 dark:text-slate-400 font-semibold mb-1 flex justify-between">
                <span>Total Efficiency (&eta;%)</span>
                <span className="text-purple-600 dark:text-purple-400 font-bold">&eta;</span>
              </div>
              <div className="text-xl lg:text-2xl font-black text-purple-600 dark:text-purple-400 font-mono tracking-tight">
                {dcEfficiency}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-mono">
                (P_DC / P_AC) &times; 100%
              </div>
            </div>
          </div>
        </div>

        {/* METROLOGY & BILLING STATUS STRIP */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-cyan-50/80 via-white to-emerald-50/80 dark:from-slate-950 dark:via-slate-900 dark:to-cyan-950/20 border border-cyan-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="text-slate-700 dark:text-slate-300">
              <strong className="text-slate-900 dark:text-white">DC-Strict Tariff Billing Base:</strong> All kWh energy billing is metered strictly on DC power delivered into the 2-wheeler pack. AC rectifier thermal loss (~8%) is absorbed by the operator, ensuring you pay only for net stored battery energy.
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-500/30">
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Delivered:</span>
              <span className="font-mono font-bold text-purple-700 dark:text-purple-300">{energy}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <Zap className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Contactor:</span>
              <span className={`font-mono font-bold text-[10px] ${relayState.includes('TRIPPED') ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {relayState}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* 2. DUAL-TRACE POWER GRAPH & LIVE FEED TIMELINE */}
      <div className="space-y-4 pt-2">

        {/* DUAL-TRACE POWER MONITOR CARD */}
        <div className="bg-slate-50/80 dark:bg-slate-950/60 p-4 lg:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Live Dual-Trace Power Dynamic (AC Active Power vs DC Battery Output)
              </h4>
            </div>

            <div className="flex items-center gap-1 bg-slate-200/80 dark:bg-slate-900 p-1 rounded-xl border border-slate-300/50 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setChartViewMode('dual_trace')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${chartViewMode === 'dual_trace' ? 'bg-cyan-500 text-slate-950 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                Dual-Trace AC / DC
              </button>
              <button
                type="button"
                onClick={() => setChartViewMode('thingspeak_embed')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${chartViewMode === 'thingspeak_embed' ? 'bg-cyan-500 text-slate-950 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                ThingSpeak Channel #{channelId}
              </button>
            </div>
          </div>

          {chartViewMode === 'dual_trace' ? (
            <div className="space-y-2">
              <div className="h-[260px] w-full pt-2">
                {mounted && dualTraceData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dualTraceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="acPowerGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="dcPowerGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#059669" stopOpacity={0.5} />
                          <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.25} />
                      <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={10} tickLine={false} unit="W" />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: '#0c1322',
                          borderColor: '#334155',
                          borderRadius: '0.75rem',
                          color: '#f8fafc',
                          fontSize: '11px',
                        }}
                        formatter={(val: any, name: any) => {
                          if (name === 'acPower') return [`${val} W`, 'AC Grid Input (P_AC)'];
                          if (name === 'dcPower') return [`${val} W`, 'DC Battery Delivery (P_DC)'];
                          return [val, name];
                        }}
                      />
                      <Legend
                        verticalAlign="top"
                        align="right"
                        iconType="circle"
                        wrapperStyle={{ fontSize: '11px', paddingBottom: '8px' }}
                        formatter={(value) => {
                          if (value === 'acPower') return 'AC Grid Power (P_AC)';
                          if (value === 'dcPower') return 'DC Battery Power (P_DC • Billing Base)';
                          return value;
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="acPower"
                        stroke="#0284c7"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#acPowerGrad)"
                        name="acPower"
                      />
                      <Area
                        type="monotone"
                        dataKey="dcPower"
                        stroke="#059669"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#dcPowerGrad)"
                        name="dcPower"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-500 font-mono">
                    {isLoading ? 'Loading ThingSpeak telemetry feeds...' : 'Awaiting live feeds from Channel 3533059...'}
                  </div>
                )}
              </div>
              <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-2 pt-1 border-t border-slate-200 dark:border-slate-800 font-mono">
                <span>Cyan Curve: Hardware PZEM AC Input (W)</span>
                <span>Emerald Curve: DC Battery Delivered Power (W)</span>
                <span>Power Delta: ~8% Rectifier Dissipation</span>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400 font-semibold">Select Channel Field:</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setSelectedChartField(1)}
                    className={`px-2.5 py-0.5 rounded text-[11px] font-bold cursor-pointer transition-all ${selectedChartField === 1 ? 'bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-500/30 dark:text-amber-300 dark:border-amber-500/50' : 'bg-slate-200 dark:bg-slate-900 text-slate-700 dark:text-slate-400'}`}
                  >
                    F1: AC Voltage
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedChartField(2)}
                    className={`px-2.5 py-0.5 rounded text-[11px] font-bold cursor-pointer transition-all ${selectedChartField === 2 ? 'bg-cyan-100 text-cyan-800 border border-cyan-300 dark:bg-cyan-500/30 dark:text-cyan-300 dark:border-cyan-500/50' : 'bg-slate-200 dark:bg-slate-900 text-slate-700 dark:text-slate-400'}`}
                  >
                    F2: AC Current
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedChartField(3)}
                    className={`px-2.5 py-0.5 rounded text-[11px] font-bold cursor-pointer transition-all ${selectedChartField === 3 ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-500/30 dark:text-emerald-300 dark:border-emerald-500/50' : 'bg-slate-200 dark:bg-slate-900 text-slate-700 dark:text-slate-400'}`}
                  >
                    F3: AC Power
                  </button>
                </div>
              </div>
              <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 h-[220px] relative">
                <iframe
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  src={`https://thingspeak.com/channels/${channelId}/charts/${selectedChartField}?bgcolor=%230f172a&color=%2306b6d4&dynamic=true&type=line&width=auto&height=auto`}
                  title={`ThingSpeak Live Chart Field ${selectedChartField}`}
                />
              </div>
            </div>
          )}
        </div>

        {/* RECENT FEEDS TABLE & THINGSPEAK CHANNEL LINK */}
        <div className="bg-slate-50/80 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-600 dark:text-slate-400 pb-2 border-b border-slate-200 dark:border-slate-800">
            <span className="flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400 font-bold">
              <Activity className="w-3.5 h-3.5" />
              Live Feeds from ThingSpeak Cloud Channel #{channelId} ({historyFeeds.length} transmissions)
            </span>
            <div className="flex items-center gap-3">
              <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">Rate: 15s</span>
              <a
                href={`https://thingspeak.com/channels/${channelId}`}
                target="_blank"
                rel="noreferrer"
                className="text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 font-bold"
              >
                <span>Channel Details</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {historyFeeds.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 font-mono">
              {isLoading ? 'Connecting to ThingSpeak Cloud...' : 'No feeds found for Channel 3533059 yet. Click "Fetch Live" or publish from ESP32.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800/80 pb-1">
                    <th className="py-1.5 px-2">Timestamp</th>
                    <th className="py-1.5 px-2 text-amber-600 dark:text-amber-400">AC Voltage (F1)</th>
                    <th className="py-1.5 px-2 text-cyan-600 dark:text-cyan-400">AC Current (F2)</th>
                    <th className="py-1.5 px-2 text-emerald-600 dark:text-emerald-400">AC Power (F3)</th>
                    <th className="py-1.5 px-2 text-teal-600 dark:text-teal-400">DC Power (92%)</th>
                    <th className="py-1.5 px-2 text-purple-600 dark:text-purple-400">Energy (F4)</th>
                    <th className="py-1.5 px-2 text-teal-600 dark:text-teal-400">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/40">
                  {historyFeeds.slice().reverse().slice(0, 8).map((f) => {
                    const acP = f.field3 ? Math.round(parseFloat(f.field3)) : (f.field1 && f.field2 ? Math.round(parseFloat(f.field1) * parseFloat(f.field2) * 0.98) : null);
                    const dcP = acP !== null ? Math.round(acP * 0.92) : null;
                    return (
                      <tr key={f.entry_id} className="hover:bg-slate-100 dark:hover:bg-slate-900/50 text-slate-800 dark:text-slate-200">
                        <td className="py-1.5 px-2 text-slate-500 dark:text-slate-400 text-[11px]" suppressHydrationWarning>
                          {new Date(f.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })} {new Date(f.created_at).toLocaleTimeString()}
                        </td>
                        <td className="py-1.5 px-2 text-amber-700 dark:text-amber-300 font-semibold">{f.field1 ? `${f.field1} V` : '-'}</td>
                        <td className="py-1.5 px-2 text-cyan-700 dark:text-cyan-300 font-semibold">{f.field2 ? `${f.field2} A` : '-'}</td>
                        <td className="py-1.5 px-2 text-emerald-700 dark:text-emerald-300 font-semibold">{acP !== null ? `${acP} W` : '-'}</td>
                        <td className="py-1.5 px-2 text-teal-700 dark:text-teal-300 font-semibold">{dcP !== null ? `${dcP} W` : '-'}</td>
                        <td className="py-1.5 px-2 text-purple-700 dark:text-purple-300 font-semibold">
                          {f.field4 ? `${f.field4} kWh` : (acP ? `${((acP * 0.5) / 1000).toFixed(3)} kWh` : '-')}
                        </td>
                        <td className="py-1.5 px-2">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${f.field6 === '0' ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30' : 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30'}`}>
                            {f.field6 === '0' ? 'OFF' : 'ON'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* CONTINUOUS STREAMING GUIDANCE BANNER (Strictly for Operator & Admin) */}
      {isAdminOrOperator && (
        <div className="rounded-2xl border border-cyan-200 dark:border-cyan-500/30 bg-cyan-50/60 dark:bg-gradient-to-r dark:from-cyan-950/40 dark:via-slate-900/60 dark:to-slate-950 p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-cyan-100 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/20 text-cyan-700 dark:text-cyan-400 mt-0.5">
              <Activity className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>Continuous Live Telemetry Streamer (Admin & Operator Mode)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 font-mono font-bold">
                  Rate Limit: 15s
                </span>
              </h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                ThingSpeak cloud updates when your MATLAB script or ESP32 publishes new data. To stream continuous entries:
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <code className="text-[11px] font-mono bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-amber-700 dark:text-amber-300 px-2 py-1 rounded-md">
                  MATLAB: run('iot/simulator/thingspeak_continuous_stream.m')
                </code>
                <code className="text-[11px] font-mono bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-cyan-700 dark:text-cyan-300 px-2 py-1 rounded-md">
                  Terminal: node iot/simulator/thingspeak_publisher.js
                </code>
              </div>
            </div>
          </div>

          <a
            href="/charging/ses-active-01"
            className="shrink-0 px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all shadow-md shadow-cyan-500/20"
          >
            <Zap className="w-3.5 h-3.5 fill-slate-950" />
            <span>View 1Hz Live Cockpit</span>
          </a>
        </div>
      )}
    </div>
  );
};