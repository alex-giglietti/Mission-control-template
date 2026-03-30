'use client';

import { useEffect, useState, useCallback } from 'react';
import { Key, AlertTriangle, Copy, Check, Plus } from 'lucide-react';

interface ApiKey {
  id: string;
  label: string;
  plan: string;
  key_preview: string;
  rate_limit_rpm: number;
  created_at: string;
  expires_at: string;
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [newKeyLabel, setNewKeyLabel] = useState('');
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const userId = 'placeholder-user-id';

  const fetchKeys = useCallback(async () => {
    try {
      const res = await fetch(`/api/portal/keys?user_id=${userId}`);
      if (res.ok) setKeys(await res.json());
    } catch (err) {
      console.error('Failed to fetch API keys:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { fetchKeys(); }, [fetchKeys]);

  const handleGenerate = async () => {
    if (!newKeyLabel.trim()) return;
    setGenerating(true);
    try {
      const res = await fetch('/api/portal/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, label: newKeyLabel.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setNewlyCreatedKey(data.raw_key);
        setNewKeyLabel('');
        setShowGenerateForm(false);
        fetchKeys();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Failed to generate key');
      }
    } catch {
      alert('Network error. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleRevoke = async (keyId: string) => {
    if (!confirm('Revoke this API key? This cannot be undone.')) return;
    setRevoking(keyId);
    try {
      const res = await fetch('/api/portal/keys', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, key_id: keyId }),
      });
      if (res.ok) fetchKeys();
      else alert('Failed to revoke key');
    } catch {
      alert('Network error. Please try again.');
    } finally {
      setRevoking(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <p className="eyebrow mb-2">Security</p>
          <h2 className="text-2xl font-bold text-white">API Keys</h2>
          <p className="mt-1 text-sm text-[#6B7280]">
            Manage your MCP API keys for authentication.
          </p>
          <div className="mt-4 h-0.5 w-14 bg-gradient-to-r from-[#E91E8C] to-[#00D9FF] rounded-full" />
        </div>
        <button
          onClick={() => { setShowGenerateForm(true); setNewlyCreatedKey(null); }}
          className="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold bg-[#E91E8C] text-white hover:opacity-90 transition-opacity mt-2 shadow-lg shadow-[#E91E8C]/30"
        >
          <Plus className="w-4 h-4" />
          Generate New Key
        </button>
      </div>

      {/* Newly created key banner */}
      {newlyCreatedKey && (
        <div className="mb-6 rounded-xl p-5 border border-[#C9A84C]/30 bg-[#C9A84C]/5">
          <div className="flex items-center gap-2 text-[#C9A84C] mb-3">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="text-sm font-semibold text-white">Save your API key — it will not be shown again</h3>
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-lg px-4 py-3 font-mono text-sm break-all border border-[#2A2A3E] bg-[#1A1A2E] text-[#C9A84C]">
              {newlyCreatedKey}
            </code>
            <button
              onClick={() => copyToClipboard(newlyCreatedKey)}
              className="rounded-lg p-3 border border-[#C9A84C]/30 text-[#C9A84C] hover:bg-[#C9A84C]/10 transition-colors"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <button onClick={() => setNewlyCreatedKey(null)} className="mt-3 text-xs text-[#6B7280] hover:text-white transition-colors">
            Dismiss
          </button>
        </div>
      )}

      {/* Generate form */}
      {showGenerateForm && (
        <div className="mb-6 rounded-xl p-5 border border-[#2A2A3E] bg-[#12121A]">
          <h3 className="text-sm font-semibold text-white mb-3">Generate New API Key</h3>
          <div className="flex gap-3">
            <input
              type="text"
              value={newKeyLabel}
              onChange={(e) => setNewKeyLabel(e.target.value)}
              placeholder="Key label (e.g., Production, Development)"
              className="flex-1 rounded-lg px-4 py-2.5 text-sm outline-none bg-[#1A1A2E] border border-[#2A2A3E] text-white placeholder-[#6B7280] focus:border-[#E91E8C] focus:ring-1 focus:ring-[#E91E8C]/30 transition-colors"
            />
            <button
              onClick={handleGenerate}
              disabled={generating || !newKeyLabel.trim()}
              className="rounded-full px-5 py-2.5 text-sm font-semibold bg-[#E91E8C] text-white hover:opacity-90 transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
            >
              {generating ? 'Generating...' : 'Generate'}
            </button>
            <button
              onClick={() => { setShowGenerateForm(false); setNewKeyLabel(''); }}
              className="rounded-full px-4 py-2.5 text-sm font-medium border border-[#2A2A3E] text-[#A1A1AA] hover:bg-[#1A1A2E] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2A2A3E] border-t-[#E91E8C]" />
        </div>
      )}

      {/* Empty state */}
      {!loading && keys.length === 0 && (
        <div className="rounded-xl py-16 text-center border border-dashed border-[#2A2A3E] bg-[#12121A]/50">
          <div className="mx-auto w-12 h-12 rounded-xl bg-[#1A1A2E] flex items-center justify-center mb-4">
            <Key className="w-6 h-6 text-[#6B7280]" />
          </div>
          <h3 className="text-sm font-semibold text-white mb-1">No API keys yet</h3>
          <p className="text-sm text-[#6B7280]">
            Generate your first API key to start using MCP connectors
          </p>
        </div>
      )}

      {/* Keys table */}
      {!loading && keys.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-[#2A2A3E]">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2A2A3E] bg-[#1A1A2E]">
                {['Label', 'Key', 'Plan', 'Rate Limit', 'Created', 'Expires', ''].map((h) => (
                  <th
                    key={h}
                    className={`px-5 py-3 text-xs font-medium uppercase tracking-wider text-[#6B7280] ${h === '' ? 'text-right' : 'text-left'}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {keys.map((key) => (
                <tr key={key.id} className="border-b border-[#2A2A3E] last:border-0 bg-[#12121A] hover:bg-[#1A1A2E] transition-colors">
                  <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-white">
                    {key.label}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4">
                    <code className="rounded-lg px-2 py-1 font-mono text-xs bg-[#1A1A2E] border border-[#2A2A3E] text-[#A1A1AA]">
                      ****{key.key_preview}
                    </code>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4">
                    <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize bg-[#C9A84C]/15 text-[#C9A84C]">
                      {key.plan}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-sm text-[#6B7280]">
                    {key.rate_limit_rpm} rpm
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-sm text-[#6B7280]">
                    {formatDate(key.created_at)}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-sm text-[#6B7280]">
                    {formatDate(key.expires_at)}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-right">
                    <button
                      onClick={() => handleRevoke(key.id)}
                      disabled={revoking === key.id}
                      className="rounded-full px-3 py-1.5 text-xs font-medium border border-[#EF4444]/30 text-[#EF4444] hover:bg-[#EF4444]/10 transition-all disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {revoking === key.id ? 'Revoking...' : 'Revoke'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
