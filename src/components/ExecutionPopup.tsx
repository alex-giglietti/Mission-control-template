"use client";

import { useEffect, useState } from "react";
import type { PlaybookCard } from "./PlaybookSelector";

interface ExecutionPopupProps {
  selectedPlaybooks: PlaybookCard[];
  onClose: () => void;
}

interface Step {
  label: string;
  status: "pending" | "running" | "done";
}

const STEPS: Step[] = [
  { label: "Validating playbook configuration", status: "pending" },
  { label: "Fetching contact segments", status: "pending" },
  { label: "Queuing sequences", status: "pending" },
  { label: "Activating workflows", status: "pending" },
];

export default function ExecutionPopup({
  selectedPlaybooks,
  onClose,
}: ExecutionPopupProps) {
  const [steps, setSteps] = useState<Step[]>(STEPS.map((s) => ({ ...s })));
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;

    const advance = () => {
      if (i >= STEPS.length) {
        setDone(true);
        return;
      }
      // Mark current as running
      setSteps((prev) =>
        prev.map((s, idx) => (idx === i ? { ...s, status: "running" } : s))
      );
      setTimeout(() => {
        // Mark current as done, move to next
        setSteps((prev) =>
          prev.map((s, idx) => (idx === i ? { ...s, status: "done" } : s))
        );
        i++;
        setTimeout(advance, 250);
      }, 650);
    };

    advance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stepColor = (status: Step["status"]) => {
    if (status === "done") return "#10B981";
    if (status === "running") return "#F59E0B";
    return "#e0e0e0";
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1001,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 10,
          padding: "32px 36px",
          minWidth: 420,
          maxWidth: 520,
          width: "100%",
          fontFamily: "Montserrat, sans-serif",
          boxShadow: "0 8px 40px rgba(0,0,0,0.12)",
        }}
      >
        {/* Label */}
        <div
          style={{
            fontSize: 8,
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#aaa",
            marginBottom: 10,
          }}
        >
          {done ? "Complete" : "Executing"}
        </div>

        <div
          style={{ fontSize: 18, fontWeight: 800, color: "#111", marginBottom: 6 }}
        >
          {done ? "All systems launched" : "Launching playbooks..."}
        </div>
        <div style={{ fontSize: 13, color: "#555", marginBottom: 24 }}>
          {selectedPlaybooks.map((p) => p.title).join(", ")}
        </div>

        {/* Steps */}
        <div style={{ marginBottom: 28 }}>
          {steps.map((step, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "9px 0",
                borderBottom:
                  i < steps.length - 1 ? "1px solid #f0f0f0" : "none",
                fontSize: 13,
                color: step.status === "pending" ? "#bbb" : "#111",
                transition: "color 0.2s ease",
              }}
            >
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  background: stepColor(step.status),
                  flexShrink: 0,
                  transition: "background 0.2s ease",
                }}
              />
              {step.label}
            </div>
          ))}
        </div>

        {done && (
          <button
            onClick={onClose}
            style={{
              width: "100%",
              padding: "11px 0",
              borderRadius: 6,
              border: "none",
              background: "#111",
              color: "#fff",
              fontFamily: "Montserrat, sans-serif",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Done
          </button>
        )}
      </div>
    </div>
  );
}
