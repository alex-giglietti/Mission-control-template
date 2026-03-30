"use client";

import { useEffect, useState } from "react";
import { PlaybookCard } from "./PlaybookSelector";

interface ExecutionPopupProps {
  selectedPlaybooks: PlaybookCard[];
  onClose: () => void;
}

type Step = { label: string; status: "pending" | "running" | "done" };

export default function ExecutionPopup({
  selectedPlaybooks,
  onClose,
}: ExecutionPopupProps) {
  const [steps, setSteps] = useState<Step[]>([
    { label: "Validating playbook configuration", status: "pending" },
    { label: "Fetching contact segments", status: "pending" },
    { label: "Queuing sequences", status: "pending" },
    { label: "Activating workflows", status: "pending" },
  ]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    const tick = () => {
      if (i >= steps.length) {
        setDone(true);
        return;
      }
      setSteps((prev) =>
        prev.map((s, idx) => {
          if (idx === i) return { ...s, status: "running" };
          if (idx < i) return { ...s, status: "done" };
          return s;
        })
      );
      setTimeout(() => {
        setSteps((prev) =>
          prev.map((s, idx) => (idx === i ? { ...s, status: "done" } : s))
        );
        i++;
        setTimeout(tick, 300);
      }, 700);
    };
    tick();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          minWidth: 400,
          maxWidth: 520,
          width: "100%",
          fontFamily: "Montserrat, sans-serif",
          boxShadow: "0 8px 40px rgba(0,0,0,0.12)",
        }}
      >
        <div
          style={{
            fontSize: 8,
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#999",
            marginBottom: 8,
          }}
        >
          Executing
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#111", marginBottom: 4 }}>
          {done ? "All systems launched" : "Launching playbooks..."}
        </div>
        <div style={{ fontSize: 13, color: "#555", marginBottom: 24 }}>
          {selectedPlaybooks.map((p) => p.title).join(", ")}
        </div>

        <div style={{ marginBottom: 28 }}>
          {steps.map((step, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "9px 0",
                borderBottom: i < steps.length - 1 ? "1px solid #f0f0f0" : "none",
                fontSize: 13,
                color: step.status === "pending" ? "#bbb" : "#111",
              }}
            >
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  background:
                    step.status === "done"
                      ? "#10B981"
                      : step.status === "running"
                      ? "#F59E0B"
                      : "#e0e0e0",
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
