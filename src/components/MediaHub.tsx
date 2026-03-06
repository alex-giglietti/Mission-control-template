"use client";

import { useState, useEffect } from "react";
import { loadSimulationState, SimulationState, emptySimulationState } from "@/lib/simulation-state";

export default function MediaHub() {
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
  const agents = simState.agents;
  const deliverables = simState.deliverables;
  const activity = simState.activity;

  // Find content-related agents
  const contentAgents = agents.filter(a => 
    ["content", "email", "ads"].includes(a.id)
  );

  // Find content-related deliverables
  const mediaDeliverables = deliverables.filter(d => 
    ["email", "content", "ads"].includes(d.type)
  );

  // Extract content-related activity
  const contentActivity = activity.filter(a => 
    a.message.includes("📧") || 
    a.message.includes("email") || 
    a.message.includes("📱") ||
    a.message.includes("content") ||
    a.message.includes("📺") ||
    a.message.includes("ad") ||
    a.type === "deliverable"
  ).slice(0, 10);

  const channels = [
    { 
      name: "Email Sequences", 
      icon: "📧", 
      count: deliverables.filter(d => d.type === "email" && d.status === "complete").length,
      status: agents.find(a => a.id === "email")?.status || "pending",
      color: "#2F80FF" 
    },
    { 
      name: "Content Calendar", 
      icon: "📱", 
      count: deliverables.filter(d => d.type === "content" && d.status === "complete").length,
      status: agents.find(a => a.id === "content")?.status || "pending",
      color: "#10B981" 
    },
    { 
      name: "Ad Creatives", 
      icon: "📺", 
      count: deliverables.filter(d => d.type === "ads" && d.status === "complete").length,
      status: agents.find(a => a.id === "ads")?.status || "pending",
      color: "#FF4EDB" 
    },
    { 
      name: "Landing Pages", 
      icon: "🌐", 
      count: deliverables.filter(d => d.type === "website" && d.status === "complete").length,
      status: agents.find(a => a.id === "website")?.status || "pending",
      color: "#7B61FF" 
    },
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
          color: "#FF4EDB",
          fontFamily: "'Orbitron', monospace",
          marginBottom: 4,
        }}>
          MEDIA HUB
        </div>
        <h1 style={{
          fontSize: 28,
          fontWeight: 700,
          color: "#F5F7FA",
          margin: 0,
          fontFamily: "'Space Grotesk', sans-serif",
        }}>
          Content & Campaigns
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
          Loading media data...
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
          <div style={{ fontSize: 64, marginBottom: 24 }}>🎬</div>
          <div style={{
            fontSize: 24,
            fontWeight: 700,
            color: "#F5F7FA",
            marginBottom: 8,
          }}>
            No Media Content Yet
          </div>
          <div style={{
            color: "#6B7186",
            fontSize: 16,
          }}>
            Start a business build from <span style={{ color: "#FF4EDB" }}>🔴 LIVE BUILD</span> to see your content
          </div>
        </div>
      ) : (
        <>
          {/* Channel Stats */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 16,
            marginBottom: 24,
          }}>
            {channels.map((channel) => (
              <div
                key={channel.name}
                style={{
                  background: "linear-gradient(180deg, #111624 0%, #0D1117 100%)",
                  borderRadius: 12,
                  border: `1px solid ${channel.status === "complete" ? channel.color + "40" : "rgba(255,255,255,0.08)"}`,
                  padding: 20,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 24 }}>{channel.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: channel.color }}>{channel.count}</div>
                    <div style={{ fontSize: 11, color: "#6B7186", textTransform: "uppercase" }}>{channel.name}</div>
                  </div>
                  {channel.status !== "pending" && (
                    <span style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: channel.status === "complete" ? "#10B981" : "#A78BFA",
                      animation: channel.status === "working" ? "pulse 1s infinite" : "none",
                    }} />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Content Agents */}
          {contentAgents.length > 0 && (
            <div style={{
              background: "linear-gradient(135deg, #7B61FF20, #7B61FF10)",
              borderRadius: 16,
              border: "1px solid #7B61FF40",
              padding: 24,
              marginBottom: 24,
            }}>
              <h2 style={{
                fontSize: 14,
                fontWeight: 600,
                color: "#F5F7FA",
                marginBottom: 16,
              }}>
                🤖 Content Team
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {contentAgents.map((agent) => (
                  <div
                    key={agent.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                      padding: 12,
                      background: "rgba(255,255,255,0.05)",
                      borderRadius: 10,
                    }}
                  >
                    <span style={{ fontSize: 32 }}>{agent.avatar}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 600, color: "#F5F7FA" }}>
                        {agent.name}
                      </div>
                      <div style={{ fontSize: 12, color: "#A78BFA", marginTop: 2 }}>
                        {agent.role}
                      </div>
                    </div>
                    <span style={{
                      fontSize: 10,
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
              </div>
            </div>
          )}

          {/* Media Deliverables */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 24,
          }}>
            {/* Completed Assets */}
            <div style={{
              background: "linear-gradient(180deg, #111624 0%, #0D1117 100%)",
              borderRadius: 16,
              border: "1px solid rgba(16,185,129,0.3)",
              padding: 24,
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
                ✅ Completed Assets
                <span style={{
                  marginLeft: "auto",
                  fontSize: 10,
                  padding: "2px 8px",
                  borderRadius: 10,
                  background: "rgba(16,185,129,0.2)",
                  color: "#10B981",
                }}>
                  {mediaDeliverables.filter(d => d.status === "complete").length}
                </span>
              </h2>
              {mediaDeliverables.filter(d => d.status === "complete").length === 0 ? (
                <div style={{
                  color: "#6B7186",
                  fontSize: 14,
                  textAlign: "center",
                  padding: 40,
                }}>
                  Assets will appear here as they're built...
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {mediaDeliverables.filter(d => d.status === "complete").map((del) => (
                    <div
                      key={del.id}
                      style={{
                        padding: 16,
                        background: "rgba(16,185,129,0.1)",
                        borderRadius: 10,
                        borderLeft: "3px solid #10B981",
                      }}
                    >
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                      }}>
                        <span style={{ fontSize: 20 }}>
                          {del.type === "email" ? "📧" :
                           del.type === "content" ? "📱" :
                           del.type === "ads" ? "📺" : "📄"}
                        </span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 600, color: "#F5F7FA" }}>
                            {del.title}
                          </div>
                          <div style={{ fontSize: 11, color: "#6B7186" }}>
                            Wave {del.wave} • {del.completedAt ? new Date(del.completedAt).toLocaleTimeString() : ""}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Activity Feed */}
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
                📬 Content Activity
              </h2>
              {contentActivity.length === 0 ? (
                <div style={{
                  color: "#6B7186",
                  fontSize: 14,
                  textAlign: "center",
                  padding: 40,
                }}>
                  No content activity yet
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {contentActivity.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        padding: 14,
                        background: "rgba(255,255,255,0.03)",
                        borderRadius: 10,
                        borderLeft: `3px solid ${item.type === "deliverable" ? "#10B981" : "#7B61FF"}`,
                      }}
                    >
                      <div style={{
                        fontSize: 13,
                        color: "#F5F7FA",
                      }}>
                        {item.message}
                      </div>
                      <div style={{
                        fontSize: 10,
                        color: "#6B7186",
                        marginTop: 6,
                        fontFamily: "'Orbitron', monospace",
                      }}>
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
