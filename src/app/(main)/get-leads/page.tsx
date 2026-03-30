'use client';

import { useState, useCallback } from 'react';
import PlaybookSelector from '@/components/PlaybookSelector';
import PreflightCheck from '@/components/PreflightCheck';
import ExecutionPopup from '@/components/ExecutionPopup';

interface KpiCard {
  label: string;
  value: string;
  sub?: string;
}

const KPI_CARDS: KpiCard[] = [
  { label: 'Views', value: '24,810', sub: 'last 30d' },
  { label: 'Leads', value: '312', sub: 'last 30d' },
  { label: 'Cost / Lead', value: '$4.20', sub: 'avg' },
  { label: 'Best Source', value: 'FB Ads', sub: 'most leads' },
];

const SECTIONS = [
  { slugPrefix: 'publish-', sectionLabel: 'CONTENT — GET SEEN EVERY DAY' },
  { slugPrefix: 'prospect-', sectionLabel: 'PROSPECTING — REACH NEW PEOPLE' },
  { slugPrefix: 'pay-', sectionLabel: 'PAID ADS — BUY ATTENTION' },
  { slugPrefix: 'partner-', sectionLabel: 'PARTNERSHIPS — LEVERAGE OTHER AUDIENCES' },
];

const CREATE_STEPS = [
  { id: 'what', label: 'What are you promoting?', placeholder: 'e.g. AI Monetizations Live webinar' },
  { id: 'where', label: 'Where will it run?', placeholder: 'e.g. Instagram, email, YouTube Shorts' },
  { id: 'message', label: 'What should it say?', placeholder: 'e.g. Show how AI can replace your team and save $10k/mo' },
  { id: 'face', label: "Who's the face?", placeholder: 'e.g. Joseph Aaron' },
];

const labelStyle: React.CSSProperties = {
  fontSize: '8px',
  fontWeight: 700,
  color: '#999',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  fontFamily: 'Montserrat, sans-serif',
  marginBottom: '10px',
  display: 'block',
};

