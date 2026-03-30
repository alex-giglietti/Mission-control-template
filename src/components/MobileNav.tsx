'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, CheckSquare, Tv, TrendingUp, DollarSign, Link2 } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: 'Tasks', icon: CheckSquare },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/content', label: 'Media', icon: Tv },
  { href: '/funnels', label: 'Funnels', icon: TrendingUp },
  { href: '/finances', label: 'Finance', icon: DollarSign },
  { href: '/connections', label: 'Connections', icon: Link2 },
];

export function MobileNav() {
  const pathname = usePathname();

  // Don't show nav on login page
  if (pathname === '/login') return null;

  return (
    <nav
      className="mobile-nav fixed bottom-0 left-0 right-0 z-50 bg-[#0E0E14] border-t border-[#2A2A3E]"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 16px)',
      }}
    >
      <div className="flex items-stretch justify-around px-2 pt-2 pb-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center justify-center gap-0.5 px-2 py-3 rounded-xl transition-all min-w-[56px] min-h-[60px]"
              style={{
                color: isActive ? '#E91E8C' : '#6B7280',
              }}
            >
              <Icon
                className="w-5 h-5"
                strokeWidth={isActive ? 2.5 : 1.5}
              />
              <span
                className="text-[10px] font-medium leading-none"
                style={{ color: isActive ? '#E91E8C' : '#6B7280' }}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
