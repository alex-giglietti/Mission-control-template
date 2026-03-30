'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePromptMode } from '@/lib/hooks/usePromptMode';

// ─── Types ────────────────────────────────────────────────────────────────────

type AgentStatus = 'active' | 'paused';

interface Agent {
  id: string;
  name: string;
  role: string;
  description: string;
  attached_tools: string[];
  custom_instructions: string | null;
  status: AgentStatus;
  last_activity: string | null;
}

type TabKey = 'ai-team' | 'brand' | 'advanced';

// ─── Tool brand colors ────────────────────────────────────────────────────────

const TOOL_COLORS: Record<string, string> = {
  Claude:       '#7c3aed',
  'Nano Banana':'#f97316',
  Buffer:       '#3b82f6',
  GHL:          '#22c55e',
  'Meta Ads':   '#1877f2',
  HeyGen:       '#14b8a6',
  Instantly:    '#6366f1',
  Teachable:    '#16a34a',
  Calendly:     '#0069ff',
};

const ALL_TOOLS = Object.keys(TOOL_COLORS);

const FONTS = ['Montserrat', 'Inter', 'Roboto', 'Lato', 'Poppins'];

// ─── Shared styles ────────────────────────────────────────────────────────────

const card: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: 8,
  padding: '20px 24px',
  fontFamily: "'Montserrat', sans-serif",
};

const sectionTitle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: 1.2,
  textTransform: 'uppercase',
  color: '#999',
  marginBottom: 16,
};

const label: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 500,
  color: '#444',
  marginBottom: 6,
  display: 'block',
};

const inputStyle: React.CSSProperties = {
  border: '1px solid #e5e7eb',
  borderRadius: 6,
  padding: '8px 12px',
  fontSize: 13,
  fontFamily: "'Montserrat', sans-serif",
  color: '#111',
  width: '100%',
  boxSizing: 'border-box',
  outline: 'none',
};

const btnPrimary: React.CSSProperties = {
  background: '#DAA520',
  color: '#fff',
  border: 'none',
  borderRadius: 6,
  padding: '8px 18px',
  fontSize: 12,
  fontWeight: 600,
  fontFamily: "'Montserrat', sans-serif",
  cursor: 'pointer',
  letterSpacing: 0.3,
};

const btnSecondary: React.CSSProperties = {
  background: '#fff',
  color: '#444',
  border: '1px solid #e5e7eb',
  borderRadius: 6,
  padding: '7px 16px',
  fontSize: 12,
  fontWeight: 500,
  fontFamily: "'Montserrat', sans-serif",
  cursor: 'pointer',
};

// ─── Agent Card ───────────────────────────────────────────────────────────────

function AgentCard({
  agent,
  onStatusToggle,
  onTrain,
  onAttachTools,
}: {
  agent: Agent;
  onStatusToggle: (agent: Agent) => void;
  onTrain: (agent: Agent) => void;
  onAttachTools: (agent: Agent) => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        ...card,
        transition: 'box-shadow 0.15s ease',
        boxShadow: hovered ? '0 2px 12px rgba(0,0,0,0.07)' : 'none',
        marginBottom: 12,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>{agent.name}</span>
        <button
          onClick={() => onStatusToggle(agent)}
          style={{
            background: agent.status === 'active' ? '#f0fdf4' : '#fafafa',
            border: `1px solid ${agent.status === 'active' ? '#86efac' : '#e5e7eb'}`,
            borderRadius: 20,
            padding: '3px 10px',
            fontSize: 11,
            fontWeight: 500,
            color: agent.status === 'active' ? '#16a34a' : '#888',
            cursor: 'pointer',
            fontFamily: "'Montserrat', sans-serif",
            display: 'flex',
            alignItems: 'center',
            gap: 5,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: agent.status === 'active' ? '#22c55e' : '#d1d5db',
              display: 'inline-block',
            }}
          />
          {agent.status === 'active' ? 'Active' : 'Paused'}
        </button>
      </div>

      {/* Description */}
      <p style={{ fontSize: 12, color: '#666', margin: '0 0 12px', lineHeight: 1.5 }}>
        {agent.description}
      </p>

      {/* Tools */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
        {agent.attached_tools.map((tool) => (
          <span key={tool} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#444' }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: TOOL_COLORS[tool] ?? '#999',
                display: 'inline-block',
                flexShrink: 0,
              }}
            />
            {tool}
          </span>
        ))}
      </div>

      {/* Last activity */}
      <p style={{ fontSize: 11, color: '#bbb', margin: '0 0 14px' }}>
        Last activity: {agent.last_activity ?? '—'}
      </p>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button style={btnSecondary} onClick={() => onTrain(agent)}>Train</button>
        <button style={btnSecondary} onClick={() => onAttachTools(agent)}>Attach tools</button>
      </div>
    </div>
  );
}

