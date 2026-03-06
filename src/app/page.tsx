"use client";

import { useState } from "react";
import CEODashboard from "@/components/CEODashboard";
import RevenueEngine from "@/components/RevenueEngine";
import AIWorkforce from "@/components/AIWorkforce";
import ProfitPipeline from "@/components/ProfitPipeline";
import MediaHub from "@/components/MediaHub";
import Projects from "@/components/Projects";
import Financials from "@/components/Financials";

// Navigation items - add more here as needed
const navItems = [
  { id: "ceo-dashboard", label: "CEO Dashboard", icon: "📊", color: "#FF4EDB" },
  { id: "revenue-engine", label: "Revenue Engine", icon: "💰", color: "#10B981" },
  { id: "ai-workforce", label: "AI Workforce", icon: "🤖", color: "#2F80FF" },
  { id: "profit-pipeline", label: "Profit Pipeline", icon: "📈", color: "#10B981" },
  { id: "media-hub", label: "Media Hub", icon: "🎬", color: "#FF4EDB" },
  { id: "projects", label: "Projects", icon: "📋", color: "#7B61FF" },
  { id: "financials", label: "Financials", icon: "💵", color: "#10B981" },
];

export default function Home() {
  const [activeView, setActiveView] = useState("ceo-dashboard");

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0B0F19" }}>
      {/* Left Sidebar */}
      <div style={{
        width: 240,
        minWidth: 240,
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
            AI MONETIZATION
          </div>
          <div style={{
            fontSize: 16,
            fontWeight: 700,
            fontFamily: "'Space Grotesk', sans-serif",
            color: "#F5F7FA",
          }}>
            Mission Control
          </div>
          <div style={{
            fontSize: 10,
            color: "#6B7186",
            marginTop: 4,
            fontFamily: "'Orbitron', monospace",
          }}>
            DEMO MODE
          </div>
        </div>

        {/* Navigation Buttons */}
        <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
          {navItems.map((item) => (
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
            </button>
          ))}
        </nav>

        {/* Bottom Section */}
        <div style={{
          padding: "16px 20px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}>
          <div style={{
            fontSize: 10,
            color: "#6B7186",
            fontFamily: "'Orbitron', monospace",
            letterSpacing: 1,
          }}>
            LIVE DEMO
          </div>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginTop: 8,
          }}>
            <span style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#10B981",
              animation: "pulse 2s ease-in-out infinite",
            }} />
            <span style={{ fontSize: 12, color: "#10B981" }}>System Active</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, overflow: "auto" }}>
        {activeView === "ceo-dashboard" && <CEODashboard />}
        {activeView === "revenue-engine" && <RevenueEngine />}
        {activeView === "ai-workforce" && <AIWorkforce />}
        {activeView === "profit-pipeline" && <ProfitPipeline />}
        {activeView === "media-hub" && <MediaHub />}
        {activeView === "projects" && <Projects />}
        {activeView === "financials" && <Financials />}
        {activeView === "analytics" && <PlaceholderView title="Analytics" />}
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

// Placeholder for future views
function PlaceholderView({ title }: { title: string }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
      minHeight: "100vh",
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          fontSize: 48,
          marginBottom: 16,
        }}>🚧</div>
        <div style={{
          fontSize: 24,
          fontWeight: 700,
          fontFamily: "'Space Grotesk', sans-serif",
          color: "#F5F7FA",
          marginBottom: 8,
        }}>
          {title}
        </div>
        <div style={{
          fontSize: 14,
          color: "#6B7186",
        }}>
          Coming soon...
        </div>
      </div>
    </div>
  );
}
