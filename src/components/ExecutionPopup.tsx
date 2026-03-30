'use client';

<<<<<<< HEAD
<<<<<<< HEAD
import { useState } from 'react';
import PreflightCheck from './PreflightCheck';
=======
import { useEffect, useState } from "react";
import type { PlaybookCard } from "./PlaybookSelector";
>>>>>>> origin/feature/keep-customers
=======
import { useState } from 'react';
import PreflightCheck from './PreflightCheck';
>>>>>>> origin/feature/settings-ai-team

interface OutputRow {
  type: 'copy' | 'image' | 'video';
  label: string;
  dotColor: string;
  toolName: string;
  count: string;
}

<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> origin/feature/settings-ai-team
const OUTPUT_ROWS: OutputRow[] = [
  { type: 'copy', label: 'Copy', dotColor: '#7c3aed', toolName: 'Claude', count: '7 captions' },
  { type: 'image', label: 'Image', dotColor: '#f97316', toolName: 'Nano Banana', count: '5 visuals' },
  { type: 'video', label: 'Video', dotColor: '#2563eb', toolName: 'HeyGen', count: '2 reels' },
];

export interface ExecutionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  activePlaybooks: string[];
}

export default function ExecutionPopup({ isOpen, onClose, activePlaybooks }: ExecutionPopupProps) {
<<<<<<< HEAD
=======
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
>>>>>>> origin/feature/keep-customers
  const [done, setDone] = useState(false);
  const [canProceed, setCanProceed] = useState(false);

<<<<<<< HEAD
=======
  const [done, setDone] = useState(false);
  const [canProceed, setCanProceed] = useState(false);

>>>>>>> origin/feature/settings-ai-team
  if (!isOpen) return null;

  const handleGenerate = () => {
    if (!canProceed) return;
    setDone(true);
  };

  const handleClose = () => {
    setDone(false);
    onClose();
  };
<<<<<<< HEAD
=======
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
>>>>>>> origin/feature/keep-customers

  const stepColor = (status: Step["status"]) => {
    if (status === "done") return "#10B981";
    if (status === "running") return "#F59E0B";
    return "#e0e0e0";
  };

  return (
    <>
<<<<<<< HEAD
      <div onClick={handleClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000 }} />
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', borderRadius: '16px 16px 0 0', padding: '32px 24px 40px', zIndex: 1001, maxWidth: '600px', margin: '0 auto', boxShadow: '0 -4px 32px rgba(0,0,0,0.12)', fontFamily: 'Montserrat, sans-serif' }}>
        <div style={{ width: '40px', height: '4px', background: '#e0e0e0', borderRadius: '2px', margin: '0 auto 24px' }} />
        {done ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#111', marginBottom: '8px', letterSpacing: '-0.02em' }}>Done</div>
            <div style={{ fontSize: '15px', color: '#555', marginBottom: '32px' }}>14 items in Inbox</div>
            <button onClick={handleClose} style={{ background: '#111', color: '#fff', border: 'none', borderRadius: '8px', padding: '14px 40px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Montserrat, sans-serif' }}>
=======
      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
          zIndex: 1000,
        }}
      />

      {/* Sheet */}
      <div
        style={{
<<<<<<< HEAD
=======

  return (
    <>
      <div onClick={handleClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000 }} />
      <div
        style={{
>>>>>>> origin/feature/settings-ai-team
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: '#fff',
          borderRadius: '16px 16px 0 0',
          padding: '32px 24px 40px',
          zIndex: 1001,
          maxWidth: '600px',
          margin: '0 auto',
          boxShadow: '0 -4px 32px rgba(0,0,0,0.12)',
          fontFamily: 'Montserrat, sans-serif',
        }}
      >
<<<<<<< HEAD
        {/* Handle bar */}
        <div
          style={{
            width: '40px',
            height: '4px',
            background: '#e0e0e0',
            borderRadius: '2px',
            margin: '0 auto 24px',
          }}
        />

        {done ? (
          /* Success state */
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
=======
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
>>>>>>> origin/feature/keep-customers
            <div
              style={{
<<<<<<< HEAD
                fontSize: '22px',
                fontWeight: 700,
                color: '#111',
                marginBottom: '8px',
                letterSpacing: '-0.02em',
              }}
            >
              Done
            </div>
            <div
              style={{
                fontSize: '15px',
                color: '#555',
                marginBottom: '32px',
              }}
            >
              14 items in Inbox
            </div>
            <button
              onClick={handleClose}
              style={{
                background: '#111',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '14px 40px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'Montserrat, sans-serif',
              }}
            >
>>>>>>> origin/feature/get-sales
=======
        <div style={{ width: '40px', height: '4px', background: '#e0e0e0', borderRadius: '2px', margin: '0 auto 24px' }} />

        {done ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#111', marginBottom: '8px', letterSpacing: '-0.02em' }}>
              Done
            </div>
            <div style={{ fontSize: '15px', color: '#555', marginBottom: '32px' }}>
              14 items in Inbox
            </div>
            <button onClick={handleClose} style={{ background: '#111', color: '#fff', border: 'none', borderRadius: '8px', padding: '14px 40px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Montserrat, sans-serif' }}>
>>>>>>> origin/feature/settings-ai-team
              View Inbox
            </button>
          </div>
        ) : (
          <>
<<<<<<< HEAD
<<<<<<< HEAD
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#111', marginBottom: '4px', letterSpacing: '-0.01em' }}>Generate Content</div>
            <div style={{ fontSize: '12px', color: '#999', marginBottom: '24px' }}>
              {activePlaybooks.length} playbook{activePlaybooks.length !== 1 ? 's' : ''} active
            </div>
            <PreflightCheck activePlaybooks={activePlaybooks} onCanProceed={setCanProceed} />
=======
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#111', marginBottom: '4px', letterSpacing: '-0.01em' }}>
              Generate Content
            </div>
            <div style={{ fontSize: '12px', color: '#999', marginBottom: '24px' }}>
              {activePlaybooks.length} playbook{activePlaybooks.length !== 1 ? 's' : ''} active
            </div>

            <PreflightCheck activePlaybooks={activePlaybooks} onCanProceed={setCanProceed} />

>>>>>>> origin/feature/settings-ai-team
            <div style={{ marginBottom: '24px' }}>
              {OUTPUT_ROWS.map((row) => (
                <div key={row.type} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: row.dotColor, flexShrink: 0 }} />
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#111', minWidth: '44px' }}>{row.label}</span>
                    <span style={{ fontSize: '13px', color: '#777' }}>{row.toolName}</span>
                  </div>
                  <span style={{ fontSize: '12px', color: '#999', fontWeight: 500 }}>{row.count}</span>
                </div>
              ))}
            </div>
<<<<<<< HEAD
            <button
              onClick={handleGenerate}
              disabled={!canProceed}
              style={{ display: 'block', width: '100%', background: canProceed ? '#111' : '#ccc', color: '#fff', border: 'none', borderRadius: '8px', padding: '16px', fontSize: '14px', fontWeight: 700, cursor: canProceed ? 'pointer' : 'not-allowed', fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em', transition: 'background 0.15s ease', marginBottom: '16px' }}
            >
              Generate
            </button>
            <p style={{ fontSize: '11px', color: '#bbb', textAlign: 'center', margin: 0, fontFamily: 'Montserrat, sans-serif' }}>
              AI tools from Settings
=======
            {/* Title */}
            <div
              style={{
                fontSize: '16px',
                fontWeight: 700,
                color: '#111',
                marginBottom: '4px',
                letterSpacing: '-0.01em',
              }}
            >
              Generate Content
            </div>
            <div
              style={{
                fontSize: '12px',
                color: '#999',
                marginBottom: '24px',
              }}
            >
              {activePlaybooks.length} playbook{activePlaybooks.length !== 1 ? 's' : ''} active
=======
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
>>>>>>> origin/feature/keep-customers
            </div>

            {/* Pre-flight check */}
            <PreflightCheck
              activePlaybooks={activePlaybooks}
              onCanProceed={setCanProceed}
            />

            {/* Output rows */}
            <div style={{ marginBottom: '24px' }}>
              {OUTPUT_ROWS.map((row) => (
                <div
                  key={row.type}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 0',
                    borderBottom: '1px solid #f0f0f0',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: row.dotColor,
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#111',
                        minWidth: '44px',
                      }}
                    >
                      {row.label}
                    </span>
                    <span
                      style={{
                        fontSize: '13px',
                        color: '#777',
                      }}
                    >
                      {row.toolName}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '12px',
                      color: '#999',
                      fontWeight: 500,
                    }}
                  >
                    {row.count}
                  </span>
                </div>
              ))}
            </div>

            {/* Generate button */}
=======

>>>>>>> origin/feature/settings-ai-team
            <button
              onClick={handleGenerate}
              disabled={!canProceed}
              style={{
                display: 'block',
                width: '100%',
                background: canProceed ? '#111' : '#ccc',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '16px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: canProceed ? 'pointer' : 'not-allowed',
                fontFamily: 'Montserrat, sans-serif',
                letterSpacing: '0.02em',
                transition: 'background 0.15s ease',
                marginBottom: '16px',
              }}
            >
              Generate
            </button>

<<<<<<< HEAD
            {/* Footer */}
            <p
              style={{
                fontSize: '11px',
                color: '#bbb',
                textAlign: 'center',
                margin: 0,
                fontFamily: 'Montserrat, sans-serif',
              }}
            >
              AI tools from Settings → Connections
>>>>>>> origin/feature/get-sales
=======
            <p style={{ fontSize: '11px', color: '#bbb', textAlign: 'center', margin: 0, fontFamily: 'Montserrat, sans-serif' }}>
              AI tools from Settings → Connections
>>>>>>> origin/feature/settings-ai-team
            </p>
          </>
        )}
      </div>
    </>
  );
}
