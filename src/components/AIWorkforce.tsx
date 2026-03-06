"use client";

import { useState, useEffect } from "react";
import { loadSimulationState, SimulationState, SimulationAgent, emptySimulationState } from "@/lib/simulation-state";

const statusColors = {
  idle: { bg: "rgba(100,116,139,0.2)", border: "#64748B", text: "#94A3B8", label: "IDLE" },
  working: { bg: "rgba(124,58,237,0.2)", border: "#7C3AED", text: "#A78BFA", label: "WORKING" },
  complete: { bg: "rgba(16,185,129,0.2)", border: "#10B981", text: "#34D399", label: "COMPLETE" },
};

export default function AIWorkforce() {
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

  const agents = simState.agents;
  const hasData = simState.businessName && simState.phase !== "startup";

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0B0F19",
      padding: 24,
    }}>
      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
      }}>
        <div>
          <div style={{
            fontSize: 10,
            letterSpacing: 2,
            color: "#2F80FF",
            fontFamily: "'Orbitron', monospace",
            marginBottom: 4,
          }}>
            AI WORKFORCE
          </div>
          <h1 style={{
            fontSize: 28,
            fontWeight: 700,
            color: "#F5F7FA",
            margin: 0,
            fontFamily: "'Space Grotesk', sans-serif",
          }}>
            Your AI Team
          </h1>
          {hasData && (
            <p style={{ color: "#6B7186", fontSize: 13, marginTop: 4 }}>
              {simState.businessName}
            </p>
          )}
        </div>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 16px",
          background: agents.filter(a => a.status === "working").length > 0 
            ? "rgba(124,58,237,0.1)" 
            : "rgba(16,185,129,0.1)",
          border: agents.filter(a => a.status === "working").length > 0 
            ? "1px solid rgba(124,58,237,0.3)"
            : "1px solid rgba(16,185,129,0.3)",
          borderRadius: 8,
        }}>
          <span style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: agents.filter(a => a.status === "working").length > 0 ? "#A78BFA" : "#10B981",
            animation: agents.filter(a => a.status === "working").length > 0 ? "pulse 2s infinite" : "none",
          }} />
          <span style={{ 
            color: agents.filter(a => a.status === "working").length > 0 ? "#A78BFA" : "#10B981", 
            fontSize: 12 
          }}>
            {agents.filter(a => a.status === "working").length > 0 
              ? `${agents.filter(a => a.status === "working").length} Working`
              : `${agents.filter(a => a.status === "complete").length} Complete`
            }
          </span>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 16,
        marginBottom: 24,
      }}>
        <StatCard label="Total Agents" value={agents.length} icon="🤖" />
        <StatCard label="Working" value={agents.filter(a => a.status === "working").length} icon="⚡" color="#A78BFA" />
        <StatCard label="Complete" value={agents.filter(a => a.status === "complete").length} icon="✅" color="#10B981" />
        <StatCard 
          label="Tasks Done" 
          value={simState.tasks.filter(t => t.status === "complete").length} 
          icon="📋" 
          color="#2F80FF" 
        />
      </div>

      {/* Agents Grid */}
      {loading ? (
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 80,
          color: "#6B7186",
        }}>
          Loading AI workforce...
        </div>
      ) : agents.length === 0 ? (
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
          <div style={{ fontSize: 48, marginBottom: 16 }}>🤖</div>
          <div style={{ color: "#F5F7FA", fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
            No AI Agents Deployed Yet
          </div>
          <div style={{ color: "#6B7186", fontSize: 14 }}>
            Start a business build from <span style={{ color: "#FF4EDB" }}>🔴 LIVE BUILD</span> to deploy your AI workforce
          </div>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: 20,
        }}>
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} tasks={simState.tasks} />
          ))}
        </div>
      )}

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

