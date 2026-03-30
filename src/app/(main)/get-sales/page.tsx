'use client';

import { useState, useCallback } from 'react';
import PlaybookSelector from '@/components/PlaybookSelector';
import PreflightCheck from '@/components/PreflightCheck';
import ExecutionPopup from '@/components/ExecutionPopup';

// ─── Types ────────────────────────────────────────────────────────────────────

interface KpiItem {
  label: string;
  value: string;
  sub?: string;
}

// ─── Static data ──────────────────────────────────────────────────────────────

const KPI_CARDS: KpiItem[] = [
  { label: 'Pipeline',        value: '$48,200', sub: 'open deals'    },
  { label: 'Sales',           value: '$12,500', sub: 'last 30d'      },
  { label: 'Conversion',      value: '26%',     sub: 'lead → buyer'  },
  { label: 'Avg Order Value', value: '$1,042',  sub: 'per sale'      },
];

const SECTIONS = [
  { slugPrefix: 'nurture-',      sectionLabel: 'NURTURE — WARM LEADS UNTIL THEY BUY' },
  { slugPrefix: 'profit-cart-',  sectionLabel: 'CLICK — SELL FROM A PAGE'            },
  { slugPrefix: 'profit-call-',  sectionLabel: 'CALL — SELL FROM A CONVERSATION'     },
  { slugPrefix: 'profit-crowd-', sectionLabel: 'CROWD — SELL FROM A STAGE'           },
];

const CREATE_STEPS = [
  { id: 'type',    label: 'What are you creating?',   placeholder: 'e.g. Email, SMS, or Landing page' },
  { id: 'offer',   label: 'What is the offer?',        placeholder: 'e.g. AI Monetizations Live — $2,997' },
  { id: 'message', label: 'What should it say?',       placeholder: 'e.g. Here is why this works for your situation...' },
  { id: 'cta',     label: 'What is the call to action?', placeholder: 'e.g. Book a call, Buy now, Watch the demo' },
];

