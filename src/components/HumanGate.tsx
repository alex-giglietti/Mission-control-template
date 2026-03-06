"use client";

import { useState, useEffect, useRef } from "react";

interface HumanGateProps {
  gateNumber: number;
  title: string;
  description: string;
  content: string; // The deliverable being approved (e.g., offer summary, brand board description)
  approveLabel?: string;
  onApprove: () => void;
  onRequestChanges?: (feedback: string) => void;
  signal: string; // Signal to fire on approval (e.g., "[VISION: OFFER LOCKED]")
}

// Add signal to localStorage for LiveDemo to pick up
function addSignalToLog(signal: string, message: string) {
  const SIGNALS_KEY = "aim-demo-signals";
  const existing = JSON.parse(localStorage.getItem(SIGNALS_KEY) || "[]");
  existing.unshift({
    id: `signal-${Date.now()}-${Math.random()}`,
    signal,
    message,
    timestamp: new Date().toISOString(),
  });
  localStorage.setItem(SIGNALS_KEY, JSON.stringify(existing.slice(0, 100)));
}

export default function HumanGate({
  gateNumber,
  title,
  description,
  content,
  approveLabel = "Approve",
  onApprove,
  onRequestChanges,
  signal,
}: HumanGateProps) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [stallTimer, setStallTimer] = useState(0);
  const stallRef = useRef<NodeJS.Timeout | null>(null);
  const stallAlertFired = useRef(false);

  // Track stall time — alert Joseph after 5 minutes
  useEffect(() => {
    const startTime = Date.now();
    stallRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setStallTimer(elapsed);

      if (elapsed >= 300 && !stallAlertFired.current) {
        stallAlertFired.current = true;
        addSignalToLog(
          `[MASTER: NEEDS JOSEPH — Gate ${gateNumber} stalled]`,
          `Gate ${gateNumber} (${title}) has been idle for 5+ minutes`
        );
      }
    }, 1000);

    return () => {
      if (stallRef.current) clearInterval(stallRef.current);
    };
  }, [gateNumber, title]);

  const handleApprove = () => {
    if (stallRef.current) clearInterval(stallRef.current);
    addSignalToLog(signal, `${title} approved`);
    onApprove();
  };

  const handleRequestChanges = () => {
    if (feedback.trim() && onRequestChanges) {
      onRequestChanges(feedback.trim());
      setShowFeedback(false);
      setFeedback("");
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 1000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "rgba(0,0,0,0.85)",
      backdropFilter: "blur(8px)",
    }}>
      <div style={{
        maxWidth: 600,
        width: "100%",
        margin: "0 20px",
        background: "linear-gradient(180deg, #111624 0%, #0D1117 100%)",
        borderRadius: 20,
        border: "1px solid rgba(255,255,255,0.1)",
        overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          padding: "20px 28px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "linear-gradient(135deg, #FF4EDB, #6366F1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              fontWeight: 700,
              color: "#FFF",
              fontFamily: "'Orbitron', monospace",
            }}>
              {gateNumber}
            </div>
            <div>
              <div style={{
                fontSize: 10,
                letterSpacing: 2,
                color: "#FF4EDB",
                fontFamily: "'Orbitron', monospace",
              }}>
                HUMAN GATE {gateNumber}
              </div>
              <div style={{
                fontSize: 16,
                fontWeight: 600,
                color: "#F5F7FA",
                fontFamily: "'Space Grotesk', sans-serif",
              }}>
                {title}
              </div>
            </div>
          </div>
          <div style={{
            fontSize: 12,
            color: stallTimer >= 300 ? "#EF4444" : "#6B7186",
            fontFamily: "monospace",
          }}>
            {formatTime(stallTimer)}
          </div>
        </div>

        {/* Description */}
        <div style={{ padding: "16px 28px" }}>
          <p style={{
            fontSize: 13,
            color: "#8A8F98",
            lineHeight: 1.6,
            margin: 0,
          }}>
            {description}
          </p>
        </div>

        {/* Content Preview */}
        <div style={{
          margin: "0 28px",
          padding: "16px 20px",
          background: "rgba(255,255,255,0.03)",
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.06)",
          maxHeight: 300,
          overflowY: "auto",
        }}>
          <pre style={{
            fontSize: 13,
            color: "#C9CDD3",
            lineHeight: 1.7,
            margin: 0,
            whiteSpace: "pre-wrap",
            wordWrap: "break-word",
            fontFamily: "'Space Grotesk', sans-serif",
          }}>
            {content}
          </pre>
        </div>

        {/* Feedback Section */}
        {showFeedback && onRequestChanges && (
          <div style={{ padding: "16px 28px 0" }}>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="What changes would you like to see?"
              style={{
                width: "100%",
                minHeight: 80,
                padding: 12,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8,
                color: "#F5F7FA",
                fontSize: 13,
                resize: "vertical",
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            />
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button
                onClick={handleRequestChanges}
                disabled={!feedback.trim()}
                style={{
                  padding: "8px 16px",
                  background: feedback.trim() ? "#F59E0B" : "rgba(255,255,255,0.1)",
                  borderRadius: 6,
                  border: "none",
                  color: feedback.trim() ? "#000" : "#6B7186",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: feedback.trim() ? "pointer" : "not-allowed",
                }}
              >
                Submit Feedback
              </button>
              <button
                onClick={() => { setShowFeedback(false); setFeedback(""); }}
                style={{
                  padding: "8px 16px",
                  background: "transparent",
                  borderRadius: 6,
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#8A8F98",
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{
          padding: "20px 28px",
          display: "flex",
          gap: 12,
          justifyContent: "flex-end",
        }}>
          {onRequestChanges && !showFeedback && (
            <button
              onClick={() => setShowFeedback(true)}
              style={{
                padding: "12px 24px",
                background: "rgba(255,255,255,0.05)",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#C9CDD3",
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Request Changes
            </button>
          )}
          <button
            onClick={handleApprove}
            style={{
              padding: "12px 32px",
              background: "linear-gradient(135deg, #10B981, #059669)",
              borderRadius: 10,
              border: "none",
              color: "#FFF",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "'Orbitron', monospace",
            }}
          >
            {approveLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
