'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import ConnectorCard, { type ServiceInfo } from './components/ConnectorCard';
import { type ConnectionStatusType } from './components/ConnectionStatus';

const SERVICES: ServiceInfo[] = [
  {
    id: 'google',
    name: 'Google Workspace',
    description: 'Gmail, Calendar, Drive, Docs, Sheets, YouTube, Ads',
    authType: 'oauth2',
  },
  {
    id: 'ghl',
    name: 'GoHighLevel',
    description: 'CRM, Funnels, Calendars, Conversations, Payments',
    authType: 'oauth2',
  },
  {
    id: 'meta',
    name: 'Meta Business',
    description: 'Facebook Ads, Instagram, Pages, Conversions API',
    authType: 'oauth2',
  },
  {
    id: 'zoom',
    name: 'Zoom',
    description: 'Meetings, Webinars, Recordings, Phone, Chat',
    authType: 'oauth2',
  },
  {
    id: 'quickbooks',
    name: 'QuickBooks',
    description: 'Invoicing, Expenses, Reports, Banking',
    authType: 'oauth2',
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Payments, Subscriptions, Invoices, Customers',
    authType: 'api_key',
  },
  {
    id: 'klaviyo',
    name: 'Klaviyo',
    description: 'Email Campaigns, Flows, Segments, Analytics',
    authType: 'api_key',
  },
  {
    id: 'supabase',
    name: 'Supabase',
    description: 'Database, Auth, Storage, Edge Functions',
    authType: 'api_key',
  },
  {
    id: 'vercel',
    name: 'Vercel',
    description: 'Deployments, Projects, Domains, Logs',
    authType: 'api_key',
  },
  {
    id: 'nanobanana',
    name: 'NanoBanana 2',
    description: 'AI Image Generation',
    authType: 'api_key',
  },
  {
    id: 'mission-control',
    name: 'Mission Control',
    description: 'CRM, Projects, Tasks, KPIs',
    authType: 'api_key',
  },
];

interface StatusEntry {
  service: string;
  status: ConnectionStatusType;
  connected_at: string | null;
  last_used_at: string | null;
  last_error: string | null;
}

export default function ConnectionsDashboard() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2A2A3E] border-t-[#E91E8C]" />
        </div>
      }
    >
      <ConnectionsDashboardInner />
    </Suspense>
  );
}

function ConnectionsDashboardInner() {
  const searchParams = useSearchParams();
  const connectedService = searchParams.get('connected');
  const errorMessage = searchParams.get('error');
  const errorService = searchParams.get('service');

  const [statuses, setStatuses] = useState<Record<string, StatusEntry>>({});
  const [loading, setLoading] = useState(true);
  const [dismissedNotification, setDismissedNotification] = useState(false);

  const userId = 'placeholder-user-id';

  const fetchStatuses = useCallback(async () => {
    try {
      const res = await fetch(`/api/portal/status?user_id=${userId}`);
      if (res.ok) {
        const data: StatusEntry[] = await res.json();
        const statusMap: Record<string, StatusEntry> = {};
        for (const entry of data) {
          statusMap[entry.service] = entry;
        }
        setStatuses(statusMap);
      }
    } catch (err) {
      console.error('Failed to fetch connection statuses:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchStatuses();
  }, [fetchStatuses]);

  const getStatus = (serviceId: string): ConnectionStatusType =>
    statuses[serviceId]?.status ?? 'disconnected';

  const getLastUsed = (serviceId: string): string | undefined =>
    statuses[serviceId]?.last_used_at ?? undefined;

  const handleDisconnect = async (serviceId: string) => {
    try {
      const res = await fetch('/api/portal/status', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, service: serviceId }),
      });
      if (res.ok) fetchStatuses();
    } catch (err) {
      console.error('Failed to disconnect:', err);
    }
  };

  const connectedCount = Object.values(statuses).filter(
    (s) => s.status === 'connected'
  ).length;

  return (
    <div>
      {/* Page header */}
      <div className="mb-8">
        <p className="eyebrow mb-2">Integration Hub</p>
        <h2 className="text-2xl font-bold text-white">Your Integrations</h2>
        <p className="mt-1 text-sm text-[#6B7280]">
          Connect your accounts to the AIM operating system.
        </p>
        <div className="mt-4 h-0.5 w-14 bg-gradient-to-r from-[#E91E8C] to-[#00D9FF] rounded-full" />
      </div>

      {/* Stats row */}
      <div className="mb-8 grid grid-cols-3 gap-4 max-w-lg">
        <div className="p-4 rounded-xl bg-[#12121A] border border-[#2A2A3E] text-center">
          <div className="text-2xl font-bold text-[#34D399]">{connectedCount}</div>
          <div className="text-xs text-[#6B7280] mt-1">Connected</div>
        </div>
        <div className="p-4 rounded-xl bg-[#12121A] border border-[#2A2A3E] text-center">
          <div className="text-2xl font-bold text-[#A1A1AA]">
            {SERVICES.length - connectedCount}
          </div>
          <div className="text-xs text-[#6B7280] mt-1">Available</div>
        </div>
        <div className="p-4 rounded-xl bg-[#12121A] border border-[#2A2A3E] text-center">
          <div className="text-2xl font-bold text-[#E91E8C]">{SERVICES.length}</div>
          <div className="text-xs text-[#6B7280] mt-1">Total</div>
        </div>
      </div>

      {/* Success notification */}
      {connectedService && !dismissedNotification && (
        <div className="mb-6 flex items-center justify-between rounded-xl px-4 py-3 bg-[#34D399]/10 border border-[#34D399]/30">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-[#34D399]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            <p className="text-sm text-[#34D399]">
              Successfully connected to{' '}
              <span className="font-semibold text-white">
                {SERVICES.find((s) => s.id === connectedService)?.name ?? connectedService}
              </span>
            </p>
          </div>
          <button onClick={() => setDismissedNotification(true)} className="text-[#6B7280] hover:text-white transition-colors">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Error notification */}
      {errorMessage && !dismissedNotification && (
        <div className="mb-6 flex items-center justify-between rounded-xl px-4 py-3 bg-[#EF4444]/10 border border-[#EF4444]/30">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-[#EF4444]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
            <p className="text-sm text-[#EF4444]">
              Connection failed
              {errorService && (
                <> for <span className="font-semibold">{SERVICES.find((s) => s.id === errorService)?.name ?? errorService}</span></>
              )}
              : {decodeURIComponent(errorMessage)}
            </p>
          </div>
          <button onClick={() => setDismissedNotification(true)} className="text-[#EF4444] hover:text-white transition-colors">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2A2A3E] border-t-[#E91E8C]" />
        </div>
      )}

      {/* Connector grid */}
      {!loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {SERVICES.map((service) => (
            <ConnectorCard
              key={service.id}
              service={service}
              status={getStatus(service.id)}
              lastUsed={getLastUsed(service.id)}
              onConnect={fetchStatuses}
              onDisconnect={handleDisconnect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
