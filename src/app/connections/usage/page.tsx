'use client';

import { useEffect, useState, useCallback } from 'react';

interface ServerStats {
  total: number;
  success: number;
  error: number;
  avgLatency: number;
}

interface TopTool {
  tool: string;
  action: string;
  count: number;
}

interface RecentError {
  server: string;
  tool: string;
  action: string;
  timestamp: string;
}

interface UsageData {
  period: string;
  totalCalls: number;
  successCount: number;
  errorCount: number;
  errorRate: number;
  avgLatency: number;
  byServer: Record<string, ServerStats>;
  byDay: Record<string, number>;
  topTools: TopTool[];
  recentErrors: RecentError[];
}

type Period = '7d' | '30d' | '90d';

const SERVER_LABELS: Record<string, string> = {
  google: 'Google',
  ghl: 'GoHighLevel',
  meta: 'Meta Business',
  zoom: 'Zoom',
  klaviyo: 'Klaviyo',
  quickbooks: 'QuickBooks',
  stripe: 'Stripe',
  vercel: 'Vercel',
  nanobanana: 'NanoBanana',
  'mission-control': 'Mission Control',
  supabase: 'Supabase',
};

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatTimestamp(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function UsagePage() {
  const [data, setData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>('7d');
  const userId = 'placeholder-user-id';

  const fetchUsage = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/portal/usage?user_id=${userId}&period=${period}`);
      if (res.ok) setData(await res.json());
    } catch (err) {
      console.error('Failed to fetch usage data:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, period]);

  useEffect(() => { fetchUsage(); }, [fetchUsage]);

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <p className="eyebrow mb-2">Analytics</p>
          <h2 className="text-2xl font-bold text-white">Usage Analytics</h2>
          <p className="mt-1 text-sm text-[#6B7280]">
            Monitor your MCP connector usage and API call metrics.
          </p>
          <div className="mt-4 h-0.5 w-14 bg-gradient-to-r from-[#E91E8C] to-[#00D9FF] rounded-full" />
        </div>

        {/* Period selector */}
        <div className="flex rounded-xl overflow-hidden mt-2 border border-[#2A2A3E] bg-[#12121A]">
          {(['7d', '30d', '90d'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 text-sm font-medium transition-all ${
                period === p
                  ? 'bg-[#E91E8C] text-white'
                  : 'text-[#6B7280] hover:text-white hover:bg-[#1A1A2E]'
              }`}
            >
              {p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2A2A3E] border-t-[#E91E8C]" />
        </div>
      )}

      {!loading && data && (
        <>
          {/* Summary cards */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard label="Total API Calls" value={formatNumber(data.totalCalls)} sub={period === '7d' ? 'Last 7 days' : period === '30d' ? 'Last 30 days' : 'Last 90 days'} color="cyan" />
            <SummaryCard label="Success Rate" value={data.totalCalls > 0 ? `${(100 - data.errorRate).toFixed(1)}%` : '--'} sub={`${formatNumber(data.successCount)} successful`} color="green" />
            <SummaryCard label="Error Rate" value={data.totalCalls > 0 ? `${data.errorRate}%` : '--'} sub={`${formatNumber(data.errorCount)} failed`} color={data.errorRate > 5 ? 'red' : 'muted'} />
            <SummaryCard label="Avg Latency" value={data.avgLatency > 0 ? `${data.avgLatency}ms` : '--'} sub="Per request" color="muted" />
          </div>

          {/* Daily usage chart */}
          <div className="mb-8 rounded-xl p-6 bg-[#12121A] border border-[#2A2A3E]">
            <p className="eyebrow mb-4">API Calls per Day</p>
            {Object.keys(data.byDay).length > 0 ? (
              <DailyChart byDay={data.byDay} />
            ) : (
              <p className="py-8 text-center text-sm text-[#6B7280]">No usage data for this period</p>
            )}
          </div>

          {/* Two-column layout */}
          <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* By Server */}
            <div className="rounded-xl p-6 bg-[#12121A] border border-[#2A2A3E]">
              <p className="eyebrow mb-4">Calls by Server</p>
              {Object.keys(data.byServer).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(data.byServer)
                    .sort((a, b) => b[1].total - a[1].total)
                    .map(([server, stats]) => (
                      <ServerRow key={server} server={server} stats={stats} maxTotal={Math.max(...Object.values(data.byServer).map((s) => s.total))} />
                    ))}
                </div>
              ) : (
                <p className="py-8 text-center text-sm text-[#6B7280]">No server usage data</p>
              )}
            </div>

            {/* Top Tools */}
            <div className="rounded-xl p-6 bg-[#12121A] border border-[#2A2A3E]">
              <p className="eyebrow mb-4">Top Tools</p>
              {data.topTools.length > 0 ? (
                <div className="overflow-hidden rounded-lg border border-[#2A2A3E]">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#2A2A3E] bg-[#1A1A2E]">
                        {['Tool', 'Action', 'Calls'].map((h) => (
                          <th key={h} className={`px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-[#6B7280] ${h === 'Calls' ? 'text-right' : 'text-left'}`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.topTools.map((t, i) => (
                        <tr key={i} className="border-b border-[#2A2A3E] last:border-0">
                          <td className="whitespace-nowrap px-4 py-2.5 font-mono text-xs text-[#A1A1AA]">{t.tool}</td>
                          <td className="whitespace-nowrap px-4 py-2.5 text-xs text-[#6B7280]">{t.action || '--'}</td>
                          <td className="whitespace-nowrap px-4 py-2.5 text-right text-xs font-semibold text-[#C9A84C]">{formatNumber(t.count)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="py-8 text-center text-sm text-[#6B7280]">No tool usage data</p>
              )}
            </div>
          </div>

          {/* Recent errors */}
          <div className="rounded-xl p-6 bg-[#12121A] border border-[#2A2A3E]">
            <p className="eyebrow mb-4">Recent Errors</p>
            {data.recentErrors.length > 0 ? (
              <div className="overflow-hidden rounded-lg border border-[#2A2A3E]">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#2A2A3E] bg-[#1A1A2E]">
                      {['Timestamp', 'Server', 'Tool', 'Action'].map((h) => (
                        <th key={h} className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-[#6B7280]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentErrors.map((e, i) => (
                      <tr key={i} className="border-b border-[#2A2A3E] last:border-0">
                        <td className="whitespace-nowrap px-4 py-2.5 text-xs text-[#6B7280]">{formatTimestamp(e.timestamp)}</td>
                        <td className="whitespace-nowrap px-4 py-2.5 text-xs font-medium text-[#A1A1AA]">{SERVER_LABELS[e.server] || e.server}</td>
                        <td className="whitespace-nowrap px-4 py-2.5 font-mono text-xs text-[#6B7280]">{e.tool}</td>
                        <td className="whitespace-nowrap px-4 py-2.5 text-xs text-[#EF4444]">{e.action || '--'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 py-6">
                <svg className="h-5 w-5 text-[#34D399]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                <p className="text-sm text-[#6B7280]">No errors in this period</p>
              </div>
            )}
          </div>
        </>
      )}

      {!loading && !data && (
        <div className="rounded-xl py-20 text-center border border-dashed border-[#2A2A3E] bg-[#12121A]/50">
          <h3 className="text-sm font-semibold text-white mb-2">Unable to load usage data</h3>
          <p className="text-sm text-[#6B7280]">Please try again later.</p>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value, sub, color }: { label: string; value: string; sub: string; color: 'cyan' | 'green' | 'red' | 'muted' }) {
  const colorMap: Record<string, string> = {
    cyan: '#00D9FF',
    green: '#34D399',
    red: '#EF4444',
    muted: '#A1A1AA',
  };

  return (
    <div className="rounded-xl p-5 bg-[#12121A] border border-[#2A2A3E]">
      <p className="eyebrow">{label}</p>
      <p className="mt-2 text-3xl font-bold" style={{ color: colorMap[color] }}>{value}</p>
      <p className="mt-1 text-xs text-[#6B7280]">{sub}</p>
    </div>
  );
}

function ServerRow({ server, stats, maxTotal }: { server: string; stats: ServerStats; maxTotal: number }) {
  const label = SERVER_LABELS[server] || server;
  const pct = maxTotal > 0 ? (stats.total / maxTotal) * 100 : 0;
  const errorPct = stats.total > 0 ? (stats.error / stats.total) * 100 : 0;

  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-white">{label}</span>
        <div className="flex items-center gap-3">
          <span className="text-[#6B7280]">{stats.avgLatency}ms avg</span>
          {errorPct > 0 && <span className="text-[#EF4444]">{errorPct.toFixed(1)}% err</span>}
          <span className="font-semibold text-white">{formatNumber(stats.total)}</span>
        </div>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[#1A1A2E]">
        <div className="h-full rounded-full transition-all bg-gradient-to-r from-[#E91E8C] to-[#00D9FF]" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function DailyChart({ byDay }: { byDay: Record<string, number> }) {
  const entries = Object.entries(byDay).sort((a, b) => a[0].localeCompare(b[0]));
  const maxVal = Math.max(...entries.map(([, v]) => v), 1);

  return (
    <div className="flex items-end gap-1" style={{ height: 160 }}>
      {entries.map(([day, count]) => {
        const height = Math.max((count / maxVal) * 140, 2);
        return (
          <div key={day} className="group relative flex flex-1 flex-col items-center">
            <div className="pointer-events-none absolute -top-10 left-1/2 z-10 hidden -translate-x-1/2 rounded-lg bg-[#1A1A2E] px-2.5 py-1.5 text-xs shadow-lg border border-[#2A2A3E] group-hover:block whitespace-nowrap">
              <div className="font-semibold text-white">{formatNumber(count)} calls</div>
              <div className="text-[#6B7280]">{formatDate(day)}</div>
            </div>
            <div className="w-full rounded-t transition-opacity hover:opacity-80 bg-gradient-to-t from-[#E91E8C] to-[#00D9FF]" style={{ height }} />
            {entries.length <= 14 || entries.indexOf(entries.find(([d]) => d === day)!) % Math.ceil(entries.length / 10) === 0 ? (
              <span className="mt-1.5 text-[10px] text-[#6B7280]">{formatDate(day)}</span>
            ) : (
              <span className="mt-1.5 text-[10px] text-transparent">.</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
