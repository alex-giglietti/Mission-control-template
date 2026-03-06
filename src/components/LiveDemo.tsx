"use client";

import { useState, useEffect, useRef } from "react";
import DeliverablePreview from "./DeliverablePreview";
import { saveSimulationState, SimulationState } from "@/lib/simulation-state";
import { generateWorkflowPrompts, formatWorkflowPromptMarkdown } from "@/lib/ghl-prompts";
import {
  fireSignal,
  MASTER_REVENUE_PLANNER_APPROVED,
  MASTER_WAVE1_SPAWNING,
  MASTER_WAVE1_COMPLETE,
  MASTER_WAVE2_SPAWNING,
  MASTER_WAVE2_COMPLETE,
  MASTER_WAVE3_SPAWNING,
  MASTER_WAVE3_COMPLETE,
  MASTER_ALL_BOTS_COMPLETE,
  MASTER_BOT_FAILED,
  COO_TASK_CLAIMED,
  COO_TASK_COMPLETE,
  COO_TASK_BLOCKED,
  COO_ALL_TASKS_COMPLETE,
} from "@/lib/signals";

interface LiveDemoProps {
  businessName?: string;
  phase?: string;
  revenuePlannerData?: any;
  buildTriggered?: boolean;
}

interface DemoState {
  businessName: string;
  phase: string;
  revenuePlannerData: any | null;
  buildTriggered?: boolean; // True only when LOCK & BUILD just clicked
  business?: {
    niche?: string;
    targetAudience?: string;
    mainOffer?: string;
  };
}

interface Agent {
  id: string;
  name: string;
  avatar: string;
  role: string;
  status: "idle" | "working" | "complete";
  progress: number;
  wave: number;
}

interface Task {
  id: string;
  title: string;
  agent: string;
  status: "queued" | "in_progress" | "complete";
  progress: number;
}

interface Activity {
  id: string;
  message: string;
  type: "info" | "success" | "warning" | "signal" | "gate" | "task" | "deliverable";
  signal?: string;
  timestamp: string;
}

interface Metrics {
  prospects: number;
  dms: number;
  replies: number;
  calls: number;
}

interface Deliverable {
  id: string;
  type: "website" | "cart" | "email" | "content" | "funnel" | "ads";
  title: string;
  status: "building" | "complete";
  completedAt?: string;
  wave: number;
}

const STORAGE_KEY = "aim-demo-state";
const SIGNALS_KEY = "aim-demo-signals";

