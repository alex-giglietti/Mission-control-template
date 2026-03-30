import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase';

// GET /api/portal/usage?user_id=...&period=7d|30d|90d
// Returns usage analytics from mcp_usage_logs
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const userId = url.searchParams.get('user_id');
  const period = url.searchParams.get('period') || '7d';

  if (!userId) {
    return NextResponse.json(
      { error: 'user_id query parameter is required' },
      { status: 400 }
    );
  }

  const supabase = getAdminClient();

  // Calculate date range
  const days = period === '90d' ? 90 : period === '30d' ? 30 : 7;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  // Fetch raw usage logs for the period
  const { data: logs, error: logsError } = await supabase
    .from('mcp_usage_logs')
    .select('server, tool_name, action, status, latency_ms, created_at')
    .eq('user_id', userId)
    .gte('created_at', since)
    .order('created_at', { ascending: true })
    .limit(10000);

  if (logsError) {
    console.error('[portal/usage] Database error:', logsError.message);
    return NextResponse.json(
      { error: 'Failed to fetch usage data' },
      { status: 500 }
    );
  }

  const entries = logs ?? [];

  // --- Aggregate stats ---

  // Total calls
  const totalCalls = entries.length;

  // Success / error counts
  const successCount = entries.filter((e) => e.status === 'success').length;
  const errorCount = entries.filter((e) => e.status === 'error').length;

  // Average latency
  const latencies = entries.filter((e) => e.latency_ms != null).map((e) => e.latency_ms as number);
  const avgLatency = latencies.length > 0
    ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)
    : 0;

  // Calls per server
  const byServer: Record<string, { total: number; success: number; error: number; avgLatency: number }> = {};
  for (const entry of entries) {
    const s = entry.server;
    if (!byServer[s]) byServer[s] = { total: 0, success: 0, error: 0, avgLatency: 0 };
    byServer[s].total++;
    if (entry.status === 'success') byServer[s].success++;
    else byServer[s].error++;
  }
  // compute avg latency per server
  for (const s of Object.keys(byServer)) {
    const serverLatencies = entries
      .filter((e) => e.server === s && e.latency_ms != null)
      .map((e) => e.latency_ms as number);
    byServer[s].avgLatency = serverLatencies.length > 0
      ? Math.round(serverLatencies.reduce((a, b) => a + b, 0) / serverLatencies.length)
      : 0;
  }

  // Calls per day (for chart)
  const byDay: Record<string, number> = {};
  for (const entry of entries) {
    const day = entry.created_at.slice(0, 10); // YYYY-MM-DD
    byDay[day] = (byDay[day] || 0) + 1;
  }

  // Top tools
  const byTool: Record<string, number> = {};
  for (const entry of entries) {
    const key = `${entry.tool_name}:${entry.action || ''}`;
    byTool[key] = (byTool[key] || 0) + 1;
  }
  const topTools = Object.entries(byTool)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([key, count]) => {
      const [tool, action] = key.split(':');
      return { tool, action, count };
    });

  // Recent errors
  const recentErrors = entries
    .filter((e) => e.status === 'error')
    .slice(-20)
    .reverse()
    .map((e) => ({
      server: e.server,
      tool: e.tool_name,
      action: e.action,
      timestamp: e.created_at,
    }));

  return NextResponse.json({
    period,
    totalCalls,
    successCount,
    errorCount,
    errorRate: totalCalls > 0 ? Math.round((errorCount / totalCalls) * 10000) / 100 : 0,
    avgLatency,
    byServer,
    byDay,
    topTools,
    recentErrors,
  });
}
