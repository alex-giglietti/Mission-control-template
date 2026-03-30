'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';

interface CustomConnector {
  id: string;
  name: string;
  slug: string;
  description: string;
  base_url: string;
  auth_type: string;
  is_connected: boolean;
  created_at: string;
}

export default function CustomConnectorsPage() {
  const [connectors, setConnectors] = useState<CustomConnector[]>([]);
  const [loading, setLoading] = useState(true);
  const userId = 'placeholder-user-id';

  useEffect(() => {
    async function fetchConnectors() {
      try {
        const res = await fetch(`/api/portal/custom-connectors?user_id=${userId}`);
        if (res.ok) setConnectors(await res.json());
      } catch (err) {
        console.error('Failed to fetch custom connectors:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchConnectors();
  }, []);

  const authTypeLabel = (type: string) => {
    switch (type) {
      case 'oauth2': return 'OAuth 2.0';
      case 'api_key': return 'API Key';
      case 'bearer': return 'Bearer Token';
      default: return type;
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <p className="eyebrow mb-2">Integrations</p>
          <h2 className="text-2xl font-bold text-white">Custom Apps</h2>
          <p className="mt-1 text-sm text-[#6B7280]">
            Connect any REST API as a custom MCP connector.
          </p>
          <div className="mt-4 h-0.5 w-14 bg-gradient-to-r from-[#E91E8C] to-[#00D9FF] rounded-full" />
        </div>
        <Link
          href="/connections/custom/new"
          className="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold bg-[#E91E8C] text-white hover:opacity-90 transition-opacity mt-2 shadow-lg shadow-[#E91E8C]/30"
        >
          <Plus className="w-4 h-4" />
          Add Custom App
        </Link>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2A2A3E] border-t-[#E91E8C]" />
        </div>
      )}

      {/* Empty state */}
      {!loading && connectors.length === 0 && (
        <div className="rounded-xl py-16 text-center border border-dashed border-[#2A2A3E] bg-[#12121A]/50">
          <div className="mx-auto h-12 w-12 rounded-xl bg-[#1A1A2E] flex items-center justify-center mb-4">
            <svg className="h-6 w-6 text-[#6B7280]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 0 1-.657.643 48.39 48.39 0 0 1-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 0 1-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 0 0-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 0 1-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 0 0 .657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 0 1-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 0 0 5.427-.63 48.05 48.05 0 0 0 .582-4.717.532.532 0 0 0-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.96.401v0a.656.656 0 0 0 .657-.663 48.422 48.422 0 0 0-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 0 1-.61-.58v0Z" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-white mb-1">No custom apps yet</h3>
          <p className="text-sm text-[#6B7280] mb-4">Create your first custom connector to get started</p>
          <Link
            href="/connections/custom/new"
            className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold bg-[#E91E8C] text-white hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Add Custom App
          </Link>
        </div>
      )}

      {/* Connector list */}
      {!loading && connectors.length > 0 && (
        <div className="space-y-3">
          {connectors.map((connector) => (
            <div
              key={connector.id}
              className="flex items-center justify-between rounded-xl p-5 bg-[#12121A] border border-[#2A2A3E] hover:border-[#E91E8C]/30 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg text-xs font-bold bg-[#E91E8C] text-white">
                  {connector.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{connector.name}</h3>
                  <p className="mt-0.5 text-xs text-[#6B7280]">{connector.base_url}</p>
                  <div className="mt-1 flex items-center gap-3">
                    <span className="text-xs text-[#6B7280]">{authTypeLabel(connector.auth_type)}</span>
                    <span
                      className="inline-flex items-center gap-1 text-xs font-medium"
                      style={{ color: connector.is_connected ? '#34D399' : '#6B7280' }}
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: connector.is_connected ? '#34D399' : '#6B7280' }}
                      />
                      {connector.is_connected ? 'Connected' : 'Not connected'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-lg px-2 py-1 font-mono text-xs bg-[#1A1A2E] text-[#6B7280]">
                  /api/mcp/custom/{connector.slug}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