// ─── Styles ───────────────────────────────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  fontSize: '8px',
  fontWeight: '700',
  color: '#999',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  fontFamily: 'Montserrat, sans-serif',
  marginBottom: '10px',
  display: 'block',
};

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function GetSalesPage() {
  // Active playbooks per section
  const [activeByPrefix, setActiveByPrefix] = useState<Record<string, string[]>>({});

  // Video bar
  const [videoPlaying, setVideoPlaying] = useState(false);

  // Bottom bar / popup state
  const [preflightVisible, setPreflightVisible] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);
  const [canProceed, setCanProceed] = useState(false);

  // Quick Create panel
  const [createPanelOpen, setCreatePanelOpen] = useState(false);
  const [createStep, setCreateStep] = useState(0);
  const [createFields, setCreateFields] = useState<Record<string, string>>({});
  const [createDone, setCreateDone] = useState(false);

  // Collect all active slugs
  const allActiveSlugs = Object.values(activeByPrefix).flat();
  const activeCount = allActiveSlugs.length;

  // Short summary of active playbooks for the bottom bar
  const activeSummary = (() => {
    if (activeCount === 0) return 'No playbooks active';
    const names = allActiveSlugs
      .map((slug) => slug.split('-').slice(1).join(' '))
      .map((n) => n.charAt(0).toUpperCase() + n.slice(1));
    if (names.length <= 2)
      return `${activeCount} playbook${activeCount !== 1 ? 's' : ''} active · ${names.join(' + ')}`;
    return `${activeCount} playbooks active · ${names[0]} + ${names[1]} + ${activeCount - 2} more`;
  })();

  const handleActiveChange = useCallback((prefix: string, slugs: string[]) => {
    setActiveByPrefix((prev) => ({ ...prev, [prefix]: slugs }));
  }, []);

  const handleGenerateClick = () => {
    setPreflightVisible(true);
    if (canProceed) setPopupOpen(true);
  };

  const handleCanProceed = useCallback(
    (ok: boolean) => {
      setCanProceed(ok);
      if (ok && preflightVisible) setPopupOpen(true);
    },
    [preflightVisible]
  );

  // Create panel handlers
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
    <div
      style={{
        minHeight: '100vh',
        background: '#fff',
        fontFamily: 'Montserrat, sans-serif',
        paddingBottom: '100px',
      }}
    >
      {/* ── Main content ── */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 24px 0' }}>

        {/* ── Header ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: '8px',
          }}
        >
          <span style={labelStyle}>GROW</span>
          <button
            onClick={() => setCreatePanelOpen(true)}
            style={{
              background: '#111',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              fontFamily: 'Montserrat, sans-serif',
              letterSpacing: '0.02em',
            }}
          >
            + Create
          </button>
        </div>

        <h1
          style={{
            fontSize: '28px',
            fontWeight: '800',
            color: '#111',
            margin: '0 0 8px',
            letterSpacing: '-0.03em',
          }}
        >
          Get Sales
        </h1>
        <p
          style={{
            fontSize: '14px',
            color: '#777',
            margin: '0 0 32px',
            lineHeight: '1.5',
          }}
        >
          Turn leads into buyers. Pick how you sell.
        </p>

        {/* ── Training video bar ── */}
        <div
          onClick={() => setVideoPlaying((v) => !v)}
          style={{
            background: '#f5f5f5',
            borderRadius: '8px',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            marginBottom: '32px',
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          {/* Play / Pause button */}
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: '#111',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {videoPlaying ? (
              <div style={{ display: 'flex', gap: '3px' }}>
                <div style={{ width: '3px', height: '12px', background: '#fff', borderRadius: '1px' }} />
                <div style={{ width: '3px', height: '12px', background: '#fff', borderRadius: '1px' }} />
              </div>
            ) : (
              <div
                style={{
                  width: 0,
                  height: 0,
                  borderTop: '6px solid transparent',
                  borderBottom: '6px solid transparent',
                  borderLeft: '10px solid #fff',
                  marginLeft: '2px',
                }}
              />
            )}
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#111' }}>
              {videoPlaying
                ? 'Playing...'
                : 'Watch: Click, Call, or Crowd \u2014 choosing your sales method (Joseph, 3 min)'}
            </div>
            {videoPlaying && (
              <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>Click to pause</div>
            )}
          </div>
        </div>

        {/* ── KPI row ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '12px',
            marginBottom: '40px',
          }}
        >
          {KPI_CARDS.map((kpi) => (
            <div
              key={kpi.label}
              style={{
                border: '1px solid #e8e8e8',
                borderRadius: '8px',
                padding: '16px',
              }}
            >
              <div
                style={{
                  fontSize: '8px',
                  fontWeight: '700',
                  color: '#bbb',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginBottom: '8px',
                }}
              >
                {kpi.label}
              </div>
              <div
                style={{
                  fontSize: '22px',
                  fontWeight: '800',
                  color: '#111',
                  letterSpacing: '-0.03em',
                }}
              >
                {kpi.value}
              </div>
              {kpi.sub && (
                <div style={{ fontSize: '11px', color: '#bbb', marginTop: '2px' }}>
                  {kpi.sub}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ── Playbook sections ── */}
        {SECTIONS.map(({ slugPrefix, sectionLabel }) => (
          <div key={slugPrefix} style={{ marginBottom: '40px' }}>
            <span style={labelStyle}>{sectionLabel}</span>
            <PlaybookSelector
              slugPrefix={slugPrefix}
              title={sectionLabel}
              onActiveChange={(slugs) => handleActiveChange(slugPrefix, slugs)}
            />
          </div>
        ))}

        {/* Pre-flight (inline above generate bar when triggered) */}
        {preflightVisible && !popupOpen && (
          <div style={{ marginBottom: '80px' }}>
            <PreflightCheck
              activePlaybooks={allActiveSlugs}
              onCanProceed={handleCanProceed}
            />
          </div>
        )}
      </div>

      {/* ── Sticky bottom generate bar ── */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: '#fff',
          borderTop: '1px solid #e8e8e8',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 100,
          fontFamily: 'Montserrat, sans-serif',
        }}
      >
        <div>
          <div style={{ fontSize: '13px', fontWeight: '600', color: '#111' }}>
            {activeSummary}
          </div>
          {activeCount === 0 && (
            <div style={{ fontSize: '11px', color: '#bbb', marginTop: '2px' }}>
              Select a playbook above to get started
            </div>
          )}
        </div>
        <button
          onClick={handleGenerateClick}
          disabled={activeCount === 0}
          style={{
            background: activeCount > 0 ? '#111' : '#ccc',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 28px',
            fontSize: '14px',
            fontWeight: '700',
            cursor: activeCount > 0 ? 'pointer' : 'not-allowed',
            fontFamily: 'Montserrat, sans-serif',
            letterSpacing: '0.02em',
            transition: 'background 0.15s ease',
          }}
        >
          Generate
        </button>
      </div>

      {/* ── Execution popup ── */}
      <ExecutionPopup
        isOpen={popupOpen}
        onClose={() => {
          setPopupOpen(false);
          setPreflightVisible(false);
        }}
        activePlaybooks={allActiveSlugs}
      />

      {/* ── Quick Create panel ── */}
      {createPanelOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={handleCreateClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.3)',
              zIndex: 200,
            }}
          />

          {/* Slide-in panel */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: '420px',
              maxWidth: '100vw',
              background: '#fff',
              zIndex: 201,
              padding: '40px 32px',
              overflowY: 'auto',
              fontFamily: 'Montserrat, sans-serif',
              boxShadow: '-4px 0 32px rgba(0,0,0,0.1)',
            }}
          >
            {/* Close button */}
            <button
              onClick={handleCreateClose}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'none',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                color: '#999',
                lineHeight: 1,
                padding: '4px',
              }}
              aria-label="Close"
            >
              &times;
            </button>

            {createDone ? (
              /* ── Success ── */
              <div style={{ paddingTop: '40px', textAlign: 'center' }}>
                <div
                  style={{
                    fontSize: '22px',
                    fontWeight: '800',
                    color: '#111',
                    marginBottom: '8px',
                    letterSpacing: '-0.02em',
                  }}
                >
                  Created
                </div>
                <p style={{ fontSize: '14px', color: '#777', marginBottom: '32px' }}>
                  Your sales asset has been added.
                </p>
                <button
                  onClick={handleCreateClose}
                  style={{
                    background: '#111',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px 32px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontFamily: 'Montserrat, sans-serif',
                  }}
                >
                  Done
                </button>
              </div>
            ) : (
              /* ── Steps ── */
              <>
                <span style={labelStyle}>
                  Step {createStep + 1} of {CREATE_STEPS.length}
                </span>
                <h2
                  style={{
                    fontSize: '20px',
                    fontWeight: '800',
                    color: '#111',
                    margin: '0 0 24px',
                    letterSpacing: '-0.02em',
                    lineHeight: '1.3',
                  }}
                >
                  {CREATE_STEPS[createStep].label}
                </h2>

                {/* Asset type buttons on step 0 */}
                {createStep === 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                    {(['Email', 'SMS', 'Landing page'] as const).map((opt) => (
                      <button
                        key={opt}
                        onClick={() => {
                          setCreateFields((prev) => ({ ...prev, type: opt }));
                        }}
                        style={{
                          padding: '14px 18px',
                          border:
                            createFields.type === opt
                              ? '2px solid #111'
                              : '1.5px solid #e0e0e0',
                          borderRadius: '8px',
                          background: createFields.type === opt ? '#111' : '#fff',
                          color: createFields.type === opt ? '#fff' : '#111',
                          fontFamily: 'Montserrat, sans-serif',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                ) : (
                  <textarea
                    value={createFields[CREATE_STEPS[createStep].id] ?? ''}
                    onChange={(e) =>
                      setCreateFields((prev) => ({
                        ...prev,
                        [CREATE_STEPS[createStep].id]: e.target.value,
                      }))
                    }
                    placeholder={CREATE_STEPS[createStep].placeholder}
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '14px',
                      border: '1.5px solid #e0e0e0',
                      borderRadius: '8px',
                      fontFamily: 'Montserrat, sans-serif',
                      fontSize: '14px',
                      color: '#111',
                      resize: 'none',
                      outline: 'none',
                      marginBottom: '24px',
                      boxSizing: 'border-box',
                    }}
                  />
                )}

                <div style={{ display: 'flex', gap: '10px' }}>
                  {createStep > 0 && (
                    <button
                      onClick={() => setCreateStep((s) => s - 1)}
                      style={{
                        flex: 1,
                        padding: '12px',
                        border: '1.5px solid #ddd',
                        borderRadius: '8px',
                        background: '#fff',
                        color: '#555',
                        fontFamily: 'Montserrat, sans-serif',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                      }}
                    >
                      Back
                    </button>
                  )}
                  <button
                    onClick={handleCreateNext}
                    disabled={
                      createStep === 0
                        ? !createFields.type
                        : !createFields[CREATE_STEPS[createStep].id]?.trim()
                    }
                    style={{
                      flex: 2,
                      padding: '12px',
                      border: 'none',
                      borderRadius: '8px',
                      background:
                        (createStep === 0
                          ? !!createFields.type
                          : !!createFields[CREATE_STEPS[createStep].id]?.trim())
                          ? '#111'
                          : '#ccc',
                      color: '#fff',
                      fontFamily: 'Montserrat, sans-serif',
                      fontSize: '14px',
                      fontWeight: '700',
                      cursor:
                        (createStep === 0
                          ? !!createFields.type
                          : !!createFields[CREATE_STEPS[createStep].id]?.trim())
                          ? 'pointer'
                          : 'not-allowed',
                      letterSpacing: '0.02em',
                      transition: 'background 0.15s ease',
                    }}
                  >
                    {createStep < CREATE_STEPS.length - 1 ? 'Next' : 'Create'}
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
