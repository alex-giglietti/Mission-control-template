"use client";

import { useState } from "react";
import PlaybookSelector from "@/components/PlaybookSelector";
import type { PlaybookCard } from "@/components/PlaybookSelector";
import PreflightCheck from "@/components/PreflightCheck";
import ExecutionPopup from "@/components/ExecutionPopup";

// ---------------------------------------------------------------------------
// Placeholder data
// ---------------------------------------------------------------------------

const KPI_DATA = [
  { label: "Active Clients", value: "142" },
  { label: "Referrals", value: "38" },
  { label: "Upsell Rate", value: "24%" },
  { label: "Churn", value: "3.1%" },
];

const DELIVER_CARDS: PlaybookCard[] = [
  {
    slug: "fulfill-onboarding",
    title: "Client onboarding sequence",
    description: "First 7 days after purchase",
  },
  {
    slug: "fulfill-welcome-email",
    title: "Welcome email series",
    description: "4-part brand welcome sequence",
  },
  {
    slug: "fulfill-kickoff",
    title: "Kickoff call booking",
    description: "Automated scheduler + reminder",
  },
];

const GROW_CARDS: PlaybookCard[] = [
  {
    slug: "grow-upsell",
    title: "Upsell sequence",
    description: "Identify and convert upgrade opportunities",
  },
  {
    slug: "grow-referral",
    title: "Referral program",
    description: "Ask + reward at peak happiness moment",
  },
  {
    slug: "grow-reengagement",
    title: "Re-engagement campaign",
    description: "Reactivate quiet clients",
  },
];

// ---------------------------------------------------------------------------
// Shared style tokens
// ---------------------------------------------------------------------------

const FONT = "Montserrat, sans-serif";

const sectionLabel: React.CSSProperties = {
  fontFamily: FONT,
  fontSize: 8,
  fontWeight: 700,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "#aaa",
  marginBottom: 10,
};

const sectionHeading: React.CSSProperties = {
  fontFamily: FONT,
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "#555",
  marginBottom: 14,
  paddingBottom: 10,
  borderBottom: "1px solid #f0f0f0",
};

// ---------------------------------------------------------------------------
// Create panel (inline dropdown)
// ---------------------------------------------------------------------------

const CREATE_OPTIONS = ["Email", "SMS", "Update"];

