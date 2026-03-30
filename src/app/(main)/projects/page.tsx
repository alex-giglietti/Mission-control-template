"use client";

import { useEffect, useState, useCallback } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TaskStep {
  id: string;
  description: string;
  tool?: string; // "GHL" | "Stripe" | "Calendly" | "ServiceTitan" | "Teachable" | undefined
  toolType?: "api" | "browser" | "physical";
  completed: boolean;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string; // "todo" | "in_progress" | "done" | "inbox"
  priority: string;
  assigned_agent?: string;
  due_date?: string;
  tags?: string;
  steps?: string; // JSON array of TaskStep
  created_at: string;
  updated_at: string;
}

type ViewMode = "kanban" | "list";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseSteps(raw?: string): TaskStep[] {
  if (!raw) return [];
  try { return JSON.parse(raw) as TaskStep[]; } catch { return []; }
}

function getStatusDot(task: Task): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (task.status === "in_progress") return "#22c55e";
  if (task.status === "done") return "#22c55e";

  if (!task.due_date) return "#9ca3af";

  const due = new Date(task.due_date);
  due.setHours(0, 0, 0, 0);

  if (due < today) return "#ef4444";
  if (due.getTime() === today.getTime()) return "#DAA520";
  return "#9ca3af";
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "No due date";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function isToday(dateStr?: string): boolean {
  if (!dateStr) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  return d.getTime() === today.getTime();
}

function isOverdue(dateStr?: string): boolean {
  if (!dateStr) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  return d < today;
}

// ---------------------------------------------------------------------------
// KPI Card
// ---------------------------------------------------------------------------

