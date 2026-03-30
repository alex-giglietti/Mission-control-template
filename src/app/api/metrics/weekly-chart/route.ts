import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { createClient } from '@libsql/client';
import { readFileSync } from 'fs';
import { join } from 'path';

export const dynamic = 'force-dynamic';

type TimePeriod = 'week' | 'month' | 'quarter' | 'year';

function getTursoClient() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url || !authToken) return null;
  return createClient({ url, authToken });
}

function getStripeKey(): string | null {
  try {
    const configPath = join(process.cwd(), '..', 'config', 'stripe.json');
    const config = JSON.parse(readFileSync(configPath, 'utf-8'));
    return config.secret_key;
  } catch {
    // Prefer Cashflow Empire key for revenue data
    return process.env.CASHFLOW_STRIPE_KEY || process.env.STRIPE_SECRET_KEY || null;
  }
}

interface FbConfig {
  accessToken: string;
  adAccounts: { aim_primary: string; [key: string]: string };
  apiVersion: string;
  baseUrl: string;
}

function getFbConfig(): FbConfig | null {
  try {
    if (process.env.FACEBOOK_CONFIG) return JSON.parse(process.env.FACEBOOK_CONFIG);
    const configPath = join(process.cwd(), '..', 'config', 'facebook.json');
    return JSON.parse(readFileSync(configPath, 'utf-8'));
  } catch {
    // Fall back to env vars
    if (process.env.FB_ACCESS_TOKEN && process.env.FB_AD_ACCOUNT_ID) {
      return {
        accessToken: process.env.FB_ACCESS_TOKEN,
        adAccounts: { aim_primary: process.env.FB_AD_ACCOUNT_ID },
        apiVersion: 'v18.0',
        baseUrl: 'https://graph.facebook.com',
      };
    }
    return null;
  }
}

// Fetch daily FB spend for a date range, return map of YYYY-MM-DD -> spend
async function getFbDailySpend(since: string, until: string): Promise<Record<string, number>> {
  const config = getFbConfig();
  if (!config) return {};
  try {
    const timeRange = encodeURIComponent(JSON.stringify({ since, until }));
    const url = `${config.baseUrl}/${config.apiVersion}/${config.adAccounts.aim_primary}/insights?fields=spend&time_increment=1&time_range=${timeRange}&access_token=${config.accessToken}`;
    const res = await fetch(url);
    if (!res.ok) return {};
    const data = await res.json();
    const map: Record<string, number> = {};
    for (const item of data.data || []) {
      map[item.date_start] = parseFloat(item.spend || '0');
    }
    return map;
  } catch {
    return {};
  }
}

