"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

type TabKey = "overview" | "leads" | "sales" | "customers" | "content";
type PresetKey = "TODAY" | "7D" | "30D" | "90D" | "YTD";

interface KPI {
  label: string;
  value: string | number;
  delta?: number | null; // positive = up, negative = down, null = no delta
}

interface Alert {
  level: "warn" | "error";
  message: string;
  link?: string;
  linkLabel?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toISO = (d: Date) => d.toISOString().split("T")[0];
const fromISO = (s: string) => {
  const [y, m, day] = s.split("-").map(Number);
  return new Date(y, m - 1, day);
};
const daysBetween = (a: Date, b: Date) =>
  Math.max(1, Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24)));

const fmtDate = (iso: string) => {
  const d = fromISO(iso);
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
};

const fmtMoney = (n: number) => {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n}`;
};

const fmtNum = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return `${n}`;
};

// ─── Placeholder data generator ───────────────────────────────────────────────

function buildKPIs(startDate: string, endDate: string): Record<TabKey, KPI[]> {
  const days = daysBetween(fromISO(startDate), fromISO(endDate));
  const m = days / 30; // multiplier vs 30-day baseline

  // Overview
  const revenue = Math.round(48_500 * m);
  const revPrev = Math.round(41_200 * m);
  const newLeads = Math.round(342 * m);
  const leadsPrev = Math.round(298 * m);
  const newSales = Math.round(12 * m);
  const aov = Math.round(revenue / Math.max(1, newSales));
  const adSpend = Math.round(4_200 * m);
  const roas = adSpend > 0 ? Math.round((revenue / adSpend) * 10) / 10 : 0;

  // Leads
  const views = Math.round(45_000 * m);
  const cpl = newLeads > 0 ? Math.round((adSpend / newLeads) * 100) / 100 : 0;

  // Sales
  const pipeline = Math.round(revenue * 1.4);
  const convRate = 3.5;
  const callsBooked = Math.round(67 * m);

  // Customers
  const activeClients = 65;
  const referrals = Math.round(15 * m);
  const referralsPrev = Math.round(11 * m);
  const upsellRate = 18.4;
  const churn = 2.1;

  // Content
  const contentViews = Math.round(92_000 * m);
  const engagementRate = 3.2;
  const postsThisWeek = Math.round(14 * Math.min(m, 1));
  const followerGrowth = Math.round(840 * m);

  return {
    overview: [
      { label: "TOTAL REVENUE", value: fmtMoney(revenue), delta: Math.round(((revenue - revPrev) / revPrev) * 100) },
      { label: "NEW LEADS", value: fmtNum(newLeads), delta: Math.round(((newLeads - leadsPrev) / leadsPrev) * 100) },
      { label: "NEW SALES", value: newSales, delta: null },
      { label: "AVG ORDER VALUE", value: fmtMoney(aov), delta: null },
      { label: "ROAS", value: `${roas}x`, delta: null },
    ],
    leads: [
      { label: "VIEWS", value: fmtNum(views), delta: 12 },
      { label: "LEADS", value: fmtNum(newLeads), delta: Math.round(((newLeads - leadsPrev) / leadsPrev) * 100) },
      { label: "COST / LEAD", value: cpl > 0 ? `$${cpl}` : "--", delta: -8 },
      { label: "BEST SOURCE", value: "Cold Email", delta: null },
      { label: "LEADS BY CHANNEL", value: "4 active", delta: null },
    ],
    sales: [
      { label: "PIPELINE", value: fmtMoney(pipeline), delta: 6 },
      { label: "SALES", value: newSales, delta: null },
      { label: "CONVERSION RATE", value: `${convRate}%`, delta: 13 },
      { label: "AVG ORDER VALUE", value: fmtMoney(aov), delta: null },
      { label: "CALLS BOOKED", value: callsBooked, delta: 5 },
    ],
    customers: [
      { label: "ACTIVE CLIENTS", value: activeClients, delta: null },
      { label: "REFERRALS", value: referrals, delta: Math.round(((referrals - referralsPrev) / referralsPrev) * 100) },
      { label: "UPSELL RATE", value: `${upsellRate}%`, delta: 2 },
      { label: "CHURN", value: `${churn}%`, delta: -15 },
    ],
    content: [
      { label: "VIEWS BY PLATFORM", value: fmtNum(contentViews), delta: 18 },
      { label: "ENGAGEMENT RATE", value: `${engagementRate}%`, delta: 4 },
      { label: "POSTS THIS WEEK", value: postsThisWeek, delta: null },
      { label: "FOLLOWER GROWTH", value: `+${fmtNum(followerGrowth)}`, delta: 22 },
    ],
  };
}

const STATIC_ALERTS: Alert[] = [
  { level: "error", message: "Challenge funnel conversion dropped 22% vs prior period" },
  { level: "warn", message: "No brand colors configured", link: "/settings", linkLabel: "Settings" },
  { level: "warn", message: "Cold email reply rate below 2% threshold on Segment B" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function Delta({ value }: { value: number | null | undefined }) {
  if (value == null) return null;
  const up = value >= 0;
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 600,
        color: up ? "#22c55e" : "#ef4444",
        marginTop: 4,
        display: "block",
        fontFamily: "Montserrat, sans-serif",
      }}
    >
      {up ? "+" : ""}
      {value}%
    </span>
  );
}

function KPICard({ kpi }: { kpi: KPI }) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: 10,
        padding: "18px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      <span
        style={{
          fontSize: 10,
          fontWeight: 600,
          color: "#9ca3af",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          fontFamily: "Montserrat, sans-serif",
        }}
      >
        {kpi.label}
      </span>
      <span
        style={{
          fontSize: 28,
          fontWeight: 800,
          color: "#111111",
          lineHeight: 1.1,
          fontFamily: "Montserrat, sans-serif",
        }}
      >
        {kpi.value === "" || kpi.value === undefined ? "--" : kpi.value}
      </span>
      <Delta value={kpi.delta} />
    </div>
  );
}

function AlertBar({ alert }: { alert: Alert }) {
  const borderColor = alert.level === "error" ? "#ef4444" : "#f59e0b";
  const bgColor = alert.level === "error" ? "#fef2f2" : "#fffbeb";
  return (
    <div
      style={{
        borderLeft: `4px solid ${borderColor}`,
        background: bgColor,
        borderRadius: "0 6px 6px 0",
        padding: "10px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontSize: 13,
        color: "#374151",
        fontFamily: "Montserrat, sans-serif",
      }}
    >
      <span>{alert.message}</span>
      {alert.link && (
        <Link
          href={alert.link}
          style={{
            fontSize: 12,
            color: borderColor,
            fontWeight: 600,
            textDecoration: "none",
            marginLeft: 12,
            whiteSpace: "nowrap",
          }}
        >
          {alert.linkLabel || alert.link} →
        </Link>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const TABS: { key: TabKey; label: string }[] = [
  { key: "overview", label: "OVERVIEW" },
  { key: "leads", label: "LEADS" },
  { key: "sales", label: "SALES" },
  { key: "customers", label: "CUSTOMERS" },
  { key: "content", label: "CONTENT" },
];

const PRESETS: PresetKey[] = ["TODAY", "7D", "30D", "90D", "YTD"];

export default function DashboardPage() {
  const today = new Date();
  const thirtyAgo = new Date(today);
  thirtyAgo.setDate(thirtyAgo.getDate() - 30);

  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [startDate, setStartDate] = useState(toISO(thirtyAgo));
  const [endDate, setEndDate] = useState(toISO(today));
  const [activePreset, setActivePreset] = useState<PresetKey | null>("30D");

  const kpis = useMemo(() => buildKPIs(startDate, endDate), [startDate, endDate]);

  function applyPreset(preset: PresetKey) {
    const t = new Date();
    const todayStr = toISO(t);
    setActivePreset(preset);
    if (preset === "TODAY") {
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (preset === "7D") {
      const s = new Date(t); s.setDate(s.getDate() - 7);
      setStartDate(toISO(s)); setEndDate(todayStr);
    } else if (preset === "30D") {
      const s = new Date(t); s.setDate(s.getDate() - 30);
      setStartDate(toISO(s)); setEndDate(todayStr);
    } else if (preset === "90D") {
      const s = new Date(t); s.setDate(s.getDate() - 90);
      setStartDate(toISO(s)); setEndDate(todayStr);
    } else if (preset === "YTD") {
      setStartDate(`${t.getFullYear()}-01-01`); setEndDate(todayStr);
    }
  }

  const currentKPIs = kpis[activeTab];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#ffffff",
        fontFamily: "Montserrat, sans-serif",
        color: "#111111",
      }}
    >
      {/* ── Page Header ── */}
      <div
        style={{
          borderBottom: "1px solid #e5e7eb",
          padding: "20px 32px 0",
          background: "#ffffff",
        }}
      >
        <h1
          style={{
            fontSize: 22,
            fontWeight: 800,
            margin: "0 0 16px",
            color: "#111111",
            fontFamily: "Montserrat, sans-serif",
          }}
        >
          Mission Control
        </h1>

        {/* ── Date range row ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
            marginBottom: 16,
          }}
        >
          {/* Preset pills */}
          <div style={{ display: "flex", gap: 6 }}>
            {PRESETS.map((p) => {
              const isActive = activePreset === p;
              return (
                <button
                  key={p}
                  onClick={() => applyPreset(p)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 20,
                    border: "1px solid",
                    borderColor: isActive ? "#111111" : "#d1d5db",
                    background: isActive ? "#111111" : "#ffffff",
                    color: isActive ? "#ffffff" : "#6b7280",
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: "pointer",
                    letterSpacing: "0.05em",
                    fontFamily: "Montserrat, sans-serif",
                    transition: "all 0.1s",
                  }}
                >
                  {p}
                </button>
              );
            })}
          </div>

          {/* Custom date range */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setActivePreset(null);
              }}
              style={{
                border: "1px solid #d1d5db",
                borderRadius: 6,
                padding: "5px 10px",
                fontSize: 12,
                color: "#374151",
                fontFamily: "Montserrat, sans-serif",
                cursor: "pointer",
                background: "#ffffff",
              }}
            />
            <span style={{ color: "#9ca3af", fontSize: 12 }}>—</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setActivePreset(null);
              }}
              style={{
                border: "1px solid #d1d5db",
                borderRadius: 6,
                padding: "5px 10px",
                fontSize: 12,
                color: "#374151",
                fontFamily: "Montserrat, sans-serif",
                cursor: "pointer",
                background: "#ffffff",
              }}
            />
            <span
              style={{
                fontSize: 11,
                color: "#9ca3af",
                fontFamily: "Montserrat, sans-serif",
              }}
            >
              {fmtDate(startDate)} — {fmtDate(endDate)}
            </span>
          </div>
        </div>

        {/* ── Tab bar ── */}
        <div style={{ display: "flex", gap: 0 }}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: "10px 20px",
                  border: "none",
                  background: "transparent",
                  color: isActive ? "#111111" : "#9ca3af",
                  fontWeight: isActive ? 700 : 500,
                  fontSize: 12,
                  letterSpacing: "0.06em",
                  cursor: "pointer",
                  fontFamily: "Montserrat, sans-serif",
                  borderBottom: isActive
                    ? "2px solid #DAA520"
                    : "2px solid transparent",
                  marginBottom: -1,
                  transition: "color 0.15s, border-color 0.15s",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Content area ── */}
      <div style={{ padding: "28px 32px 48px", maxWidth: 1280, margin: "0 auto" }}>

        {/* KPI Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: 16,
            marginBottom: 32,
          }}
        >
          {currentKPIs.map((kpi, i) => (
            <KPICard key={i} kpi={kpi} />
          ))}
        </div>

        {/* ── Overview-only: Alerts + Quick Actions ── */}
        {activeTab === "overview" && (
          <>
            {/* Alerts */}
            <div style={{ marginBottom: 28 }}>
              <h2
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#6b7280",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: 10,
                  fontFamily: "Montserrat, sans-serif",
                }}
              >
                Alerts
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {STATIC_ALERTS.map((a, i) => (
                  <AlertBar key={i} alert={a} />
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <h2
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#6b7280",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: 10,
                  fontFamily: "Montserrat, sans-serif",
                }}
              >
                Quick Actions
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { label: "3 items need approval", href: "/inbox" },
                  { label: "Generate today's content", href: "/get-leads" },
                  { label: "5 tasks due today", href: "/projects" },
                ].map((action, i) => (
                  <Link
                    key={i}
                    href={action.href}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#111111",
                      textDecoration: "none",
                      padding: "10px 16px",
                      border: "1px solid #e5e7eb",
                      borderRadius: 8,
                      background: "#f9fafb",
                      width: "fit-content",
                      fontFamily: "Montserrat, sans-serif",
                      transition: "background 0.1s",
                    }}
                  >
                    {action.label} →
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
