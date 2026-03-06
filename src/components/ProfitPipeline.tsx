"use client";

import { useState, useEffect } from "react";
import { loadSimulationState, SimulationState, emptySimulationState } from "@/lib/simulation-state";

export default function ProfitPipeline() {
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
  const tasks = simState.tasks;
  const deliverables = simState.deliverables;

  // Calculate projected metrics based on simulation data
  const leadsPerMonth = metrics.prospects * 4;
  const avgDealSize = 5000;
  const closeRate = 25; // % of calls that close
  const projectedRevenue = metrics.calls * (closeRate / 100) * avgDealSize;
  const projectedProfit = projectedRevenue * 0.7;

  const profitDrivers = [
    {
      name: "Prospects Found",
      current: metrics.prospects,
      target: 500,
      icon: "👥",
      color: "#2F80FF",
    },
    {
      name: "Outreach Rate",
      current: metrics.prospects > 0 ? Math.round((metrics.dms / metrics.prospects) * 100) : 0,
      target: 80,
      unit: "%",
      icon: "📤",
      color: "#7B61FF",
    },
    {
      name: "Reply Rate",
      current: metrics.dms > 0 ? Math.round((metrics.replies / metrics.dms) * 100) : 0,
      target: 40,
      unit: "%",
      icon: "💬",
      color: "#10B981",
    },
    {
      name: "Booking Rate",
      current: metrics.replies > 0 ? Math.round((metrics.calls / metrics.replies) * 100) : 0,
      target: 50,
      unit: "%",
      icon: "📞",
      color: "#FF4EDB",
    },
  ];

  // Funnel stages with real data
  const funnelStages = [
    { label: "Prospects", value: metrics.prospects, color: "#2F80FF" },
    { label: "DMs Sent", value: metrics.dms, color: "#7B61FF" },
    { label: "Replies", value: metrics.replies, color: "#FF4EDB" },
    { label: "Calls Booked", value: metrics.calls, color: "#10B981" },
    { label: "Closed Deals", value: Math.floor(metrics.calls * 0.25), color: "#F59E0B" },
  ];

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
          PROFIT PIPELINE
        </div>
        <h1 style={{
          fontSize: 28,
          fontWeight: 700,
          color: "#F5F7FA",
          margin: 0,
          fontFamily: "'Space Grotesk', sans-serif",
        }}>
          Revenue Projections
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
          Loading profit data...
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
          <div style={{ fontSize: 64, marginBottom: 24 }}>📈</div>
          <div style={{
            fontSize: 24,
            fontWeight: 700,
            color: "#F5F7FA",
            marginBottom: 8,
          }}>
            No Profit Data Yet
          </div>
          <div style={{
            color: "#6B7186",
            fontSize: 16,
          }}>
            Start a business build from <span style={{ color: "#FF4EDB" }}>🔴 LIVE BUILD</span> to see projections
          </div>
        </div>
      ) : (
        <>
          {/* Revenue Projections */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 20,
            marginBottom: 24,
          }}>
            <ProjectionCard
              label="Monthly Leads"
              value={leadsPerMonth}
              icon="👥"
              color="#2F80FF"
            />
            <ProjectionCard
              label="Calls/Month"
              value={metrics.calls * 4}
              icon="📞"
              color="#7B61FF"
            />
            <ProjectionCard
              label="Projected Revenue"
              value={`$${(projectedRevenue * 4).toLocaleString()}`}
              icon="💰"
              color="#10B981"
              subtitle="/month"
            />
            <ProjectionCard
              label="Projected Profit"
              value={`$${(projectedProfit * 4).toLocaleString()}`}
              icon="📈"
              color="#FF4EDB"
              subtitle="70% margin"
            />
          </div>

          {/* Funnel Visualization */}
          <div style={{
            background: "linear-gradient(180deg, #111624 0%, #0D1117 100%)",
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.08)",
            padding: 24,
            marginBottom: 24,
          }}>
            <h2 style={{
              fontSize: 16,
              fontWeight: 600,
              color: "#F5F7FA",
              marginBottom: 24,
            }}>
              🔻 Conversion Funnel
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {funnelStages.map((stage, i) => {
                const widthPercent = funnelStages[0].value > 0 
                  ? Math.max(15, (stage.value / funnelStages[0].value) * 100)
                  : 100 - (i * 15);
                return (
                  <div key={stage.label}>
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 8,
                    }}>
                      <span style={{ fontSize: 13, color: "#8A8F98" }}>{stage.label}</span>
                      <span style={{ fontSize: 18, fontWeight: 700, color: stage.color }}>{stage.value}</span>
                    </div>
                    <div style={{
                      width: `${widthPercent}%`,
                      height: 24,
                      background: `linear-gradient(90deg, ${stage.color}, ${stage.color}60)`,
                      borderRadius: 6,
                      transition: "width 0.5s ease",
                      marginLeft: "auto",
                      marginRight: "auto",
                    }} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Profit Drivers */}
          <div style={{
            background: "linear-gradient(180deg, #111624 0%, #0D1117 100%)",
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.08)",
            padding: 24,
            marginBottom: 24,
          }}>
            <h2 style={{
              fontSize: 16,
              fontWeight: 600,
              color: "#F5F7FA",
              marginBottom: 24,
            }}>
              🎯 Profit Drivers
            </h2>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 20,
            }}>
              {profitDrivers.map((driver) => {
                const progress = Math.min(100, (driver.current / driver.target) * 100);
                return (
                  <div
                    key={driver.name}
                    style={{
                      padding: 20,
                      background: "rgba(255,255,255,0.03)",
                      borderRadius: 12,
                    }}
                  >
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 12,
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 24 }}>{driver.icon}</span>
                        <span style={{ fontSize: 14, fontWeight: 500, color: "#F5F7FA" }}>
                          {driver.name}
                        </span>
                      </div>
                      <span style={{ fontSize: 18, fontWeight: 700, color: driver.color }}>
                        {driver.current}{driver.unit || ""}
                      </span>
                    </div>
                    <div style={{
                      height: 8,
                      background: "rgba(255,255,255,0.1)",
                      borderRadius: 4,
                      overflow: "hidden",
                    }}>
                      <div style={{
                        width: `${progress}%`,
                        height: "100%",
                        background: `linear-gradient(90deg, ${driver.color}, ${driver.color}80)`,
                        borderRadius: 4,
                        transition: "width 0.5s ease",
                      }} />
                    </div>
                    <div style={{
                      marginTop: 8,
                      fontSize: 11,
                      color: "#6B7186",
                    }}>
                      Target: {driver.target}{driver.unit || ""}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Growth Formula */}
          <div style={{
            background: "linear-gradient(135deg, #10B98120, #10B98110)",
            borderRadius: 16,
            border: "1px solid #10B98140",
            padding: 24,
          }}>
            <h2 style={{
              fontSize: 16,
              fontWeight: 600,
              color: "#10B981",
              marginBottom: 16,
            }}>
              💡 Growth Formula
            </h2>
            <div style={{
              fontSize: 18,
              fontWeight: 600,
              color: "#F5F7FA",
              fontFamily: "'Orbitron', monospace",
              textAlign: "center",
              padding: 20,
            }}>
              {metrics.calls} calls × {closeRate}% close × ${avgDealSize.toLocaleString()} = 
              <span style={{ color: "#10B981", marginLeft: 10 }}>${projectedRevenue.toLocaleString()}</span>
            </div>
            <div style={{
              fontSize: 12,
              color: "#6B7186",
              textAlign: "center",
              marginTop: 8,
            }}>
              Assets Built: {deliverables.filter(d => d.status === "complete").length} / {deliverables.length}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function ProjectionCard({ label, value, icon, color, subtitle }: { 
  label: string; 
  value: string | number; 
  icon: string; 
  color: string;
  subtitle?: string;
}) {
  return (
    <div style={{
      background: "linear-gradient(180deg, #111624 0%, #0D1117 100%)",
      borderRadius: 16,
      border: "1px solid rgba(255,255,255,0.08)",
      padding: 24,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <span style={{ fontSize: 28 }}>{icon}</span>
        <span style={{ fontSize: 12, color: "#6B7186", textTransform: "uppercase", letterSpacing: 1 }}>
          {label}
        </span>
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color }}>{value}</div>
      {subtitle && (
        <div style={{ fontSize: 12, color: "#6B7186", marginTop: 4 }}>{subtitle}</div>
      )}
    </div>
  );
}
