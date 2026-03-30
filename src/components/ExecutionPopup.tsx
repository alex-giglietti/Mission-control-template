'use client';

import { useState } from 'react';
import PreflightCheck from './PreflightCheck';

interface OutputRow {
  type: 'copy' | 'image' | 'video';
  label: string;
  dotColor: string;
  toolName: string;
  count: string;
}

const OUTPUT_ROWS: OutputRow[] = [
  { type: 'copy', label: 'Copy', dotColor: '#7c3aed', toolName: 'Claude', count: '7 captions' },
  { type: 'image', label: 'Image', dotColor: '#f97316', toolName: 'Nano Banana', count: '5 visuals' },
  { type: 'video', label: 'Video', dotColor: '#2563eb', toolName: 'HeyGen', count: '2 reels' },
];

import type { PlaybookCard } from './PlaybookSelector';

export interface ExecutionPopupProps {
  isOpen?: boolean;
  onClose: () => void;
  activePlaybooks?: string[];
  selectedPlaybooks?: PlaybookCard[];
}

export default function ExecutionPopup({ isOpen = true, onClose, activePlaybooks, selectedPlaybooks }: ExecutionPopupProps) {
  const resolvedPlaybooks = selectedPlaybooks?.map((p) => p.slug) ?? activePlaybooks ?? [];
  const [done, setDone] = useState(false);
  const [canProceed, setCanProceed] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = () => {
    if (!canProceed) return;
    setDone(true);
  };

  const handleClose = () => {
    setDone(false);
    onClose();
  };

  return (
    <>
      <div onClick={handleClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000 }} />
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', borderRadius: '16px 16px 0 0', padding: '32px 24px 40px', zIndex: 1001, maxWidth: '600px', margin: '0 auto', boxShadow: '0 -4px 32px rgba(0,0,0,0.12)', fontFamily: 'Montserrat, sans-serif' }}>
        <div style={{ width: '40px', height: '4px', background: '#e0e0e0', borderRadius: '2px', margin: '0 auto 24px' }} />
        {done ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#111', marginBottom: '8px', letterSpacing: '-0.02em' }}>Done</div>
            <div style={{ fontSize: '15px', color: '#555', marginBottom: '32px' }}>14 items in Inbox</div>
            <button onClick={handleClose} style={{ background: '#111', color: '#fff', border: 'none', borderRadius: '8px', padding: '14px 40px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Montserrat, sans-serif' }}>
              View Inbox
            </button>
          </div>
        ) : (
          <>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#111', marginBottom: '4px', letterSpacing: '-0.01em' }}>Generate Content</div>
            <div style={{ fontSize: '12px', color: '#999', marginBottom: '24px' }}>
              {resolvedPlaybooks.length} playbook{resolvedPlaybooks.length !== 1 ? 's' : ''} active
            </div>
            <PreflightCheck activePlaybooks={resolvedPlaybooks} onCanProceed={setCanProceed} />
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
            <button
              onClick={handleGenerate}
              disabled={!canProceed}
              style={{ display: 'block', width: '100%', background: canProceed ? '#111' : '#ccc', color: '#fff', border: 'none', borderRadius: '8px', padding: '16px', fontSize: '14px', fontWeight: 700, cursor: canProceed ? 'pointer' : 'not-allowed', fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em', transition: 'background 0.15s ease', marginBottom: '16px' }}
            >
              Generate
            </button>
            <p style={{ fontSize: '11px', color: '#bbb', textAlign: 'center', margin: 0, fontFamily: 'Montserrat, sans-serif' }}>
              AI tools from Settings
            </p>
          </>
        )}
      </div>
    </>
  );
}
