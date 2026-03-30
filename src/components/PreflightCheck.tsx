'use client';

import { useEffect } from 'react';

interface CheckItem {
  id: string;
  label: string;
  fixHref: string;
  severity: 'blocker' | 'warning';
  configured: boolean;
}

export interface PreflightCheckProps {
  activePlaybooks: string[];
  onCanProceed: (ok: boolean) => void;
}

const CHECKS: CheckItem[] = [
  { id: 'vision-doc', label: 'Vision doc', fixHref: '/connections', severity: 'blocker', configured: false },
  { id: 'brand-doc', label: 'Brand doc', fixHref: '/connections', severity: 'blocker', configured: false },
  { id: 'ica-profile', label: 'ICA profile', fixHref: '/connections', severity: 'warning', configured: false },
];

export default function PreflightCheck({ activePlaybooks: _activePlaybooks, onCanProceed }: PreflightCheckProps) {
  const blockers = CHECKS.filter((c) => !c.configured && c.severity === 'blocker');
  const warnings = CHECKS.filter((c) => !c.configured && c.severity === 'warning');
  const allClear = blockers.length === 0 && warnings.length === 0;

  useEffect(() => {
    onCanProceed(blockers.length === 0);
  }, [blockers.length, onCanProceed]);

  if (allClear) return null;

  return (
    <div style={{ marginBottom: '16px' }}>
      {blockers.length > 0 && (
        <div style={{ marginBottom: '10px' }}>
          {blockers.map((item) => (
            <div
              key={item.id}
              style={{
                borderLeft: '3px solid #cc3333',
                background: '#fff5f5',
                padding: '10px 14px',
                marginBottom: '8px',
                borderRadius: '0 6px 6px 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ fontSize: '13px', color: '#cc3333', fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>
                {item.label} is not configured — required to generate
              </span>
              <a href={item.fixHref} style={{ fontSize: '12px', color: '#cc3333', fontFamily: 'Montserrat, sans-serif', fontWeight: 600, textDecoration: 'none', marginLeft: '16px', whiteSpace: 'nowrap' }}>
                Fix →
              </a>
            </div>
          ))}
        </div>
      )}

      {warnings.map((item) => (
        <div
          key={item.id}
          style={{
            borderLeft: '3px solid #e8a020',
            background: '#fffbf0',
            padding: '10px 14px',
            marginBottom: '8px',
            borderRadius: '0 6px 6px 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ fontSize: '13px', color: '#a06010', fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}>
            {item.label} not connected — output quality may be lower
          </span>
          <a href={item.fixHref} style={{ fontSize: '12px', color: '#a06010', fontFamily: 'Montserrat, sans-serif', fontWeight: 600, textDecoration: 'none', marginLeft: '16px', whiteSpace: 'nowrap' }}>
            Connect →
          </a>
        </div>
      ))}
    </div>
  );
}
