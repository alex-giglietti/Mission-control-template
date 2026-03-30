"use client";

import { useState } from "react";
import type { PlaybookCard } from "./PlaybookSelector";

interface PreflightCheckProps {
  selectedPlaybooks: PlaybookCard[];
  onConfirm: () => void;
  onCancel: () => void;
}

const CHECKS = [
  "Contact list is up to date",
  "Email sequences are active",
  "CRM integrations are connected",
];

export default function PreflightCheck({
  selectedPlaybooks,
  onConfirm,
  onCancel,
}: PreflightCheckProps) {
  const [confirmed, setConfirmed] = useState(false);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
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
          Pre-Flight Check
        </div>

        <div
          style={{ fontSize: 18, fontWeight: 800, color: "#111", marginBottom: 6 }}
        >
          Ready to generate?
        </div>
        <div style={{ fontSize: 13, color: "#555", marginBottom: 24 }}>
          {selectedPlaybooks.length} playbook
          {selectedPlaybooks.length !== 1 ? "s" : ""} selected:{" "}
          <span style={{ fontWeight: 700, color: "#111" }}>
            {selectedPlaybooks.map((p) => p.title).join(", ")}
          </span>
        </div>

        {/* Checks */}
        <div style={{ marginBottom: 24 }}>
          {CHECKS.map((c, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 0",
                borderBottom:
                  i < CHECKS.length - 1 ? "1px solid #f0f0f0" : "none",
                fontSize: 13,
                color: "#333",
              }}
            >
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 3,
                  background: "#10B981",
                  flexShrink: 0,
                }}
              />
              {c}
            </div>
          ))}
        </div>

        {/* Confirm checkbox */}
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 13,
            color: "#333",
            cursor: "pointer",
            marginBottom: 24,
            userSelect: "none",
          }}
        >
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            style={{ accentColor: "#111", width: 14, height: 14, cursor: "pointer" }}
          />
          I confirm all settings are correct and ready to execute
        </label>

        {/* Actions */}
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: "11px 0",
              borderRadius: 6,
              border: "1.5px solid #e0e0e0",
              background: "#fff",
              color: "#555",
              fontFamily: "Montserrat, sans-serif",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!confirmed}
            style={{
              flex: 2,
              padding: "11px 0",
              borderRadius: 6,
              border: "none",
              background: confirmed ? "#111" : "#e0e0e0",
              color: confirmed ? "#fff" : "#999",
              fontFamily: "Montserrat, sans-serif",
              fontSize: 13,
              fontWeight: 700,
              cursor: confirmed ? "pointer" : "not-allowed",
              transition: "all 0.15s ease",
            }}
          >
            Execute
          </button>
        </div>
      </div>
    </div>
  );
}
