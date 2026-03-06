import { NextRequest, NextResponse } from 'next/server';

// Demo phases per Master-System-Prompt
type DemoPhase = 
  | "startup"
  | "vision" 
  | "brand" 
  | "character" 
  | "planner" 
  | "wave1" 
  | "wave2" 
  | "wave3" 
  | "complete";

type GateStatus = "pending" | "approved" | "skipped";

interface RevenuePlannerData {
  revenueGoal: number;
  promote: {
    prospect: "now" | "later" | "never";
    paid: "now" | "later" | "never";
    publish: "now" | "later" | "never";
    partnership: "now" | "later" | "never";
  };
  profit: {
    cart: "now" | "later" | "never";
    call: "now" | "later" | "never";
    crowd: "now" | "later" | "never";
    aiSales: "now" | "later" | "never";
  };
  produce: {
    ship: boolean;
    serve: boolean;
    unlock: boolean;
    shift: boolean;
  };
}

interface DemoState {
  // Business Info
  business: {
    name: string;
    niche: string;
    targetAudience: string;
    mainOffer: string;
    driveFolderPath: string;
  };
  
  // Current Phase
  phase: DemoPhase;
  phaseStartedAt: string | null;
  
  // Human Gates (per Section 9)
  gates: {
    offerLock: GateStatus;        // Gate 1
    brandBoard: GateStatus;       // Gate 2
    avatar: GateStatus;           // Gate 3
    characterBible: GateStatus;   // Gate 4
    revenuePlanner: GateStatus;   // Gate 5
  };
  
  // Revenue Planner Data (triggers Wave 1)
  revenuePlanner: RevenuePlannerData | null;
  
  // Wave Status
  waves: {
    wave1: { status: "pending" | "running" | "complete"; startedAt: string | null; completedAt: string | null };
    wave2: { status: "pending" | "running" | "complete"; startedAt: string | null; completedAt: string | null };
    wave3: { status: "pending" | "running" | "complete"; startedAt: string | null; completedAt: string | null };
  };
  
  // Agents (bots)
  agents: Array<{
    id: string;
    name: string;
    avatar: string;
    role: string;
    status: "idle" | "active" | "working" | "complete" | "blocked";
    currentTask: string;
    progress: number;
    tasksCompleted: number;
    wave: 1 | 2 | 3;
  }>;
  
  // Tasks
  tasks: Array<{
    id: string;
    title: string;
    description: string;
    status: "todo" | "in-progress" | "in-review" | "complete" | "blocked";
    priority: "low" | "medium" | "high" | "urgent" | "critical";
    assigned_agent: string;
    wave: 1 | 2 | 3;
    outputType: "funnel" | "content" | "media" | "strategy" | "ghl-workflow";
    outputPath: string | null;
    destination: "project-manager" | "media-hub";
    created_at: string;
  }>;
  
  // Activity Log
  activity: Array<{
    id: string;
    message: string;
    timestamp: string;
    type: "info" | "success" | "warning" | "signal" | "gate";
    signal?: string;
  }>;
  
  // Metrics
  metrics: {
    totalTasks: number;
    completedTasks: number;
    inReviewTasks: number;
    blockedTasks: number;
  };
  
  // Timestamps
  demoStartedAt: string | null;
  lastUpdated: string;
}

// Initialize empty state
let demoState: DemoState = {
  business: {
    name: "",
    niche: "",
    targetAudience: "",
    mainOffer: "",
    driveFolderPath: "",
  },
  phase: "startup",
  phaseStartedAt: null,
  gates: {
    offerLock: "pending",
    brandBoard: "pending",
    avatar: "pending",
    characterBible: "pending",
    revenuePlanner: "pending",
  },
  revenuePlanner: null,
  waves: {
    wave1: { status: "pending", startedAt: null, completedAt: null },
    wave2: { status: "pending", startedAt: null, completedAt: null },
    wave3: { status: "pending", startedAt: null, completedAt: null },
  },
  agents: [],
  tasks: [],
  activity: [],
  metrics: {
    totalTasks: 0,
    completedTasks: 0,
    inReviewTasks: 0,
    blockedTasks: 0,
  },
  demoStartedAt: null,
  lastUpdated: new Date().toISOString(),
};

export const dynamic = 'force-dynamic';

// GET - Retrieve current state
export async function GET() {
  // Update metrics
  demoState.metrics = {
    totalTasks: demoState.tasks.length,
    completedTasks: demoState.tasks.filter(t => t.status === "complete").length,
    inReviewTasks: demoState.tasks.filter(t => t.status === "in-review").length,
    blockedTasks: demoState.tasks.filter(t => t.status === "blocked").length,
  };
  
  return NextResponse.json({
    ...demoState,
    lastUpdated: new Date().toISOString(),
  });
}

