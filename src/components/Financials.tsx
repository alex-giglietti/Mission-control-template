"use client";

import { useState, useEffect } from "react";
import { loadSimulationState, SimulationState, emptySimulationState } from "@/lib/simulation-state";

export default function Financials() {
  const [simState, setSimState] = useState<SimulationState>(emptySimulationState);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadState = () => {
      const state = loadSimulationState();
      if (state) {
        setSimState(state);
      }
      setLoading(false);
    };

    loadState();
    const interval = setInterval(loadState, 1000);
    return () => clearInterval(interval);
  }, []);

  const hasData = simState.businessName && simState.phase !== "startup";
  const metrics = simState.metrics;
  const agents = simState.agents;
  const tasks = simState.tasks;
  const deliverables = simState.deliverables;

  // Calculate financial projections from simulation data
  const avgDealSize = 5000;
  const closeRate = 25; // % of calls that close
  const closedDeals = Math.floor(metrics.calls * (closeRate / 100));
  const monthlyRevenue = closedDeals * avgDealSize * 4; // Scale to monthly
  const monthlyExpenses = agents.length * 100 + 200; // $100 per agent + base costs
  const monthlyProfit = monthlyRevenue - monthlyExpenses;
  const profitMargin = monthlyRevenue > 0 ? ((monthlyProfit / monthlyRevenue) * 100).toFixed(1) : "0";

  // Cost breakdown by agent type
  const expenses = [
    { name: "AI Agent Infrastructure", amount: agents.length * 50, icon: "🤖", detail: `${agents.length} agents` },
    { name: "Outreach Automation", amount: metrics.dms > 0 ? 100 : 0, icon: "📤", detail: `${metrics.dms} DMs sent` },
    { name: "Email Sequences", amount: deliverables.filter(d => d.type === "email").length * 50, icon: "📧", detail: `${deliverables.filter(d => d.type === "email").length} sequences` },
    { name: "Content Production", amount: deliverables.filter(d => d.type === "content").length * 75, icon: "📱", detail: `${deliverables.filter(d => d.type === "content").length} calendars` },
    { name: "Ads & Creative", amount: deliverables.filter(d => d.type === "ads").length * 100, icon: "📺", detail: `${deliverables.filter(d => d.type === "ads").length} campaigns` },
    { name: "Base Platform", amount: 200, icon: "🔧", detail: "Fixed cost" },
  ].filter(e => e.amount > 0);

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0B0F19",
      padding: 24,
    }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{
          fontSize: 10,
          letterSpacing: 2,
          color: "#10B981",
          fontFamily: "'Orbitron', monospace",
          marginBottom: 4,
        }}>
          FINANCIALS
        </div>
        <h1 style={{
          fontSize: 28,
          fontWeight: 700,
          color: "#F5F7FA",
          margin: 0,
          fontFamily: "'Space Grotesk', sans-serif",
        }}>
          Financial Overview
        </h1>
        {hasData && (
          <p style={{ color: "#6B7186", fontSize: 13, marginTop: 4 }}>
            {simState.businessName}
          </p>
        )}
      </div>

      {loading ? (
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 80,
          color: "#6B7186",
        }}>
          Loading financial data...
        </div>
      ) : !hasData ? (
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 80,
          background: "linear-gradient(180deg, #111624 0%, #0D1117 100%)",
          borderRadius: 16,
          border: "1px solid rgba(255,255,255,0.08)",
        }}>
          <div style={{ fontSize: 64, marginBottom: 24 }}>💵</div>
          <div style={{
            fontSize: 24,
            fontWeight: 700,
            color: "#F5F7FA",
            marginBottom: 8,
          }}>
            No Financial Data Yet
          </div>
          <div style={{
            color: "#6B7186",
            fontSize: 16,
          }}>
            Start a business build from <span style={{ color: "#FF4EDB" }}>🔴 LIVE BUILD</span> to see financials
          </div>
        </div>
      ) : (
        <>
          {/* Key Metrics */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 16,
            marginBottom: 24,
          }}>
            <FinancialCard
              label="Monthly Revenue"
              value={`$${monthlyRevenue.toLocaleString()}`}
              icon="💰"
              color="#10B981"
              subtitle={`${closedDeals * 4} deals @ $${avgDealSize.toLocaleString()}`}
            />
            <FinancialCard
              label="Monthly Expenses"
              value={`$${totalExpenses.toLocaleString()}`}
              icon="📉"
              color="#F59E0B"
              subtitle={`${expenses.length} cost centers`}
            />
            <FinancialCard
              label="Net Profit"
              value={`$${(monthlyRevenue - totalExpenses).toLocaleString()}`}
              icon="📈"
              color={(monthlyRevenue - totalExpenses) > 0 ? "#10B981" : "#EF4444"}
              subtitle="Projected monthly"
            />
            <FinancialCard
              label="Profit Margin"
              value={`${profitMargin}%`}
              icon="🎯"
              color="#7B61FF"
              subtitle="After expenses"
            />
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 24,
          }}>
            {/* Expenses Breakdown */}
            <div style={{
              background: "linear-gradient(180deg, #111624 0%, #0D1117 100%)",
              borderRadius: 16,
              border: "1px solid rgba(255,255,255,0.08)",
              padding: 24,
            }}>
              <h2 style={{
                fontSize: 16,
                fontWeight: 600,
                color: "#F5F7FA",
                marginBottom: 20,
              }}>
                📊 Cost Breakdown
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {expenses.map((expense) => (
                  <div
                    key={expense.name}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: 14,
                      background: "rgba(255,255,255,0.03)",
                      borderRadius: 10,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 20 }}>{expense.icon}</span>
                      <div>
                        <div style={{ fontSize: 14, color: "#F5F7FA" }}>{expense.name}</div>
                        <div style={{ fontSize: 10, color: "#6B7186" }}>{expense.detail}</div>
                      </div>
                    </div>
                    <span style={{ fontSize: 16, fontWeight: 600, color: "#F59E0B" }}>
                      ${expense.amount}
                    </span>
                  </div>
                ))}
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "14px 14px",
                  borderTop: "1px solid rgba(255,255,255,0.1)",
                  marginTop: 8,
                }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#F5F7FA" }}>Total Monthly</span>
                  <span style={{ fontSize: 18, fontWeight: 700, color: "#F59E0B" }}>
                    ${totalExpenses.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* ROI & Business Metrics */}
            <div style={{
              background: "linear-gradient(180deg, #111624 0%, #0D1117 100%)",
              borderRadius: 16,
              border: "1px solid rgba(255,255,255,0.08)",
              padding: 24,
            }}>
              <h2 style={{
                fontSize: 16,
                fontWeight: 600,
                color: "#F5F7FA",
                marginBottom: 20,
              }}>
                🚀 Business Metrics
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <MetricRow label="Prospects Found" value={metrics.prospects} />
                <MetricRow label="DMs Sent" value={metrics.dms} />
                <MetricRow label="Replies Received" value={metrics.replies} />
                <MetricRow label="Calls Booked" value={metrics.calls} />
                <MetricRow label="Closed Deals (est)" value={closedDeals} />
                <MetricRow label="Avg Deal Size" value={`$${avgDealSize.toLocaleString()}`} />
                <MetricRow label="AI Agents" value={agents.length} />
                <MetricRow label="Tasks Complete" value={tasks.filter(t => t.status === "complete").length} />
                <MetricRow label="Deliverables Ready" value={deliverables.filter(d => d.status === "complete").length} />
                
                <div style={{
                  padding: 16,
                  background: "linear-gradient(135deg, #10B98120, #10B98110)",
                  borderRadius: 10,
                  border: "1px solid #10B98140",
                  marginTop: 8,
                }}>
                  <div style={{ fontSize: 12, color: "#10B981", marginBottom: 4 }}>ESTIMATED ROI</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: "#10B981" }}>
                    {totalExpenses > 0 ? `${(((monthlyRevenue - totalExpenses) / totalExpenses) * 100).toFixed(0)}%` : "∞"}
                  </div>
                  <div style={{ fontSize: 11, color: "#6B7186", marginTop: 4 }}>
                    Return on AI investment
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Formula */}
          <div style={{
            background: "linear-gradient(135deg, #10B98120, #10B98110)",
            borderRadius: 16,
            border: "1px solid #10B98140",
            padding: 24,
            marginTop: 24,
          }}>
            <h2 style={{
              fontSize: 16,
              fontWeight: 600,
              color: "#10B981",
              marginBottom: 16,
            }}>
              💡 Revenue Formula
            </h2>
            <div style={{
              fontSize: 18,
              fontWeight: 600,
              color: "#F5F7FA",
              fontFamily: "'Orbitron', monospace",
              textAlign: "center",
              padding: 20,
            }}>
              {metrics.calls * 4} calls/mo × {closeRate}% close × ${avgDealSize.toLocaleString()} = 
              <span style={{ color: "#10B981", marginLeft: 10 }}>${monthlyRevenue.toLocaleString()}/mo</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function FinancialCard({ label, value, icon, color, subtitle }: { 
  label: string; 
  value: string; 
  icon: string; 
  color: string;
  subtitle?: string;
}) {
  return (
    <div style={{
      background: "linear-gradient(180deg, #111624 0%, #0D1117 100%)",
      borderRadius: 12,
      border: "1px solid rgba(255,255,255,0.08)",
      padding: 20,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 20 }}>{icon}</span>
        <span style={{ fontSize: 11, color: "#6B7186", textTransform: "uppercase", letterSpacing: 1 }}>
          {label}
        </span>
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, color }}>{value}</div>
      {subtitle && (
        <div style={{ fontSize: 11, color: "#6B7186", marginTop: 4 }}>{subtitle}</div>
      )}
    </div>
  );
}

function MetricRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    }}>
      <span style={{ fontSize: 13, color: "#8A8F98" }}>{label}</span>
      <span style={{ fontSize: 15, fontWeight: 600, color: "#F5F7FA" }}>{value}</span>
    </div>
  );
}
