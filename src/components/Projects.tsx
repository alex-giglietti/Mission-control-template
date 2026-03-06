"use client";

import { useState, useEffect } from "react";
import { loadSimulationState, SimulationState, emptySimulationState } from "@/lib/simulation-state";

const KANBAN_COLUMNS = [
  { id: 'queued', title: 'Queued', color: '#94A3B8' },
  { id: 'in_progress', title: 'In Progress', color: '#A78BFA' },
  { id: 'complete', title: 'Complete', color: '#34D399' },
];

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  queued: { bg: 'rgba(100,116,139,0.2)', text: '#94A3B8', border: '#64748B' },
  in_progress: { bg: 'rgba(124,58,237,0.2)', text: '#A78BFA', border: '#7C3AED' },
  complete: { bg: 'rgba(16,185,129,0.2)', text: '#10B981', border: '#059669' },
};

export default function Projects() {
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
  const tasks = simState.tasks;
  const agents = simState.agents;
  const deliverables = simState.deliverables;

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status);
  };

  const getAgentById = (agentId: string) => {
    return agents.find(a => a.id === agentId);
  };

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
            color: "#7B61FF",
            fontFamily: "'Orbitron', monospace",
            marginBottom: 4,
          }}>
            PROJECT MANAGEMENT
          </div>
          <h1 style={{
            fontSize: 28,
            fontWeight: 700,
            color: "#F5F7FA",
            margin: 0,
            fontFamily: "'Space Grotesk', sans-serif",
          }}>
            Tasks & Projects
          </h1>
          {hasData && (
            <p style={{ color: "#6B7186", fontSize: 13, marginTop: 4 }}>
              {simState.businessName}
            </p>
          )}
        </div>
        <div style={{
          display: "flex",
          gap: 12,
        }}>
          <StatPill label="Total Tasks" value={tasks.length} />
          <StatPill label="In Progress" value={getTasksByStatus("in_progress").length} color="#A78BFA" />
          <StatPill label="Complete" value={getTasksByStatus("complete").length} color="#34D399" />
          <StatPill label="Deliverables" value={deliverables.length} color="#FF4EDB" />
        </div>
      </div>

      {loading ? (
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 80,
          color: "#6B7186",
        }}>
          Loading tasks...
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
          <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
          <div style={{ color: "#F5F7FA", fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
            No Tasks Yet
          </div>
          <div style={{ color: "#6B7186", fontSize: 14 }}>
            Start a business build from <span style={{ color: "#FF4EDB" }}>🔴 LIVE BUILD</span> to create tasks
          </div>
        </div>
      ) : (
        <>
          {/* Kanban Board */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
            alignItems: "flex-start",
            marginBottom: 24,
          }}>
            {KANBAN_COLUMNS.map((column) => (
              <div key={column.id} style={{
                background: "linear-gradient(180deg, #111624 0%, #0D1117 100%)",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.08)",
                minHeight: 300,
              }}>
                {/* Column header */}
                <div style={{
                  padding: "16px 16px 12px",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}>
                  <div style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: column.color,
                  }} />
                  <span style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#F5F7FA",
                  }}>
                    {column.title}
                  </span>
                  <span style={{
                    fontSize: 11,
                    color: "#6B7186",
                    marginLeft: "auto",
                  }}>
                    {getTasksByStatus(column.id).length}
                  </span>
                </div>

                {/* Tasks */}
                <div style={{ padding: 8, display: "flex", flexDirection: "column", gap: 8 }}>
                  {getTasksByStatus(column.id).length === 0 ? (
                    <div style={{
                      padding: 20,
                      textAlign: "center",
                      color: "#4B5563",
                      fontSize: 12,
                    }}>
                      {column.id === "queued" && "Tasks will appear here..."}
                      {column.id === "in_progress" && "Tasks being worked on..."}
                      {column.id === "complete" && "Completed tasks..."}
                    </div>
                  ) : (
                    getTasksByStatus(column.id).map((task) => {
                      const agent = getAgentById(task.agent);
                      return (
                        <TaskCard 
                          key={task.id} 
                          task={task} 
                          agent={agent} 
                          columnColor={column.color} 
                        />
                      );
                    })
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Deliverables Section */}
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
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}>
              📦 Project Deliverables
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
            
            {deliverables.length === 0 ? (
              <div style={{
                color: "#6B7186",
                fontSize: 14,
                textAlign: "center",
                padding: 40,
              }}>
                Deliverables will appear here as agents complete their work...
              </div>
            ) : (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: 16,
              }}>
                {deliverables.map((del) => (
                  <div
                    key={del.id}
                    style={{
                      padding: 16,
                      background: del.status === "complete" 
                        ? "rgba(16,185,129,0.1)" 
                        : "rgba(124,58,237,0.1)",
                      borderRadius: 12,
                      border: del.status === "complete"
                        ? "1px solid rgba(16,185,129,0.3)"
                        : "1px solid rgba(124,58,237,0.3)",
                    }}
                  >
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                    }}>
                      <span style={{ fontSize: 28 }}>
                        {del.type === "website" ? "🌐" :
                         del.type === "cart" ? "🛒" :
                         del.type === "email" ? "📧" :
                         del.type === "content" ? "📱" :
                         del.type === "funnel" ? "📞" :
                         del.type === "ads" ? "📺" : "📄"}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#F5F7FA" }}>
                          {del.title}
                        </div>
                        <div style={{ fontSize: 11, color: "#6B7186", marginTop: 4 }}>
                          Wave {del.wave} • {del.type}
                        </div>
                      </div>
                      <span style={{
                        fontSize: 10,
                        padding: "4px 10px",
                        borderRadius: 4,
                        background: del.status === "complete" ? "rgba(16,185,129,0.2)" : "rgba(124,58,237,0.2)",
                        color: del.status === "complete" ? "#10B981" : "#A78BFA",
                        textTransform: "uppercase",
                        fontWeight: 600,
                      }}>
                        {del.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function StatPill({ label, value, color = "#F5F7FA" }: { label: string; value: number; color?: string }) {
  return (
    <div style={{
      padding: "8px 16px",
      background: "rgba(255,255,255,0.05)",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 8,
      display: "flex",
      alignItems: "center",
      gap: 8,
    }}>
      <span style={{ fontSize: 16, fontWeight: 700, color }}>{value}</span>
      <span style={{ fontSize: 11, color: "#6B7186" }}>{label}</span>
    </div>
  );
}

function TaskCard({ task, agent, columnColor }: { task: any; agent: any; columnColor: string }) {
  const statusStyle = STATUS_COLORS[task.status] || STATUS_COLORS.queued;

  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      borderRadius: 8,
      padding: 12,
      borderLeft: `3px solid ${columnColor}`,
      transition: "all 0.15s ease",
    }}>
      <div style={{
        fontSize: 13,
        fontWeight: 500,
        color: "#F5F7FA",
        marginBottom: 8,
        lineHeight: 1.4,
      }}>
        {task.title}
      </div>

      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        {task.progress > 0 && task.progress < 100 && (
          <div style={{
            flex: 1,
            marginRight: 10,
          }}>
            <div style={{
              height: 4,
              background: "rgba(255,255,255,0.1)",
              borderRadius: 2,
              overflow: "hidden",
            }}>
              <div style={{
                width: `${task.progress}%`,
                height: "100%",
                background: columnColor,
                transition: "width 0.3s ease",
              }} />
            </div>
          </div>
        )}

        {agent && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}>
            <span style={{ fontSize: 14 }}>{agent.avatar}</span>
            <span style={{
              fontSize: 10,
              color: "#6B7186",
            }}>
              {agent.name}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
