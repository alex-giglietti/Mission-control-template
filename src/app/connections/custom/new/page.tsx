'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, CheckCircle, Copy, Check } from 'lucide-react';

type AuthType = 'oauth2' | 'api_key' | 'bearer';

interface FormData {
  name: string;
  slug: string;
  description: string;
  base_url: string;
  auth_type: AuthType;
  client_id: string;
  client_secret: string;
  authorization_url: string;
  token_url: string;
  scopes: string;
  header_name: string;
  key_value: string;
  token_value: string;
  default_headers: string;
}

export default function NewCustomConnectorPage() {
  const router = useRouter();
  const userId = 'placeholder-user-id';

  const [form, setForm] = useState<FormData>({
    name: '',
    slug: '',
    description: '',
    base_url: '',
    auth_type: 'api_key',
    client_id: '',
    client_secret: '',
    authorization_url: '',
    token_url: '',
    scopes: '',
    header_name: 'X-API-Key',
    key_value: '',
    token_value: '',
    default_headers: '{}',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generateSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

  const updateField = (field: keyof FormData, value: string) => {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === 'name') updated.slug = generateSlug(value);
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    let parsedHeaders = {};
    if (form.default_headers.trim()) {
      try {
        parsedHeaders = JSON.parse(form.default_headers);
      } catch {
        setError('Default Headers must be valid JSON');
        setSubmitting(false);
        return;
      }
    }

    let authConfig: Record<string, unknown> = {};
    switch (form.auth_type) {
      case 'oauth2':
        authConfig = {
          client_id: form.client_id,
          client_secret: form.client_secret,
          authorization_url: form.authorization_url,
          token_url: form.token_url,
          scopes: form.scopes.split(',').map((s) => s.trim()).filter(Boolean),
        };
        break;
      case 'api_key':
        authConfig = { header_name: form.header_name, key_value: form.key_value };
        break;
      case 'bearer':
        authConfig = { token_value: form.token_value };
        break;
    }

    try {
      const res = await fetch('/api/portal/custom-connectors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          name: form.name,
          slug: form.slug,
          description: form.description,
          base_url: form.base_url,
          auth_type: form.auth_type,
          auth_config: authConfig,
          default_headers: parsedHeaders,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to create connector');
      }

      setCreatedSlug(form.slug);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  if (createdSlug) {
    const mcpUrl = `demo-mission-control.vercel.app/api/mcp/custom/${createdSlug}`;
    return (
      <div>
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white">Custom App Created</h2>
          <p className="mt-1 text-sm text-[#6B7280]">Your custom connector is ready to use</p>
        </div>
        <div className="max-w-2xl rounded-xl border border-[#34D399]/30 bg-[#34D399]/5 p-6">
          <div className="flex items-center gap-2 text-[#34D399] mb-4">
            <CheckCircle className="w-5 h-5" />
            <span className="font-semibold">Connector Created Successfully</span>
          </div>
          <p className="text-sm text-[#A1A1AA] mb-2">Your MCP server URL:</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-lg border border-[#2A2A3E] bg-[#1A1A2E] px-4 py-3 font-mono text-sm text-[#34D399] break-all">
              {mcpUrl}
            </code>
            <button
              onClick={() => { navigator.clipboard.writeText(mcpUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
              className="rounded-lg border border-[#2A2A3E] p-3 text-[#6B7280] hover:text-white hover:bg-[#1A1A2E] transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-[#34D399]" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => router.push('/connections/custom')}
              className="rounded-lg bg-[#1A1A2E] border border-[#2A2A3E] px-4 py-2 text-sm font-medium text-white hover:bg-[#2A2A3E] transition-colors"
            >
              Back to Custom Apps
            </button>
          </div>
        </div>
      </div>
    );
  }

  const inputClass = "block w-full rounded-lg border border-[#2A2A3E] bg-[#1A1A2E] px-4 py-2.5 text-sm text-white placeholder-[#6B7280] focus:border-[#E91E8C] focus:outline-none focus:ring-1 focus:ring-[#E91E8C]/30 transition-colors";
  const labelClass = "block text-sm font-medium text-[#A1A1AA] mb-1.5";

  return (
    <div>
      <div className="mb-8 flex items-center gap-4">
        <Link href="/connections/custom" className="p-2 rounded-lg hover:bg-[#1A1A2E] transition-colors">
          <ChevronLeft className="w-5 h-5 text-[#A1A1AA]" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-white">Add Custom App</h2>
          <p className="mt-1 text-sm text-[#6B7280]">Connect any REST API as a custom MCP connector</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        {error && (
          <div className="rounded-lg border border-[#EF4444]/30 bg-[#EF4444]/10 px-4 py-3 text-sm text-[#EF4444]">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="name" className={labelClass}>App Name</label>
          <input id="name" type="text" required value={form.name} onChange={(e) => updateField('name', e.target.value)} placeholder="My Custom API" className={inputClass} />
        </div>

        <div>
          <label htmlFor="slug" className={labelClass}>Slug</label>
          <input id="slug" type="text" required value={form.slug} onChange={(e) => updateField('slug', e.target.value)} placeholder="my-custom-api" className={`${inputClass} font-mono`} />
          <p className="mt-1 text-xs text-[#6B7280]">Used in the MCP server URL. Auto-generated from name.</p>
        </div>

        <div>
          <label htmlFor="description" className={labelClass}>Description</label>
          <textarea id="description" rows={3} value={form.description} onChange={(e) => updateField('description', e.target.value)} placeholder="What does this API do?" className={inputClass} />
        </div>

        <div>
          <label htmlFor="base_url" className={labelClass}>Base URL</label>
          <input id="base_url" type="url" required value={form.base_url} onChange={(e) => updateField('base_url', e.target.value)} placeholder="https://api.example.com/v1" className={inputClass} />
        </div>

        <div>
          <label htmlFor="auth_type" className={labelClass}>Auth Type</label>
          <select id="auth_type" value={form.auth_type} onChange={(e) => updateField('auth_type', e.target.value as AuthType)} className={inputClass}>
            <option value="api_key">API Key</option>
            <option value="oauth2">OAuth 2.0</option>
            <option value="bearer">Bearer Token</option>
          </select>
        </div>

        <div className="rounded-xl border border-[#2A2A3E] bg-[#12121A]/80 p-5 space-y-4">
          <h3 className="text-sm font-semibold text-white">Authentication Details</h3>

          {form.auth_type === 'oauth2' && (
            <>
              <div><label className={labelClass}>Client ID</label><input type="text" value={form.client_id} onChange={(e) => updateField('client_id', e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Client Secret</label><input type="password" value={form.client_secret} onChange={(e) => updateField('client_secret', e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Authorization URL</label><input type="url" value={form.authorization_url} onChange={(e) => updateField('authorization_url', e.target.value)} placeholder="https://auth.example.com/authorize" className={inputClass} /></div>
              <div><label className={labelClass}>Token URL</label><input type="url" value={form.token_url} onChange={(e) => updateField('token_url', e.target.value)} placeholder="https://auth.example.com/token" className={inputClass} /></div>
              <div><label className={labelClass}>Scopes (comma-separated)</label><input type="text" value={form.scopes} onChange={(e) => updateField('scopes', e.target.value)} placeholder="read, write, admin" className={inputClass} /></div>
            </>
          )}

          {form.auth_type === 'api_key' && (
            <>
              <div><label className={labelClass}>Header Name</label><input type="text" value={form.header_name} onChange={(e) => updateField('header_name', e.target.value)} placeholder="X-API-Key" className={inputClass} /></div>
              <div><label className={labelClass}>Key Value</label><input type="password" value={form.key_value} onChange={(e) => updateField('key_value', e.target.value)} placeholder="sk-..." className={inputClass} /></div>
            </>
          )}

          {form.auth_type === 'bearer' && (
            <div><label className={labelClass}>Token Value</label><input type="password" value={form.token_value} onChange={(e) => updateField('token_value', e.target.value)} placeholder="eyJhbGciOiJIUzI1NiIs..." className={inputClass} /></div>
          )}
        </div>

        <div>
          <label htmlFor="default_headers" className={labelClass}>Default Headers (JSON)</label>
          <textarea id="default_headers" rows={4} value={form.default_headers} onChange={(e) => updateField('default_headers', e.target.value)} placeholder='{"Content-Type": "application/json"}' className={`${inputClass} font-mono`} />
          <p className="mt-1 text-xs text-[#6B7280]">Headers sent with every request to this API</p>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-[#E91E8C] px-6 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:cursor-not-allowed disabled:opacity-50 shadow-lg shadow-[#E91E8C]/30"
          >
            {submitting ? 'Creating...' : 'Create Connector'}
          </button>
          <Link
            href="/connections/custom"
            className="rounded-lg border border-[#2A2A3E] px-6 py-2.5 text-sm font-medium text-[#A1A1AA] hover:bg-[#1A1A2E] transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