export default function LiveDemo(props: LiveDemoProps) {
  const [state, setState] = useState<DemoState | null>(null);
  const [businessInfo, setBusinessInfo] = useState<{
    niche?: string;
    targetAudience?: string;
    mainOffer?: string;
  }>({});
  const [waveStatus, setWaveStatus] = useState({
    wave1: { status: "pending", progress: 0 },
    wave2: { status: "pending", progress: 0 },
    wave3: { status: "pending", progress: 0 },
  });
  const [agents, setAgents] = useState<Agent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [metrics, setMetrics] = useState<Metrics>({
    prospects: 0,
    dms: 0,
    replies: 0,
    calls: 0,
  });
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [selectedDeliverable, setSelectedDeliverable] = useState<string | null>(null);
  const [showDeliverablePanel, setShowDeliverablePanel] = useState(false);
  const [newDeliverableFlash, setNewDeliverableFlash] = useState<string | null>(null);
  const simulationStarted = useRef(false);
  const simulationRunId = useRef(0);
  const simulationActiveRef = useRef(false); // Track if simulation is actively running
  const intervalsRef = useRef<Set<NodeJS.Timeout>>(new Set()); // Use Set for easier management
  
  // Helper to safely clear a specific interval
  const clearSimInterval = (id: NodeJS.Timeout) => {
    clearInterval(id);
    intervalsRef.current.delete(id);
  };
  
  // Helper to add interval and return cleanup
  const addSimInterval = (callback: () => void, ms: number): NodeJS.Timeout => {
    const id = setInterval(callback, ms);
    intervalsRef.current.add(id);
    return id;
  };

  // Load state from localStorage and merge with props
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    let finalState: DemoState | null = null;
    
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        finalState = {
          ...parsed,
          // Props override localStorage if provided
          businessName: props.businessName || parsed.businessName,
          phase: props.phase || parsed.phase,
          revenuePlannerData: props.revenuePlannerData || parsed.revenuePlannerData,
        };
      } catch (e) {
        console.error("Failed to load state:", e);
      }
    }
    
    // If props provided but no localStorage, use props directly
    if (!finalState && props.businessName) {
      finalState = {
        businessName: props.businessName,
        phase: props.phase || "building",
        revenuePlannerData: props.revenuePlannerData || null,
      };
    }
    
    if (finalState) {
      setState(finalState);
    }
  }, [props.businessName, props.phase, props.revenuePlannerData]);

  // Separate effect for starting simulation - only runs when buildTriggered is true
  // ONLY use props.buildTriggered (from React state, set when user clicks LOCK & BUILD)
  // Never use state.buildTriggered from localStorage — that would auto-run on page refresh
  const shouldStartSimulation = props.buildTriggered === true;
  
  useEffect(() => {
    // Only start if conditions are met AND simulation hasn't started yet
    if (state && 
        (state.phase === "building" || state.phase === "complete") && 
        state.revenuePlannerData && 
        shouldStartSimulation && 
        !simulationStarted.current &&
        !simulationActiveRef.current) {
      
      simulationStarted.current = true;
      simulationActiveRef.current = true;
      simulationRunId.current += 1;
      const currentRunId = simulationRunId.current;
      
      // Reset buildTriggered in localStorage so refresh won't auto-start
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          parsed.buildTriggered = false;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
        } catch (e) {
          console.error("Failed to reset buildTriggered:", e);
        }
      }
      
      // Small delay to ensure component is mounted
      setTimeout(() => {
        // Only run if this is still the current simulation
        if (currentRunId === simulationRunId.current && simulationActiveRef.current) {
          startWaveSimulation(state.revenuePlannerData);
        }
      }, 500);
    }
    
    // NO cleanup here - intervals are managed by the simulation itself
    // Cleanup only happens on actual unmount via a separate effect
  }, [state, shouldStartSimulation]);
  
  // Separate unmount-only cleanup effect
  useEffect(() => {
    return () => {
      // Only runs on actual component unmount
      simulationActiveRef.current = false;
      intervalsRef.current.forEach(clearInterval);
      intervalsRef.current.clear();
    };
  }, []); // Empty deps = only runs on unmount

  // Fetch additional business info from API
  useEffect(() => {
    const fetchBusinessInfo = async () => {
      try {
        const res = await fetch("/api/demo");
        if (res.ok) {
          const data = await res.json();
          if (data.business) {
            setBusinessInfo({
              niche: data.business.niche,
              targetAudience: data.business.targetAudience,
              mainOffer: data.business.mainOffer,
            });
          }
        }
      } catch (e) {
        console.error("Failed to fetch business info:", e);
      }
    };
    fetchBusinessInfo();
  }, []);

  // PERSIST simulation state to localStorage for other dashboards to read
  useEffect(() => {
    if (state && (state.phase === "building" || state.phase === "complete")) {
      const simState: SimulationState = {
        businessName: state.businessName,
        phase: state.phase,
        waveStatus,
        agents: agents.map(a => ({ ...a, tasksCompleted: a.status === "complete" ? 1 : 0 })),
        tasks,
        activity,
        metrics,
        deliverables,
        lastUpdated: new Date().toISOString(),
      };
      saveSimulationState(simState);
    }
  }, [state, waveStatus, agents, tasks, activity, metrics, deliverables]);

  // Poll for protocol signals from localStorage (added by chat components)
  useEffect(() => {
    const loadSignalsFromStorage = () => {
      try {
        const signalsJson = localStorage.getItem(SIGNALS_KEY);
        if (signalsJson) {
          const signals = JSON.parse(signalsJson);
          if (signals.length > 0) {
            // Add signals to activity that haven't been added yet
            setActivity(prev => {
              const existingIds = new Set(prev.map(a => a.id));
              const newSignals = signals
                .filter((s: any) => !existingIds.has(s.id))
                .map((s: any) => ({
                  id: s.id,
                  message: s.message,
                  type: "signal" as const,
                  signal: s.signal,
                  timestamp: s.timestamp,
                }));
              
              if (newSignals.length > 0) {
                return [...newSignals, ...prev].slice(0, 100);
              }
              return prev;
            });
          }
        }
      } catch (e) {
        console.error("Failed to load signals:", e);
      }
    };

    // Load immediately
    loadSignalsFromStorage();

    // Poll every 2 seconds
    const pollInterval = setInterval(loadSignalsFromStorage, 2000);
    
    return () => clearInterval(pollInterval);
  }, []);

  const addActivity = (message: string, type: Activity["type"], signal?: string) => {
    setActivity(prev => [{
      id: `activity-${Date.now()}-${Math.random()}`,
      message,
      type,
      signal,
      timestamp: new Date().toISOString(),
    }, ...prev].slice(0, 100));
  };

  const addTask = (title: string, agentId: string) => {
    const taskId = `task-${Date.now()}-${Math.random()}`;
    setTasks(prev => [{
      id: taskId,
      title,
      agent: agentId,
      status: "queued",
      progress: 0,
    }, ...prev]);
    return taskId;
  };

  const updateTaskProgress = (taskId: string, progress: number, status?: Task["status"]) => {
    setTasks(prev => prev.map(t => 
      t.id === taskId 
        ? { ...t, progress: Math.min(progress, 100), status: status || (progress >= 100 ? "complete" : "in_progress") }
        : t
    ));
  };

  const addDeliverable = (type: Deliverable["type"], title: string, wave: number) => {
    const id = `deliverable-${type}-${Date.now()}`;
    setDeliverables(prev => [...prev, {
      id,
      type,
      title,
      status: "building",
      wave,
    }]);
    return id;
  };

  const completeDeliverable = (id: string) => {
    setDeliverables(prev => {
      const updated = prev.map(d => 
        d.id === id 
          ? { ...d, status: "complete" as const, completedAt: new Date().toISOString() }
          : d
      );
      
      // Check if this is the FIRST completed deliverable (to auto-preview)
      const completedCount = updated.filter(d => d.status === "complete").length;
      if (completedCount === 1) {
        // First deliverable! Show a hint notification
        setTimeout(() => {
          addActivity("💡 TIP: Click any preview to view it full-size!", "info");
        }, 1500);
      }
      
      return updated;
    });
    
    // Flash animation for new deliverable
    setNewDeliverableFlash(id);
    setTimeout(() => setNewDeliverableFlash(null), 2000);
    
    // Auto-select and show panel
    setSelectedDeliverable(id);
    setShowDeliverablePanel(true);
  };

  // Fail-Forward: Bot timeout limits (Section 10 of MASTER-SYSTEM-PROMPT)
  const BOT_TIMEOUTS: Record<string, number> = {
    website: 180000,    // 3 minutes
    cart: 180000,       // 3 minutes
    call: 180000,       // 3 minutes
    event: 180000,      // 3 minutes
    email: 120000,      // 2 minutes
    outbound: 180000,   // 3 minutes
    partnership: 180000,// 3 minutes
    content: 300000,    // 5 minutes
    ads: 180000,        // 3 minutes
  };

  // Set a timeout for an entire wave — if it takes too long, force-complete and continue
  const setWaveTimeout = (waveName: string, waveNum: number, maxMs: number, runId: number) => {
    const timeoutId = setTimeout(() => {
      if (runId !== simulationRunId.current || !simulationActiveRef.current) return;

      fireSignal(MASTER_BOT_FAILED, `${waveName} timed out after ${maxMs / 1000}s — forcing completion`, {
        businessName: state?.businessName,
        wave: waveNum,
      });
      addActivity(`⚠️ ${waveName} exceeded time limit — forcing completion`, "warning");

      // Force-complete all agents/tasks in this wave
      setAgents(prev => prev.map(a =>
        a.wave === waveNum && a.status === "working" ? { ...a, status: "complete", progress: 100 } : a
      ));
    }, maxMs);

    // Track so cleanup can clear it
    intervalsRef.current.add(timeoutId as unknown as NodeJS.Timeout);
  };

  const startMetricsSimulation = (runId: number) => {
    // Simulate metrics counting up over time
    let metricsInterval: NodeJS.Timeout;
    metricsInterval = addSimInterval(() => {
      // Guard: only update if this is still the active simulation
      if (runId !== simulationRunId.current || !simulationActiveRef.current) {
        clearSimInterval(metricsInterval);
        return;
      }
      setMetrics(prev => ({
        prospects: Math.min(prev.prospects + Math.floor(Math.random() * 3), 247),
        dms: Math.min(prev.dms + Math.floor(Math.random() * 2), 89),
        replies: Math.min(prev.replies + Math.floor(Math.random() * 2), 34),
        calls: Math.min(prev.calls + Math.floor(Math.random() * 1), 12),
      }));
    }, 800);
  };

  const startWaveSimulation = (plannerData: any) => {
    const runId = simulationRunId.current;
    // Start metrics simulation
    startMetricsSimulation(runId);
    
    // Wave 1 Agents
    const wave1Agents: Agent[] = [
      { id: "website", name: "Website Builder", avatar: "🌐", role: "Building landing page", status: "working", progress: 0, wave: 1 },
    ];
    
    // Add deliverable for website
    const websiteDelId = addDeliverable("website", "Landing Page", 1);
    
    // Track deliverable IDs for this wave
    const wave1Deliverables: { id: string; type: Deliverable["type"] }[] = [
      { id: websiteDelId, type: "website" },
    ];
    
    if (plannerData.profit?.cart === "now") {
      wave1Agents.push({ id: "cart", name: "Cart Page Bot", avatar: "🛒", role: "Building sales page", status: "idle", progress: 0, wave: 1 });
      const cartDelId = addDeliverable("cart", "Sales Page", 1);
      wave1Deliverables.push({ id: cartDelId, type: "cart" });
    }
    if (plannerData.profit?.call === "now") {
      wave1Agents.push({ id: "call", name: "Call Funnel Bot", avatar: "📞", role: "Building application funnel", status: "idle", progress: 0, wave: 1 });
      const funnelDelId = addDeliverable("funnel", "Application Funnel", 1);
      wave1Deliverables.push({ id: funnelDelId, type: "funnel" });
    }
    if (plannerData.profit?.crowd === "now") {
      wave1Agents.push({ id: "event", name: "Event Page Bot", avatar: "👥", role: "Building webinar funnel", status: "idle", progress: 0, wave: 1 });
    }
    
    setAgents(wave1Agents);
    
    // Fire signals for wave start
    fireSignal(MASTER_REVENUE_PLANNER_APPROVED, "Revenue Planner locked — spawning Wave 1", { businessName: state?.businessName });
    addActivity("🚀 MASTER ORCHESTRATOR ONLINE", "signal", "[MASTER: INITIALIZING]");
    setTimeout(() => addActivity("📊 Loading Revenue Planner configuration...", "info"), 300);
    setTimeout(() => {
      fireSignal(MASTER_WAVE1_SPAWNING, `Spawning ${wave1Agents.length} agents for Wave 1`, { businessName: state?.businessName });
      addActivity("⚡ Wave 1 activated — Foundation phase", "signal", MASTER_WAVE1_SPAWNING);
    }, 600);
    setTimeout(() => addActivity(`🤖 Spawning ${wave1Agents.length} agents for Wave 1`, "success"), 900);
    
    // Create tasks for Wave 1
    const wave1Tasks: string[] = [];
    wave1Agents.forEach((agent, i) => {
      setTimeout(() => {
        const taskId = addTask(`Build ${agent.role.replace("Building ", "")}`, agent.id);
        wave1Tasks.push(taskId);
        addActivity(`📋 Task created: ${agent.role}`, "task");
        
        // Start agent working
        setAgents(prev => prev.map(a => 
          a.id === agent.id ? { ...a, status: "working" } : a
        ));
      }, 1200 + (i * 400));
    });
    
    setWaveStatus(prev => ({
      ...prev,
      wave1: { status: "running", progress: 0 },
    }));

    // Fail-Forward: Set timeout for Wave 1 (max 5 min for all bots combined)
    setWaveTimeout("Wave 1", 1, 300000, runId);

    // Simulate Wave 1 progress
    let w1Progress = 0;
    let w1Interval: NodeJS.Timeout;
    w1Interval = addSimInterval(() => {
      // Guard: only update if this is still the active simulation
      if (runId !== simulationRunId.current || !simulationActiveRef.current) {
        clearSimInterval(w1Interval);
        return;
      }
      
      w1Progress += Math.random() * 4 + 2;
      
      if (w1Progress >= 100) {
        w1Progress = 100;
        clearSimInterval(w1Interval);
        
        // Complete Wave 1
        setWaveStatus(prev => ({
          ...prev,
          wave1: { status: "complete", progress: 100 },
        }));
        
        // Mark all Wave 1 agents as complete
        setAgents(prev => prev.map(a => 
          a.wave === 1 ? { ...a, status: "complete", progress: 100 } : a
        ));
        
        // Complete all Wave 1 tasks
        setTasks(prev => prev.map(t => ({ ...t, status: "complete", progress: 100 })));
        
        // Complete deliverables with staggered timing for wow effect
        wave1Deliverables.forEach((del, i) => {
          setTimeout(() => {
            if (simulationActiveRef.current) {
              completeDeliverable(del.id);
              const typeLabels: Record<string, string> = {
                website: "🌐 Landing Page",
                cart: "🛒 Sales Page",
                funnel: "📞 Application Funnel",
              };
              addActivity(`✨ DELIVERABLE READY: ${typeLabels[del.type] || del.type}`, "deliverable");
            }
          }, i * 800);
        });
        
        fireSignal(MASTER_WAVE1_COMPLETE, "Wave 1 complete — Foundation built", { businessName: state?.businessName });
        addActivity("✅ Wave 1 Complete — Foundation built!", "signal", MASTER_WAVE1_COMPLETE);

        // Signal-driven: Wave 2 starts on Wave 1 completion signal
        setTimeout(() => {
          if (simulationActiveRef.current) {
            startWave2(plannerData, runId);
          }
        }, 1500 + (wave1Deliverables.length * 800));
      }
      
      setWaveStatus(prev => ({
        ...prev,
        wave1: { ...prev.wave1, progress: Math.min(w1Progress, 100) },
      }));
      
      // Update agent progress
      setAgents(prev => prev.map(a => 
        a.wave === 1 && a.status === "working"
          ? { ...a, progress: Math.min(w1Progress + (Math.random() * 10 - 5), 100) }
          : a
      ));
      
      // Update task progress
      setTasks(prev => prev.map(t => ({
        ...t,
        progress: Math.min(w1Progress + (Math.random() * 10 - 5), 100),
        status: w1Progress >= 100 ? "complete" : "in_progress",
      })));
      
      // Random activity updates
      if (Math.random() > 0.7) {
        const messages = [
          "⚙️ Configuring page templates...",
          "🎨 Applying brand styling...",
          "📝 Generating copy variants...",
          "🔗 Setting up tracking pixels...",
          "✨ Optimizing for conversions...",
          "📊 Connecting analytics...",
        ];
        addActivity(messages[Math.floor(Math.random() * messages.length)], "info");
      }
    }, 600);
  };

  const startWave2 = (plannerData: any, runId: number) => {
    // Guard: only run if this is still the active simulation
    if (runId !== simulationRunId.current) return;
    
    const wave2Agents: Agent[] = [
      { id: "email", name: "Email Sequence Bot", avatar: "📧", role: "Writing email sequences", status: "working", progress: 0, wave: 2 },
    ];
    
    // Track deliverables for Wave 2
    const wave2Deliverables: { id: string; type: Deliverable["type"] }[] = [];
    const emailDelId = addDeliverable("email", "Email Sequence", 2);
    wave2Deliverables.push({ id: emailDelId, type: "email" });
    
    if (plannerData.promote?.prospect === "now") {
      wave2Agents.push({ id: "outbound", name: "Outbound Bot", avatar: "📤", role: "Setting up cold outreach", status: "idle", progress: 0, wave: 2 });
    }
    if (plannerData.promote?.partnership === "now") {
      wave2Agents.push({ id: "partnership", name: "Partnership Bot", avatar: "🤝", role: "Creating partnership decks", status: "idle", progress: 0, wave: 2 });
    }
    if (plannerData.profit?.aiSales === "now") {
      wave2Agents.push({ id: "aisales", name: "AI Sales Bot", avatar: "🤖", role: "Training conversational AI", status: "idle", progress: 0, wave: 2 });
    }
    
    setAgents(prev => [...prev, ...wave2Agents]);
    
    fireSignal(MASTER_WAVE2_SPAWNING, `Spawning ${wave2Agents.length} agents for Wave 2`, { businessName: state?.businessName });
    addActivity("⚡ Wave 2 activated — Sequences phase", "signal", MASTER_WAVE2_SPAWNING);
    addActivity(`🤖 Spawning ${wave2Agents.length} agents for Wave 2`, "success");
    
    // Create tasks for Wave 2
    wave2Agents.forEach((agent, i) => {
      setTimeout(() => {
        addTask(`Configure ${agent.role.replace("Setting up ", "").replace("Writing ", "").replace("Creating ", "").replace("Training ", "")}`, agent.id);
        addActivity(`📋 Task created: ${agent.role}`, "task");
        
        setAgents(prev => prev.map(a => 
          a.id === agent.id ? { ...a, status: "working" } : a
        ));
      }, 300 + (i * 300));
    });
    
    setWaveStatus(prev => ({
      ...prev,
      wave2: { status: "running", progress: 0 },
    }));

    // Simulate Wave 2 progress
    let w2Progress = 0;
    let w2Interval: NodeJS.Timeout;
    w2Interval = addSimInterval(() => {
      // Guard: only update if this is still the active simulation
      if (runId !== simulationRunId.current || !simulationActiveRef.current) {
        clearSimInterval(w2Interval);
        return;
      }
      
      w2Progress += Math.random() * 4 + 2;
      
      if (w2Progress >= 100) {
        w2Progress = 100;
        clearSimInterval(w2Interval);
        
        setWaveStatus(prev => ({
          ...prev,
          wave2: { status: "complete", progress: 100 },
        }));
        
        setAgents(prev => prev.map(a => 
          a.wave === 2 ? { ...a, status: "complete", progress: 100 } : a
        ));
        
        // Mark Wave 2 tasks as complete (use functional update to avoid stale closure)
        setTasks(prev => prev.map(t => {
          // Check if task belongs to a Wave 2 agent by matching agent IDs
          const wave2AgentIds = ["email", "outbound", "partnership", "aisales"];
          if (wave2AgentIds.includes(t.agent)) {
            return { ...t, status: "complete", progress: 100 };
          }
          return t;
        }));
        
        // Complete deliverables
        wave2Deliverables.forEach((del, i) => {
          setTimeout(() => {
            if (simulationActiveRef.current) {
              completeDeliverable(del.id);
              addActivity(`✨ DELIVERABLE READY: 📧 Email Sequence`, "deliverable");
            }
          }, i * 800);
        });
        
        fireSignal(MASTER_WAVE2_COMPLETE, "Wave 2 complete — Sequences ready", { businessName: state?.businessName });
        addActivity("✅ Wave 2 Complete — Sequences ready!", "signal", MASTER_WAVE2_COMPLETE);
        
        // Check if Wave 3 needed
        if (plannerData.promote?.publish === "now" || plannerData.promote?.paid === "now") {
          setTimeout(() => {
            if (simulationActiveRef.current) {
              startWave3(plannerData, runId);
            }
          }, 1500 + (wave2Deliverables.length * 800));
        } else {
          setTimeout(() => {
            if (simulationActiveRef.current) {
              completeDemo(runId);
            }
          }, 1500 + (wave2Deliverables.length * 800));
        }
      }
      
      setWaveStatus(prev => ({
        ...prev,
        wave2: { ...prev.wave2, progress: Math.min(w2Progress, 100) },
      }));
      
      // Update Wave 2 agent progress
      setAgents(prev => prev.map(a => 
        a.wave === 2 && a.status === "working"
          ? { ...a, progress: Math.min(w2Progress + (Math.random() * 10 - 5), 100) }
          : a
      ));
      
      // Random activity
      if (Math.random() > 0.7) {
        const messages = [
          "✍️ Writing subject lines...",
          "🎯 Segmenting audiences...",
          "📊 A/B testing copy variants...",
          "🔄 Setting up automations...",
          "📅 Scheduling sequences...",
          "🧠 Training AI on brand voice...",
        ];
        addActivity(messages[Math.floor(Math.random() * messages.length)], "info");
      }
    }, 600);
  };

  const startWave3 = (plannerData: any, runId: number) => {
    // Guard: only run if this is still the active simulation
    if (runId !== simulationRunId.current) return;
    
    const wave3Agents: Agent[] = [];
    const wave3Deliverables: { id: string; type: Deliverable["type"] }[] = [];
    
    if (plannerData.promote?.publish === "now") {
      wave3Agents.push({ id: "content", name: "Content Engine", avatar: "📱", role: "Creating content calendar", status: "working", progress: 0, wave: 3 });
      const contentDelId = addDeliverable("content", "Content Calendar", 3);
      wave3Deliverables.push({ id: contentDelId, type: "content" });
    }
    if (plannerData.promote?.paid === "now") {
      wave3Agents.push({ id: "ads", name: "Ads Creative Bot", avatar: "📺", role: "Building ad creatives", status: "working", progress: 0, wave: 3 });
      const adsDelId = addDeliverable("ads", "Ad Creatives", 3);
      wave3Deliverables.push({ id: adsDelId, type: "ads" });
    }
    
    if (wave3Agents.length === 0) {
      completeDemo(runId);
      return;
    }
    
    setAgents(prev => [...prev, ...wave3Agents]);
    
    fireSignal(MASTER_WAVE3_SPAWNING, `Spawning ${wave3Agents.length} agents for Wave 3`, { businessName: state?.businessName });
    addActivity("⚡ Wave 3 activated — Growth phase", "signal", MASTER_WAVE3_SPAWNING);
    addActivity(`🤖 Spawning ${wave3Agents.length} agents for Wave 3`, "success");
    
    // Create tasks
    wave3Agents.forEach((agent, i) => {
      setTimeout(() => {
        addTask(`Generate ${agent.role.replace("Creating ", "").replace("Building ", "")}`, agent.id);
        addActivity(`📋 Task created: ${agent.role}`, "task");
      }, 300 + (i * 300));
    });
    
    setWaveStatus(prev => ({
      ...prev,
      wave3: { status: "running", progress: 0 },
    }));

    // Simulate Wave 3 progress
    let w3Progress = 0;
    let w3Interval: NodeJS.Timeout;
    w3Interval = addSimInterval(() => {
      // Guard: only update if this is still the active simulation
      if (runId !== simulationRunId.current || !simulationActiveRef.current) {
        clearSimInterval(w3Interval);
        return;
      }
      
      w3Progress += Math.random() * 4 + 2;
      
      if (w3Progress >= 100) {
        w3Progress = 100;
        clearSimInterval(w3Interval);
        
        setWaveStatus(prev => ({
          ...prev,
          wave3: { status: "complete", progress: 100 },
        }));
        
        setAgents(prev => prev.map(a => 
          a.wave === 3 ? { ...a, status: "complete", progress: 100 } : a
        ));
        
        // Complete deliverables
        wave3Deliverables.forEach((del, i) => {
          setTimeout(() => {
            if (simulationActiveRef.current) {
              completeDeliverable(del.id);
              const typeLabels: Record<string, string> = {
                content: "📱 Content Calendar",
                ads: "📺 Ad Creatives",
              };
              addActivity(`✨ DELIVERABLE READY: ${typeLabels[del.type]}`, "deliverable");
            }
          }, i * 800);
        });
        
        fireSignal(MASTER_WAVE3_COMPLETE, "Wave 3 complete — Growth engines ready", { businessName: state?.businessName });
        addActivity("✅ Wave 3 Complete — Growth engines ready!", "signal", MASTER_WAVE3_COMPLETE);
        
        setTimeout(() => {
          if (simulationActiveRef.current) {
            completeDemo(runId);
          }
        }, 1500 + (wave3Deliverables.length * 800));
      }
      
      setWaveStatus(prev => ({
        ...prev,
        wave3: { ...prev.wave3, progress: Math.min(w3Progress, 100) },
      }));
      
      // Update Wave 3 agent progress
      setAgents(prev => prev.map(a => 
        a.wave === 3 && a.status === "working"
          ? { ...a, progress: Math.min(w3Progress + (Math.random() * 10 - 5), 100) }
          : a
      ));
      
      // Random activity
      if (Math.random() > 0.7) {
        const messages = [
          "🎬 Generating video scripts...",
          "🖼️ Creating thumbnail designs...",
          "📊 Analyzing competitor ads...",
          "🎨 Designing carousel posts...",
          "📝 Writing ad copy variants...",
          "🎯 Setting up targeting...",
        ];
        addActivity(messages[Math.floor(Math.random() * messages.length)], "info");
      }
    }, 600);
  };

  const completeDemo = (runId: number) => {
    // Guard: only run if this is still the active simulation
    if (runId !== simulationRunId.current || !simulationActiveRef.current) return;
    
    fireSignal(COO_ALL_TASKS_COMPLETE, "All COO tasks finished", { businessName: state?.businessName });
    fireSignal(MASTER_ALL_BOTS_COMPLETE, "All bots complete — demo ready for close", { businessName: state?.businessName });
    addActivity("🎉 ALL BOTS COMPLETE", "signal", MASTER_ALL_BOTS_COMPLETE);
    addActivity("🚀 Your AI Workforce is ready for deployment!", "success");
    addActivity("💰 Revenue Engine is ARMED AND READY", "signal", "[SYSTEM: REVENUE ENGINE ONLINE]");
    
    setAgents(prev => prev.map(a => ({ ...a, status: "complete", progress: 100 })));
    setTasks(prev => prev.map(t => ({ ...t, status: "complete", progress: 100 })));
    
    // Final metrics boost
    setMetrics({ prospects: 247, dms: 89, replies: 34, calls: 12 });

    // Generate GHL Workflow Prompts and save to Google Drive
    if (state?.revenuePlannerData) {
      const workflows = generateWorkflowPrompts(state.businessName, state.revenuePlannerData);
      workflows.forEach(async (wf) => {
        try {
          await fetch("/api/save-output", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              businessName: state.businessName,
              protocol: "workflow",
              fileName: wf.filePath.split("/").pop(),
              content: formatWorkflowPromptMarkdown(wf),
            }),
          });
          addActivity(`📋 GHL Workflow saved: ${wf.workflowName}`, "task");
        } catch {
          addActivity(`⚠️ Failed to save GHL workflow: ${wf.workflowName}`, "warning");
        }
      });
    }
    
    // Update localStorage phase
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      parsed.phase = "complete";
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    }
    
    // Mark simulation as no longer active (completed successfully)
    simulationActiveRef.current = false;
  };

  if (!state) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#0B0F19",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#8A8F98",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 16 }}>⏳</div>
          <div>Loading demo state...</div>
        </div>
      </div>
    );
  }

  if (state.phase !== "building" && state.phase !== "complete") {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#0B0F19",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: 40,
      }}>
        <div>
          <div style={{ fontSize: 64, marginBottom: 20 }}>⏳</div>
          <h2 style={{ color: "#F5F7FA", fontSize: 28, marginBottom: 12, fontFamily: "'Space Grotesk', sans-serif" }}>
            Waiting to Build
          </h2>
          <p style={{ color: "#8A8F98", fontSize: 15, maxWidth: 450, lineHeight: 1.6 }}>
            Complete the Vision Intake conversation, Brand Discovery, and Character Creation. Then lock your Revenue Planner to watch your AI workforce build in real-time.
          </p>
          <div style={{
            marginTop: 24,
            display: "flex",
            gap: 8,
            justifyContent: "center",
          }}>
            {["Vision", "Brand", "Character", "Planner", "Build"].map((step, i) => (
              <div key={step} style={{
                padding: "8px 16px",
                borderRadius: 20,
                background: i < 4 ? "rgba(255,255,255,0.05)" : "transparent",
                border: `1px solid ${i < 4 ? "rgba(255,255,255,0.1)" : "#FF4EDB"}`,
                color: i < 4 ? "#6B7186" : "#FF4EDB",
                fontSize: 11,
                fontWeight: 500,
              }}>
                {step}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Handle page refresh during build - show resume option
  const handleResumeBuild = () => {
    if (state.revenuePlannerData && !simulationActiveRef.current) {
      simulationStarted.current = true;
      simulationActiveRef.current = true;
      simulationRunId.current += 1;
      startWaveSimulation(state.revenuePlannerData);
    }
  };

  // Check if we're in a paused state (building phase but simulation not actively running)
  // If buildTriggered is true (from props or state), simulation is about to start so don't show paused state
  // Also don't show paused if simulation is actively running
  const isPaused = state.phase === "building" && 
    !simulationStarted.current && 
    !simulationActiveRef.current &&
    agents.length === 0 && 
    props.buildTriggered !== true && 
    state.buildTriggered !== true;
  
  if (isPaused) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#0B0F19",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: 40,
      }}>
        <div>
          <div style={{ fontSize: 64, marginBottom: 20 }}>⏸️</div>
          <h2 style={{ color: "#F5F7FA", fontSize: 28, marginBottom: 12, fontFamily: "'Space Grotesk', sans-serif" }}>
            Build Paused
          </h2>
          <p style={{ color: "#8A8F98", fontSize: 15, maxWidth: 450, lineHeight: 1.6, marginBottom: 24 }}>
            Your build session was interrupted. Click below to restart the AI workforce build simulation.
          </p>
          <button
            onClick={handleResumeBuild}
            style={{
              padding: "16px 32px",
              borderRadius: 8,
              border: "none",
              background: "linear-gradient(135deg, #FF4EDB, #7B61FF)",
              color: "#FFF",
              fontSize: 16,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 4px 20px rgba(255,78,219,0.3)",
            }}
          >
            🚀 Resume Build
          </button>
        </div>
      </div>
    );
  }

  const waveStatusColors = {
    pending: { bg: "rgba(100,116,139,0.1)", text: "#6B7186", border: "#374151", glow: "none" },
    running: { bg: "rgba(255,78,219,0.15)", text: "#FF4EDB", border: "#FF4EDB", glow: "0 0 20px rgba(255,78,219,0.3)" },
    complete: { bg: "rgba(16,185,129,0.15)", text: "#10B981", border: "#10B981", glow: "0 0 20px rgba(16,185,129,0.3)" },
  };

  const activityColors = {
    info: "#2F80FF",
    success: "#10B981",
    warning: "#F59E0B",
    signal: "#FF4EDB",
    gate: "#7B61FF",
    task: "#A78BFA",
    deliverable: "#10B981",
  };

  const statusColors = {
    idle: { bg: "rgba(100,116,139,0.2)", text: "#94A3B8", border: "#475569" },
    working: { bg: "rgba(124,58,237,0.25)", text: "#A78BFA", border: "#7C3AED" },
    complete: { bg: "rgba(16,185,129,0.2)", text: "#10B981", border: "#059669" },
  };

  const taskStatusColors = {
    queued: { bg: "rgba(100,116,139,0.2)", text: "#94A3B8" },
    in_progress: { bg: "rgba(47,128,255,0.2)", text: "#2F80FF" },
    complete: { bg: "rgba(16,185,129,0.2)", text: "#10B981" },
  };

  const completedDeliverables = deliverables.filter(d => d.status === "complete");
  const buildingDeliverables = deliverables.filter(d => d.status === "building");

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0B0F19",
      padding: 20,
    }}>
      {/* Header with Metrics */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
        padding: "16px 24px",
        background: "linear-gradient(135deg, #111624, #0D1117)",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.08)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}>
            <span style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: "#FF4EDB",
              animation: "pulse 1.5s infinite",
              boxShadow: "0 0 10px #FF4EDB",
            }} />
            <span style={{
              fontSize: 11,
              letterSpacing: 2,
              color: "#FF4EDB",
              fontFamily: "'Orbitron', monospace",
              fontWeight: 700,
            }}>
              LIVE BUILD
            </span>
          </div>
          <div style={{ width: 1, height: 24, background: "rgba(255,255,255,0.1)" }} />
          <h1 style={{
            fontSize: 20,
            fontWeight: 700,
            color: "#F5F7FA",
            margin: 0,
            fontFamily: "'Space Grotesk', sans-serif",
          }}>
            {state.businessName}
          </h1>
        </div>
        
        {/* Live Metrics + Deliverables Toggle */}
        <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
          {[
            { label: "Prospects", value: metrics.prospects, color: "#2F80FF", icon: "👥" },
            { label: "DMs Sent", value: metrics.dms, color: "#7B61FF", icon: "💬" },
            { label: "Replies", value: metrics.replies, color: "#10B981", icon: "✉️" },
            { label: "Calls", value: metrics.calls, color: "#FF4EDB", icon: "📞" },
          ].map(metric => (
            <div key={metric.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 10, color: "#6B7186", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
                {metric.icon} {metric.label}
              </div>
              <div style={{
                fontSize: 24,
                fontWeight: 700,
                color: metric.color,
                fontFamily: "'Orbitron', monospace",
              }}>
                {metric.value}
              </div>
            </div>
          ))}
          
          {/* Deliverables toggle button */}
          <div style={{ width: 1, height: 40, background: "rgba(255,255,255,0.1)", marginLeft: 8 }} />
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowDeliverablePanel(!showDeliverablePanel)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 16px",
                background: showDeliverablePanel 
                  ? "linear-gradient(135deg, #10B98130, #10B98120)"
                  : completedDeliverables.length > 0 
                    ? "linear-gradient(135deg, #10B98120, #10B98110)"
                    : "rgba(255,255,255,0.05)",
                border: showDeliverablePanel 
                  ? "1px solid #10B981"
                  : completedDeliverables.length > 0
                    ? "1px solid #10B98160"
                    : "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8,
                cursor: "pointer",
                transition: "all 0.2s ease",
                boxShadow: completedDeliverables.length > 0 && !showDeliverablePanel
                  ? "0 0 20px rgba(16,185,129,0.3)"
                  : "none",
                animation: completedDeliverables.length > 0 && !showDeliverablePanel
                  ? "pulseGlow 2s infinite"
                  : "none",
              }}
            >
              <span style={{ fontSize: 18 }}>📦</span>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 10, color: "#6B7186", textTransform: "uppercase" }}>Outputs</div>
                <div style={{ 
                  fontSize: 14, 
                  fontWeight: 700, 
                  color: completedDeliverables.length > 0 ? "#10B981" : "#6B7186",
                }}>
                  {completedDeliverables.length} Ready
                </div>
              </div>
              {buildingDeliverables.length > 0 && (
                <span style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#F59E0B",
                  animation: "pulse 1s infinite",
                }} />
              )}
            </button>
            {/* Badge hint for first-time users when deliverables ready */}
            {completedDeliverables.length > 0 && !showDeliverablePanel && (
              <div style={{
                position: "absolute",
                top: -8,
                right: -8,
                background: "linear-gradient(135deg, #10B981, #059669)",
                color: "#fff",
                fontSize: 10,
                fontWeight: 700,
                padding: "4px 8px",
                borderRadius: 12,
                boxShadow: "0 2px 10px rgba(16,185,129,0.4)",
                animation: "bounce 1s infinite",
              }}>
                Click to view!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Wave Status Bar */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 12,
        marginBottom: 20,
      }}>
        {(["wave1", "wave2", "wave3"] as const).map((waveKey, idx) => {
          const wave = waveStatus[waveKey];
          const style = waveStatusColors[wave.status as keyof typeof waveStatusColors];
          return (
            <div
              key={waveKey}
              style={{
                padding: 14,
                background: style.bg,
                borderRadius: 10,
                border: `2px solid ${style.border}`,
                boxShadow: style.glow,
                transition: "all 0.3s ease",
              }}
            >
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}>
                <div>
                  <div style={{ fontSize: 10, color: "#6B7186", textTransform: "uppercase", letterSpacing: 1 }}>
                    Wave {idx + 1}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: style.text, marginTop: 2 }}>
                    {wave.status.toUpperCase()}
                  </div>
                </div>
                <span style={{ fontSize: 24, filter: wave.status === "running" ? "drop-shadow(0 0 8px currentColor)" : "none" }}>
                  {wave.status === "pending" ? "⏳" : wave.status === "running" ? "⚡" : "✅"}
                </span>
              </div>
              {(wave.status === "running" || wave.status === "complete") && (
                <div style={{
                  marginTop: 10,
                  height: 4,
                  background: "rgba(255,255,255,0.1)",
                  borderRadius: 2,
                  overflow: "hidden",
                }}>
                  <div style={{
                    width: `${wave.progress}%`,
                    height: "100%",
                    background: `linear-gradient(90deg, ${style.text}, ${style.text}80)`,
                    transition: "width 0.3s ease",
                    boxShadow: wave.status === "running" ? `0 0 10px ${style.text}` : "none",
                  }} />
                </div>
              )}
              <div style={{ fontSize: 10, color: "#6B7186", marginTop: 6 }}>
                {idx === 0 && "Foundation (Website + Funnels)"}
                {idx === 1 && "Sequences (Email + AI Sales)"}
                {idx === 2 && "Growth (Content + Ads)"}
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: showDeliverablePanel ? "1fr 1.2fr 1fr 1.4fr" : "1fr 1.2fr 1fr", 
        gap: 16, 
        height: "calc(100vh - 260px)",
        transition: "all 0.3s ease",
      }}>
        {/* Left Column - Activity Feed */}
        <div style={{
          background: "linear-gradient(180deg, #111624 0%, #0D1117 100%)",
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.08)",
          padding: 16,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}>
          <h2 style={{
            fontSize: 13,
            fontWeight: 600,
            color: "#F5F7FA",
            marginBottom: 12,
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexShrink: 0,
          }}>
            <span>📡</span> Signal Log
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
          
          <div style={{ 
            flex: 1, 
            overflow: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}>
            {activity.length === 0 ? (
              <div style={{
                color: "#6B7186",
                fontSize: 12,
                textAlign: "center",
                padding: 30,
              }}>
                Waiting for signals...
              </div>
            ) : (
              activity.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: 10,
                    background: item.type === "deliverable" 
                      ? "rgba(16,185,129,0.1)"
                      : "rgba(255,255,255,0.02)",
                    borderRadius: 8,
                    borderLeft: `3px solid ${activityColors[item.type] || "#6B7186"}`,
                    animation: "fadeIn 0.3s ease",
                  }}
                >
                  <p style={{ color: "#E5E7EB", fontSize: 12, margin: 0, lineHeight: 1.4 }}>
                    {item.message}
                  </p>
                  {item.signal && (
                    <p style={{
                      color: "#FF4EDB",
                      fontSize: 9,
                      margin: "4px 0 0",
                      fontFamily: "'Orbitron', monospace",
                      letterSpacing: 0.5,
                    }}>
                      {item.signal}
                    </p>
                  )}
                  <p style={{ color: "#4B5563", fontSize: 9, margin: "3px 0 0" }}>
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Center Column - AI Agents */}
        <div style={{
          background: "linear-gradient(180deg, #111624 0%, #0D1117 100%)",
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.08)",
          padding: 16,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}>
          <h2 style={{
            fontSize: 13,
            fontWeight: 600,
            color: "#F5F7FA",
            marginBottom: 12,
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexShrink: 0,
          }}>
            <span>🤖</span> AI Workforce
            <span style={{
              marginLeft: "auto",
              fontSize: 10,
              padding: "2px 8px",
              borderRadius: 10,
              background: "rgba(16,185,129,0.2)",
              color: "#10B981",
            }}>
              {agents.filter(a => a.status === "complete").length}/{agents.length} Complete
            </span>
          </h2>
          
          <div style={{ 
            flex: 1, 
            overflow: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}>
            {agents.length === 0 ? (
              <div style={{
                color: "#6B7186",
                fontSize: 12,
                textAlign: "center",
                padding: 30,
              }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>🤖</div>
                Bots spawning...
              </div>
            ) : (
              agents.map((agent) => {
                const style = statusColors[agent.status];
                
                return (
                  <div
                    key={agent.id}
                    style={{
                      padding: 12,
                      background: style.bg,
                      borderRadius: 10,
                      border: `1px solid ${style.border}`,
                      transition: "all 0.3s ease",
                    }}
                  >
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginBottom: agent.status === "working" ? 10 : 0,
                    }}>
                      <span style={{ 
                        fontSize: 28,
                        filter: agent.status === "working" ? "drop-shadow(0 0 8px rgba(124,58,237,0.5))" : "none",
                      }}>
                        {agent.avatar}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ 
                          fontSize: 13, 
                          fontWeight: 600, 
                          color: "#F5F7FA",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}>
                          {agent.name}
                          {agent.status === "working" && (
                            <span style={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              background: "#A78BFA",
                              animation: "pulse 1s infinite",
                            }} />
                          )}
                        </div>
                        <div style={{ fontSize: 11, color: "#8A8F98", marginTop: 2 }}>
                          {agent.role} • <span style={{ color: "#6B7186" }}>Wave {agent.wave}</span>
                        </div>
                      </div>
                      <div style={{
                        padding: "4px 10px",
                        borderRadius: 6,
                        background: style.bg,
                        border: `1px solid ${style.border}`,
                        color: style.text,
                        fontSize: 9,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                      }}>
                        {agent.status}
                      </div>
                    </div>
                    
                    {agent.status === "working" && (
                      <div style={{
                        height: 4,
                        background: "rgba(255,255,255,0.1)",
                        borderRadius: 2,
                        overflow: "hidden",
                      }}>
                        <div style={{
                          width: `${agent.progress}%`,
                          height: "100%",
                          background: `linear-gradient(90deg, #7C3AED, #A78BFA)`,
                          transition: "width 0.3s ease",
                          boxShadow: "0 0 10px #7C3AED",
                        }} />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column - Tasks */}
        <div style={{
          background: "linear-gradient(180deg, #111624 0%, #0D1117 100%)",
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.08)",
          padding: 16,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}>
          <h2 style={{
            fontSize: 13,
            fontWeight: 600,
            color: "#F5F7FA",
            marginBottom: 12,
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexShrink: 0,
          }}>
            <span>📋</span> Task Queue
            <span style={{
              marginLeft: "auto",
              fontSize: 10,
              padding: "2px 8px",
              borderRadius: 10,
              background: "rgba(47,128,255,0.2)",
              color: "#2F80FF",
            }}>
              {tasks.filter(t => t.status === "complete").length}/{tasks.length}
            </span>
          </h2>
          
          <div style={{ 
            flex: 1, 
            overflow: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}>
            {tasks.length === 0 ? (
              <div style={{
                color: "#6B7186",
                fontSize: 12,
                textAlign: "center",
                padding: 30,
              }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>📋</div>
                Tasks will appear here...
              </div>
            ) : (
              tasks.map((task) => {
                const style = taskStatusColors[task.status];
                const agent = agents.find(a => a.id === task.agent);
                
                return (
                  <div
                    key={task.id}
                    style={{
                      padding: 10,
                      background: style.bg,
                      borderRadius: 8,
                      border: `1px solid ${style.text}30`,
                    }}
                  >
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: task.status === "in_progress" ? 8 : 0,
                    }}>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "#E5E7EB" }}>
                          {task.title}
                        </div>
                        <div style={{ fontSize: 10, color: "#6B7186", marginTop: 2 }}>
                          {agent?.avatar} {agent?.name}
                        </div>
                      </div>
                      <span style={{ fontSize: 14 }}>
                        {task.status === "queued" ? "⏳" : task.status === "in_progress" ? "⚡" : "✅"}
                      </span>
                    </div>
                    
                    {task.status === "in_progress" && (
                      <div style={{
                        height: 3,
                        background: "rgba(255,255,255,0.1)",
                        borderRadius: 2,
                        overflow: "hidden",
                      }}>
                        <div style={{
                          width: `${task.progress}%`,
                          height: "100%",
                          background: style.text,
                          transition: "width 0.3s ease",
                        }} />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Fourth Column - Deliverables Panel (conditional) */}
        {showDeliverablePanel && (
          <div style={{
            background: "linear-gradient(180deg, #111624 0%, #0D1117 100%)",
            borderRadius: 12,
            border: "1px solid rgba(16,185,129,0.3)",
            padding: 16,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            animation: "slideIn 0.3s ease",
          }}>
            <h2 style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#F5F7FA",
              marginBottom: 12,
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexShrink: 0,
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
                {completedDeliverables.length} Complete
              </span>
            </h2>
            
            <div style={{ flex: 1, overflow: "hidden" }}>
              {deliverables.length === 0 ? (
                <div style={{
                  color: "#6B7186",
                  fontSize: 12,
                  textAlign: "center",
                  padding: 30,
                }}>
                  <div style={{ fontSize: 32, marginBottom: 10 }}>📦</div>
                  Deliverables will appear as bots complete their work...
                </div>
              ) : (
                <DeliverablePreview
                  businessName={state.businessName}
                  niche={businessInfo.niche || state.business?.niche}
                  targetAudience={businessInfo.targetAudience || state.business?.targetAudience}
                  mainOffer={businessInfo.mainOffer || state.business?.mainOffer}
                  deliverables={deliverables}
                  selectedDeliverable={selectedDeliverable}
                />
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes flashGreen {
          0%, 100% { box-shadow: none; }
          50% { box-shadow: 0 0 30px rgba(16,185,129,0.6); }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(16,185,129,0.3); }
          50% { box-shadow: 0 0 30px rgba(16,185,129,0.5); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
}