// ─── Train Modal ──────────────────────────────────────────────────────────────

function TrainModal({
  agent,
  onClose,
  onSave,
}: {
  agent: Agent;
  onClose: () => void;
  onSave: (instructions: string) => void;
}) {
  const [instructions, setInstructions] = useState(agent.custom_instructions ?? '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave(instructions);
    setSaving(false);
    onClose();
  };

  return (
    <Overlay onClose={onClose}>
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#111' }}>
          Train: {agent.name}
        </h3>
        <p style={{ margin: '6px 0 0', fontSize: 12, color: '#666' }}>
          Add custom instructions for how this agent should behave.
        </p>
      </div>
      <label style={label}>Custom instructions</label>
      <textarea
        value={instructions}
        onChange={(e) => setInstructions(e.target.value)}
        rows={6}
        style={{ ...inputStyle, resize: 'vertical' }}
        placeholder="E.g. Always write in a casual, conversational tone. Focus on B2B SaaS audiences..."
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
        <button style={btnSecondary} onClick={onClose}>Cancel</button>
        <button style={btnPrimary} onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </Overlay>
  );
}

// ─── Attach Tools Modal ───────────────────────────────────────────────────────

function AttachToolsModal({
  agent,
  onClose,
  onSave,
}: {
  agent: Agent;
  onClose: () => void;
  onSave: (tools: string[]) => void;
}) {
  const [selected, setSelected] = useState<string[]>(agent.attached_tools);
  const [saving, setSaving] = useState(false);

  const toggle = (tool: string) => {
    setSelected((prev) =>
      prev.includes(tool) ? prev.filter((t) => t !== tool) : [...prev, tool]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave(selected);
    setSaving(false);
    onClose();
  };

  return (
    <Overlay onClose={onClose}>
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#111' }}>
          Attach tools: {agent.name}
        </h3>
        <p style={{ margin: '6px 0 0', fontSize: 12, color: '#666' }}>
          Select which tools this agent has access to.
        </p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
        {ALL_TOOLS.map((tool) => (
          <label key={tool} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={selected.includes(tool)}
              onChange={() => toggle(tool)}
              style={{ width: 14, height: 14, accentColor: TOOL_COLORS[tool] ?? '#DAA520' }}
            />
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: TOOL_COLORS[tool] ?? '#999',
                display: 'inline-block',
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: 13, color: '#111' }}>{tool}</span>
          </label>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <button style={btnSecondary} onClick={onClose}>Cancel</button>
        <button style={btnPrimary} onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </Overlay>
  );
}

// ─── Overlay wrapper ──────────────────────────────────────────────────────────

function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff', borderRadius: 10, padding: 24, width: 480,
          maxWidth: '90vw', boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
          fontFamily: "'Montserrat', sans-serif",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

// ─── AI Team Tab ──────────────────────────────────────────────────────────────

function AITeamTab() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [trainTarget, setTrainTarget] = useState<Agent | null>(null);
  const [toolsTarget, setToolsTarget] = useState<Agent | null>(null);

  const fetchAgents = useCallback(async () => {
    try {
      const res = await fetch('/api/ai-agents');
      const data = await res.json();
      setAgents(data.agents ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAgents(); }, [fetchAgents]);

  const patchAgent = async (id: string, payload: Record<string, unknown>) => {
    await fetch('/api/ai-agents', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...payload }),
    });
    await fetchAgents();
  };

  const handleStatusToggle = (agent: Agent) => {
    patchAgent(agent.id, { status: agent.status === 'active' ? 'paused' : 'active' });
  };

  if (loading) {
    return <p style={{ fontSize: 13, color: '#888' }}>Loading agents...</p>;
  }

  return (
    <div>
      <div style={sectionTitle}>AI Team</div>
      {agents.map((agent) => (
        <AgentCard
          key={agent.id}
          agent={agent}
          onStatusToggle={handleStatusToggle}
          onTrain={(a) => setTrainTarget(a)}
          onAttachTools={(a) => setToolsTarget(a)}
        />
      ))}
      {agents.length === 0 && (
        <p style={{ fontSize: 13, color: '#888' }}>No agents found.</p>
      )}

      {trainTarget && (
        <TrainModal
          agent={trainTarget}
          onClose={() => setTrainTarget(null)}
          onSave={(instructions) => patchAgent(trainTarget.id, { custom_instructions: instructions })}
        />
      )}
      {toolsTarget && (
        <AttachToolsModal
          agent={toolsTarget}
          onClose={() => setToolsTarget(null)}
          onSave={(tools) => patchAgent(toolsTarget.id, { attached_tools: tools })}
        />
      )}
    </div>
  );
}

