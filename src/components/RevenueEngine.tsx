"use client";

import { useState, useEffect } from "react";
import { loadSimulationState, SimulationState, emptySimulationState } from "@/lib/simulation-state";

export default function RevenueEngine() {
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

  // Derive revenue channels from simulation data
  const channels = [
    {
      name: "Cold Outreach",
      icon: "📧",
      status: agents.find(a => a.id === "outbound")?.status === "working" || agents.find(a => a.id === "outbound")?.status === "complete" ? "active" : "pending",
      leads: Math.floor(metrics.prospects * 0.6),
      conversion: "4.2%",
      agent: "Outbound Bot",
    },
    {
      name: "Website Leads",
      icon: "🌐",
      status: agents.find(a => a.id === "website")?.status === "complete" ? "active" : "pending",
      leads: Math.floor(metrics.prospects * 0.25),
      conversion: "8.5%",
      agent: "Website Bot",
    },
    {
      name: "Content Pipeline",
      icon: "📱",
      status: agents.find(a => a.id === "content")?.status === "working" || agents.find(a => a.id === "content")?.status === "complete" ? "active" : "pending",
      leads: Math.floor(metrics.prospects * 0.15),
      conversion: "12.3%",
      agent: "Content Bot",
    },
  ];

  // Build pipeline from metrics
  const pipeline = [
    { stage: "Prospects", count: metrics.prospects, color: "#2F80FF" },
    { stage: "DMs Sent", count: metrics.dms, color: "#7B61FF" },
    { stage: "Replies", count: metrics.replies, color: "#FF4EDB" },
    { stage: "Calls", count: metrics.calls, color: "#10B981" },
    { stage: "Closed", count: Math.floor(metrics.calls * 0.25), color: "#F59E0B" },
  ];

  // Calculate revenue projections
  const avgDealSize = 5000;
  const projectedRevenue = Math.floor(metrics.calls * 0.25) * avgDealSize;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0B0F19",
      padding: 24,
    }}>
      {/* Header */}
      <div style={{
        marginBottom: 24,
      }}>
        <div style={{
          fontSize: 10,
          letterSpacing: 2,
          color: "#10B981",
          fontFamily: "'Orbitron', monospace",
          marginBottom: 4,
        }}>
          REVENUE ENGINE
        </div>
        <h1 style={{
          fontSize: 28,
          fontWeight: 700,
          color: "#F5F7FA",
          margin: 0,
          fontFamily: "'Space Grotesk', sans-serif",
        }}>
          Lead Generation & Sales
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
          Loading revenue data...
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
          <div style={{ fontSize: 64, marginBottom: 24 }}>💰</div>
          <div style={{
            fontSize: 24,
            fontWeight: 700,
            color: "#F5F7FA",
            marginBottom: 8,
          }}>
            No Revenue Data Yet
          </div>
          <div style={{
            color: "#6B7186",
            fontSize: 16,
            textAlign: "center",
          }}>
            Start a business build from <span style={{ color: "#FF4EDB" }}>🔴 LIVE BUILD</span> to see your revenue engine
          </div>
        </div>
      ) : (
        <>
          {/* Revenue Summary */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 16,
            marginBottom: 24,
          }}>
            <MetricCard label="Prospects" value={metrics.prospects} icon="👥" color="#2F80FF" />
            <MetricCard label="DMs Sent" value={metrics.dms} icon="💬" color="#7B61FF" />
            <MetricCard label="Calls Booked" value={metrics.calls} icon="📞" color="#10B981" />
            <MetricCard label="Projected Revenue" value={`$${projectedRevenue.toLocaleString()}`} icon="💰" color="#F59E0B" />
          </div>

          {/* Pipeline Funnel */}
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
              📈 Sales Pipeline
            </h2>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              height: 200,
              gap: 16,
            }}>
              {pipeline.map((stage) => {
                const maxCount = pipeline[0].count || 1;
                const height = Math.max(20, (stage.count / maxCount) * 180);
                return (
                  <div key={stage.stage} style={{ flex: 1, textAlign: "center" }}>
                    <div style={{
                      fontSize: 20,
                      fontWeight: 700,
                      color: stage.color,
                      marginBottom: 8,
                    }}>
                      {stage.count}
                    </div>
                    <div style={{
                      height,
                      background: `linear-gradient(180deg, ${stage.color}, ${stage.color}60)`,
                      borderRadius: "8px 8px 0 0",
                      transition: "height 0.5s ease",
                    }} />
                    <div style={{
                      marginTop: 12,
                      fontSize: 12,
                      color: "#8A8F98",
                      fontWeight: 500,
                    }}>
                      {stage.stage}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Channels Grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 20,
            marginBottom: 24,
          }}>
            {channels.map((channel) => (
              <div
                key={channel.name}
                style={{
                  background: "linear-gradient(180deg, #111624 0%, #0D1117 100%)",
                  borderRadius: 16,
                  border: "1px solid rgba(255,255,255,0.08)",
                  padding: 24,
                }}
              >
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 16,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 28 }}>{channel.icon}</span>
                    <div>
                      <div style={{
                        fontSize: 16,
                        fontWeight: 600,
                        color: "#F5F7FA",
                      }}>
                        {channel.name}
                      </div>
                      <div style={{
                        fontSize: 11,
                        color: "#6B7186",
                      }}>
                        via {channel.agent}
                      </div>
                    </div>
                  </div>
                  <span style={{
                    fontSize: 9,
                    padding: "4px 8px",
                    borderRadius: 4,
                    background: channel.status === "active" ? "rgba(16,185,129,0.2)" : "rgba(100,116,139,0.2)",
                    color: channel.status === "active" ? "#10B981" : "#94A3B8",
                    textTransform: "uppercase",
                    fontWeight: 600,
                  }}>
                    {channel.status}
                  </span>
                </div>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                }}>
                  <div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: "#2F80FF" }}>{channel.leads}</div>
                    <div style={{ fontSize: 10, color: "#6B7186", textTransform: "uppercase" }}>Leads</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: "#10B981" }}>{channel.conversion}</div>
                    <div style={{ fontSize: 10, color: "#6B7186", textTransform: "uppercase" }}>Conv Rate</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Active Revenue Agents */}
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
              🤖 Revenue Agents
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {agents.filter(a => ["outbound", "email", "aisales", "website", "cart"].includes(a.id)).map((agent) => (
                <div
                  key={agent.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: 16,
                    background: "rgba(255,255,255,0.03)",
                    borderRadius: 10,
                    borderLeft: `3px solid ${agent.status === "complete" ? "#10B981" : agent.status === "working" ? "#A78BFA" : "#6B7186"}`,
                  }}
                >
                  <span style={{ fontSize: 24 }}>{agent.avatar}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#F5F7FA" }}>{agent.name}</div>
                    <div style={{ fontSize: 11, color: "#6B7186" }}>{agent.role}</div>
                  </div>
                  <span style={{
                    fontSize: 9,
                    padding: "4px 10px",
                    borderRadius: 4,
                    background: agent.status === "complete" ? "rgba(16,185,129,0.2)" : 
                               agent.status === "working" ? "rgba(124,58,237,0.2)" : "rgba(100,116,139,0.2)",
                    color: agent.status === "complete" ? "#10B981" : 
                           agent.status === "working" ? "#A78BFA" : "#94A3B8",
                    textTransform: "uppercase",
                    fontWeight: 600,
                  }}>
                    {agent.status}
                  </span>
                </div>
              ))}
              {agents.filter(a => ["outbound", "email", "aisales", "website", "cart"].includes(a.id)).length === 0 && (
                <div style={{ color: "#6B7186", fontSize: 13, textAlign: "center", padding: 20 }}>
                  Revenue agents will appear here as they spawn...
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function MetricCard({ label, value, icon, color }: { label: string; value: number | string; icon: string; color: string }) {
  return (
    <div style={{
      background: "linear-gradient(180deg, #111624 0%, #0D1117 100%)",
      borderRadius: 12,
      border: "1px solid rgba(255,255,255,0.08)",
      padding: 20,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 24 }}>{icon}</span>
        <div>
          <div style={{ fontSize: 24, fontWeight: 700, color }}>{value}</div>
          <div style={{ fontSize: 11, color: "#6B7186", textTransform: "uppercase", letterSpacing: 1 }}>{label}</div>
        </div>
      </div>
    </div>
  );
}
