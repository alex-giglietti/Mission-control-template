"use client";

import { useState, useEffect } from "react";

interface HealthCheck {
  name: string;
  status: "ok" | "error" | "checking";
  latencyMs?: number;
  error?: string;
}

interface StartupCheckProps {
  onReady: () => void;
}

export default function StartupCheck({ onReady }: StartupCheckProps) {
  const [checks, setChecks] = useState<HealthCheck[]>([
    { name: "Gemini API", status: "checking" },
    { name: "Google Drive API", status: "checking" },
    { name: "Mission Control Dashboard", status: "checking" },
  ]);
  const [overallStatus, setOverallStatus] = useState<"checking" | "go" | "issues">("checking");
  const [hasRun, setHasRun] = useState(false);

  useEffect(() => {
    if (hasRun) return;
    setHasRun(true);

    const runChecks = async () => {
      try {
        const res = await fetch("/api/health");
        if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
        const data = await res.json();
        setChecks(data.checks);
        setOverallStatus(data.status === "ALL_SYSTEMS_GO" ? "go" : "issues");
      } catch (err) {
        setChecks((prev) =>
          prev.map((c) => ({
            ...c,
            status: "error" as const,
            error: c.status === "checking" ? "Health endpoint unreachable" : c.error,
          }))
        );
        setOverallStatus("issues");
      }
    };

    runChecks();
  }, [hasRun]);

  const getStatusIcon = (status: HealthCheck["status"]) => {
    switch (status) {
      case "ok": return "✅";
      case "error": return "❌";
      case "checking": return "⏳";
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
        maxWidth: 520,
        width: "100%",
        padding: 40,
        background: "linear-gradient(180deg, #111624 0%, #0D1117 100%)",
        borderRadius: 20,
        border: "1px solid rgba(255,255,255,0.08)",
      }}>
        <div style={{
          fontSize: 10,
          letterSpacing: 3,
          color: "#FF4EDB",
          fontFamily: "'Orbitron', monospace",
          marginBottom: 16,
          textAlign: "center",
        }}>
          PRE-DEMO SYSTEM CHECK
        </div>
        <h2 style={{
          fontSize: 22,
          fontWeight: 700,
          color: "#F5F7FA",
          marginBottom: 8,
          textAlign: "center",
          fontFamily: "'Space Grotesk', sans-serif",
        }}>
          Verifying All Systems
        </h2>
        <p style={{
          color: "#8A8F98",
          fontSize: 13,
          marginBottom: 32,
          textAlign: "center",
          lineHeight: 1.6,
        }}>
          Running startup checks before the demo begins.
        </p>

        {/* Check Items */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
          {checks.map((check) => (
            <div
              key={check.name}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 18px",
                background: "rgba(255,255,255,0.03)",
                borderRadius: 10,
                border: `1px solid ${
                  check.status === "ok" ? "rgba(16,185,129,0.3)" :
                  check.status === "error" ? "rgba(239,68,68,0.3)" :
                  "rgba(255,255,255,0.06)"
                }`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 18 }}>{getStatusIcon(check.status)}</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#F5F7FA" }}>{check.name}</div>
                  {check.error && (
                    <div style={{ fontSize: 11, color: "#EF4444", marginTop: 2 }}>{check.error}</div>
                  )}
                </div>
              </div>
              {check.latencyMs !== undefined && check.status === "ok" && (
                <span style={{ fontSize: 11, color: "#6B7186" }}>{check.latencyMs}ms</span>
              )}
            </div>
          ))}
        </div>

        {/* Overall Status */}
        {overallStatus !== "checking" && (
          <div style={{
            textAlign: "center",
            marginBottom: 24,
            padding: "12px 20px",
            borderRadius: 10,
            background: overallStatus === "go"
              ? "rgba(16,185,129,0.1)"
              : "rgba(245,158,11,0.1)",
            border: `1px solid ${overallStatus === "go" ? "rgba(16,185,129,0.3)" : "rgba(245,158,11,0.3)"}`,
          }}>
            <span style={{
              fontSize: 14,
              fontWeight: 700,
              color: overallStatus === "go" ? "#10B981" : "#F59E0B",
              fontFamily: "'Orbitron', monospace",
            }}>
              {overallStatus === "go" ? "ALL SYSTEMS GO" : "ISSUES FLAGGED"}
            </span>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={onReady}
          disabled={overallStatus === "checking"}
          style={{
            width: "100%",
            padding: "16px 40px",
            background: overallStatus === "checking"
              ? "rgba(255,255,255,0.1)"
              : overallStatus === "go"
              ? "linear-gradient(135deg, #10B981, #059669)"
              : "linear-gradient(135deg, #F59E0B, #D97706)",
            borderRadius: 10,
            border: "none",
            color: overallStatus === "checking" ? "#6B7186" : "#FFF",
            fontSize: 16,
            fontWeight: 600,
            cursor: overallStatus === "checking" ? "not-allowed" : "pointer",
            fontFamily: "'Orbitron', monospace",
          }}
        >
          {overallStatus === "checking"
            ? "Checking..."
            : overallStatus === "go"
            ? "Start Demo"
            : "Override & Start Demo"}
        </button>
      </div>
    </div>
  );
}