// POST - Update state
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    const now = new Date().toISOString();

    switch (action) {
      // ========== DEMO LIFECYCLE ==========
      case "start_demo":
        demoState = {
          ...demoState,
          business: {
            name: data.businessName,
            niche: data.niche || "",
            targetAudience: data.targetAudience || "",
            mainOffer: data.mainOffer || "",
            driveFolderPath: `/AIM-DEMO-BRAIN/BUSINESSES/${data.businessName}/`,
          },
          phase: "vision",
          phaseStartedAt: now,
          demoStartedAt: now,
          gates: {
            offerLock: "pending",
            brandBoard: "pending",
            avatar: "pending",
            characterBible: "pending",
            revenuePlanner: "pending",
          },
          agents: [],
          tasks: [],
          activity: [{
            id: `activity-${Date.now()}`,
            message: `🚀 DEMO STARTED — ${data.businessName}`,
            timestamp: now,
            type: "signal",
            signal: "[MASTER: DEMO STARTED]",
          }],
        };
        break;

      case "reset":
        demoState = {
          business: { name: "", niche: "", targetAudience: "", mainOffer: "", driveFolderPath: "" },
          phase: "startup",
          phaseStartedAt: null,
          gates: { offerLock: "pending", brandBoard: "pending", avatar: "pending", characterBible: "pending", revenuePlanner: "pending" },
          revenuePlanner: null,
          waves: {
            wave1: { status: "pending", startedAt: null, completedAt: null },
            wave2: { status: "pending", startedAt: null, completedAt: null },
            wave3: { status: "pending", startedAt: null, completedAt: null },
          },
          agents: [],
          tasks: [],
          activity: [],
          metrics: { totalTasks: 0, completedTasks: 0, inReviewTasks: 0, blockedTasks: 0 },
          demoStartedAt: null,
          lastUpdated: now,
        };
        break;

      // ========== PHASE TRANSITIONS ==========
      case "set_phase":
        demoState.phase = data.phase;
        demoState.phaseStartedAt = now;
        demoState.activity.unshift({
          id: `activity-${Date.now()}`,
          message: `📍 Phase: ${data.phase.toUpperCase()}`,
          timestamp: now,
          type: "info",
        });
        break;

      // ========== HUMAN GATES ==========
      case "approve_gate":
        const gateKey = data.gate as keyof typeof demoState.gates;
        if (demoState.gates[gateKey] !== undefined) {
          demoState.gates[gateKey] = "approved";
          
          const gateSignals: Record<string, string> = {
            offerLock: "[VISION: OFFER LOCKED]",
            brandBoard: "[BRAND: BOARD APPROVED]",
            avatar: "[BRAND: AVATAR APPROVED]",
            characterBible: "[CHARACTER: BIBLE APPROVED]",
            revenuePlanner: "[MASTER: REVENUE PLANNER APPROVED]",
          };
          
          demoState.activity.unshift({
            id: `activity-${Date.now()}`,
            message: `✅ GATE APPROVED: ${data.gate}`,
            timestamp: now,
            type: "gate",
            signal: gateSignals[gateKey],
          });
        }
        break;

      // ========== REVENUE PLANNER ==========
      case "lock_and_build":
        demoState.revenuePlanner = data.revenuePlanner;
        demoState.gates.revenuePlanner = "approved";
        demoState.phase = "wave1";
        demoState.waves.wave1.status = "running";
        demoState.waves.wave1.startedAt = now;
        
        demoState.activity.unshift({
          id: `activity-${Date.now()}`,
          message: `🔒 LOCK & BUILD — Wave 1 Spawning!`,
          timestamp: now,
          type: "signal",
          signal: "[MASTER: REVENUE PLANNER APPROVED]",
        });
        
        // Spawn Wave 1 agents based on selections
        const wave1Agents = [
          { id: "website", name: "Website Bot", avatar: "🌐", role: "Website Builder", wave: 1 as const },
        ];
        
        if (data.revenuePlanner.profit.cart === "now") {
          wave1Agents.push({ id: "cart", name: "Cart Page Bot", avatar: "🛒", role: "Sales Page Builder", wave: 1 as const });
        }
        if (data.revenuePlanner.profit.call === "now") {
          wave1Agents.push({ id: "call", name: "Call Funnel Bot", avatar: "📞", role: "Application Funnel Builder", wave: 1 as const });
        }
        if (data.revenuePlanner.profit.crowd === "now") {
          wave1Agents.push({ id: "event", name: "Event Page Bot", avatar: "👥", role: "Event Page Builder", wave: 1 as const });
        }
        
        wave1Agents.forEach(agent => {
          demoState.agents.push({
            ...agent,
            status: "active",
            currentTask: "Initializing...",
            progress: 0,
            tasksCompleted: 0,
          });
        });
        
        demoState.activity.unshift({
          id: `activity-${Date.now()}`,
          message: `🤖 Wave 1: ${wave1Agents.length} bots spawned`,
          timestamp: now,
          type: "success",
          signal: "[MASTER: WAVE 1 SPAWNING]",
        });
        break;

      // ========== WAVE TRANSITIONS ==========
      case "complete_wave":
        const waveKey = data.wave as "wave1" | "wave2" | "wave3";
        demoState.waves[waveKey].status = "complete";
        demoState.waves[waveKey].completedAt = now;
        
        const waveSignals: Record<string, string> = {
          wave1: "[MASTER: WAVE 1 COMPLETE]",
          wave2: "[MASTER: WAVE 2 COMPLETE]",
          wave3: "[MASTER: WAVE 3 COMPLETE]",
        };
        
        demoState.activity.unshift({
          id: `activity-${Date.now()}`,
          message: `✅ ${waveKey.toUpperCase()} COMPLETE`,
          timestamp: now,
          type: "signal",
          signal: waveSignals[waveKey],
        });
        
        // Auto-trigger next wave
        if (waveKey === "wave1" && demoState.revenuePlanner) {
          demoState.phase = "wave2";
          demoState.waves.wave2.status = "running";
          demoState.waves.wave2.startedAt = now;
          
          // Spawn Wave 2 agents
          const wave2Agents = [
            { id: "email", name: "Email Sequence Bot", avatar: "📧", role: "Email Writer", wave: 2 as const },
          ];
          
          if (demoState.revenuePlanner.promote.prospect === "now") {
            wave2Agents.push({ id: "outbound", name: "Outbound Bot", avatar: "📤", role: "Cold Outreach Setup", wave: 2 as const });
          }
          if (demoState.revenuePlanner.promote.partnership === "now") {
            wave2Agents.push({ id: "partnership", name: "Partnership Bot", avatar: "🤝", role: "JV/Affiliate Setup", wave: 2 as const });
          }
          
          wave2Agents.forEach(agent => {
            demoState.agents.push({
              ...agent,
              status: "active",
              currentTask: "Initializing...",
              progress: 0,
              tasksCompleted: 0,
            });
          });
          
          demoState.activity.unshift({
            id: `activity-${Date.now()}`,
            message: `🤖 Wave 2: ${wave2Agents.length} bots spawned`,
            timestamp: now,
            type: "success",
            signal: "[MASTER: WAVE 2 SPAWNING]",
          });
        } else if (waveKey === "wave2" && demoState.revenuePlanner) {
          const hasWave3 = demoState.revenuePlanner.promote.publish === "now" || 
                          demoState.revenuePlanner.promote.paid === "now";
          
          if (hasWave3) {
            demoState.phase = "wave3";
            demoState.waves.wave3.status = "running";
            demoState.waves.wave3.startedAt = now;
            
            const wave3Agents = [];
            if (demoState.revenuePlanner.promote.publish === "now") {
              wave3Agents.push({ id: "content", name: "Content Bot", avatar: "📱", role: "Content Creator", wave: 3 as const });
            }
            if (demoState.revenuePlanner.promote.paid === "now") {
              wave3Agents.push({ id: "ads", name: "Ads Bot", avatar: "📺", role: "Ad Creative Builder", wave: 3 as const });
            }
            
            wave3Agents.forEach(agent => {
              demoState.agents.push({
                ...agent,
                status: "active",
                currentTask: "Initializing...",
                progress: 0,
                tasksCompleted: 0,
              });
            });
            
            demoState.activity.unshift({
              id: `activity-${Date.now()}`,
              message: `🤖 Wave 3: ${wave3Agents.length} bots spawned`,
              timestamp: now,
              type: "success",
              signal: "[MASTER: WAVE 3 SPAWNING]",
            });
          } else {
            demoState.phase = "complete";
            demoState.activity.unshift({
              id: `activity-${Date.now()}`,
              message: `🎉 ALL BOTS COMPLETE — Demo finished!`,
              timestamp: now,
              type: "signal",
              signal: "[MASTER: ALL BOTS COMPLETE]",
            });
          }
        } else if (waveKey === "wave3") {
          demoState.phase = "complete";
          demoState.activity.unshift({
            id: `activity-${Date.now()}`,
            message: `🎉 ALL BOTS COMPLETE — Demo finished!`,
            timestamp: now,
            type: "signal",
            signal: "[MASTER: ALL BOTS COMPLETE]",
          });
        }
        break;

      // ========== AGENTS ==========
      case "add_agent":
        const existingAgent = demoState.agents.find(a => a.id === data.id);
        if (existingAgent) {
          Object.assign(existingAgent, data);
        } else {
          demoState.agents.push(data);
        }
        break;

      case "update_agent":
        const agent = demoState.agents.find(a => a.id === data.id);
        if (agent) {
          Object.assign(agent, data);
        }
        break;

      // ========== TASKS ==========
      case "add_task":
        demoState.tasks.push({
          ...data,
          id: data.id || `task-${Date.now()}`,
          created_at: now,
        });
        break;

      case "update_task":
        const task = demoState.tasks.find(t => t.id === data.id);
        if (task) {
          Object.assign(task, data);
        }
        break;

      // ========== ACTIVITY ==========
      case "add_activity":
        demoState.activity.unshift({
          id: `activity-${Date.now()}`,
          timestamp: now,
          ...data,
        });
        demoState.activity = demoState.activity.slice(0, 50);
        break;

      // ========== BUSINESS ==========
      case "set_business":
        demoState.business = { ...demoState.business, ...data };
        break;

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }

    demoState.lastUpdated = now;
    return NextResponse.json({ success: true, state: demoState });
  } catch (error) {
    console.error("Demo API error:", error);
    return NextResponse.json({ error: "Failed to update state" }, { status: 500 });
  }
}