function KpiCard({ label, value }: { label: string; value: number }) {
  return (
    <div style={{
      background: "#fff",
      border: "1px solid #e5e7eb",
      borderRadius: 8,
      padding: "20px 24px",
      flex: 1,
      minWidth: 140,
    }}>
      <div style={{ fontSize: 28, fontWeight: 700, color: "#111", fontFamily: "Montserrat, sans-serif" }}>{value}</div>
      <div style={{ fontSize: 12, color: "#6b7280", fontFamily: "Montserrat, sans-serif", marginTop: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Task Detail Panel
// ---------------------------------------------------------------------------

function TaskDetailPanel({
  task,
  onClose,
  onTaskUpdate,
}: {
  task: Task;
  onClose: () => void;
  onTaskUpdate: (updated: Task) => void;
}) {
  const [steps, setSteps] = useState<TaskStep[]>(parseSteps(task.steps));
  const [saving, setSaving] = useState(false);

  const toggleStep = async (stepId: string) => {
    const updated = steps.map(s => s.id === stepId ? { ...s, completed: !s.completed } : s);
    setSteps(updated);
    await fetch("/api/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: task.id, steps: updated }),
    });
  };

  const markAllComplete = async () => {
    setSaving(true);
    const updated = steps.map(s => ({ ...s, completed: true }));
    setSteps(updated);
    const res = await fetch("/api/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: task.id, steps: updated, status: "done" }),
    });
    const data = await res.json();
    if (data.task) onTaskUpdate(data.task);
    setSaving(false);
  };

  const executeWithAI = (step: TaskStep) => {
    alert(`Executing "${step.description}" via ${step.tool || "AI"}...`);
  };

  const buildWithCowork = (step: TaskStep) => {
    alert(`Opening browser cowork for "${step.description}" via ${step.tool}...`);
  };

  return (
    <div
      style={{
        position: "fixed", top: 0, right: 0, bottom: 0, width: 420,
        background: "#fff", borderLeft: "1px solid #e5e7eb",
        zIndex: 1000, display: "flex", flexDirection: "column",
        boxShadow: "-4px 0 24px rgba(0,0,0,0.08)",
        fontFamily: "Montserrat, sans-serif",
      }}
    >
      {/* Header */}
      <div style={{ padding: "20px 24px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#111", marginBottom: 4 }}>{task.title}</div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>{formatDate(task.due_date)}</div>
          {task.assigned_agent && (
            <div style={{ fontSize: 11, color: "#9ca3af", fontStyle: "italic", marginTop: 2 }}>{task.assigned_agent}</div>
          )}
        </div>
        <button
          onClick={onClose}
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#9ca3af", padding: 4 }}
        >
          x
        </button>
      </div>

      {/* Description */}
      {task.description && (
        <div style={{ padding: "16px 24px", borderBottom: "1px solid #f3f4f6" }}>
          <div style={{ fontSize: 12, color: "#6b7280" }}>{task.description}</div>
        </div>
      )}

      {/* Steps */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px" }}>
        {steps.length === 0 ? (
          <div style={{ fontSize: 12, color: "#9ca3af", textAlign: "center", marginTop: 40 }}>No steps defined for this task.</div>
        ) : (
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Steps</div>
            {steps.map((step) => (
              <div
                key={step.id}
                style={{
                  display: "flex", alignItems: "flex-start", gap: 10,
                  padding: "12px 0", borderBottom: "1px solid #f3f4f6",
                }}
              >
                <input
                  type="checkbox"
                  checked={step.completed}
                  onChange={() => toggleStep(step.id)}
                  style={{ marginTop: 2, cursor: "pointer", accentColor: "#111" }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: 13, color: step.completed ? "#9ca3af" : "#111",
                    textDecoration: step.completed ? "line-through" : "none",
                    marginBottom: 4,
                  }}>
                    {step.description}
                  </div>
                  {step.tool && (
                    <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 6 }}>{step.tool}</div>
                  )}
                  {/* Action buttons per step type */}
                  {step.toolType === "api" && !step.completed && (
                    <button
                      onClick={() => executeWithAI(step)}
                      style={{
                        fontSize: 11, padding: "4px 10px",
                        background: "#111", color: "#fff",
                        border: "none", borderRadius: 4, cursor: "pointer",
                        fontFamily: "Montserrat, sans-serif", fontWeight: 600,
                      }}
                    >
                      Execute with AI
                    </button>
                  )}
                  {step.toolType === "browser" && !step.completed && (
                    <button
                      onClick={() => buildWithCowork(step)}
                      style={{
                        fontSize: 11, padding: "4px 10px",
                        background: "#fff", color: "#111",
                        border: "1px solid #111", borderRadius: 4, cursor: "pointer",
                        fontFamily: "Montserrat, sans-serif", fontWeight: 600,
                      }}
                    >
                      Build with Cowork
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: "16px 24px", borderTop: "1px solid #e5e7eb" }}>
        <button
          onClick={markAllComplete}
          disabled={saving}
          style={{
            width: "100%", padding: "10px 0",
            background: "#111", color: "#fff",
            border: "none", borderRadius: 6, cursor: "pointer",
            fontSize: 13, fontWeight: 700, fontFamily: "Montserrat, sans-serif",
            opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? "Saving..." : "Mark all complete"}
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Task Card (Kanban)
// ---------------------------------------------------------------------------

function TaskCard({
  task,
  onSelect,
  onStatusChange,
  onMarkComplete,
  onReassign,
}: {
  task: Task;
  onSelect: (t: Task) => void;
  onStatusChange: (id: string, status: string) => void;
  onMarkComplete: (id: string) => void;
  onReassign: (id: string) => void;
}) {
  const [showMoveMenu, setShowMoveMenu] = useState(false);
  const dot = getStatusDot(task);

  const statusOptions = [
    { value: "todo", label: "To Do" },
    { value: "in_progress", label: "In Progress" },
    { value: "done", label: "Done" },
  ];

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        padding: "14px 14px 10px",
        marginBottom: 8,
        cursor: "pointer",
        position: "relative",
        fontFamily: "Montserrat, sans-serif",
      }}
    >
      {/* Card body — click to open detail */}
      <div onClick={() => onSelect(task)}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 6 }}>
          <div style={{
            width: 8, height: 8, borderRadius: "50%",
            background: dot, flexShrink: 0, marginTop: 3,
          }} />
          <div style={{ fontSize: 13, fontWeight: 700, color: "#111", flex: 1, lineHeight: 1.4 }}>{task.title}</div>
        </div>
        <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 4, paddingLeft: 16 }}>{formatDate(task.due_date)}</div>
        {task.assigned_agent && (
          <div style={{ fontSize: 11, color: "#9ca3af", fontStyle: "italic", paddingLeft: 16 }}>{task.assigned_agent}</div>
        )}
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 6, marginTop: 10, paddingLeft: 16, alignItems: "center", flexWrap: "wrap" }}>
        <button
          onClick={(e) => { e.stopPropagation(); onSelect(task); }}
          style={{
            fontSize: 11, padding: "4px 10px",
            background: "#111", color: "#fff",
            border: "none", borderRadius: 4, cursor: "pointer",
            fontFamily: "Montserrat, sans-serif", fontWeight: 600,
          }}
        >
          Execute
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); onReassign(task.id); }}
          style={{
            fontSize: 11, background: "none", border: "none",
            color: "#6b7280", cursor: "pointer", padding: "4px 2px",
            fontFamily: "Montserrat, sans-serif",
          }}
        >
          Reassign
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); onMarkComplete(task.id); }}
          style={{
            fontSize: 11, background: "none", border: "none",
            color: "#6b7280", cursor: "pointer", padding: "4px 2px",
            fontFamily: "Montserrat, sans-serif",
          }}
        >
          Mark complete
        </button>

        {/* Move to dropdown */}
        <div style={{ position: "relative", marginLeft: "auto" }}>
          <button
            onClick={(e) => { e.stopPropagation(); setShowMoveMenu(v => !v); }}
            style={{
              fontSize: 10, background: "none", border: "1px solid #e5e7eb",
              color: "#9ca3af", cursor: "pointer", padding: "3px 8px",
              borderRadius: 4, fontFamily: "Montserrat, sans-serif",
            }}
          >
            Move to
          </button>
          {showMoveMenu && (
            <div style={{
              position: "absolute", right: 0, top: "calc(100% + 4px)",
              background: "#fff", border: "1px solid #e5e7eb",
              borderRadius: 6, boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              zIndex: 50, minWidth: 120,
            }}>
              {statusOptions.filter(o => o.value !== task.status).map(opt => (
                <div
                  key={opt.value}
                  onClick={(e) => { e.stopPropagation(); setShowMoveMenu(false); onStatusChange(task.id, opt.value); }}
                  style={{
                    padding: "8px 14px", fontSize: 12, color: "#374151",
                    cursor: "pointer", fontFamily: "Montserrat, sans-serif",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#f9fafb")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  {opt.label}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Reassign Modal
// ---------------------------------------------------------------------------

function ReassignModal({
  taskId,
  current,
  onSave,
  onClose,
}: {
  taskId: string;
  current?: string;
  onSave: (id: string, agent: string) => void;
  onClose: () => void;
}) {
  const [value, setValue] = useState(current || "");
  const agents = ["Solomon", "Phil", "Alex", "Joseph Aaron"];

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)",
      zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center",
    }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff", borderRadius: 10, padding: "24px 28px",
          minWidth: 300, boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
          fontFamily: "Montserrat, sans-serif",
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: "#111" }}>Reassign Task</div>
        <select
          value={value}
          onChange={e => setValue(e.target.value)}
          style={{
            width: "100%", padding: "8px 12px", fontSize: 13,
            border: "1px solid #e5e7eb", borderRadius: 6, marginBottom: 16,
            fontFamily: "Montserrat, sans-serif", color: "#111",
          }}
        >
          <option value="">Select agent...</option>
          {agents.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <input
          placeholder="Or type a name..."
          value={value}
          onChange={e => setValue(e.target.value)}
          style={{
            width: "100%", padding: "8px 12px", fontSize: 13,
            border: "1px solid #e5e7eb", borderRadius: 6, marginBottom: 16,
            fontFamily: "Montserrat, sans-serif", color: "#111",
            boxSizing: "border-box",
          }}
        />
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ fontSize: 13, background: "none", border: "1px solid #e5e7eb", padding: "8px 16px", borderRadius: 6, cursor: "pointer", fontFamily: "Montserrat, sans-serif" }}>Cancel</button>
          <button onClick={() => { if (value.trim()) onSave(taskId, value.trim()); }} style={{ fontSize: 13, background: "#111", color: "#fff", border: "none", padding: "8px 16px", borderRadius: 6, cursor: "pointer", fontFamily: "Montserrat, sans-serif", fontWeight: 700 }}>Save</button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function ProjectsPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewMode>("kanban");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [reassignTaskId, setReassignTaskId] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/tasks");
      const data = await res.json();
      setTasks(data.tasks || []);
    } catch {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  // ---------------------------------------------------------------------------
  // Derived counts for KPI cards
  // ---------------------------------------------------------------------------

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueToday = tasks.filter(t => isToday(t.due_date) && t.status !== "done").length;
  const inProgress = tasks.filter(t => t.status === "in_progress").length;
  const completed = tasks.filter(t => t.status === "done").length;
  const upcoming = tasks.filter(t => {
    if (!t.due_date || t.status === "done") return false;
    const d = new Date(t.due_date);
    d.setHours(0, 0, 0, 0);
    return d > today;
  }).length;

  // ---------------------------------------------------------------------------
  // Kanban columns
  // ---------------------------------------------------------------------------

  const todoTasks = tasks.filter(t => t.status === "todo" || t.status === "inbox");
  const inProgressTasks = tasks.filter(t => t.status === "in_progress");
  const doneTasks = tasks.filter(t => t.status === "done");

  // ---------------------------------------------------------------------------
  // List groups
  // ---------------------------------------------------------------------------

  const dueTodayTasks = tasks.filter(t => isToday(t.due_date) && t.status !== "done");
  const inProgressListTasks = tasks.filter(t => t.status === "in_progress" && !isToday(t.due_date));
  const upcomingTasks = tasks.filter(t => {
    if (t.status === "done" || t.status === "in_progress") return false;
    if (!t.due_date) return true;
    const d = new Date(t.due_date);
    d.setHours(0, 0, 0, 0);
    return d > today;
  });

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

  const handleStatusChange = async (id: string, status: string) => {
    const res = await fetch("/api/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    const data = await res.json();
    if (data.task) {
      setTasks(prev => prev.map(t => t.id === id ? data.task : t));
      if (selectedTask?.id === id) setSelectedTask(data.task);
    }
  };

  const handleMarkComplete = async (id: string) => {
    await handleStatusChange(id, "done");
  };

  const handleReassign = (id: string) => setReassignTaskId(id);

  const handleReassignSave = async (id: string, agent: string) => {
    const res = await fetch("/api/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, assigned_agent: agent }),
    });
    const data = await res.json();
    if (data.task) {
      setTasks(prev => prev.map(t => t.id === id ? data.task : t));
      if (selectedTask?.id === id) setSelectedTask(data.task);
    }
    setReassignTaskId(null);
  };

  const handleTaskUpdate = (updated: Task) => {
    setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
    setSelectedTask(updated);
  };

  // ---------------------------------------------------------------------------
  // Render helpers
  // ---------------------------------------------------------------------------

  const KanbanColumn = ({ title, tasks: colTasks, statusValue }: { title: string; tasks: Task[]; statusValue: string }) => (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{
        fontSize: 11, fontWeight: 700, color: "#9ca3af",
        textTransform: "uppercase", letterSpacing: "0.08em",
        marginBottom: 12,
      }}>
        {title} <span style={{ color: "#d1d5db" }}>({colTasks.length})</span>
      </div>
      <div style={{
        background: "#fafafa",
        borderRadius: 8,
        padding: "12px 10px",
        minHeight: 200,
      }}>
        {colTasks.length === 0 ? (
          <div style={{ fontSize: 12, color: "#d1d5db", textAlign: "center", paddingTop: 32, fontFamily: "Montserrat, sans-serif" }}>
            No tasks
          </div>
        ) : (
          colTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onSelect={setSelectedTask}
              onStatusChange={handleStatusChange}
              onMarkComplete={handleMarkComplete}
              onReassign={handleReassign}
            />
          ))
        )}
      </div>
    </div>
  );

  const ListGroup = ({ groupLabel, groupTasks }: { groupLabel: string; groupTasks: Task[] }) => {
    if (groupTasks.length === 0) return null;
    return (
      <div style={{ marginBottom: 32 }}>
        <div style={{
          fontSize: 11, fontWeight: 700, color: "#9ca3af",
          textTransform: "uppercase", letterSpacing: "0.08em",
          marginBottom: 10, paddingBottom: 8,
          borderBottom: "1px solid #f3f4f6",
        }}>
          {groupLabel}
        </div>
        {groupTasks.map(task => (
          <div
            key={task.id}
            style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "12px 0", borderBottom: "1px solid #f9fafb",
              fontFamily: "Montserrat, sans-serif",
            }}
          >
            <div style={{
              width: 8, height: 8, borderRadius: "50%",
              background: getStatusDot(task), flexShrink: 0,
            }} />
            <div
              style={{ flex: 1, cursor: "pointer" }}
              onClick={() => setSelectedTask(task)}
            >
              <span style={{ fontSize: 13, fontWeight: 600, color: "#111" }}>{task.title}</span>
              {task.assigned_agent && (
                <span style={{ fontSize: 11, color: "#9ca3af", fontStyle: "italic", marginLeft: 10 }}>{task.assigned_agent}</span>
              )}
            </div>
            <div style={{ fontSize: 11, color: "#9ca3af", flexShrink: 0, width: 110, textAlign: "right" }}>
              {formatDate(task.due_date)}
            </div>
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              <button
                onClick={() => setSelectedTask(task)}
                style={{
                  fontSize: 11, padding: "4px 10px",
                  background: "#111", color: "#fff",
                  border: "none", borderRadius: 4, cursor: "pointer",
                  fontFamily: "Montserrat, sans-serif", fontWeight: 600,
                }}
              >
                Execute
              </button>
              <button
                onClick={() => handleMarkComplete(task.id)}
                style={{
                  fontSize: 11, background: "none", border: "none",
                  color: "#6b7280", cursor: "pointer", padding: "4px 2px",
                  fontFamily: "Montserrat, sans-serif",
                }}
              >
                Mark complete
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // ---------------------------------------------------------------------------
  // JSX
  // ---------------------------------------------------------------------------

  return (
    <div style={{ background: "#fff", minHeight: "100vh", fontFamily: "Montserrat, sans-serif" }}>
      {/* Backdrop for move menus */}
      {selectedTask === null && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 40 }}
          onClick={() => {}}
        />
      )}

      <div style={{ padding: "32px 36px", maxWidth: 1200, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111", margin: 0 }}>Projects</h1>
            <p style={{ fontSize: 13, color: "#6b7280", margin: "4px 0 0" }}>Task board for all active work</p>
          </div>

          {/* View toggle */}
          <div style={{
            display: "flex", background: "#f3f4f6", borderRadius: 8, padding: 3, gap: 2,
          }}>
            {(["kanban", "list"] as ViewMode[]).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                style={{
                  fontSize: 12, padding: "6px 16px",
                  background: view === v ? "#fff" : "transparent",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                  color: view === v ? "#111" : "#6b7280",
                  fontWeight: view === v ? 700 : 400,
                  fontFamily: "Montserrat, sans-serif",
                  boxShadow: view === v ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                  textTransform: "capitalize",
                }}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* KPI Row */}
        <div style={{ display: "flex", gap: 16, marginBottom: 32, flexWrap: "wrap" }}>
          <KpiCard label="Due Today" value={dueToday} />
          <KpiCard label="In Progress" value={inProgress} />
          <KpiCard label="Completed" value={completed} />
          <KpiCard label="Upcoming" value={upcoming} />
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ fontSize: 13, color: "#9ca3af", textAlign: "center", padding: "40px 0" }}>Loading tasks...</div>
        )}

        {/* Kanban View */}
        {!loading && view === "kanban" && (
          <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
            <KanbanColumn title="To Do" tasks={todoTasks} statusValue="todo" />
            <KanbanColumn title="In Progress" tasks={inProgressTasks} statusValue="in_progress" />
            <KanbanColumn title="Done" tasks={doneTasks} statusValue="done" />
          </div>
        )}

        {/* List View */}
        {!loading && view === "list" && (
          <div>
            {tasks.length === 0 ? (
              <div style={{ fontSize: 13, color: "#9ca3af", textAlign: "center", padding: "40px 0" }}>No tasks found.</div>
            ) : (
              <>
                <ListGroup groupLabel="Due Today" groupTasks={dueTodayTasks} />
                <ListGroup groupLabel="In Progress" groupTasks={inProgressListTasks} />
                <ListGroup groupLabel="Upcoming" groupTasks={upcomingTasks} />
              </>
            )}
          </div>
        )}
      </div>

      {/* Task Detail Panel */}
      {selectedTask && (
        <TaskDetailPanel
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onTaskUpdate={handleTaskUpdate}
        />
      )}

      {/* Reassign Modal */}
      {reassignTaskId && (
        <ReassignModal
          taskId={reassignTaskId}
          current={tasks.find(t => t.id === reassignTaskId)?.assigned_agent}
          onSave={handleReassignSave}
          onClose={() => setReassignTaskId(null)}
        />
      )}
    </div>
  );
}
