'use client';

import { useState } from 'react';
import ConnectionStatus, { type ConnectionStatusType } from './ConnectionStatus';

export interface ServiceInfo {
  id: string;
  name: string;
  description: string;
  authType: 'oauth2' | 'api_key';
}

interface ConnectorCardProps {
  service: ServiceInfo;
  status: ConnectionStatusType;
  lastUsed?: string;
  onConnect: (serviceId: string) => void;
  onDisconnect: (serviceId: string) => void;
}

export default function ConnectorCard({
  service,
  status,
  lastUsed,
  onConnect,
  onDisconnect,
}: ConnectorCardProps) {
  const [showApiKeyForm, setShowApiKeyForm] = useState(false);
  const [apiKeyValue, setApiKeyValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'fail' | null>(null);

  const userId = 'placeholder-user-id';

  const handleConnect = () => {
    if (service.authType === 'oauth2') {
      window.location.href = `/api/oauth/${service.id}/authorize?user_id=${userId}`;
    } else {
      setShowApiKeyForm(true);
    }
  };

  const handleSaveApiKey = async () => {
    if (!apiKeyValue.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/oauth/connect-api-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          service: service.id,
          api_key: apiKeyValue.trim(),
        }),
      });
      if (res.ok) {
        setShowApiKeyForm(false);
        setApiKeyValue('');
        onConnect(service.id);
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Failed to save API key');
      }
    } catch {
      alert('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch(
        `/api/portal/status?user_id=${userId}&service=${service.id}&test=true`
      );
      setTestResult(res.ok ? 'success' : 'fail');
    } catch {
      setTestResult('fail');
    } finally {
      setTesting(false);
      setTimeout(() => setTestResult(null), 3000);
    }
  };

  const formatLastUsed = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div
      className="group rounded-xl p-5 transition-all duration-200 hover:border-[#E91E8C]/40 hover:shadow-lg hover:shadow-[#E91E8C]/5"
      style={{
        background: '#12121A',
        border: '1px solid #2A2A3E',
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <ServiceIcon serviceId={service.id} />
          <div>
            <h3 className="text-sm font-bold text-white">
              {service.name}
            </h3>
            <p className="mt-0.5 text-xs text-[#6B7280]">
              {service.description}
            </p>
          </div>
        </div>
        <ConnectionStatus status={status} />
      </div>

      {/* Last used */}
      {status === 'connected' && lastUsed && (
        <p className="mt-3 text-xs text-[#6B7280]">
          Last used: {formatLastUsed(lastUsed)}
        </p>
      )}

      {/* Test result feedback */}
      {testResult && (
        <div
          className={`mt-3 rounded-lg px-3 py-1.5 text-xs font-medium ${
            testResult === 'success'
              ? 'bg-[#34D399]/10 text-[#34D399]'
              : 'bg-[#EF4444]/10 text-[#EF4444]'
          }`}
        >
          {testResult === 'success' ? 'Connection test passed ✓' : 'Connection test failed ✗'}
        </div>
      )}

      {/* API Key inline form */}
      {showApiKeyForm && (
        <div className="mt-4 space-y-3">
          <div>
            <label
              htmlFor={`api-key-${service.id}`}
              className="block text-xs font-medium mb-1 text-[#A1A1AA]"
            >
              API Key
            </label>
            <input
              id={`api-key-${service.id}`}
              type="password"
              value={apiKeyValue}
              onChange={(e) => setApiKeyValue(e.target.value)}
              placeholder="Enter your API key..."
              className="block w-full rounded-lg px-3 py-2 text-sm outline-none bg-[#1A1A2E] border border-[#2A2A3E] text-white placeholder-[#6B7280] focus:border-[#E91E8C] focus:ring-1 focus:ring-[#E91E8C]/30 transition-colors"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSaveApiKey}
              disabled={saving || !apiKeyValue.trim()}
              className="rounded-full px-4 py-1.5 text-xs font-semibold bg-[#E91E8C] text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Key'}
            </button>
            <button
              onClick={() => { setShowApiKeyForm(false); setApiKeyValue(''); }}
              className="rounded-full px-4 py-1.5 text-xs font-medium border border-[#2A2A3E] text-[#A1A1AA] hover:bg-[#1A1A2E] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Action buttons */}
      {!showApiKeyForm && (
        <div className="mt-4 flex gap-2">
          {status === 'disconnected' && (
            <button
              onClick={handleConnect}
              className="rounded-full px-5 py-2 text-xs font-semibold bg-[#E91E8C] text-white transition-all hover:opacity-90 hover:shadow-lg hover:shadow-[#E91E8C]/30"
            >
              Connect →
            </button>
          )}

          {status === 'connected' && (
            <>
              <button
                onClick={handleTest}
                disabled={testing}
                className="rounded-full px-4 py-2 text-xs font-medium border border-[#2A2A3E] text-[#A1A1AA] hover:border-[#C9A84C] hover:text-[#C9A84C] transition-all disabled:cursor-not-allowed disabled:opacity-50"
              >
                {testing ? 'Testing...' : 'Test'}
              </button>
              <button
                onClick={() => onDisconnect(service.id)}
                className="rounded-full px-4 py-2 text-xs font-medium border border-[#EF4444]/30 text-[#EF4444] hover:bg-[#EF4444]/10 transition-all"
              >
                Disconnect
              </button>
            </>
          )}

          {status === 'expired' && (
            <button
              onClick={handleConnect}
              className="rounded-full px-5 py-2 text-xs font-semibold bg-[#FBBF24] text-black transition-opacity hover:opacity-90"
            >
              Reconnect →
            </button>
          )}

          {status === 'error' && (
            <button
              onClick={handleConnect}
              className="rounded-full px-5 py-2 text-xs font-semibold bg-[#EF4444] text-white transition-opacity hover:opacity-90"
            >
              Retry →
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Service icon helper                                                */
/* ------------------------------------------------------------------ */

function ServiceIcon({ serviceId }: { serviceId: string }) {
  const iconMap: Record<string, { bg: string; letter: string; textColor: string }> = {
    google:            { bg: '#1A1A2E', letter: 'G',  textColor: '#E91E8C' },
    ghl:               { bg: '#E91E8C', letter: 'GH', textColor: '#FFFFFF' },
    meta:              { bg: '#1A1A2E', letter: 'M',  textColor: '#00D9FF' },
    zoom:              { bg: '#00D9FF', letter: 'Z',  textColor: '#0A0A0F' },
    quickbooks:        { bg: '#1A1A2E', letter: 'QB', textColor: '#C9A84C' },
    stripe:            { bg: '#C9A84C', letter: 'S',  textColor: '#0A0A0F' },
    klaviyo:           { bg: '#1A1A2E', letter: 'K',  textColor: '#E91E8C' },
    supabase:          { bg: '#34D399', letter: 'SB', textColor: '#0A0A0F' },
    vercel:            { bg: '#1A1A2E', letter: 'V',  textColor: '#FFFFFF' },
    nanobanana:        { bg: '#8B5CF6', letter: 'NB', textColor: '#FFFFFF' },
    'mission-control': { bg: '#E91E8C', letter: 'MC', textColor: '#FFFFFF' },
  };

  const icon = iconMap[serviceId] || { bg: '#1A1A2E', letter: '?', textColor: '#A1A1AA' };

  return (
    <div
      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-xs font-bold"
      style={{ backgroundColor: icon.bg, color: icon.textColor }}
    >
      {icon.letter}
    </div>
  );
}
