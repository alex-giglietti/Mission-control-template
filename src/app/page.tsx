"use client";

import { useState, useEffect } from "react";
import CEODashboard from "@/components/CEODashboard";
import RevenueEngine from "@/components/RevenueEngine";
import AIWorkforce from "@/components/AIWorkforce";
import ProfitPipeline from "@/components/ProfitPipeline";
import MediaHub from "@/components/MediaHub";
import Projects from "@/components/Projects";
import Financials from "@/components/Financials";
import LiveDemo from "@/components/LiveDemo";
import RevenuePlanner from "@/components/RevenuePlanner";
import VisionChat from "@/components/VisionChat";
import BrandChat from "@/components/BrandChat";
import CharacterChat from "@/components/CharacterChat";
import StartupCheck from "@/components/StartupCheck";
import DemoClose from "@/components/DemoClose";

// Demo phases
type DemoPhase =
  | "preflight"    // Phase 0: System health check
  | "startup"      // Enter business name
  | "vision"       // Chat with COO Agent
  | "brand"        // Brand discovery chat
  | "character"    // Character creation chat
  | "planner"      // Revenue Planner (Lock & Build)
  | "building"     // Watching the build happen
  | "complete";    // Done

// State persisted to localStorage
interface DemoState {
  phase: DemoPhase;
  businessName: string;
  visionSummary: string;
  brandSummary: string;
  characterSummary: string;
  revenuePlannerLocked: boolean;
  revenuePlannerData: any | null;
  startedAt: string | null;
  buildTriggered?: boolean; // True only when LOCK & BUILD just clicked
}

const defaultState: DemoState = {
  phase: "preflight",
  businessName: "",
  visionSummary: "",
  brandSummary: "",
  characterSummary: "",
  revenuePlannerLocked: false,
  revenuePlannerData: null,
  startedAt: null,
  buildTriggered: false,
};

// Navigation items
const navItems = [
  { id: "live-demo", label: "🔴 LIVE BUILD", icon: "📡", color: "#FF4EDB", phases: ["building", "complete"] },
  { id: "vision-chat", label: "Vision Intake", icon: "💬", color: "#7B61FF", phases: ["vision"] },
  { id: "brand-chat", label: "Brand Discovery", icon: "🎨", color: "#FF4EDB", phases: ["brand"] },
  { id: "character-chat", label: "Character Creation", icon: "🎭", color: "#2F80FF", phases: ["character"] },
  { id: "revenue-planner", label: "Revenue Planner", icon: "🎯", color: "#10B981", phases: ["planner", "building", "complete"] },
  { id: "ceo-dashboard", label: "CEO Dashboard", icon: "📊", color: "#FF4EDB", phases: ["building", "complete"] },
  { id: "revenue-engine", label: "Revenue Engine", icon: "💰", color: "#10B981", phases: ["building", "complete"] },
  { id: "ai-workforce", label: "AI Workforce", icon: "🤖", color: "#2F80FF", phases: ["building", "complete"] },
  { id: "profit-pipeline", label: "Profit Pipeline", icon: "📈", color: "#10B981", phases: ["building", "complete"] },
  { id: "media-hub", label: "Media Hub", icon: "🎬", color: "#FF4EDB", phases: ["building", "complete"] },
  { id: "projects", label: "Projects", icon: "📋", color: "#7B61FF", phases: ["building", "complete"] },
  { id: "financials", label: "Financials", icon: "💵", color: "#10B981", phases: ["building", "complete"] },
];

const STORAGE_KEY = "aim-demo-state";