export default function GetLeadsPage() {
  const [activeByPrefix, setActiveByPrefix] = useState<Record<string, string[]>>({});
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [preflightVisible, setPreflightVisible] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);
  const [canProceed, setCanProceed] = useState(false);
  const [createPanelOpen, setCreatePanelOpen] = useState(false);
  const [createStep, setCreateStep] = useState(0);
  const [createFields, setCreateFields] = useState<Record<string, string>>({});
  const [createDone, setCreateDone] = useState(false);

  const allActiveSlugs = Object.values(activeByPrefix).flat();
  const activeCount = allActiveSlugs.length;

  const activeSummary = (() => {
    if (activeCount === 0) return 'No playbooks active';
    const names = allActiveSlugs
      .map((slug) => slug.split('-').slice(1).join(' '))
      .map((n) => n.charAt(0).toUpperCase() + n.slice(1));
    if (names.length <= 2) return `${activeCount} playbook${activeCount !== 1 ? 's' : ''} active · ${names.join(' + ')}`;
    return `${activeCount} playbooks active · ${names[0]} + ${names[1]} + ${activeCount - 2} more`;
  })();

  const handleActiveChange = useCallback((prefix: string, slugs: string[]) => {
    setActiveByPrefix((prev) => ({ ...prev, [prefix]: slugs }));
  }, []);

  const handleGenerateClick = () => {
    setPreflightVisible(true);
    if (canProceed) setPopupOpen(true);
  };

  const handleCanProceed = useCallback((ok: boolean) => {
    setCanProceed(ok);
    if (ok && preflightVisible) setPopupOpen(true);
  }, [preflightVisible]);

  const handleCreateNext = () => {
    if (createStep < CREATE_STEPS.length - 1) {
      setCreateStep((s) => s + 1);
    } else {
      setCreateDone(true);
    }
  };

  const handleCreateClose = () => {
    setCreatePanelOpen(false);
    setCreateStep(0);
    setCreateFields({});
    setCreateDone(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'Montserrat, sans-serif', paddingBottom: '100px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 24px 0' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={labelStyle}>GROW</span>
          <button
            onClick={() => setCreatePanelOpen(true)}
            style={{ background: '#111', color: '#fff', border: 'none', borderRadius: '6px', padding: '8px 16px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em' }}
          >
            + Create
          </button>
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#111', margin: '0 0 8px', letterSpacing: '-0.03em' }}>
          Get Leads
        </h1>
        <p style={{ fontSize: '14px', color: '#777', margin: '0 0 32px', lineHeight: '1.5' }}>
          Turn views into leads. Pick a playbook. Click generate. AI does the rest.
        </p>

        {/* Training video bar */}
        <div
          onClick={() => setVideoPlaying((v) => !v)}
          style={{ background: '#f5f5f5', borderRadius: '8px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '32px', cursor: 'pointer', userSelect: 'none' }}
        >
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {videoPlaying ? (
              <div style={{ display: 'flex', gap: '3px' }}>
                <div style={{ width: '3px', height: '12px', background: '#fff', borderRadius: '1px' }} />
                <div style={{ width: '3px', height: '12px', background: '#fff', borderRadius: '1px' }} />
              </div>
            ) : (
              <div style={{ width: 0, height: 0, borderTop: '6px solid transparent', borderBottom: '6px solid transparent', borderLeft: '10px solid #fff', marginLeft: '2px' }} />
            )}
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#111' }}>
              {videoPlaying ? 'Playing...' : 'Watch: How the 4 lead methods work (Joseph, 2 min)'}
            </div>
            {videoPlaying && <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>Click to pause</div>}
          </div>
        </div>

        {/* KPI row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '40px' }}>
          {KPI_CARDS.map((kpi) => (
            <div key={kpi.label} style={{ border: '1px solid #e8e8e8', borderRadius: '8px', padding: '16px' }}>
              <div style={{ fontSize: '8px', fontWeight: 700, color: '#bbb', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
                {kpi.label}
              </div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#111', letterSpacing: '-0.03em' }}>
                {kpi.value}
              </div>
              {kpi.sub && <div style={{ fontSize: '11px', color: '#bbb', marginTop: '2px' }}>{kpi.sub}</div>}
            </div>
          ))}
        </div>

        {/* Playbook sections */}
        {SECTIONS.map(({ slugPrefix, sectionLabel }) => (
          <div key={slugPrefix} style={{ marginBottom: '40px' }}>
            <span style={labelStyle}>{sectionLabel}</span>
            <PlaybookSelector
              slugPrefix={slugPrefix}
              title={sectionLabel}
              onActiveChange={(slugs: string[]) => handleActiveChange(slugPrefix, slugs)}
            />
          </div>
        ))}

        {preflightVisible && !popupOpen && (
          <div style={{ marginBottom: '80px' }}>
            <PreflightCheck activePlaybooks={allActiveSlugs} onCanProceed={handleCanProceed} />
          </div>
        )}
      </div>

      {/* Sticky bottom generate bar */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', borderTop: '1px solid #e8e8e8', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 100, fontFamily: 'Montserrat, sans-serif' }}>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#111' }}>{activeSummary}</div>
          {activeCount === 0 && <div style={{ fontSize: '11px', color: '#bbb', marginTop: '2px' }}>Select a playbook above to get started</div>}
        </div>
        <button
          onClick={handleGenerateClick}
          disabled={activeCount === 0}
          style={{ background: activeCount > 0 ? '#111' : '#ccc', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px 28px', fontSize: '14px', fontWeight: 700, cursor: activeCount > 0 ? 'pointer' : 'not-allowed', fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em', transition: 'background 0.15s ease' }}
        >
          Generate
        </button>
      </div>

      {/* Execution popup */}
      <ExecutionPopup
        isOpen={popupOpen}
        onClose={() => { setPopupOpen(false); setPreflightVisible(false); }}
        activePlaybooks={allActiveSlugs}
      />

      {/* Quick Create panel */}
      {createPanelOpen && (
        <>
          <div onClick={handleCreateClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 200 }} />
          <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '420px', maxWidth: '100vw', background: '#fff', zIndex: 201, padding: '40px 32px', overflowY: 'auto', fontFamily: 'Montserrat, sans-serif', boxShadow: '-4px 0 32px rgba(0,0,0,0.1)' }}>
            <button onClick={handleCreateClose} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#999', fontFamily: 'Montserrat, sans-serif', lineHeight: 1 }} aria-label="Close">
              x
            </button>
            <span style={labelStyle}>QUICK CREATE</span>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#111', margin: '0 0 32px', letterSpacing: '-0.02em' }}>
              New Content
            </h2>
            {createDone ? (
              <div style={{ textAlign: 'center', paddingTop: '40px' }}>
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#111', marginBottom: '8px' }}>Sent to Inbox</div>
                <div style={{ fontSize: '14px', color: '#777', marginBottom: '32px' }}>Your content is generating.</div>
                <button onClick={handleCreateClose} style={{ background: '#111', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px 28px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Montserrat, sans-serif' }}>
                  View Inbox
                </button>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '32px' }}>
                  {CREATE_STEPS.map((_, i) => (
                    <div key={i} style={{ flex: 1, height: '3px', borderRadius: '2px', background: i <= createStep ? '#111' : '#e0e0e0', transition: 'background 0.2s' }} />
                  ))}
                </div>
                {CREATE_STEPS.map((step, i) => (
                  <div key={step.id} style={{ display: i === createStep ? 'block' : 'none' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#555', marginBottom: '10px', fontFamily: 'Montserrat, sans-serif' }}>
                      {step.label}
                    </label>
                    <textarea
                      value={createFields[step.id] ?? ''}
                      onChange={(e) => setCreateFields((f) => ({ ...f, [step.id]: e.target.value }))}
                      placeholder={step.placeholder}
                      rows={4}
                      style={{ width: '100%', border: '1.5px solid #e0e0e0', borderRadius: '8px', padding: '12px', fontSize: '13px', fontFamily: 'Montserrat, sans-serif', color: '#111', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                ))}
                <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {createStep > 0 ? (
                    <button onClick={() => setCreateStep((s) => s - 1)} style={{ background: 'none', border: '1.5px solid #e0e0e0', borderRadius: '6px', padding: '10px 18px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', color: '#555', fontFamily: 'Montserrat, sans-serif' }}>
                      Back
                    </button>
                  ) : <div />}
                  <button onClick={handleCreateNext} style={{ background: '#111', color: '#fff', border: 'none', borderRadius: '6px', padding: '10px 24px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Montserrat, sans-serif' }}>
                    {createStep < CREATE_STEPS.length - 1 ? 'Next' : 'Generate to Inbox'}
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
