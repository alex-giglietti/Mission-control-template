'use client';

import { useEffect, useState } from 'react';
import type { PlaybookCard } from './PlaybookSelector';

interface CheckItem {
  id: string;
  label: string;
  fixHref: string;
  severity: 'blocker' | 'warning';
  configured: boolean;
}

// Unified props supporting both get-leads and keep-customers styles
export interface PreflightCheckProps {
  // get-leads style
  activePlaybooks?: string[];
  onCanProceed?: (ok: boolean) => void;
  // keep-customers style
  selectedPlaybooks?: PlaybookCard[];
  onConfirm?: () => void;
  onCancel?: () => void;
}

const CHECKS: CheckItem[] = [
  { id: 'vision-doc', label: 'Vision doc', fixHref: '/connections', severity: 'blocker', configured: false },
  { id: 'brand-doc', label: 'Brand doc', fixHref: '/connections', severity: 'blocker', configured: false },
  { id: 'ica-profile', label: 'ICA profile', fixHref: '/connections', severity: 'warning', configured: false },
];

const MODAL_CHECKS = [
  'Contact list is up to date',
  'Email sequences are active',
  'CRM integrations are connected',
];

export default function PreflightCheck({
  activePlaybooks: _activePlaybooks,
  onCanProceed,
  selectedPlaybooks,
  onConfirm,
  onCancel,
}: PreflightCheckProps) {
  // Modal mode (keep-customers): if selectedPlaybooks + onConfirm provided
  const isModalMode = selectedPlaybooks !== undefined || onConfirm !== undefined;
  const [confirmed, setConfirmed] = useState(false);

  const blockers = CHECKS.filter((c) => !c.configured && c.severity === 'blocker');
  const warnings = CHECKS.filter((c) => !c.configured && c.severity === 'warning');

  useEffect(() => {
    if (!isModalMode) {
      onCanProceed?.(blockers.length === 0);
    }
  }, [blockers.length, onCanProceed, isModalMode]);

  if (isModalMode) {
    // Modal overlay style (keep-customers)
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}
      >
        <div
          style={{
            background: '#fff',
            borderRadius: 10,
            padding: '32px',
            maxWidth: 480,
            width: '90%',
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          }}
        >
          <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 18, marginBottom: 16 }}>
            Pre-Flight Check
          </h2>
          {selectedPlaybooks && selectedPlaybooks.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 13, color: '#555', marginBottom: 8 }}>
                Selected playbooks: {selectedPlaybooks.map((p) => p.title).join(', ')}
              </p>
            </div>
          )}
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px 0' }}>
            {MODAL_CHECKS.map((check) => (
              <li key={check} style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 13, color: '#333', padding: '6px 0', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: '#10b981', fontWeight: 700 }}>✓</span>
                {check}
              </li>
            ))}
          </ul>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
            />
            <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 13, color: '#333' }}>
              I confirm everything is ready
            </span>
          </label>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={onCancel}
              style={{ flex: 1, padding: '10px', border: '1.5px solid #e0e0e0', borderRadius: 6, background: '#fff', cursor: 'pointer', fontFamily: 'Montserrat, sans-serif', fontSize: 13 }}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={!confirmed}
              style={{ flex: 1, padding: '10px', border: 'none', borderRadius: 6, background: confirmed ? '#111' : '#ccc', color: '#fff', cursor: confirmed ? 'pointer' : 'not-allowed', fontFamily: 'Montserrat, sans-serif', fontSize: 13, fontWeight: 600 }}
            >
              Launch
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Inline mode (get-leads)
  if (blockers.length === 0 && warnings.length === 0) return null;

  return (
    <div style={{ marginBottom: '16px' }}>
      {blockers.length > 0 && (
        <div style={{ marginBottom: '10px' }}>
          {blockers.map((item) => (
            <div key={item.id} style={{ borderLeft: '3px solid #cc3333', background: '#fff5f5', padding: '10px 14px', marginBottom: '8px', borderRadius: '0 6px 6px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', color: '#cc3333', fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>
                {item.label} is not configured — required to generate
              </span>
              <a href={item.fixHref} style={{ fontSize: '12px', color: '#cc3333', fontFamily: 'Montserrat, sans-serif', fontWeight: 600, textDecoration: 'none', marginLeft: '16px', whiteSpace: 'nowrap' }}>
                Fix
              </a>
            </div>
          ))}
        </div>
      )}
      {warnings.map((item) => (
        <div key={item.id} style={{ borderLeft: '3px solid #e8a020', background: '#fffbf0', padding: '10px 14px', marginBottom: '8px', borderRadius: '0 6px 6px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '13px', color: '#a06010', fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}>
            {item.label} not connected — output quality may be lower
          </span>
          <a href={item.fixHref} style={{ fontSize: '12px', color: '#a06010', fontFamily: 'Montserrat, sans-serif', fontWeight: 600, textDecoration: 'none', marginLeft: '16px', whiteSpace: 'nowrap' }}>
            Connect
          </a>
        </div>
      ))}
    </div>
  );
}