function CreatePanel({ onClose }: { onClose: () => void }) {
  return (
    <div
      style={{
        position: "absolute",
        top: 44,
        right: 0,
        background: "#fff",
        border: "1.5px solid #e5e5e5",
        borderRadius: 8,
        boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
        padding: "8px 0",
        minWidth: 160,
        zIndex: 100,
        fontFamily: FONT,
      }}
    >
      <div
        style={{
          fontSize: 8,
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "#bbb",
          padding: "6px 16px 10px",
        }}
      >
        Create New
      </div>
      {CREATE_OPTIONS.map((opt) => (
        <button
          key={opt}
          onClick={onClose}
          style={{
            display: "block",
            width: "100%",
            padding: "9px 16px",
            background: "none",
            border: "none",
            textAlign: "left",
            fontFamily: FONT,
            fontSize: 13,
            fontWeight: 500,
            color: "#111",
            cursor: "pointer",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.background = "#f7f7f7")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.background = "none")
          }
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function KeepCustomersPage() {
  const [deliverSelected, setDeliverSelected] = useState<PlaybookCard[]>([]);
  const [growSelected, setGrowSelected] = useState<PlaybookCard[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showPreflight, setShowPreflight] = useState(false);
  const [showExecution, setShowExecution] = useState(false);

  const allSelected = [...deliverSelected, ...growSelected];
  const canGenerate = allSelected.length > 0;

  return (
    <div
      style={{
        background: "#fff",
        minHeight: "100vh",
        fontFamily: FONT,
        color: "#111",
      }}
    >
      {/* ---------------------------------------------------------------- */}
      {/* Header                                                            */}
      {/* ---------------------------------------------------------------- */}
      <div
        style={{
          padding: "32px 40px 0",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div style={sectionLabel}>Grow</div>
          <h1
            style={{
              fontFamily: FONT,
              fontSize: 28,
              fontWeight: 800,
              color: "#111",
              margin: "0 0 6px",
              letterSpacing: "-0.01em",
            }}
          >
            Keep Customers
          </h1>
          <p
            style={{
              fontFamily: FONT,
              fontSize: 14,
              color: "#777",
              margin: 0,
              fontWeight: 400,
            }}
          >
            Turn sales into happy customers, upsells, and referrals.
          </p>
        </div>

        {/* + Create */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowCreate((v) => !v)}
            style={{
              padding: "9px 18px",
              borderRadius: 6,
              border: "1.5px solid #e0e0e0",
              background: "#fff",
              color: "#111",
              fontFamily: FONT,
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              letterSpacing: "0.02em",
            }}
          >
            + Create
          </button>
          {showCreate && (
            <CreatePanel onClose={() => setShowCreate(false)} />
          )}
        </div>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* Training video bar                                                */}
      {/* ---------------------------------------------------------------- */}
      <div
        style={{
          margin: "24px 40px 0",
          background: "#f9f9f9",
          border: "1px solid #ebebeb",
          borderRadius: 8,
          padding: "12px 18px",
          fontSize: 13,
          color: "#444",
          fontWeight: 500,
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        <span
          style={{
            fontSize: 8,
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#bbb",
            flexShrink: 0,
          }}
        >
          Watch
        </span>
        <span>The delivery-to-referral loop (Joseph, 2 min)</span>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* KPI row                                                           */}
      {/* ---------------------------------------------------------------- */}
      <div
        style={{
          margin: "24px 40px 0",
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 14,
        }}
      >
        {KPI_DATA.map((kpi) => (
          <div
            key={kpi.label}
            style={{
              background: "#fafafa",
              border: "1px solid #ebebeb",
              borderRadius: 8,
              padding: "18px 20px",
            }}
          >
            <div
              style={{
                fontSize: 8,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#bbb",
                marginBottom: 8,
              }}
            >
              {kpi.label}
            </div>
            <div
              style={{
                fontSize: 26,
                fontWeight: 800,
                color: "#111",
                letterSpacing: "-0.02em",
              }}
            >
              {kpi.value}
            </div>
          </div>
        ))}
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* DELIVER section                                                   */}
      {/* ---------------------------------------------------------------- */}
      <div style={{ margin: "36px 40px 0" }}>
        <div style={sectionHeading}>Deliver — Fulfill Your Promise</div>
        <PlaybookSelector
          slugPrefix="fulfill-"
          placeholderCards={DELIVER_CARDS}
          onSelectionChange={setDeliverSelected}
        />
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* GROW section                                                      */}
      {/* ---------------------------------------------------------------- */}
      <div style={{ margin: "36px 40px 0" }}>
        <div style={sectionHeading}>Grow — Upsell and Expand</div>
        <PlaybookSelector
          slugPrefix="grow-"
          placeholderCards={GROW_CARDS}
          onSelectionChange={setGrowSelected}
        />
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* Bottom generate bar                                               */}
      {/* ---------------------------------------------------------------- */}
      <div
        style={{
          margin: "40px 40px 0",
          borderTop: "1px solid #f0f0f0",
          paddingTop: 20,
          paddingBottom: 48,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <div style={{ fontSize: 13, color: "#777", fontWeight: 500 }}>
          {allSelected.length === 0 ? (
            <span style={{ color: "#ccc" }}>No playbooks selected</span>
          ) : (
            <>
              <span style={{ fontWeight: 700, color: "#111" }}>
                {allSelected.length} playbook
                {allSelected.length !== 1 ? "s" : ""}
              </span>{" "}
              selected:{" "}
              <span style={{ color: "#555" }}>
                {allSelected.map((p) => p.title).join(", ")}
              </span>
            </>
          )}
        </div>

        <button
          onClick={() => canGenerate && setShowPreflight(true)}
          disabled={!canGenerate}
          style={{
            padding: "11px 28px",
            borderRadius: 6,
            border: "none",
            background: canGenerate ? "#111" : "#e0e0e0",
            color: canGenerate ? "#fff" : "#999",
            fontFamily: FONT,
            fontSize: 13,
            fontWeight: 700,
            cursor: canGenerate ? "pointer" : "not-allowed",
            letterSpacing: "0.03em",
            transition: "all 0.15s ease",
            flexShrink: 0,
          }}
        >
          Generate
        </button>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* Modals                                                            */}
      {/* ---------------------------------------------------------------- */}
      {showPreflight && (
        <PreflightCheck
          selectedPlaybooks={allSelected}
          onConfirm={() => {
            setShowPreflight(false);
            setShowExecution(true);
          }}
          onCancel={() => setShowPreflight(false)}
        />
      )}

      {showExecution && (
        <ExecutionPopup
          selectedPlaybooks={allSelected}
          onClose={() => setShowExecution(false)}
        />
      )}
    </div>
  );
}