function getPeriodConfig(period: TimePeriod): {
  startDate: Date;
  groupBy: 'day' | 'week' | 'month';
  labels: string[];
  dateKeys: string[];
} {
  const now = new Date();

  if (period === 'week') {
    const dayOfWeek = now.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const monday = new Date(now);
    monday.setDate(now.getDate() - daysToMonday);
    monday.setHours(0, 0, 0, 0);

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dateKeys = days.map((_, idx) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + idx);
      return d.toISOString().split('T')[0];
    });

    return { startDate: monday, groupBy: 'day', labels: days, dateKeys };
  }

  if (period === 'month') {
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const labels: string[] = [];
    const dateKeys: string[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      labels.push(d === 1 || d % 5 === 0 || d === daysInMonth ? `${d}` : '');
      const date = new Date(now.getFullYear(), now.getMonth(), d);
      dateKeys.push(date.toISOString().split('T')[0]);
    }
    return { startDate, groupBy: 'day', labels, dateKeys };
  }

  if (period === 'quarter') {
    const quarterMonth = Math.floor(now.getMonth() / 3) * 3;
    const quarterStart = new Date(now.getFullYear(), quarterMonth, 1);

    // Align to the Monday of the week containing quarter start
    // (SQL groups by Monday using DATE(x, 'weekday 0', '-6 days'))
    const dow = quarterStart.getDay(); // 0=Sun, 1=Mon...
    const daysToMonday = dow === 0 ? 6 : dow - 1;
    const firstMonday = new Date(quarterStart);
    firstMonday.setDate(quarterStart.getDate() - daysToMonday);
    firstMonday.setHours(0, 0, 0, 0);

    const labels: string[] = [];
    const dateKeys: string[] = [];
    for (let w = 0; w < 14; w++) {
      const weekStart = new Date(firstMonday);
      weekStart.setDate(firstMonday.getDate() + w * 7);
      // Stop once we've passed the end of the quarter (3 months from quarterStart)
      const quarterEnd = new Date(now.getFullYear(), quarterMonth + 3, 0);
      if (weekStart > quarterEnd) break;
      labels.push(`W${w + 1}`);
      dateKeys.push(weekStart.toISOString().split('T')[0]);
    }
    return { startDate: firstMonday, groupBy: 'week', labels, dateKeys };
  }

  // year
  const startDate = new Date(now.getFullYear(), 0, 1);
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dateKeys = monthNames.map((_, idx) => {
    return `${now.getFullYear()}-${String(idx + 1).padStart(2, '0')}-01`;
  });
  return { startDate, groupBy: 'month', labels: monthNames, dateKeys };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const period = (searchParams.get('period') || 'week') as TimePeriod;

  try {
    const client = getTursoClient();
    if (!client) throw new Error('No Turso client');

    const { startDate, groupBy, labels, dateKeys } = getPeriodConfig(period);

    // Get leads grouped by the appropriate time unit
    let leadsGroupSQL: string;
    if (groupBy === 'day') {
      leadsGroupSQL = `SELECT DATE(created_at) as period_key, COUNT(*) as count FROM leads WHERE created_at >= ? GROUP BY DATE(created_at)`;
    } else if (groupBy === 'week') {
      leadsGroupSQL = `SELECT DATE(created_at, 'weekday 0', '-6 days') as period_key, COUNT(*) as count FROM leads WHERE created_at >= ? GROUP BY DATE(created_at, 'weekday 0', '-6 days')`;
    } else {
      leadsGroupSQL = `SELECT strftime('%Y-%m', created_at) as period_key, COUNT(*) as count FROM leads WHERE created_at >= ? GROUP BY strftime('%Y-%m', created_at)`;
    }

    const leadsResult = await client.execute({ sql: leadsGroupSQL, args: [startDate.toISOString()] });

    // Get revenue from historical_stripe_transactions grouped similarly
    let revenueGroupSQL: string;
    if (groupBy === 'day') {
      revenueGroupSQL = `SELECT DATE(date) as period_key, SUM(amount) as total, COUNT(*) as sales FROM historical_stripe_transactions WHERE date >= ? GROUP BY DATE(date)`;
    } else if (groupBy === 'week') {
      revenueGroupSQL = `SELECT DATE(date, 'weekday 0', '-6 days') as period_key, SUM(amount) as total, COUNT(*) as sales FROM historical_stripe_transactions WHERE date >= ? GROUP BY DATE(date, 'weekday 0', '-6 days')`;
    } else {
      revenueGroupSQL = `SELECT strftime('%Y-%m', date) as period_key, SUM(amount) as total, COUNT(*) as sales FROM historical_stripe_transactions WHERE date >= ? GROUP BY strftime('%Y-%m', date)`;
    }

    const revenueResult = await client.execute({ sql: revenueGroupSQL, args: [startDate.toISOString()] });

    // Fetch FB daily spend for the period
    const todayStr = new Date().toISOString().split('T')[0];
    const fbDailySpend = await getFbDailySpend(startDate.toISOString().split('T')[0], todayStr);

    // Aggregate FB spend by period key (same grouping as revenue)
    const fbSpendByPeriod: Record<string, number> = {};
    for (const [dateStr, spend] of Object.entries(fbDailySpend)) {
      const d = new Date(dateStr);
      let periodKey: string;
      if (groupBy === 'day') {
        periodKey = dateStr;
      } else if (groupBy === 'week') {
        const dow = d.getDay();
        const monday = new Date(d);
        monday.setDate(d.getDate() - (dow === 0 ? 6 : dow - 1));
        periodKey = monday.toISOString().split('T')[0];
      } else {
        periodKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      }
      fbSpendByPeriod[periodKey] = (fbSpendByPeriod[periodKey] || 0) + spend;
    }

    // Also try to get live Stripe data for recent periods
    const liveStripeByDate: Record<string, { revenue: number; sales: number }> = {};
    try {
      const stripeKey = getStripeKey();
      if (stripeKey) {
        const startUnix = Math.floor(startDate.getTime() / 1000);
        const chargesUrl = `https://api.stripe.com/v1/charges?limit=100&created[gte]=${startUnix}`;
        const res = await fetch(chargesUrl, { headers: { Authorization: `Bearer ${stripeKey}` } });
        if (res.ok) {
          const data = await res.json();
          for (const charge of data.data || []) {
            if (charge.status !== 'succeeded') continue;
            const chargeDate = new Date(charge.created * 1000);
            let key: string;
            if (groupBy === 'day') {
              key = chargeDate.toISOString().split('T')[0];
            } else if (groupBy === 'week') {
              const d = new Date(chargeDate);
              const dow = d.getDay();
              d.setDate(d.getDate() - (dow === 0 ? 6 : dow - 1));
              key = d.toISOString().split('T')[0];
            } else {
              key = `${chargeDate.getFullYear()}-${String(chargeDate.getMonth() + 1).padStart(2, '0')}`;
            }
            if (!liveStripeByDate[key]) liveStripeByDate[key] = { revenue: 0, sales: 0 };
            liveStripeByDate[key].revenue += charge.amount / 100;
            liveStripeByDate[key].sales += 1;
          }
        }
      }
    } catch (e) {
      console.error('Live Stripe fetch failed:', e);
    }

    // Build chart data array
    const chartData = labels.map((label, idx) => {
      const key = dateKeys[idx];

      // For month groupBy, key format is YYYY-MM, otherwise YYYY-MM-DD
      let leadsLookupKey = key;
      let revenueLookupKey = key;
      if (groupBy === 'month') {
        leadsLookupKey = key.substring(0, 7); // YYYY-MM
        revenueLookupKey = key.substring(0, 7);
      }

      const leadsRow = leadsResult.rows.find(r => String(r.period_key).startsWith(leadsLookupKey));
      const revenueRow = revenueResult.rows.find(r => String(r.period_key).startsWith(revenueLookupKey));
      const liveRevenue = liveStripeByDate[key] || liveStripeByDate[revenueLookupKey];

      const spend = fbSpendByPeriod[key] || fbSpendByPeriod[revenueLookupKey] || 0;

      return {
        day: label,
        date: key,
        leads: Number(leadsRow?.count ?? 0),
        revenue: liveRevenue ? liveRevenue.revenue : Number(revenueRow?.total ?? 0),
        sales: liveRevenue ? liveRevenue.sales : Number(revenueRow?.sales ?? 0),
        adSpend: Math.round(spend),
      };
    });

    return NextResponse.json({ chartData, period, weekStart: startDate.toISOString() });
  } catch (error) {
    console.error('Weekly chart error:', error);
    return NextResponse.json({ error: 'Failed to fetch chart data' }, { status: 500 });
  }
}