function StatCard({ label, value, icon, color = "#F5F7FA" }: { label: string; value: number; icon: string; color?: string }) {
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

function AgentCard({ agent, tasks }: { agent: SimulationAgent; tasks: any[] }) {
  const statusStyle = statusColors[agent.status] || statusColors.idle;
  const agentTasks = tasks.filter(t => t.agent === agent.id);
  const currentTask = agentTasks.find(t => t.status === "in_progress");

  return (
    <div style={{
      background: "linear-gradient(180deg, #111624 0%, #0D1117 100%)",
      borderRadius: 16,
      border: `1px solid ${statusStyle.border}30`,
      padding: 24,
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Status indicator */}
      <div style={{
        position: "absolute",
        top: 16,
        right: 16,
        padding: "4px 10px",
        borderRadius: 4,
        background: statusStyle.bg,
        border: `1px solid ${statusStyle.border}50`,
        fontSize: 9,
        fontWeight: 600,
        color: statusStyle.text,
        fontFamily: "'Orbitron', monospace",
        letterSpacing: 1,
      }}>
        {statusStyle.label}
      </div>

      {/* Agent info */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
        <div style={{
          width: 56,
          height: 56,
          borderRadius: 12,
          background: `linear-gradient(135deg, ${statusStyle.border}30, ${statusStyle.border}10)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 28,
          border: `1px solid ${statusStyle.border}40`,
        }}>
          {agent.avatar}
        </div>
        <div>
          <div style={{
            fontSize: 18,
            fontWeight: 700,
            color: "#F5F7FA",
            fontFamily: "'Space Grotesk', sans-serif",
          }}>
            {agent.name}
          </div>
          <div style={{
            fontSize: 12,
            color: statusStyle.text,
          }}>
            {agent.role} • Wave {agent.wave}
          </div>
        </div>
      </div>

      {/* Current task */}
      <div style={{
        padding: 12,
        background: "rgba(255,255,255,0.03)",
        borderRadius: 8,
        marginBottom: 16,
      }}>
        <div style={{
          fontSize: 10,
          color: "#6B7186",
          textTransform: "uppercase",
          letterSpacing: 1,
          marginBottom: 4,
        }}>
          CURRENT TASK
        </div>
        <div style={{
          fontSize: 13,
          color: "#F5F7FA",
          lineHeight: 1.4,
        }}>
          {currentTask?.title || (agent.status === "complete" ? "All tasks complete ✓" : "Awaiting instructions...")}
        </div>
      </div>

      {/* Progress bar */}
      {agent.status === "working" && (
        <div>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 6,
          }}>
            <span style={{ fontSize: 10, color: "#6B7186" }}>PROGRESS</span>
            <span style={{ fontSize: 10, color: statusStyle.text }}>{Math.round(agent.progress)}%</span>
          </div>
          <div style={{
            height: 6,
            background: "rgba(255,255,255,0.1)",
            borderRadius: 3,
            overflow: "hidden",
          }}>
            <div style={{
              width: `${agent.progress}%`,
              height: "100%",
              background: `linear-gradient(90deg, ${statusStyle.border}, ${statusStyle.text})`,
              borderRadius: 3,
              transition: "width 0.5s ease",
            }} />
          </div>
        </div>
      )}

      {/* Stats */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        marginTop: 16,
        paddingTop: 16,
        borderTop: "1px solid rgba(255,255,255,0.06)",
      }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 600, color: "#F5F7FA" }}>
            {agentTasks.filter(t => t.status === "complete").length}
          </div>
          <div style={{ fontSize: 10, color: "#6B7186" }}>COMPLETED</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{
            fontSize: 12,
            color: statusStyle.text,
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}>
            <span style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: statusStyle.text,
              animation: agent.status === "working" ? "pulse 1s infinite" : "none",
            }} />
            {agent.status === "working" ? "Working..." : agent.status === "complete" ? "Done" : "Idle"}
          </div>
        </div>
      </div>
    </div>
  );
}
