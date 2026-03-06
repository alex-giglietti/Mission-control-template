"use client";

import { useState, useEffect } from "react";
import { loadSimulationState, SimulationState, emptySimulationState } from "@/lib/simulation-state";

const activityColors = {
  info: "#2F80FF",
  success: "#10B981",
  warning: "#F59E0B",
  signal: "#FF4EDB",
  gate: "#7B61FF",
  task: "#A78BFA",
  deliverable: "#10B981",
};

export default function CEODashboard() {
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
    // Poll for updates
    const interval = setInterval(loadState, 1000);
    return () => clearInterval(interval);
  }, []);

  const hasData = simState.businessName && simState.phase !== "startup";
  const agents = simState.agents;
  const tasks = simState.tasks;
  const activity = simState.activity;
  const metrics = simState.metrics;
  const deliverables = simState.deliverables;

  // Calculate revenue projection based on metrics
  const projectedRevenue = metrics.calls * 5000; // $5k per call
  const pipelineValue = metrics.prospects * 100;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0B0F19",
      padding: 24,
    }}>
      {/* Header */}
      <div style={{
        marginBottom: 24,
        padding: "24px",
        background: "linear-gradient(135deg, #111624, #0D1117)",
        borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.08)",
      }}>
        <div style={{
          fontSize: 10,
          letterSpacing: 2,
          color: "#FF4EDB",
          fontFamily: "'Orbitron', monospace",
          marginBottom: 8,
        }}>
          CEO DASHBOARD
        </div>
        <h1 style={{
          fontSize: 32,
          fontWeight: 700,
          color: "#F5F7FA",
          margin: 0,
          fontFamily: "'Space Grotesk', sans-serif",
        }}>
          {hasData ? simState.businessName : "Your AI Business"}
        </h1>
        {hasData && (
          <p style={{
            color: "#8A8F98",
            margin: "8px 0 0",
            fontSize: 14,
          }}>
            Phase: {simState.phase.toUpperCase()}
          </p>
        )}
      </div>

      {!hasData ? (
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
          <div style={{ fontSize: 64, marginBottom: 24 }}>🚀</div>
          <div style={{
            fontSize: 24,
            fontWeight: 700,
            color: "#F5F7FA",
            marginBottom: 8,
            textAlign: "center",
          }}>
            Ready to Build Your AI Business
          </div>
          <div style={{
            color: "#6B7186",
            fontSize: 16,
            textAlign: "center",
            maxWidth: 400,
          }}>
            Go to the <span style={{ color: "#FF4EDB" }}>🔴 LIVE BUILD</span> tab and start building your business. Watch it populate across all dashboards in real-time.
          </div>
        </div>
      ) : (
        <>
          {/* Metrics Row */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: 16,
            marginBottom: 24,
          }}>
            <MetricCard
              label="Prospects"
              value={metrics.prospects}
              icon="👥"
              color="#2F80FF"
            />
            <MetricCard
              label="DMs Sent"
              value={metrics.dms}
              icon="💬"
              color="#7B61FF"
            />
            <MetricCard
              label="Replies"
              value={metrics.replies}
              icon="✉️"
              color="#10B981"
            />
            <MetricCard
              label="Calls Booked"
              value={metrics.calls}
              icon="📞"
              color="#FF4EDB"
            />
            <MetricCard
              label="Revenue Proj"
              value={`$${projectedRevenue.toLocaleString()}`}
              icon="💰"
              color="#F59E0B"
            />
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: 24,
          }}>
            {/* Activity Feed */}
            <div style={{
              background: "linear-gradient(180deg, #111624 0%, #0D1117 100%)",
              borderRadius: 16,
              border: "1px solid rgba(255,255,255,0.08)",
              padding: 24,
              maxHeight: 500,
              overflow: "auto",
            }}>
              <h2 style={{
                fontSize: 16,
                fontWeight: 600,
                color: "#F5F7FA",
                marginBottom: 20,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}>
                <span>📡</span> Recent Activity
                <span style={{
                  marginLeft: "auto",
                  fontSize: 10,
                  padding: "2px 8px",
                  borderRadius: 10,
                  background: "rgba(255,78,219,0.2)",
                  color: "#FF4EDB",
                }}>
                  {activity.length}
                </span>
              </h2>
              
              {activity.length === 0 ? (
                <div style={{
                  color: "#6B7186",
                  fontSize: 14,
                  textAlign: "center",
                  padding: 40,
                }}>
                  No activity yet — start a build to see updates
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {activity.slice(0, 15).map((item) => (
                    <div
                      key={item.id}
                      style={{
                        padding: 14,
                        background: "rgba(255,255,255,0.03)",
                        borderRadius: 10,
                        borderLeft: `3px solid ${activityColors[item.type] || "#6B7186"}`,
                      }}
                    >
                      <p style={{
                        color: "#F5F7FA",
                        fontSize: 14,
                        margin: 0,
                        lineHeight: 1.5,
                      }}>
                        {item.message}
                      </p>
                      {item.signal && (
                        <p style={{
                          color: "#FF4EDB",
                          fontSize: 9,
                          margin: "6px 0 0",
                          fontFamily: "'Orbitron', monospace",
                        }}>
                          {item.signal}
                        </p>
                      )}
                      <p style={{
                        color: "#6B7186",
                        fontSize: 11,
                        margin: "8px 0 0",
                        fontFamily: "'Orbitron', monospace",
                      }}>
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column - Agents & Deliverables */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Deliverables */}
              <div style={{
                background: "linear-gradient(180deg, #111624 0%, #0D1117 100%)",
                borderRadius: 16,
                border: "1px solid rgba(16,185,129,0.3)",
                padding: 24,
              }}>
                <h2 style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#F5F7FA",
                  marginBottom: 16,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}>
                  <span>📦</span> Deliverables
                  <span style={{
                    marginLeft: "auto",
                    fontSize: 10,
                    padding: "2px 8px",
                    borderRadius: 10,
                    background: "rgba(16,185,129,0.2)",
                    color: "#10B981",
                  }}>
                    {deliverables.filter(d => d.status === "complete").length}/{deliverables.length}
                  </span>
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {deliverables.length === 0 ? (
                    <div style={{ color: "#6B7186", fontSize: 12, textAlign: "center", padding: 20 }}>
                      Deliverables will appear here...
                    </div>
                  ) : (
                    deliverables.map((del) => (
                      <div
                        key={del.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: 10,
                          background: del.status === "complete" 
                            ? "rgba(16,185,129,0.1)" 
                            : "rgba(255,255,255,0.03)",
                          borderRadius: 8,
                          border: del.status === "complete"
                            ? "1px solid rgba(16,185,129,0.3)"
                            : "1px solid rgba(255,255,255,0.05)",
                        }}
                      >
                        <span style={{ fontSize: 18 }}>
                          {del.type === "website" ? "🌐" :
                           del.type === "cart" ? "🛒" :
                           del.type === "email" ? "📧" :
                           del.type === "content" ? "📱" :
                           del.type === "funnel" ? "📞" :
                           del.type === "ads" ? "📺" : "📄"}
                        </span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 500, color: "#F5F7FA" }}>
                            {del.title}
                          </div>
                          <div style={{ fontSize: 10, color: "#6B7186" }}>
                            Wave {del.wave}
                          </div>
                        </div>
                        <span style={{
                          fontSize: 10,
                          padding: "3px 8px",
                          borderRadius: 4,
                          background: del.status === "complete" ? "rgba(16,185,129,0.2)" : "rgba(124,58,237,0.2)",
                          color: del.status === "complete" ? "#10B981" : "#A78BFA",
                          textTransform: "uppercase",
                          fontWeight: 600,
                        }}>
                          {del.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* AI Team Summary */}
              <div style={{
                background: "linear-gradient(180deg, #111624 0%, #0D1117 100%)",
                borderRadius: 16,
                border: "1px solid rgba(255,255,255,0.08)",
                padding: 24,
              }}>
                <h2 style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#F5F7FA",
                  marginBottom: 16,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}>
                  <span>🤖</span> AI Team
                  <span style={{
                    marginLeft: "auto",
                    fontSize: 10,
                    padding: "2px 8px",
                    borderRadius: 10,
                    background: "rgba(16,185,129,0.2)",
                    color: "#10B981",
                  }}>
                    {agents.filter(a => a.status === "complete").length}/{agents.length}
                  </span>
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {agents.length === 0 ? (
                    <div style={{ color: "#6B7186", fontSize: 12, textAlign: "center", padding: 20 }}>
                      Agents will spawn during build...
                    </div>
                  ) : (
                    agents.map((agent) => (
                      <div
                        key={agent.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: 10,
                          background: "rgba(255,255,255,0.03)",
                          borderRadius: 8,
                        }}
                      >
                        <span style={{ fontSize: 20 }}>{agent.avatar}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 500, color: "#F5F7FA" }}>
                            {agent.name}
                          </div>
                        </div>
                        <span style={{
                          fontSize: 10,
                          padding: "3px 8px",
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
                    ))
                  )}
                </div>
              </div>
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