// ─── Brand Colors Tab ─────────────────────────────────────────────────────────

function BrandTab() {
  const [primary, setPrimary] = useState('#DAA520');
  const [secondary, setSecondary] = useState('#111111');
  const [accent, setAccent] = useState('#FFFFFF');
  const [font, setFont] = useState('Montserrat');
  const [brandName, setBrandName] = useState('VisionaryAI');
  const [saved, setSaved] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('mission_control_brand');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.primary) setPrimary(parsed.primary);
        if (parsed.secondary) setSecondary(parsed.secondary);
        if (parsed.accent) setAccent(parsed.accent);
        if (parsed.font) setFont(parsed.font);
        if (parsed.brandName) setBrandName(parsed.brandName);
      }
    } catch { /* ignore */ }
  }, []);

  const handleSave = async () => {
    const brandData = { primary, secondary, accent, font, brandName };

    // Try updating brand_docs table first
    try {
      const res = await fetch('/api/brand', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(brandData),
      });
      if (!res.ok) throw new Error('API unavailable');
    } catch {
      // Fallback to localStorage
      localStorage.setItem('mission_control_brand', JSON.stringify(brandData));
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const ColorField = ({
    label: lbl,
    value,
    onChange,
  }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
  }) => (
    <div style={{ marginBottom: 16 }}>
      <label style={label}>{lbl}</label>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ width: 42, height: 36, border: '1px solid #e5e7eb', borderRadius: 6, cursor: 'pointer', padding: 2 }}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ ...inputStyle, width: 120 }}
          maxLength={7}
        />
      </div>
    </div>
  );

  return (
    <div>
      <div style={sectionTitle}>Brand Colors</div>

      <div style={{ ...card, marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          <ColorField label="Primary" value={primary} onChange={setPrimary} />
          <ColorField label="Secondary" value={secondary} onChange={setSecondary} />
          <ColorField label="Accent" value={accent} onChange={setAccent} />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={label}>Font</label>
          <select
            value={font}
            onChange={(e) => setFont(e.target.value)}
            style={{ ...inputStyle, width: 'auto', minWidth: 180 }}
          >
            {FONTS.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={label}>Brand Name</label>
          <input
            type="text"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            style={{ ...inputStyle, maxWidth: 280 }}
          />
        </div>

        {/* Preview card */}
        <div style={{ marginBottom: 20 }}>
          <label style={label}>Preview</label>
          <div
            style={{
              background: accent,
              border: `2px solid ${primary}`,
              borderRadius: 8,
              padding: '20px 24px',
              maxWidth: 280,
              fontFamily: `'${font}', sans-serif`,
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 700, color: secondary, marginBottom: 6 }}>
              {brandName}
            </div>
            <div style={{ fontSize: 12, color: primary, fontWeight: 500 }}>
              Mission Control Platform
            </div>
            <div
              style={{
                marginTop: 12,
                background: primary,
                color: accent,
                borderRadius: 4,
                padding: '6px 14px',
                fontSize: 11,
                fontWeight: 600,
                display: 'inline-block',
              }}
            >
              Get Started
            </div>
          </div>
        </div>

        <button style={btnPrimary} onClick={handleSave}>
          {saved ? 'Saved' : 'Save brand settings'}
        </button>
      </div>
    </div>
  );
}

// ─── Advanced Tab ─────────────────────────────────────────────────────────────

function AdvancedTab() {
  const { enabled, toggle } = usePromptMode();

  return (
    <div>
      <div style={sectionTitle}>Advanced</div>

      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#111', marginBottom: 4 }}>
              Enable prompt mode
            </div>
            <div style={{ fontSize: 12, color: '#666', maxWidth: 380, lineHeight: 1.5 }}>
              Copy AI prompts to clipboard instead of auto-generating. Useful for reviewing or customizing
              prompts before they run.
            </div>
          </div>
          <button
            onClick={toggle}
            style={{
              width: 44,
              height: 24,
              borderRadius: 12,
              border: 'none',
              background: enabled ? '#DAA520' : '#e5e7eb',
              cursor: 'pointer',
              position: 'relative',
              transition: 'background 0.2s ease',
              flexShrink: 0,
              marginLeft: 24,
            }}
            aria-pressed={enabled}
          >
            <span
              style={{
                position: 'absolute',
                top: 3,
                left: enabled ? 23 : 3,
                width: 18,
                height: 18,
                borderRadius: '50%',
                background: '#fff',
                transition: 'left 0.2s ease',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              }}
            />
          </button>
        </div>

        {enabled && (
          <div
            style={{
              marginTop: 14,
              padding: '10px 14px',
              background: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: 6,
              fontSize: 12,
              color: '#92400e',
            }}
          >
            Prompt mode is on. AI actions will copy prompts to your clipboard instead of auto-running.
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Settings Page ───────────────────────────────────────────────────────

const TABS: { key: TabKey; label: string }[] = [
  { key: 'ai-team', label: 'AI Team' },
  { key: 'brand', label: 'Brand Colors' },
  { key: 'advanced', label: 'Advanced' },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('ai-team');

  return (
    <div
      style={{
        padding: '32px 40px',
        maxWidth: 800,
        fontFamily: "'Montserrat', sans-serif",
        background: '#fff',
        minHeight: '100vh',
      }}
    >
      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#111' }}>Settings</h1>
        <p style={{ margin: '6px 0 0', fontSize: 13, color: '#666' }}>
          Manage your AI team, brand identity, and platform preferences.
        </p>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: 0,
          borderBottom: '1px solid #e5e7eb',
          marginBottom: 28,
        }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab.key ? '2px solid #DAA520' : '2px solid transparent',
              padding: '10px 18px',
              fontSize: 12,
              fontWeight: activeTab === tab.key ? 600 : 400,
              color: activeTab === tab.key ? '#111' : '#666',
              cursor: 'pointer',
              fontFamily: "'Montserrat', sans-serif",
              transition: 'color 0.15s ease',
              marginBottom: -1,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'ai-team'  && <AITeamTab />}
      {activeTab === 'brand'    && <BrandTab />}
      {activeTab === 'advanced' && <AdvancedTab />}
    </div>
  );
}
