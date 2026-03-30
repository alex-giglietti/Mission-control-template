'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type NavItem = { label: string; href: string; badge?: boolean };
type NavSection = { section: string; items: NavItem[] };

const NAV: NavSection[] = [
  { section: 'COMMAND', items: [{ label: 'Dashboard', href: '/dashboard' }] },
  {
    section: 'GROW',
    items: [
      { label: 'Get Leads',       href: '/get-leads' },
      { label: 'Get Sales',       href: '/get-sales' },
      { label: 'Keep Customers',  href: '/keep-customers' },
    ],
  },
  {
    section: 'MANAGE',
    items: [
      { label: 'Inbox',    href: '/inbox',    badge: true },
      { label: 'Projects', href: '/projects' },
    ],
  },
];

export function Sidebar({ pendingCount = 0 }: { pendingCount?: number }) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    pathname === href || (href !== '/' && pathname.startsWith(href));

  const linkStyle = (href: string): React.CSSProperties => {
    const active = isActive(href);
    return {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '8px 16px',
      fontSize: 12,
      fontWeight: 400,
      color: active ? '#111' : '#444',
      background: active ? '#F5F0E0' : 'transparent',
      borderLeft: active ? '2px solid #DAA520' : '2px solid transparent',
      textDecoration: 'none',
      transition: 'background 0.12s ease',
    };
  };

  return (
    <aside
      style={{
        width: 200,
        minWidth: 200,
        background: '#fff',
        borderRight: '1px solid #EBEBEB',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'Montserrat', sans-serif",
        height: '100vh',
        position: 'sticky',
        top: 0,
      }}
    >
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid #EBEBEB' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#111', letterSpacing: 0.3 }}>
          Mission Control
        </div>
      </div>

      <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
        {NAV.map((group) => (
          <div key={group.section} style={{ marginBottom: 12 }}>
            <div
              style={{
                fontSize: 7.5,
                fontWeight: 600,
                letterSpacing: 1.4,
                textTransform: 'uppercase',
                color: '#999',
                padding: '0 16px',
                marginBottom: 4,
                marginTop: 8,
              }}
            >
              {group.section}
            </div>
            {group.items.map((item) => (
              <Link key={item.href} href={item.href} style={linkStyle(item.href)}>
                <span>{item.label}</span>
                {item.badge && pendingCount > 0 && (
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 600,
                      background: '#DAA520',
                      color: '#fff',
                      borderRadius: 10,
                      padding: '1px 5px',
                      minWidth: 16,
                      textAlign: 'center',
                    }}
                  >
                    {pendingCount > 99 ? '99+' : pendingCount}
                  </span>
                )}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      <div style={{ borderTop: '1px solid #EBEBEB', padding: '8px 0' }}>
        <Link href="/settings" style={linkStyle('/settings')}>
          <span>Settings</span>
        </Link>
      </div>
    </aside>
  );
}