export default function Home() {
  const [state, setState] = useState<DemoState>(defaultState);
  const [activeView, setActiveView] = useState("live-demo");
  const [isHydrated, setIsHydrated] = useState(false);

  // Load state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setState(parsed);
        
        // Set appropriate view based on phase
        if (parsed.phase === "vision") {
          setActiveView("vision-chat");
        } else if (parsed.phase === "brand") {
          setActiveView("brand-chat");
        } else if (parsed.phase === "character") {
          setActiveView("character-chat");
        } else if (parsed.phase === "planner") {
          setActiveView("revenue-planner");
        } else if (parsed.phase === "building" || parsed.phase === "complete") {
          setActiveView("live-demo");
        }
      } catch (e) {
        console.error("Failed to parse saved state:", e);
      }
    }
    setIsHydrated(true);
  }, []);

  // Persist state to localStorage on change
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state, isHydrated]);

  // Update state helper
  const updateState = (updates: Partial<DemoState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  // Start demo with business name
  const startDemo = (businessName: string) => {
    updateState({
      phase: "vision",
      businessName,
      startedAt: new Date().toISOString(),
    });
    setActiveView("vision-chat");
  };

  // Complete vision chat → go to brand
  const completeVision = (visionSummary: string) => {
    updateState({
      phase: "brand",
      visionSummary,
    });
    setActiveView("brand-chat");
  };

  // Complete brand chat → go to character
  const completeBrand = (brandSummary: string) => {
    updateState({
      phase: "character",
      brandSummary,
    });
    setActiveView("character-chat");
  };

  // Complete character chat → go to planner
  const completeCharacter = (characterSummary: string) => {
    updateState({
      phase: "planner",
      characterSummary,
    });
    setActiveView("revenue-planner");
  };

  // Lock and build
  const lockAndBuild = (revenuePlannerData: any) => {
    updateState({
      phase: "building",
      revenuePlannerLocked: true,
      revenuePlannerData,
      buildTriggered: true, // Signal that user just clicked the button
    });
    setActiveView("live-demo");
  };

  // Reset demo
  const resetDemo = () => {
    localStorage.removeItem(STORAGE_KEY);
    setState(defaultState);
    setActiveView("live-demo");
  };

  // Don't render until hydrated (prevents flash)
  if (!isHydrated) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#0B0F19",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#8A8F98",
      }}>
        Loading...
      </div>
    );
  }

  // Preflight check screen (Phase 0)
  if (state.phase === "preflight") {
    return <StartupCheck onReady={() => updateState({ phase: "startup" })} />;
  }

  // Startup screen
  if (state.phase === "startup") {
    return <StartupScreen onStart={startDemo} />;
  }

  // Get available nav items for current phase
  const availableNavItems = navItems.filter(item => 
    item.phases.includes(state.phase) || 
    (state.phase === "vision" && item.id === "vision-chat") ||
    (state.phase === "brand" && item.id === "brand-chat") ||
    (state.phase === "character" && item.id === "character-chat")
  );

  // Get phase label for display
  const getPhaseLabel = () => {
    switch (state.phase) {
      case "vision": return "Vision Intake";
      case "brand": return "Brand Discovery";
      case "character": return "Character Creation";
      case "planner": return "Revenue Planner";
      case "building": return "Building...";
      case "complete": return "Complete";
      default: return state.phase;
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0B0F19" }}>
      {/* Left Sidebar */}
      <div style={{
        width: 260,
        minWidth: 260,
        background: "linear-gradient(180deg, #111624 0%, #0B0F19 100%)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        flexDirection: "column",
        padding: "20px 0",
      }}>
        {/* Logo/Brand */}
        <div style={{ padding: "0 20px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{
            fontSize: 9,
            letterSpacing: 3,
            fontFamily: "'Orbitron', monospace",
            background: "linear-gradient(90deg, #2F80FF, #7B61FF, #FF4EDB)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            marginBottom: 4,
          }}>
            AI MONETIZATION LIVE
          </div>
          <div style={{
            fontSize: 16,
            fontWeight: 700,
            fontFamily: "'Space Grotesk', sans-serif",
            color: "#F5F7FA",
          }}>
            {state.businessName || "Demo"}
          </div>
        </div>

        {/* Phase Indicator */}
        <div style={{
          padding: "12px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}>
          <div style={{
            fontSize: 10,
            color: "#6B7186",
            textTransform: "uppercase",
            letterSpacing: 1,
            marginBottom: 8,
          }}>
            Current Phase
          </div>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}>
            <span style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: state.phase === "complete" ? "#10B981" : "#FF4EDB",
              animation: state.phase !== "complete" ? "pulse 2s ease-in-out infinite" : "none",
            }} />
            <span style={{
              fontSize: 13,
              fontWeight: 600,
              color: state.phase === "complete" ? "#10B981" : "#FF4EDB",
            }}>
              {getPhaseLabel()}
            </span>
          </div>
          
          {/* Phase Progress */}
          <div style={{
            display: "flex",
            gap: 4,
            marginTop: 12,
          }}>
            {["vision", "brand", "character", "planner", "building"].map((p, i) => (
              <div key={p} style={{
                flex: 1,
                height: 4,
                borderRadius: 2,
                background: ["vision", "brand", "character", "planner", "building", "complete"].indexOf(state.phase) >= i 
                  ? "linear-gradient(90deg, #7B61FF, #FF4EDB)"
                  : "rgba(255,255,255,0.1)",
              }} />
            ))}
          </div>
        </div>

        {/* Navigation Buttons */}
        <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
          {availableNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 16px",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                width: "100%",
                transition: "all 0.15s ease",
                background: activeView === item.id
                  ? `linear-gradient(135deg, ${item.color}20, ${item.color}10)`
                  : "transparent",
                borderLeft: activeView === item.id
                  ? `3px solid ${item.color}`
                  : "3px solid transparent",
              }}
            >
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              <span style={{
                fontSize: 13,
                fontWeight: activeView === item.id ? 600 : 500,
                color: activeView === item.id ? "#F5F7FA" : "#8A8F98",
                fontFamily: "'Space Grotesk', sans-serif",
              }}>
                {item.label}
              </span>
              {item.id === "revenue-planner" && state.revenuePlannerLocked && (
                <span style={{ marginLeft: "auto", fontSize: 12 }}>🔒</span>
              )}
            </button>
          ))}
        </nav>

        {/* Bottom Section */}
        <div style={{
          padding: "16px 20px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}>
          <button
            onClick={resetDemo}
            style={{
              padding: "10px 16px",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.1)",
              background: "transparent",
              color: "#6B7186",
              fontSize: 12,
              cursor: "pointer",
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            🔄 Reset Demo
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, overflow: "auto" }}>
        {activeView === "vision-chat" && (
          <VisionChat
            businessName={state.businessName}
            onComplete={completeVision}
          />
        )}
        {activeView === "brand-chat" && (
          <BrandChat
            businessName={state.businessName}
            visionSummary={state.visionSummary}
            onComplete={completeBrand}
          />
        )}
        {activeView === "character-chat" && (
          <CharacterChat
            businessName={state.businessName}
            brandSummary={state.brandSummary}
            onComplete={completeCharacter}
          />
        )}
        {activeView === "revenue-planner" && (
          <RevenuePlanner
            businessName={state.businessName}
            onLockAndBuild={lockAndBuild}
            isLocked={state.revenuePlannerLocked}
          />
        )}
        {activeView === "live-demo" && state.phase !== "complete" && (
          <LiveDemo
            businessName={state.businessName}
            phase={state.phase}
            revenuePlannerData={state.revenuePlannerData}
            buildTriggered={state.buildTriggered}
          />
        )}
        {activeView === "live-demo" && state.phase === "complete" && (
          <DemoClose
            businessName={state.businessName}
            revenuePlannerData={state.revenuePlannerData}
          />
        )}
        {activeView === "ceo-dashboard" && <CEODashboard />}
        {activeView === "revenue-engine" && <RevenueEngine />}
        {activeView === "ai-workforce" && <AIWorkforce />}
        {activeView === "profit-pipeline" && <ProfitPipeline />}
        {activeView === "media-hub" && <MediaHub />}
        {activeView === "projects" && <Projects />}
        {activeView === "financials" && <Financials />}
      </div>

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

function StartupScreen({ onStart }: { onStart: (name: string) => void }) {
  const [businessName, setBusinessName] = useState("");

  const handleStart = () => {
    if (businessName.trim()) {
      onStart(businessName.trim());
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0B0F19",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <div style={{
        maxWidth: 500,
        width: "100%",
        padding: 40,
        background: "linear-gradient(180deg, #111624 0%, #0D1117 100%)",
        borderRadius: 20,
        border: "1px solid rgba(255,255,255,0.08)",
        textAlign: "center",
      }}>
        <div style={{
          fontSize: 10,
          letterSpacing: 3,
          color: "#FF4EDB",
          fontFamily: "'Orbitron', monospace",
          marginBottom: 16,
        }}>
          AI MONETIZATION LIVE
        </div>
        <h1 style={{
          fontSize: 28,
          fontWeight: 700,
          color: "#F5F7FA",
          marginBottom: 8,
          fontFamily: "'Space Grotesk', sans-serif",
        }}>
          Let's Build Your AI Workforce
        </h1>
        <p style={{
          color: "#8A8F98",
          fontSize: 14,
          marginBottom: 32,
          lineHeight: 1.6,
        }}>
          Enter your business name to start. You'll chat with our COO Agent to understand your vision, define your brand, create your AI character, then we'll build your AI team live.
        </p>
        
        <input
          type="text"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          placeholder="e.g., Viral Growth Agency"
          onKeyDown={(e) => e.key === "Enter" && handleStart()}
          style={{
            width: "100%",
            padding: "16px 20px",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 10,
            color: "#F5F7FA",
            fontSize: 16,
            textAlign: "center",
            marginBottom: 20,
          }}
        />
        
        <button
          onClick={handleStart}
          disabled={!businessName.trim()}
          style={{
            padding: "16px 40px",
            background: businessName.trim() 
              ? "linear-gradient(135deg, #FF4EDB, #7B61FF)" 
              : "rgba(255,255,255,0.1)",
            borderRadius: 10,
            border: "none",
            color: businessName.trim() ? "#FFF" : "#6B7186",
            fontSize: 16,
            fontWeight: 600,
            cursor: businessName.trim() ? "pointer" : "not-allowed",
            fontFamily: "'Orbitron', monospace",
          }}
        >
          🚀 Start Vision Intake
        </button>
      </div>
    </div>
  );
}
