// Shared simulation state - used by LiveDemo (write) and dashboards (read)

export const SIMULATION_STATE_KEY = "aim-simulation-state";

export interface SimulationAgent {
  id: string;
  name: string;
  avatar: string;
  role: string;
  status: "idle" | "working" | "complete";
  progress: number;
  wave: number;
  tasksCompleted: number;
}

export interface SimulationTask {
  id: string;
  title: string;
  agent: string;
  status: "queued" | "in_progress" | "complete";
  progress: number;
}

export interface SimulationActivity {
  id: string;
  message: string;
  type: "info" | "success" | "warning" | "signal" | "gate" | "task" | "deliverable";
  signal?: string;
  timestamp: string;
}

export interface SimulationMetrics {
  prospects: number;
  dms: number;
  replies: number;
  calls: number;
}

export interface SimulationDeliverable {
  id: string;
  type: "website" | "cart" | "email" | "content" | "funnel" | "ads";
  title: string;
  status: "building" | "complete";
  completedAt?: string;
  wave: number;
}

export interface SimulationState {
  businessName: string;
  phase: string;
  waveStatus: {
    wave1: { status: string; progress: number };
    wave2: { status: string; progress: number };
    wave3: { status: string; progress: number };
  };
  agents: SimulationAgent[];
  tasks: SimulationTask[];
  activity: SimulationActivity[];
  metrics: SimulationMetrics;
  deliverables: SimulationDeliverable[];
  lastUpdated: string;
}

export function saveSimulationState(state: SimulationState): void {
  try {
    localStorage.setItem(SIMULATION_STATE_KEY, JSON.stringify({
      ...state,
      lastUpdated: new Date().toISOString(),
    }));
  } catch (e) {
    console.error("Failed to save simulation state:", e);
  }
}

export function loadSimulationState(): SimulationState | null {
  try {
    const saved = localStorage.getItem(SIMULATION_STATE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error("Failed to load simulation state:", e);
  }
  return null;
}

export function clearSimulationState(): void {
  localStorage.removeItem(SIMULATION_STATE_KEY);
}

// Default empty state
export const emptySimulationState: SimulationState = {
  businessName: "",
  phase: "startup",
  waveStatus: {
    wave1: { status: "pending", progress: 0 },
    wave2: { status: "pending", progress: 0 },
    wave3: { status: "pending", progress: 0 },
  },
  agents: [],
  tasks: [],
  activity: [],
  metrics: { prospects: 0, dms: 0, replies: 0, calls: 0 },
  deliverables: [],
  lastUpdated: "",
};
