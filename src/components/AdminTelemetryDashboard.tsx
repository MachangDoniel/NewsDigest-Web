import React, { useState, useEffect } from 'react';
import {
  Database,
  Cpu,
  Server,
  Activity,
  ArrowUpRight,
  RefreshCw,
  Clock,
  HardDrive,
  Users,
  Search,
  Download,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Wifi,
  Trash2,
  Layers,
  Laptop,
  Smartphone,
  Bot,
  Globe,
  Radio,
} from 'lucide-react';
import { TelemetrySummary, AccessLog } from '../services/telemetryServer';

interface AdminTelemetryDashboardProps {
  token?: string;
}

export const AdminTelemetryDashboard: React.FC<AdminTelemetryDashboardProps> = ({ token }) => {
  const [telemetry, setTelemetry] = useState<TelemetrySummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPinging, setIsPinging] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [searchLog, setSearchLog] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'clients' | 'endpoints' | 'logs'>('overview');
  const [pingResult, setPingResult] = useState<{
    ok: boolean;
    pingMs: number;
    totalRows?: number;
    error?: string;
  } | null>(null);

  const fetchTelemetry = async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const authToken = token || localStorage.getItem('newsdigest_admin_token') || 'newsdigest-admin-2026';
      const res = await fetch('/api/admin/telemetry', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setTelemetry(data);
      }
    } catch (err) {
      console.warn('Failed to load telemetry:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
  }, [token]);

  // Auto-refresh interval (every 5 seconds)
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchTelemetry(true);
    }, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh, token]);

  const handlePingSupabase = async () => {
    setIsPinging(true);
    setPingResult(null);
    try {
      const authToken = token || localStorage.getItem('newsdigest_admin_token') || 'newsdigest-admin-2026';
      const res = await fetch('/api/admin/supabase-ping', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      const data = await res.json();
      setPingResult(data);
      fetchTelemetry(true);
    } catch (err: any) {
      setPingResult({ ok: false, pingMs: 0, error: err.message });
    } finally {
      setIsPinging(false);
    }
  };

  const handleResetTelemetry = async () => {
    if (!window.confirm('Reset all session telemetry, IP access logs, and counters?')) return;
    try {
      const authToken = token || localStorage.getItem('newsdigest_admin_token') || 'newsdigest-admin-2026';
      await fetch('/api/admin/telemetry/reset', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      fetchTelemetry();
    } catch (err) {
      console.warn('Reset error:', err);
    }
  };

  const handleExportLogs = () => {
    if (!telemetry) return;
    const blob = new Blob([JSON.stringify(telemetry, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsdigest-telemetry-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading && !telemetry) {
    return (
      <div className="p-8 text-center bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-subtle)] space-y-3">
        <RefreshCw className="w-6 h-6 animate-spin text-[#007aff] mx-auto" />
        <div className="text-xs font-semibold text-[var(--text-muted)]">
          Loading Supabase & API telemetry…
        </div>
      </div>
    );
  }

  if (!telemetry) return null;

  const { supabase, gemini, server, traffic, recentLogs } = telemetry;

  // Filter logs by search term
  const filteredLogs = recentLogs.filter((log) => {
    if (!searchLog.trim()) return true;
    const term = searchLog.toLowerCase();
    return (
      log.path.toLowerCase().includes(term) ||
      log.ip.toLowerCase().includes(term) ||
      log.method.toLowerCase().includes(term) ||
      String(log.status).includes(term)
    );
  });

  // Calculate max requests in hourly chart for relative bar height
  const maxHourlyRequests = Math.max(...traffic.hourly.map((h) => h.requests), 10);

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[var(--bg-surface)] p-4 rounded-2xl border border-[var(--border-subtle)] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-sm font-bold text-[var(--text-primary)]">
              Supabase Database & API Quota Monitor
            </h2>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Telemetry
            </span>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Real-time access tracker, usage analytics, quota headroom & client consumers
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
              autoRefresh
                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                : 'bg-black/5 dark:bg-white/5 text-[var(--text-muted)] border-transparent'
            }`}
            title={autoRefresh ? 'Auto-refreshing every 5 seconds' : 'Auto-refresh paused'}
          >
            <Radio className={`w-3.5 h-3.5 ${autoRefresh ? 'animate-pulse text-emerald-500' : ''}`} />
            <span>{autoRefresh ? 'Live (5s)' : 'Paused'}</span>
          </button>

          <button
            onClick={() => fetchTelemetry()}
            disabled={isRefreshing}
            className="px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#007aff]' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleExportLogs}
            className="px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5 transition-all"
            title="Export complete telemetry audit report in JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>

          <button
            onClick={handleResetTelemetry}
            className="px-2.5 py-1.5 rounded-xl border border-red-500/30 hover:bg-red-500/10 text-red-600 text-xs font-semibold transition-all"
            title="Reset telemetry counters"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 4 Main Quota & Telemetry Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Gauge 1: Supabase API Requests Remaining */}
        <div className="bg-[var(--bg-surface)] p-4 rounded-2xl border border-[var(--border-subtle)] shadow-xs space-y-3 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1.5">
              <Database className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Supabase Monthly Quota</span>
            </span>
            <span className={`inline-flex items-center gap-1 text-[11px] font-bold ${
              supabase.status === 'connected' ? 'text-emerald-600' : 'text-amber-500'
            }`}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {supabase.lastPingMs}ms
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="text-2xl font-black text-[var(--text-primary)] font-mono">
                {supabase.remainingMonth.toLocaleString()}
              </div>
              <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
                Requests left this month
              </div>
            </div>

            {/* Circular Ring Gauge */}
            <div className="relative w-12 h-12 shrink-0 flex items-center justify-center">
              <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="14" fill="none" stroke="currentColor" strokeWidth="3" className="text-black/10 dark:text-white/10" />
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3"
                  strokeDasharray="88"
                  strokeDashoffset={Math.max(0, 88 - (88 * (100 - supabase.percentUsed)) / 100)}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-[10px] font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {Math.round(100 - supabase.percentUsed)}%
              </span>
            </div>
          </div>

          {/* Subtext info */}
          <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
            <span>Used: <b>{supabase.callsMonth.toLocaleString()}</b> / {supabase.monthlyLimit.toLocaleString()}</span>
            <button
              onClick={handlePingSupabase}
              disabled={isPinging}
              className="text-[#007aff] font-semibold hover:underline flex items-center gap-1 disabled:opacity-50"
            >
              <Wifi className={`w-3 h-3 ${isPinging ? 'animate-pulse' : ''}`} />
              <span>{isPinging ? 'Pinging…' : 'Ping test'}</span>
            </button>
          </div>
        </div>

        {/* Gauge 2: Gemini AI Daily Quota */}
        <div className="bg-[var(--bg-surface)] p-4 rounded-2xl border border-[var(--border-subtle)] shadow-xs space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>Gemini AI Daily Quota</span>
            </span>
            <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 font-mono">
              {gemini.rpmCurrent} / {gemini.rpmLimit} RPM
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="text-2xl font-black text-[var(--text-primary)] font-mono">
                {gemini.remainingToday.toLocaleString()}
              </div>
              <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
                AI Calls left today
              </div>
            </div>

            {/* Circular Ring Gauge */}
            <div className="relative w-12 h-12 shrink-0 flex items-center justify-center">
              <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="14" fill="none" stroke="currentColor" strokeWidth="3" className="text-black/10 dark:text-white/10" />
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="#a855f7"
                  strokeWidth="3"
                  strokeDasharray="88"
                  strokeDashoffset={Math.max(0, 88 - (88 * (100 - gemini.percentUsed)) / 100)}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-[10px] font-bold font-mono text-purple-600 dark:text-purple-400">
                {Math.round(100 - gemini.percentUsed)}%
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
            <span>Used: <b>{gemini.callsToday}</b> / {gemini.dailyLimit.toLocaleString()}</span>
            <span className="text-[10px] text-purple-600 font-medium">Reset at 00:00 UTC</span>
          </div>
        </div>

        {/* Gauge 3: Database Storage Footprint */}
        <div className="bg-[var(--bg-surface)] p-4 rounded-2xl border border-[var(--border-subtle)] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1.5">
              <HardDrive className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span>Database Storage</span>
            </span>
            <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400 font-mono">
              {((supabase.storageUsedMb / supabase.storageLimitMb) * 100).toFixed(1)}%
            </span>
          </div>

          <div>
            <div className="text-2xl font-black text-[var(--text-primary)] font-mono">
              {supabase.storageUsedMb} <span className="text-sm font-semibold">MB</span>
            </div>
            <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
              of {supabase.storageLimitMb} MB Free Tier cap
            </div>
          </div>

          {/* Linear Progress Bar */}
          <div className="w-full bg-black/5 dark:bg-white/10 h-2 rounded-full overflow-hidden">
            <div
              className="bg-sky-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (supabase.storageUsedMb / supabase.storageLimitMb) * 100)}%` }}
            />
          </div>

          <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
            <span>Free space: <b>{(supabase.storageLimitMb - supabase.storageUsedMb).toFixed(1)} MB</b></span>
            <span>~{supabase.totalRowsEstimate} broadsheets</span>
          </div>
        </div>

        {/* Gauge 4: Web Server & Clients Online */}
        <div className="bg-[var(--bg-surface)] p-4 rounded-2xl border border-[var(--border-subtle)] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1.5">
              <Server className="w-4 h-4 text-[#007aff]" />
              <span>Server &amp; Traffic</span>
            </span>
            <span className="text-[11px] font-bold text-[#007aff] font-mono">
              {server.memoryMb} MB heap
            </span>
          </div>

          <div>
            <div className="text-2xl font-black text-[var(--text-primary)] font-mono">
              {server.totalRequestsToday.toLocaleString()}
            </div>
            <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
              API requests handled today
            </div>
          </div>

          <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
            <span>Uptime: <b>{Math.floor(server.uptimeSeconds / 3600)}h {Math.floor((server.uptimeSeconds % 3600) / 60)}m</b></span>
            <span>{traffic.topClients.length} distinct clients</span>
          </div>
        </div>
      </div>

      {/* Ping Probe result alert if present */}
      {pingResult && (
        <div className={`p-3.5 rounded-2xl border text-xs flex items-start justify-between gap-3 ${
          pingResult.ok
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-300'
            : 'bg-red-500/10 border-red-500/20 text-red-800 dark:text-red-300'
        }`}>
          <div className="flex items-center gap-2">
            {pingResult.ok ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <div>
              <span className="font-bold">
                {pingResult.ok ? 'Supabase Live Probe Successful!' : 'Supabase Probe Warning'}
              </span>
              <p className="opacity-90 mt-0.5">
                {pingResult.ok
                  ? `Round-trip latency: ${pingResult.pingMs}ms. Confirmed live connectivity with remote Supabase cluster.`
                  : `Failed to query Supabase: ${pingResult.error}`}
              </p>
            </div>
          </div>

          <button
            onClick={() => setPingResult(null)}
            className="text-xs opacity-60 hover:opacity-100 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Tab Navigation for Visual Views */}
      <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2 overflow-x-auto no-scrollbar text-xs font-semibold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
            activeTab === 'overview'
              ? 'bg-[#007aff] text-white shadow-xs font-bold'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Traffic Trend Chart</span>
        </button>

        <button
          onClick={() => setActiveTab('clients')}
          className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
            activeTab === 'clients'
              ? 'bg-[#007aff] text-white shadow-xs font-bold'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Who Is Accessing ({traffic.topClients.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('endpoints')}
          className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
            activeTab === 'endpoints'
              ? 'bg-[#007aff] text-white shadow-xs font-bold'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Endpoint Heatmap ({traffic.topEndpoints.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
            activeTab === 'logs'
              ? 'bg-[#007aff] text-white shadow-xs font-bold'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Live Audit Log ({recentLogs.length})</span>
        </button>
      </div>

      {/* VIEW 1: Hourly Traffic Trend Chart */}
      {activeTab === 'overview' && (
        <div className="bg-[var(--bg-surface)] p-5 rounded-2xl border border-[var(--border-subtle)] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                24-Hour Request Flow &amp; Supabase Calls
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Hourly visual distribution comparing incoming web client hits vs background database queries
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-[#007aff]" />
                <span className="text-[var(--text-secondary)]">Client Requests</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-emerald-500" />
                <span className="text-[var(--text-secondary)]">Supabase Queries</span>
              </div>
            </div>
          </div>

          {/* SVG Bar Chart */}
          <div className="h-48 w-full flex items-end gap-2 pt-6 pb-2 px-2 border-b border-[var(--border-subtle)]">
            {traffic.hourly.map((h, i) => {
              const reqHeight = Math.max(8, (h.requests / maxHourlyRequests) * 140);
              const supaHeight = Math.max(4, (h.supabase / maxHourlyRequests) * 140);

              return (
                <div key={i} className="flex-1 flex flex-col items-center justify-end h-full gap-1 group relative">
                  {/* Tooltip on hover */}
                  <div className="absolute -top-12 bg-neutral-900 text-white text-[10px] px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20 font-mono">
                    <div>{h.hour}</div>
                    <div>Req: {h.requests} · Supa: {h.supabase}</div>
                  </div>

                  <div className="w-full flex items-end justify-center gap-0.5 h-full">
                    {/* Client Requests Bar */}
                    <div
                      className="w-full max-w-[14px] bg-[#007aff] hover:bg-[#0062cc] rounded-t transition-all"
                      style={{ height: `${reqHeight}px` }}
                    />
                    {/* Supabase Calls Bar */}
                    <div
                      className="w-full max-w-[8px] bg-emerald-500 hover:bg-emerald-600 rounded-t transition-all"
                      style={{ height: `${supaHeight}px` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-[var(--text-muted)] rotate-0 mt-1">
                    {h.hour}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs text-[var(--text-secondary)]">
            <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 space-y-1">
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Peak Request Hour</span>
              <div className="text-sm font-bold text-[var(--text-primary)] font-mono">
                {traffic.hourly.reduce((max, h) => (h.requests > max.requests ? h : max), traffic.hourly[0] || { hour: '--', requests: 0 }).hour} ({Math.max(...traffic.hourly.map(h => h.requests), 0)} reqs)
              </div>
            </div>

            <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 space-y-1">
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Total Supabase Queries Today</span>
              <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                {supabase.callsToday.toLocaleString()} calls
              </div>
            </div>

            <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 space-y-1">
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">AI Synthesis Invocations</span>
              <div className="text-sm font-bold text-purple-600 dark:text-purple-400 font-mono">
                {gemini.callsToday} calls today
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: Who Is Accessing (Top Clients Breakdown) */}
      {activeTab === 'clients' && (
        <div className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-subtle)] shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Active Consumers &amp; Client IP Breakdown
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Who is requesting data, how many requests they made, and device fingerprint
              </p>
            </div>
            <span className="text-xs font-mono text-[var(--text-muted)]">
              {traffic.topClients.length} active client sources
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-black/5 dark:bg-white/5 text-[var(--text-muted)] font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-4">Client IP</th>
                  <th className="py-2.5 px-4">Device</th>
                  <th className="py-2.5 px-4">User Agent</th>
                  <th className="py-2.5 px-4 text-right">Requests</th>
                  <th className="py-2.5 px-4">Traffic Share</th>
                  <th className="py-2.5 px-4 text-right">Last Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {traffic.topClients.map((client, idx) => (
                  <tr key={idx} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[var(--text-primary)]">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span>{client.ip === '127.0.0.1' || client.ip === '::1' ? '127.0.0.1 (Local Server)' : client.ip}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--text-secondary)]">
                        {client.device === 'Mobile' ? (
                          <Smartphone className="w-3.5 h-3.5 text-blue-500" />
                        ) : client.device === 'Bot' ? (
                          <Bot className="w-3.5 h-3.5 text-purple-500" />
                        ) : (
                          <Laptop className="w-3.5 h-3.5 text-emerald-500" />
                        )}
                        <span>{client.device}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[var(--text-muted)] max-w-xs truncate" title={client.userAgent}>
                      {client.userAgent}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[var(--text-primary)]">
                      {client.count.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 w-40">
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-black/10 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-[#007aff] h-full rounded-full"
                            style={{ width: `${Math.min(100, client.percent)}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-[var(--text-muted)] shrink-0">
                          {client.percent}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right text-[var(--text-muted)] font-mono text-[11px]">
                      {new Date(client.lastSeen).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: Endpoint Heatmap */}
      {activeTab === 'endpoints' && (
        <div className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-subtle)] shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                API Endpoint Traffic &amp; Response Latency
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Which routes get called most frequently and average backend processing time
              </p>
            </div>
            <span className="text-xs font-mono text-[var(--text-muted)]">
              {traffic.topEndpoints.length} active routes
            </span>
          </div>

          <div className="divide-y divide-[var(--border-subtle)]">
            {traffic.topEndpoints.map((ep, idx) => (
              <div key={idx} className="p-4 flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#007aff]/10 text-[#007aff]">
                      GET
                    </span>
                    <span className="font-mono font-bold text-xs text-[var(--text-primary)]">
                      {ep.endpoint}
                    </span>
                  </div>
                  <div className="text-[11px] text-[var(--text-muted)]">
                    Total requests: <b className="text-[var(--text-primary)]">{ep.count.toLocaleString()}</b>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-bold ${
                    ep.avgLatencyMs < 60
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : ep.avgLatencyMs < 200
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      : 'bg-red-500/10 text-red-600 dark:text-red-400'
                  }`}>
                    {ep.avgLatencyMs} ms avg
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 4: Live Audit Log */}
      {activeTab === 'logs' && (
        <div className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-subtle)] shadow-xs overflow-hidden space-y-3">
          <div className="p-4 border-b border-[var(--border-subtle)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Live Real-Time Access Audit Stream
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Every request hitting your backend with response status, latency & client IP
              </p>
            </div>

            {/* Filter Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                value={searchLog}
                onChange={(e) => setSearchLog(e.target.value)}
                placeholder="Filter path, IP, status..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[#007aff]"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-black/5 dark:bg-white/5 text-[var(--text-muted)] font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-4">Time</th>
                  <th className="py-2.5 px-4">Method</th>
                  <th className="py-2.5 px-4">Path</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Latency</th>
                  <th className="py-2.5 px-4 text-right">Client IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)] font-mono text-[11px]">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <td className="py-2.5 px-4 text-[var(--text-muted)]">
                      {log.time}
                    </td>
                    <td className="py-2.5 px-4">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        log.method === 'GET'
                          ? 'bg-blue-500/10 text-blue-600'
                          : 'bg-emerald-500/10 text-emerald-600'
                      }`}>
                        {log.method}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-[var(--text-primary)] font-semibold max-w-xs truncate">
                      {log.path}
                    </td>
                    <td className="py-2.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        log.status < 300
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                          : log.status < 400
                          ? 'bg-sky-500/15 text-sky-700 dark:text-sky-300'
                          : 'bg-red-500/15 text-red-700 dark:text-red-300'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right text-[var(--text-secondary)]">
                      {log.latencyMs}ms
                    </td>
                    <td className="py-2.5 px-4 text-right text-[var(--text-muted)]">
                      {log.ip}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
