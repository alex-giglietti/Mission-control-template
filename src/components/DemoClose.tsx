"use client";

import { useState, useEffect } from "react";
import { fireSignal, MASTER_MISSION_CONTROL_REVEALED } from "@/lib/signals";
import { loadSimulationState } from "@/lib/simulation-state";

interface DemoCloseProps {
  businessName: string;
  revenuePlannerData?: {
    revenueGoal?: number;
    promote?: { prospect?: string; paid?: string; publish?: string; partnership?: string };
    profit?: { cart?: string; call?: string; crowd?: string; aiSales?: string };
    produce?: Record<string, string>;
  };
}

export default function DemoClose({ businessName, revenuePlannerData }: DemoCloseProps) {
  const [showReveal, setShowReveal] = useState(false);
  const [elapsedTime, setElapsedTime] = useState("");

  useEffect(() => {
    // Calculate elapsed time from simulation state
    const simState = loadSimulationState();
    if (simState?.lastUpdated) {
      const startKey = "aim-demo-start-time";
      const startTime = localStorage.getItem(startKey);
      if (startTime) {
        const elapsed = Date.now() - parseInt(startTime);
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        setElapsedTime(`${minutes}m ${seconds}s`);
      }
    }

    // Auto-reveal Mission Control after 3 seconds
    const timer = setTimeout(() => setShowReveal(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  const missionControlUrl = `https://demo-mission-control.vercel.app?business=${encodeURIComponent(businessName)}`;

  const handleReveal = () => {
    fireSignal(MASTER_MISSION_CONTROL_REVEALED, `Mission Control revealed for ${businessName}`, {
      businessName,
      url: missionControlUrl,
    });
    window.open(missionControlUrl, "_blank");
  };

  // Build the output summary per Section 12
  const promoteOutputs: string[] = [];
  const profitOutputs: string[] = [];
  const inReviewItems: string[] = [];

  if (revenuePlannerData?.promote) {
    const p = revenuePlannerData.promote;
    if (p.prospect === "now") {
      promoteOutputs.push("Cold Outreach System — email sequences, ICP scoring, domain setup guide");
      inReviewItems.push("Outbound strategy deck");
    }
    if (p.publish === "now") {
      promoteOutputs.push("Content Engine — 7-piece daily content system, content calendar");
      inReviewItems.push("Sample content pieces (7-day batch)");
    }
    if (p.paid === "now") {
      promoteOutputs.push("Paid Ads — Meta ad creatives, hooks, targeting strategy");
      inReviewItems.push("Ad copy variants & creative briefs");
    }
    if (p.partnership === "now") {
      promoteOutputs.push("Partnership System — affiliate recruitment, JV outreach templates");
      inReviewItems.push("Partnership pitch deck");
    }
  }

  if (revenuePlannerData?.profit) {
    const p = revenuePlannerData.profit;
    if (p.cart === "now") {
      profitOutputs.push("Sales Page (1-Page Cart) — ready for deployment");
      inReviewItems.push("Cart page HTML artifact");
      inReviewItems.push("GHL Workflow: Cart Abandonment & Purchase Follow-up");
    }
    if (p.call === "now") {
      profitOutputs.push("Application Funnel — call booking page ready");
      inReviewItems.push("Call funnel HTML artifact");
      inReviewItems.push("GHL Workflow: Booking Confirmation & No-Show Follow-up");
    }
    if (p.crowd === "now") {
      profitOutputs.push("Event/Webinar Page — registration page ready");
      inReviewItems.push("Event page HTML artifact");
      inReviewItems.push("GHL Workflow: Event Registration & Follow-up");
    }
    if (p.aiSales === "now") {
      profitOutputs.push("AI Sales Bot — conversational AI trained");
      inReviewItems.push("GHL Workflow: AI Conversational Sales Bot");
    }
  }

  // Always-present outputs
  inReviewItems.push("GHL Workflow: Welcome Sequence Automation");
  inReviewItems.push("GHL Workflow: Lead Nurture Automation");

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0B0F19",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: 40,
    }}>
      {/* Output Summary */}
      <div style={{
        maxWidth: 700,
        width: "100%",
        background: "linear-gradient(180deg, #111624 0%, #0D1117 100%)",
        borderRadius: 20,
        border: "1px solid rgba(255,255,255,0.1)",
        overflow: "hidden",
      }}>
        {/* Header Banner */}
        <div style={{
          padding: "32px 40px",
          background: "linear-gradient(135deg, rgba(16,185,129,0.15), rgba(123,97,255,0.15))",
          borderBottom: "1px solid rgba(16,185,129,0.3)",
          textAlign: "center",
        }}>
          <div style={{
            fontSize: 11,
            letterSpacing: 4,
            color: "#10B981",
            fontFamily: "'Orbitron', monospace",
            marginBottom: 8,
          }}>
            {businessName.toUpperCase()} IS LIVE
          </div>
          <h1 style={{
            fontSize: 28,
            fontWeight: 700,
            color: "#F5F7FA",
            margin: 0,
            fontFamily: "'Space Grotesk', sans-serif",
          }}>
            Everything We Built Today
          </h1>
          {elapsedTime && (
            <p style={{ fontSize: 13, color: "#8A8F98", marginTop: 8 }}>
              Total build time: {elapsedTime}
            </p>
          )}
        </div>

        <div style={{ padding: "28px 40px" }}>
          {/* PROMOTE Section */}
          {promoteOutputs.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h3 style={{
                fontSize: 12,
                letterSpacing: 2,
                color: "#FF4EDB",
                fontFamily: "'Orbitron', monospace",
                marginBottom: 10,
              }}>
                PROMOTE
              </h3>
              {promoteOutputs.map((item, i) => (
                <div key={i} style={{
                  padding: "10px 16px",
                  background: "rgba(255,78,219,0.05)",
                  borderRadius: 8,
                  border: "1px solid rgba(255,78,219,0.15)",
                  marginBottom: 6,
                  fontSize: 13,
                  color: "#C9CDD3",
                }}>
                  {item}
                </div>
              ))}
            </div>
          )}

          {/* PROFIT Section */}
          {profitOutputs.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h3 style={{
                fontSize: 12,
                letterSpacing: 2,
                color: "#10B981",
                fontFamily: "'Orbitron', monospace",
                marginBottom: 10,
              }}>
                PROFIT
              </h3>
              {profitOutputs.map((item, i) => (
                <div key={i} style={{
                  padding: "10px 16px",
                  background: "rgba(16,185,129,0.05)",
                  borderRadius: 8,
                  border: "1px solid rgba(16,185,129,0.15)",
                  marginBottom: 6,
                  fontSize: 13,
                  color: "#C9CDD3",
                }}>
                  {item}
                </div>
              ))}
            </div>
          )}

          {/* PRODUCE Section */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{
              fontSize: 12,
              letterSpacing: 2,
              color: "#7B61FF",
              fontFamily: "'Orbitron', monospace",
              marginBottom: 10,
            }}>
              PRODUCE
            </h3>
            <div style={{
              padding: "10px 16px",
              background: "rgba(123,97,255,0.05)",
              borderRadius: 8,
              border: "1px solid rgba(123,97,255,0.15)",
              fontSize: 13,
              color: "#C9CDD3",
            }}>
              Confirmed from Vision docs — reflected in all assets and copy
            </div>
          </div>

          {/* PROJECT MANAGE Section */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{
              fontSize: 12,
              letterSpacing: 2,
              color: "#2F80FF",
              fontFamily: "'Orbitron', monospace",
              marginBottom: 10,
            }}>
              PROJECT MANAGE
            </h3>
            <div style={{
              padding: "10px 16px",
              background: "rgba(47,128,255,0.05)",
              borderRadius: 8,
              border: "1px solid rgba(47,128,255,0.15)",
              fontSize: 13,
              color: "#C9CDD3",
            }}>
              Your Mission Control dashboard is ready.
            </div>
          </div>

          {/* IN REVIEW Section */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{
              fontSize: 12,
              letterSpacing: 2,
              color: "#F59E0B",
              fontFamily: "'Orbitron', monospace",
              marginBottom: 10,
            }}>
              IN REVIEW — YOUR TEAM&apos;S NEXT STEPS
            </h3>
            {inReviewItems.map((item, i) => (
              <div key={i} style={{
                padding: "8px 16px",
                background: "rgba(245,158,11,0.05)",
                borderRadius: 6,
                border: "1px solid rgba(245,158,11,0.1)",
                marginBottom: 4,
                fontSize: 12,
                color: "#D4A44A",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}>
                <span style={{ color: "#F59E0B" }}>
                  {item.includes("GHL") ? "⚙️" : "📄"}
                </span>
                {item}
              </div>
            ))}
          </div>

          {/* Google Drive note */}
          <div style={{
            padding: "14px 20px",
            background: "rgba(255,255,255,0.03)",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.06)",
            textAlign: "center",
            marginBottom: 24,
          }}>
            <p style={{ fontSize: 12, color: "#8A8F98", margin: 0, lineHeight: 1.6 }}>
              Everything built today is saved to your Google Drive:<br />
              <span style={{ color: "#C9CDD3", fontFamily: "monospace", fontSize: 11 }}>
                /AIM-DEMO-BRAIN/BUSINESSES/{businessName}/
              </span><br />
              Nothing was lost. Everything is real.
            </p>
          </div>

          {/* Mission Control Reveal */}
          {showReveal && (
            <div style={{
              padding: "24px",
              background: "linear-gradient(135deg, rgba(47,128,255,0.1), rgba(123,97,255,0.1))",
              borderRadius: 12,
              border: "1px solid rgba(47,128,255,0.3)",
              textAlign: "center",
            }}>
              <div style={{
                fontSize: 11,
                letterSpacing: 3,
                color: "#2F80FF",
                fontFamily: "'Orbitron', monospace",
                marginBottom: 12,
              }}>
                MISSION CONTROL READY
              </div>
              <p style={{ fontSize: 15, color: "#F5F7FA", margin: "0 0 16px", fontWeight: 500 }}>
                Your CEO Dashboard is LIVE
              </p>
              <button
                onClick={handleReveal}
                style={{
                  padding: "16px 40px",
                  background: "linear-gradient(135deg, #2F80FF, #7B61FF)",
                  borderRadius: 10,
                  border: "none",
                  color: "#FFF",
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "'Orbitron', monospace",
                }}
              >
                Open Mission Control
              </button>
              <p style={{ fontSize: 11, color: "#6B7186", marginTop: 10 }}>
                Every lead. Every sale. Every dollar. One place.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
