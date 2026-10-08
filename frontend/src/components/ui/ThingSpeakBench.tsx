'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Cloud, 
  CloudUpload, 
  CloudDownload, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Settings, 
  Activity, 
  Zap, 
  ShieldCheck, 
  Sliders, 
  ExternalLink,
  Info,
  Radio
} from 'lucide-react';

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
  field1: string;
  field2: string;
  field3: string;
  field4: string;
  field5: string;
  field6: string;
  updated_at: string;
  last_entry_id: number;
}

export const ThingSpeakBench: React.FC = () => {
  // Config state
  const [channelId, setChannelId] = useState<string>('');
  const [readApiKey, setReadApiKey] = useState<string>('');
  const [writeApiKey, setWriteApiKey] = useState<string>('');
  
  // UI state
  const [showConfig, setShowConfig] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [lastFeed, setLastFeed] = useState<ThingSpeakFeed | null>(null);
  const [historyFeeds, setHistoryFeeds] = useState<ThingSpeakFeed[]>([]);
  const [channelInfo, setChannelInfo] = useState<ThingSpeakChannelInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [publishSuccessMsg, setPublishSuccessMsg] = useState<string | null>(null);

  // Load stored credentials on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedChannel = localStorage.getItem('TS_CHANNEL_ID') || process.env.NEXT_PUBLIC_THINGSPEAK_CHANNEL_ID || '';
      const savedRead = localStorage.getItem('TS_READ_KEY') || process.env.NEXT_PUBLIC_THINGSPEAK_READ_API_KEY || '';
      const savedWrite = localStorage.getItem('TS_WRITE_KEY') || process.env.NEXT_PUBLIC_THINGSPEAK_WRITE_API_KEY || '';

      setChannelId(savedChannel);
      setReadApiKey(savedRead);
      setWriteApiKey(savedWrite);
    }
  }, []);

  // Save config
  const handleSaveConfig = () => {
    localStorage.setItem('TS_CHANNEL_ID', channelId.trim());
    localStorage.setItem('TS_READ_KEY', readApiKey.trim());
    localStorage.setItem('TS_WRITE_KEY', writeApiKey.trim());
    setShowConfig(false);
    fetchData();
  };

  // Fetch feeds from ThingSpeak REST API
  const fetchData = useCallback(async () => {
    if (!channelId) {
      setError('Please configure your ThingSpeak Channel ID first.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const apiKeyParam = readApiKey ? `&api_key=${readApiKey.trim()}` : '';
      const url = `https://api.thingspeak.com/channels/${channelId.trim()}/feeds.json?results=15${apiKeyParam}`;

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`ThingSpeak API Error HTTP ${res.status}. Check Channel ID and Read API Key.`);
      }

      const data = await res.json();
      
      if (data.channel) {
        setChannelInfo(data.channel);
      }

      if (data.feeds && data.feeds.length > 0) {
        setHistoryFeeds(data.feeds);
        setLastFeed(data.feeds[data.feeds.length - 1]);
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

  // Auto-refresh feed every 20 seconds
  useEffect(() => {
    if (channelId) {
      fetchData();
      const timer = setInterval(fetchData, 20000);
      return () => clearInterval(timer);
    }
  }, [channelId, fetchData]);

  // Push sample/live data to ThingSpeak Cloud
  const handlePushTelemetry = async () => {
    if (!writeApiKey) {
      setError('Write API Key is required to push telemetry to ThingSpeak.');
      setShowConfig(true);
      return;
    }

    setIsPublishing(true);
    setError(null);
    setPublishSuccessMsg(null);

    // Generate dynamic sample data matching PZEM-004T metrology
    const v = (230.0 + (Math.random() * 2.0 - 1.0)).toFixed(1);
    const i = (14.0 + (Math.random() * 0.6 - 0.3)).toFixed(2);
    const p = Math.round(parseFloat(v) * parseFloat(i) * 0.98).toString();
    const kwh = (3.50 + Math.random() * 0.05).toFixed(3);
    const pf = '0.98';
    const relay = '1';

    try {
      const url = `https://api.thingspeak.com/update?api_key=${writeApiKey.trim()}&field1=${v}&field2=${i}&field3=${p}&field4=${kwh}&field5=${pf}&field6=${relay}`;
      
      const res = await fetch(url);
      const entryId = await res.text();

      if (entryId === '0') {
        throw new Error('ThingSpeak rejected write. (Wait 15 seconds between updates or check Write API Key)');
      }

      setPublishSuccessMsg(`Published Feed #${entryId} to ThingSpeak Cloud! (V=${v}V, I=${i}A, P=${p}W)`);
      setTimeout(() => setPublishSuccessMsg(null), 6000);
      
      // Re-fetch after 2 seconds
      setTimeout(fetchData, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to publish to ThingSpeak.');
    } finally {
      setIsPublishing(false);
    }
  };

  const voltage = lastFeed?.field1 ? `${parseFloat(lastFeed.field1).toFixed(1)} V` : '230.2 V';
  const current = lastFeed?.field2 ? `${parseFloat(lastFeed.field2).toFixed(2)} A` : '14.15 A';
  const power = lastFeed?.field3 ? `${Math.round(parseFloat(lastFeed.field3))} W` : '3190 W';
  const energy = lastFeed?.field4 ? `${parseFloat(lastFeed.field4).toFixed(3)} kWh` : '3.450 kWh';
  const pf = lastFeed?.field5 ? `${parseFloat(lastFeed.field5).toFixed(2)}` : '0.98';
  const relayState = lastFeed?.field6 === '0' ? 'TRIPPED (OFF)' : 'CLOSED (ON)';

  return (
    <div className="glass-card rounded-3xl p-6 lg:p-8 border border-cyan-500/30 bg-slate-900/95 shadow-2xl space-y-6 text-white">
      
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-semibold text-cyan-400 mb-1.5">
            <Cloud className="w-3.5 h-3.5" />
            <span>ThingSpeak IoT Cloud Integration Engine</span>
          </div>
          <h3 className="text-xl font-extrabold tracking-tight flex items-center gap-2">
            <span>PZEM-004T Metrology Cloud Stream</span>
            {channelId && (
              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono font-normal">
                Channel ID: {channelId}
              </span>
            )}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <Settings className="w-3.5 h-3.5 text-cyan-400" />
            <span>Config API Keys</span>
          </button>

          <button
            onClick={fetchData}
            disabled={isLoading}
            className="px-3.5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Fetch Cloud</span>
          </button>

          <button
            onClick={handlePushTelemetry}
            disabled={isPublishing}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
          >
            <CloudUpload className="w-3.5 h-3.5" />
            <span>{isPublishing ? 'Publishing...' : 'Push Telemetry'}</span>
          </button>
        </div>
      </div>

      {/* SUCCESS / ERROR ALERTS */}
      {publishSuccessMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{publishSuccessMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/40 text-rose-400 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => setShowConfig(true)}
            className="underline font-bold text-rose-300 hover:text-white"
          >
            Configure Keys
          </button>
        </div>
      )}

      {/* CONFIG MODAL / DROPDOWN */}
      {showConfig && (
        <div className="p-5 rounded-2xl bg-slate-950 border border-cyan-500/40 space-y-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <h4 className="text-sm font-bold text-cyan-400 flex items-center gap-2">
              <Sliders className="w-4 h-4" />
              <span>ThingSpeak Credentials Setup</span>
            </h4>
            <a
              href="https://thingspeak.com"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-slate-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <span>Get Keys on ThingSpeak.com</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Channel ID</label>
              <input
                type="text"
                placeholder="e.g. 2849102"
                value={channelId}
                onChange={(e) => setChannelId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Read API Key (Optional for Public)</label>
              <input
                type="text"
                placeholder="e.g. A1B2C3D4E5F6"
                value={readApiKey}
                onChange={(e) => setReadApiKey(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Write API Key (For Pushing Feeds)</label>
              <input
                type="text"
                placeholder="e.g. X1Y2Z3A4B5C6"
                value={writeApiKey}
                onChange={(e) => setWriteApiKey(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono focus:border-cyan-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setShowConfig(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveConfig}
              className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-extrabold"
            >
              Save Credentials
            </button>
          </div>
        </div>
      )}

      {/* METRICS DISPLAY GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Field 1: Voltage */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/50 transition-all">
          <div className="text-xs text-slate-400 font-semibold mb-1 flex justify-between">
            <span>Voltage (F1)</span>
            <span className="text-amber-400">V</span>
          </div>
          <div className="text-xl lg:text-2xl font-black text-amber-400 font-mono tracking-tight">
            {voltage}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">230V Nominal Grid</div>
        </div>

        {/* Field 2: Current */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/50 transition-all">
          <div className="text-xs text-slate-400 font-semibold mb-1 flex justify-between">
            <span>Current (F2)</span>
            <span className="text-cyan-400">A</span>
          </div>
          <div className="text-xl lg:text-2xl font-black text-cyan-400 font-mono tracking-tight">
            {current}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Max 14.3A 2W AC</div>
        </div>

        {/* Field 3: Active Power */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-emerald-500/50 transition-all">
          <div className="text-xs text-slate-400 font-semibold mb-1 flex justify-between">
            <span>Active Power (F3)</span>
            <span className="text-emerald-400">W</span>
          </div>
          <div className="text-xl lg:text-2xl font-black text-emerald-400 font-mono tracking-tight">
            {power}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">PZEM Metrology</div>
        </div>

        {/* Field 4: Energy Delivered */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-purple-500/50 transition-all">
          <div className="text-xs text-slate-400 font-semibold mb-1 flex justify-between">
            <span>Energy (F4)</span>
            <span className="text-purple-400">kWh</span>
          </div>
          <div className="text-xl lg:text-2xl font-black text-purple-400 font-mono tracking-tight">
            {energy}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Total Delivered</div>
        </div>

        {/* Field 5: Power Factor */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-blue-500/50 transition-all">
          <div className="text-xs text-slate-400 font-semibold mb-1 flex justify-between">
            <span>Power Factor (F5)</span>
            <span className="text-blue-400">PF</span>
          </div>
          <div className="text-xl lg:text-2xl font-black text-blue-400 font-mono tracking-tight">
            {pf}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Grid Compliance</div>
        </div>

        {/* Field 6: Relay Status */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-teal-500/50 transition-all">
          <div className="text-xs text-slate-400 font-semibold mb-1 flex justify-between">
            <span>Relay (F6)</span>
            <Zap className="w-3.5 h-3.5 text-teal-400" />
          </div>
          <div className={`text-base lg:text-lg font-extrabold font-mono tracking-tight ${lastFeed?.field6 === '0' ? 'text-rose-400' : 'text-emerald-400'}`}>
            {relayState}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">GPIO 26 Safety</div>
        </div>
      </div>

      {/* FEED TIMELINE HISTORY & THINGSPEAK EMBED OPTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        {/* RECENT FEEDS TABLE */}
        <div className="lg:col-span-2 bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-400 pb-2 border-b border-slate-800">
            <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
              <Activity className="w-3.5 h-3.5" />
              Recent Feeds Received from Cloud ({historyFeeds.length})
            </span>
            <span>Update Rate: ~15s</span>
          </div>

          {historyFeeds.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              No ThingSpeak feeds found yet. Click <strong>"Push Telemetry"</strong> above or send data from your ESP32.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-800/80 pb-1">
                    <th className="py-1.5 px-2">Timestamp</th>
                    <th className="py-1.5 px-2 text-amber-400">Voltage</th>
                    <th className="py-1.5 px-2 text-cyan-400">Current</th>
                    <th className="py-1.5 px-2 text-emerald-400">Power</th>
                    <th className="py-1.5 px-2 text-purple-400">kWh</th>
                    <th className="py-1.5 px-2 text-teal-400">Relay</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {historyFeeds.slice().reverse().slice(0, 6).map((f) => (
                    <tr key={f.entry_id} className="hover:bg-slate-900/50">
                      <td className="py-1.5 px-2 text-slate-400 text-[11px]">
                        {new Date(f.created_at).toLocaleTimeString()}
                      </td>
                      <td className="py-1.5 px-2 text-amber-300">{f.field1 ? `${f.field1}V` : '-'}</td>
                      <td className="py-1.5 px-2 text-cyan-300">{f.field2 ? `${f.field2}A` : '-'}</td>
                      <td className="py-1.5 px-2 text-emerald-300">{f.field3 ? `${f.field3}W` : '-'}</td>
                      <td className="py-1.5 px-2 text-purple-300">{f.field4 ? `${f.field4}` : '-'}</td>
                      <td className="py-1.5 px-2">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${f.field6 === '0' ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                          {f.field6 === '0' ? 'OFF' : 'ON'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* THINGSPEAK EMBEDDED CHART IFRAME / LINK */}
        <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 pb-2 border-b border-slate-800">
              <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
                <Radio className="w-3.5 h-3.5" />
                ThingSpeak Live Graph
              </span>
            </div>

            {channelId ? (
              <div className="mt-3 rounded-xl overflow-hidden border border-slate-800 bg-slate-900 h-[170px] relative">
                <iframe
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  src={`https://thingspeak.com/channels/${channelId}/charts/1?bgcolor=%230f172a&color=%23f59e0b&dynamic=true&type=line&title=Voltage+(V)`}
                  title="ThingSpeak Live Voltage Chart"
                />
              </div>
            ) : (
              <div className="mt-3 rounded-xl border border-slate-800 bg-slate-900/50 p-6 text-center text-xs text-slate-500">
                Configure your Channel ID to embed live ThingSpeak MATLAB line charts.
              </div>
            )}
          </div>

          {channelId && (
            <a
              href={`https://thingspeak.com/channels/${channelId}`}
              target="_blank"
              rel="noreferrer"
              className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-400 hover:text-cyan-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
            >
              <span>View Full ThingSpeak Channel Dashboard</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>

    </div>
  );
};
