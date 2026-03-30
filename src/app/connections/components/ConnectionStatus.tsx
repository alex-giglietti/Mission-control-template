'use client';

export type ConnectionStatusType = 'connected' | 'disconnected' | 'expired' | 'error';

interface ConnectionStatusProps {
  status: ConnectionStatusType;
}

const statusConfig: Record<
  ConnectionStatusType,
  { dotColor: string; label: string; textColor: string }
> = {
  connected: {
    dotColor: '#34D399',
    label: 'Connected',
    textColor: '#34D399',
  },
  disconnected: {
    dotColor: '#6B7280',
    label: 'Disconnected',
    textColor: '#6B7280',
  },
  expired: {
    dotColor: '#FBBF24',
    label: 'Expired',
    textColor: '#FBBF24',
  },
  error: {
    dotColor: '#EF4444',
    label: 'Error',
    textColor: '#EF4444',
  },
};

export default function ConnectionStatus({ status }: ConnectionStatusProps) {
  const config = statusConfig[status];

  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-medium"
      style={{ color: config.textColor }}
    >
      <span
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: config.dotColor }}
      />
      {config.label}
    </span>
  );
}
